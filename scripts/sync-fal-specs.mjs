#!/usr/bin/env node
// @ts-check

/**
 * sync-fal-specs — fetch fal.ai OpenAPI + llms.txt specs for every fal-hosted
 * model referenced in src/catalog/models.json, write them into
 * src/catalog/fal-specs/{slug}/, and refresh each route's `cost` field from
 * the llms.txt Pricing block.
 *
 * Usage:
 *   node scripts/sync-fal-specs.mjs                 # sync all fal models
 *   node scripts/sync-fal-specs.mjs --model wan-2.7 # single slug
 *   node scripts/sync-fal-specs.mjs --dry-run       # print diff, no writes
 *
 * A route whose OpenAPI and llms.txt BOTH return 404 is retired: removed
 * from models.json, its spec dir deleted, and listed in the --report output
 * with the guides and docs that still mention it. Up to MAX_AUTO_RETIRE per
 * run; more than that at once is treated as a fal-side problem instead.
 *
 * Committed alongside the specs so CI can detect drift by re-running and
 * failing on diff. Zod schema generation from OpenAPI lands in the Phase 1
 * tool PR — this script only handles fetching + pricing extraction.
 */

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMap as buildFalInputKeyMap, diffInputKeys } from './build-fal-input-keys.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const MODELS_JSON = resolve(REPO_ROOT, 'src/catalog/models.json');
const SPECS_ROOT = resolve(REPO_ROOT, 'src/catalog/fal-specs');
const FAL_INPUT_KEYS_JSON = resolve(REPO_ROOT, 'src/catalog/fal-input-keys.json');

const OPENAPI_URL = (id) =>
  `https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=${id}`;
const LLMS_URL = (id) => `https://fal.ai/models/${id}/llms.txt`;

/**
 * Extract the free-form pricing description from a llms.txt body.
 *
 * Pulls the block between the `## Pricing` heading and the next `## ` heading,
 * drops the boilerplate "For more details" footer line, and collapses runs of
 * blank lines. Returns a single-line string (newlines replaced with spaces) so
 * it fits cleanly in models.json without breaking the human-readable shape.
 *
 * Exported for unit testing.
 *
 * @param {string} llmsText
 * @returns {string | null} pricing string, or null if no Pricing section
 */
export function extractPricing(llmsText) {
  // `[ \t]*\n` (not `\s*\n`) so we don't greedily consume the blank lines
  // between `## Pricing` and the next heading — that would cause the body
  // capture to overshoot into the following section when Pricing is empty.
  const match = llmsText.match(/##\s+Pricing[ \t]*\n([\s\S]*?)(?=\n##\s|$)/);
  if (!match) return null;
  const body = match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^for more details/i.test(line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return body.length > 0 ? body : null;
}

/**
 * Detect fal's retirement notice, which they publish *in place of* the
 * Pricing block rather than as its own section:
 *
 *   "This model has been deprecated, and further requests are being
 *    re-routed to Seedance 1.0 Pro Fast."
 *
 * Without this check the notice lands in `cost`, which is doubly wrong:
 * it destroys the last known real price and it puts prose that isn't a
 * price into a field callers read as one. Route it to `deprecated`
 * instead and leave `cost` alone.
 *
 * Exported for unit testing.
 *
 * @param {string | null} pricing output of extractPricing
 * @returns {string | null} the notice, or null if this isn't one
 */
export function extractDeprecation(pricing) {
  if (!pricing) return null;
  return /\bhas been deprecated\b/i.test(pricing) ? pricing : null;
}

/**
 * Collect every fal-provider access route from a loaded models.json, keyed by
 * logical model slug. Surfaces the `model` string (wire-level endpoint id) and
 * back-pointer to the route object so we can mutate `cost` in place.
 *
 * @param {any} catalog
 * @returns {Array<{ slug: string, endpointId: string, route: any }>}
 */
function collectFalRoutes(catalog) {
  const out = [];
  for (const capability of Object.values(catalog)) {
    if (!capability || typeof capability !== 'object') continue;
    for (const entries of Object.values(capability)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        if (!entry?.slug || !Array.isArray(entry.access_routes)) continue;
        for (const route of entry.access_routes) {
          if (route?.provider === 'fal' && typeof route.model === 'string') {
            out.push({ slug: entry.slug, endpointId: route.model, route });
          }
        }
      }
    }
  }
  return out;
}

/** An HTTP failure that keeps its status, so a 404 can be told from an outage. */
class FetchError extends Error {
  /** @param {string} message @param {number} status */
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Thrown by syncOne when BOTH of a route's surfaces answer 404. That is the
 * only failure treated as "the route is gone": a 5xx, a timeout, or a 404 on
 * just one surface can be fal having a bad day, and stays a plain failure.
 */
class RouteGoneError extends Error {}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new FetchError(`GET ${url} → ${res.status} ${res.statusText}`, res.status);
  }
  return await res.text();
}

/**
 * Decide what two settled fetches (OpenAPI, llms.txt) mean.
 *
 * Exported for unit testing.
 *
 * @param {Array<PromiseSettledResult<string>>} results
 * @returns {'ok' | 'gone' | 'failed'}
 */
export function classifyFetches(results) {
  if (results.every((r) => r.status === 'fulfilled')) return 'ok';
  const both404 = results.every(
    (r) => r.status === 'rejected' && /** @type {any} */ (r.reason)?.status === 404,
  );
  return both404 ? 'gone' : 'failed';
}

/**
 * Most routes the cron will auto-retire in one run. A few routes dying in a
 * week is normal. Dozens at once is far more likely to be fal changing its
 * spec URLs or serving 404s during an incident, and auto-removing them would
 * gut the catalog. Above the cap, every gone route is reported as a plain
 * (blocking) failure and nothing is removed.
 */
export const MAX_AUTO_RETIRE = 10;

/**
 * Split routes whose surfaces both 404 into ones to retire and ones to
 * report as failures (when the cap is exceeded).
 *
 * Exported for unit testing.
 *
 * @param {Array<{slug: string, endpointId: string, error: string}>} gone
 * @param {number} [cap]
 * @returns {{retire: Array<{slug: string, endpointId: string, error: string}>, failures: Array<{slug: string, endpointId: string, error: string}>}}
 */
export function planRetirements(gone, cap = MAX_AUTO_RETIRE) {
  if (gone.length <= cap) return { retire: gone, failures: [] };
  return {
    retire: [],
    failures: gone.map((g) => ({
      ...g,
      error: `${g.error} (both surfaces 404, but ${gone.length} routes did at once, over the auto-retire cap of ${cap}. Likely a fal-side outage or URL change, so nothing was removed.)`,
    })),
  };
}

/**
 * Remove dead fal routes from a loaded catalog, in place. A route goes; its
 * entry goes too once it has no access routes left. Reports, per route,
 * whether the entry went and whether that left its prompt guide with no
 * model at all (that guide tool has to be deleted by hand).
 *
 * Exported for unit testing.
 *
 * @param {any} catalog
 * @param {Array<{slug: string, endpointId: string}>} dead
 * @returns {Array<{slug: string, endpointId: string, entryRemoved: boolean, promptGuide: string | null, guideOrphaned: boolean}>}
 */
export function retireRoutes(catalog, dead) {
  const results = [];
  for (const { slug, endpointId } of dead) {
    let entryRemoved = false;
    let promptGuide = null;
    for (const capability of Object.values(catalog)) {
      if (!capability || typeof capability !== 'object') continue;
      for (const entries of Object.values(capability)) {
        if (!Array.isArray(entries)) continue;
        const i = entries.findIndex((e) => e?.slug === slug);
        if (i < 0) continue;
        const entry = entries[i];
        promptGuide = entry.prompt_guide ?? null;
        entry.access_routes = (entry.access_routes ?? []).filter(
          (r) => !(r?.provider === 'fal' && r.model === endpointId),
        );
        if (entry.access_routes.length === 0) {
          entries.splice(i, 1);
          entryRemoved = true;
        }
      }
    }
    results.push({ slug, endpointId, entryRemoved, promptGuide, guideOrphaned: false });
  }
  // Orphan check after every removal, so two dead routes sharing a guide
  // are judged against the final catalog, not each other.
  const guidesInUse = new Set();
  for (const capability of Object.values(catalog)) {
    if (!capability || typeof capability !== 'object') continue;
    for (const entries of Object.values(capability)) {
      if (!Array.isArray(entries)) continue;
      for (const e of entries) if (e?.prompt_guide) guidesInUse.add(e.prompt_guide);
    }
  }
  for (const r of results) r.guideOrphaned = r.promptGuide !== null && !guidesInUse.has(r.promptGuide);
  return results;
}

/**
 * Files outside the catalog that still name a retired route (guides, docs,
 * seed scripts). The cron can delete data, not rewrite prose, so these are
 * listed in the PR for a human to fix.
 *
 * @param {string} slug
 * @param {string} endpointId
 * @returns {Promise<string[]>} repo-relative paths
 */
async function findReferences(slug, endpointId) {
  const dirs = ['src/guides', 'docs', 'scripts'];
  const files = ['README.md'];
  for (const dir of dirs) {
    try {
      for (const name of await readdir(resolve(REPO_ROOT, dir))) {
        if (/\.(ts|md|mjs)$/.test(name)) files.push(`${dir}/${name}`);
      }
    } catch {
      // missing dir
    }
  }
  const hits = [];
  for (const rel of files) {
    if (rel === 'scripts/sync-fal-specs.mjs') continue;
    let text;
    try {
      text = await readFile(resolve(REPO_ROOT, rel), 'utf8');
    } catch {
      continue;
    }
    if (text.includes(slug) || text.includes(endpointId)) hits.push(rel);
  }
  return hits;
}

async function writeIfChanged(path, next, { dryRun, label }) {
  let prev = null;
  try {
    prev = await readFile(path, 'utf8');
  } catch {
    // new file
  }
  if (prev === next) {
    console.log(`  unchanged  ${label}`);
    return false;
  }
  if (dryRun) {
    console.log(`  would write ${label} (${prev === null ? 'new' : 'diff'})`);
    return true;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, next);
  console.log(`  wrote      ${label}`);
  return true;
}

/**
 * Sync one route's specs and reconcile its catalog fields.
 *
 * Returns a structured outcome rather than a bare "changed" boolean so the
 * cron can act on *what* changed without scraping console output. `changed`
 * still drives whether models.json gets rewritten.
 *
 * @returns {Promise<{changed: boolean, deprecated?: string, newlyDeprecated?: boolean, undeprecated?: boolean, costChange?: {from: string|null, to: string}}>}
 */
async function syncOne({ slug, endpointId, route }, { dryRun }) {
  console.log(`\n[${slug}] ${endpointId}`);
  const specDir = resolve(SPECS_ROOT, slug);

  const settled = await Promise.allSettled([
    fetchText(OPENAPI_URL(endpointId)),
    fetchText(LLMS_URL(endpointId)),
  ]);
  const verdict = classifyFetches(settled);
  if (verdict !== 'ok') {
    const reasons = settled
      .filter((r) => r.status === 'rejected')
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)))
      .join('; ');
    throw verdict === 'gone' ? new RouteGoneError(reasons) : new Error(reasons);
  }
  const [openapiText, llmsText] = settled.map((r) => /** @type {PromiseFulfilledResult<string>} */ (r).value);

  // Pretty-print OpenAPI for stable diffs.
  const openapiJson = JSON.parse(openapiText);
  const openapiPretty = JSON.stringify(openapiJson, null, 2) + '\n';

  await writeIfChanged(resolve(specDir, 'openapi.json'), openapiPretty, {
    dryRun,
    label: `fal-specs/${slug}/openapi.json`,
  });
  await writeIfChanged(resolve(specDir, 'llms.md'), llmsText, {
    dryRun,
    label: `fal-specs/${slug}/llms.md`,
  });

  const pricing = extractPricing(llmsText);
  const deprecation = extractDeprecation(pricing);

  if (deprecation) {
    // Keep the last known price: a deprecated route still bills, just not
    // necessarily at this rate any more. The `deprecated` string says so.
    const newlyDeprecated = route.deprecated !== deprecation;
    if (newlyDeprecated) {
      console.warn(`  DEPRECATED ${deprecation}`);
      route.deprecated = deprecation;
    } else {
      console.warn(`  DEPRECATED (already flagged)`);
    }
    // Report the deprecation every run, not just the first. A route that
    // stays retired stays a finding until someone repoints or removes it.
    return { changed: newlyDeprecated, deprecated: deprecation, newlyDeprecated };
  }

  // Recovered upstream — drop a stale flag rather than leaving a route
  // permanently marked dead.
  let changed = false;
  let undeprecated = false;
  if (route.deprecated) {
    console.log(`  un-deprecated (upstream publishes pricing again)`);
    delete route.deprecated;
    changed = true;
    undeprecated = true;
  }

  /** @type {{from: string|null, to: string} | undefined} */
  let costChange;
  if (pricing) {
    if (route.cost !== pricing) {
      console.log(`  cost       ${route.cost ?? '(unset)'} → ${pricing}`);
      costChange = { from: route.cost ?? null, to: pricing };
      route.cost = pricing;
      changed = true;
    } else {
      console.log(`  cost       unchanged`);
    }
  } else {
    console.warn(`  cost       WARNING: no Pricing section found in llms.txt`);
  }
  return { changed, undeprecated, costChange };
}

/**
 * Summarize per-route outcomes into the report the drift cron consumes.
 *
 * Pure, and exported for unit testing — the cron's behavior (open a PR vs
 * fail the job) hinges entirely on this shape, so it is worth testing
 * without hitting the network.
 *
 * `blocking` is the "something is wrong and there is nothing to review"
 * signal: a failed fetch produces no file diff, so it would otherwise
 * vanish. The cron fails the job on it rather than closing quietly.
 * Retired routes are NOT blocking: their removal is the diff, and the PR
 * is the review.
 *
 * @param {Array<{slug: string, endpointId: string, outcome?: any, error?: string}>} entries
 * @param {Array<object>} [retired] output of retireRoutes, plus `references`
 * @returns {{routes: number, retired: Array<object>, deprecated: Array<object>, failures: Array<object>, costChanges: Array<object>, undeprecated: Array<object>, blocking: boolean}}
 */
export function buildReport(entries, retired = []) {
  const deprecated = [];
  const failures = [];
  const costChanges = [];
  const undeprecated = [];

  for (const { slug, endpointId, outcome, error } of entries) {
    if (error !== undefined) {
      failures.push({ slug, endpointId, error });
      continue;
    }
    if (!outcome) continue;
    if (outcome.deprecated) {
      deprecated.push({
        slug,
        endpointId,
        notice: outcome.deprecated,
        newly: Boolean(outcome.newlyDeprecated),
      });
    }
    if (outcome.undeprecated) undeprecated.push({ slug, endpointId });
    if (outcome.costChange) {
      costChanges.push({ slug, endpointId, ...outcome.costChange });
    }
  }

  return {
    routes: entries.length,
    retired,
    deprecated,
    failures,
    costChanges,
    undeprecated,
    blocking: failures.length > 0,
  };
}

function parseArgs(argv) {
  const args = { model: null, dryRun: false, report: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--model') args.model = argv[++i] ?? null;
    else if (arg === '--report') args.report = argv[++i] ?? null;
    else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: node scripts/sync-fal-specs.mjs [--model <slug>] [--dry-run] [--report <file.json>]',
      );
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  return args;
}

async function main() {
  const { model: onlyModel, dryRun, report: reportPath } = parseArgs(process.argv.slice(2));

  const catalogText = await readFile(MODELS_JSON, 'utf8');
  const catalog = JSON.parse(catalogText);

  let routes = collectFalRoutes(catalog);
  if (onlyModel) {
    routes = routes.filter((r) => r.slug === onlyModel);
    if (routes.length === 0) {
      console.error(`No fal route found for slug: ${onlyModel}`);
      process.exit(1);
    }
  }

  console.log(
    `Syncing ${routes.length} fal route(s)${dryRun ? ' (dry run)' : ''}`,
  );

  let catalogDirty = false;
  /** @type {Array<{slug: string, endpointId: string, error: string}>} */
  const gone = [];
  /** @type {Array<{slug: string, endpointId: string, outcome?: any, error?: string}>} */
  const entries = [];
  for (const r of routes) {
    try {
      const outcome = await syncOne(r, { dryRun });
      catalogDirty = catalogDirty || outcome.changed;
      entries.push({ slug: r.slug, endpointId: r.endpointId, outcome });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (err instanceof RouteGoneError) {
        console.error(`[${r.slug}] GONE (404 on both surfaces):`, msg);
        gone.push({ slug: r.slug, endpointId: r.endpointId, error: msg });
        continue;
      }
      console.error(`[${r.slug}] FAILED:`, msg);
      entries.push({ slug: r.slug, endpointId: r.endpointId, error: msg });
    }
  }

  // Routes that 404 on both surfaces are retired: removed from the catalog
  // with their spec dirs, inside the drift PR. A human still decides, by
  // merging (or not) — the PR is the review. Over the cap, nothing is removed.
  const plan = planRetirements(gone);
  for (const f of plan.failures) entries.push(f);
  for (const g of plan.retire) entries.push({ slug: g.slug, endpointId: g.endpointId });
  const retired = retireRoutes(catalog, plan.retire);
  for (const r of retired) {
    if (!dryRun) await rm(resolve(SPECS_ROOT, r.slug), { recursive: true, force: true });
    /** @type {any} */ (r).references = await findReferences(r.slug, r.endpointId);
  }
  if (retired.length > 0) catalogDirty = true;

  const report = buildReport(entries, retired);
  const failures = report.failures;

  if (retired.length > 0) {
    console.log(`\n${retired.length} RETIRED route(s) — removed from the catalog${dryRun ? ' (dry run: not written)' : ''}:`);
    for (const r of retired) {
      console.log(`  ${r.slug} (${r.endpointId})${r.guideOrphaned ? ` — ${r.promptGuide} now has no model` : ''}`);
    }
  }

  if (catalogDirty) {
    const nextCatalog = JSON.stringify(catalog, null, 2) + '\n';
    if (nextCatalog !== catalogText) {
      if (dryRun) {
        console.log('\nwould update src/catalog/models.json (cost / deprecated / retired)');
      } else {
        await writeFile(MODELS_JSON, nextCatalog);
        console.log('\nupdated src/catalog/models.json (cost / deprecated / retired)');
      }
    }
  }

  // Surface retirements as their own block. These are the changes that
  // actually alter what a caller gets back, so they must not be buried in
  // several hundred lines of per-file "wrote" chatter.
  const deprecated = report.deprecated;
  if (deprecated.length > 0) {
    console.log(`\n${deprecated.length} DEPRECATED route(s) — review before shipping:`);
    for (const d of deprecated) {
      console.log(`  ${d.slug} (${d.endpointId})${d.newly ? ' [NEW]' : ''}`);
      console.log(`    ${d.notice}`);
    }
    console.log(
      '\nDeprecated routes are hidden from model_catalog by default. Repoint callers at the ' +
        'successor model, or drop the entry once nothing references it.',
    );
  }

  if (failures.length > 0) {
    console.log(`\n${failures.length} failures (script continued past each):`);
    for (const f of failures) {
      console.log(`  ${f.slug} (${f.endpointId})`);
      console.log(`    ${f.error}`);
    }
    console.log(
      '\nFix: correct the endpoint id, or remove the slug if fal has really dropped it. ' +
        '(Routes that 404 on both surfaces are retired automatically, up to the cap.)',
    );
  }

  // Re-distil the input-key map so the extra_params check can never
  // describe a schema the specs no longer have. Running it here means the
  // weekly drift cron keeps it current with no separate step to forget.
  if (!dryRun && !onlyModel) {
    const { map } = await buildFalInputKeyMap();
    const nextKeys = JSON.stringify(map, null, 2) + '\n';
    let prevKeys = null;
    try {
      prevKeys = await readFile(FAL_INPUT_KEYS_JSON, 'utf8');
    } catch {
      // first run
    }

    // Diff the SETS, not the file text. A reordered file is noise; an
    // added or removed input parameter changes what a caller can send and
    // must reach the PR body — the report was blind to this until
    // 2026-08-17.
    let prevMap = null;
    if (prevKeys) {
      try {
        prevMap = JSON.parse(prevKeys);
      } catch {
        prevMap = null;
      }
    }
    report.schemaChanges = diffInputKeys(prevMap, map);

    if (prevKeys !== nextKeys) {
      await writeFile(FAL_INPUT_KEYS_JSON, nextKeys);
      console.log(`\nupdated src/catalog/fal-input-keys.json (${Object.keys(map).length} models)`);
    }

    const sc = report.schemaChanges;
    const touched = sc.changed.length + sc.modelsAdded.length + sc.modelsRemoved.length;
    if (touched > 0) {
      console.log(`\n${touched} input-schema change(s):`);
      for (const m of sc.modelsAdded) console.log(`  + model ${m}`);
      for (const m of sc.modelsRemoved) console.log(`  - model ${m}`);
      for (const c of sc.changed) {
        console.log(`  ${c.model}`);
        if (c.addedTop.length) console.log(`    + ${c.addedTop.join(', ')}`);
        if (c.removedTop.length) console.log(`    - ${c.removedTop.join(', ')}`);
        if (c.addedNested.length) console.log(`    + ${c.addedNested.join(', ')}`);
        if (c.removedNested.length) console.log(`    - ${c.removedNested.join(', ')}`);
      }
    } else if (prevKeys !== nextKeys) {
      console.log('  (key sets unchanged — file rewrite is ordering only)');
    }
  }

  if (reportPath) {
    await mkdir(dirname(resolve(reportPath)), { recursive: true });
    await writeFile(resolve(reportPath), JSON.stringify(report, null, 2) + '\n');
    console.log(`\nwrote report ${reportPath}`);
  }

  console.log('\ndone.');
  // Non-zero on unresolved fetch failures only. Deprecations, price moves and
  // retirements produce a models.json diff the cron can open a PR against,
  // but a failed fetch (5xx, timeout, a 404 on one surface, or gone routes
  // over the retire cap) writes nothing — so without this exit code it would
  // leave no trace at all and the job would close green.
  //
  // `exitCode`, not `process.exit()`: calling exit() here races undici's
  // socket teardown and can abort the process with a libuv assertion
  // (observed on Windows: `!(handle->flags & UV_HANDLE_CLOSING)`, exit
  // 127). Any non-zero code still fails the cron, but 127-with-a-crash
  // looks like a broken script rather than the dead route it is actually
  // reporting. Setting exitCode lets the loop drain and exit 1 cleanly.
  if (report.blocking) process.exitCode = 1;
}

// Only run main() when invoked directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-fal-specs.mjs')) {
  main().catch((err) => {
    console.error(err);
    // Same reasoning as the blocking-exit above: never process.exit() with
    // fetch sockets still closing.
    process.exitCode = 1;
  });
}

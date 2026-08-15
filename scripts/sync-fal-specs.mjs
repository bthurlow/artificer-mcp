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
 * Committed alongside the specs so CI can detect drift by re-running and
 * failing on diff. Zod schema generation from OpenAPI lands in the Phase 1
 * tool PR — this script only handles fetching + pricing extraction.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMap as buildFalInputKeyMap } from './build-fal-input-keys.mjs';

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

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  return await res.text();
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

  const [openapiText, llmsText] = await Promise.all([
    fetchText(OPENAPI_URL(endpointId)),
    fetchText(LLMS_URL(endpointId)),
  ]);

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
 * signal: a 404 produces no file diff, so it would otherwise vanish. The
 * cron fails the job on it rather than closing quietly.
 *
 * @param {Array<{slug: string, endpointId: string, outcome?: any, error?: string}>} entries
 * @returns {{routes: number, deprecated: Array<object>, failures: Array<object>, costChanges: Array<object>, undeprecated: Array<object>, blocking: boolean}}
 */
export function buildReport(entries) {
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
  /** @type {Array<{slug: string, endpointId: string, outcome?: any, error?: string}>} */
  const entries = [];
  for (const r of routes) {
    try {
      const outcome = await syncOne(r, { dryRun });
      catalogDirty = catalogDirty || outcome.changed;
      entries.push({ slug: r.slug, endpointId: r.endpointId, outcome });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${r.slug}] FAILED:`, msg);
      entries.push({ slug: r.slug, endpointId: r.endpointId, error: msg });
    }
  }

  const report = buildReport(entries);
  const failures = report.failures;

  if (catalogDirty) {
    const nextCatalog = JSON.stringify(catalog, null, 2) + '\n';
    if (nextCatalog !== catalogText) {
      if (dryRun) {
        console.log('\nwould update src/catalog/models.json (cost / deprecated fields)');
      } else {
        await writeFile(MODELS_JSON, nextCatalog);
        console.log('\nupdated src/catalog/models.json (cost / deprecated fields)');
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
      '\nFix: remove failed slugs from src/catalog/models.json or correct the endpoint id.',
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
    if (prevKeys !== nextKeys) {
      await writeFile(FAL_INPUT_KEYS_JSON, nextKeys);
      console.log(`\nupdated src/catalog/fal-input-keys.json (${Object.keys(map).length} models)`);
    }
  }

  if (reportPath) {
    await mkdir(dirname(resolve(reportPath)), { recursive: true });
    await writeFile(resolve(reportPath), JSON.stringify(report, null, 2) + '\n');
    console.log(`\nwrote report ${reportPath}`);
  }

  console.log('\ndone.');
  // Non-zero on fetch failures only. Deprecations and price moves produce a
  // models.json diff the cron can open a PR against, but a 404 writes
  // nothing — so without this exit code a dead route would leave no trace
  // at all and the job would close green.
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

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

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const MODELS_JSON = resolve(REPO_ROOT, 'src/catalog/models.json');
const SPECS_ROOT = resolve(REPO_ROOT, 'src/catalog/fal-specs');

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
  if (pricing) {
    if (route.cost !== pricing) {
      console.log(`  cost       ${route.cost ?? '(unset)'} → ${pricing}`);
      route.cost = pricing;
      return true;
    }
    console.log(`  cost       unchanged`);
  } else {
    console.warn(`  cost       WARNING: no Pricing section found in llms.txt`);
  }
  return false;
}

function parseArgs(argv) {
  const args = { model: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--model') args.model = argv[++i] ?? null;
    else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: node scripts/sync-fal-specs.mjs [--model <slug>] [--dry-run]',
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
  const { model: onlyModel, dryRun } = parseArgs(process.argv.slice(2));

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
  const failures = [];
  for (const r of routes) {
    try {
      const changed = await syncOne(r, { dryRun });
      catalogDirty = catalogDirty || changed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${r.slug}] FAILED:`, msg);
      failures.push({ slug: r.slug, endpointId: r.endpointId, error: msg });
    }
  }

  if (catalogDirty) {
    const nextCatalog = JSON.stringify(catalog, null, 2) + '\n';
    if (nextCatalog !== catalogText) {
      if (dryRun) {
        console.log('\nwould update src/catalog/models.json (cost fields)');
      } else {
        await writeFile(MODELS_JSON, nextCatalog);
        console.log('\nupdated src/catalog/models.json (cost fields)');
      }
    }
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

  console.log('\ndone.');
  if (failures.length > 0) process.exit(1);
}

// Only run main() when invoked directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-fal-specs.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

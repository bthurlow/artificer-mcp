#!/usr/bin/env node
// @ts-check

/**
 * Additively merge catalog entries into src/catalog/models.json.
 *
 * Unlike scripts/seed-video-catalog.mjs (which replaces the whole `video`
 * block, and would now drop hand-added entries), this only ever ADDS:
 *
 *   - a new entry under `<capability>.<sub_class>`, or
 *   - a new access route on an existing slug (`add_to_existing_slug`).
 *
 * An endpoint already present anywhere in the catalog is skipped, so the
 * script is safe to re-run. Costs from the input are placeholders at best;
 * run `node scripts/sync-fal-specs.mjs` afterwards to fetch specs and real
 * pricing, then `yarn catalog:keys`.
 *
 * Input: a JSON file `{ "entries": [ { capability, sub_class, slug, model,
 * tool, prompt_guide, add_to_existing_slug?, cost?, vocals? } ] }`.
 *
 * Usage:
 *   node scripts/add-catalog-entries.mjs <entries.json> [--dry]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELS_JSON = resolve(__dirname, '..', 'src/catalog/models.json');

/** @param {any} catalog */
function indexCatalog(catalog) {
  /** @type {Map<string, any>} slug → entry */
  const slugs = new Map();
  /** @type {Set<string>} fal/google model ids already routed */
  const models = new Set();
  for (const [cap, subs] of Object.entries(catalog)) {
    if (cap.startsWith('$') || cap === 'notes' || typeof subs !== 'object') continue;
    for (const entries of Object.values(/** @type {Record<string, any[]>} */ (subs))) {
      for (const e of entries) {
        slugs.set(e.slug, e);
        for (const r of e.access_routes) models.add(`${r.provider}:${r.model}`);
      }
    }
  }
  return { slugs, models };
}

/** @param {any} e */
function route(e) {
  return {
    provider: e.provider ?? 'fal',
    tool: e.tool,
    model: e.model,
    cost: e.cost && String(e.cost).trim() ? String(e.cost).trim() : 'Pricing pending sync',
    key_env_var: e.key_env_var ?? 'FAL_KEY',
    stub: false,
  };
}

async function main() {
  const [inputPath] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const dryRun = process.argv.includes('--dry');
  if (!inputPath) {
    console.error('usage: node scripts/add-catalog-entries.mjs <entries.json> [--dry]');
    process.exit(2);
  }

  const catalog = JSON.parse(await readFile(MODELS_JSON, 'utf8'));
  const { entries } = JSON.parse(await readFile(inputPath, 'utf8'));
  const { slugs, models } = indexCatalog(catalog);

  let added = 0;
  let routed = 0;
  const skipped = [];
  for (const e of entries) {
    const key = `${e.provider ?? 'fal'}:${e.model}`;
    if (models.has(key)) {
      skipped.push(`${e.model} (already in catalog)`);
      continue;
    }
    for (const field of ['model', 'tool']) {
      if (!e[field]) throw new Error(`entry ${e.slug ?? e.model}: missing "${field}"`);
    }

    if (e.add_to_existing_slug) {
      const target = slugs.get(e.add_to_existing_slug);
      if (!target) throw new Error(`${e.model}: add_to_existing_slug "${e.add_to_existing_slug}" not found`);
      // fal specs are stored per slug (src/catalog/fal-specs/<slug>/), so a
      // second fal route on one slug would overwrite the first one's specs.
      if ((e.provider ?? 'fal') === 'fal' && target.access_routes.some((r) => r.provider === 'fal')) {
        throw new Error(
          `${e.model}: slug "${target.slug}" already has a fal route; give it its own slug instead`,
        );
      }
      target.access_routes.push(route(e));
      routed++;
    } else {
      for (const field of ['capability', 'sub_class', 'slug']) {
        if (!e[field]) throw new Error(`entry ${e.model}: missing "${field}"`);
      }
      if (slugs.has(e.slug)) throw new Error(`slug "${e.slug}" already exists (${e.model})`);
      const entry = {
        slug: e.slug,
        prompt_guide: e.prompt_guide ?? null,
        ...(e.vocals ? { vocals: e.vocals } : {}),
        access_routes: [route(e)],
      };
      catalog[e.capability] ??= {};
      catalog[e.capability][e.sub_class] ??= [];
      catalog[e.capability][e.sub_class].push(entry);
      slugs.set(e.slug, entry);
      added++;
    }
    models.add(key);
  }

  console.log(`new entries: ${added}, new routes on existing slugs: ${routed}, skipped: ${skipped.length}`);
  for (const s of skipped) console.log(`  skipped ${s}`);
  if (dryRun) {
    console.log('Dry run — no writes.');
    return;
  }
  await writeFile(MODELS_JSON, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Wrote ${MODELS_JSON}. Next: node scripts/sync-fal-specs.mjs && yarn catalog:keys`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

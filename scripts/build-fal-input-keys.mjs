#!/usr/bin/env node
// @ts-check

/**
 * build-fal-input-keys — distil the committed fal OpenAPI specs into a
 * compact map of accepted input keys per wire model id.
 *
 * Usage:
 *   node scripts/build-fal-input-keys.mjs            # write the map
 *   node scripts/build-fal-input-keys.mjs --check    # fail if stale
 *
 * Why a distilled map instead of reading the specs directly: the specs
 * are ~6MB across 263 directories and are NOT shipped — `package.json`
 * `files` only publishes `dist/`, and tsup copies just `models.json`
 * there. Shipping 6MB of OpenAPI to answer "is this key real?" is not a
 * trade worth making, and a published server that silently can't check
 * would be worse than one that never tried.
 *
 * Regenerated automatically at the end of `sync-fal-specs.mjs`, so the
 * weekly drift cron keeps it current.
 *
 * @see src/generation/fal/input-keys.ts — the runtime consumer
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SPECS_ROOT = resolve(REPO_ROOT, 'src/catalog/fal-specs');
const MODELS_JSON = resolve(REPO_ROOT, 'src/catalog/models.json');
const OUT = resolve(REPO_ROOT, 'src/catalog/fal-input-keys.json');

/** How deep to walk `$ref`s when collecting nested property paths. */
const MAX_DEPTH = 2;

/**
 * Resolve a local `#/components/schemas/X` ref against the document.
 *
 * @param {any} doc
 * @param {string | undefined} ref
 * @returns {any}
 */
function deref(doc, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return undefined;
  let node = doc;
  for (const part of ref.slice(2).split('/')) {
    node = node?.[part];
    if (node === undefined) return undefined;
  }
  return node;
}

/**
 * Find the request-input schema for a spec.
 *
 * Anchored on the POST operation's `requestBody` `$ref` rather than
 * guessing by schema name — fal's naming varies per model
 * (`LynxInput`, `SoundEffectsGeneratorInput`, …) and a name heuristic
 * would quietly return nothing for the ones that don't match.
 *
 * Exported for unit testing.
 *
 * @param {any} doc parsed openapi.json
 * @returns {any} the input schema object, or undefined
 */
export function findInputSchema(doc) {
  for (const ops of Object.values(doc?.paths ?? {})) {
    for (const [verb, op] of Object.entries(/** @type {any} */ (ops) ?? {})) {
      if (verb.toLowerCase() !== 'post') continue;
      const ref = /** @type {any} */ (op)?.requestBody?.content?.['application/json']?.schema?.$ref;
      const schema = deref(doc, ref);
      if (schema?.properties) return schema;
    }
  }
  return undefined;
}

/**
 * Collect the accepted top-level keys and the dotted paths of nested
 * object properties.
 *
 * Nested paths are what make a warning actionable: knowing `audio_format`
 * is wrong is half an answer; knowing `audio_setting.format` exists is
 * the whole one.
 *
 * Exported for unit testing.
 *
 * @param {any} doc parsed openapi.json
 * @returns {{ top: string[], nested: string[] } | null}
 */
export function collectKeys(doc) {
  const schema = findInputSchema(doc);
  if (!schema?.properties) return null;

  const top = Object.keys(schema.properties);
  const nested = [];

  const walk = (props, prefix, depth) => {
    if (depth > MAX_DEPTH) return;
    for (const [name, prop] of Object.entries(props ?? {})) {
      const p = /** @type {any} */ (prop);
      // Unwrap a $ref, and unwrap arrays to their item schema so
      // `items[].field` style objects still contribute paths.
      const target = p?.$ref ? deref(doc, p.$ref) : p?.items?.$ref ? deref(doc, p.items.$ref) : p;
      if (target?.properties) {
        for (const child of Object.keys(target.properties)) {
          nested.push(`${prefix}${name}.${child}`);
        }
        walk(target.properties, `${prefix}${name}.`, depth + 1);
      }
    }
  };
  walk(schema.properties, '', 1);

  return { top, nested: [...new Set(nested)].sort() };
}

/**
 * Map every fal route's wire model id to its slug's spec directory.
 *
 * Keyed by wire id, not slug, so the runtime lookup needs only the
 * `model` string the caller passed — no catalog traversal on a hot path.
 *
 * @param {any} catalog
 * @returns {Array<{ slug: string, model: string }>}
 */
function collectFalRoutes(catalog) {
  const out = [];
  for (const capability of Object.values(catalog)) {
    if (!capability || typeof capability !== 'object') continue;
    for (const entries of Object.values(capability)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        for (const route of entry?.access_routes ?? []) {
          if (route?.provider === 'fal' && typeof route.model === 'string') {
            out.push({ slug: entry.slug, model: route.model });
          }
        }
      }
    }
  }
  return out;
}

/**
 * Build the full map from the committed specs.
 *
 * @returns {Promise<{ map: Record<string, {top: string[], nested: string[]}>, skipped: string[] }>}
 */
export async function buildMap() {
  const catalog = JSON.parse(await readFile(MODELS_JSON, 'utf8'));
  const routes = collectFalRoutes(catalog);
  let available;
  try {
    available = new Set(await readdir(SPECS_ROOT));
  } catch {
    available = new Set();
  }

  /** @type {Record<string, {top: string[], nested: string[]}>} */
  const map = {};
  const skipped = [];

  for (const { slug, model } of routes) {
    if (!available.has(slug)) {
      skipped.push(`${slug} (no spec dir)`);
      continue;
    }
    let doc;
    try {
      doc = JSON.parse(await readFile(resolve(SPECS_ROOT, slug, 'openapi.json'), 'utf8'));
    } catch {
      skipped.push(`${slug} (unreadable openapi.json)`);
      continue;
    }
    const keys = collectKeys(doc);
    if (!keys) {
      skipped.push(`${slug} (no input schema)`);
      continue;
    }
    map[model] = keys;
  }

  return { map, skipped };
}

async function main() {
  const check = process.argv.includes('--check');
  const { map, skipped } = await buildMap();
  const next = JSON.stringify(map, null, 2) + '\n';

  let prev = null;
  try {
    prev = await readFile(OUT, 'utf8');
  } catch {
    // first run
  }

  const models = Object.keys(map).length;
  if (skipped.length > 0) {
    console.log(`skipped ${skipped.length} route(s):`);
    for (const s of skipped) console.log(`  ${s}`);
  }

  if (check) {
    if (prev === next) {
      console.log(`fal-input-keys.json is up to date (${models} models).`);
      return;
    }
    console.error(
      'fal-input-keys.json is STALE. Run: node scripts/build-fal-input-keys.mjs',
    );
    process.exitCode = 1;
    return;
  }

  if (prev === next) {
    console.log(`fal-input-keys.json unchanged (${models} models).`);
    return;
  }
  await writeFile(OUT, next);
  console.log(`wrote fal-input-keys.json (${models} models).`);
}

if (process.argv[1]?.endsWith('build-fal-input-keys.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

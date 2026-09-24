#!/usr/bin/env node
// @ts-check

/**
 * Generate prompt-guide model tables from committed catalog data, so guide
 * rows never depend on anyone's memory of a model.
 *
 * For each slug it reads src/catalog/fal-specs/<slug>/llms.md (fal's own
 * one-line description, the `> …` line) and openapi.json (required and
 * notable inputs), and prints two markdown tables:
 *
 *   ## Picking a model   | Slug | Model (fal's description) | Key inputs |
 *   ## Access routes     | Slug | fal endpoint |
 *
 * Output is escaped for pasting into a guide's template literal: backticks
 * become \`. Prices are deliberately omitted; the catalog's synced `cost`
 * is the single source.
 *
 * Usage:
 *   node scripts/catalog-guide-table.mjs <slug> [<slug> …]
 *   node scripts/catalog-guide-table.mjs --guide <prompt_guide_tool_name> [--raw]
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/** Inputs worth showing even when optional. */
const NOTABLE =
  /^(prompt|text|text_prompt|script|lyrics|image_url|image_urls|video_url|audio_url|mask_url|end_image_url|start_image_url|reference_image_urls|keyframes|keyframe_indexes|duration|resolution|aspect_ratio|image_size|num_images|output_format|upscale_factor|target_fps|target_resolution|sync_mode|stems|voice|speakers)$/;

/** @param {any} catalog */
function findEntries(catalog, predicate) {
  const out = [];
  for (const [cap, subs] of Object.entries(catalog)) {
    if (cap.startsWith('$') || cap === 'notes' || typeof subs !== 'object') continue;
    for (const entries of Object.values(/** @type {Record<string, any[]>} */ (subs))) {
      for (const e of entries) if (predicate(e)) out.push(e);
    }
  }
  return out;
}

async function describe(slug) {
  const llms = await readFile(resolve(ROOT, 'src/catalog/fal-specs', slug, 'llms.md'), 'utf8').catch(() => '');
  const line = llms.split(/\r?\n/).find((l) => l.startsWith('> '));
  const title = llms.split(/\r?\n/).find((l) => l.startsWith('# '))?.slice(2).trim();
  const text = (line ? line.slice(2) : title ?? '').trim().replace(/\s+/g, ' ');
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

async function inputs(slug) {
  const raw = await readFile(resolve(ROOT, 'src/catalog/fal-specs', slug, 'openapi.json'), 'utf8').catch(() => '');
  if (!raw) return '(spec not synced)';
  const schemas = JSON.parse(raw).components?.schemas ?? {};
  const name = Object.keys(schemas).find((k) => /Input$/.test(k) && !/Queue|Status/.test(k));
  const input = name ? schemas[name] : undefined;
  if (!input) return '(no input schema)';
  const required = new Set(input.required ?? []);
  const keys = Object.keys(input.properties ?? {});
  const shown = [
    ...keys.filter((k) => required.has(k)).map((k) => `**\`${k}\`**`),
    ...keys.filter((k) => !required.has(k) && NOTABLE.test(k)).map((k) => `\`${k}\``),
  ];
  const hidden = keys.length - shown.length;
  return `${shown.join(', ')}${hidden > 0 ? ` (+${hidden} more)` : ''}`;
}

async function main() {
  const args = process.argv.slice(2);
  const catalog = JSON.parse(await readFile(resolve(ROOT, 'src/catalog/models.json'), 'utf8'));
  const guideIdx = args.indexOf('--guide');
  const entries =
    guideIdx >= 0
      ? findEntries(catalog, (e) => e.prompt_guide === args[guideIdx + 1])
      : findEntries(catalog, (e) => args.includes(e.slug));
  if (entries.length === 0) {
    console.error('no matching catalog entries');
    process.exit(1);
  }

  const esc = (s) => s.replace(/`/g, '\\`');
  const rows = [];
  const routes = [];
  for (const e of entries) {
    const fal = e.access_routes.find((r) => r.provider === 'fal');
    if (!fal) continue;
    rows.push(`| \`${e.slug}\` | ${await describe(e.slug)} | ${await inputs(e.slug)} |`);
    routes.push(`| \`${e.slug}\` | \`${fal.model}\` |`);
  }
  const out = [
    '| Slug | Model (fal\'s description) | Inputs (**required**, then notable) |',
    '|------|----------------------------|--------------------------------------|',
    ...rows,
    '',
    '| Slug | fal endpoint |',
    '|------|--------------|',
    ...routes,
  ].join('\n');
  // --raw: plain markdown (for guide-from-markdown.mjs, which escapes itself).
  console.log(args.includes('--raw') ? out : esc(out));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

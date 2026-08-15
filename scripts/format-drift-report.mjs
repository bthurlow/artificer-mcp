#!/usr/bin/env node
// @ts-check

/**
 * format-drift-report — turn a sync-fal-specs `--report` JSON into the
 * markdown body of the weekly drift PR (and the job summary).
 *
 * Usage:
 *   node scripts/format-drift-report.mjs <report.json> [--verify-failed]
 *
 * This lives in a script rather than inline `jq` in the workflow for one
 * reason: the PR body *is* the product of the drift cron. If it renders
 * badly or drops a finding, the finding is lost — nobody reads a 500-file
 * spec diff to double-check. Inline jq in a YAML `run:` block cannot be
 * unit-tested; this can, and is.
 *
 * @see .github/workflows/fal-spec-drift.yml
 */

import { readFile } from 'node:fs/promises';

/** Escape a value for use inside a markdown table cell. */
function cell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
}

/**
 * Render the PR body.
 *
 * Ordering is deliberate — findings that produce NO file diff come first,
 * because the changed-files view will not show them and they are the only
 * ones a reviewer can miss entirely.
 *
 * Exported for unit testing.
 *
 * @param {{routes: number, deprecated: Array<any>, failures: Array<any>, costChanges: Array<any>, undeprecated: Array<any>, blocking: boolean}} report
 * @param {{verifyFailed?: boolean}} [opts]
 * @returns {string} markdown
 */
export function formatDriftReport(report, opts = {}) {
  const { deprecated = [], failures = [], costChanges = [], undeprecated = [] } = report;
  const out = [];

  out.push(
    `Automated weekly sync of fal.ai OpenAPI + \`llms.txt\` specs across ${report.routes} route(s).`,
    '',
    'Most of a fal sync diff is their docs boilerplate churn. **The findings below are the review surface** — if this section is empty, the diff is noise and can be merged on a skim.',
    '',
  );

  if (failures.length > 0) {
    out.push(
      `## ⚠️ ${failures.length} route(s) failed to fetch`,
      '',
      '**These produce no file diff**, so they will not appear in the changed files — this list is the only place they show up. Check whether the endpoint was renamed (repoint `model`) or genuinely retired (remove the slug, its spec dir, and every guide reference).',
      '',
    );
    for (const f of failures) {
      out.push(`- \`${f.slug}\` (\`${f.endpointId}\`)`, `  - ${cell(f.error)}`);
    }
    out.push('');
  }

  if (deprecated.length > 0) {
    out.push(
      `## ${deprecated.length} deprecated route(s)`,
      '',
      'These still return **200** — they just serve a different model than the slug names. They are hidden from `model_catalog` by default. Repoint callers at the successor explicitly, or drop the entry.',
      '',
      '| Slug | New? | Upstream notice |',
      '|------|------|-----------------|',
    );
    for (const d of deprecated) {
      out.push(`| \`${d.slug}\` | ${d.newly ? '**yes**' : 'no'} | ${cell(d.notice)} |`);
    }
    out.push('');
  }

  if (costChanges.length > 0) {
    out.push(
      `## ${costChanges.length} price change(s)`,
      '',
      'Watch for a changed *billing unit* (per-video → per-second), not just a changed rate — those are the ones that blow up a budget.',
      '',
    );
    for (const c of costChanges) {
      out.push(
        `<details><summary><code>${c.slug}</code></summary>`,
        '',
        `**Was:** ${c.from ?? '_(unset)_'}`,
        '',
        `**Now:** ${c.to}`,
        '',
        '</details>',
        '',
      );
    }
  }

  if (undeprecated.length > 0) {
    out.push(
      `## ${undeprecated.length} route(s) recovered`,
      '',
      'Previously deprecated, now publishing real pricing again. The `deprecated` flag was cleared, so they are back in the default catalog listing.',
      '',
    );
    for (const u of undeprecated) out.push(`- \`${u.slug}\``);
    out.push('');
  }

  if (
    failures.length === 0 &&
    deprecated.length === 0 &&
    costChanges.length === 0 &&
    undeprecated.length === 0
  ) {
    out.push('_No deprecations, fetch failures, or price changes. Spec-text churn only._', '');
  }

  if (opts.verifyFailed) {
    out.push(
      '## ❌ Catalog guards failed on the synced result',
      '',
      '`yarn typecheck && yarn test:unit` did not pass against this sync. **Do not merge on a skim** — see the workflow log.',
      '',
    );
  }

  out.push(
    '---',
    '',
    'Opened by `.github/workflows/fal-spec-drift.yml`. This branch is force-pushed each week, so the PR rolls forward rather than piling up.',
  );

  return out.join('\n') + '\n';
}

async function main() {
  const args = process.argv.slice(2);
  const path = args.find((a) => !a.startsWith('--'));
  if (!path) {
    console.error('Usage: node scripts/format-drift-report.mjs <report.json> [--verify-failed]');
    process.exitCode = 2;
    return;
  }
  const report = JSON.parse(await readFile(path, 'utf8'));
  process.stdout.write(
    formatDriftReport(report, { verifyFailed: args.includes('--verify-failed') }),
  );
}

if (process.argv[1]?.endsWith('format-drift-report.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

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
 * Ordering is deliberate — breaking retirements first, then findings that
 * produce NO file diff, because the changed-files view will not show them
 * and they are the only ones a reviewer can miss entirely.
 *
 * Exported for unit testing.
 *
 * @param {{routes: number, retired?: Array<any>, deprecated: Array<any>, failures: Array<any>, costChanges: Array<any>, undeprecated: Array<any>, blocking: boolean}} report
 * GitHub rejects a PR body over 65,536 characters, and a big sync (a fal
 * pricing-copy rewrite across hundreds of routes) can exceed that: the
 * 2026-10-26 and 11-02 runs failed at `gh pr create` for exactly this
 * reason. With `maxLength`, an oversized body is re-rendered compactly
 * (price and schema changes reduced to one line per route), and as a last
 * resort cut at a line boundary. Retirements and fetch failures come first,
 * so they survive any trimming. The full report still goes to the job
 * summary, which has no such limit.
 *
 * @param {{verifyFailed?: boolean, maxLength?: number}} [opts]
 * @returns {string} markdown
 */
export function formatDriftReport(report, opts = {}) {
  const full = render(report, opts, false);
  const max = opts.maxLength;
  if (!max || full.length <= max) return full;
  const compact = render(report, opts, true);
  if (compact.length <= max) return compact;
  const tail =
    "\n\n_…truncated to fit GitHub's PR body limit. The full report is in the workflow run's job summary._\n";
  const cut = compact.lastIndexOf('\n', max - tail.length);
  return compact.slice(0, cut > 0 ? cut : max - tail.length) + tail;
}

/**
 * @param {any} report
 * @param {{verifyFailed?: boolean}} opts
 * @param {boolean} compact one line per price / schema change
 * @returns {string}
 */
function render(report, opts, compact) {
  const {
    retired = [],
    deprecated = [],
    failures = [],
    costChanges = [],
    undeprecated = [],
  } = report;
  const out = [];

  out.push(
    `Automated weekly sync of fal.ai OpenAPI + \`llms.txt\` specs across ${report.routes} route(s).`,
    '',
    'Most of a fal sync diff is their docs boilerplate churn. **The findings below are the review surface** — if this section is empty, the diff is noise and can be merged on a skim.',
    '',
  );
  if (compact) {
    out.push(
      "> **Trimmed to fit GitHub's PR body limit.** Price and schema changes are listed one line per route. The full report, with before/after prices and every key, is in the workflow run's job summary.",
      '',
    );
  }

  if (retired.length > 0) {
    out.push(
      `## 🗑️ ${retired.length} route(s) retired — BREAKING`,
      '',
      'Both the OpenAPI spec and `llms.txt` return **404** for these, so they were removed from `models.json` along with their spec dirs. Before merging, check fal for a renamed successor (repoint `model` instead of removing, if there is one). This PR is titled as a breaking change so release-please bumps the version.',
      '',
      '| Slug | Endpoint | Entry | Prompt guide |',
      '|------|----------|-------|--------------|',
    );
    for (const r of retired) {
      const guide = r.promptGuide
        ? `\`${r.promptGuide}\`${r.guideOrphaned ? ' — **now has no model: delete the tool**' : ''}`
        : '—';
      out.push(
        `| \`${r.slug}\` | \`${r.endpointId}\` | ${r.entryRemoved ? 'removed' : 'route removed, entry kept'} | ${guide} |`,
      );
    }
    const refs = [...new Set(retired.flatMap((r) => r.references ?? []))].sort();
    out.push(
      '',
      '**Manual follow-up on this branch before merging:**',
      '',
      ...refs.map((f) => `- [ ] Update \`${f}\` (still names a retired route)`),
      ...[...new Set(retired.filter((r) => r.guideOrphaned).map((r) => r.promptGuide))].map(
        (g) =>
          `- [ ] Delete \`${g}\` (guide file, its registration in \`src/guides/index.ts\`, and its entry in \`tests/protocol/server.test.ts\`)`,
      ),
      '- [ ] Add an `UPGRADING.md` entry naming the removed slugs and a replacement',
      '',
    );
  }

  if (failures.length > 0) {
    out.push(
      `## ⚠️ ${failures.length} route(s) failed to fetch`,
      '',
      '**These produce no file diff**, so they will not appear in the changed files — this list is the only place they show up. They were not retired automatically: either only one surface failed, the error was not a 404 (an outage or timeout), or too many routes died at once to trust. Re-run the job, or check whether the endpoint was renamed (repoint `model`).',
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
    if (compact) out.push(...costChanges.map((c) => `- \`${c.slug}\``), '');
    for (const c of compact ? [] : costChanges) {
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

  const schema = report.schemaChanges;
  const schemaTouched = schema
    ? schema.changed.length + schema.modelsAdded.length + schema.modelsRemoved.length
    : 0;
  if (schemaTouched > 0) {
    out.push(
      `## ${schemaTouched} input-schema change(s)`,
      '',
      'A **removed** key means callers passing it now have it silently dropped by fal (`fal_generate_*` will warn on stderr, but the request still goes out without it). An **added** key is a new capability the prompt guide probably does not mention yet. Key *reordering* is not reported — only real additions and removals.',
      '',
    );
    for (const m of schema.modelsAdded) out.push(`- **new model** \`${m}\``);
    for (const m of schema.modelsRemoved) out.push(`- **model gone** \`${m}\``);
    for (const c of schema.changed) {
      if (compact) {
        const added = c.addedTop.length + c.addedNested.length;
        const removed = c.removedTop.length + c.removedNested.length;
        out.push(`- \`${c.model}\` (+${added} / **−${removed}** keys)`);
        continue;
      }
      out.push(`- \`${c.model}\``);
      const line = (label, keys) =>
        keys.length > 0 ? out.push(`  - ${label}: ${keys.map((k) => `\`${k}\``).join(', ')}`) : 0;
      line('**added**', c.addedTop);
      line('**REMOVED**', c.removedTop);
      line('added (nested)', c.addedNested);
      line('**REMOVED** (nested)', c.removedNested);
    }
    out.push('');
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
    retired.length === 0 &&
    failures.length === 0 &&
    deprecated.length === 0 &&
    costChanges.length === 0 &&
    undeprecated.length === 0 &&
    schemaTouched === 0
  ) {
    out.push(
      '_No deprecations, fetch failures, price changes, or input-schema changes. Spec-text churn only._',
      '',
    );
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
  const i = args.indexOf('--max-length');
  const maxLength = i >= 0 ? Number(args[i + 1]) : undefined;
  const path = args.find((a, j) => !a.startsWith('--') && (i < 0 || j !== i + 1));
  if (!path || (i >= 0 && !(maxLength > 0))) {
    console.error(
      'Usage: node scripts/format-drift-report.mjs <report.json> [--verify-failed] [--max-length N]',
    );
    process.exitCode = 2;
    return;
  }
  const report = JSON.parse(await readFile(path, 'utf8'));
  process.stdout.write(
    formatDriftReport(report, { verifyFailed: args.includes('--verify-failed'), maxLength }),
  );
}

if (process.argv[1]?.endsWith('format-drift-report.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

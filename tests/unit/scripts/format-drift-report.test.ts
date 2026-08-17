import { describe, it, expect } from 'vitest';
// @ts-expect-error — scripts/*.mjs is outside tsconfig rootDir; imported
// only for rendering tests. Vitest resolves the ESM at runtime.
import { formatDriftReport } from '../../../scripts/format-drift-report.mjs';

const EMPTY = {
  routes: 260,
  deprecated: [],
  failures: [],
  costChanges: [],
  undeprecated: [],
  blocking: false,
};

describe('formatDriftReport', () => {
  it('says plainly that a churn-only sync can be merged on a skim', () => {
    const md = formatDriftReport(EMPTY);
    expect(md).toContain('Spec-text churn only');
    expect(md).toContain('260 route(s)');
    expect(md).not.toContain('failed to fetch');
    expect(md).not.toContain('deprecated route(s)');
  });

  it('puts fetch failures first — they are the ones with no file diff', () => {
    const md = formatDriftReport({
      ...EMPTY,
      blocking: true,
      failures: [
        { slug: 'dead-route', endpointId: 'fal-ai/dead', error: 'GET ... → 404 Not Found' },
      ],
      deprecated: [{ slug: 'dep-route', endpointId: 'fal-ai/dep', notice: 'gone', newly: true }],
    });

    expect(md.indexOf('failed to fetch')).toBeLessThan(md.indexOf('deprecated route(s)'));
    expect(md).toContain('`dead-route`');
    expect(md).toContain('404 Not Found');
    // The reviewer must be told these are invisible in the diff.
    expect(md).toContain('produce no file diff');
  });

  it('distinguishes a newly deprecated route from one already flagged', () => {
    const md = formatDriftReport({
      ...EMPTY,
      deprecated: [
        { slug: 'fresh', endpointId: 'e1', notice: 'n1', newly: true },
        { slug: 'known', endpointId: 'e2', notice: 'n2', newly: false },
      ],
    });
    expect(md).toMatch(/\|\s*`fresh`\s*\|\s*\*\*yes\*\*\s*\|/);
    expect(md).toMatch(/\|\s*`known`\s*\|\s*no\s*\|/);
  });

  it('escapes pipes in a notice so the table does not break', () => {
    // fal's notices are free text; an unescaped pipe would silently split
    // the row into extra columns and hide the rest of the message.
    const md = formatDriftReport({
      ...EMPTY,
      deprecated: [
        { slug: 's', endpointId: 'e', notice: 'use A | B instead', newly: true },
      ],
    });
    expect(md).toContain('use A \\| B instead');
  });

  it('shows both sides of a price change', () => {
    const md = formatDriftReport({
      ...EMPTY,
      costChanges: [
        {
          slug: 'ltx-video-13b-distilled-i2v',
          endpointId: 'e',
          from: '$0.04 per video',
          to: '$0.04 per second',
        },
      ],
    });
    expect(md).toContain('**Was:** $0.04 per video');
    expect(md).toContain('**Now:** $0.04 per second');
    // The billing-unit warning is the point of this section.
    expect(md).toContain('billing unit');
  });

  it('renders a first-time price with no prior value', () => {
    const md = formatDriftReport({
      ...EMPTY,
      costChanges: [{ slug: 's', endpointId: 'e', from: null, to: '$1' }],
    });
    expect(md).toContain('_(unset)_');
  });

  it('reports recoveries', () => {
    const md = formatDriftReport({
      ...EMPTY,
      undeprecated: [{ slug: 'back-again', endpointId: 'e' }],
    });
    expect(md).toContain('1 route(s) recovered');
    expect(md).toContain('`back-again`');
  });

  it('warns loudly when the catalog guards failed on the synced result', () => {
    const md = formatDriftReport(EMPTY, { verifyFailed: true });
    expect(md).toContain('Catalog guards failed');
    expect(md).toContain('Do not merge on a skim');
  });

  it('omits the guard warning when verification passed', () => {
    expect(formatDriftReport(EMPTY)).not.toContain('Catalog guards failed');
  });

  it('always closes with provenance', () => {
    expect(formatDriftReport(EMPTY)).toContain('fal-spec-drift.yml');
  });
});

describe('formatDriftReport — input-schema changes', () => {
  const withSchema = (schemaChanges: unknown) => ({ ...EMPTY, schemaChanges });

  it('reports a removed key and calls out the caller consequence', () => {
    // The blind spot found on 2026-08-17: fal-input-keys.json changed and
    // the PR body said nothing. A removed key is the dangerous direction —
    // fal drops it silently and the request still goes out without it.
    const md = formatDriftReport(
      withSchema({
        modelsAdded: [],
        modelsRemoved: [],
        changed: [
          {
            model: 'fal-ai/x',
            addedTop: [],
            removedTop: ['seed'],
            addedNested: [],
            removedNested: [],
          },
        ],
      }),
    );
    expect(md).toContain('1 input-schema change(s)');
    expect(md).toContain('`fal-ai/x`');
    expect(md).toContain('`seed`');
    expect(md).toContain('silently dropped');
    // Must not claim the sync was churn-only when a key moved.
    expect(md).not.toContain('Spec-text churn only');
  });

  it('reports models appearing and disappearing', () => {
    const md = formatDriftReport(
      withSchema({ modelsAdded: ['fal-ai/new'], modelsRemoved: ['fal-ai/old'], changed: [] }),
    );
    expect(md).toContain('new model');
    expect(md).toContain('model gone');
    expect(md).toContain('2 input-schema change(s)');
  });

  it('says churn-only when the schema diff is empty', () => {
    const md = formatDriftReport(
      withSchema({ modelsAdded: [], modelsRemoved: [], changed: [] }),
    );
    expect(md).toContain('Spec-text churn only');
    // The churn-only sentence itself names input-schema changes, so match
    // the section HEADING rather than the phrase.
    expect(md).not.toMatch(/## \d+ input-schema change/);
  });

  it('tolerates a report with no schemaChanges field at all', () => {
    // Older report JSON, or a --model run that skips the map rebuild.
    const md = formatDriftReport(EMPTY);
    expect(md).toContain('Spec-text churn only');
  });
});

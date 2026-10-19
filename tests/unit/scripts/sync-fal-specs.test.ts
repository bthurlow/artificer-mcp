import { describe, it, expect } from 'vitest';
// @ts-expect-error — scripts/*.mjs is outside tsconfig rootDir; we import
// it only for parser testing. Vitest handles the ESM resolution at runtime.
import {
  extractPricing,
  extractDeprecation,
  buildReport,
  classifyFetches,
  planRetirements,
  retireRoutes,
  MAX_AUTO_RETIRE,
} from '../../../scripts/sync-fal-specs.mjs';

describe('extractPricing', () => {
  it('extracts a simple Price bullet (Kling shape)', () => {
    const llms = [
      '# Kling AI Avatar',
      '',
      '## Pricing',
      '',
      '- **Price**: $0.115 per seconds',
      '',
      'For more details, see [fal.ai pricing](https://fal.ai/pricing).',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe('- **Price**: $0.115 per seconds');
  });

  it('joins a multi-sentence prose block with tiered pricing (Wan shape)', () => {
    const llms = [
      '## Pricing',
      '',
      'Your request will cost **$0.1** per second for 720p resolution. For 1080p your request will cost **$0.15** per second.',
      '',
      'For more details, see [fal.ai pricing](https://fal.ai/pricing).',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe(
      'Your request will cost **$0.1** per second for 720p resolution. For 1080p your request will cost **$0.15** per second.',
    );
  });

  it('preserves a comma-separated resolution tier list (veed shape)', () => {
    const llms = [
      '## Pricing',
      '',
      '480p - $0.08 per second, 720p - $0.15 per second',
      '',
      'For more details, see [fal.ai pricing](https://fal.ai/pricing).',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe(
      '480p - $0.08 per second, 720p - $0.15 per second',
    );
  });

  it('drops the "For more details" footer regardless of case', () => {
    const llms = [
      '## Pricing',
      '',
      '$0.05 per image',
      'FOR MORE DETAILS, see pricing page.',
      '',
      '## Next Section',
    ].join('\n');
    expect(extractPricing(llms)).toBe('$0.05 per image');
  });

  it('returns null when no Pricing section is present', () => {
    const llms = [
      '# Some Model',
      '',
      '## Overview',
      'Stuff.',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBeNull();
  });

  it('returns null when the Pricing section exists but is empty', () => {
    const llms = [
      '## Pricing',
      '',
      '',
      '## Next Section',
    ].join('\n');
    expect(extractPricing(llms)).toBeNull();
  });

  it('collapses runs of blank lines inside the Pricing block', () => {
    const llms = [
      '## Pricing',
      '',
      'Line one.',
      '',
      '',
      'Line two.',
      '',
      '## API Information',
    ].join('\n');
    expect(extractPricing(llms)).toBe('Line one. Line two.');
  });

  it('handles Pricing as the final section (no trailing heading)', () => {
    const llms = ['## Pricing', '', '$1 per call'].join('\n');
    expect(extractPricing(llms)).toBe('$1 per call');
  });
});

describe('extractDeprecation', () => {
  // fal does not publish retirements in a section of their own. They
  // replace the body of `## Pricing` with a one-line notice, so the
  // pricing parser happily returns it and — before this check existed —
  // it landed in the route's `cost` field.
  const NOTICE =
    'This model has been deprecated, and further requests are being re-routed to Seedance 1.0 Pro Fast.';

  it('recognises the notice fal publishes in place of a price', () => {
    const llms = [
      '## Pricing',
      '',
      NOTICE,
      '',
      'For more details, see [fal.ai pricing](https://fal.ai/pricing).',
      '',
      '## API Information',
    ].join('\n');

    const pricing = extractPricing(llms);
    expect(pricing).toBe(NOTICE);
    expect(extractDeprecation(pricing)).toBe(NOTICE);
  });

  it('recognises a redirect to a different vendor', () => {
    const notice =
      'This model has been deprecated, and further requests are being re-routed to Grok Imagine Video.';
    expect(extractDeprecation(notice)).toBe(notice);
  });

  it('returns null for a real price so cost keeps flowing through', () => {
    expect(extractDeprecation('- **Price**: $0.115 per seconds')).toBeNull();
    expect(
      extractDeprecation(
        'Your request will cost $0.06 per second for 1080p, $0.12 per second for 1440p.',
      ),
    ).toBeNull();
  });

  it('returns null when there was no Pricing section at all', () => {
    expect(extractDeprecation(null)).toBeNull();
  });
});

describe('buildReport', () => {
  const ok = (slug: string, outcome: Record<string, unknown> = {}) => ({
    slug,
    endpointId: `fal-ai/${slug}`,
    outcome: { changed: false, ...outcome },
  });

  it('reports nothing when every route is clean', () => {
    const r = buildReport([ok('a'), ok('b')]);
    expect(r.routes).toBe(2);
    expect(r.deprecated).toEqual([]);
    expect(r.failures).toEqual([]);
    expect(r.costChanges).toEqual([]);
    expect(r.blocking).toBe(false);
  });

  it('marks fetch failures blocking — they leave no diff to review', () => {
    // This is the whole reason the cron exits non-zero. A 404 writes no
    // spec file and no catalog change, so without `blocking` the job
    // would close green with a dead route still in the catalog.
    const r = buildReport([
      ok('alive'),
      { slug: 'dead', endpointId: 'fal-ai/dead', error: 'GET ... 404 Not Found' },
    ]);
    expect(r.failures).toHaveLength(1);
    expect(r.failures[0].slug).toBe('dead');
    expect(r.blocking).toBe(true);
  });

  it('does NOT mark deprecations blocking — those ride the PR diff', () => {
    const r = buildReport([
      ok('gone', { deprecated: 're-routed to X', newlyDeprecated: true, changed: true }),
    ]);
    expect(r.deprecated).toHaveLength(1);
    expect(r.blocking).toBe(false);
  });

  it('reports a deprecation on every run, flagging only the first as new', () => {
    // A route that stays retired stays a finding until someone acts on
    // it; only the "newly" flag distinguishes the first sighting.
    const first = buildReport([
      ok('x', { deprecated: 'notice', newlyDeprecated: true, changed: true }),
    ]);
    const later = buildReport([ok('x', { deprecated: 'notice', newlyDeprecated: false })]);

    expect(first.deprecated[0].newly).toBe(true);
    expect(later.deprecated[0].newly).toBe(false);
    expect(later.deprecated[0].notice).toBe('notice');
  });

  it('collects price changes with both sides', () => {
    const r = buildReport([
      ok('p', { costChange: { from: '$0.04 per video', to: '$0.04 per second' }, changed: true }),
    ]);
    expect(r.costChanges).toEqual([
      {
        slug: 'p',
        endpointId: 'fal-ai/p',
        from: '$0.04 per video',
        to: '$0.04 per second',
      },
    ]);
  });

  it('handles a first-time cost with no prior value', () => {
    const r = buildReport([ok('n', { costChange: { from: null, to: '$1' }, changed: true })]);
    expect(r.costChanges[0].from).toBeNull();
  });

  it('reports recoveries so a cleared flag is visible in review', () => {
    const r = buildReport([ok('back', { undeprecated: true, changed: true })]);
    expect(r.undeprecated).toEqual([{ slug: 'back', endpointId: 'fal-ai/back' }]);
    expect(r.blocking).toBe(false);
  });

  it('separates findings across a mixed batch', () => {
    const r = buildReport([
      ok('clean'),
      ok('dep', { deprecated: 'notice', newlyDeprecated: true }),
      ok('priced', { costChange: { from: 'a', to: 'b' } }),
      { slug: 'dead', endpointId: 'fal-ai/dead', error: '404' },
    ]);
    expect(r.routes).toBe(4);
    expect(r.deprecated).toHaveLength(1);
    expect(r.costChanges).toHaveLength(1);
    expect(r.failures).toHaveLength(1);
    expect(r.blocking).toBe(true);
  });
});

describe('classifyFetches', () => {
  const ok = { status: 'fulfilled', value: 'body' };
  const err = (status: number) => ({
    status: 'rejected',
    reason: Object.assign(new Error('x'), { status }),
  });

  it('is ok when both surfaces answer', () => {
    expect(classifyFetches([ok, ok])).toBe('ok');
  });

  it('is gone only when BOTH surfaces 404', () => {
    expect(classifyFetches([err(404), err(404)])).toBe('gone');
  });

  it('is a plain failure when only one surface 404s', () => {
    // One surface missing is as likely a fal docs hiccup as a dead route.
    expect(classifyFetches([err(404), ok])).toBe('failed');
    expect(classifyFetches([ok, err(404)])).toBe('failed');
  });

  it('is a plain failure on an outage, even on both surfaces', () => {
    expect(classifyFetches([err(503), err(503)])).toBe('failed');
    expect(classifyFetches([err(404), err(500)])).toBe('failed');
    // A network error has no status at all.
    expect(
      classifyFetches([{ status: 'rejected', reason: new Error('ECONNRESET') }, err(404)]),
    ).toBe('failed');
  });
});

describe('planRetirements', () => {
  const gone = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      slug: `r${i}`,
      endpointId: `fal-ai/r${i}`,
      error: '404',
    }));

  it('retires everything up to the cap', () => {
    const plan = planRetirements(gone(MAX_AUTO_RETIRE));
    expect(plan.retire).toHaveLength(MAX_AUTO_RETIRE);
    expect(plan.failures).toEqual([]);
  });

  it('retires nothing over the cap, and reports every route as a failure', () => {
    // Mass 404s look like fal changing its spec URLs, not dozens of models
    // dying the same week. Removing them would gut the catalog.
    const plan = planRetirements(gone(MAX_AUTO_RETIRE + 1));
    expect(plan.retire).toEqual([]);
    expect(plan.failures).toHaveLength(MAX_AUTO_RETIRE + 1);
    expect(plan.failures[0].error).toContain('auto-retire cap');
  });
});

describe('retireRoutes', () => {
  const catalog = () => ({
    video: {
      cinematic: [
        {
          slug: 'dead-a',
          prompt_guide: 'solo_guide',
          access_routes: [{ provider: 'fal', model: 'fal-ai/a' }],
        },
        {
          slug: 'mixed',
          prompt_guide: 'shared_guide',
          access_routes: [
            { provider: 'google', model: 'g-1' },
            { provider: 'fal', model: 'fal-ai/m' },
          ],
        },
        {
          slug: 'alive',
          prompt_guide: 'shared_guide',
          access_routes: [{ provider: 'fal', model: 'fal-ai/ok' }],
        },
      ],
    },
  });

  it('removes an entry whose only route died, and flags its guide as orphaned', () => {
    const c = catalog();
    const [r] = retireRoutes(c, [{ slug: 'dead-a', endpointId: 'fal-ai/a' }]);
    expect(c.video.cinematic.map((e) => e.slug)).toEqual(['mixed', 'alive']);
    expect(r).toMatchObject({ entryRemoved: true, promptGuide: 'solo_guide', guideOrphaned: true });
  });

  it('keeps an entry that still has another route', () => {
    const c = catalog();
    const [r] = retireRoutes(c, [{ slug: 'mixed', endpointId: 'fal-ai/m' }]);
    const mixed = c.video.cinematic.find((e) => e.slug === 'mixed');
    expect(mixed?.access_routes).toEqual([{ provider: 'google', model: 'g-1' }]);
    expect(r).toMatchObject({ entryRemoved: false, guideOrphaned: false });
  });

  it('judges orphaned guides against the final catalog', () => {
    const c = catalog();
    const results = retireRoutes(c, [
      { slug: 'mixed', endpointId: 'fal-ai/m' },
      { slug: 'alive', endpointId: 'fal-ai/ok' },
    ]);
    // 'mixed' keeps its google route, so shared_guide still has a model.
    expect(results.every((r: { guideOrphaned: boolean }) => r.guideOrphaned === false)).toBe(true);
  });
});

describe('buildReport — retirements', () => {
  it('carries retired routes without marking the run blocking', () => {
    // The removal is the PR diff; a red job is for findings with no diff.
    const retired = [
      {
        slug: 'gone',
        endpointId: 'fal-ai/gone',
        entryRemoved: true,
        promptGuide: null,
        guideOrphaned: false,
      },
    ];
    const r = buildReport([{ slug: 'gone', endpointId: 'fal-ai/gone' }], retired);
    expect(r.retired).toEqual(retired);
    expect(r.failures).toEqual([]);
    expect(r.blocking).toBe(false);
  });

  it('defaults to no retirements', () => {
    expect(buildReport([]).retired).toEqual([]);
  });
});

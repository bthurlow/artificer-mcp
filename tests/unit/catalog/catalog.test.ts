import { describe, it, expect } from 'vitest';
import { filterCatalog } from '../../../src/catalog/catalog.js';

// Minimal fixture mirroring the real models.json shape. Not the full
// production catalog — we want these tests independent of the real data.
const FIXTURE = {
  $schema_version: '0.1.0',
  video: {
    talking_head: [
      {
        slug: 'wan-2.7',
        prompt_guide: 'wan_video_prompt_guide',
        access_routes: [
          {
            provider: 'fal',
            tool: 'fal_generate_video',
            model: 'fal-ai/wan/v2.7/image-to-video',
            cost: '$0.10/sec',
            key_env_var: 'FAL_KEY',
            stub: false,
          },
        ],
      },
    ],
    cinematic: [
      {
        slug: 'veo-3.1',
        prompt_guide: 'veo_video_prompt_guide',
        access_routes: [
          {
            provider: 'google',
            tool: 'gemini_generate_video',
            model: 'veo-3.1-lite-generate-preview',
            cost: '~$0.05/sec',
            key_env_var: 'GOOGLE_API_KEY',
            stub: false,
          },
          {
            provider: 'fal',
            tool: 'fal_generate_video',
            model: 'fal-ai/veo3.1/image-to-video',
            cost: 'per-second',
            key_env_var: 'FAL_KEY',
            stub: true,
          },
        ],
      },
    ],
  },
  safety: {
    text: [
      {
        slug: 'qwen-3-guard',
        prompt_guide: null,
        access_routes: [
          {
            provider: 'fal',
            tool: 'fal_classify_text',
            model: 'fal-ai/qwen-3-guard',
            cost: 'pending',
            key_env_var: 'FAL_KEY',
            stub: true,
          },
        ],
      },
    ],
  },
};

const BOTH_REGISTERED = (name: string) =>
  ['fal_generate_video', 'gemini_generate_video'].includes(name);
const NOTHING_REGISTERED = () => false;

describe('filterCatalog — env filtering', () => {
  it('returns both capabilities when both keys are set', () => {
    const { catalog, warnings } = filterCatalog(FIXTURE, {
      includeUnavailable: false,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: { FAL_KEY: 'x', GOOGLE_API_KEY: 'y' },
    });

    expect(catalog.video?.talking_head).toHaveLength(1);
    expect(catalog.video?.talking_head[0].slug).toBe('wan-2.7');
    expect(catalog.video?.talking_head[0].access_routes[0].available).toBe(true);

    expect(catalog.video?.cinematic).toHaveLength(1);
    // veo-3.1 has two routes but fal route is stub — dropped by default
    expect(catalog.video?.cinematic[0].access_routes).toHaveLength(1);
    expect(catalog.video?.cinematic[0].access_routes[0].provider).toBe('google');

    // Safety entry has only a stubbed fal route — dropped entirely
    expect(catalog.safety).toBeUndefined();
    expect(warnings).toEqual([]);
  });

  it('filters out fal-only entries when only GOOGLE_API_KEY is set', () => {
    const { catalog } = filterCatalog(FIXTURE, {
      includeUnavailable: false,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: { GOOGLE_API_KEY: 'y' },
    });

    // Wan is fal-only — dropped
    expect(catalog.video?.talking_head).toBeUndefined();

    // veo cinematic has Google route → still visible
    expect(catalog.video?.cinematic).toHaveLength(1);
    expect(catalog.video?.cinematic[0].access_routes[0].provider).toBe('google');

    expect(catalog.safety).toBeUndefined();
  });

  it('filters out google-only entries when only FAL_KEY is set', () => {
    const { catalog } = filterCatalog(FIXTURE, {
      includeUnavailable: false,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: { FAL_KEY: 'x' },
    });

    expect(catalog.video?.talking_head).toHaveLength(1); // wan visible
    // veo cinematic — Google route dropped (no key), fal route is stub → dropped → entry dropped
    expect(catalog.video?.cinematic).toBeUndefined();
  });

  it('returns everything empty of available routes when no keys are set', () => {
    const { catalog } = filterCatalog(FIXTURE, {
      includeUnavailable: false,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: {},
    });

    expect(catalog.video).toBeUndefined();
    expect(catalog.safety).toBeUndefined();
  });
});

describe('filterCatalog — include_unavailable flag', () => {
  it('surfaces stubs + unavailable routes with an `available: false` flag', () => {
    const { catalog } = filterCatalog(FIXTURE, {
      includeUnavailable: true,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: { FAL_KEY: 'x', GOOGLE_API_KEY: 'y' },
    });

    // Now the stubbed fal-veo route and the stubbed qwen safety entry show up
    const veoRoutes = catalog.video?.cinematic[0].access_routes ?? [];
    expect(veoRoutes).toHaveLength(2);
    const falVeo = veoRoutes.find((r) => r.provider === 'fal');
    expect(falVeo?.available).toBe(false); // stub:true
    expect(falVeo?.stub).toBe(true);

    expect(catalog.safety?.text[0].slug).toBe('qwen-3-guard');
    expect(catalog.safety?.text[0].access_routes[0].available).toBe(false);
  });

  it('shows unregistered-tool routes as unavailable when include_unavailable=true', () => {
    const { catalog, warnings } = filterCatalog(FIXTURE, {
      includeUnavailable: true,
      isToolRegisteredFn: NOTHING_REGISTERED,
      env: { FAL_KEY: 'x', GOOGLE_API_KEY: 'y' },
    });

    // All non-stub routes are unavailable (tool not registered) but still visible
    expect(catalog.video?.talking_head[0].access_routes[0].available).toBe(false);
    // And a warning fires for the mismatch
    expect(
      warnings.some((w) => w.includes('unregistered tool "fal_generate_video"')),
    ).toBe(true);
  });
});

describe('filterCatalog — capability filter', () => {
  it('returns only the requested capability', () => {
    const { catalog } = filterCatalog(FIXTURE, {
      capability: 'video',
      includeUnavailable: false,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: { FAL_KEY: 'x', GOOGLE_API_KEY: 'y' },
    });

    expect(Object.keys(catalog)).toEqual(['video']);
    expect(catalog.safety).toBeUndefined();
  });

  it('returns an empty object when the requested capability has nothing available', () => {
    const { catalog } = filterCatalog(FIXTURE, {
      capability: 'safety',
      includeUnavailable: false,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: { FAL_KEY: 'x', GOOGLE_API_KEY: 'y' },
    });
    expect(catalog).toEqual({});
  });
});

describe('filterCatalog — runtime-tool-registration filter', () => {
  it('drops non-stub routes whose transport tool is not registered (default path)', () => {
    const { catalog, warnings } = filterCatalog(FIXTURE, {
      includeUnavailable: false,
      isToolRegisteredFn: (name) => name === 'fal_generate_video',
      env: { FAL_KEY: 'x', GOOGLE_API_KEY: 'y' },
    });

    // Google's veo cinematic route points at gemini_generate_video which
    // is NOT registered in this scenario — route dropped + warning fired
    expect(catalog.video?.cinematic).toBeUndefined();
    expect(
      warnings.some((w) =>
        w.includes('unregistered tool "gemini_generate_video"'),
      ),
    ).toBe(true);

    // Wan's fal route DOES have its tool registered → still visible
    expect(catalog.video?.talking_head).toHaveLength(1);
  });

  it('does NOT warn for stubbed routes pointing at unregistered tools', () => {
    // fal_classify_text is stubbed in the fixture and not registered.
    // The design says stubs are opt-in visibility, so they should never
    // generate a warning either.
    const { warnings } = filterCatalog(FIXTURE, {
      includeUnavailable: false,
      isToolRegisteredFn: BOTH_REGISTERED,
      env: { FAL_KEY: 'x', GOOGLE_API_KEY: 'y' },
    });
    expect(
      warnings.some((w) => w.includes('fal_classify_text')),
    ).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
// @ts-expect-error — scripts/*.mjs is outside tsconfig rootDir; imported
// only for unit testing. Vitest resolves the ESM at runtime.
import {
  orderedTopKeys,
  diffInputKeys,
  collectKeys,
  findInputSchema,
} from '../../../scripts/build-fal-input-keys.mjs';

// A minimal fal-shaped OpenAPI doc: the input schema is reachable only via
// the POST requestBody $ref, which is what findInputSchema anchors on
// (fal's schema NAMES vary per model, so a name heuristic would miss some).
function doc(schema: Record<string, unknown>): Record<string, unknown> {
  return {
    paths: { '/m': { post: { requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/In' } } } } } } },
    components: { schemas: { In: schema } },
  };
}

describe('findInputSchema', () => {
  it('resolves the POST requestBody $ref', () => {
    const d = doc({ properties: { prompt: {} } });
    expect(findInputSchema(d)).toEqual({ properties: { prompt: {} } });
  });

  it('returns undefined when there is no POST body schema', () => {
    expect(findInputSchema({ paths: { '/m': { get: {} } } })).toBeUndefined();
  });
});

describe('collectKeys', () => {
  it('collects top keys in declared order and nested paths sorted', () => {
    const d = doc({
      'x-fal-order-properties': ['prompt', 'audio_setting'],
      properties: {
        audio_setting: { $ref: '#/components/schemas/AS' },
        prompt: { type: 'string' },
      },
    });
    (d.components as { schemas: Record<string, unknown> }).schemas.AS = {
      properties: { sample_rate: {}, format: {}, bitrate: {} },
    };
    expect(collectKeys(d)).toEqual({
      top: ['prompt', 'audio_setting'],
      nested: ['audio_setting.bitrate', 'audio_setting.format', 'audio_setting.sample_rate'],
    });
  });

  it('returns null when the doc has no input schema', () => {
    expect(collectKeys({ paths: {} })).toBeNull();
  });
});

describe('orderedTopKeys', () => {
  // fal reshuffles `properties` freely — 235 of 262 models on 2026-08-17
  // with no semantic change — but publishes a stable canonical order as
  // `x-fal-order-properties`. Reading Object.keys instead churned 1233
  // lines of the derived map and buried the drift PR's only reviewable
  // file in noise.
  const ORDER = ['prompt', 'audio_url', 'resolution', 'seed'];

  it('follows fal declared order, not JSON insertion order', () => {
    const schema = {
      'x-fal-order-properties': ORDER,
      properties: { seed: {}, prompt: {}, resolution: {}, audio_url: {} },
    };
    expect(orderedTopKeys(schema)).toEqual(ORDER);
  });

  it('produces the same result when upstream reshuffles properties', () => {
    const a = {
      'x-fal-order-properties': ORDER,
      properties: { prompt: {}, audio_url: {}, resolution: {}, seed: {} },
    };
    const b = {
      'x-fal-order-properties': ORDER,
      properties: { seed: {}, resolution: {}, audio_url: {}, prompt: {} },
    };
    expect(orderedTopKeys(a)).toEqual(orderedTopKeys(b));
  });

  it('falls back to sorted keys when the extension is absent', () => {
    const schema = { properties: { seed: {}, prompt: {}, audio_url: {} } };
    expect(orderedTopKeys(schema)).toEqual(['audio_url', 'prompt', 'seed']);
  });

  it('never drops a property the order array omits', () => {
    // A partial extension must not silently shrink the accepted key set —
    // that would make the extra_params check reject a valid key.
    const schema = {
      'x-fal-order-properties': ['prompt'],
      properties: { prompt: {}, zeta: {}, alpha: {} },
    };
    expect(orderedTopKeys(schema)).toEqual(['prompt', 'alpha', 'zeta']);
  });

  it('ignores order entries for properties that do not exist', () => {
    const schema = {
      'x-fal-order-properties': ['prompt', 'ghost'],
      properties: { prompt: {} },
    };
    expect(orderedTopKeys(schema)).toEqual(['prompt']);
  });
});

describe('diffInputKeys', () => {
  const m = (top, nested = []) => ({ top, nested });

  it('reports nothing on the first run (no previous map)', () => {
    expect(diffInputKeys(null, { a: m(['x']) })).toEqual({
      modelsAdded: [],
      modelsRemoved: [],
      changed: [],
    });
  });

  it('ignores pure reordering — that is the noise this exists to skip', () => {
    const before = { a: m(['x', 'y', 'z'], ['o.p', 'o.q']) };
    const after = { a: m(['z', 'x', 'y'], ['o.q', 'o.p']) };
    expect(diffInputKeys(before, after).changed).toEqual([]);
  });

  it('reports a REMOVED top-level key — the caller-breaking case', () => {
    // fal drops the key silently; without this the drift PR says nothing.
    const d = diffInputKeys({ a: m(['x', 'gone']) }, { a: m(['x']) });
    expect(d.changed).toEqual([
      { model: 'a', addedTop: [], removedTop: ['gone'], addedNested: [], removedNested: [] },
    ]);
  });

  it('reports an added top-level key', () => {
    const d = diffInputKeys({ a: m(['x']) }, { a: m(['x', 'fresh']) });
    expect(d.changed[0].addedTop).toEqual(['fresh']);
  });

  it('reports nested path changes', () => {
    const d = diffInputKeys({ a: m(['s'], ['s.old']) }, { a: m(['s'], ['s.new']) });
    expect(d.changed[0].addedNested).toEqual(['s.new']);
    expect(d.changed[0].removedNested).toEqual(['s.old']);
  });

  it('reports models appearing and disappearing', () => {
    const d = diffInputKeys({ old: m(['x']) }, { fresh: m(['y']) });
    expect(d.modelsAdded).toEqual(['fresh']);
    expect(d.modelsRemoved).toEqual(['old']);
    expect(d.changed).toEqual([]);
  });

  it('sorts changed models so the report order is stable', () => {
    const before = { b: m(['x']), a: m(['x']) };
    const after = { b: m(['x', 'n']), a: m(['x', 'n']) };
    expect(diffInputKeys(before, after).changed.map((c) => c.model)).toEqual(['a', 'b']);
  });
});

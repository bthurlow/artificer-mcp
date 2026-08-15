import { describe, it, expect } from 'vitest';
import {
  describeUnknownExtraParams,
  suggestNestedPaths,
  checkExtraParams,
} from '../../../src/generation/fal/extra-params.js';
import type { FalInputKeys } from '../../../src/catalog/fal-input-keys.js';

// The real MiniMax Music 2.6 shape — the model that motivated this check.
// A caller passed top-level `audio_format: "wav"`, fal ignored it, and the
// pipeline silently got MP3.
const MINIMAX: FalInputKeys = {
  top: ['lyrics_optimizer', 'is_instrumental', 'audio_setting', 'prompt', 'lyrics'],
  nested: ['audio_setting.bitrate', 'audio_setting.format', 'audio_setting.sample_rate'],
};

describe('suggestNestedPaths', () => {
  it('matches a flattened key by its last token — the motivating case', () => {
    expect(suggestNestedPaths('audio_format', MINIMAX.nested)).toEqual(['audio_setting.format']);
  });

  it('matches a bare leaf name', () => {
    expect(suggestNestedPaths('format', MINIMAX.nested)).toEqual(['audio_setting.format']);
  });

  it('matches a multi-token leaf exactly', () => {
    expect(suggestNestedPaths('sample_rate', MINIMAX.nested)).toEqual([
      'audio_setting.sample_rate',
    ]);
  });

  it('returns nothing when no leaf resembles the key', () => {
    expect(suggestNestedPaths('tempo', MINIMAX.nested)).toEqual([]);
  });

  it('caps suggestions so a common leaf name does not spew', () => {
    const nested = ['a.format', 'b.format', 'c.format', 'd.format', 'e.format'];
    expect(suggestNestedPaths('format', nested)).toHaveLength(3);
  });
});

describe('describeUnknownExtraParams', () => {
  it('says nothing when every key is accepted', () => {
    const out = describeUnknownExtraParams('t', 'm', ['prompt', 'audio_setting'], MINIMAX);
    expect(out).toEqual([]);
  });

  it('names the model and points at the nested path for audio_format', () => {
    const [line] = describeUnknownExtraParams(
      'fal_generate_music',
      'fal-ai/minimax-music/v2.6',
      ['audio_format'],
      MINIMAX,
    );
    expect(line).toContain('audio_format');
    expect(line).toContain('fal-ai/minimax-music/v2.6');
    expect(line).toContain('silently ignore');
    expect(line).toContain('audio_setting.format');
    // The corrected payload shape, so the caller does not have to infer it.
    expect(line).toContain('{"audio_setting": {"format": ...}}');
  });

  it('falls back to listing accepted keys when nothing resembles the input', () => {
    const [line] = describeUnknownExtraParams('t', 'm', ['tempo'], MINIMAX);
    expect(line).toContain('Accepted top-level keys:');
    expect(line).toContain('lyrics_optimizer');
  });

  it('reports each unknown key separately', () => {
    const out = describeUnknownExtraParams('t', 'm', ['audio_format', 'tempo', 'prompt'], MINIMAX);
    expect(out).toHaveLength(2);
  });
});

describe('checkExtraParams — safety rails', () => {
  it('stays silent for a model absent from the map', () => {
    // A brand-new fal route is not in the distilled specs yet. Telling
    // that caller their valid keys are wrong would be worse than saying
    // nothing — a false warning poisons every later warning.
    return expect(
      checkExtraParams('t', 'fal-ai/not-a-real-model-xyz', { anything: 1 }),
    ).resolves.toEqual([]);
  });

  it('stays silent when extra_params is empty or absent', async () => {
    expect(await checkExtraParams('t', 'fal-ai/minimax-music/v2.6', {})).toEqual([]);
    expect(await checkExtraParams('t', 'fal-ai/minimax-music/v2.6', undefined)).toEqual([]);
  });

  it('warns against the real committed map for the real model', async () => {
    // End-to-end through the actual generated fal-input-keys.json, so a
    // regeneration that broke the shape would fail here.
    const out = await checkExtraParams('fal_generate_music', 'fal-ai/minimax-music/v2.6', {
      audio_format: 'wav',
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toContain('audio_setting.format');
  });

  it('does not warn for keys the real model does accept', async () => {
    const out = await checkExtraParams('fal_generate_music', 'fal-ai/minimax-music/v2.6', {
      audio_setting: { format: 'wav' },
      is_instrumental: false,
    });
    expect(out).toEqual([]);
  });
});

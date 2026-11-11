import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

/**
 * These tests verify that the Zod defaults for `model` fall through to
 * environment variables when the caller omits `model`. Schemas capture env
 * at module-load time, so each test uses `vi.resetModules()` + a fresh
 * dynamic import after setting the env var.
 */
describe('model env overrides', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    delete process.env.ARTIFICER_TTS_MODEL;
    delete process.env.ARTIFICER_VEO_MODEL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it('generateVideoSchema picks up ARTIFICER_VEO_MODEL', async () => {
    process.env.ARTIFICER_VEO_MODEL = 'veo-3.0-generate-preview';
    const { generateVideoSchema } = await import('../../../src/generation/types.js');
    const parsed = generateVideoSchema.parse({ prompt: 'x', output: 'y.mp4' });
    expect(parsed.model).toBe('veo-3.0-generate-preview');
  });

  it('explicit model arg overrides env override', async () => {
    process.env.ARTIFICER_TTS_MODEL = 'gemini-3.8-flash-lite-tts';
    const { generateSpeechSchema } = await import('../../../src/generation/types.js');
    expect(generateSpeechSchema.parse({ text: 'x', output: 'y.wav' }).model).toBe(
      'gemini-3.8-flash-lite-tts',
    );
    const parsed = generateSpeechSchema.parse({ text: 'x', output: 'y.wav', model: 'custom-tts' });
    expect(parsed.model).toBe('custom-tts');
  });

  it('treats a whitespace-only env var as unset', async () => {
    process.env.ARTIFICER_TTS_MODEL = '   ';
    const { generateSpeechSchema } = await import('../../../src/generation/types.js');
    expect(generateSpeechSchema.parse({ text: 'x', output: 'y.wav' }).model).toBe(
      'gemini-3.8-flash-tts',
    );
  });

  it('nanobananaGenerateImageSchema defaults to the current Nano Banana 2 model', async () => {
    const { nanobananaGenerateImageSchema } = await import('../../../src/generation/types.js');
    const parsed = nanobananaGenerateImageSchema.parse({ prompt: 'x', output: 'y.png' });
    expect(parsed.model).toBe('gemini-3.1-flash-image');
  });
});

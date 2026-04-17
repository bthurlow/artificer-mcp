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
    delete process.env.ARTIFICER_IMAGEN_MODEL;
    delete process.env.ARTIFICER_IMAGEN_EDIT_MODEL;
    delete process.env.ARTIFICER_IMAGEN_UPSCALE_MODEL;
    delete process.env.ARTIFICER_VEO_MODEL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it('generateImageSchema picks up ARTIFICER_IMAGEN_MODEL', async () => {
    process.env.ARTIFICER_IMAGEN_MODEL = 'imagen-4.0-ultra-preview';
    const { generateImageSchema } = await import('../../../src/generation/types.js');
    const parsed = generateImageSchema.parse({ prompt: 'x', output: 'y.png' });
    expect(parsed.model).toBe('imagen-4.0-ultra-preview');
  });

  it('generateImageSchema falls back to baked default when env unset', async () => {
    const { generateImageSchema } = await import('../../../src/generation/types.js');
    const parsed = generateImageSchema.parse({ prompt: 'x', output: 'y.png' });
    expect(parsed.model).toBe('imagen-4.0-generate-001');
  });

  it('editImageSchema picks up ARTIFICER_IMAGEN_EDIT_MODEL', async () => {
    process.env.ARTIFICER_IMAGEN_EDIT_MODEL = 'imagen-3.5-edit';
    const { editImageSchema } = await import('../../../src/generation/types.js');
    const parsed = editImageSchema.parse({ prompt: 'x', image: 'a.png', output: 'b.png' });
    expect(parsed.model).toBe('imagen-3.5-edit');
  });

  it('upscaleImageSchema picks up ARTIFICER_IMAGEN_UPSCALE_MODEL', async () => {
    process.env.ARTIFICER_IMAGEN_UPSCALE_MODEL = 'imagen-4.0-upscale-ga';
    const { upscaleImageSchema } = await import('../../../src/generation/types.js');
    const parsed = upscaleImageSchema.parse({ image: 'a.png', output: 'b.png' });
    expect(parsed.model).toBe('imagen-4.0-upscale-ga');
  });

  it('generateVideoSchema picks up ARTIFICER_VEO_MODEL', async () => {
    process.env.ARTIFICER_VEO_MODEL = 'veo-3.0-generate-preview';
    const { generateVideoSchema } = await import('../../../src/generation/types.js');
    const parsed = generateVideoSchema.parse({ prompt: 'x', output: 'y.mp4' });
    expect(parsed.model).toBe('veo-3.0-generate-preview');
  });

  it('explicit model arg overrides env override', async () => {
    process.env.ARTIFICER_IMAGEN_MODEL = 'imagen-4.0-ultra-preview';
    const { generateImageSchema } = await import('../../../src/generation/types.js');
    const parsed = generateImageSchema.parse({
      prompt: 'x',
      output: 'y.png',
      model: 'imagen-custom',
    });
    expect(parsed.model).toBe('imagen-custom');
  });

  it('treats empty string env var as unset', async () => {
    process.env.ARTIFICER_IMAGEN_MODEL = '   ';
    const { generateImageSchema } = await import('../../../src/generation/types.js');
    const parsed = generateImageSchema.parse({ prompt: 'x', output: 'y.png' });
    expect(parsed.model).toBe('imagen-4.0-generate-001');
  });
});

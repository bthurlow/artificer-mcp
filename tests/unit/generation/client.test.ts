import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ctorArgs: unknown[] = [];
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    constructor(opts: unknown) {
      ctorArgs.push(opts);
    }
  },
}));

describe('Google GenAI clients', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    ctorArgs.length = 0;
    vi.resetModules();
    process.env['GOOGLE_API_KEY'] = 'k';
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('pins the shared client to v1beta (@google/genai 3 defaults to v1)', async () => {
    const { getGenAIClient } = await import('../../../src/generation/client.js');
    getGenAIClient();
    expect(ctorArgs).toEqual([{ apiKey: 'k', apiVersion: 'v1beta' }]);
  });

  it('keeps the live client on v1alpha', async () => {
    const { getGenAIClientForLive } = await import('../../../src/generation/client.js');
    getGenAIClientForLive();
    expect(ctorArgs).toEqual([{ apiKey: 'k', apiVersion: 'v1alpha' }]);
  });

  it('builds the Vertex client from the project, or names the missing env vars', async () => {
    const { getGenAIClientForVertex } = await import('../../../src/generation/client.js');
    delete process.env['GOOGLE_CLOUD_PROJECT'];
    expect(() => getGenAIClientForVertex('gemini_generate_video')).toThrow(
      /gemini_generate_video requires Vertex AI credentials.*GOOGLE_CLOUD_PROJECT/,
    );
    process.env['GOOGLE_CLOUD_PROJECT'] = 'p';
    getGenAIClientForVertex('gemini_generate_video');
    expect(ctorArgs).toEqual([{ vertexai: true, project: 'p', location: 'us-central1' }]);
  });
});

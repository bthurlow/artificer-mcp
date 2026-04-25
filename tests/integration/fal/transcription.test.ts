/**
 * fal_transcribe integration smokes.
 *
 * Gated on FAL_INTEGRATION_TEST_ENABLE=1 + FAL_KEY. Cheap to run —
 * scribe-v2 is $0.008/min, whisper/wizper compute-billed for a few
 * cents. Total expected spend per full run is well under $0.05.
 *
 * The fixture audio is a short public clip in the bake-off bucket
 * (gs://doughmetrics-content/experiments/fal-bakeoff/voiceover.mp3) —
 * fal pulls it directly via HTTPS, no upload step required for the smokes.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServerClient } from '../../helpers/server.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const ENABLED =
  process.env['FAL_INTEGRATION_TEST_ENABLE'] === '1' && !!process.env['FAL_KEY'];

const FIXTURE_AUDIO_URL =
  'https://storage.googleapis.com/doughmetrics-content/experiments/fal-bakeoff/voiceover.mp3';

describe.skipIf(!ENABLED)('fal_transcribe — live integration', () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const ctx = await createTestServerClient();
    client = ctx.client;
    cleanup = ctx.cleanup;
  });

  afterAll(async () => {
    await cleanup();
  });

  async function invoke(args: Record<string, unknown>) {
    const result = await client.callTool({
      name: 'fal_transcribe',
      arguments: args,
    });
    return { result, payload: JSON.parse((result.content as Array<{ text: string }>)[0].text) };
  }

  it(
    'scribe-v2 — returns word-level words[] with type discriminator + non-empty text',
    async () => {
      const { result, payload } = await invoke({
        model: 'fal-ai/elevenlabs/speech-to-text/scribe-v2',
        audio: FIXTURE_AUDIO_URL,
        extra_params: { language_code: 'en', tag_audio_events: true },
      });
      expect(result.isError).toBeUndefined();
      expect(payload.text).toBeTruthy();
      expect(Array.isArray(payload.words)).toBe(true);
      expect(payload.words.length).toBeGreaterThan(0);
      // At least one entry should be a word with timing
      const wordEntry = payload.words.find(
        (w: { type: string; start: number | null }) => w.type === 'word' && typeof w.start === 'number',
      );
      expect(wordEntry).toBeDefined();
    },
    180_000,
  );

  it(
    'wizper — returns segments[] from chunks',
    async () => {
      const { result, payload } = await invoke({
        model: 'fal-ai/wizper',
        audio: FIXTURE_AUDIO_URL,
        extra_params: { language: 'en', chunk_level: 'segment' },
      });
      expect(result.isError).toBeUndefined();
      expect(payload.text).toBeTruthy();
      expect(Array.isArray(payload.segments)).toBe(true);
      expect(payload.segments.length).toBeGreaterThan(0);
      expect(payload.words).toEqual([]);
    },
    180_000,
  );

  it(
    'rejects schema violation — missing required model',
    async () => {
      const result = await client.callTool({
        name: 'fal_transcribe',
        arguments: { audio: FIXTURE_AUDIO_URL },
      });
      expect(result.isError).toBe(true);
    },
    15_000,
  );
});

/**
 * fal_generate_music integration smokes.
 *
 * Gated on FAL_INTEGRATION_TEST_ENABLE=1 + FAL_KEY. Cheap to run —
 * the SFX models are $0.01 per call, Lyria 2 is $0.10 per 30s. Total
 * expected spend per full run is around $0.50.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createTestServerClient } from '../../helpers/server.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const ENABLED =
  process.env['FAL_INTEGRATION_TEST_ENABLE'] === '1' && !!process.env['FAL_KEY'];

describe.skipIf(!ENABLED)('fal_generate_music — live integration', () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  let scratch: string;

  beforeAll(async () => {
    const ctx = await createTestServerClient();
    client = ctx.client;
    cleanup = ctx.cleanup;
    scratch = join(tmpdir(), `artificer-fal-music-it-${randomUUID()}`);
    await mkdir(scratch, { recursive: true });
  });

  afterAll(async () => {
    await cleanup();
    await rm(scratch, { recursive: true, force: true });
  });

  async function invoke(args: Record<string, unknown>) {
    const result = await client.callTool({
      name: 'fal_generate_music',
      arguments: args,
    });
    return { result, payload: JSON.parse((result.content as Array<{ text: string }>)[0].text) };
  }

  it(
    'Lyria 2 — instrumental music with native negative_prompt support',
    async () => {
      const output = join(scratch, 'lyria2.mp3');
      const { result, payload } = await invoke({
        model: 'fal-ai/lyria2',
        prompt:
          'Warm acoustic indie folk with fingerpicked guitar and soft hand claps, 100 BPM, cozy kitchen morning.',
        output,
        extra_params: { negative_prompt: 'vocals, slow tempo' },
      });
      expect(result.isError).toBeUndefined();
      expect(payload.audio.uri).toBe(output);
      expect((await stat(output)).size).toBeGreaterThan(50_000);
    },
    180_000,
  );

  it(
    'ElevenLabs SFX v2 — short descriptive sound effect with explicit duration',
    async () => {
      const output = join(scratch, 'sfx-whoosh.mp3');
      const { result, payload } = await invoke({
        model: 'fal-ai/elevenlabs/sound-effects/v2',
        prompt: 'Quick whoosh of air, sharp fast transition, tight reverb tail.',
        output,
        extra_params: { duration_seconds: 2 },
      });
      expect(result.isError).toBeUndefined();
      expect(payload.audio.uri).toBe(output);
      expect((await stat(output)).size).toBeGreaterThan(4_000);
    },
    60_000,
  );

  it(
    'Cassette SFX — required integer duration works',
    async () => {
      const output = join(scratch, 'sfx-dog.mp3');
      const { result, payload } = await invoke({
        model: 'cassetteai/sound-effects-generator',
        prompt: 'dog barking in the distance with light rain',
        output,
        extra_params: { duration: 5 },
      });
      expect(result.isError).toBeUndefined();
      expect(payload.audio.uri).toBe(output);
    },
    60_000,
  );

  it(
    'rejects schema violation — missing required model',
    async () => {
      const result = await client.callTool({
        name: 'fal_generate_music',
        arguments: { output: join(scratch, 'bad.mp3'), prompt: 'x' },
      });
      expect(result.isError).toBe(true);
    },
    15_000,
  );
});

/**
 * fal_generate_speech integration smokes.
 *
 * Gated on FAL_INTEGRATION_TEST_ENABLE=1 + FAL_KEY. Character-billed
 * models (Eleven Turbo at $0.05/1K, Dia at $0.04/1K) are effectively
 * free at the scale of a test scripts; MiniMax voice-clone is $1.50
 * flat per call — the voice-clone smoke is the only meaningful spender
 * in this file.
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

describe.skipIf(!ENABLED)('fal_generate_speech — live integration', () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  let scratch: string;

  beforeAll(async () => {
    const ctx = await createTestServerClient();
    client = ctx.client;
    cleanup = ctx.cleanup;
    scratch = join(tmpdir(), `artificer-fal-speech-it-${randomUUID()}`);
    await mkdir(scratch, { recursive: true });
  });

  afterAll(async () => {
    await cleanup();
    await rm(scratch, { recursive: true, force: true });
  });

  async function invoke(args: Record<string, unknown>) {
    const result = await client.callTool({
      name: 'fal_generate_speech',
      arguments: args,
    });
    return { result, payload: JSON.parse((result.content as Array<{ text: string }>)[0].text) };
  }

  it(
    'ElevenLabs Turbo v2.5 — single-voice TTS returns an mp3 above a sanity size floor',
    async () => {
      const output = join(scratch, 'eleven-turbo.mp3');
      const { result, payload } = await invoke({
        model: 'fal-ai/elevenlabs/tts/turbo-v2.5',
        text: 'Most bakers get pricing wrong by forty percent. Here is the math.',
        voice: 'Rachel',
        output,
      });
      expect(result.isError).toBeUndefined();
      expect(payload.audio.uri).toBe(output);
      expect(payload.custom_voice_id).toBeNull();
      expect((await stat(output)).size).toBeGreaterThan(4_000);
    },
    60_000,
  );

  it(
    'Dia — dialogue with [S1]/[S2] tags produces multi-speaker audio',
    async () => {
      const output = join(scratch, 'dia.mp3');
      const { result, payload } = await invoke({
        model: 'fal-ai/dia-tts',
        text: '[S1] Welcome to the show. [S2] Glad to be here. [S1] Let us dive in. (pauses) What is the biggest mistake? [S2] Doubling ingredient cost.',
        output,
      });
      expect(result.isError).toBeUndefined();
      expect(payload.audio.uri).toBe(output);
      expect((await stat(output)).size).toBeGreaterThan(10_000);
    },
    90_000,
  );

  it(
    'MiniMax Speech 2.8 HD — extra_params.prompt + output_format:"url" works',
    async () => {
      const output = join(scratch, 'minimax.mp3');
      const { result, payload } = await invoke({
        model: 'fal-ai/minimax/speech-2.8-hd',
        output,
        extra_params: {
          prompt: 'Hello world, this is a MiniMax speech test.',
          output_format: 'url',
          language_boost: 'English',
        },
      });
      expect(result.isError).toBeUndefined();
      expect(payload.audio.uri).toBe(output);
      expect((await stat(output)).size).toBeGreaterThan(4_000);
    },
    90_000,
  );

  it(
    'rejects schema violation — missing required model',
    async () => {
      const result = await client.callTool({
        name: 'fal_generate_speech',
        arguments: { output: join(scratch, 'bad.mp3'), text: 'x' },
      });
      expect(result.isError).toBe(true);
    },
    15_000,
  );
});

/**
 * fal_generate_video integration smokes — live API calls against fal.ai.
 *
 * Gated explicitly behind FAL_INTEGRATION_TEST_ENABLE=1 AND FAL_KEY set, because
 * each run costs real money (~$0.70-$0.80 per model call). Having FAL_KEY
 * set alone is NOT enough — developers often have it in their environment
 * for other tooling and shouldn't be charged on every `yarn test:integration`.
 *
 * Total expected spend when fully run: ~$3-4 across all four tests.
 *
 *   FAL_INTEGRATION_TEST_ENABLE=1 FAL_KEY=... yarn test:integration
 *
 * Fixtures (public HTTPS objects on doughmetrics-content GCS bucket) were
 * built during the Q2 bake-off — see docs/plans/fal-bakeoff-2026-04-23.md.
 */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import { mkdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createTestServerClient } from '../../helpers/server.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const ENABLED =
  process.env['FAL_INTEGRATION_TEST_ENABLE'] === '1' && !!process.env['FAL_KEY'];

// Q2 bake-off fixtures — public GCS HTTPS, ~7s of real TTS + 1s tail silence.
const AVATAR_URL =
  'https://storage.googleapis.com/doughmetrics-content/references/jenn-avatar/jenn-talking-head.jpg';
const AUDIO_URL =
  'https://storage.googleapis.com/doughmetrics-content/experiments/fal-bakeoff/bakeoff-input.mp3';
const PROMPT =
  'A woman speaking directly to camera, natural lighting, head and shoulders, steady frame.';

describe.skipIf(!ENABLED)('fal_generate_video — live integration', () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  let scratch: string;

  beforeAll(async () => {
    const ctx = await createTestServerClient();
    client = ctx.client;
    cleanup = ctx.cleanup;
    scratch = join(tmpdir(), `artificer-fal-it-${randomUUID()}`);
    await mkdir(scratch, { recursive: true });
  });

  afterAll(async () => {
    await cleanup();
    await rm(scratch, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Cap each live test at 4 minutes so a stuck fal queue doesn't hang CI.
    // Inner poll_timeout_seconds defaults to 300 (5m) — we cap test-side.
  }, 240_000);

  it(
    'Wan 2.7 — 720p + integer duration produces a playable video',
    async () => {
      const output = join(scratch, 'wan.mp4');
      const result = await client.callTool({
        name: 'fal_generate_video',
        arguments: {
          model: 'fal-ai/wan/v2.7/image-to-video',
          prompt: PROMPT,
          output,
          image: AVATAR_URL,
          audio: AUDIO_URL,
          resolution: '720p',
          duration_seconds: 7,
        },
      });

      expect(result.isError).toBeUndefined();
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text).toContain('saved to');
      const s = await stat(output);
      expect(s.size).toBeGreaterThan(200_000); // sanity floor for a 7s 720p mp4
    },
    240_000,
  );

  it(
    'Kling AI Avatar v2 Pro — audio-driven, auto-matched duration',
    async () => {
      const output = join(scratch, 'kling.mp4');
      const result = await client.callTool({
        name: 'fal_generate_video',
        arguments: {
          model: 'fal-ai/kling-video/ai-avatar/v2/pro',
          prompt: PROMPT,
          output,
          image: AVATAR_URL,
          audio: AUDIO_URL,
        },
      });

      expect(result.isError).toBeUndefined();
      const s = await stat(output);
      expect(s.size).toBeGreaterThan(500_000); // 1080p is chunkier
    },
    240_000,
  );

  it(
    'two parallel calls both succeed (queue concurrency)',
    async () => {
      const [a, b] = [
        join(scratch, 'parallel-a.mp4'),
        join(scratch, 'parallel-b.mp4'),
      ];
      const callWan = (output: string) =>
        client.callTool({
          name: 'fal_generate_video',
          arguments: {
            model: 'fal-ai/wan/v2.7/image-to-video',
            prompt: PROMPT,
            output,
            image: AVATAR_URL,
            audio: AUDIO_URL,
            resolution: '720p',
            duration_seconds: 7,
          },
        });

      const [resA, resB] = await Promise.all([callWan(a), callWan(b)]);
      expect(resA.isError).toBeUndefined();
      expect(resB.isError).toBeUndefined();
      expect((await stat(a)).size).toBeGreaterThan(200_000);
      expect((await stat(b)).size).toBeGreaterThan(200_000);
    },
    240_000,
  );

  it(
    'deliberate-failure probe — invalid audio URL surfaces a validation error',
    async () => {
      // Q1 unresolved item: confirm fal 422 file_download_error is unbilled
      // per fal's policy AND surfaces as a FalValidationError through our
      // transport. The unbilled part is verified in the fal dashboard (human
      // step); the surface shape is verified here.
      const output = join(scratch, 'should-not-exist.mp4');
      const result = await client.callTool({
        name: 'fal_generate_video',
        arguments: {
          model: 'fal-ai/wan/v2.7/image-to-video',
          prompt: PROMPT,
          output,
          image: AVATAR_URL,
          audio: 'https://example.invalid/definitely-missing.mp3',
          resolution: '720p',
          duration_seconds: 7,
        },
      });

      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ text: string }>)[0].text;
      // Expect the error class name + errorType embedded in the rich
      // wrapper message produced by fal_generate_video's catch block.
      expect(text).toMatch(/FalValidationError|FalInfrastructureError/);
    },
    120_000,
  );
});

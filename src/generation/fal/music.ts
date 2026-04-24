import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../../utils/register.js';
import { downloadAndWrite } from '../utils/download-and-write.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { resolveForFal } from './inputs.js';
import { type FalGenerateMusicParams, falGenerateMusicSchema } from './types-audio.js';

const STRUCTURAL_FAL_KEYS = new Set(['prompt', 'lyrics', 'audio_url']);

/**
 * Build the fal music-input payload. Structural args win on collision;
 * collisions on non-structural keys are passed through silently (callers
 * deliberately overriding with extra_params).
 */
export function buildMusicInput(
  args: { prompt?: string; lyrics?: string; audioUrl?: string },
  extra: Record<string, unknown> | undefined,
): { input: Record<string, unknown>; collisions: string[] } {
  const input: Record<string, unknown> = { ...(extra ?? {}) };
  const collisions: string[] = [];

  const assign = (key: string, value: unknown): void => {
    if (value === undefined) return;
    if (key in input && STRUCTURAL_FAL_KEYS.has(key)) {
      collisions.push(key);
    }
    input[key] = value;
  };

  assign('prompt', args.prompt);
  assign('lyrics', args.lyrics);
  assign('audio_url', args.audioUrl);

  return { input, collisions };
}

/**
 * Extract `audio.url` from a fal music / SFX response.
 *
 * All Phase 5 seed models (Eleven Music, Lyria 2, Stable Audio,
 * MiniMax Music 2.6, Eleven SFX v2, Cassette SFX) return
 * `{ audio: { url: string, ... } }`. If a future model differs,
 * expand the matcher here.
 */
export function extractMusicOutput(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error(
      `fal returned a non-object result (got ${typeof data}); expected { audio: { url } }`,
    );
  }
  const audio = (data as { audio?: unknown }).audio;
  if (typeof audio !== 'object' || audio === null) {
    throw new Error('fal music response missing `audio` field');
  }
  const url = (audio as { url?: unknown }).url;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('fal music response `audio.url` missing or not a string');
  }
  return url;
}

export function registerFalMusicTools(server: McpServer): void {
  registerTool<FalGenerateMusicParams>(
    server,
    'fal_generate_music',
    'Generate music, songs, or sound effects via any fal-hosted text-to-audio model. Transport tool — pass explicit `model`. Covers music.general / music.song / music.sfx sub-classes in the catalog. Returns JSON with `audio` (written output) and `source_url`. Uses FAL_KEY env var.',
    falGenerateMusicSchema.shape,
    async ({
      model,
      prompt,
      output,
      lyrics,
      reference_audio,
      extra_params,
      poll_timeout_seconds,
    }) => {
      const client = getFalClient();

      const audioResolved = reference_audio
        ? await resolveForFal(reference_audio, (b) => client.storage.upload(b))
        : undefined;

      try {
        const { input, collisions } = buildMusicInput(
          { prompt, lyrics, audioUrl: audioResolved?.url },
          extra_params,
        );

        if (collisions.length > 0) {
          // eslint-disable-next-line no-console
          console.error(
            `fal_generate_music: ${collisions.join(', ')} present in extra_params ` +
              `but also as structural arg(s); structural args win. ` +
              `Remove from extra_params to silence this warning.`,
          );
        }

        let result;
        try {
          result = await client.subscribe(model, {
            input,
            logs: false,
            startTimeout: poll_timeout_seconds,
          });
        } catch (err) {
          const falErr = parseFalError(err);
          throw new Error(
            `fal_generate_music failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
              `status=${falErr.status}, retryable=${falErr.retryable}, ` +
              `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
            { cause: err },
          );
        }

        const audioUrl = extractMusicOutput(result.data);
        const { mime, bytes } = await downloadAndWrite(audioUrl, output, {
          defaultMime: 'audio/mpeg',
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  model,
                  audio: { uri: output, bytes, mime },
                  source_url: audioUrl,
                },
                null,
                2,
              ),
            },
          ],
        };
      } finally {
        await audioResolved?.cleanup?.();
      }
    },
  );
}

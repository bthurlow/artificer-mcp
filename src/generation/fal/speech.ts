import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../../utils/register.js';
import { downloadAndWrite } from '../utils/download-and-write.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { resolveForFal } from './inputs.js';
import { type FalGenerateSpeechParams, falGenerateSpeechSchema } from './types-audio.js';

const STRUCTURAL_FAL_KEYS = new Set(['text', 'voice', 'audio_url']);

/**
 * Build the fal speech-input payload. Structural args win on collision
 * with extra_params; only collisions on structural keys are reported.
 */
export function buildSpeechInput(
  args: { text?: string; voice?: string; audioUrl?: string },
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

  assign('text', args.text);
  assign('voice', args.voice);
  assign('audio_url', args.audioUrl);

  return { input, collisions };
}

/**
 * Extract optional `audio.url` + optional `custom_voice_id` from a fal
 * speech response. Both are optional because:
 *  - Voice-clone models return `custom_voice_id` as primary + audio as optional preview
 *  - TTS models return audio always + no voice_id
 *
 * Throws if neither is present (that's a response shape we don't
 * recognize and shouldn't silently swallow).
 */
export function extractSpeechOutput(data: unknown): {
  audioUrl?: string;
  customVoiceId?: string;
  raw: unknown;
} {
  if (typeof data !== 'object' || data === null) {
    throw new Error(
      `fal returned a non-object result (got ${typeof data}); expected { audio?: { url }, custom_voice_id? }`,
    );
  }
  const audioUrl =
    typeof (data as { audio?: { url?: unknown } }).audio?.url === 'string'
      ? (data as { audio: { url: string } }).audio.url
      : undefined;
  const customVoiceId =
    typeof (data as { custom_voice_id?: unknown }).custom_voice_id === 'string'
      ? (data as { custom_voice_id: string }).custom_voice_id
      : undefined;

  if (!audioUrl && !customVoiceId) {
    throw new Error(
      'fal speech response missing both `audio.url` and `custom_voice_id` — unrecognized output shape.',
    );
  }
  return { audioUrl, customVoiceId, raw: data };
}

export function registerFalSpeechTools(server: McpServer): void {
  registerTool<FalGenerateSpeechParams>(
    server,
    'fal_generate_speech',
    'Generate speech via any fal-hosted TTS, voice-clone, or dialogue model. Transport tool — pass explicit `model`. Returns JSON with `audio_uri` (when audio was generated) and `custom_voice_id` (when the model returned one, e.g. voice-cloning). Uses FAL_KEY env var.',
    falGenerateSpeechSchema.shape,
    async ({ model, text, output, voice, reference_audio, extra_params, poll_timeout_seconds }) => {
      const client = getFalClient();

      const audioResolved = reference_audio
        ? await resolveForFal(reference_audio, (b) => client.storage.upload(b))
        : undefined;

      try {
        const { input, collisions } = buildSpeechInput(
          { text, voice, audioUrl: audioResolved?.url },
          extra_params,
        );

        if (collisions.length > 0) {
          // eslint-disable-next-line no-console
          console.error(
            `fal_generate_speech: ${collisions.join(', ')} present in extra_params ` +
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
            `fal_generate_speech failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
              `status=${falErr.status}, retryable=${falErr.retryable}, ` +
              `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
            { cause: err },
          );
        }

        const { audioUrl, customVoiceId } = extractSpeechOutput(result.data);

        let audioWritten: { uri: string; bytes: number; mime: string } | undefined;
        if (audioUrl) {
          const { mime, bytes } = await downloadAndWrite(audioUrl, output, {
            defaultMime: 'audio/mpeg',
          });
          audioWritten = { uri: output, bytes, mime };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  model,
                  audio: audioWritten ?? null,
                  custom_voice_id: customVoiceId ?? null,
                  source_url: audioUrl ?? null,
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

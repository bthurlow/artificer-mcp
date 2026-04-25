import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../../utils/register.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { resolveForFal } from './inputs.js';
import {
  type FalTranscribeParams,
  type NormalizedTranscription,
  type TranscriptionWord,
  type TranscriptionSegment,
  falTranscribeSchema,
} from './types-transcription.js';

const STRUCTURAL_FAL_KEYS = new Set(['audio_url']);

/**
 * Build the fal transcription input payload. Only structural arg is
 * `audio_url` (resolved upstream from `audio`). Everything else is
 * `extra_params` — see `transcription_prompt_guide` for per-model wire keys.
 *
 * Exported for unit testing.
 */
export function buildTranscriptionInput(
  audioUrl: string,
  extra: Record<string, unknown> | undefined,
): { input: Record<string, unknown>; collisions: string[] } {
  const input: Record<string, unknown> = { ...(extra ?? {}) };
  const collisions: string[] = [];
  if ('audio_url' in input && STRUCTURAL_FAL_KEYS.has('audio_url')) {
    collisions.push('audio_url');
  }
  input.audio_url = audioUrl;
  return { input, collisions };
}

interface ScribeWord {
  text?: unknown;
  type?: unknown;
  start?: unknown;
  end?: unknown;
  speaker_id?: unknown;
}

interface WhisperChunk {
  timestamp?: unknown;
  text?: unknown;
  speaker?: unknown;
}

function asStringOrNull(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}
function asNumberOrNull(v: unknown): number | null {
  return typeof v === 'number' ? v : null;
}

/**
 * Project a scribe `words[]` entry into the normalized shape. Falls back
 * to type:"word" when fal returned an unexpected `type` value.
 */
function normalizeScribeWord(w: ScribeWord): TranscriptionWord {
  const rawType = typeof w.type === 'string' ? w.type : 'word';
  const type =
    rawType === 'word' || rawType === 'spacing' || rawType === 'audio_event' ? rawType : 'word';
  return {
    text: typeof w.text === 'string' ? w.text : '',
    type,
    start: asNumberOrNull(w.start),
    end: asNumberOrNull(w.end),
    speaker_id: asStringOrNull(w.speaker_id),
  };
}

/**
 * Project a whisper / wizper `chunks[]` entry into the normalized
 * segments shape. Whisper chunk shape: `{timestamp: [start, end], text}`.
 */
function normalizeWhisperChunk(c: WhisperChunk): TranscriptionSegment {
  let start: number | null = null;
  let end: number | null = null;
  if (Array.isArray(c.timestamp) && c.timestamp.length >= 2) {
    start = asNumberOrNull(c.timestamp[0]);
    end = asNumberOrNull(c.timestamp[1]);
  }
  return {
    text: typeof c.text === 'string' ? c.text : '',
    start,
    end,
    speaker: asStringOrNull(c.speaker),
  };
}

/**
 * Normalize fal's per-model ASR response into the artificer shape.
 *
 * Dispatch is shape-first, not model-first — we don't trust `model` to
 * predict the response. Five distinct shapes today:
 *   1. Scribe v1/v2: {text, language_code, words[]} — populates words[]
 *   2. Whisper / Wizper: {text, chunks[], inferred_languages|languages} — populates segments[]
 *   3. fal-speech-to-text(/turbo): {output, partial} — text only, no timing
 *   4. Cohere: {text, timings} — text only (timings is perf metrics)
 *   5. Anything else with a `text` string — text only
 *
 * Exported for unit testing.
 */
export function normalizeTranscriptionResponse(raw: unknown): NormalizedTranscription {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  // Shape 1: scribe — words[] present
  if (Array.isArray(data.words)) {
    const words = (data.words as ScribeWord[]).map(normalizeScribeWord);
    const text = typeof data.text === 'string' ? data.text : words.map((w) => w.text).join('');
    const language = asStringOrNull(data.language_code) ?? asStringOrNull(data.language);
    return { text, language, words, segments: [], raw };
  }

  // Shape 2: whisper / wizper — chunks[] present
  if (Array.isArray(data.chunks)) {
    const segments = (data.chunks as WhisperChunk[]).map(normalizeWhisperChunk);
    const text = typeof data.text === 'string' ? data.text : segments.map((s) => s.text).join(' ');
    let language: string | null = null;
    const inferred = data.inferred_languages ?? data.languages;
    if (Array.isArray(inferred) && inferred.length > 0) {
      language = asStringOrNull(inferred[0]);
    }
    return { text, language, words: [], segments, raw };
  }

  // Shape 3: fal-speech-to-text(/turbo) — `output` field, not `text`
  if (typeof data.output === 'string') {
    return { text: data.output, language: null, words: [], segments: [], raw };
  }

  // Shape 4 / 5: bare text
  const text = typeof data.text === 'string' ? data.text : '';
  const language = asStringOrNull(data.language_code) ?? asStringOrNull(data.language);
  return { text, language, words: [], segments: [], raw };
}

export function registerFalTranscriptionTools(server: McpServer): void {
  registerTool<FalTranscribeParams>(
    server,
    'fal_transcribe',
    'Transcribe audio via any fal-hosted ASR model. Transport tool — pass explicit `model`. Returns JSON with `text`, `language`, `words[]` (scribe only — word-level timing for karaoke), `segments[]` (whisper/wizper — segment timing), and the model-specific `raw` payload. Uses FAL_KEY env var. Recommended default for karaoke captions: fal-ai/elevenlabs/speech-to-text/scribe-v2.',
    falTranscribeSchema.shape,
    async ({ model, audio, extra_params, poll_timeout_seconds }) => {
      const client = getFalClient();
      const audioResolved = await resolveForFal(audio, (b) => client.storage.upload(b));

      try {
        const { input, collisions } = buildTranscriptionInput(audioResolved.url, extra_params);
        if (collisions.length > 0) {
          console.error(
            `fal_transcribe: ${collisions.join(', ')} present in extra_params ` +
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
            `fal_transcribe failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
              `status=${falErr.status}, retryable=${falErr.retryable}, ` +
              `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
            { cause: err },
          );
        }

        const normalized = normalizeTranscriptionResponse(result.data);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ model, ...normalized }, null, 2),
            },
          ],
        };
      } finally {
        await audioResolved.cleanup?.();
      }
    },
  );
}

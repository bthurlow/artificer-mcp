import { z } from 'zod';

/**
 * Input schema for `fal_transcribe`.
 *
 * Thin passthrough for fal-hosted ASR models. Only `audio` is structural —
 * all other knobs (language, diarize, keyterms, batch_size, etc.) flow
 * through `extra_params` because the wire-key naming varies per model:
 * scribe uses `language_code`, whisper/wizper/cohere use `language`,
 * fal-speech-to-text accepts no language at all. Auto-mapping would be
 * hidden routing — see `transcription_prompt_guide` for per-model wire keys.
 */
export const falTranscribeSchema = z.object({
  model: z
    .string()
    .min(1)
    .describe(
      'Fal-hosted ASR model id, e.g. "fal-ai/elevenlabs/speech-to-text/scribe-v2" (recommended for karaoke — word-level timing), "fal-ai/whisper" (segment-level), "fal-ai/wizper" (Whisper v3 fal-optimized), "fal-ai/elevenlabs/speech-to-text" (Scribe v1), "fal-ai/speech-to-text", "fal-ai/speech-to-text/turbo", "fal-ai/cohere-transcribe". Required — no server-side default. Discover via `model_catalog` with capability:"transcription"; read the matching prompt guide before calling.',
    ),
  audio: z
    .string()
    .describe(
      'Audio input — public HTTPS URL passes through; gs:// / s3:// / local paths are uploaded to fal storage. Maps to fal `audio_url`.',
    ),
  extra_params: z
    .record(z.unknown())
    .optional()
    .describe(
      'Free-form passthrough for model-specific knobs (language / language_code, diarize, keyterms, batch_size, num_speakers, chunk_level, max_segment_len, prompt, task, tag_audio_events, etc.). Keys spread as top-level fal input fields. Structural args win on collision.',
    ),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(300)
    .describe(
      'Maximum seconds to wait for the fal job. Default 300 — same as the other fal transports.',
    ),
});

export interface FalTranscribeParams {
  model: string;
  audio: string;
  extra_params?: Record<string, unknown>;
  poll_timeout_seconds: number;
}

/**
 * Normalized word entry. `start` / `end` may be null when fal returned
 * null timing (rare — usually only for non-speech tokens like `audio_event`
 * or when the source has no detectable audio at that position).
 */
export interface TranscriptionWord {
  text: string;
  type: 'word' | 'spacing' | 'audio_event';
  start: number | null;
  end: number | null;
  speaker_id?: string | null;
}

/**
 * Normalized segment entry. Coarser than words[]. Whisper / Wizper return
 * segments natively as `chunks[]`; for scribe we leave segments[] empty
 * (callers can derive from words[] by speaker grouping if needed).
 */
export interface TranscriptionSegment {
  text: string;
  start: number | null;
  end: number | null;
  speaker?: string | null;
}

export interface NormalizedTranscription {
  text: string;
  language: string | null;
  words: TranscriptionWord[];
  segments: TranscriptionSegment[];
  raw: unknown;
}

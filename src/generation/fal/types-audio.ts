import { z } from 'zod';

/**
 * Input schema for `fal_generate_speech`.
 *
 * Thin passthrough for fal-hosted TTS / voice-clone / dialogue models.
 * Common structural fields map to fal's canonical wire keys (`text`,
 * `voice`, `audio_url`); anything model-specific goes through
 * `extra_params`. Callers pick `model` explicitly; no server-side default.
 */
export const falGenerateSpeechSchema = z.object({
  model: z
    .string()
    .min(1)
    .describe(
      'Fal-hosted speech model id, e.g. "fal-ai/elevenlabs/tts/turbo-v2.5", "fal-ai/minimax/speech-2.8-hd", "fal-ai/minimax/voice-clone", "fal-ai/dia-tts". Required — no server-side default. Discover via `model_catalog` with capability:"speech"; read the matching prompt guide before calling.',
    ),
  text: z
    .string()
    .optional()
    .describe(
      'Text to synthesize. Required for straight TTS models; optional-to-empty for voice-clone models where the primary payload is reference audio. Passes through as the `text` fal input key.',
    ),
  output: z
    .string()
    .describe(
      'Output URI for the generated audio (e.g., "./out.mp3", "gs://bucket/speech.mp3"). Some voice-clone models return no audio by default — in that case the output file is skipped and the response reports `voice_id` only.',
    ),
  voice: z
    .string()
    .optional()
    .describe(
      'Named voice id. Model-specific — for ElevenLabs this is a voice name like "Rachel"; for MiniMax it is a voice id string. Passes through as the `voice` fal input key. Omit for models that do not accept a voice arg (dialogue models, voice-design).',
    ),
  reference_audio: z
    .string()
    .optional()
    .describe(
      'Audio input URL or local path (voice-clone reference sample, dialogue scene guidance, etc.). Public HTTPS URLs pass through; gs:// / s3:// / local paths are uploaded to fal storage. Passes to fal as `audio_url` — override to a different field name via `extra_params` if the model requires it.',
    ),
  extra_params: z
    .record(z.unknown())
    .optional()
    .describe(
      'Free-form passthrough for model-specific knobs (stability, similarity_boost, language_code, apply_text_normalization, etc.). Keys spread as top-level fal input fields. Structural args (text, voice, audio_url) win on collision; fal returns 422 for unknown keys.',
    ),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(300)
    .describe(
      "Maximum seconds to wait for the fal job. Default 300 (matches the video transports). Fal's subscribe() polls internally — no separate interval knob.",
    ),
});

export interface FalGenerateSpeechParams {
  model: string;
  text?: string;
  output: string;
  voice?: string;
  reference_audio?: string;
  extra_params?: Record<string, unknown>;
  poll_timeout_seconds: number;
}

/**
 * Input schema for `fal_generate_music`.
 *
 * Covers music generation, song generation (with lyrics), sound effects,
 * and anything else in the fal text-to-audio category that isn't speech.
 * Thin passthrough — per-model quirks live in the matching prompt guide.
 */
export const falGenerateMusicSchema = z.object({
  model: z
    .string()
    .min(1)
    .describe(
      'Fal-hosted music / sfx model id, e.g. "fal-ai/elevenlabs/music", "fal-ai/lyria2", "fal-ai/stable-audio-25/text-to-audio", "fal-ai/minimax-music/v2.6" (song with lyrics), "fal-ai/elevenlabs/sound-effects/v2", "cassetteai/sound-effects-generator". Required. Discover via `model_catalog` with capability:"music"; read the matching prompt guide for duration / lyrics / format specifics.',
    ),
  prompt: z
    .string()
    .optional()
    .describe(
      'Text description of the music or sound effect to generate. Optional on composition-plan models (Eleven Music supports a structured `composition_plan` via `extra_params` instead) but required on most.',
    ),
  output: z.string().describe('Output URI for the generated audio.'),
  lyrics: z
    .string()
    .optional()
    .describe(
      'Lyrics for song generation (MiniMax Music 2.6, Eleven Music song mode). Passes as `lyrics` to fal. Ignored by instrumental-only models.',
    ),
  reference_audio: z
    .string()
    .optional()
    .describe(
      'Audio reference for style-transfer models. Public HTTPS passes through; gs:// / s3:// / local paths are uploaded to fal storage. Maps to fal `audio_url`.',
    ),
  extra_params: z
    .record(z.unknown())
    .optional()
    .describe(
      'Free-form passthrough for model-specific knobs (music_length_ms, force_instrumental, output_format, duration_seconds, composition_plan, etc.). Keys spread as top-level fal input fields. Structural args win on collision.',
    ),
  poll_timeout_seconds: z.number().positive().default(300),
});

export interface FalGenerateMusicParams {
  model: string;
  prompt?: string;
  output: string;
  lyrics?: string;
  reference_audio?: string;
  extra_params?: Record<string, unknown>;
  poll_timeout_seconds: number;
}

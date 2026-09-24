import { z } from 'zod';

/**
 * Input schema for `fal_separate_audio` (TODO #21).
 *
 * Stem separation returns several files (one per stem), which none of the
 * other fal transports can write, hence a dedicated tool. Same thin-
 * transport stance: model-specific knobs ride `extra_params`.
 */
export interface FalSeparateAudioParams {
  model: string;
  audio: string;
  output_dir: string;
  basename?: string;
  stems?: string[];
  extra_params?: Record<string, unknown>;
  poll_timeout_seconds: number;
}

export const falSeparateAudioSchema = z.object({
  model: z
    .string()
    .min(1)
    .describe(
      'Fal-hosted separation model id, e.g. "fal-ai/demucs". Required, no server-side default. Discover via `model_catalog` (capability "audio") and read the matching prompt guide.',
    ),
  audio: z
    .string()
    .describe(
      'Mixed audio to separate → `audio_url`. Public HTTPS URLs pass through; local paths and gs:// / s3:// URIs are uploaded to fal storage first.',
    ),
  output_dir: z
    .string()
    .describe(
      'Directory (local path or storage URI such as gs://bucket/stems) to write the stems into. Each stem is saved as <basename>-<stem>.<ext>, e.g. song-vocals.wav.',
    ),
  basename: z
    .string()
    .optional()
    .describe(
      'File name prefix for the stems. Defaults to the input file name without its extension.',
    ),
  stems: z
    .array(z.string())
    .optional()
    .describe(
      'Which stems to return → `stems`, e.g. ["vocals"] for an isolated vocal. Omit for all of them. Accepted names are model-specific (Demucs: vocals, drums, bass, other, guitar, piano; the last two only with its 6-stem network).',
    ),
  extra_params: z
    .record(z.unknown())
    .optional()
    .describe(
      'Model-specific knobs spread into the fal input, e.g. Demucs {"model": "htdemucs_ft", "output_format": "wav"}. Note that a model\'s own `model` input (its network choice) goes here; the top-level `model` arg is the fal endpoint.',
    ),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(600)
    .describe(
      'Maximum seconds to wait for the fal job. Default 600; separation of a full song can take minutes.',
    ),
});

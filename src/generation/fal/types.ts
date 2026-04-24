import { z } from 'zod';

/**
 * Input schema for the `fal_generate_video` transport tool.
 *
 * This is the caller-facing schema (what LLMs hand us). It is deliberately
 * NOT a mirror of fal's per-model OpenAPI — that would force an enum for
 * `resolution`, `aspect_ratio`, and `duration` that differs per model, and
 * the whole point of the transport tool is to be model-agnostic. We enforce
 * what matters (e.g. `duration_seconds` is an integer) and let `extra_params`
 * carry anything model-specific through to fal. Fal's own 422 errors surface
 * verbatim when the caller sends something a particular model rejects.
 *
 * Per-model schemas in `src/catalog/fal-specs/{slug}/openapi.json` stay
 * available for prompt guides and docs. No Zod mirror is generated — if
 * `model_catalog` later needs machine-readable per-model shapes, revisit.
 */
export interface FalGenerateVideoParams {
  model: string;
  prompt?: string;
  output: string;
  image?: string;
  audio?: string;
  duration_seconds?: number;
  aspect_ratio?: string;
  resolution?: string;
  negative_prompt?: string;
  extra_params?: Record<string, unknown>;
  poll_timeout_seconds: number;
}

export const falGenerateVideoSchema = z.object({
  model: z
    .string()
    .min(1)
    .describe(
      'Fal-hosted model id, e.g. "fal-ai/wan/v2.7/image-to-video", "fal-ai/kling-video/ai-avatar/v2/pro", "veed/fabric-1.0". Required — no server-side default. Discover available models via `model_catalog`; read the model-specific prompt guide before calling.',
    ),
  prompt: z
    .string()
    .optional()
    .describe(
      'Text prompt describing the desired video. Optional for image-to-video and audio-driven models where the image or audio carries most of the signal; required for text-to-video.',
    ),
  output: z.string().describe('Output URI (e.g., "./out.mp4", "gs://bucket/out.mp4").'),
  image: z
    .string()
    .optional()
    .describe(
      'Input image URL or local path. Public HTTPS URLs pass through to fal unchanged; gs:// / s3:// / local paths are uploaded to fal storage first.',
    ),
  audio: z
    .string()
    .optional()
    .describe(
      'Input audio URL or local path for audio-driven models (Wan 2.7, Kling AI Avatar, veed/fabric). Same resolution rules as `image`.',
    ),
  duration_seconds: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      'Target video duration in seconds. Integer only — passing a string will fail at schema validation (regression guard for a real 422 observed during the Q2 bake-off). For audio-driven models like Wan 2.7, pass Math.ceil(audio_seconds) to avoid truncation.',
    ),
  aspect_ratio: z
    .string()
    .optional()
    .describe(
      'Model-dependent aspect ratio hint, e.g. "16:9", "9:16", "1:1". Pass-through — not all models accept this parameter.',
    ),
  resolution: z
    .string()
    .optional()
    .describe(
      'Model-dependent resolution hint, e.g. "480p", "720p", "1080p". Pass-through. NOTE: Wan 2.7 audio-driven mode requires "720p" explicitly; omitting it defaults to 1080p and exceeds fal\'s generation budget (see wan_video_prompt_guide).',
    ),
  negative_prompt: z
    .string()
    .optional()
    .describe('Content to discourage. Pass-through — model support varies.'),
  extra_params: z
    .record(z.unknown())
    .optional()
    .describe(
      'Free-form passthrough to the fal payload for any model-specific knobs not covered above (seed, negative_prompt variations, face_swap settings, etc.). Keys are spread as top-level input fields. Unknown keys go to fal as-is; fal responds with 422 if the model rejects them — that error surfaces verbatim, we do not silently drop.',
    ),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(300)
    .describe(
      "Maximum seconds to wait for the fal job before giving up. Default 300 (matches gemini_generate_video). Fal's subscribe() polls the queue internally — there is no separate poll interval knob.",
    ),
});

import { z } from 'zod';

/**
 * Input schema for the `fal_generate_image` transport tool.
 *
 * Same stance as `fal_generate_video`: a thin, model-agnostic transport.
 * Structural args cover the inputs most fal image models share; everything
 * model-specific rides `extra_params` / `extra_files`, and fal's own 422s
 * surface verbatim when a model rejects something.
 *
 * Output is saved exactly as the model returns it. The tool does not
 * convert formats (unlike the Google nano-banana route, whose API has no
 * output-format option). Pick a format with `extra_params.output_format`
 * on models that accept one.
 */
export interface FalGenerateImageParams {
  model: string;
  prompt?: string;
  output: string;
  image?: string;
  images?: string[];
  mask?: string;
  aspect_ratio?: string;
  image_size?: string | { width: number; height: number };
  resolution?: string;
  num_images?: number;
  negative_prompt?: string;
  extra_params?: Record<string, unknown>;
  extra_files?: Record<string, string | string[]>;
  poll_timeout_seconds: number;
}

export const falGenerateImageSchema = z.object({
  model: z
    .string()
    .min(1)
    .describe(
      'Fal-hosted image model id, e.g. "bytedance/seedream/v5/pro/text-to-image", "fal-ai/flux-2-pro/edit", "topaz/upscale/image/precision". Required, no server-side default. Discover models via `model_catalog` (capability "image") and read the matching prompt guide first.',
    ),
  prompt: z
    .string()
    .optional()
    .describe(
      'Text prompt. Required by generation and most edit models; omit it for prompt-less task models (upscalers, background removal).',
    ),
  output: z
    .string()
    .describe(
      'Output URI for the first image (e.g. "./out.png", "gs://bucket/out.png"). Additional images are saved beside it as <name>_2, <name>_3, …. The file holds exactly what the model returned; use an extension that matches the model\'s output format (set it with extra_params.output_format where supported).',
    ),
  image: z
    .string()
    .optional()
    .describe(
      'Single input image → `image_url` (upscalers, background removal, single-image edit models). Public HTTPS URLs pass through; local paths and gs:// / s3:// URIs are uploaded to fal storage first.',
    ),
  images: z
    .array(z.string())
    .optional()
    .describe(
      'Input / reference images → `image_urls` (multi-reference edit and composition models such as Seedream edit, FLUX.2 edit, Nano Banana edit). Same resolution rules as `image`.',
    ),
  mask: z
    .string()
    .optional()
    .describe(
      'Mask image → `mask_url` for inpainting and object removal. Same resolution rules as `image`. Models that name it differently (e.g. `mask_image_url`) take it via extra_files.',
    ),
  aspect_ratio: z
    .string()
    .optional()
    .describe('Aspect ratio hint, e.g. "1:1", "3:4", "16:9". Pass-through; model support varies.'),
  image_size: z
    .union([
      z.string(),
      z.object({ width: z.number().int().positive(), height: z.number().int().positive() }),
    ])
    .optional()
    .describe(
      'fal image_size: a preset such as "square_hd", "portrait_4_3", "landscape_16_9", "auto_2K", or an explicit { width, height }. Pass-through; accepted values vary by model.',
    ),
  resolution: z
    .string()
    .optional()
    .describe(
      'Resolution tier on models that use one instead of image_size, e.g. "1K" / "2K" / "4K" (Nano Banana, Kling Image) or "1k" / "2k" (Grok Imagine). Pass-through.',
    ),
  num_images: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('How many images to generate, on models that support it. Each is saved separately.'),
  negative_prompt: z
    .string()
    .optional()
    .describe('Content to discourage. Pass-through; many current models ignore or reject it.'),
  extra_params: z
    .record(z.unknown())
    .optional()
    .describe(
      'Passthrough for model-specific knobs not covered above: output_format, seed, upscale_factor, guidance, safety settings, etc. Keys are spread as top-level fal input fields. Keys the model does not accept trigger a stderr warning (fal drops them silently).',
    ),
  extra_files: z
    .record(z.union([z.string(), z.array(z.string())]))
    .optional()
    .describe(
      'File-bearing extra_params: each value is resolved like `image` (uploaded if local) and merged into the payload under its key. Use for secondary file inputs such as reference_image_urls, person_image_url, garment_image_urls, mask_image_url. Wins over extra_params on key collision.',
    ),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(300)
    .describe('Maximum seconds to wait for the fal job before giving up. Default 300.'),
});

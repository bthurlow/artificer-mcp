import { z } from 'zod';

/**
 * Resolve a model default, preferring an environment override when set.
 * Lets operators pin models in `.mcp.json` env without editing callers.
 */
const envDefault = (envVar: string, fallback: string): string =>
  process.env[envVar]?.trim() || fallback;

// ── gemini_generate_image ──────────────────────────────────────────────────

export interface GenerateImageParams {
  model: string;
  prompt: string;
  output: string;
  negative_prompt?: string;
  number_of_images: number;
  aspect_ratio: string;
  seed?: number;
  safety_filter_level?: string;
  person_generation?: string;
  enhance_prompt: boolean;
}

export const generateImageSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_IMAGEN_MODEL', 'imagen-4.0-generate-001'))
    .describe(
      'Imagen model ID. Pass any valid model string — no hardcoded enum. Default: imagen-4.0-generate-001 (override via ARTIFICER_IMAGEN_MODEL env var).',
    ),
  prompt: z.string().describe('Text description of the image to generate.'),
  output: z
    .string()
    .describe(
      'Output path for the generated image (e.g., "./output.png"). When number_of_images > 1, files are numbered (output_1.png, output_2.png, ...).',
    ),
  negative_prompt: z.string().optional().describe('What to discourage in the generated image.'),
  number_of_images: z
    .number()
    .int()
    .min(1)
    .max(4)
    .default(1)
    .describe('How many images to generate (1-4).'),
  aspect_ratio: z
    .string()
    .default('1:1')
    .describe('Aspect ratio — "1:1", "3:4", "4:3", "9:16", "16:9".'),
  seed: z.number().int().optional().describe('Random seed for reproducibility.'),
  safety_filter_level: z
    .string()
    .optional()
    .describe(
      'Safety filter — "BLOCK_LOW_AND_ABOVE", "BLOCK_MEDIUM_AND_ABOVE", "BLOCK_ONLY_HIGH", "BLOCK_NONE". Omit to use API default; note the Gemini Developer API (aistudio keys) currently only accepts BLOCK_LOW_AND_ABOVE.',
    ),
  person_generation: z
    .string()
    .optional()
    .describe('"DONT_ALLOW", "ALLOW_ADULT", "ALLOW_ALL". Omit to use API default.'),
  enhance_prompt: z
    .boolean()
    .default(false)
    .describe(
      'If true, Gemini rewrites the prompt for better results. The enhanced prompt is returned in the response.',
    ),
});

// ── gemini_edit_image ──────────────────────────────────────────────────────

export interface EditImageParams {
  model: string;
  prompt: string;
  image: string;
  output: string;
  edit_mode: string;
  mask_image?: string;
  negative_prompt?: string;
  number_of_images: number;
  seed?: number;
}

export const editImageSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_IMAGEN_EDIT_MODEL', 'imagen-3.0-capability-001'))
    .describe(
      'Imagen editing model ID. Default: imagen-3.0-capability-001 (override via ARTIFICER_IMAGEN_EDIT_MODEL env var).',
    ),
  prompt: z.string().describe('Description of the edit to apply.'),
  image: z.string().describe('Path to the source image to edit.'),
  output: z
    .string()
    .describe('Output path for the edited image. Numbered if number_of_images > 1.'),
  edit_mode: z
    .string()
    .default('EDIT_MODE_DEFAULT')
    .describe(
      'Edit mode — "EDIT_MODE_DEFAULT", "EDIT_MODE_INPAINT_REMOVAL", "EDIT_MODE_INPAINT_INSERTION", "EDIT_MODE_OUTPAINT", "EDIT_MODE_CONTROLLED_EDITING", "EDIT_MODE_STYLE", "EDIT_MODE_BGSWAP", "EDIT_MODE_PRODUCT_IMAGE".',
    ),
  mask_image: z
    .string()
    .optional()
    .describe(
      'Path to a mask image (white = edit region, black = preserve). Required for inpaint/outpaint modes.',
    ),
  negative_prompt: z.string().optional().describe('What to discourage.'),
  number_of_images: z
    .number()
    .int()
    .min(1)
    .max(4)
    .default(1)
    .describe('How many edits to generate.'),
  seed: z.number().int().optional().describe('Random seed.'),
});

// ── gemini_upscale_image ───────────────────────────────────────────────────

export interface UpscaleImageParams {
  model: string;
  image: string;
  output: string;
  upscale_factor: string;
}

export const upscaleImageSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_IMAGEN_UPSCALE_MODEL', 'imagen-4.0-upscale-preview'))
    .describe(
      'Upscale model ID. Default: imagen-4.0-upscale-preview (override via ARTIFICER_IMAGEN_UPSCALE_MODEL env var).',
    ),
  image: z.string().describe('Path to the image to upscale.'),
  output: z.string().describe('Output path for the upscaled image.'),
  upscale_factor: z.string().default('x2').describe('Upscale factor — "x2" or "x4".'),
});

// ── gemini_nanobanana_generate_image ───────────────────────────────────────

export interface NanobananaGenerateImageParams {
  model: string;
  prompt: string;
  output: string;
  reference_images?: string[];
  aspect_ratio?: string;
  include_text: boolean;
}

export const nanobananaGenerateImageSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_NANOBANANA_MODEL', 'gemini-2.5-flash-image'))
    .describe(
      'Gemini image model ID (nano-banana family). Default: gemini-2.5-flash-image (override via ARTIFICER_NANOBANANA_MODEL env var).',
    ),
  prompt: z.string().describe('Text prompt. If reference_images are provided, describe the edit or composition.'),
  output: z.string().describe('Output path for the generated image (e.g., "./output.png").'),
  reference_images: z
    .array(z.string())
    .optional()
    .describe(
      'Optional local paths to reference images. When provided, nano-banana uses them as visual context — enabling edits, composites, style transfer, and reference-guided generation.',
    ),
  aspect_ratio: z
    .string()
    .optional()
    .describe('Optional aspect ratio hint — "1:1", "3:4", "4:3", "9:16", "16:9".'),
  include_text: z
    .boolean()
    .default(false)
    .describe('If true, request text modality alongside image — any narration returned is included in the response.'),
});

// ── gemini_generate_video ──────────────────────────────────────────────────

export interface GenerateVideoParams {
  model: string;
  prompt: string;
  output: string;
  image?: string;
  duration_seconds?: number;
  aspect_ratio: string;
  resolution: string;
  fps?: number;
  negative_prompt?: string;
  person_generation?: string;
  generate_audio: boolean;
  enhance_prompt: boolean;
  seed?: number;
  poll_interval_seconds: number;
  poll_timeout_seconds: number;
}

export const generateVideoSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_VEO_MODEL', 'veo-2.0-generate-001'))
    .describe(
      'Veo model ID. Pass any valid model string. Default: veo-2.0-generate-001 (override via ARTIFICER_VEO_MODEL env var).',
    ),
  prompt: z.string().describe('Text description of the video to generate.'),
  output: z.string().describe('Output path for the generated video (e.g., "./output.mp4").'),
  image: z
    .string()
    .optional()
    .describe(
      'Path to an input image for image-to-video generation. When provided, the video starts from this image.',
    ),
  duration_seconds: z
    .number()
    .positive()
    .optional()
    .describe('Video duration in seconds. Model-dependent; Veo 2.0 supports 5-8s.'),
  aspect_ratio: z
    .string()
    .default('16:9')
    .describe('Aspect ratio — "16:9" (landscape) or "9:16" (portrait).'),
  resolution: z.string().default('720p').describe('Resolution — "720p" or "1080p".'),
  fps: z.number().int().positive().optional().describe('Frames per second (model-dependent).'),
  negative_prompt: z.string().optional().describe('What to discourage.'),
  person_generation: z
    .string()
    .optional()
    .describe('"dont_allow" or "allow_adult". Omit to use API default.'),
  generate_audio: z
    .boolean()
    .default(false)
    .describe('If true, generate audio alongside video (model-dependent).'),
  enhance_prompt: z
    .boolean()
    .default(false)
    .describe('If true, Gemini rewrites the prompt for better results.'),
  seed: z.number().int().optional().describe('Random seed.'),
  poll_interval_seconds: z
    .number()
    .positive()
    .default(5)
    .describe('How often to check if video generation is complete (seconds).'),
  poll_timeout_seconds: z
    .number()
    .positive()
    .default(300)
    .describe('Maximum time to wait for video generation (seconds). Default 5 minutes.'),
});

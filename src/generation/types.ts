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
  prompt: z
    .string()
    .describe('Text prompt. If reference_images are provided, describe the edit or composition.'),
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
    .describe(
      'If true, request text modality alongside image — any narration returned is included in the response.',
    ),
});

// ── gemini_generate_speech (TTS) ───────────────────────────────────────────

export interface GenerateSpeechParams {
  model: string;
  text: string;
  output: string;
  voice?: string;
  language_code?: string;
  style?: string;
}

export const generateSpeechSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_TTS_MODEL', 'gemini-2.5-flash-preview-tts'))
    .describe(
      'Gemini TTS model ID. Default: gemini-2.5-flash-preview-tts (override via ARTIFICER_TTS_MODEL env var). Also valid: gemini-2.5-pro-preview-tts.',
    ),
  text: z
    .string()
    .describe(
      'Text to speak. Keep under ~1000 chars per call for best results. May include natural-language style prompts inline (e.g., "Say warmly: Hello baker").',
    ),
  output: z
    .string()
    .describe(
      'Output audio path. .wav is emitted natively; any other extension is transcoded via ffmpeg (requires ffmpeg on PATH).',
    ),
  voice: z
    .string()
    .optional()
    .describe(
      'Prebuilt voice name — "Kore" (warm, calm), "Puck" (upbeat), "Zephyr" (bright), "Charon" (informative), "Fenrir" (excitable), "Leda" (youthful), "Aoede" (breezy), "Orus" (firm), "Sage" (clear). See Gemini TTS docs for full list. When omitted, falls back to ARTIFICER_BRAND_SPEC.tts.voice if set, otherwise "Kore".',
    ),
  language_code: z
    .string()
    .optional()
    .describe('Optional ISO-639-1 language code (e.g., "en-US"). Usually auto-detected.'),
  style: z
    .string()
    .optional()
    .describe(
      'Optional style prefix prepended to the text as a natural-language instruction (e.g., "In a warm, encouraging tone"). Concatenated with a colon to the text.',
    ),
});

// ── gemini_generate_music (Lyria 3 batch) ───────────────────────────────────

export interface GenerateMusicParams {
  model: string;
  prompt: string;
  output: string;
  negative_prompt?: string;
}

export const generateMusicSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_LYRIA_MODEL', 'lyria-3-clip-preview'))
    .describe(
      'Lyria 3 model ID. Default: lyria-3-clip-preview (fixed 30-second clip). Also valid: lyria-3-pro-preview (up to ~2 minutes, duration controllable via prompt; emits WAV instead of MP3). Override via ARTIFICER_LYRIA_MODEL env var.',
    ),
  prompt: z
    .string()
    .describe(
      'Music description — genre, mood, instruments, tempo. E.g., "upbeat indie folk with acoustic guitar and claps, 110 bpm, warm". Pro model supports timestamps like "[0:00-0:15] calm intro, [0:15-0:30] build to drop" for structured tracks.',
    ),
  output: z
    .string()
    .describe(
      'Output audio path. Native format: MP3 for clip, WAV for Pro. Other extensions transcoded via ffmpeg.',
    ),
  negative_prompt: z
    .string()
    .optional()
    .describe(
      'Elements to avoid — appended to the prompt as "Avoid: ...". Note: Lyria 3 does not expose a dedicated negative_prompt field like Lyria 2, so this is prompt-engineered guidance rather than a guarantee.',
    ),
});

// ── gemini_generate_music_live (Lyria RealTime) ─────────────────────────────

export interface GenerateMusicLiveParams {
  model: string;
  prompt: string;
  output: string;
  duration_seconds: number;
  temperature?: number;
  seed?: number;
  guidance?: number;
}

export const generateMusicLiveSchema = z.object({
  model: z
    .string()
    .default(envDefault('ARTIFICER_LYRIA_LIVE_MODEL', 'models/lyria-realtime-exp'))
    .describe(
      'Lyria RealTime model ID. Default: models/lyria-realtime-exp. Override via ARTIFICER_LYRIA_LIVE_MODEL env var. This tool opens a WebSocket session, collects audio for duration_seconds, then force-closes.',
    ),
  prompt: z
    .string()
    .describe(
      'Music description — genre, mood, instruments, tempo. Sent as weightedPrompts[0] with weight 1.0.',
    ),
  output: z
    .string()
    .describe(
      'Output audio path. .wav is emitted natively; other extensions transcoded via ffmpeg.',
    ),
  duration_seconds: z
    .number()
    .positive()
    .max(120)
    .default(30)
    .describe(
      'How long to capture audio before closing the session (seconds). Capped at 120s to avoid runaway sessions.',
    ),
  temperature: z
    .number()
    .min(0)
    .max(3)
    .optional()
    .describe('Audio variance. Higher = more variance. Range 0.0–3.0.'),
  seed: z.number().int().optional().describe('Seeds audio generation for reproducibility.'),
  guidance: z
    .number()
    .min(0)
    .max(6)
    .optional()
    .describe('How closely the model follows prompts. Range 0.0–6.0.'),
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

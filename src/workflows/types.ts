import { z } from 'zod';

// ── workflow_brand_asset_pack ──────────────────────────────────────────────

export interface BrandAssetPackParams {
  logo?: string;
  output_dir: string;
  brand_name?: string;
  brand_color?: string;
  background_color: string;
}

export const brandAssetPackSchema = z.object({
  logo: z
    .string()
    .optional()
    .describe(
      'Path to the source logo (SVG or raster, square recommended, min 1024x1024). When omitted, falls back to ARTIFICER_BRAND_SPEC.logo.full → logo.icon.',
    ),
  output_dir: z.string().describe('Directory for all generated assets.'),
  brand_name: z
    .string()
    .optional()
    .describe(
      'Brand name for social card text overlay. When omitted, falls back to ARTIFICER_BRAND_SPEC.name. If still empty, social card has logo only.',
    ),
  brand_color: z
    .string()
    .optional()
    .describe(
      'Primary brand color (hex). Used for social card background. When omitted, falls back to ARTIFICER_BRAND_SPEC.colors.primary, else "#000000".',
    ),
  background_color: z
    .string()
    .default('#FFFFFF')
    .describe('Background color for assets that need padding (hex).'),
});

// ── workflow_social_carousel ───────────────────────────────────────────────

export interface SocialCarouselParams {
  images: string[];
  output_dir: string;
  width: number;
  height: number;
  captions?: string[];
  caption_color: string;
  caption_background: string;
  caption_font_size: number;
  font_file?: string;
}

export const socialCarouselSchema = z.object({
  images: z.array(z.string()).min(2).max(10).describe('Paths to slide images (2-10).'),
  output_dir: z.string().describe('Directory for the carousel slides.'),
  width: z.number().int().positive().default(1080).describe('Slide width in pixels.'),
  height: z.number().int().positive().default(1080).describe('Slide height in pixels.'),
  captions: z
    .array(z.string())
    .optional()
    .describe('Caption text per slide (same length as images). If omitted, no caption overlay.'),
  caption_color: z.string().default('white').describe('Caption text color.'),
  caption_background: z
    .string()
    .default('#00000080')
    .describe('Caption bar background color with alpha (e.g., "#00000080" for 50% black).'),
  caption_font_size: z
    .number()
    .int()
    .positive()
    .default(48)
    .describe('Caption font size in pixels.'),
  font_file: z
    .string()
    .optional()
    .describe('Path to a .ttf/.otf font file for captions. Uses ImageMagick default if omitted.'),
});

// ── workflow_carousel_compose ──────────────────────────────────────────────

export const textElementSchema = z.object({
  type: z.literal('text'),
  content: z.string().describe('The text to render. Supports multi-line via newlines.'),
  font: z
    .string()
    .optional()
    .describe(
      'Font path or name. Overrides brand.font and ARTIFICER_BRAND_SPEC.fonts.regular for this element.',
    ),
  font_size: z.number().int().positive().describe('Font size in pixels.'),
  color: z
    .string()
    .optional()
    .describe(
      'Text color. When omitted, falls back to ARTIFICER_BRAND_SPEC.colors.primary, else "black".',
    ),
  gravity: z
    .enum([
      'NorthWest',
      'North',
      'NorthEast',
      'West',
      'Center',
      'East',
      'SouthWest',
      'South',
      'SouthEast',
    ])
    .default('NorthWest')
    .describe('Reference anchor for x/y.'),
  x: z.number().int().default(0).describe('X offset from gravity anchor.'),
  y: z.number().int().default(0).describe('Y offset from gravity anchor.'),
  box_width: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('If set with box_height, auto-wraps text via caption: instead of annotate.'),
  box_height: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Paired with box_width for auto-wrap.'),
  stroke_color: z.string().optional().describe('Stroke/outline color.'),
  stroke_width: z.number().int().nonnegative().optional().describe('Stroke width in pixels.'),
  background: z.string().optional().describe('Undercolor for the text (annotate mode only).'),
});

export const rectElementSchema = z.object({
  type: z.literal('rect'),
  x: z.number().int().describe('Top-left X.'),
  y: z.number().int().describe('Top-left Y.'),
  width: z.number().int().positive().describe('Rectangle width.'),
  height: z.number().int().positive().describe('Rectangle height.'),
  color: z.string().describe('Fill color.'),
  corner_radius: z.number().int().nonnegative().optional().describe('If set, draws rounded rect.'),
});

export const lineElementSchema = z.object({
  type: z.literal('line'),
  x1: z.number().int().describe('Start X.'),
  y1: z.number().int().describe('Start Y.'),
  x2: z.number().int().describe('End X.'),
  y2: z.number().int().describe('End Y.'),
  color: z.string().describe('Line color.'),
  width: z.number().int().positive().default(2).describe('Line thickness in pixels.'),
});

export const imageElementSchema = z.object({
  type: z.literal('image'),
  source: z.string().describe('Path or URI to the image to composite.'),
  x: z.number().int().describe('Placement X (NorthWest gravity).'),
  y: z.number().int().describe('Placement Y.'),
  width: z.number().int().positive().optional().describe('Resize to this width.'),
  height: z.number().int().positive().optional().describe('Resize to this height.'),
});

export const slideElementSchema = z.discriminatedUnion('type', [
  textElementSchema,
  rectElementSchema,
  lineElementSchema,
  imageElementSchema,
]);

export const slideBackgroundSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('color'), color: z.string() }),
  z.object({
    type: z.literal('image'),
    source: z.string(),
    overlay_color: z
      .string()
      .optional()
      .describe('Optional solid overlay for readability (e.g., "#00000040").'),
  }),
]);

export const slideSchema = z.object({
  background: slideBackgroundSchema.describe('Slide background (solid color or image).'),
  elements: z
    .array(slideElementSchema)
    .describe('Elements to draw in order (later elements on top).'),
});

export interface CarouselComposeParams {
  slides: z.infer<typeof slideSchema>[];
  output_dir: string;
  width: number;
  height: number;
  brand?: { font?: string };
  filename_pattern?: string;
}

export const carouselComposeSchema = z.object({
  slides: z.array(slideSchema).min(1).max(20).describe('Ordered list of slides to render.'),
  output_dir: z.string().describe('Directory (local path or gs://) for slide outputs.'),
  width: z.number().int().positive().default(1080).describe('Slide width.'),
  height: z.number().int().positive().default(1080).describe('Slide height.'),
  brand: z
    .object({ font: z.string().optional().describe('Default font path for text elements.') })
    .optional(),
  filename_pattern: z
    .string()
    .default('slide_{n:02d}.png')
    .describe('Output filename pattern. {n} → 1-based index; {n:02d} → zero-padded.'),
});

// ── workflow_ig_reel ───────────────────────────────────────────────────────
//
// Platform spec (as of 2026):
// - Aspect: 9:16
// - Resolution: 1080×1920
// - Frame rate: 30 or 60 fps
// - Max duration: 90s (feed), 15-minute reels on long-form
// - Codec: H.264 + AAC
// - Audio: 44.1–48kHz stereo, -14 LUFS recommended
// - File: MP4 (.mp4)

export interface IgReelTitleCard {
  image: string;
  duration_seconds: number;
  audio?: string;
}

export interface IgReelWatermark {
  image?: string;
  gravity: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  opacity: number;
}

export interface IgReelMusic {
  input: string;
  volume: number;
  duck_to?: number;
  duck_attack_ms: number;
  duck_release_ms: number;
}

export interface IgReelParams {
  clips: string[];
  output: string;
  title_card?: IgReelTitleCard;
  end_card?: IgReelTitleCard;
  transition?: string;
  transition_duration: number;
  captions_srt?: string;
  watermark?: IgReelWatermark;
  music?: IgReelMusic;
  normalize_lufs: number;
  fps: number;
}

export const igReelSchema = z.object({
  clips: z
    .array(z.string())
    .min(1)
    .describe('Ordered list of video clip paths to concatenate (1+).'),
  output: z.string().describe('Path for the finished IG Reel MP4.'),
  title_card: z
    .object({
      image: z.string().describe('Path to the title-card image (will be scaled to 1080×1920).'),
      duration_seconds: z
        .number()
        .positive()
        .describe('How long to display the title card in seconds.'),
      audio: z
        .string()
        .optional()
        .describe('Optional short audio sting/music to pair with the title card.'),
    })
    .optional()
    .describe('Optional title card shown before the body clips.'),
  end_card: z
    .object({
      image: z.string(),
      duration_seconds: z.number().positive(),
      audio: z.string().optional(),
    })
    .optional()
    .describe('Optional end card shown after the body clips.'),
  transition: z
    .string()
    .optional()
    .describe(
      'FFmpeg xfade transition between body clips (e.g., "fade", "dissolve"). Omit for hard cuts.',
    ),
  transition_duration: z
    .number()
    .positive()
    .default(0.5)
    .describe('Transition duration in seconds (used when `transition` is set).'),
  captions_srt: z
    .string()
    .optional()
    .describe('Optional path to an SRT file for burned-in captions.'),
  watermark: z
    .object({
      image: z
        .string()
        .optional()
        .describe(
          'Watermark image path (SVG or raster). When omitted, falls back to ARTIFICER_BRAND_SPEC.logo.watermark → logo.wordmark → logo.icon.',
        ),
      gravity: z
        .enum([
          'NorthWest',
          'North',
          'NorthEast',
          'West',
          'Center',
          'East',
          'SouthWest',
          'South',
          'SouthEast',
        ])
        .default('SouthEast'),
      x: z.number().int().default(40),
      y: z.number().int().default(120),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
      opacity: z.number().min(0).max(1).default(0.85),
    })
    .optional()
    .describe(
      'Optional watermark / brand lower-third overlaid on the entire reel. Pass an empty `{}` to apply the brand spec watermark with defaults.',
    ),
  music: z
    .object({
      input: z.string(),
      volume: z
        .number()
        .nonnegative()
        .default(0.25)
        .describe('Linear volume for the music bed (0–1). Typical: 0.2–0.35.'),
      duck_to: z
        .number()
        .max(0)
        .optional()
        .describe(
          'If set, ducks the music bed by this many dB whenever dialogue is audible (sidechain). Typical: -12.',
        ),
      duck_attack_ms: z.number().positive().default(20),
      duck_release_ms: z.number().positive().default(250),
    })
    .optional()
    .describe('Optional music bed mixed under the dialogue audio.'),
  normalize_lufs: z
    .number()
    .default(-14)
    .describe('Target loudness for the final mixed audio (IG recommends -14 LUFS).'),
  fps: z.number().positive().default(30).describe('Output frame rate (30 recommended for Reels).'),
});

// ── workflow_narrated_explainer ────────────────────────────────────────────
//
// Compose a finished 9:16 reel from: TTS-generated narration + optional
// Lyria-generated music bed + a sequence of still images shown with
// ken-burns slow-zoom. Used for narrated-explainer content (Baker Math
// Monday, tip-of-the-day) where we don't need a talking head on camera.

export interface NarratedExplainerParams {
  narration_text: string;
  voice?: string;
  style?: string;
  tts_model: string;
  music_prompt?: string;
  music_input?: string;
  music_model: string;
  music_volume: number;
  music_duck_to: number;
  music_duck_attack_ms: number;
  music_duck_release_ms: number;
  visuals: string[];
  ken_burns: boolean;
  output: string;
  title_card?: IgReelTitleCard;
  end_card?: IgReelTitleCard;
  watermark?: IgReelWatermark;
  transition?: string;
  transition_duration: number;
  fps: number;
  normalize_lufs: number;
  width: number;
  height: number;
}

export const narratedExplainerSchema = z.object({
  narration_text: z
    .string()
    .min(1)
    .describe('Narration script. Will be converted to TTS via gemini_generate_speech.'),
  voice: z
    .string()
    .optional()
    .describe(
      'Gemini TTS voice. When omitted, falls back to ARTIFICER_BRAND_SPEC.tts.voice, else "Kore".',
    ),
  style: z
    .string()
    .optional()
    .describe(
      'Natural-language TTS delivery style. When omitted, composes from brand spec tts.style + accent.',
    ),
  tts_model: z
    .string()
    .default('gemini-2.5-flash-preview-tts')
    .describe('Gemini TTS model ID. Override via ARTIFICER_TTS_MODEL env var.'),
  music_prompt: z
    .string()
    .optional()
    .describe(
      'Lyria prompt for music bed. When omitted, uses ARTIFICER_BRAND_SPEC.music.default_prompt. Ignored if music_input is set.',
    ),
  music_input: z
    .string()
    .optional()
    .describe('Pre-existing music track (path/URI). When set, skips music generation.'),
  music_model: z
    .string()
    .default('lyria-3-clip-preview')
    .describe('Lyria 3 model ID for music generation (clip → 30s MP3 matching voice).'),
  music_volume: z
    .number()
    .nonnegative()
    .default(0.25)
    .describe('Linear volume for the music bed (0–1). Typical: 0.2–0.35.'),
  music_duck_to: z
    .number()
    .max(0)
    .default(-12)
    .describe('Duck music by this many dB under the voiceover (sidechain compress).'),
  music_duck_attack_ms: z.number().positive().default(20),
  music_duck_release_ms: z.number().positive().default(250),
  visuals: z
    .array(z.string())
    .min(1)
    .describe('Ordered list of still-image URIs shown across the narration.'),
  ken_burns: z
    .boolean()
    .default(true)
    .describe('Apply a slow ken-burns zoom to each visual. When false, visuals are static.'),
  output: z.string().describe('Path for the finished reel MP4.'),
  title_card: z
    .object({
      image: z.string(),
      duration_seconds: z.number().positive(),
      audio: z.string().optional(),
    })
    .optional(),
  end_card: z
    .object({
      image: z.string(),
      duration_seconds: z.number().positive(),
      audio: z.string().optional(),
    })
    .optional(),
  watermark: z
    .object({
      image: z
        .string()
        .optional()
        .describe(
          'Watermark image path (SVG or raster). When omitted, falls back to ARTIFICER_BRAND_SPEC.logo.watermark → logo.wordmark → logo.icon.',
        ),
      gravity: z
        .enum([
          'NorthWest',
          'North',
          'NorthEast',
          'West',
          'Center',
          'East',
          'SouthWest',
          'South',
          'SouthEast',
        ])
        .default('SouthEast'),
      x: z.number().int().default(40),
      y: z.number().int().default(120),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
      opacity: z.number().min(0).max(1).default(0.85),
    })
    .optional(),
  transition: z
    .string()
    .optional()
    .describe('FFmpeg xfade transition between visuals (e.g., "fade"). Omit for hard cuts.'),
  transition_duration: z.number().positive().default(0.5),
  fps: z.number().positive().default(30),
  normalize_lufs: z.number().default(-14),
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
});

// ── workflow_talking_head ──────────────────────────────────────────────────

export interface TalkingHeadParams {
  input: string;
  output: string;
  trim_start_seconds?: number;
  trim_end_seconds?: number;
  b_roll?: string;
  b_roll_insert_at_seconds?: number;
  b_roll_duration_seconds?: number;
  subtitle_file?: string;
  normalize_audio: boolean;
  target_lufs: number;
}

export const talkingHeadSchema = z.object({
  input: z.string().describe('Path to the raw talking-head video.'),
  output: z.string().describe('Path for the final processed video.'),
  trim_start_seconds: z
    .number()
    .min(0)
    .optional()
    .describe('Trim: start time in seconds. If omitted, no trimming.'),
  trim_end_seconds: z.number().positive().optional().describe('Trim: end time in seconds.'),
  b_roll: z
    .string()
    .optional()
    .describe('Path to a b-roll clip. If provided, inserted as a cutaway (keeps main audio).'),
  b_roll_insert_at_seconds: z
    .number()
    .min(0)
    .optional()
    .describe('Time in the main video to insert b-roll. Required when b_roll is set.'),
  b_roll_duration_seconds: z
    .number()
    .positive()
    .optional()
    .describe('How many seconds of b-roll to use. Required when b_roll is set.'),
  subtitle_file: z
    .string()
    .optional()
    .describe('Path to an SRT/VTT/ASS subtitle file. If provided, subtitles are burned in.'),
  normalize_audio: z
    .boolean()
    .default(true)
    .describe('If true, normalize audio to target_lufs via EBU R128 loudnorm.'),
  target_lufs: z
    .number()
    .default(-14)
    .describe(
      'Target loudness in LUFS when normalize_audio=true. -14 for YouTube/Spotify, -16 for Apple.',
    ),
});

// ── workflow_ad_creative_set ───────────────────────────────────────────────

const DEFAULT_AD_SIZES = [
  { name: 'leaderboard', w: 728, h: 90 },
  { name: 'medium-rectangle', w: 300, h: 250 },
  { name: 'wide-skyscraper', w: 160, h: 600 },
  { name: 'mobile-banner', w: 320, h: 50 },
  { name: 'large-rectangle', w: 336, h: 280 },
  { name: 'half-page', w: 300, h: 600 },
];

export { DEFAULT_AD_SIZES };

export interface AdCreativeSetParams {
  background: string;
  output_dir: string;
  headline: string;
  cta_text: string;
  headline_color: string;
  cta_color: string;
  cta_background: string;
  font_file?: string;
  sizes?: Array<{ name: string; w: number; h: number }>;
}

export const adCreativeSetSchema = z.object({
  background: z
    .string()
    .describe('Path to the background image (will be resized/cropped per banner size).'),
  output_dir: z.string().describe('Directory for all generated banners.'),
  headline: z.string().describe('Headline text for the ad.'),
  cta_text: z.string().default('Learn More').describe('Call-to-action button text.'),
  headline_color: z.string().default('white').describe('Headline text color.'),
  cta_color: z.string().default('white').describe('CTA button text color.'),
  cta_background: z.string().default('#FF6600').describe('CTA button background color.'),
  font_file: z
    .string()
    .optional()
    .describe('Path to a .ttf/.otf font file. Uses ImageMagick default if omitted.'),
  sizes: z
    .array(
      z.object({
        name: z.string(),
        w: z.number().int().positive(),
        h: z.number().int().positive(),
      }),
    )
    .optional()
    .describe(
      'Custom banner sizes. Default: leaderboard (728x90), medium-rectangle (300x250), wide-skyscraper (160x600), mobile-banner (320x50), large-rectangle (336x280), half-page (300x600).',
    ),
});

import { z } from 'zod';

// ── workflow_brand_asset_pack ──────────────────────────────────────────────

export interface BrandAssetPackParams {
  logo: string;
  output_dir: string;
  brand_name?: string;
  brand_color: string;
  background_color: string;
}

export const brandAssetPackSchema = z.object({
  logo: z.string().describe('Path to the source logo image (square recommended, min 1024x1024).'),
  output_dir: z.string().describe('Directory for all generated assets.'),
  brand_name: z
    .string()
    .optional()
    .describe('Brand name for social card text overlay. If omitted, social card has logo only.'),
  brand_color: z
    .string()
    .default('#000000')
    .describe('Primary brand color (hex). Used for social card background gradient.'),
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

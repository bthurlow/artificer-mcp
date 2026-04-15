import { z } from 'zod';

export type SocialPlatform =
  | 'og'
  | 'twitter'
  | 'instagram-square'
  | 'instagram-portrait'
  | 'instagram-story'
  | 'pinterest'
  | 'linkedin'
  | 'facebook-cover'
  | 'youtube-thumb';

/** Parameters for the social-card tool */
export interface SocialCardParams {
  input: string;
  output_dir: string;
  title?: string;
  subtitle?: string;
  platforms: SocialPlatform[];
  font: string;
  text_color: string;
  overlay_color: string;
}

export const socialCardSchema = z.object({
  input: z.string().describe('Path to the background/hero image'),
  output_dir: z.string().describe('Directory to save generated cards'),
  title: z.string().optional().describe('Title text to overlay'),
  subtitle: z.string().optional().describe('Subtitle text'),
  platforms: z
    .array(
      z.enum([
        'og',
        'twitter',
        'instagram-square',
        'instagram-portrait',
        'instagram-story',
        'pinterest',
        'linkedin',
        'facebook-cover',
        'youtube-thumb',
      ]),
    )
    .default(['og', 'twitter'])
    .describe('Target platforms'),
  font: z.string().default('Arial').describe('Font family'),
  text_color: z.string().default('white').describe('Text color'),
  overlay_color: z.string().default('#00000080').describe('Gradient/overlay color'),
});

/** Parameters for the carousel-set tool */
export interface CarouselSetParams {
  inputs: string[];
  output_dir: string;
  width: number;
  height: number;
  show_numbers: boolean;
  number_style: 'circle' | 'plain';
  brand_color: string;
  font: string;
}

export const carouselSetSchema = z.object({
  inputs: z.array(z.string()).min(1).describe('Paths to images for each slide'),
  output_dir: z.string().describe('Directory to save carousel slides'),
  width: z.number().int().positive().default(1080).describe('Slide width'),
  height: z.number().int().positive().default(1080).describe('Slide height'),
  show_numbers: z.boolean().default(true).describe('Show slide numbers'),
  number_style: z.enum(['circle', 'plain']).default('circle').describe('Number badge style'),
  brand_color: z.string().default('#3B82F6').describe('Brand accent color'),
  font: z.string().default('Arial-Bold').describe('Font family'),
});

/** Parameters for the quote-card tool */
export interface QuoteCardParams {
  output: string;
  quote: string;
  attribution?: string;
  width: number;
  height: number;
  background_color: string;
  text_color: string;
  accent_color: string;
  font: string;
  background_image?: string;
}

export const quoteCardSchema = z.object({
  output: z.string().describe('Path for the output image'),
  quote: z.string().describe('The quote text'),
  attribution: z.string().optional().describe('Attribution (e.g., "— Jane Doe, CEO")'),
  width: z.number().int().positive().default(1080).describe('Card width'),
  height: z.number().int().positive().default(1080).describe('Card height'),
  background_color: z.string().default('#1a1a2e').describe('Background color'),
  text_color: z.string().default('white').describe('Quote text color'),
  accent_color: z.string().default('#e94560').describe('Accent color (quotation marks, line)'),
  font: z.string().default('Georgia').describe('Quote font'),
  background_image: z.string().optional().describe('Optional background image path'),
});

/** Parameters for the email-header tool */
export interface EmailHeaderParams {
  input?: string;
  output: string;
  width: number;
  height: number;
  title?: string;
  subtitle?: string;
  background_color: string;
  text_color: string;
  font: string;
  format: string;
}

export const emailHeaderSchema = z.object({
  input: z.string().optional().describe('Path to a source image (or omit for solid color)'),
  output: z.string().describe('Path for the output email header'),
  width: z.number().int().positive().default(600).describe('Email width (standard: 600)'),
  height: z.number().int().positive().default(200).describe('Header height'),
  title: z.string().optional().describe('Header title text'),
  subtitle: z.string().optional().describe('Subtitle text'),
  background_color: z.string().default('#3B82F6').describe('Background color (if no input image)'),
  text_color: z.string().default('white').describe('Text color'),
  font: z.string().default('Arial-Bold').describe('Font family'),
  format: z.string().default('png').describe('Output format (png or jpg — email safe)'),
});

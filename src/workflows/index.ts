import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { registerTool } from '../utils/register.js';
import { magick, tempPath } from '../utils/exec.js';
import { ffmpegBatch } from '../utils/exec-ffmpeg.js';
import {
  type BrandAssetPackParams,
  type SocialCarouselParams,
  type TalkingHeadParams,
  type AdCreativeSetParams,
  brandAssetPackSchema,
  socialCarouselSchema,
  talkingHeadSchema,
  adCreativeSetSchema,
  DEFAULT_AD_SIZES,
} from './types.js';

/**
 * Register opinionated workflow tools with the MCP server.
 *
 * Workflows chain multiple primitives into a single call for common
 * creative patterns. Each produces multiple outputs and returns a
 * summary of every step taken.
 */
export function registerWorkflowTools(server: McpServer): void {
  // ── workflow_brand_asset_pack ─────────────────────────────────────────
  registerTool<BrandAssetPackParams>(
    server,
    'workflow_brand_asset_pack',
    'Generate a complete brand asset pack from a logo: favicons (16-512px), app icons (iOS + Android sizes), social card (1200x630), and OG image. One call, all assets.',
    brandAssetPackSchema.shape,
    async ({ logo, output_dir, brand_name, brand_color, background_color }) => {
      await mkdir(output_dir, { recursive: true });
      const steps: string[] = [];

      // ── Favicons ──
      const faviconSizes = [16, 32, 48, 180, 192, 512];
      const faviconDir = join(output_dir, 'favicons');
      await mkdir(faviconDir, { recursive: true });
      for (const size of faviconSizes) {
        const out = join(faviconDir, `favicon-${size}x${size}.png`);
        await magick([
          logo,
          '-resize',
          `${size}x${size}`,
          '-background',
          background_color,
          '-gravity',
          'center',
          '-extent',
          `${size}x${size}`,
          out,
        ]);
      }
      steps.push(`Favicons: ${faviconSizes.length} sizes → ${faviconDir}/`);

      // ── App icons ──
      const appIconSizes = [
        { name: 'ios-60@2x', size: 120 },
        { name: 'ios-60@3x', size: 180 },
        { name: 'ios-1024', size: 1024 },
        { name: 'android-mdpi', size: 48 },
        { name: 'android-hdpi', size: 72 },
        { name: 'android-xhdpi', size: 96 },
        { name: 'android-xxhdpi', size: 144 },
        { name: 'android-xxxhdpi', size: 192 },
        { name: 'android-playstore', size: 512 },
      ];
      const iconDir = join(output_dir, 'app-icons');
      await mkdir(iconDir, { recursive: true });
      for (const { name, size } of appIconSizes) {
        const out = join(iconDir, `${name}.png`);
        await magick([
          logo,
          '-resize',
          `${size}x${size}`,
          '-background',
          background_color,
          '-gravity',
          'center',
          '-extent',
          `${size}x${size}`,
          out,
        ]);
      }
      steps.push(`App icons: ${appIconSizes.length} sizes → ${iconDir}/`);

      // ── Social card (1200x630) ──
      const socialCard = join(output_dir, 'social-card.png');
      const logoResized = tempPath('.png');
      await magick([
        logo,
        '-resize',
        '300x300',
        '-background',
        'none',
        '-gravity',
        'center',
        '-extent',
        '300x300',
        logoResized,
      ]);

      const socialArgs = [
        '-size',
        '1200x630',
        `xc:${brand_color}`,
        logoResized,
        '-gravity',
        'center',
        '-geometry',
        brand_name ? '+0-60' : '+0+0',
        '-composite',
      ];
      if (brand_name) {
        socialArgs.push(
          '-fill',
          'white',
          '-pointsize',
          '48',
          '-gravity',
          'south',
          '-annotate',
          '+0+80',
          brand_name,
        );
      }
      socialArgs.push(socialCard);
      await magick(socialArgs);
      steps.push(`Social card (1200x630) → ${socialCard}`);

      // ── OG image (copy of social card) ──
      const ogImage = join(output_dir, 'og-image.png');
      await copyFile(socialCard, ogImage);
      steps.push(`OG image (1200x630) → ${ogImage}`);

      const totalAssets = faviconSizes.length + appIconSizes.length + 2;
      return {
        content: [
          {
            type: 'text',
            text: `Brand asset pack complete — ${totalAssets} assets generated:\n${steps.join('\n')}`,
          },
        ],
      };
    },
  );

  // ── workflow_social_carousel ──────────────────────────────────────────
  registerTool<SocialCarouselParams>(
    server,
    'workflow_social_carousel',
    'Create a social media carousel from a set of images. Resizes each to uniform dimensions and optionally adds caption bars. Outputs numbered slides ready for posting.',
    socialCarouselSchema.shape,
    async ({
      images,
      output_dir,
      width,
      height,
      captions,
      caption_color,
      caption_background,
      caption_font_size,
      font_file,
    }) => {
      if (captions && captions.length !== images.length) {
        throw new Error(
          `captions length (${captions.length}) must match images length (${images.length})`,
        );
      }
      await mkdir(output_dir, { recursive: true });
      const steps: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const slideNum = i + 1;
        const out = join(output_dir, `slide_${slideNum}.png`);

        // Resize + crop to exact dimensions.
        const resizeArgs = [
          images[i],
          '-resize',
          `${width}x${height}^`,
          '-gravity',
          'center',
          '-extent',
          `${width}x${height}`,
        ];

        if (captions?.[i]) {
          // Add a caption bar at the bottom.
          const barHeight = caption_font_size * 2.5;
          const fontArgs = font_file ? ['-font', font_file] : [];
          resizeArgs.push(
            // Draw caption background bar
            '-fill',
            caption_background,
            '-draw',
            `rectangle 0,${height - barHeight},${width},${height}`,
            // Draw caption text
            ...fontArgs,
            '-fill',
            caption_color,
            '-pointsize',
            String(caption_font_size),
            '-gravity',
            'south',
            '-annotate',
            `+0+${Math.round(barHeight * 0.3)}`,
            captions[i],
          );
        }

        resizeArgs.push(out);
        await magick(resizeArgs);
        steps.push(`Slide ${slideNum}: ${out}${captions?.[i] ? ` — "${captions[i]}"` : ''}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Social carousel complete — ${images.length} slides (${width}x${height}):\n${steps.join('\n')}`,
          },
        ],
      };
    },
  );

  // ── workflow_talking_head ─────────────────────────────────────────────
  registerTool<TalkingHeadParams>(
    server,
    'workflow_talking_head',
    'Process a talking-head video in one call: trim → insert b-roll cutaway → burn subtitles → normalize audio. Each step is optional — skip by omitting its params.',
    talkingHeadSchema.shape,
    async ({
      input,
      output,
      trim_start_seconds,
      trim_end_seconds,
      b_roll,
      b_roll_insert_at_seconds,
      b_roll_duration_seconds,
      subtitle_file,
      normalize_audio,
      target_lufs,
    }) => {
      await mkdir(join(output, '..'), { recursive: true });
      const steps: string[] = [];
      let current = input;

      // Step 1: Trim
      if (trim_start_seconds !== undefined || trim_end_seconds !== undefined) {
        const trimmed = tempPath('.mp4');
        const args = ['-y', '-i', current];
        if (trim_start_seconds !== undefined) args.push('-ss', String(trim_start_seconds));
        if (trim_end_seconds !== undefined) args.push('-to', String(trim_end_seconds));
        args.push('-c:v', 'libx264', '-c:a', 'aac', trimmed);
        await ffmpegBatch(args);
        current = trimmed;
        steps.push(`Trimmed: ${trim_start_seconds ?? 0}s → ${trim_end_seconds ?? 'end'}`);
      }

      // Step 2: B-roll cutaway
      if (
        b_roll &&
        b_roll_insert_at_seconds !== undefined &&
        b_roll_duration_seconds !== undefined
      ) {
        const brolled = tempPath('.mp4');
        const t0 = b_roll_insert_at_seconds;
        const d = b_roll_duration_seconds;
        const filter = [
          `[0:v]trim=0:${t0},setpts=PTS-STARTPTS[preV]`,
          `[1:v]trim=0:${d},setpts=PTS-STARTPTS[brV]`,
          `[0:v]trim=${t0 + d},setpts=PTS-STARTPTS[postV]`,
          `[preV][brV][postV]concat=n=3:v=1:a=0[vout]`,
        ].join(';');
        await ffmpegBatch([
          '-y',
          '-i',
          current,
          '-i',
          b_roll,
          '-filter_complex',
          filter,
          '-map',
          '[vout]',
          '-map',
          '0:a?',
          '-c:v',
          'libx264',
          '-c:a',
          'aac',
          brolled,
        ]);
        current = brolled;
        steps.push(`B-roll cutaway: ${d}s at ${t0}s`);
      }

      // Step 3: Subtitles
      if (subtitle_file) {
        const subbed = tempPath('.mp4');
        const escaped = subtitle_file.replace(/\\/g, '/').replace(/:/g, '\\:');
        await ffmpegBatch([
          '-y',
          '-i',
          current,
          '-vf',
          `subtitles='${escaped}'`,
          '-c:v',
          'libx264',
          '-c:a',
          'copy',
          subbed,
        ]);
        current = subbed;
        steps.push(`Subtitles burned in: ${subtitle_file}`);
      }

      // Step 4: Audio normalization
      if (normalize_audio) {
        const normalized = tempPath('.mp4');
        await ffmpegBatch([
          '-y',
          '-i',
          current,
          '-af',
          `loudnorm=I=${target_lufs}:TP=-1:LRA=11`,
          '-c:v',
          'copy',
          '-c:a',
          'aac',
          normalized,
        ]);
        current = normalized;
        steps.push(`Audio normalized: ${target_lufs} LUFS`);
      }

      // Final: copy to output (or it's already at current if no steps ran)
      if (current !== output) {
        await ffmpegBatch(['-y', '-i', current, '-c', 'copy', output]);
      }

      return {
        content: [
          {
            type: 'text',
            text:
              steps.length > 0
                ? `Talking-head video processed (${steps.length} steps) → ${output}:\n${steps.join('\n')}`
                : `No processing steps requested — input copied to ${output}`,
          },
        ],
      };
    },
  );

  // ── workflow_ad_creative_set ──────────────────────────────────────────
  registerTool<AdCreativeSetParams>(
    server,
    'workflow_ad_creative_set',
    'Generate a complete ad creative set from a background image: resize to standard banner sizes, add headline text and CTA button. Outputs ready-to-upload banners.',
    adCreativeSetSchema.shape,
    async ({
      background,
      output_dir,
      headline,
      cta_text,
      headline_color,
      cta_color,
      cta_background,
      font_file,
      sizes,
    }) => {
      const bannerSizes = sizes ?? DEFAULT_AD_SIZES;
      await mkdir(output_dir, { recursive: true });
      const steps: string[] = [];

      for (const { name, w, h } of bannerSizes) {
        const out = join(output_dir, `banner_${name}_${w}x${h}.png`);

        // Determine text sizing relative to banner dimensions.
        const minDim = Math.min(w, h);
        const headlineSize = Math.max(12, Math.round(minDim * 0.25));
        const ctaFontSize = Math.max(10, Math.round(minDim * 0.18));
        const ctaPadX = Math.round(ctaFontSize * 0.8);
        const ctaPadY = Math.round(ctaFontSize * 0.4);
        const ctaW = cta_text.length * ctaFontSize * 0.6 + ctaPadX * 2;
        const ctaH = ctaFontSize + ctaPadY * 2;

        const fontArgs = font_file ? ['-font', font_file] : [];

        await magick([
          // Resize/crop background to banner size
          background,
          '-resize',
          `${w}x${h}^`,
          '-gravity',
          'center',
          '-extent',
          `${w}x${h}`,
          // Darken overlay for readability
          '(',
          '-size',
          `${w}x${h}`,
          'xc:#00000060',
          ')',
          '-composite',
          // Headline text
          ...fontArgs,
          '-fill',
          headline_color,
          '-pointsize',
          String(headlineSize),
          '-gravity',
          'center',
          '-annotate',
          `+0-${Math.round(h * 0.1)}`,
          headline,
          // CTA button background
          '-fill',
          cta_background,
          '-draw',
          `roundrectangle ${Math.round(w / 2 - ctaW / 2)},${Math.round(h * 0.6)},${Math.round(w / 2 + ctaW / 2)},${Math.round(h * 0.6 + ctaH)},6,6`,
          // CTA button text
          ...fontArgs,
          '-fill',
          cta_color,
          '-pointsize',
          String(ctaFontSize),
          '-gravity',
          'north',
          '-annotate',
          `+0+${Math.round(h * 0.6 + ctaPadY)}`,
          cta_text,
          out,
        ]);
        steps.push(`${name} (${w}x${h}) → ${out}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Ad creative set complete — ${bannerSizes.length} banners:\n${steps.join('\n')}`,
          },
        ],
      };
    },
  );
}

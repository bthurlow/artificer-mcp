import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { magick, tempPath } from '../utils/exec.js';
import { ffmpegBatch, getVideoInfo } from '../utils/exec-ffmpeg.js';
import { resolveInput, resolveOutput, joinUri } from '../utils/resource.js';
import { loadBrandSpec, resolveColor, resolveWatermark, stageLogoForRaster } from '../brand.js';

/** Escape a file path for the subtitles filter (colons on Windows break it). */
function escapeSubtitlePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/:/g, '\\:');
}

/** Shell-escape a path for FFmpeg concat-demuxer manifest files. */
function escapeConcatPath(path: string): string {
  return `'${path.replace(/'/g, `'\\''`)}'`;
}
import {
  type BrandAssetPackParams,
  type SocialCarouselParams,
  type TalkingHeadParams,
  type AdCreativeSetParams,
  type CarouselComposeParams,
  type IgReelParams,
  type NarratedExplainerParams,
  brandAssetPackSchema,
  socialCarouselSchema,
  talkingHeadSchema,
  adCreativeSetSchema,
  carouselComposeSchema,
  igReelSchema,
  narratedExplainerSchema,
  DEFAULT_AD_SIZES,
} from './types.js';
import { generateSpeechToFile } from '../generation/speech.js';
import { generateMusicBatchToFile } from '../generation/music.js';

/**
 * Format a filename from a pattern like "slide_{n:02d}.png" with n=1.
 */
function formatFilename(pattern: string, n: number): string {
  return pattern.replace(/\{n(?::0*(\d+)d)?\}/g, (_m, pad?: string) => {
    if (pad) return String(n).padStart(parseInt(pad, 10), '0');
    return String(n);
  });
}

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
      const brandSpec = loadBrandSpec();
      const effectiveLogo = logo ?? brandSpec?.logo?.full ?? brandSpec?.logo?.icon;
      if (!effectiveLogo) {
        throw new Error(
          'logo is required — pass it directly or set ARTIFICER_BRAND_SPEC.logo.full / .icon',
        );
      }
      // Logo may be SVG; stageLogoForRaster rasterizes at generous size so
      // all downstream resize ops stay crisp.
      const logoStaged = await stageLogoForRaster(effectiveLogo, { rasterWidth: 2048 });
      if (!logoStaged.localPath) {
        throw new Error('logo staging failed');
      }
      const logoLocalPath = logoStaged.localPath;
      const effectiveBrandColor = resolveColor(brand_color) ?? '#000000';
      const effectiveBrandName = brand_name ?? brandSpec?.name;
      const brandFontUri = brandSpec?.fonts?.semibold ?? brandSpec?.fonts?.regular;
      const brandFontR = brandFontUri ? await resolveInput(brandFontUri) : null;
      const steps: string[] = [];
      try {
        // ── Favicons ──
        const faviconSizes = [16, 32, 48, 180, 192, 512];
        const faviconDirUri = joinUri(output_dir, 'favicons');
        for (const size of faviconSizes) {
          const outUri = joinUri(faviconDirUri, `favicon-${size}x${size}.png`);
          const out = await resolveOutput(outUri);
          await mkdir(join(out.localPath, '..'), { recursive: true });
          await magick([
            logoLocalPath,
            '-resize',
            `${size}x${size}`,
            '-background',
            background_color,
            '-gravity',
            'center',
            '-extent',
            `${size}x${size}`,
            out.localPath,
          ]);
          await out.commit();
        }
        steps.push(`Favicons: ${faviconSizes.length} sizes → ${faviconDirUri}/`);

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
        const iconDirUri = joinUri(output_dir, 'app-icons');
        for (const { name, size } of appIconSizes) {
          const outUri = joinUri(iconDirUri, `${name}.png`);
          const out = await resolveOutput(outUri);
          await mkdir(join(out.localPath, '..'), { recursive: true });
          await magick([
            logoLocalPath,
            '-resize',
            `${size}x${size}`,
            '-background',
            background_color,
            '-gravity',
            'center',
            '-extent',
            `${size}x${size}`,
            out.localPath,
          ]);
          await out.commit();
        }
        steps.push(`App icons: ${appIconSizes.length} sizes → ${iconDirUri}/`);

        // ── Social card (1200x630) ──
        const socialCardUri = joinUri(output_dir, 'social-card.png');
        const socialCardOut = await resolveOutput(socialCardUri);
        await mkdir(join(socialCardOut.localPath, '..'), { recursive: true });
        const logoResized = tempPath('.png');
        await magick([
          logoLocalPath,
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
          `xc:${effectiveBrandColor}`,
          logoResized,
          '-gravity',
          'center',
          '-geometry',
          effectiveBrandName ? '+0-60' : '+0+0',
          '-composite',
        ];
        if (effectiveBrandName) {
          socialArgs.push('-fill', 'white', '-pointsize', '48', '-gravity', 'south');
          if (brandFontR) socialArgs.push('-font', brandFontR.localPath);
          socialArgs.push('-annotate', '+0+80', effectiveBrandName);
        }
        socialArgs.push(socialCardOut.localPath);
        await magick(socialArgs);

        // ── OG image (copy of social card) ──
        // Copy locally BEFORE commit so the temp file still exists.
        const ogImageUri = joinUri(output_dir, 'og-image.png');
        const ogOut = await resolveOutput(ogImageUri);
        await mkdir(join(ogOut.localPath, '..'), { recursive: true });
        await copyFile(socialCardOut.localPath, ogOut.localPath);
        await socialCardOut.commit();
        await ogOut.commit();
        steps.push(`Social card (1200x630) → ${socialCardUri}`);
        steps.push(`OG image (1200x630) → ${ogImageUri}`);

        const totalAssets = faviconSizes.length + appIconSizes.length + 2;
        return {
          content: [
            {
              type: 'text',
              text: `Brand asset pack complete — ${totalAssets} assets generated:\n${steps.join('\n')}`,
            },
          ],
        };
      } finally {
        await logoStaged.cleanup();
        await brandFontR?.cleanup?.();
      }
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
      const resolvedImages = await Promise.all(images.map((i) => resolveInput(i)));
      // Font fallback: explicit font_file > brand spec regular.
      const effectiveFontFile = font_file ?? loadBrandSpec()?.fonts?.regular;
      const fontR = effectiveFontFile ? await resolveInput(effectiveFontFile) : null;
      const steps: string[] = [];

      try {
        for (let i = 0; i < resolvedImages.length; i++) {
          const slideNum = i + 1;
          const outUri = joinUri(output_dir, `slide_${slideNum}.png`);
          const out = await resolveOutput(outUri);
          await mkdir(join(out.localPath, '..'), { recursive: true });

          const resizeArgs = [
            resolvedImages[i].localPath,
            '-resize',
            `${width}x${height}^`,
            '-gravity',
            'center',
            '-extent',
            `${width}x${height}`,
          ];

          if (captions?.[i]) {
            const barHeight = caption_font_size * 2.5;
            const fontArgs = fontR ? ['-font', fontR.localPath] : [];
            resizeArgs.push(
              '-fill',
              caption_background,
              '-draw',
              `rectangle 0,${height - barHeight},${width},${height}`,
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

          resizeArgs.push(out.localPath);
          await magick(resizeArgs);
          await out.commit();
          steps.push(`Slide ${slideNum}: ${outUri}${captions?.[i] ? ` — "${captions[i]}"` : ''}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Social carousel complete — ${images.length} slides (${width}x${height}):\n${steps.join('\n')}`,
            },
          ],
        };
      } finally {
        await Promise.all(resolvedImages.map((r) => r.cleanup?.()));
        await fontR?.cleanup?.();
      }
    },
  );

  // ── workflow_carousel_compose ─────────────────────────────────────────
  registerTool<CarouselComposeParams>(
    server,
    'workflow_carousel_compose',
    'Compose multi-element carousel slides from a declarative spec. Each slide takes a background (color or image) + ordered text/rect/line/image elements. One call replaces dozens of manual overlay steps. Supports local and gs:// output dirs.',
    carouselComposeSchema.shape,
    async ({ slides, output_dir, width, height, brand, filename_pattern }) => {
      // Font resolution: explicit brand.font param > ARTIFICER_BRAND_SPEC.fonts.regular.
      const defaultFont = brand?.font ?? loadBrandSpec()?.fonts?.regular;
      const defaultFontR = defaultFont ? await resolveInput(defaultFont) : null;
      // Pre-resolve all image sources (background + element images) to avoid
      // repeated downloads for the same URI.
      const imageCache = new Map<string, Awaited<ReturnType<typeof resolveInput>>>();
      const resolveImageCached = async (
        uri: string,
      ): Promise<Awaited<ReturnType<typeof resolveInput>>> => {
        const cached = imageCache.get(uri);
        if (cached) return cached;
        const r = await resolveInput(uri);
        imageCache.set(uri, r);
        return r;
      };

      const steps: string[] = [];
      try {
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          const slideNum = i + 1;
          const filename = formatFilename(filename_pattern ?? 'slide_{n:02d}.png', slideNum);
          const outUri = joinUri(output_dir, filename);
          const out = await resolveOutput(outUri);
          await mkdir(join(out.localPath, '..'), { recursive: true });

          const args: string[] = [];

          // Background layer
          if (slide.background.type === 'color') {
            args.push('-size', `${width}x${height}`, `xc:${slide.background.color}`);
          } else {
            const bgR = await resolveImageCached(slide.background.source);
            args.push(
              bgR.localPath,
              '-resize',
              `${width}x${height}^`,
              '-gravity',
              'center',
              '-extent',
              `${width}x${height}`,
            );
            if (slide.background.overlay_color) {
              args.push(
                '(',
                '-size',
                `${width}x${height}`,
                `xc:${slide.background.overlay_color}`,
                ')',
                '-compose',
                'Over',
                '-composite',
              );
            }
          }

          // Elements in order
          for (const el of slide.elements) {
            if (el.type === 'text') {
              const fontPath =
                el.font !== undefined
                  ? (await resolveImageCached(el.font)).localPath
                  : defaultFontR?.localPath;
              const effectiveColor = resolveColor(el.color) ?? 'black';

              if (el.box_width && el.box_height) {
                const fontArgs = fontPath ? ['-font', fontPath] : [];
                // Inside the box, align text according to the same gravity the
                // user picked for placement (NorthWest → left-aligned, Center →
                // center-aligned, etc.). Placement gravity is the user's gravity,
                // not hardcoded NorthWest.
                args.push(
                  '(',
                  '-size',
                  `${el.box_width}x${el.box_height}`,
                  '-background',
                  el.background ?? 'none',
                  '-fill',
                  effectiveColor,
                  ...fontArgs,
                  '-pointsize',
                  String(el.font_size),
                  '-gravity',
                  el.gravity,
                  `caption:${el.content}`,
                  ')',
                  '-gravity',
                  el.gravity,
                  '-geometry',
                  `+${el.x}+${el.y}`,
                  '-composite',
                );
              } else {
                args.push('-gravity', el.gravity);
                if (fontPath) args.push('-font', fontPath);
                args.push('-pointsize', String(el.font_size), '-fill', effectiveColor);
                if (el.stroke_color) {
                  args.push('-stroke', el.stroke_color);
                  args.push('-strokewidth', String(el.stroke_width ?? 1));
                } else {
                  args.push('-stroke', 'none');
                }
                if (el.background) args.push('-undercolor', el.background);
                args.push('-annotate', `+${el.x}+${el.y}`, el.content);
              }
            } else if (el.type === 'rect') {
              args.push('-stroke', 'none', '-fill', el.color);
              if (el.corner_radius) {
                args.push(
                  '-draw',
                  `roundrectangle ${el.x},${el.y},${el.x + el.width - 1},${el.y + el.height - 1},${el.corner_radius},${el.corner_radius}`,
                );
              } else {
                args.push(
                  '-draw',
                  `rectangle ${el.x},${el.y},${el.x + el.width - 1},${el.y + el.height - 1}`,
                );
              }
            } else if (el.type === 'line') {
              args.push(
                '-stroke',
                el.color,
                '-strokewidth',
                String(el.width),
                '-fill',
                'none',
                '-draw',
                `line ${el.x1},${el.y1} ${el.x2},${el.y2}`,
              );
            } else if (el.type === 'image') {
              const imgR = await resolveImageCached(el.source);
              const resizeArgs =
                el.width && el.height
                  ? ['-resize', `${el.width}x${el.height}!`]
                  : el.width
                    ? ['-resize', `${el.width}x`]
                    : el.height
                      ? ['-resize', `x${el.height}`]
                      : [];
              args.push(
                '(',
                imgR.localPath,
                ...resizeArgs,
                ')',
                '-gravity',
                'NorthWest',
                '-geometry',
                `+${el.x}+${el.y}`,
                '-composite',
              );
            }
          }

          args.push(out.localPath);
          await magick(args);
          await out.commit();
          steps.push(`Slide ${slideNum} (${slide.elements.length} elements) → ${outUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Carousel composed — ${slides.length} slides (${width}x${height}):\n${steps.join('\n')}`,
            },
          ],
        };
      } finally {
        await defaultFontR?.cleanup?.();
        await Promise.all([...imageCache.values()].map((r) => r.cleanup?.()));
      }
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
          '-ar',
          '48000',
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
      const bgR = await resolveInput(background);
      const fontR = font_file ? await resolveInput(font_file) : null;
      const steps: string[] = [];
      try {
        for (const { name, w, h } of bannerSizes) {
          const outUri = joinUri(output_dir, `banner_${name}_${w}x${h}.png`);
          const out = await resolveOutput(outUri);
          await mkdir(join(out.localPath, '..'), { recursive: true });

          const minDim = Math.min(w, h);
          const headlineSize = Math.max(12, Math.round(minDim * 0.25));
          const ctaFontSize = Math.max(10, Math.round(minDim * 0.18));
          const ctaPadX = Math.round(ctaFontSize * 0.8);
          const ctaPadY = Math.round(ctaFontSize * 0.4);
          const ctaW = cta_text.length * ctaFontSize * 0.6 + ctaPadX * 2;
          const ctaH = ctaFontSize + ctaPadY * 2;

          const fontArgs = fontR ? ['-font', fontR.localPath] : [];

          await magick([
            bgR.localPath,
            '-resize',
            `${w}x${h}^`,
            '-gravity',
            'center',
            '-extent',
            `${w}x${h}`,
            '(',
            '-size',
            `${w}x${h}`,
            'xc:#00000060',
            ')',
            '-composite',
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
            '-fill',
            cta_background,
            '-draw',
            `roundrectangle ${Math.round(w / 2 - ctaW / 2)},${Math.round(h * 0.6)},${Math.round(w / 2 + ctaW / 2)},${Math.round(h * 0.6 + ctaH)},6,6`,
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
            out.localPath,
          ]);
          await out.commit();
          steps.push(`${name} (${w}x${h}) → ${outUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Ad creative set complete — ${bannerSizes.length} banners:\n${steps.join('\n')}`,
            },
          ],
        };
      } finally {
        await bgR.cleanup?.();
        await fontR?.cleanup?.();
      }
    },
  );

  // ── 9:16 short-video workflows ───────────────────────────────────────
  // IG Reel / TikTok / YT Short / FB Reel all share identical encoding
  // (1080×1920 H.264+AAC 48kHz 30fps LUFS -14). The only real deltas are
  // naming + the summary banner, so all four thin-wrap `composeShortVideo`.
  registerTool<IgReelParams>(
    server,
    'workflow_ig_reel',
    'Compose a finished Instagram Reel (1080×1920, H.264+AAC 48kHz, 30fps) from body clips + optional title/end cards, captions, watermark, and music bed. Target: -14 LUFS. Handles clip normalization, concat with transitions, audio ducking under dialogue, loudness normalization, and platform-spec encoding. One call replaces ~10 ffmpeg invocations.',
    igReelSchema.shape,
    async (params) => composeShortVideo(params, 'IG Reel'),
  );

  registerTool<IgReelParams>(
    server,
    'workflow_tiktok_reel',
    'Compose a finished TikTok video (1080×1920, H.264+AAC 48kHz, 30fps) from body clips + optional title/end cards, captions, watermark, and music bed. Target: -14 LUFS. TikTok accepts up to 10 minutes but most perform best at 15–60s. Same encoding as workflow_ig_reel — pick this tool name for clarity when authoring TikTok-specific content.',
    igReelSchema.shape,
    async (params) => composeShortVideo(params, 'TikTok video'),
  );

  registerTool<IgReelParams>(
    server,
    'workflow_yt_short',
    'Compose a finished YouTube Short (1080×1920, H.264+AAC 48kHz, 30fps) from body clips + optional title/end cards, captions, watermark, and music bed. Target: -14 LUFS. HARD limit: 60 seconds — pass an end_card CTA (subscribe / watch more) for best retention. Same encoding as workflow_ig_reel.',
    igReelSchema.shape,
    async (params) => composeShortVideo(params, 'YT Short'),
  );

  registerTool<IgReelParams>(
    server,
    'workflow_fb_reel',
    'Compose a finished Facebook Reel (1080×1920, H.264+AAC 48kHz, 30fps) from body clips + optional title/end cards, captions, watermark, and music bed. Target: -14 LUFS. FB Reels cap at 90 seconds. Same encoding as workflow_ig_reel.',
    igReelSchema.shape,
    async (params) => composeShortVideo(params, 'FB Reel'),
  );

  // ── workflow_narrated_explainer ─────────────────────────────────────────
  registerTool<NarratedExplainerParams>(
    server,
    'workflow_narrated_explainer',
    'Compose a finished narrated-explainer reel (9:16, H.264+AAC 48kHz, 30fps) from a narration script + ordered still-image visuals. Auto-generates TTS narration (Gemini TTS) and a music bed (Lyria 3 batch) when not provided, applies ken-burns slow zoom on each visual, crossfades between them, ducks the music under the voice (sidechain), and normalizes to LUFS. Use for Baker Math Monday / tip-of-the-day / myth-bust formats where you do not have a talking-head clip. Outputs a single MP4 via the same encoder as workflow_ig_reel.',
    narratedExplainerSchema.shape,
    async (params) => composeNarratedExplainer(params),
  );
}

/**
 * Shared implementation for all 9:16 short-video workflows (IG Reel, TikTok,
 * YT Short, FB Reel). Platform differences are cosmetic at the encoding
 * layer, so the only caller-controlled delta is the `platformLabel` used in
 * the completion banner.
 */
async function composeShortVideo(
  params: IgReelParams,
  platformLabel: string,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const {
    clips,
    output,
    title_card,
    end_card,
    transition,
    transition_duration,
    captions_srt,
    watermark,
    music,
    normalize_lufs,
    fps,
  } = params;
  const W = 1080;
  const H = 1920;
  const steps: string[] = [];
  const temps: string[] = [];
  const inputHandles: Array<Awaited<ReturnType<typeof resolveInput>>> = [];
  const tmp = (ext: string): string => {
    const p = tempPath(ext);
    temps.push(p);
    return p;
  };
  const resolveLocal = async (uri: string): Promise<string> => {
    const r = await resolveInput(uri);
    inputHandles.push(r);
    return r.localPath;
  };
  const out = await resolveOutput(output);
  await mkdir(dirname(out.localPath), { recursive: true });

  try {
    // Stage 1: normalize each body clip to 1080×1920 @ fps, yuv420p
    const normalizedClips: string[] = [];
    for (const clip of clips) {
      const clipLocal = await resolveLocal(clip);
      const outClip = tmp('.mp4');
      await ffmpegBatch([
        '-y',
        '-i',
        clipLocal,
        '-vf',
        `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${fps},format=yuv420p`,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        outClip,
      ]);
      normalizedClips.push(outClip);
    }
    steps.push(`Normalized ${clips.length} clip(s) to ${W}×${H} @ ${fps}fps`);

    // Stage 2: render title + end cards as video clips (same codec/resolution
    // as body). When `transition` is set these become xfade segments too, so
    // the reel has smooth crossfades into and out of the body — not just
    // between body clips.
    const encodeCard = async (
      card: NonNullable<typeof title_card>,
      label: string,
    ): Promise<string> => {
      const cardVideo = tmp('.mp4');
      const imgLocal = await resolveLocal(card.image);
      const audioLocal = card.audio ? await resolveLocal(card.audio) : null;
      const args = ['-y', '-loop', '1', '-i', imgLocal];
      if (audioLocal) {
        args.push('-i', audioLocal);
      } else {
        args.splice(args.indexOf('-y') + 1, 0, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
      }
      args.push(
        '-vf',
        `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,format=yuv420p`,
        '-r',
        String(fps),
        '-t',
        String(card.duration_seconds),
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        '-shortest',
        cardVideo,
      );
      await ffmpegBatch(args);
      steps.push(`${label}: ${card.duration_seconds}s`);
      return cardVideo;
    };

    const titleClip = title_card ? await encodeCard(title_card, 'Title card') : null;
    const endClip = end_card ? await encodeCard(end_card, 'End card') : null;

    // Stage 3: assemble all segments — [title?, ...body, end?] — with xfade
    // when transition is set, or concat demuxer for hard cuts.
    const allClips: string[] = [];
    const allDurations: number[] = [];
    if (titleClip && title_card) {
      allClips.push(titleClip);
      allDurations.push(title_card.duration_seconds);
    }
    for (const c of normalizedClips) {
      allClips.push(c);
      const info = await getVideoInfo(c);
      allDurations.push(info.durationSeconds ?? 0);
    }
    if (endClip && end_card) {
      allClips.push(endClip);
      allDurations.push(end_card.duration_seconds);
    }

    let assembled: string;
    if (allClips.length === 1) {
      assembled = allClips[0];
    } else if (transition) {
      // xfade chain across every segment boundary.
      assembled = tmp('.mp4');
      const parts: string[] = [];
      let offset = allDurations[0] - transition_duration;
      parts.push(
        `[0:v][1:v]xfade=transition=${transition}:duration=${transition_duration}:offset=${offset}[v01]`,
      );
      parts.push(`[0:a][1:a]acrossfade=d=${transition_duration}[a01]`);
      for (let i = 2; i < allClips.length; i++) {
        offset += allDurations[i - 1] - transition_duration;
        const inV = i === 2 ? '[v01]' : `[v0${i - 1}]`;
        const inA = i === 2 ? '[a01]' : `[a0${i - 1}]`;
        const outV = `[v0${i}]`;
        const outA = `[a0${i}]`;
        parts.push(
          `${inV}[${i}:v]xfade=transition=${transition}:duration=${transition_duration}:offset=${offset}${outV}`,
        );
        parts.push(`${inA}[${i}:a]acrossfade=d=${transition_duration}${outA}`);
      }
      const lastIdx = allClips.length - 1;
      const finalV = lastIdx === 1 ? '[v01]' : `[v0${lastIdx}]`;
      const finalA = lastIdx === 1 ? '[a01]' : `[a0${lastIdx}]`;
      const ffArgs = ['-y'];
      for (const c of allClips) ffArgs.push('-i', c);
      ffArgs.push(
        '-filter_complex',
        parts.join(';'),
        '-map',
        finalV,
        '-map',
        finalA,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        assembled,
      );
      await ffmpegBatch(ffArgs);
      steps.push(`Joined ${allClips.length} segment(s) with "${transition}" transitions`);
    } else {
      // Concat demuxer for hard cuts across all segments.
      assembled = tmp('.mp4');
      const manifest = tmp('.txt');
      await writeFile(manifest, allClips.map((p) => `file ${escapeConcatPath(p)}`).join('\n'));
      await ffmpegBatch([
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        manifest,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        assembled,
      ]);
      steps.push(`Joined ${allClips.length} segment(s) (hard cuts)`);
    }

    // Stage 4: music bed (extract + mix with duck + normalize)
    if (music) {
      // Extract video's audio. Force stereo 48kHz so downstream mixing
      // stays in a single consistent layout regardless of source channel
      // count (TTS voice returns mono; Veo/camera clips may be mono too).
      const voiceAudio = tmp('.m4a');
      await ffmpegBatch([
        '-y',
        '-i',
        assembled,
        '-vn',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        '-ac',
        '2',
        voiceAudio,
      ]);

      // Mix: [voice] + [music * volume], optionally duck music
      const mixedAudio = tmp('.m4a');
      const filterParts: string[] = [];
      filterParts.push('[0:a]anull[a0]');
      filterParts.push(`[1:a]volume=${music.volume}[a1]`);
      let finalMusicLabel = '[a1]';
      if (music.duck_to !== undefined) {
        const ratio = Math.max(2, Math.min(20, Math.abs(music.duck_to) / 2));
        filterParts.push(
          `[a1][a0]sidechaincompress=threshold=0.05:ratio=${ratio}:attack=${Math.round(
            music.duck_attack_ms,
          )}:release=${Math.round(music.duck_release_ms)}:level_sc=1[a1d]`,
        );
        finalMusicLabel = '[a1d]';
      }
      filterParts.push(
        `[a0]${finalMusicLabel}amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]`,
      );
      const musicLocal = await resolveLocal(music.input);
      await ffmpegBatch([
        '-y',
        '-i',
        voiceAudio,
        '-i',
        musicLocal,
        '-filter_complex',
        filterParts.join(';'),
        '-map',
        '[aout]',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        mixedAudio,
      ]);

      // Normalize
      const normAudio = tmp('.m4a');
      await ffmpegBatch([
        '-y',
        '-i',
        mixedAudio,
        '-af',
        `loudnorm=I=${normalize_lufs}:TP=-1:LRA=11`,
        '-c:a',
        'aac',
        '-ar',
        '48000',
        normAudio,
      ]);

      // Mux back
      const muxed = tmp('.mp4');
      await ffmpegBatch([
        '-y',
        '-i',
        assembled,
        '-i',
        normAudio,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        '-shortest',
        muxed,
      ]);
      assembled = muxed;
      steps.push(
        `Music bed mixed${music.duck_to !== undefined ? ` (ducked ${music.duck_to}dB)` : ''} + normalized to ${normalize_lufs} LUFS`,
      );
    } else {
      // Normalize the dialogue-only audio in place
      const norm = tmp('.mp4');
      await ffmpegBatch([
        '-y',
        '-i',
        assembled,
        '-af',
        `loudnorm=I=${normalize_lufs}:TP=-1:LRA=11`,
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        norm,
      ]);
      assembled = norm;
      steps.push(`Audio normalized to ${normalize_lufs} LUFS`);
    }

    // Stage 5: burn captions
    if (captions_srt) {
      const subbed = tmp('.mp4');
      const captionsLocal = await resolveLocal(captions_srt);
      const escaped = escapeSubtitlePath(captionsLocal);
      await ffmpegBatch([
        '-y',
        '-i',
        assembled,
        '-vf',
        `subtitles='${escaped}'`,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'copy',
        subbed,
      ]);
      assembled = subbed;
      steps.push('Captions burned in');
    }

    // Stage 6: watermark
    if (watermark) {
      const wmUri = resolveWatermark(watermark.image);
      if (!wmUri) {
        throw new Error(
          'watermark specified but no watermark.image provided and no ARTIFICER_BRAND_SPEC.logo fallback configured',
        );
      }
      const wmStaged = await stageLogoForRaster(wmUri, {
        rasterWidth: watermark.width ? watermark.width * 2 : 1024,
      });
      if (!wmStaged.localPath) {
        throw new Error('watermark staging failed');
      }
      const wmLocal = wmStaged.localPath;
      const wmInputArgs = ['-y', '-i', assembled, '-i', wmLocal];
      const wmVf: string[] = [];
      // Resize watermark if requested
      if (watermark.width || watermark.height) {
        const w = watermark.width ?? -1;
        const h = watermark.height ?? -1;
        wmVf.push(`[1:v]scale=${w}:${h}[wm0]`);
      } else {
        wmVf.push('[1:v]null[wm0]');
      }
      // Apply opacity
      if (watermark.opacity < 1) {
        wmVf.push(`[wm0]format=rgba,colorchannelmixer=aa=${watermark.opacity}[wm]`);
      } else {
        wmVf.push('[wm0]null[wm]');
      }
      // Compute overlay position from gravity
      const posExpr = gravityToOverlayExpr(watermark.gravity, watermark.x, watermark.y);
      wmVf.push(`[0:v][wm]overlay=${posExpr}[vout]`);

      wmInputArgs.push(
        '-filter_complex',
        wmVf.join(';'),
        '-map',
        '[vout]',
        '-map',
        '0:a?',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'copy',
      );
      const wmOut = tmp('.mp4');
      wmInputArgs.push(wmOut);
      try {
        await ffmpegBatch(wmInputArgs);
      } finally {
        await wmStaged.cleanup();
      }
      assembled = wmOut;
      steps.push(`Watermark overlaid (${watermark.gravity})`);
    }

    // Stage 7: copy to final output (local staging, then commit)
    await ffmpegBatch(['-y', '-i', assembled, '-c', 'copy', out.localPath]);
    await out.commit();

    return {
      content: [
        {
          type: 'text',
          text: `${platformLabel} composed (${W}×${H} @ ${fps}fps) → ${output}:\n${steps.join('\n')}`,
        },
      ],
    };
  } finally {
    // Clean up all temp files + input handles
    await Promise.all(temps.map((t) => rm(t, { force: true }).catch(() => {})));
    await Promise.all(inputHandles.map((h) => h.cleanup?.()));
  }
}

/**
 * Compose a finished narrated-explainer reel:
 *   1. TTS → voiceover WAV (duration sets the whole reel)
 *   2. Lyria 3 → music bed MP3 (or use music_input)
 *   3. For each visual: image → silent video clip (optional ken-burns zoom)
 *   4. Concat visuals with xfade, held to voiceover duration
 *   5. Mux voiceover onto the visual track → single body clip
 *   6. Hand off to composeShortVideo for music mixing, LUFS normalize,
 *      title/end cards, watermark, final mux.
 */
async function composeNarratedExplainer(
  params: NarratedExplainerParams,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const {
    narration_text,
    voice,
    style,
    tts_model,
    music_prompt,
    music_input,
    music_model,
    music_volume,
    music_duck_to,
    music_duck_attack_ms,
    music_duck_release_ms,
    visuals,
    ken_burns,
    output,
    title_card,
    end_card,
    watermark,
    transition,
    transition_duration,
    fps,
    normalize_lufs,
    width: W,
    height: H,
  } = params;

  const brandSpec = loadBrandSpec();
  const temps: string[] = [];
  const tmp = (ext: string): string => {
    const p = tempPath(ext);
    temps.push(p);
    return p;
  };
  const steps: string[] = [];

  try {
    // Stage 1: TTS → voiceover WAV
    const voiceWav = tmp('.wav');
    const ttsResult = await generateSpeechToFile({
      model: tts_model,
      text: narration_text,
      output: voiceWav,
      voice,
      style,
    });
    const voiceDuration = ttsResult.durationSeconds;
    steps.push(`Voiceover (${ttsResult.voice}, ${voiceDuration.toFixed(1)}s)`);

    // Stage 2: music bed — either generate or use provided file
    let musicPath: string;
    if (music_input) {
      const r = await resolveInput(music_input);
      // Caller-owned input — commit local path, cleanup handle below via try/finally.
      musicPath = r.localPath;
      temps.push(musicPath); // ensure cleanup even though it may be a real file — harmless rm
      steps.push(`Music bed: provided (${music_input})`);
    } else {
      const promptToUse = music_prompt ?? brandSpec?.music?.default_prompt;
      if (!promptToUse) {
        throw new Error(
          'No music_input and no music_prompt — also no ARTIFICER_BRAND_SPEC.music.default_prompt fallback configured.',
        );
      }
      const musicOut = tmp('.mp3');
      await generateMusicBatchToFile({
        model: music_model,
        prompt: promptToUse,
        output: musicOut,
      });
      musicPath = musicOut;
      steps.push(`Music bed generated (${music_model})`);
    }

    // Stage 3: visuals → silent video clips. Split voiceDuration evenly,
    // with xfade overlap if transitions are enabled.
    const n = visuals.length;
    const perClip = transition
      ? voiceDuration / n + transition_duration * ((n - 1) / n)
      : voiceDuration / n;
    const visualInputHandles: Array<Awaited<ReturnType<typeof resolveInput>>> = [];
    const visualClips: string[] = [];
    for (let i = 0; i < n; i++) {
      const r = await resolveInput(visuals[i]);
      visualInputHandles.push(r);
      const outClip = tmp('.mp4');
      const vf = ken_burns
        ? // Ken-burns: scale up + slow zoompan (~1.0 → 1.10 across the clip).
          `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},zoompan=z='min(zoom+0.0015,1.10)':d=${Math.max(1, Math.round(perClip * fps))}:s=${W}x${H}:fps=${fps},format=yuv420p`
        : `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${fps},format=yuv420p`;
      await ffmpegBatch([
        '-y',
        '-loop',
        '1',
        '-i',
        r.localPath,
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=48000:cl=stereo',
        '-vf',
        vf,
        '-t',
        String(perClip),
        '-r',
        String(fps),
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-ar',
        '48000',
        '-shortest',
        outClip,
      ]);
      visualClips.push(outClip);
    }
    steps.push(
      `${n} visual clip(s) @ ${perClip.toFixed(2)}s each${ken_burns ? ' (ken-burns)' : ''}`,
    );

    // Stage 4: concat visuals with optional xfade into one silent video
    let visualTrack: string;
    if (visualClips.length === 1) {
      visualTrack = visualClips[0];
    } else if (transition) {
      visualTrack = tmp('.mp4');
      const parts: string[] = [];
      let offset = perClip - transition_duration;
      parts.push(
        `[0:v][1:v]xfade=transition=${transition}:duration=${transition_duration}:offset=${offset}[v01]`,
      );
      for (let i = 2; i < visualClips.length; i++) {
        offset += perClip - transition_duration;
        const inV = i === 2 ? '[v01]' : `[v0${i - 1}]`;
        parts.push(
          `${inV}[${i}:v]xfade=transition=${transition}:duration=${transition_duration}:offset=${offset}[v0${i}]`,
        );
      }
      const finalV = visualClips.length === 2 ? '[v01]' : `[v0${visualClips.length - 1}]`;
      const ffArgs = ['-y'];
      for (const c of visualClips) ffArgs.push('-i', c);
      ffArgs.push(
        '-filter_complex',
        parts.join(';'),
        '-map',
        finalV,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-an',
        visualTrack,
      );
      await ffmpegBatch(ffArgs);
      steps.push(`Visuals crossfaded (${transition}, ${transition_duration}s)`);
    } else {
      visualTrack = tmp('.mp4');
      const manifest = tmp('.txt');
      await writeFile(manifest, visualClips.map((p) => `file ${escapeConcatPath(p)}`).join('\n'));
      await ffmpegBatch([
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        manifest,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-an',
        visualTrack,
      ]);
      steps.push(`Visuals concatenated (hard cuts)`);
    }

    // Stage 5: mux voiceover onto visuals → single body clip. TTS returns
    // mono at 24kHz; upmix to stereo 48kHz here so all downstream mixing
    // stays in a single consistent layout.
    const bodyWithVoice = tmp('.mp4');
    await ffmpegBatch([
      '-y',
      '-i',
      visualTrack,
      '-i',
      voiceWav,
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-shortest',
      bodyWithVoice,
    ]);

    // Clean up pre-delegation handles.
    await Promise.all(visualInputHandles.map((h) => h.cleanup?.()));

    // Stage 6: delegate to composeShortVideo for music mix + LUFS + cards + watermark
    const ig = await composeShortVideo(
      {
        clips: [bodyWithVoice],
        output,
        title_card,
        end_card,
        transition,
        transition_duration,
        watermark,
        music: {
          input: musicPath,
          volume: music_volume,
          duck_to: music_duck_to,
          duck_attack_ms: music_duck_attack_ms,
          duck_release_ms: music_duck_release_ms,
        },
        normalize_lufs,
        fps,
      } as IgReelParams,
      'Narrated explainer',
    );

    return {
      content: [
        {
          type: 'text',
          text: `${ig.content[0].text}\n\nPre-mix stages:\n${steps.join('\n')}`,
        },
      ],
    };
  } finally {
    await Promise.all(temps.map((t) => rm(t, { force: true }).catch(() => {})));
  }
}

/**
 * Map an ImageMagick-style gravity string + x/y offset to an FFmpeg overlay
 * position expression. The overlay filter uses W/H/w/h variables.
 */
function gravityToOverlayExpr(gravity: string, x: number, y: number): string {
  switch (gravity) {
    case 'NorthWest':
      return `${x}:${y}`;
    case 'North':
      return `(W-w)/2+${x}:${y}`;
    case 'NorthEast':
      return `W-w-${x}:${y}`;
    case 'West':
      return `${x}:(H-h)/2+${y}`;
    case 'Center':
      return `(W-w)/2+${x}:(H-h)/2+${y}`;
    case 'East':
      return `W-w-${x}:(H-h)/2+${y}`;
    case 'SouthWest':
      return `${x}:H-h-${y}`;
    case 'South':
      return `(W-w)/2+${x}:H-h-${y}`;
    case 'SouthEast':
      return `W-w-${x}:H-h-${y}`;
    default:
      return `${x}:${y}`;
  }
}

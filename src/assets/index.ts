import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  magick,
  magickBatch,
  validateInputFile,
  ensureOutputDir,
  IOS_ICON_SIZES,
  ANDROID_ICON_SIZES,
  ASPECT_RATIOS,
} from '../utils/exec.js';
import { resolveInput, resolveOutput, joinUri, uriStem } from '../utils/resource.js';
import { registerTool } from '../utils/register.js';
import {
  type ResponsiveSetParams,
  type FaviconSetParams,
  type AppIconSetParams,
  type SplashScreenParams,
  type SpriteSheetParams,
  type NinePatchParams,
  type AspectCropSetParams,
  type PdfToImageParams,
  type ImageDiffParams,
  type OptimizeBatchParams,
  responsiveSetSchema,
  faviconSetSchema,
  appIconSetSchema,
  splashScreenSchema,
  spriteSheetSchema,
  ninePatchSchema,
  aspectCropSetSchema,
  pdfToImageSchema,
  imageDiffSchema,
  optimizeBatchSchema,
} from './types.js';
import { join, parse } from 'node:path';
import { readdir, stat } from 'node:fs/promises';

/**
 * Register web and mobile asset tools with the MCP server.
 */
export function registerAssetTools(server: McpServer): void {
  // ── responsive-set ──────────────────────────────────────────────────────
  registerTool<ResponsiveSetParams>(
    server,
    'responsive-set',
    'Generate srcset variants (400w, 800w, 1200w, 1600w, 2400w) from one source image for responsive web',
    responsiveSetSchema.shape,
    async (params: ResponsiveSetParams) => {
      const { input, output_dir, widths, format, quality, generate_2x } = params;
      const inR = await resolveInput(input);
      const stem = uriStem(input);
      const generated: string[] = [];
      try {
        for (const w of widths) {
          const outUri = joinUri(output_dir, `${stem}_${w}w.${format}`);
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);
          await magick([
            inR.localPath,
            '-resize',
            `${w}x`,
            '-quality',
            String(quality),
            '-strip',
            out.localPath,
          ]);
          await out.commit();
          generated.push(`${w}w: ${outUri}`);

          if (generate_2x) {
            const outUri2x = joinUri(output_dir, `${stem}_${w}w@2x.${format}`);
            const out2x = await resolveOutput(outUri2x);
            await ensureOutputDir(out2x.localPath);
            await magick([
              inR.localPath,
              '-resize',
              `${w * 2}x`,
              '-quality',
              String(quality),
              '-strip',
              out2x.localPath,
            ]);
            await out2x.commit();
            generated.push(`${w}w@2x: ${outUri2x}`);
          }
        }

        const srcset = widths.map((w) => `${stem}_${w}w.${format} ${w}w`).join(', ');

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} responsive variants:\n${generated.join('\n')}\n\nsrcset="${srcset}"`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── favicon-set ─────────────────────────────────────────────────────────
  registerTool<FaviconSetParams>(
    server,
    'favicon-set',
    'Generate all favicon sizes from one source image (16, 32, 48, 180, 192, 512) plus ICO bundle',
    faviconSetSchema.shape,
    async (params: FaviconSetParams) => {
      const { input, output_dir, sizes, generate_ico } = params;
      const inR = await resolveInput(input);
      const generated: string[] = [];
      const icoLocalPaths: string[] = [];
      try {
        for (const size of sizes) {
          const name = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
          const outUri = joinUri(output_dir, name);
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);
          await magick([inR.localPath, '-resize', `${size}x${size}!`, '-strip', out.localPath]);
          await out.commit();
          generated.push(`${size}x${size}: ${outUri}`);
          if (size <= 48) icoLocalPaths.push(out.localPath);
        }

        if (generate_ico) {
          const icoUri = joinUri(output_dir, 'favicon.ico');
          const icoOut = await resolveOutput(icoUri);
          await ensureOutputDir(icoOut.localPath);
          // For remote URIs, we'd have committed PNGs already; for local paths
          // they still exist. Either way, pass local paths to magick.
          await magick([...icoLocalPaths, icoOut.localPath]);
          await icoOut.commit();
          generated.push(`ICO bundle: ${icoUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} favicon files:\n${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── app-icon-set ────────────────────────────────────────────────────────
  registerTool<AppIconSetParams>(
    server,
    'app-icon-set',
    'Generate iOS and Android app icon sets from one source image',
    appIconSetSchema.shape,
    async (params: AppIconSetParams) => {
      const { input, output_dir, platforms } = params;
      const inR = await resolveInput(input);
      const generated: string[] = [];
      try {
        if (platforms.includes('ios')) {
          const iosDirUri = joinUri(output_dir, 'ios');

          for (const icon of IOS_ICON_SIZES) {
            for (const scale of icon.scales) {
              const px = Math.round(icon.size * scale);
              const name = `icon_${icon.size}pt@${scale}x.png`;
              const outUri = joinUri(iosDirUri, name);
              const out = await resolveOutput(outUri);
              await ensureOutputDir(out.localPath);
              await magick([inR.localPath, '-resize', `${px}x${px}!`, '-strip', out.localPath]);
              await out.commit();
              generated.push(`iOS ${icon.size}pt@${scale}x (${px}px): ${outUri}`);
            }
          }
        }

        if (platforms.includes('android')) {
          const androidDirUri = joinUri(output_dir, 'android');

          for (const [density, px] of Object.entries(ANDROID_ICON_SIZES)) {
            const densityDirUri = joinUri(androidDirUri, `mipmap-${density}`);

            const launcherUri = joinUri(densityDirUri, 'ic_launcher.png');
            const launcherOut = await resolveOutput(launcherUri);
            await ensureOutputDir(launcherOut.localPath);
            await magick([
              inR.localPath,
              '-resize',
              `${px}x${px}!`,
              '-strip',
              launcherOut.localPath,
            ]);
            await launcherOut.commit();
            generated.push(`Android ${density} (${px}px): ${launcherUri}`);

            const roundUri = joinUri(densityDirUri, 'ic_launcher_round.png');
            const roundOut = await resolveOutput(roundUri);
            await ensureOutputDir(roundOut.localPath);
            const cx = Math.floor(px / 2);
            await magick([
              '(',
              inR.localPath,
              '-resize',
              `${px}x${px}!`,
              '-alpha',
              'set',
              ')',
              '(',
              '-size',
              `${px}x${px}`,
              'xc:none',
              '-fill',
              'white',
              '-draw',
              `circle ${cx},${cx} ${cx},0`,
              ')',
              '-compose',
              'DstIn',
              '-composite',
              '-strip',
              roundOut.localPath,
            ]);
            await roundOut.commit();
            generated.push(`Android ${density} round (${px}px): ${roundUri}`);
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} app icons:\n${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── splash-screen ───────────────────────────────────────────────────────
  registerTool<SplashScreenParams>(
    server,
    'splash-screen',
    'Generate splash/launch screen images for all common device sizes',
    splashScreenSchema.shape,
    async (params: SplashScreenParams) => {
      const { input, output_dir, background_color, mode, sizes } = params;
      const inR = await resolveInput(input);
      const generated: string[] = [];
      try {
        for (const screen of sizes) {
          const outUri = joinUri(
            output_dir,
            `splash_${screen.name}_${screen.width}x${screen.height}.png`,
          );
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);

          if (mode === 'cover') {
            await magick([
              inR.localPath,
              '-resize',
              `${screen.width}x${screen.height}^`,
              '-gravity',
              'center',
              '-extent',
              `${screen.width}x${screen.height}`,
              out.localPath,
            ]);
          } else {
            const logoSize = Math.floor(Math.min(screen.width, screen.height) * 0.3);
            await magick([
              '-size',
              `${screen.width}x${screen.height}`,
              `xc:${background_color}`,
              '(',
              inR.localPath,
              '-resize',
              `${logoSize}x${logoSize}`,
              ')',
              '-gravity',
              'Center',
              '-composite',
              out.localPath,
            ]);
          }
          await out.commit();

          generated.push(`${screen.name} (${screen.width}x${screen.height}): ${outUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} splash screens:\n${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── sprite-sheet ────────────────────────────────────────────────────────
  registerTool<SpriteSheetParams>(
    server,
    'sprite-sheet',
    'Combine multiple small images into one sprite sheet with CSS offset data for web performance',
    spriteSheetSchema.shape,
    async (params: SpriteSheetParams) => {
      const { inputs, output, tile_size, columns, padding, background } = params;
      const resolvedInputs = await Promise.all(inputs.map((i) => resolveInput(i)));
      const out = await resolveOutput(output);
      try {
        await ensureOutputDir(out.localPath);

        const args = ['montage'];
        args.push(...resolvedInputs.map((r) => r.localPath));
        args.push(
          '-geometry',
          `${tile_size}x${tile_size}+${padding}+${padding}`,
          '-tile',
          `${columns}x`,
          '-background',
          background,
          out.localPath,
        );

        await magickBatch(args);
        await out.commit();

        const cssOffsets: string[] = [];
        for (let i = 0; i < inputs.length; i++) {
          const col = i % columns;
          const row = Math.floor(i / columns);
          const x = col * (tile_size + padding * 2);
          const y = row * (tile_size + padding * 2);
          const name = uriStem(inputs[i]);
          cssOffsets.push(
            `.sprite-${name} { background-position: -${x}px -${y}px; width: ${tile_size}px; height: ${tile_size}px; }`,
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: `Sprite sheet (${inputs.length} sprites): ${output}\n\nCSS offsets:\n${cssOffsets.join('\n')}`,
            },
          ],
        };
      } finally {
        await Promise.all(resolvedInputs.map((r) => r.cleanup?.()));
      }
    },
  );

  // ── nine-patch ──────────────────────────────────────────────────────────
  registerTool<NinePatchParams>(
    server,
    'nine-patch',
    'Generate an Android 9-patch image with stretch region markers',
    ninePatchSchema.shape,
    async (params: NinePatchParams) => {
      const {
        input,
        output,
        stretch_x_start,
        stretch_x_end,
        stretch_y_start,
        stretch_y_end,
        padding_left,
        padding_top,
        padding_right,
        padding_bottom,
      } = params;
      const inR = await resolveInput(input);
      const outUri = output ?? input.replace(/\.[^.]+$/, '.9.png');
      const out = await resolveOutput(outUri);
      try {
        await ensureOutputDir(out.localPath);

        const info = await magick(['identify', '-format', '%wx%h', inR.localPath]);
        const [w, h] = info.trim().split('x').map(Number);

        const newW = w + 2;
        const newH = h + 2;

        const args = [
          '-size',
          `${newW}x${newH}`,
          'xc:none',
          inR.localPath,
          '-gravity',
          'NorthWest',
          '-geometry',
          '+1+1',
          '-composite',
          '-fill',
          'black',
          '-draw',
          `line ${stretch_x_start + 1},0 ${stretch_x_end + 1},0`,
          '-draw',
          `line 0,${stretch_y_start + 1} 0,${stretch_y_end + 1}`,
        ];

        if (padding_left > 0 || padding_right > 0 || padding_top > 0 || padding_bottom > 0) {
          const contentLeft = padding_left + 1;
          const contentRight = newW - 1 - padding_right;
          const contentTop = padding_top + 1;
          const contentBottom = newH - 1 - padding_bottom;
          args.push(
            '-draw',
            `line ${contentLeft},${newH - 1} ${contentRight},${newH - 1}`,
            '-draw',
            `line ${newW - 1},${contentTop} ${newW - 1},${contentBottom}`,
          );
        }

        args.push(out.localPath);
        await magick(args);
        await out.commit();
        return {
          content: [{ type: 'text', text: `9-patch created (${newW}x${newH}): ${outUri}` }],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── aspect-crop-set ─────────────────────────────────────────────────────
  registerTool<AspectCropSetParams>(
    server,
    'aspect-crop-set',
    'Generate one image cropped to all common aspect ratios (1:1, 4:5, 9:16, 16:9, 3:2) with smart focal point',
    aspectCropSetSchema.shape,
    async (params: AspectCropSetParams) => {
      const { input, output_dir, ratios, max_dimension, format } = params;
      const inR = await resolveInput(input);
      const stem = uriStem(input);
      const inputExt = input.match(/\.([^.]+)$/)?.[1] ?? 'png';
      const ext = format ?? inputExt;
      const generated: string[] = [];
      try {
        for (const ratio of ratios) {
          const ar = ASPECT_RATIOS[ratio];
          if (!ar) continue;

          let w: number, h: number;
          if (ar.w >= ar.h) {
            w = max_dimension;
            h = Math.round((max_dimension * ar.h) / ar.w);
          } else {
            h = max_dimension;
            w = Math.round((max_dimension * ar.w) / ar.h);
          }

          const ratioName = ratio.replace(':', 'x');
          const outUri = joinUri(output_dir, `${stem}_${ratioName}.${ext}`);
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);

          await magick([
            inR.localPath,
            '-resize',
            `${w}x${h}^`,
            '-gravity',
            'center',
            '-extent',
            `${w}x${h}`,
            out.localPath,
          ]);
          await out.commit();

          generated.push(`${ratio} (${w}x${h}): ${outUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} aspect ratio crops:\n${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── pdf-to-image ────────────────────────────────────────────────────────
  // Note: PDF multi-page output pattern (%03d) is ImageMagick-native and writes
  // locally. For remote output_dir, we'd need to enumerate locally-produced
  // files and upload each. Kept local-first for now.
  registerTool<PdfToImageParams>(
    server,
    'pdf-to-image',
    'Convert PDF pages to images for web embedding or blog content',
    pdfToImageSchema.shape,
    async (params: PdfToImageParams) => {
      const { input, output_dir, pages, dpi, format, quality } = params;
      await validateInputFile(input);
      await ensureOutputDir(join(output_dir, 'placeholder'));

      const parsed = parse(input);

      let pageSpec: string;
      if (pages === 'all') {
        pageSpec = '';
      } else if (pages.includes('-')) {
        const [start, end] = pages.split('-').map(Number);
        pageSpec = `[${start}-${end}]`;
      } else {
        pageSpec = `[${pages}]`;
      }

      const outPattern = join(output_dir, `${parsed.name}_page_%03d.${format}`);

      await magickBatch([
        '-density',
        String(dpi),
        `${input}${pageSpec}`,
        '-quality',
        String(quality),
        outPattern,
      ]);

      return { content: [{ type: 'text', text: `PDF pages exported to: ${output_dir}` }] };
    },
  );

  // ── image-diff ──────────────────────────────────────────────────────────
  registerTool<ImageDiffParams>(
    server,
    'image-diff',
    'Compare two images and highlight differences — useful for QA, design review, and regression testing',
    imageDiffSchema.shape,
    async (params: ImageDiffParams) => {
      const { image_a, image_b, output, highlight_color, fuzz, mode } = params;
      const aR = await resolveInput(image_a);
      const bR = await resolveInput(image_b);
      const out = await resolveOutput(output);
      try {
        await ensureOutputDir(out.localPath);

        if (mode === 'side-by-side') {
          await magick([
            '(',
            aR.localPath,
            ')',
            '(',
            aR.localPath,
            bR.localPath,
            '-fuzz',
            `${fuzz}%`,
            '-compose',
            'Src',
            '-highlight-color',
            highlight_color,
            '-lowlight-color',
            'white',
            '-compare',
            ')',
            '(',
            bR.localPath,
            ')',
            '+append',
            out.localPath,
          ]);
        } else if (mode === 'overlay') {
          await magick([
            aR.localPath,
            bR.localPath,
            '-compose',
            'Difference',
            '-composite',
            '-auto-level',
            out.localPath,
          ]);
        } else {
          await magick([
            aR.localPath,
            bR.localPath,
            '-fuzz',
            `${fuzz}%`,
            '-compose',
            'Src',
            '-highlight-color',
            highlight_color,
            '-lowlight-color',
            'white',
            '-compare',
            out.localPath,
          ]);
        }
        await out.commit();

        let metrics = '';
        try {
          const result = await magick([
            aR.localPath,
            bR.localPath,
            '-fuzz',
            `${fuzz}%`,
            '-metric',
            'AE',
            '-compare',
            'null:',
          ]);
          metrics = `\nDifferent pixels: ${result.trim()}`;
        } catch {
          /* expected non-zero when images differ */
        }

        return { content: [{ type: 'text', text: `Image diff (${mode}): ${output}${metrics}` }] };
      } finally {
        await aR.cleanup?.();
        await bR.cleanup?.();
      }
    },
  );

  // ── optimize-batch ──────────────────────────────────────────────────────
  // Local-only: uses readdir + stat which are filesystem-specific. If URI
  // support is needed later, swap to provider.list() and commit per-file.
  registerTool<OptimizeBatchParams>(
    server,
    'optimize-batch',
    'Analyze and compress all images in a directory for web — with format recommendations and size reports',
    optimizeBatchSchema.shape,
    async (params: OptimizeBatchParams) => {
      const {
        input_dir,
        output_dir,
        target_format,
        quality,
        max_width,
        strip_metadata,
        recursive,
      } = params;
      await ensureOutputDir(join(output_dir, 'placeholder'));

      const imageExtensions = new Set([
        'png',
        'jpg',
        'jpeg',
        'gif',
        'bmp',
        'tiff',
        'tif',
        'webp',
        'avif',
        'heic',
      ]);

      const entries = await readdir(input_dir, { withFileTypes: true, recursive });
      const files = entries
        .filter(
          (e) => e.isFile() && imageExtensions.has(e.name.split('.').pop()?.toLowerCase() ?? ''),
        )
        .map((e) => join(e.parentPath ?? e.path ?? input_dir, e.name));

      const results: string[] = [];
      let totalOriginal = 0;
      let totalOptimized = 0;

      for (const file of files) {
        const parsed = parse(file);
        const ext = target_format === 'keep' ? parsed.ext.slice(1) : target_format;
        const relativePath = file.replace(input_dir, '').replace(/^[/\\]/, '');
        const outPath = join(output_dir, relativePath.replace(/\.[^.]+$/, `.${ext}`));
        await ensureOutputDir(outPath);

        const args = [file];
        if (max_width) {
          args.push('-resize', `${max_width}x>`);
        }
        args.push('-quality', String(quality));
        if (strip_metadata) {
          args.push('-strip');
        }
        args.push(outPath);

        await magick(args);

        const originalStat = await stat(file);
        const optimizedStat = await stat(outPath);
        totalOriginal += originalStat.size;
        totalOptimized += optimizedStat.size;

        const savings = Math.round((1 - optimizedStat.size / originalStat.size) * 100);
        results.push(
          `${relativePath}: ${formatBytes(originalStat.size)} → ${formatBytes(optimizedStat.size)} (${savings}% saved)`,
        );
      }

      const totalSavings = Math.round((1 - totalOptimized / totalOriginal) * 100);

      return {
        content: [
          {
            type: 'text',
            text: `Optimized ${files.length} images:\n${results.join('\n')}\n\nTotal: ${formatBytes(totalOriginal)} → ${formatBytes(totalOptimized)} (${totalSavings}% saved)`,
          },
        ],
      };
    },
  );
}

/** Format bytes to human readable string */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

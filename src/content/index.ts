import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  magick,
  magickBatch,
  validateInputFile,
  ensureOutputDir,
  resolveOutputPath,
} from '../utils/exec.js';
import { registerTool } from '../utils/register.js';
import {
  type ThumbnailParams,
  type CollageParams,
  type BeforeAfterParams,
  type GifFromFramesParams,
  type StickerCutoutParams,
  thumbnailSchema,
  collageSchema,
  beforeAfterSchema,
  gifFromFramesSchema,
  stickerCutoutSchema,
} from './types.js';

/**
 * Register content creative tools with the MCP server.
 */
export function registerContentTools(server: McpServer): void {
  // ── thumbnail ───────────────────────────────────────────────────────────
  registerTool<ThumbnailParams>(
    server,
    'thumbnail',
    'Generate a video thumbnail with title text, gradient overlay, and branding',
    thumbnailSchema.shape,
    async (params: ThumbnailParams) => {
      const {
        input,
        output,
        title,
        subtitle,
        width,
        height,
        font,
        text_color,
        overlay_color,
        logo,
        format,
      } = params;
      await validateInputFile(input);
      const outPath = resolveOutputPath(input, {
        outputPath: output,
        suffix: '_thumb',
        format: format ?? 'png',
      });
      await ensureOutputDir(outPath);

      const args = [
        input,
        '-resize',
        `${width}x${height}^`,
        '-gravity',
        'center',
        '-extent',
        `${width}x${height}`,
        // Gradient overlay
        '(',
        '-size',
        `${width}x${height}`,
        `gradient:transparent-${overlay_color}`,
        ')',
        '-compose',
        'Over',
        '-composite',
        // Title text
        '-gravity',
        'SouthWest',
        '-font',
        font,
        '-pointsize',
        String(Math.floor(width / 16)),
        '-fill',
        text_color,
        '-annotate',
        `+${Math.floor(width * 0.05)}+${Math.floor(height * 0.15)}`,
        title,
      ];

      if (subtitle) {
        args.push(
          '-pointsize',
          String(Math.floor(width / 28)),
          '-annotate',
          `+${Math.floor(width * 0.05)}+${Math.floor(height * 0.06)}`,
          subtitle,
        );
      }

      if (logo) {
        await validateInputFile(logo);
        const logoSize = Math.floor(height * 0.12);
        args.push(
          '(',
          logo,
          '-resize',
          `${logoSize}x${logoSize}`,
          ')',
          '-gravity',
          'NorthEast',
          '-geometry',
          `+${Math.floor(width * 0.03)}+${Math.floor(height * 0.03)}`,
          '-composite',
        );
      }

      args.push(outPath);
      await magick(args);
      return { content: [{ type: 'text', text: `Thumbnail (${width}x${height}): ${outPath}` }] };
    },
  );

  // ── collage ─────────────────────────────────────────────────────────────
  registerTool<CollageParams>(
    server,
    'collage',
    'Combine multiple images into a grid layout — recipe steps, before/after, feature showcases',
    collageSchema.shape,
    async (params: CollageParams) => {
      const { inputs, output, columns, tile_width, tile_height, gap, background } = params;
      for (const img of inputs) {
        await validateInputFile(img);
      }
      await ensureOutputDir(output);

      const args = ['montage'];
      args.push(...inputs);
      args.push(
        '-tile',
        `${columns}x`,
        '-geometry',
        `${tile_width}x${tile_height}+${gap}+${gap}`,
        '-background',
        background,
        '-gravity',
        'center',
        output,
      );

      await magickBatch(args);
      return {
        content: [
          { type: 'text', text: `Collage (${inputs.length} images, ${columns} cols): ${output}` },
        ],
      };
    },
  );

  // ── before-after ────────────────────────────────────────────────────────
  registerTool<BeforeAfterParams>(
    server,
    'before-after',
    'Create a side-by-side comparison image with a divider line and labels',
    beforeAfterSchema.shape,
    async (params: BeforeAfterParams) => {
      const {
        before,
        after,
        output,
        width,
        height,
        divider_width,
        divider_color,
        label_before,
        label_after,
        font,
      } = params;
      await validateInputFile(before);
      await validateInputFile(after);
      await ensureOutputDir(output);

      const halfWidth = Math.floor((width - divider_width) / 2);
      const labelSize = Math.floor(height * 0.04);
      const labelPad = Math.floor(height * 0.03);

      const args = [
        '(',
        before,
        '-resize',
        `${halfWidth}x${height}^`,
        '-gravity',
        'center',
        '-extent',
        `${halfWidth}x${height}`,
        '-fill',
        '#00000060',
        '-draw',
        `rectangle 0,${height - labelSize * 3},${halfWidth},${height}`,
        '-fill',
        'white',
        '-font',
        font,
        '-pointsize',
        String(labelSize),
        '-gravity',
        'South',
        '-annotate',
        `+0+${labelPad}`,
        label_before,
        ')',
        '(',
        after,
        '-resize',
        `${halfWidth}x${height}^`,
        '-gravity',
        'center',
        '-extent',
        `${halfWidth}x${height}`,
        '-fill',
        '#00000060',
        '-draw',
        `rectangle 0,${height - labelSize * 3},${halfWidth},${height}`,
        '-fill',
        'white',
        '-font',
        font,
        '-pointsize',
        String(labelSize),
        '-gravity',
        'South',
        '-annotate',
        `+0+${labelPad}`,
        label_after,
        ')',
        '+append',
      ];

      if (divider_width > 0) {
        // Add divider by splicing a colored column
        args.push(
          '-gravity',
          'center',
          '-background',
          divider_color,
          '-splice',
          `${divider_width}x0+${halfWidth}+0`,
        );
      }

      args.push(output);
      await magick(args);
      return { content: [{ type: 'text', text: `Before/after comparison: ${output}` }] };
    },
  );

  // ── gif-from-frames ─────────────────────────────────────────────────────
  registerTool<GifFromFramesParams>(
    server,
    'gif-from-frames',
    'Create an animated GIF from a sequence of images — recipe process animations, tutorials',
    gifFromFramesSchema.shape,
    async (params: GifFromFramesParams) => {
      const { inputs, output, delay, loop, width, height, optimize } = params;
      for (const img of inputs) {
        await validateInputFile(img);
      }
      await ensureOutputDir(output);

      const args = ['-delay', String(delay), '-loop', String(loop)];

      for (const img of inputs) {
        args.push(img);
      }

      if (width || height) {
        const geometry =
          width && height ? `${width}x${height}` : width ? `${width}x` : `x${height}`;
        args.push('-resize', geometry);
      }

      if (optimize) {
        args.push('-layers', 'Optimize');
      }

      args.push(output);
      await magickBatch(args);
      return {
        content: [
          {
            type: 'text',
            text: `GIF created (${inputs.length} frames, ${delay}cs delay): ${output}`,
          },
        ],
      };
    },
  );

  // ── sticker-cutout ──────────────────────────────────────────────────────
  registerTool<StickerCutoutParams>(
    server,
    'sticker-cutout',
    'Create a die-cut sticker effect with white border and shadow — perfect for Stories and Reels',
    stickerCutoutSchema.shape,
    async (params: StickerCutoutParams) => {
      const { input, output, border_width, shadow_offset, shadow_blur, shadow_color, format } =
        params;
      await validateInputFile(input);
      const outPath = resolveOutputPath(input, {
        outputPath: output,
        suffix: '_sticker',
        format: format ?? 'png',
      });
      await ensureOutputDir(outPath);

      const args = [
        input,
        // Add white border/outline effect
        '(',
        '+clone',
        '-alpha',
        'extract',
        '-morphology',
        'Dilate',
        `Disk:${border_width}`,
        '-background',
        'white',
        '-alpha',
        'shape',
        ')',
        // Add shadow
        '(',
        '+clone',
        '-background',
        shadow_color,
        '-shadow',
        `100x${shadow_blur}+${shadow_offset}+${shadow_offset}`,
        ')',
        // Stack: shadow, white border, original
        '-reverse',
        '-background',
        'none',
        '-layers',
        'merge',
        '+repage',
        outPath,
      ];

      await magick(args);
      return { content: [{ type: 'text', text: `Sticker cutout created: ${outPath}` }] };
    },
  );
}

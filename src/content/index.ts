import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, magickBatch, ensureOutputDir } from '../utils/exec.js';
import { resolveIO, resolveInput, resolveOutput } from '../utils/resource.js';
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
      const io = await resolveIO({ input, output, suffix: '_thumb', format: format ?? 'png' });
      const logoR = logo ? await resolveInput(logo) : null;
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [
          io.inputLocal,
          '-resize',
          `${width}x${height}^`,
          '-gravity',
          'center',
          '-extent',
          `${width}x${height}`,
          '(',
          '-size',
          `${width}x${height}`,
          `gradient:transparent-${overlay_color}`,
          ')',
          '-compose',
          'Over',
          '-composite',
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

        if (logoR) {
          const logoSize = Math.floor(height * 0.12);
          args.push(
            '(',
            logoR.localPath,
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

        args.push(io.outputLocal);
        await magick(args);
        await io.finalize();
        return {
          content: [{ type: 'text', text: `Thumbnail (${width}x${height}): ${io.outputUri}` }],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      } finally {
        await logoR?.cleanup?.();
      }
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
      const resolvedInputs = await Promise.all(inputs.map((i) => resolveInput(i)));
      const out = await resolveOutput(output);
      try {
        await ensureOutputDir(out.localPath);

        const args = ['montage'];
        args.push(...resolvedInputs.map((r) => r.localPath));
        args.push(
          '-tile',
          `${columns}x`,
          '-geometry',
          `${tile_width}x${tile_height}+${gap}+${gap}`,
          '-background',
          background,
          '-gravity',
          'center',
          out.localPath,
        );

        await magickBatch(args);
        await out.commit();
        return {
          content: [
            { type: 'text', text: `Collage (${inputs.length} images, ${columns} cols): ${output}` },
          ],
        };
      } finally {
        await Promise.all(resolvedInputs.map((r) => r.cleanup?.()));
      }
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
      const beforeR = await resolveInput(before);
      const afterR = await resolveInput(after);
      const out = await resolveOutput(output);
      try {
        await ensureOutputDir(out.localPath);

        const halfWidth = Math.floor((width - divider_width) / 2);
        const labelSize = Math.floor(height * 0.04);
        const labelPad = Math.floor(height * 0.03);

        const args = [
          '(',
          beforeR.localPath,
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
          afterR.localPath,
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
          args.push(
            '-gravity',
            'center',
            '-background',
            divider_color,
            '-splice',
            `${divider_width}x0+${halfWidth}+0`,
          );
        }

        args.push(out.localPath);
        await magick(args);
        await out.commit();
        return { content: [{ type: 'text', text: `Before/after comparison: ${output}` }] };
      } finally {
        await beforeR.cleanup?.();
        await afterR.cleanup?.();
      }
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
      const resolvedInputs = await Promise.all(inputs.map((i) => resolveInput(i)));
      const out = await resolveOutput(output);
      try {
        await ensureOutputDir(out.localPath);

        const args = ['-delay', String(delay), '-loop', String(loop)];

        for (const r of resolvedInputs) {
          args.push(r.localPath);
        }

        if (width || height) {
          const geometry =
            width && height ? `${width}x${height}` : width ? `${width}x` : `x${height}`;
          args.push('-resize', geometry);
        }

        if (optimize) {
          args.push('-layers', 'Optimize');
        }

        args.push(out.localPath);
        await magickBatch(args);
        await out.commit();
        return {
          content: [
            {
              type: 'text',
              text: `GIF created (${inputs.length} frames, ${delay}cs delay): ${output}`,
            },
          ],
        };
      } finally {
        await Promise.all(resolvedInputs.map((r) => r.cleanup?.()));
      }
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
      const io = await resolveIO({ input, output, suffix: '_sticker', format: format ?? 'png' });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [
          io.inputLocal,
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
          '(',
          '+clone',
          '-background',
          shadow_color,
          '-shadow',
          `100x${shadow_blur}+${shadow_offset}+${shadow_offset}`,
          ')',
          '-reverse',
          '-background',
          'none',
          '-layers',
          'merge',
          '+repage',
          io.outputLocal,
        ];

        await magick(args);
        await io.finalize();
        return { content: [{ type: 'text', text: `Sticker cutout created: ${io.outputUri}` }] };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );
}

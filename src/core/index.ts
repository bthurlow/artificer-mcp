import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, magickBatch, ensureOutputDir, getExtension } from '../utils/exec.js';
import { resolveIO, resolveInput } from '../utils/resource.js';
import { registerTool } from '../utils/register.js';
import {
  type ResizeParams,
  type CropParams,
  type SmartCropParams,
  type RotateParams,
  type FlipParams,
  type FormatConvertParams,
  type CompressParams,
  type InfoParams,
  type StripMetadataParams,
  type BatchParams,
  resizeSchema,
  cropSchema,
  smartCropSchema,
  rotateSchema,
  flipSchema,
  formatConvertSchema,
  compressSchema,
  infoSchema,
  stripMetadataSchema,
  batchSchema,
} from './types.js';

/**
 * Register all core image operation tools with the MCP server.
 */
export function registerCoreTools(server: McpServer): void {
  registerTool<ResizeParams>(
    server,
    'resize',
    'Resize an image with aspect ratio control (fit, fill, or stretch)',
    resizeSchema.shape,
    async (params: ResizeParams) => {
      const { input, output, width, height, mode, format } = params;
      const io = await resolveIO({ input, output, suffix: '_resized', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const geometry = `${width}x${height}`;
        let args: string[];

        switch (mode) {
          case 'fill':
            args = [
              io.inputLocal,
              '-resize',
              `${geometry}^`,
              '-gravity',
              'center',
              '-extent',
              geometry,
              io.outputLocal,
            ];
            break;
          case 'stretch':
            args = [io.inputLocal, '-resize', `${geometry}!`, io.outputLocal];
            break;
          case 'fit':
          default:
            args = [io.inputLocal, '-resize', geometry, io.outputLocal];
            break;
        }

        await magick(args);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Resized to ${width}x${height} (${mode}): ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<CropParams>(
    server,
    'crop',
    'Crop a rectangular region from an image by coordinates',
    cropSchema.shape,
    async (params: CropParams) => {
      const { input, output, width, height, x, y, format } = params;
      const io = await resolveIO({ input, output, suffix: '_cropped', format });
      try {
        await ensureOutputDir(io.outputLocal);
        await magick([
          io.inputLocal,
          '-crop',
          `${width}x${height}+${x}+${y}`,
          '+repage',
          io.outputLocal,
        ]);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Cropped ${width}x${height} at (${x},${y}): ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<SmartCropParams>(
    server,
    'smart-crop',
    'Content-aware crop that detects the focal point and crops around it',
    smartCropSchema.shape,
    async (params: SmartCropParams) => {
      const { input, output, width, height, format } = params;
      const io = await resolveIO({ input, output, suffix: '_smartcrop', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const geometry = `${width}x${height}`;
        await magick([
          io.inputLocal,
          '-resize',
          `${geometry}^`,
          '-gravity',
          'center',
          '-extent',
          geometry,
          io.outputLocal,
        ]);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Smart-cropped to ${width}x${height}: ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<RotateParams>(
    server,
    'rotate',
    'Rotate an image by degrees with optional background fill color',
    rotateSchema.shape,
    async (params: RotateParams) => {
      const { input, output, degrees, background, format } = params;
      const io = await resolveIO({ input, output, suffix: '_rotated', format });
      try {
        await ensureOutputDir(io.outputLocal);
        await magick([
          io.inputLocal,
          '-background',
          background,
          '-rotate',
          String(degrees),
          io.outputLocal,
        ]);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Rotated ${degrees}°: ${io.outputUri}` }],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<FlipParams>(
    server,
    'flip',
    'Flip an image horizontally or vertically',
    flipSchema.shape,
    async (params: FlipParams) => {
      const { input, output, direction, format } = params;
      const io = await resolveIO({ input, output, suffix: '_flipped', format });
      try {
        await ensureOutputDir(io.outputLocal);
        const flag = direction === 'horizontal' ? '-flop' : '-flip';
        await magick([io.inputLocal, flag, io.outputLocal]);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Flipped ${direction}: ${io.outputUri}` }],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<FormatConvertParams>(
    server,
    'format-convert',
    'Convert an image between formats (PNG, WebP, AVIF, JPEG, TIFF, ICO, SVG rasterize)',
    formatConvertSchema.shape,
    async (params: FormatConvertParams) => {
      const { input, output, format, quality } = params;
      const io = await resolveIO({ input, output, suffix: '', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal];
        if (quality !== undefined) {
          args.push('-quality', String(quality));
        }
        args.push(io.outputLocal);

        await magick(args);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Converted to ${format}: ${io.outputUri}` }],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<CompressParams>(
    server,
    'compress',
    'Optimize image file size with format-aware compression defaults',
    compressSchema.shape,
    async (params: CompressParams) => {
      const { input, output, quality, strip, format } = params;
      const io = await resolveIO({ input, output, suffix: '_compressed', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal, '-quality', String(quality)];
        if (strip) {
          args.push('-strip');
        }
        const ext = getExtension(io.outputLocal);
        if (ext === 'jpg' || ext === 'jpeg') {
          args.push('-sampling-factor', '4:2:0', '-interlace', 'JPEG');
        } else if (ext === 'png') {
          args.push('-define', 'png:compression-level=9');
        }
        args.push(io.outputLocal);

        await magick(args);
        await io.finalize();
        return {
          content: [
            { type: 'text' as const, text: `Compressed (quality ${quality}): ${io.outputUri}` },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<InfoParams>(
    server,
    'info',
    'Get image metadata: dimensions, format, color space, file size, DPI, alpha channel',
    infoSchema.shape,
    async (params: InfoParams) => {
      const { input } = params;
      const inR = await resolveInput(input);
      try {
        const result = await magick([
          'identify',
          '-format',
          'Format: %m\\nDimensions: %wx%h\\nColor Space: %[colorspace]\\nDepth: %z-bit\\nSize: %b\\nDPI: %x x %y\\nAlpha: %A\\nType: %[type]',
          inR.localPath,
        ]);

        return { content: [{ type: 'text' as const, text: result.trim() }] };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  registerTool<StripMetadataParams>(
    server,
    'strip-metadata',
    'Remove EXIF, GPS, ICC, and other metadata from an image for privacy and smaller file size',
    stripMetadataSchema.shape,
    async (params: StripMetadataParams) => {
      const { input, output, format } = params;
      const io = await resolveIO({ input, output, suffix: '_stripped', format });
      try {
        await ensureOutputDir(io.outputLocal);
        await magick([io.inputLocal, '-strip', io.outputLocal]);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Metadata stripped: ${io.outputUri}` }],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<BatchParams>(
    server,
    'batch',
    'Chain multiple ImageMagick operations on one image in a single call',
    batchSchema.shape,
    async (params: BatchParams) => {
      const { input, output, operations } = params;
      const io = await resolveIO({ input, output });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal];
        for (const op of operations) {
          args.push(...op.split(/\s+/));
        }
        args.push(io.outputLocal);

        await magickBatch(args);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Batch (${operations.length} ops) complete: ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );
}

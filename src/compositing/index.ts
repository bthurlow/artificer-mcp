import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, ensureOutputDir } from '../utils/exec.js';
import { resolveInput, resolveIO } from '../utils/resource.js';
import { registerTool } from '../utils/register.js';
import {
  type CompositeParams,
  type WatermarkParams,
  type GradientOverlayParams,
  type BackgroundRemoveParams,
  type DropShadowParams,
  type BorderParams,
  type RoundedCornersParams,
  type MaskApplyParams,
  compositeSchema,
  watermarkSchema,
  gradientOverlaySchema,
  backgroundRemoveSchema,
  dropShadowSchema,
  borderSchema,
  roundedCornersSchema,
  maskApplySchema,
} from './types.js';

/**
 * Register compositing and layer tools with the MCP server.
 */
export function registerCompositingTools(server: McpServer): void {
  registerTool<CompositeParams>(
    server,
    'composite',
    'Layer images together with blend modes (overlay, multiply, screen, etc.)',
    compositeSchema.shape,
    async (params: CompositeParams) => {
      const { base, overlay, output, gravity, x, y, blend, opacity, format } = params;
      const io = await resolveIO({ input: base, output, suffix: '_composite', format });
      const overlayR = await resolveInput(overlay);
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal];
        if (opacity < 100) {
          args.push(
            '(',
            overlayR.localPath,
            '-alpha',
            'set',
            '-channel',
            'A',
            '-evaluate',
            'multiply',
            String(opacity / 100),
            '+channel',
            ')',
          );
        } else {
          args.push(overlayR.localPath);
        }
        args.push(
          '-gravity',
          gravity,
          '-geometry',
          `+${x}+${y}`,
          '-compose',
          blend,
          '-composite',
          io.outputLocal,
        );

        await magick(args);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Composited (${blend}, ${opacity}% opacity): ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      } finally {
        await overlayR.cleanup?.();
      }
    },
  );

  registerTool<WatermarkParams>(
    server,
    'watermark',
    'Add a watermark to an image — tiled across the entire image or positioned at a specific location',
    watermarkSchema.shape,
    async (params: WatermarkParams) => {
      const { input, watermark, output, mode, gravity, opacity, format } = params;
      const io = await resolveIO({ input, output, suffix: '_watermarked', format });
      const wmR = await resolveInput(watermark);
      try {
        await ensureOutputDir(io.outputLocal);

        if (mode === 'tile') {
          await magick([
            io.inputLocal,
            '(',
            wmR.localPath,
            '-alpha',
            'set',
            '-channel',
            'A',
            '-evaluate',
            'multiply',
            String(opacity / 100),
            '+channel',
            '-write',
            'mpr:wm',
            '+delete',
            ')',
            '-fill',
            'mpr:wm',
            '-draw',
            'color 0,0 reset',
            '-compose',
            'Over',
            '-composite',
            io.outputLocal,
          ]);
        } else {
          await magick([
            io.inputLocal,
            '(',
            wmR.localPath,
            '-alpha',
            'set',
            '-channel',
            'A',
            '-evaluate',
            'multiply',
            String(opacity / 100),
            '+channel',
            ')',
            '-gravity',
            gravity,
            '-composite',
            io.outputLocal,
          ]);
        }

        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Watermark added (${mode}, ${opacity}%): ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      } finally {
        await wmR.cleanup?.();
      }
    },
  );

  registerTool<GradientOverlayParams>(
    server,
    'gradient-overlay',
    'Apply a linear or radial gradient overlay — great for making text readable over photos',
    gradientOverlaySchema.shape,
    async (params: GradientOverlayParams) => {
      const { input, output, type, direction, color_start, color_end, format } = params;
      const io = await resolveIO({ input, output, suffix: '_gradient', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const info = await magick(['identify', '-format', '%wx%h', io.inputLocal]);
        const dimensions = info.trim();

        const gradientSpec =
          type === 'radial'
            ? `radial-gradient:${color_start}-${color_end}`
            : `gradient:${color_start}-${color_end}`;

        let rotateArgs: string[] = [];
        if (type === 'linear') {
          switch (direction) {
            case 'top-bottom':
              break;
            case 'bottom-top':
              rotateArgs = ['-rotate', '180'];
              break;
            case 'left-right':
              rotateArgs = ['-rotate', '90'];
              break;
            case 'right-left':
              rotateArgs = ['-rotate', '270'];
              break;
          }
        }

        await magick([
          io.inputLocal,
          '(',
          '-size',
          dimensions,
          gradientSpec,
          ...rotateArgs,
          ')',
          '-compose',
          'Over',
          '-composite',
          io.outputLocal,
        ]);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Gradient overlay (${type} ${direction}): ${io.outputUri}`,
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

  registerTool<BackgroundRemoveParams>(
    server,
    'background-remove',
    'Remove or replace image backgrounds using color keying or flood fill',
    backgroundRemoveSchema.shape,
    async (params: BackgroundRemoveParams) => {
      const { input, output, target_color, fuzz, replace_color, format } = params;
      const io = await resolveIO({ input, output, suffix: '_nobg', format: format ?? 'png' });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal, '-fuzz', `${fuzz}%`, '-transparent', target_color];
        if (replace_color !== 'none') {
          args.push('-background', replace_color, '-flatten');
        }
        args.push(io.outputLocal);

        await magick(args);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Background removed (fuzz ${fuzz}%): ${io.outputUri}`,
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

  registerTool<DropShadowParams>(
    server,
    'drop-shadow',
    'Add a realistic drop shadow to an image — great for product shots and app screenshots',
    dropShadowSchema.shape,
    async (params: DropShadowParams) => {
      const { input, output, color, offset_x, offset_y, blur, background, format } = params;
      const io = await resolveIO({ input, output, suffix: '_shadow', format });
      try {
        await ensureOutputDir(io.outputLocal);

        await magick([
          io.inputLocal,
          '(',
          '+clone',
          '-background',
          color,
          '-shadow',
          `100x${blur}+${offset_x}+${offset_y}`,
          ')',
          '+swap',
          '-background',
          background,
          '-layers',
          'merge',
          '+repage',
          io.outputLocal,
        ]);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Drop shadow added: ${io.outputUri}` }],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      }
    },
  );

  registerTool<BorderParams>(
    server,
    'border',
    'Add borders, padding, or frames with color or pattern fill',
    borderSchema.shape,
    async (params: BorderParams) => {
      const { input, output, width, color, style, format } = params;
      const io = await resolveIO({ input, output, suffix: '_bordered', format });
      try {
        await ensureOutputDir(io.outputLocal);

        let args: string[];
        switch (style) {
          case 'raised':
            args = [
              io.inputLocal,
              '-bordercolor',
              color,
              '-border',
              String(width),
              '-raise',
              `${width}x${width}`,
              io.outputLocal,
            ];
            break;
          case 'sunken':
            args = [
              io.inputLocal,
              '-bordercolor',
              color,
              '-border',
              String(width),
              '+raise',
              `${width}x${width}`,
              io.outputLocal,
            ];
            break;
          default:
            args = [io.inputLocal, '-bordercolor', color, '-border', String(width), io.outputLocal];
            break;
        }

        await magick(args);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Border added (${style}, ${width}px): ${io.outputUri}`,
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

  registerTool<RoundedCornersParams>(
    server,
    'rounded-corners',
    'Round the corners of an image with transparent background — app screenshots, UI previews',
    roundedCornersSchema.shape,
    async (params: RoundedCornersParams) => {
      const { input, output, radius, format } = params;
      const io = await resolveIO({ input, output, suffix: '_rounded', format: format ?? 'png' });
      try {
        await ensureOutputDir(io.outputLocal);

        const info = await magick(['identify', '-format', '%wx%h', io.inputLocal]);
        const dimensions = info.trim();

        await magick([
          '(',
          io.inputLocal,
          '-alpha',
          'set',
          ')',
          '(',
          '-size',
          dimensions,
          'xc:none',
          '-draw',
          `roundrectangle 0,0,%[fx:w-1],%[fx:h-1],${radius},${radius}`,
          ')',
          '-compose',
          'DstIn',
          '-composite',
          io.outputLocal,
        ]);
        await io.finalize();
        return {
          content: [
            { type: 'text' as const, text: `Rounded corners (${radius}px): ${io.outputUri}` },
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

  registerTool<MaskApplyParams>(
    server,
    'mask-apply',
    'Apply a shape mask to an image (circle, rounded rectangle, or custom SVG/image mask)',
    maskApplySchema.shape,
    async (params: MaskApplyParams) => {
      const { input, output, mask, shape, radius, format } = params;
      const io = await resolveIO({ input, output, suffix: '_masked', format: format ?? 'png' });
      const maskR = mask ? await resolveInput(mask) : null;
      try {
        await ensureOutputDir(io.outputLocal);

        const info = await magick(['identify', '-format', '%wx%h', io.inputLocal]);
        const [w, h] = info.trim().split('x').map(Number);

        if (maskR) {
          await magick([
            io.inputLocal,
            '-alpha',
            'set',
            maskR.localPath,
            '-compose',
            'DstIn',
            '-composite',
            io.outputLocal,
          ]);
        } else if (shape === 'circle') {
          const cx = Math.floor(w / 2);
          const cy = Math.floor(h / 2);
          const r = Math.min(cx, cy);
          await magick([
            '(',
            io.inputLocal,
            '-alpha',
            'set',
            ')',
            '(',
            '-size',
            `${w}x${h}`,
            'xc:none',
            '-fill',
            'white',
            '-draw',
            `circle ${cx},${cy} ${cx},${cy - r}`,
            ')',
            '-compose',
            'DstIn',
            '-composite',
            io.outputLocal,
          ]);
        } else {
          const r = radius ?? 20;
          await magick([
            '(',
            io.inputLocal,
            '-alpha',
            'set',
            ')',
            '(',
            '-size',
            `${w}x${h}`,
            'xc:none',
            '-draw',
            `roundrectangle 0,0,${w - 1},${h - 1},${r},${r}`,
            ')',
            '-compose',
            'DstIn',
            '-composite',
            io.outputLocal,
          ]);
        }

        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Mask applied (${mask ? 'custom' : shape}): ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      } finally {
        await maskR?.cleanup?.();
      }
    },
  );
}

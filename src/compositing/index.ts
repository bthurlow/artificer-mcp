import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, ensureOutputDir } from '../utils/exec.js';
import { resolveInput, resolveIO } from '../utils/resource.js';
import { registerTool } from '../utils/register.js';
import {
  type CompositeParams,
  type WatermarkParams,
  type GradientOverlayParams,
  type BackgroundRemoveParams,
  type ExtendCanvasParams,
  type DropShadowParams,
  type BorderParams,
  type RoundedCornersParams,
  type MaskApplyParams,
  compositeSchema,
  watermarkSchema,
  gradientOverlaySchema,
  backgroundRemoveSchema,
  extendCanvasSchema,
  dropShadowSchema,
  borderSchema,
  roundedCornersSchema,
  maskApplySchema,
} from './types.js';

/**
 * Promote the base image to sRGB before a colored layer is composited onto it.
 *
 * ImageMagick adopts the FIRST image's colorspace for a composite operation.
 * A solid dark background is routinely stored as a grayscale PNG — ImageMagick
 * itself writes one that way when an image has no color — so compositing a
 * colored overlay onto it silently converts the overlay to gray. A gold
 * overlay on black comes back silver, on every blend mode.
 *
 * Gray -> sRGB is value-preserving (verified across the tonal range: 0, 10,
 * 64, 128, 192, 255 all round-trip exactly), so this introduces no brightness
 * shift. And ImageMagick still writes a genuinely colorless result back out as
 * grayscale, so it costs nothing when both layers really are gray.
 *
 * Only needed where a COLORED layer lands on a caller-supplied base. Mask
 * operations (`rounded_corners`, `mask_apply`) composite a grayscale mask onto
 * a color base, so the base's colorspace already wins and color is preserved.
 */
const FORCE_SRGB = ['-colorspace', 'sRGB'];

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

        const args = [io.inputLocal, ...FORCE_SRGB];
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
            ...FORCE_SRGB,
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
            ...FORCE_SRGB,
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
          ...FORCE_SRGB,
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
    'Remove or replace image backgrounds. mode="color-key" (default) removes every pixel matching target_color anywhere in the image; mode="flood-fill" removes only background-connected pixels seeded from the corners, so colors that also appear inside the subject are preserved.',
    backgroundRemoveSchema.shape,
    async (params: BackgroundRemoveParams) => {
      const { input, output, mode, target_color, fuzz, replace_color, format } = params;
      const io = await resolveIO({ input, output, suffix: '_nobg', format: format ?? 'png' });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal];

        if (mode === 'flood-fill') {
          // Seed from all four corners: a subject touching one edge, or a
          // background split by the subject, leaves regions a single seed
          // can't reach. Each -draw samples the color already at that point,
          // so target_color is not consulted here.
          const info = await magick(['identify', '-format', '%wx%h', io.inputLocal]);
          const [w, h] = info.trim().split('x').map(Number);
          if (!Number.isFinite(w) || !Number.isFinite(h)) {
            throw new Error(`background-remove: could not read image dimensions (got "${info}")`);
          }
          const maxX = w - 1;
          const maxY = h - 1;

          args.push('-alpha', 'set', '-fuzz', `${fuzz}%`, '-fill', 'none');
          for (const [x, y] of [
            [0, 0],
            [maxX, 0],
            [0, maxY],
            [maxX, maxY],
          ]) {
            args.push('-draw', `color ${x},${y} floodfill`);
          }
        } else {
          args.push('-fuzz', `${fuzz}%`, '-transparent', target_color);
        }

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
              text: `Background removed (${mode}, fuzz ${fuzz}%): ${io.outputUri}`,
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

  registerTool<ExtendCanvasParams>(
    server,
    'extend-canvas',
    'Grow the canvas around an image without scaling it — asymmetric padding or placement on a larger canvas. Two modes: pass `width` + `height` to center (or gravity-position) the image on a canvas of exactly that size, e.g. a logo on a wide banner; or pass any of `top`/`right`/`bottom`/`left` to add padding per side. Use this instead of chaining resize + border, which stretches the image or pads symmetrically.',
    extendCanvasSchema.shape,
    async (params: ExtendCanvasParams) => {
      const {
        input,
        output,
        width,
        height,
        top,
        right,
        bottom,
        left,
        gravity,
        background,
        format,
      } = params;

      const canvasMode = width !== undefined || height !== undefined;
      const padMode = top > 0 || right > 0 || bottom > 0 || left > 0;

      // Fail loudly rather than silently no-op'ing or half-applying. Both
      // modes at once is ambiguous; neither is a caller mistake.
      if (canvasMode && padMode) {
        throw new Error(
          'extend-canvas: pass EITHER width/height (canvas mode) OR top/right/bottom/left ' +
            '(padding mode), not both. Canvas mode positions the image on a fixed-size canvas; ' +
            'padding mode grows the canvas by a given amount per side.',
        );
      }
      if (canvasMode && (width === undefined || height === undefined)) {
        throw new Error('extend-canvas: canvas mode needs both `width` and `height`.');
      }
      if (!canvasMode && !padMode) {
        throw new Error(
          'extend-canvas: nothing to do — pass width/height for canvas mode, or at least one ' +
            'of top/right/bottom/left for padding mode.',
        );
      }

      const io = await resolveIO({
        input,
        output,
        suffix: '_extended',
        // Transparent fill needs a format that carries alpha.
        format: format ?? (background === 'none' ? 'png' : undefined),
      });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal, '-background', background];
        if (canvasMode) {
          args.push('-gravity', gravity, '-extent', `${width}x${height}`);
        } else {
          // Two splices: NorthWest adds the left/top edges, SouthEast the
          // right/bottom. Doing it in one pass would pad symmetrically.
          args.push('-gravity', 'NorthWest', '-splice', `${left}x${top}`);
          args.push('-gravity', 'SouthEast', '-splice', `${right}x${bottom}`);
        }
        // Drop the virtual canvas offset so downstream tools see clean geometry.
        args.push('+repage', io.outputLocal);

        await magick(args);
        await io.finalize();

        const described = canvasMode
          ? `canvas ${width}x${height}, ${gravity}`
          : `padding T${top} R${right} B${bottom} L${left}`;
        return {
          content: [
            {
              type: 'text' as const,
              text: `Canvas extended (${described}, background ${background}): ${io.outputUri}`,
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

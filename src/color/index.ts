import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, ensureOutputDir } from '../utils/exec.js';
import { resolveIO, resolveInput } from '../utils/resource.js';
import { registerTool } from '../utils/register.js';
import {
  type AdjustParams,
  type TintParams,
  type BlurParams,
  type SharpenParams,
  type PixelateRegionParams,
  type ColorExtractParams,
  type NormalizeParams,
  type VignetteParams,
  adjustSchema,
  tintSchema,
  blurSchema,
  sharpenSchema,
  pixelateRegionSchema,
  colorExtractSchema,
  normalizeSchema,
  vignetteSchema,
} from './types.js';

/**
 * Register color adjustment and effects tools with the MCP server.
 */
export function registerColorTools(server: McpServer): void {
  registerTool<AdjustParams>(
    server,
    'adjust',
    'Adjust brightness, contrast, saturation, hue, and gamma of an image',
    adjustSchema.shape,
    async (params: AdjustParams) => {
      const { input, output, brightness, contrast, saturation, hue, gamma, format } = params;
      const io = await resolveIO({ input, output, suffix: '_adjusted', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal];
        if (brightness !== 0 || contrast !== 0) {
          args.push('-brightness-contrast', `${brightness}x${contrast}`);
        }
        if (saturation !== 100 || hue !== 100) {
          args.push('-modulate', `100,${saturation},${hue}`);
        }
        if (gamma !== 1.0) {
          args.push('-gamma', String(gamma));
        }

        args.push(io.outputLocal);
        await magick(args);
        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Adjusted (b:${brightness} c:${contrast} s:${saturation} h:${hue} g:${gamma}): ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        await io.cleanup();
        throw err;
      }
    },
  );

  registerTool<TintParams>(
    server,
    'tint',
    'Apply a color tint or duotone effect for brand consistency',
    tintSchema.shape,
    async (params: TintParams) => {
      const { input, output, mode, color, shadow_color, intensity, format } = params;
      const io = await resolveIO({ input, output, suffix: '_tinted', format });
      try {
        await ensureOutputDir(io.outputLocal);

        if (mode === 'duotone') {
          await magick([
            io.inputLocal,
            '-colorspace',
            'Gray',
            '-fill',
            shadow_color,
            '-tint',
            '100',
            '(',
            '+clone',
            '-fill',
            color,
            '-tint',
            '100',
            ')',
            '-compose',
            'Screen',
            '-composite',
            io.outputLocal,
          ]);
        } else {
          await magick([io.inputLocal, '-fill', color, '-tint', String(intensity), io.outputLocal]);
        }

        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `${mode} applied (${color}): ${io.outputUri}` }],
        };
      } catch (err) {
        await io.cleanup();
        throw err;
      }
    },
  );

  registerTool<BlurParams>(
    server,
    'blur',
    'Apply Gaussian, motion, or radial blur to an image or a specific region',
    blurSchema.shape,
    async (params: BlurParams) => {
      const { input, output, type, radius, sigma, angle, region, format } = params;
      const io = await resolveIO({ input, output, suffix: '_blurred', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal];
        if (region) {
          args.push('-region', `${region.width}x${region.height}+${region.x}+${region.y}`);
        }

        switch (type) {
          case 'motion':
            args.push('-motion-blur', `${radius}x${sigma}+${angle}`);
            break;
          case 'radial':
            args.push('-radial-blur', String(sigma));
            break;
          default:
            args.push('-blur', `${radius}x${sigma}`);
            break;
        }

        args.push(io.outputLocal);
        await magick(args);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Blur (${type}, σ=${sigma}): ${io.outputUri}` }],
        };
      } catch (err) {
        await io.cleanup();
        throw err;
      }
    },
  );

  registerTool<SharpenParams>(
    server,
    'sharpen',
    'Sharpen an image using unsharp mask or adaptive sharpening',
    sharpenSchema.shape,
    async (params: SharpenParams) => {
      const { input, output, type, radius, sigma, amount, threshold, format } = params;
      const io = await resolveIO({ input, output, suffix: '_sharpened', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const args = [io.inputLocal];
        if (type === 'adaptive') {
          args.push('-adaptive-sharpen', `${radius}x${sigma}`);
        } else {
          args.push('-unsharp', `${radius}x${sigma}+${amount}+${threshold}`);
        }
        args.push(io.outputLocal);

        await magick(args);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Sharpened (${type}): ${io.outputUri}` }],
        };
      } catch (err) {
        await io.cleanup();
        throw err;
      }
    },
  );

  registerTool<PixelateRegionParams>(
    server,
    'pixelate-region',
    'Pixelate or blur a specific rectangular region — redact sensitive info in screenshots',
    pixelateRegionSchema.shape,
    async (params: PixelateRegionParams) => {
      const { input, output, x, y, width, height, method, block_size, format } = params;
      const io = await resolveIO({ input, output, suffix: '_redacted', format });
      try {
        await ensureOutputDir(io.outputLocal);

        if (method === 'pixelate') {
          await magick([
            io.inputLocal,
            '(',
            '+clone',
            '-crop',
            `${width}x${height}+${x}+${y}`,
            '+repage',
            '-scale',
            `${Math.ceil(width / block_size)}x${Math.ceil(height / block_size)}`,
            '-scale',
            `${width}x${height}!`,
            ')',
            '-geometry',
            `+${x}+${y}`,
            '-composite',
            io.outputLocal,
          ]);
        } else {
          await magick([
            io.inputLocal,
            '-region',
            `${width}x${height}+${x}+${y}`,
            '-blur',
            `0x${block_size}`,
            io.outputLocal,
          ]);
        }

        await io.finalize();
        return {
          content: [
            {
              type: 'text' as const,
              text: `${method === 'pixelate' ? 'Pixelated' : 'Blurred'} region at (${x},${y}): ${io.outputUri}`,
            },
          ],
        };
      } catch (err) {
        await io.cleanup();
        throw err;
      }
    },
  );

  registerTool<ColorExtractParams>(
    server,
    'color-extract',
    'Extract dominant colors from an image as a hex palette — match blog accents to hero images',
    colorExtractSchema.shape,
    async (params: ColorExtractParams) => {
      const { input, count } = params;
      const inR = await resolveInput(input);
      try {
        const result = await magick([
          inR.localPath,
          '-colors',
          String(count),
          '-unique-colors',
          '-format',
          '%c',
          'histogram:info:',
        ]);

        const lines = result.trim().split('\n').filter(Boolean);
        const colors: string[] = [];
        for (const line of lines) {
          const hexMatch = line.match(/#[0-9A-Fa-f]{6}/);
          if (hexMatch) {
            colors.push(hexMatch[0]);
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `Dominant colors (${colors.length}):\n${colors.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  registerTool<NormalizeParams>(
    server,
    'normalize',
    'Auto-level brightness and contrast for inconsistent source photos',
    normalizeSchema.shape,
    async (params: NormalizeParams) => {
      const { input, output, method, format } = params;
      const io = await resolveIO({ input, output, suffix: '_normalized', format });
      try {
        await ensureOutputDir(io.outputLocal);

        const flagMap: Record<string, string> = {
          normalize: '-normalize',
          equalize: '-equalize',
          'auto-level': '-auto-level',
          'auto-gamma': '-auto-gamma',
        };

        await magick([io.inputLocal, flagMap[method], io.outputLocal]);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `${method} applied: ${io.outputUri}` }],
        };
      } catch (err) {
        await io.cleanup();
        throw err;
      }
    },
  );

  registerTool<VignetteParams>(
    server,
    'vignette',
    'Apply a dark edge vignette effect to draw focus to the center',
    vignetteSchema.shape,
    async (params: VignetteParams) => {
      const { input, output, radius, sigma, x, y, color, format } = params;
      const io = await resolveIO({ input, output, suffix: '_vignette', format });
      try {
        await ensureOutputDir(io.outputLocal);

        await magick([
          io.inputLocal,
          '-background',
          color,
          '-vignette',
          `${radius}x${sigma}+${x}+${y}`,
          io.outputLocal,
        ]);
        await io.finalize();
        return {
          content: [{ type: 'text' as const, text: `Vignette applied: ${io.outputUri}` }],
        };
      } catch (err) {
        await io.cleanup();
        throw err;
      }
    },
  );
}

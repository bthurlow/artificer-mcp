import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, magickBatch, ensureOutputDir, IAB_BANNER_SIZES } from '../utils/exec.js';
import { resolveIO, resolveInput, resolveOutput, joinUri } from '../utils/resource.js';
import { registerTool } from '../utils/register.js';
import {
  type BannerSetParams,
  type CtaButtonParams,
  type PriceBadgeParams,
  type ABVariantsParams,
  type TemplateFillParams,
  type QrCodeOverlayParams,
  type ProductMockupParams,
  bannerSetSchema,
  ctaButtonSchema,
  priceBadgeSchema,
  abVariantsSchema,
  templateFillSchema,
  qrCodeOverlaySchema,
  productMockupSchema,
} from './types.js';

/**
 * Register ad creative tools with the MCP server.
 */
export function registerAdTools(server: McpServer): void {
  // ── banner-set ──────────────────────────────────────────────────────────
  registerTool<BannerSetParams>(
    server,
    'banner-set',
    'Generate all IAB standard ad banner sizes from one design (leaderboard, medium-rect, skyscraper, mobile, half-page, billboard)',
    bannerSetSchema.shape,
    async (params: BannerSetParams) => {
      const { input, output_dir, sizes, format } = params;
      const inR = await resolveInput(input);
      const generated: string[] = [];
      try {
        for (const sizeName of sizes) {
          const size = IAB_BANNER_SIZES[sizeName];
          if (!size) continue;

          const outUri = joinUri(
            output_dir,
            `banner_${sizeName}_${size.width}x${size.height}.${format}`,
          );
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);
          await magick([
            inR.localPath,
            '-resize',
            `${size.width}x${size.height}^`,
            '-gravity',
            'center',
            '-extent',
            `${size.width}x${size.height}`,
            out.localPath,
          ]);
          await out.commit();
          generated.push(`${sizeName} (${size.width}x${size.height}): ${outUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} banner sizes:\n${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── cta-button ──────────────────────────────────────────────────────────
  registerTool<CtaButtonParams>(
    server,
    'cta-button',
    'Generate a call-to-action button image with rounded rectangle, gradient, shadow, and text',
    ctaButtonSchema.shape,
    async (params: CtaButtonParams) => {
      const {
        output,
        text,
        width,
        height,
        color,
        text_color,
        font,
        font_size,
        corner_radius,
        shadow,
        border_color,
        border_width,
      } = params;
      const out = await resolveOutput(output);
      await ensureOutputDir(out.localPath);

      const totalWidth = width + (shadow ? 20 : 0);
      const totalHeight = height + (shadow ? 20 : 0);

      const args = ['-size', `${totalWidth}x${totalHeight}`, 'xc:none'];

      if (shadow) {
        args.push(
          '-fill',
          '#00000030',
          '-draw',
          `roundrectangle 5,5,${width + 4},${height + 4},${corner_radius},${corner_radius}`,
        );
      }

      args.push(
        '-fill',
        color,
        '-draw',
        `roundrectangle 0,0,${width - 1},${height - 1},${corner_radius},${corner_radius}`,
      );

      if (border_color && border_width > 0) {
        args.push(
          '-fill',
          'none',
          '-stroke',
          border_color,
          '-strokewidth',
          String(border_width),
          '-draw',
          `roundrectangle 0,0,${width - 1},${height - 1},${corner_radius},${corner_radius}`,
        );
      }

      args.push(
        '-fill',
        text_color,
        '-stroke',
        'none',
        '-font',
        font,
        '-pointsize',
        String(font_size),
        '-gravity',
        'NorthWest',
        '-annotate',
        `+${Math.floor(width / 2 - font_size * text.length * 0.3)}+${Math.floor(height / 2 - font_size * 0.4)}`,
        text,
      );

      args.push(out.localPath);
      await magick(args);
      await out.commit();
      return { content: [{ type: 'text', text: `CTA button created: ${output}` }] };
    },
  );

  // ── price-badge ─────────────────────────────────────────────────────────
  registerTool<PriceBadgeParams>(
    server,
    'price-badge',
    'Generate price tags, sale badges, or percentage-off circles for marketing materials',
    priceBadgeSchema.shape,
    async (params: PriceBadgeParams) => {
      const { output, text, shape, size, background_color, text_color, font, border_color } =
        params;
      const out = await resolveOutput(output);
      await ensureOutputDir(out.localPath);

      const fontSize = Math.floor(size / (text.length > 6 ? 5 : 4));
      const args = ['-size', `${size}x${size}`, 'xc:none'];

      switch (shape) {
        case 'circle':
          args.push(
            '-fill',
            background_color,
            '-draw',
            `circle ${size / 2},${size / 2} ${size / 2},2`,
          );
          if (border_color) {
            args.push(
              '-fill',
              'none',
              '-stroke',
              border_color,
              '-strokewidth',
              '3',
              '-draw',
              `circle ${size / 2},${size / 2} ${size / 2},5`,
            );
          }
          break;
        case 'star': {
          const cx = size / 2;
          const cy = size / 2;
          const outer = size * 0.45;
          const inner = size * 0.2;
          const points: string[] = [];
          for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * (Math.PI / 180);
            const innerAngle = (i * 72 + 36 - 90) * (Math.PI / 180);
            points.push(
              `${cx + outer * Math.cos(outerAngle)},${cy + outer * Math.sin(outerAngle)}`,
            );
            points.push(
              `${cx + inner * Math.cos(innerAngle)},${cy + inner * Math.sin(innerAngle)}`,
            );
          }
          args.push('-fill', background_color, '-draw', `polygon ${points.join(' ')}`);
          break;
        }
        case 'rectangle':
          args.push(
            '-fill',
            background_color,
            '-draw',
            `roundrectangle 5,${size * 0.2},${size - 5},${size * 0.8},8,8`,
          );
          break;
        case 'ribbon':
          args.push(
            '-fill',
            background_color,
            '-draw',
            `polygon ${size * 0.05},${size * 0.25} ${size * 0.95},${size * 0.25} ${size * 0.85},${size * 0.5} ${size * 0.95},${size * 0.75} ${size * 0.05},${size * 0.75} ${size * 0.15},${size * 0.5}`,
          );
          break;
      }

      args.push(
        '-fill',
        text_color,
        '-stroke',
        'none',
        '-font',
        font,
        '-pointsize',
        String(fontSize),
        '-gravity',
        'Center',
        '-annotate',
        '+0+0',
        text,
      );

      args.push(out.localPath);
      await magick(args);
      await out.commit();
      return { content: [{ type: 'text', text: `Price badge (${shape}): ${output}` }] };
    },
  );

  // ── a-b-variants ────────────────────────────────────────────────────────
  registerTool<ABVariantsParams>(
    server,
    'a-b-variants',
    'Generate color, copy, or style variations of an image for A/B split testing',
    abVariantsSchema.shape,
    async (params: ABVariantsParams) => {
      const { input, output_dir, variants } = params;
      const inR = await resolveInput(input);
      const generated: string[] = [];
      try {
        for (const variant of variants) {
          const ext = input.split('.').pop() ?? 'png';
          const outUri = joinUri(output_dir, `variant_${variant.name}.${ext}`);
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);

          const args = [inR.localPath];

          if (variant.brightness !== undefined || variant.contrast !== undefined) {
            args.push(
              '-brightness-contrast',
              `${variant.brightness ?? 0}x${variant.contrast ?? 0}`,
            );
          }
          if (variant.saturation !== undefined) {
            args.push('-modulate', `100,${variant.saturation},100`);
          }
          if (variant.tint_color) {
            args.push('-fill', variant.tint_color, '-tint', '30');
          }
          if (variant.text_overlay) {
            const gravity =
              variant.text_position === 'top'
                ? 'North'
                : variant.text_position === 'center'
                  ? 'Center'
                  : 'South';
            args.push(
              '-fill',
              variant.text_color ?? 'white',
              '-pointsize',
              '36',
              '-gravity',
              gravity,
              '-annotate',
              '+0+20',
              variant.text_overlay,
            );
          }

          args.push(out.localPath);
          await magick(args);
          await out.commit();
          generated.push(`${variant.name}: ${outUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} A/B variants:\n${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── template-fill ───────────────────────────────────────────────────────
  registerTool<TemplateFillParams>(
    server,
    'template-fill',
    'Fill a reusable template with dynamic text and images — generate campaign creatives from templates',
    templateFillSchema.shape,
    async (params: TemplateFillParams) => {
      const { template, output, fills } = params;
      const templateR = await resolveInput(template);
      const out = await resolveOutput(output);
      const imageFillRs: Array<Awaited<ReturnType<typeof resolveInput>>> = [];
      try {
        await ensureOutputDir(out.localPath);

        const args = [templateR.localPath];

        for (const fill of fills) {
          if (fill.type === 'text') {
            if (fill.width && fill.height) {
              args.push(
                '(',
                '-size',
                `${fill.width}x${fill.height}`,
                '-background',
                'none',
                '-fill',
                fill.color ?? 'white',
                '-font',
                fill.font ?? 'Arial',
                '-pointsize',
                String(fill.font_size ?? 24),
                '-gravity',
                fill.gravity ?? 'Center',
                `caption:${fill.content}`,
                ')',
                '-gravity',
                'NorthWest',
                '-geometry',
                `+${fill.x}+${fill.y}`,
                '-composite',
              );
            } else {
              args.push(
                '-fill',
                fill.color ?? 'white',
                '-font',
                fill.font ?? 'Arial',
                '-pointsize',
                String(fill.font_size ?? 24),
                '-gravity',
                'NorthWest',
                '-annotate',
                `+${fill.x}+${fill.y}`,
                fill.content,
              );
            }
          } else {
            const fillR = await resolveInput(fill.content);
            imageFillRs.push(fillR);
            const resizeArgs =
              fill.width && fill.height
                ? [
                    '-resize',
                    `${fill.width}x${fill.height}^`,
                    '-gravity',
                    'center',
                    '-extent',
                    `${fill.width}x${fill.height}`,
                  ]
                : fill.width
                  ? ['-resize', `${fill.width}x`]
                  : [];

            args.push(
              '(',
              fillR.localPath,
              ...resizeArgs,
              ')',
              '-gravity',
              'NorthWest',
              '-geometry',
              `+${fill.x}+${fill.y}`,
              '-composite',
            );
          }
        }

        args.push(out.localPath);
        await magickBatch(args);
        await out.commit();
        return {
          content: [
            { type: 'text', text: `Template filled (${fills.length} elements): ${output}` },
          ],
        };
      } finally {
        await templateR.cleanup?.();
        await Promise.all(imageFillRs.map((r) => r.cleanup?.()));
      }
    },
  );

  // ── qr-code-overlay ─────────────────────────────────────────────────────
  registerTool<QrCodeOverlayParams>(
    server,
    'qr-code-overlay',
    'Composite a QR code image onto marketing materials at a specified position and size',
    qrCodeOverlaySchema.shape,
    async (params: QrCodeOverlayParams) => {
      const { input, qr_image, output, size, gravity, x, y, background, padding, format } = params;
      const io = await resolveIO({ input, output, suffix: '_qr', format });
      const qrR = await resolveInput(qr_image);
      try {
        await ensureOutputDir(io.outputLocal);

        const totalSize = size + padding * 2;

        const args = [
          io.inputLocal,
          '(',
          '-size',
          `${totalSize}x${totalSize}`,
          `xc:${background}`,
          '(',
          qrR.localPath,
          '-resize',
          `${size}x${size}`,
          ')',
          '-gravity',
          'Center',
          '-composite',
          ')',
          '-gravity',
          gravity,
          '-geometry',
          `+${x}+${y}`,
          '-composite',
          io.outputLocal,
        ];

        await magick(args);
        await io.finalize();
        return {
          content: [{ type: 'text', text: `QR code overlaid (${size}px): ${io.outputUri}` }],
        };
      } catch (err) {
        /* v8 ignore start */
        await io.cleanup();
        throw err;
        /* v8 ignore stop */
      } finally {
        await qrR.cleanup?.();
      }
    },
  );

  // ── product-mockup ──────────────────────────────────────────────────────
  registerTool<ProductMockupParams>(
    server,
    'product-mockup',
    'Place a screenshot onto a device frame (phone, laptop, tablet) for marketing and app store images',
    productMockupSchema.shape,
    async (params: ProductMockupParams) => {
      const {
        screenshot,
        frame,
        output,
        screen_x,
        screen_y,
        screen_width,
        screen_height,
        background,
      } = params;
      const screenshotR = await resolveInput(screenshot);
      const frameR = await resolveInput(frame);
      const out = await resolveOutput(output);
      try {
        await ensureOutputDir(out.localPath);

        const info = await magick(['identify', '-format', '%wx%h', frameR.localPath]);
        const [frameW, frameH] = info.trim().split('x').map(Number);

        const args = [
          '-size',
          `${frameW}x${frameH}`,
          `xc:${background}`,
          '(',
          screenshotR.localPath,
          '-resize',
          `${screen_width}x${screen_height}!`,
          ')',
          '-gravity',
          'NorthWest',
          '-geometry',
          `+${screen_x}+${screen_y}`,
          '-composite',
          frameR.localPath,
          '-gravity',
          'NorthWest',
          '-composite',
          out.localPath,
        ];

        await magick(args);
        await out.commit();
        return { content: [{ type: 'text', text: `Product mockup created: ${output}` }] };
      } finally {
        await screenshotR.cleanup?.();
        await frameR.cleanup?.();
      }
    },
  );
}

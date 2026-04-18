import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, ensureOutputDir, SOCIAL_SIZES } from '../utils/exec.js';
import { resolveInput, resolveOutput, joinUri } from '../utils/resource.js';
import { registerTool } from '../utils/register.js';
import {
  type SocialCardParams,
  type CarouselSetParams,
  type QuoteCardParams,
  type EmailHeaderParams,
  socialCardSchema,
  carouselSetSchema,
  quoteCardSchema,
  emailHeaderSchema,
} from './types.js';

/**
 * Register social media tools with the MCP server.
 *
 * Covers: social-card, carousel-set, quote-card, email-header.
 */
export function registerSocialTools(server: McpServer): void {
  // ── social-card ─────────────────────────────────────────────────────────
  registerTool<SocialCardParams>(
    server,
    'social-card',
    'Generate platform-sized social media cards (OG, Twitter, Instagram, Pinterest, LinkedIn, YouTube, Facebook Cover)',
    socialCardSchema.shape,
    async (params: SocialCardParams) => {
      const { input, output_dir, title, subtitle, platforms, font, text_color, overlay_color } =
        params;
      const inR = await resolveInput(input);
      const generated: string[] = [];
      try {
        for (const platform of platforms) {
          const size = SOCIAL_SIZES[platform];
          if (!size) continue;

          const outUri = joinUri(output_dir, `social_${platform}.png`);
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);

          const args = [
            inR.localPath,
            '-resize',
            `${size.width}x${size.height}^`,
            '-gravity',
            'center',
            '-extent',
            `${size.width}x${size.height}`,
          ];

          if (title) {
            args.push(
              '(',
              '-size',
              `${size.width}x${size.height}`,
              `gradient:${overlay_color}-transparent`,
              '-rotate',
              '180',
              ')',
              '-compose',
              'Over',
              '-composite',
            );

            const titleSize = Math.floor(size.width / 18);
            args.push(
              '-gravity',
              'SouthWest',
              '-font',
              font,
              '-pointsize',
              String(titleSize),
              '-fill',
              text_color,
              '-annotate',
              `+${Math.floor(size.width * 0.05)}+${Math.floor(size.height * 0.12)}`,
              title,
            );

            if (subtitle) {
              const subSize = Math.floor(titleSize * 0.6);
              args.push(
                '-pointsize',
                String(subSize),
                '-annotate',
                `+${Math.floor(size.width * 0.05)}+${Math.floor(size.height * 0.05)}`,
                subtitle,
              );
            }
          }

          args.push(out.localPath);
          await magick(args);
          await out.commit();
          generated.push(`${platform} (${size.width}x${size.height}): ${outUri}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Generated ${generated.length} social cards:\n${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
      }
    },
  );

  // ── carousel-set ────────────────────────────────────────────────────────
  registerTool<CarouselSetParams>(
    server,
    'carousel-set',
    'Generate numbered carousel slides with consistent branding — Instagram, Facebook ad carousels',
    carouselSetSchema.shape,
    async (params: CarouselSetParams) => {
      const { inputs, output_dir, width, height, show_numbers, number_style, brand_color, font } =
        params;

      const resolvedInputs = await Promise.all(inputs.map((i) => resolveInput(i)));
      const generated: string[] = [];
      try {
        for (let i = 0; i < resolvedInputs.length; i++) {
          const outUri = joinUri(output_dir, `carousel_${String(i + 1).padStart(2, '0')}.png`);
          const out = await resolveOutput(outUri);
          await ensureOutputDir(out.localPath);

          const args = [
            resolvedInputs[i].localPath,
            '-resize',
            `${width}x${height}^`,
            '-gravity',
            'center',
            '-extent',
            `${width}x${height}`,
          ];

          if (show_numbers) {
            const numSize = Math.floor(width * 0.04);
            if (number_style === 'circle') {
              const cx = Math.floor(width * 0.06);
              const cy = Math.floor(height * 0.06);
              const r = Math.floor(numSize * 1.2);
              args.push(
                '-fill',
                brand_color,
                '-draw',
                `circle ${cx},${cy} ${cx + r},${cy}`,
                '-fill',
                'white',
                '-font',
                font,
                '-pointsize',
                String(numSize),
                '-gravity',
                'NorthWest',
                '-annotate',
                `+${cx - Math.floor(numSize * 0.35)}+${cy - Math.floor(numSize * 0.45)}`,
                String(i + 1),
              );
            } else {
              args.push(
                '-fill',
                brand_color,
                '-font',
                font,
                '-pointsize',
                String(numSize * 2),
                '-gravity',
                'NorthWest',
                '-annotate',
                '+20+10',
                String(i + 1),
              );
            }
          }

          const barHeight = Math.floor(height * 0.005);
          const barWidth = Math.floor(((i + 1) / inputs.length) * width);
          args.push(
            '-fill',
            brand_color,
            '-draw',
            `rectangle 0,${height - barHeight},${barWidth},${height}`,
          );

          args.push(out.localPath);
          await magick(args);
          await out.commit();
          generated.push(outUri);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Carousel (${generated.length} slides): ${generated.join('\n')}`,
            },
          ],
        };
      } finally {
        await Promise.all(resolvedInputs.map((r) => r.cleanup?.()));
      }
    },
  );

  // ── quote-card ──────────────────────────────────────────────────────────
  registerTool<QuoteCardParams>(
    server,
    'quote-card',
    'Create a stylized quote image with attribution — testimonials, pull quotes, social sharing',
    quoteCardSchema.shape,
    async (params: QuoteCardParams) => {
      const {
        output,
        quote,
        attribution,
        width,
        height,
        background_color,
        text_color,
        accent_color,
        font,
        background_image,
      } = params;
      const out = await resolveOutput(output);
      const bgR = background_image ? await resolveInput(background_image) : null;
      try {
        await ensureOutputDir(out.localPath);

        const quoteSize = Math.floor(width / 22);
        const attrSize = Math.floor(quoteSize * 0.55);
        const margin = Math.floor(width * 0.1);
        const textWidth = width - margin * 2;

        let args: string[];

        if (bgR) {
          args = [
            bgR.localPath,
            '-resize',
            `${width}x${height}^`,
            '-gravity',
            'center',
            '-extent',
            `${width}x${height}`,
            '(',
            '-size',
            `${width}x${height}`,
            `xc:${background_color}AA`,
            ')',
            '-compose',
            'Over',
            '-composite',
          ];
        } else {
          args = ['-size', `${width}x${height}`, `xc:${background_color}`];
        }

        args.push(
          '-fill',
          accent_color,
          '-font',
          font,
          '-pointsize',
          String(quoteSize * 4),
          '-gravity',
          'NorthWest',
          '-annotate',
          `+${margin}+${Math.floor(height * 0.12)}`,
          '\u201C',
        );

        args.push(
          '(',
          '-size',
          `${textWidth}x`,
          '-background',
          'none',
          '-fill',
          text_color,
          '-font',
          font,
          '-pointsize',
          String(quoteSize),
          '-gravity',
          'West',
          `caption:${quote}`,
          ')',
          '-gravity',
          'Center',
          '-geometry',
          '+0-20',
          '-composite',
        );

        if (attribution) {
          args.push(
            '-fill',
            accent_color,
            '-font',
            font,
            '-pointsize',
            String(attrSize),
            '-gravity',
            'South',
            '-annotate',
            `+0+${Math.floor(height * 0.08)}`,
            attribution,
          );

          const lineY = height - Math.floor(height * 0.13);
          const lineStartX = Math.floor(width * 0.35);
          const lineEndX = Math.floor(width * 0.65);
          args.push(
            '-stroke',
            accent_color,
            '-strokewidth',
            '2',
            '-draw',
            `line ${lineStartX},${lineY} ${lineEndX},${lineY}`,
          );
        }

        args.push(out.localPath);
        await magick(args);
        await out.commit();
        return { content: [{ type: 'text', text: `Quote card created: ${output}` }] };
      } finally {
        await bgR?.cleanup?.();
      }
    },
  );

  // ── email-header ────────────────────────────────────────────────────────
  registerTool<EmailHeaderParams>(
    server,
    'email-header',
    'Generate email-safe header images at standard email width (600px) with fallback-friendly formats',
    emailHeaderSchema.shape,
    async (params: EmailHeaderParams) => {
      const {
        input,
        output,
        width,
        height,
        title,
        subtitle,
        background_color,
        text_color,
        font,
        format: _format,
      } = params;
      void _format;
      const out = await resolveOutput(output);
      const inR = input ? await resolveInput(input) : null;
      try {
        await ensureOutputDir(out.localPath);

        const args: string[] = [];

        if (inR) {
          args.push(
            inR.localPath,
            '-resize',
            `${width}x${height}^`,
            '-gravity',
            'center',
            '-extent',
            `${width}x${height}`,
          );
        } else {
          args.push('-size', `${width}x${height}`, `xc:${background_color}`);
        }

        if (title) {
          const titleSize = Math.floor(height * 0.2);
          args.push(
            '-fill',
            text_color,
            '-font',
            font,
            '-pointsize',
            String(titleSize),
            '-gravity',
            'Center',
            '-annotate',
            '+0-10',
            title,
          );
        }

        if (subtitle) {
          const subSize = Math.floor(height * 0.1);
          args.push(
            '-pointsize',
            String(subSize),
            '-annotate',
            `+0+${Math.floor(height * 0.15)}`,
            subtitle,
          );
        }

        args.push(out.localPath);
        await magick(args);
        await out.commit();
        return {
          content: [{ type: 'text', text: `Email header (${width}x${height}): ${output}` }],
        };
      } finally {
        await inR?.cleanup?.();
      }
    },
  );
}

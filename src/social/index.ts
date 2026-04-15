import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { magick, validateInputFile, ensureOutputDir, SOCIAL_SIZES } from '../utils/exec.js';
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
import { join } from 'node:path';

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
      await validateInputFile(input);
      await ensureOutputDir(join(output_dir, 'placeholder'));

      const generated: string[] = [];

      for (const platform of platforms) {
        const size = SOCIAL_SIZES[platform];
        if (!size) continue;

        const outPath = join(output_dir, `social_${platform}.png`);
        const args = [
          input,
          '-resize',
          `${size.width}x${size.height}^`,
          '-gravity',
          'center',
          '-extent',
          `${size.width}x${size.height}`,
        ];

        // Add gradient overlay for text readability
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

          // Add title
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

          // Add subtitle
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

        args.push(outPath);
        await magick(args);
        generated.push(`${platform} (${size.width}x${size.height}): ${outPath}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Generated ${generated.length} social cards:\n${generated.join('\n')}`,
          },
        ],
      };
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
      await ensureOutputDir(join(output_dir, 'placeholder'));
      const generated: string[] = [];

      for (let i = 0; i < inputs.length; i++) {
        await validateInputFile(inputs[i]);
        const outPath = join(output_dir, `carousel_${String(i + 1).padStart(2, '0')}.png`);

        const args = [
          inputs[i],
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
            // Draw a circle badge with the number
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

        // Progress bar at bottom
        const barHeight = Math.floor(height * 0.005);
        const barWidth = Math.floor(((i + 1) / inputs.length) * width);
        args.push(
          '-fill',
          brand_color,
          '-draw',
          `rectangle 0,${height - barHeight},${barWidth},${height}`,
        );

        args.push(outPath);
        await magick(args);
        generated.push(outPath);
      }

      return {
        content: [
          { type: 'text', text: `Carousel (${generated.length} slides): ${generated.join('\n')}` },
        ],
      };
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
      await ensureOutputDir(output);

      const quoteSize = Math.floor(width / 22);
      const attrSize = Math.floor(quoteSize * 0.55);
      const margin = Math.floor(width * 0.1);
      const textWidth = width - margin * 2;

      let args: string[];

      if (background_image) {
        await validateInputFile(background_image);
        args = [
          background_image,
          '-resize',
          `${width}x${height}^`,
          '-gravity',
          'center',
          '-extent',
          `${width}x${height}`,
          // Dark overlay for readability
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

      // Large quotation mark
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

      // Quote text (auto-wrapped using caption)
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

      // Attribution
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

        // Accent line above attribution
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

      args.push(output);
      await magick(args);
      return { content: [{ type: 'text', text: `Quote card created: ${output}` }] };
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
      void _format; // Format is encoded in the output path
      await ensureOutputDir(output);

      const args: string[] = [];

      if (input) {
        await validateInputFile(input);
        args.push(
          input,
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

      args.push(output);
      await magick(args);
      return { content: [{ type: 'text', text: `Email header (${width}x${height}): ${output}` }] };
    },
  );
}

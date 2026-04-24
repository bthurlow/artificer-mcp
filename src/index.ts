#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };
import { registerCoreTools } from './core/index.js';
import { registerTextTools } from './text/index.js';
import { registerCompositingTools } from './compositing/index.js';
import { registerColorTools } from './color/index.js';
import { registerContentTools } from './content/index.js';
import { registerSocialTools } from './social/index.js';
import { registerAdTools } from './ads/index.js';
import { registerAssetTools } from './assets/index.js';
import { registerStorageTools } from './storage/index.js';
import { registerVideoTools } from './video/index.js';
import { registerAudioTools } from './audio/index.js';
import { registerGenerationTools } from './generation/index.js';
import { registerGuideTools } from './guides/index.js';
import { registerWorkflowTools } from './workflows/index.js';
import { registerCatalogTools } from './catalog/catalog.js';

/**
 * artificer-mcp Server
 *
 * A comprehensive MCP server for AI-powered creative media generation and processing.
 *
 * Requires ImageMagick 7+ installed and available as `magick` in PATH.
 *
 * Categories:
 * - Core: resize, crop, smart-crop, rotate, flip, format-convert, compress, info, strip-metadata, batch
 * - Text: text-overlay, text-fit, text-path, annotate, caption-bar
 * - Compositing: composite, watermark, gradient-overlay, background-remove, drop-shadow, border, rounded-corners, mask-apply
 * - Color: adjust, tint, blur, sharpen, pixelate-region, color-extract, normalize, vignette
 * - Content: thumbnail, collage, before-after, gif-from-frames, sticker-cutout
 * - Social: social-card, carousel-set, quote-card, email-header
 * - Ads: banner-set, cta-button, price-badge, a-b-variants, template-fill, qr-code-overlay, product-mockup
 * - Assets: responsive-set, favicon-set, app-icon-set, splash-screen, sprite-sheet, nine-patch, aspect-crop-set, pdf-to-image, image-diff, optimize-batch
 * - Storage: storage_upload, storage_download, storage_list, storage_delete, storage_exists, storage_get_public_url, storage_get_signed_url
 * - Video: video_concatenate, video_trim, video_change_aspect_ratio, video_convert_format, video_change_speed, video_set_resolution, video_add_transitions, video_add_image_overlay, video_add_text_overlay, video_add_subtitles, video_add_b_roll, video_set_bitrate, video_set_codec, video_set_frame_rate
 * - Audio: audio_extract_from_video, audio_normalize, audio_convert_format, audio_convert_properties, audio_set_bitrate, audio_set_channels, audio_set_sample_rate, audio_remove_silence
 */
async function main(): Promise<void> {
  const server = new McpServer({
    name: 'artificer-mcp',
    version,
  });

  // Register all tool categories
  registerCoreTools(server);
  registerTextTools(server);
  registerCompositingTools(server);
  registerColorTools(server);
  registerContentTools(server);
  registerSocialTools(server);
  registerAdTools(server);
  registerAssetTools(server);
  registerStorageTools(server);
  registerVideoTools(server);
  registerAudioTools(server);
  registerGenerationTools(server);
  registerGuideTools(server);
  registerWorkflowTools(server);
  registerCatalogTools(server);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

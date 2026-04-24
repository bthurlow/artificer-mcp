import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFalVideoTools } from './video.js';

/**
 * Register all fal.ai generation tools with the MCP server.
 *
 * Covers: fal_generate_video.
 *
 * Phase 3+ will add fal_classify_text (safety), fal_generate_image,
 * and fal_generate_music / fal_generate_speech alongside this call.
 */
export function registerFalGenerationTools(server: McpServer): void {
  registerFalVideoTools(server);
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFalVideoTools } from './video.js';
import { registerFalSafetyTools } from './safety.js';

/**
 * Register all fal.ai generation tools with the MCP server.
 *
 * Covers: fal_generate_video, fal_classify_text.
 *
 * Phase 4+ will add fal_generate_image; Phase 5+ will add
 * fal_generate_music / fal_generate_speech alongside these.
 */
export function registerFalGenerationTools(server: McpServer): void {
  registerFalVideoTools(server);
  registerFalSafetyTools(server);
}

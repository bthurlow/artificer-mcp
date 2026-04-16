import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerImageGenTools } from './image.js';
import { registerVideoGenTools } from './video.js';

/**
 * Register all AI generation tools with the MCP server.
 *
 * Covers: gemini_generate_image, gemini_edit_image, gemini_upscale_image,
 * gemini_generate_video.
 */
export function registerGenerationTools(server: McpServer): void {
  registerImageGenTools(server);
  registerVideoGenTools(server);
}

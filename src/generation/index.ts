import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerImageGenTools } from './image.js';
import { registerVideoGenTools } from './video.js';
import { registerNanobananaTools } from './nanobanana.js';
import { registerSpeechGenTools } from './speech.js';
import { registerMusicGenTools } from './music.js';
import { registerFalGenerationTools } from './fal/index.js';

/**
 * Register all AI generation tools with the MCP server.
 *
 * Covers: gemini_generate_image, gemini_edit_image, gemini_upscale_image,
 * gemini_generate_video, gemini_nanobanana_generate_image,
 * gemini_generate_speech, gemini_generate_music, fal_generate_video.
 */
export function registerGenerationTools(server: McpServer): void {
  registerImageGenTools(server);
  registerVideoGenTools(server);
  registerNanobananaTools(server);
  registerSpeechGenTools(server);
  registerMusicGenTools(server);
  registerFalGenerationTools(server);
}

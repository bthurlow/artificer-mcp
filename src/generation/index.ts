import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerVideoGenTools } from './video.js';
import { registerOmniVideoTools } from './gemini-omni.js';
import { registerNanobananaTools } from './nanobanana.js';
import { registerSpeechGenTools } from './speech.js';
import { registerMusicGenTools } from './music.js';
import { registerFalGenerationTools } from './fal/index.js';
import { registerMvsepTools } from './mvsep/separate.js';

/**
 * Register all AI generation tools with the MCP server.
 *
 * Covers: gemini_generate_video, gemini_omni_generate_video, gemini_nanobanana_generate_image,
 * gemini_generate_speech, gemini_generate_music, fal_generate_video, mvsep_separate_audio.
 */
export function registerGenerationTools(server: McpServer): void {
  registerVideoGenTools(server);
  registerOmniVideoTools(server);
  registerNanobananaTools(server);
  registerSpeechGenTools(server);
  registerMusicGenTools(server);
  registerFalGenerationTools(server);
  registerMvsepTools(server);
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFalVideoTools } from './video.js';
import { registerFalSafetyTools } from './safety.js';
import { registerFalSpeechTools } from './speech.js';
import { registerFalMusicTools } from './music.js';
import { registerFalTranscriptionTools } from './transcription.js';
import { registerFalUploadTool } from './upload.js';

/**
 * Register all fal.ai generation tools with the MCP server.
 *
 * Covers: fal_generate_video, fal_classify_text, fal_generate_speech,
 * fal_generate_music, fal_transcribe, fal_upload.
 *
 * Phase 4+ will add fal_generate_image.
 */
export function registerFalGenerationTools(server: McpServer): void {
  registerFalVideoTools(server);
  registerFalSafetyTools(server);
  registerFalSpeechTools(server);
  registerFalMusicTools(server);
  registerFalTranscriptionTools(server);
  registerFalUploadTool(server);
}

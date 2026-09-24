import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFalVideoTools } from './video.js';
import { registerFalImageTools } from './image.js';
import { registerFalSafetyTools } from './safety.js';
import { registerFalSpeechTools } from './speech.js';
import { registerFalMusicTools } from './music.js';
import { registerFalTranscriptionTools } from './transcription.js';
import { registerFalUploadTool } from './upload.js';
import { registerFalSeparationTools } from './separation.js';

/**
 * Register all fal.ai generation tools with the MCP server.
 *
 * Covers: fal_generate_video, fal_generate_image, fal_classify_text,
 * fal_generate_speech, fal_generate_music, fal_transcribe,
 * fal_separate_audio, fal_upload.
 */
export function registerFalGenerationTools(server: McpServer): void {
  registerFalVideoTools(server);
  registerFalImageTools(server);
  registerFalSafetyTools(server);
  registerFalSpeechTools(server);
  registerFalMusicTools(server);
  registerFalTranscriptionTools(server);
  registerFalSeparationTools(server);
  registerFalUploadTool(server);
}

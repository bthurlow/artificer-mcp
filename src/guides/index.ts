import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerImagenPromptGuide } from './imagen.js';
import { registerNanobananaPromptGuide } from './nanobanana.js';
import { registerVeoPromptGuide } from './veo.js';
import { registerGeminiTtsPromptGuide } from './gemini-tts.js';
import { registerLyriaPromptGuide } from './lyria.js';
import { registerBrandSpecTool } from './brand-spec.js';

/**
 * Register prompt guide tools with the MCP server.
 *
 * Covers: gemini_image_prompt_guide, gemini_nanobanana_prompt_guide,
 * veo_video_prompt_guide, gemini_tts_prompt_guide, gemini_lyria_prompt_guide,
 * brand_spec_get.
 *
 * Per-model content lives in its own file under `src/guides/{slug}.ts` —
 * this module is the composition registry only. New guides land by adding
 * a file here and one import/register call below. See
 * `docs/conventions/prompt-guides.md` for the guide format spec.
 *
 * These are pure reference tools — no side effects, no API calls.
 * They return structured markdown to help compose effective prompts.
 */
export function registerGuideTools(server: McpServer): void {
  registerImagenPromptGuide(server);
  registerNanobananaPromptGuide(server);
  registerVeoPromptGuide(server);
  registerGeminiTtsPromptGuide(server);
  registerLyriaPromptGuide(server);
  registerBrandSpecTool(server);
}

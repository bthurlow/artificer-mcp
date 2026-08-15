import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';
import { loadBrandSpec } from '../brand.js';

/**
 * The accepted shape, surfaced verbatim when no spec is configured.
 *
 * Every nested object is `.strict()`, so a caller who guesses a key name
 * gets a hard error rather than a silent drop. Publishing the slot list
 * here means they can write a correct spec on the first attempt instead of
 * discovering the shape by trial and error.
 */
const ACCEPTED_SHAPE = {
  name: 'string',
  colors:
    'primary, primary_name, secondary, secondary_name, background, background_name, highlight, highlight_name, extras{name: hex}',
  fonts: 'regular, medium, semibold, bold, mono, sans, display, extras{name: path}',
  scene_description: 'string',
  tts: 'voice, accent, style, language_code',
  music: 'default_prompt',
  logo: 'full, wordmark, icon, watermark',
} as const;

export function registerBrandSpecTool(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'brand_spec_get',
    'Return the project brand spec (colors incl. background/highlight, fonts incl. mono/sans/display, scene description, default TTS voice, default Lyria prompt, logo variants) parsed from the ARTIFICER_BRAND_SPEC env var. Returns a `configured: false` result plus the accepted shape when the env var is unset. Unknown keys are rejected with an error naming the valid slots — nothing is silently dropped. Agents should call this once per session and reuse the values when composing text-overlay / image-gen / TTS / music prompts so projects stay visually consistent without the caller having to memorize specifics. No API call — pure env read.',
    z.object({}).shape,
    async () => {
      const spec = loadBrandSpec();
      if (!spec) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  configured: false,
                  hint: 'Set ARTIFICER_BRAND_SPEC in your MCP server env to a JSON object matching the brandSpecSchema. All fields optional.',
                  accepted_shape: ACCEPTED_SHAPE,
                },
                null,
                2,
              ),
            },
          ],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({ configured: true, spec }, null, 2) }],
      };
    },
  );
}

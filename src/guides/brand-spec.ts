import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';
import { loadBrandSpec } from '../brand.js';

export function registerBrandSpecTool(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'brand_spec_get',
    'Return the project brand spec (colors, fonts, scene description, default TTS voice, default Lyria prompt, watermark) parsed from the ARTIFICER_BRAND_SPEC env var. Returns a `configured: false` result when the env var is unset. Agents should call this once per session and reuse the values when composing text-overlay / image-gen / TTS / music prompts so projects stay visually consistent without the caller having to memorize specifics. No API call — pure env read.',
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
                  hint: 'Set ARTIFICER_BRAND_SPEC in your MCP server env to a JSON object matching the brandSpecSchema (name, colors, fonts, scene_description, tts.voice, music.default_prompt, watermark_uri). All fields optional.',
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

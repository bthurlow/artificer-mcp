import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const GROK_IMAGINE_GUIDE = `# xAI Grok Imagine Video — Prompt Guide

## What this model is best for
xAI's Grok Imagine Video lineage. Native audio output, multi-reference image conditioning, mid-tier pricing. Best when you want audio-out at lower cost than Veo 3.x with audio, or when you have multiple reference images for a single output.

## Picking a model
| Slug | Modality | Audio | Cost | Best for |
|------|----------|-------|------|----------|
| \`grok-imagine-t2v\` | t2v | yes | $0.05/s @ 480p, $0.07/s @ 720p | Cheapest audio-out t2v |
| \`grok-imagine-i2v\` | i2v | yes | $0.05–0.07/s | Audio + single image |
| \`grok-imagine-ref-i2v\` | reference-to-video | yes | $0.05–0.07/s | Multi-image conditioning |

## Known strengths
- Native audio at half-the-price of Veo 3.x's audio-on tier.
- Multi-reference image input (\`grok-imagine-ref-i2v\`) — useful for style-blending or character composition.
- 480p tier is the cheapest audio-on option in the catalog.

## Known weaknesses
- 720p resolution cap — no 1080p / 4K.
- Motion realism trails Veo / Sora / Kling Pro.
- Audio quality is functional but not premium.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to \`image_url\`.
- For reference-to-video: pass an array via \`extra_params: { reference_image_urls: [...] }\`. Grok supports the \`@Image1\`, \`@Image2\` syntax inside the prompt to reference specific images positionally.
- \`resolution\` — \`"480p"\` or \`"720p"\` (lowercase with \`p\` suffix).

## Prompt structure
Standard scene-action prompts work. For ref-to-video, use \`@Image1\` / \`@Image2\` tokens inside the prompt to refer to specific references: \`prompt: "@Image1 walking next to @Image2 on a beach"\`.

## Example prompts
- T2V: \`prompt: "A jazz trio playing in a dimly lit speakeasy, smoky atmosphere, gentle saxophone audio"\`
- I2V: \`prompt: "Subject begins speaking, ambient cafe audio"\`
- Ref: \`prompt: "@Image1 holding @Image2, soft afternoon light", extra_params: { reference_image_urls: [imgA, imgB] }\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`grok-imagine-t2v\` | \`xai/grok-imagine-video/text-to-video\` |
| \`grok-imagine-i2v\` | \`xai/grok-imagine-video/image-to-video\` |
| \`grok-imagine-ref-i2v\` | \`xai/grok-imagine-video/reference-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/xai/grok-imagine-video/text-to-video
- xAI Grok: https://x.ai
`;

export function registerGrokImaginePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'grok_imagine_prompt_guide',
    'Reference guide for xAI Grok Imagine Video — t2v / i2v / reference-to-video with native audio at $0.05–0.07/s. Cheapest audio-on option in the fal catalog. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: GROK_IMAGINE_GUIDE }] }),
  );
}

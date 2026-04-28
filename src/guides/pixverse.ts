import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const PIXVERSE_GUIDE = `# PixVerse Video — Prompt Guide

## What this model is best for
PixVerse spans realistic (v4+) and stylized/anime (v3.5 lineage) output across many generations. v6 is the latest. C1 is a cinematic-focused variant with native audio. Best for short-form social content; prompt adherence is reliable across the lineage.

## Picking a model
| Slug | Generation | Modality | Audio | Notable |
|------|-----------|----------|-------|--------|
| \`pixverse-c1-t2v\` | C1 (cinematic) | t2v | yes | $0.030–0.120/s, 1080p, up to 15s |
| \`pixverse-v6-t2v\` | v6 | t2v | no | Latest realistic PixVerse |
| \`pixverse-v6-i2v\` | v6 | i2v | no | Latest realistic i2v |
| \`pixverse-v5.6-t2v\` | v5.6 | t2v | no | v6 minus 1 |
| \`pixverse-v5.6-i2v\` | v5.6 | i2v | no | v6 minus 1, i2v |
| \`pixverse-v5.5-t2v\` | v5.5 | t2v | no | Multi-clip mode |
| \`pixverse-v5-t2v\` | v5 | t2v | no | Versatile |
| \`pixverse-v4.5-t2v\` | v4.5 | t2v | no | Stable mid-tier |
| \`pixverse-v4.5-i2v\` | v4.5 | i2v | no | Stable mid-tier i2v |
| \`pixverse-v4.5-fast-t2v\` | v4.5 fast | t2v | no | Faster v4.5 |
| \`pixverse-v4.5-fast-i2v\` | v4.5 fast | i2v | no | Faster v4.5 i2v |
| \`pixverse-v4-t2v\` | v4 | t2v | no | Older realistic |
| \`pixverse-v4-i2v\` | v4 | i2v | no | Older realistic i2v |
| \`pixverse-v3.5-t2v\` | v3.5 | t2v | no | **Stylized / anime** lineage (lives in video.stylized) |
| \`pixverse-v3.5-i2v\` | v3.5 | i2v | no | **Stylized / anime** i2v |

V5.5 / v5 / v4.5 typically: $0.15–0.4 per 5-second clip depending on resolution.

## Known strengths
- Wide generational depth — pick the version that matches a stylistic preference.
- v6 / v5.6 land cleanly in the realistic mid-tier alongside Hailuo and Wan.
- v3.5 retains a distinct stylized aesthetic later versions abandoned — useful for anime-leaning content.
- C1 cinematic supports native audio at competitive pricing.

## Known weaknesses
- Quality differences across generations are real — older versions noticeably trail v6 / v5.6.
- Most PixVerse versions don't output audio (only C1 does).
- Multi-clip mode (v5.5) needs careful prompting.

## Input requirements
- **prompt** (required, all variants).
- **image** (required for i2v) — maps to \`image_url\`.
- C1 audio: pass \`extra_params: { generate_audio_switch: true }\` to enable native audio.
- Resolution / duration vary by generation — read the synced spec at \`src/catalog/fal-specs/{slug}/openapi.json\` for exact knobs.

## Prompt structure
Realistic variants (v4+): standard subject + action + camera framing. Stylized v3.5: anime-tag prompts work better than full prose. C1: cinematic vocabulary (shot types, camera moves, lighting cues) lands well.

## Example prompts
- C1 cinematic: \`prompt: "Wide shot of a city skyline at golden hour, slow camera dolly", extra_params: { generate_audio_switch: true }\`
- Realistic v6: \`prompt: "A barista pulling espresso, close-up on the crema forming"\`
- Stylized v3.5: \`prompt: "1girl, blue hair, cherry blossoms, peaceful expression, anime style"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`pixverse-c1-t2v\` | \`fal-ai/pixverse/c1/text-to-video\` |
| \`pixverse-v6-t2v\` | \`fal-ai/pixverse/v6/text-to-video\` |
| \`pixverse-v6-i2v\` | \`fal-ai/pixverse/v6/image-to-video\` |
| \`pixverse-v5.6-t2v\` | \`fal-ai/pixverse/v5.6/text-to-video\` |
| \`pixverse-v5.6-i2v\` | \`fal-ai/pixverse/v5.6/image-to-video\` |
| \`pixverse-v5.5-t2v\` | \`fal-ai/pixverse/v5.5/text-to-video\` |
| \`pixverse-v5-t2v\` | \`fal-ai/pixverse/v5/text-to-video\` |
| \`pixverse-v4.5-t2v\` | \`fal-ai/pixverse/v4.5/text-to-video\` |
| \`pixverse-v4.5-i2v\` | \`fal-ai/pixverse/v4.5/image-to-video\` |
| \`pixverse-v4.5-fast-t2v\` | \`fal-ai/pixverse/v4.5/text-to-video/fast\` |
| \`pixverse-v4.5-fast-i2v\` | \`fal-ai/pixverse/v4.5/image-to-video/fast\` |
| \`pixverse-v4-t2v\` | \`fal-ai/pixverse/v4/text-to-video\` |
| \`pixverse-v4-i2v\` | \`fal-ai/pixverse/v4/image-to-video\` |
| \`pixverse-v3.5-t2v\` | \`fal-ai/pixverse/v3.5/text-to-video\` |
| \`pixverse-v3.5-i2v\` | \`fal-ai/pixverse/v3.5/image-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/pixverse/v6/text-to-video
- PixVerse: https://pixverse.ai
`;

export function registerPixversePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'pixverse_prompt_guide',
    'Reference guide for PixVerse Video — full lineage v3.5 (stylized/anime) through v6 (latest realistic) plus C1 cinematic with native audio. 15 routes across t2v / i2v / fast variants. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: PIXVERSE_GUIDE }] }),
  );
}

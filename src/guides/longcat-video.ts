import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LONGCAT_GUIDE = `# Meituan LongCat Video — Prompt Guide

## What this model is best for
LongCat is Meituan's long-form video model — designed to maintain coherence over longer clip durations than mainstream models. Best when clip length matters (extended action, multi-beat scenes, walkthroughs) and you can accept lower-than-premium per-second quality.

## Picking a model
| Slug | Resolution | Variant | Modality | Best for |
|------|-----------|---------|----------|----------|
| \`longcat-720p-t2v\` | 720p | base | t2v | Quality 720p t2v |
| \`longcat-720p-i2v\` | 720p | base | i2v | Quality 720p i2v |
| \`longcat-distilled-720p-t2v\` | 720p | distilled | t2v | Faster 720p t2v |
| \`longcat-distilled-720p-i2v\` | 720p | distilled | i2v | Faster 720p i2v |
| \`longcat-480p-t2v\` | 480p | base | t2v | Cheap long-form t2v |
| \`longcat-480p-i2v\` | 480p | base | i2v | Cheap long-form i2v |
| \`longcat-distilled-480p-t2v\` | 480p | distilled | t2v | Cheapest LongCat t2v |
| \`longcat-distilled-480p-i2v\` | 480p | distilled | i2v | Cheapest LongCat i2v |

Pricing: ~$0.04/generated-second at 30fps base tier.

## Known strengths
- **Long-form coherence** — clip length is the model's purpose.
- Distilled variants are 2× faster.
- 480p tier is genuinely cheap for the duration delivered.

## Known weaknesses
- Per-second quality at 720p trails Wan 2.7, Hailuo 02 Pro, Kling 2.1.
- 480p is functional but visibly low resolution.
- No native audio.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to \`image_url\`.
- Resolution is baked into the slug — pick the slug for the resolution you want; no \`resolution\` knob.

## Prompt structure
For long clips, structure the prompt as a sequence of beats: "First, X happens. Then Y. Finally Z." LongCat handles narrative pacing better than premium models which optimize for short, coherent moments.

## Example prompts
- T2V: \`prompt: "A street vendor opens his stall, arranges fruit on the counter, then waves at a passing customer who stops to buy"\`
- I2V: \`prompt: "Subject walks through the doorway, looks around, sits at the table, and starts reading"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`longcat-720p-t2v\` | \`fal-ai/longcat-video/text-to-video/720p\` |
| \`longcat-distilled-720p-t2v\` | \`fal-ai/longcat-video/distilled/text-to-video/720p\` |
| \`longcat-480p-t2v\` | \`fal-ai/longcat-video/text-to-video/480p\` |
| \`longcat-distilled-480p-t2v\` | \`fal-ai/longcat-video/distilled/text-to-video/480p\` |
| \`longcat-720p-i2v\` | \`fal-ai/longcat-video/image-to-video/720p\` |
| \`longcat-distilled-720p-i2v\` | \`fal-ai/longcat-video/distilled/image-to-video/720p\` |
| \`longcat-480p-i2v\` | \`fal-ai/longcat-video/image-to-video/480p\` |
| \`longcat-distilled-480p-i2v\` | \`fal-ai/longcat-video/distilled/image-to-video/480p\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/longcat-video/text-to-video/720p
`;

export function registerLongcatPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'longcat_prompt_guide',
    'Reference guide for Meituan LongCat Video — long-form coherent t2v + i2v at 720p / 480p with base + distilled variants. Pick when clip duration matters more than per-frame premium quality. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: LONGCAT_GUIDE }] }),
  );
}

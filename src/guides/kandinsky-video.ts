import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const KANDINSKY_GUIDE = `# Kandinsky 5 Video — Prompt Guide

## What this model is best for
Russian AI lab AIRI's Kandinsky 5 video lineage. Open-ish weights, distinctive aesthetic style (slightly painterly / European-cinema feel) that differs from Asian-market models like Kling and Hailuo. Best when you want a less-Hollywood look in t2v output.

## Picking a model
| Slug | Modality | Tier | Cost | Best for |
|------|----------|------|------|----------|
| \`kandinsky-5-pro-t2v\` | t2v | Pro | flat-rate per duration | Quality-first t2v |
| \`kandinsky-5-pro-i2v\` | i2v | Pro | flat-rate per duration | Quality-first i2v |
| \`kandinsky-5-distill-t2v\` | t2v | distilled | cheaper | Faster t2v iteration |
| \`kandinsky-5-t2v\` | t2v | base | cheaper | Cheapest Kandinsky |

Pricing is flat-rate per duration: typically $0.08 for 5s, $0.16 for 10s.

## Known strengths
- Distinctive painterly / European-cinema aesthetic.
- Solid prompt adherence on European architectural / classical-art subjects.
- Open-ish weights lineage.

## Known weaknesses
- Output style narrower than universal models (Veo, Sora).
- Limited duration tier (typically 5s or 10s only).
- No native audio.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to \`image_url\`.
- Duration is enum (5s / 10s) — pass via \`extra_params\` if you want to override the default.

## Prompt structure
Describe scene + style cues. Kandinsky responds well to art-historical references ("baroque", "art nouveau", "soviet poster style"). Lean into that if you want the model's distinctive aesthetic.

## Example prompts
- T2V: \`prompt: "A figure walking through a foggy birch forest, painterly style"\`
- I2V: \`prompt: "subject turns to face camera, slow motion"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`kandinsky-5-t2v\` | \`fal-ai/kandinsky5/text-to-video\` |
| \`kandinsky-5-pro-t2v\` | \`fal-ai/kandinsky5-pro/text-to-video\` |
| \`kandinsky-5-pro-i2v\` | \`fal-ai/kandinsky5-pro/image-to-video\` |
| \`kandinsky-5-distill-t2v\` | \`fal-ai/kandinsky5/text-to-video/distill\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/kandinsky5/text-to-video
`;

export function registerKandinskyVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'kandinsky_video_prompt_guide',
    'Reference guide for Kandinsky 5 Video — t2v + i2v from AIRI with a painterly / European-cinema aesthetic. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: KANDINSKY_GUIDE }] }),
  );
}

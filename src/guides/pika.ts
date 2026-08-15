import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const PIKA_GUIDE = `# Pika Video — Prompt Guide

## What this model is best for
Pika has a recognizable, slightly-stylized motion aesthetic distinct from Wan / Kling / Hailuo. Best for short-form social reels, brand intros, ad creative where the "Pika look" (mild motion exaggeration, smooth camera work) is desirable. Pika Scenes is the multi-image variant for combining multiple subjects in one clip.

## Picking a model
| Slug | Modality | Generation | Best for |
|------|----------|-----------|----------|
| \`pika-2.2-t2v\` | t2v | v2.2 | Latest Pika t2v, default pick |
| \`pika-2.2-pikascenes-i2v\` | multi-image i2v | v2.2 | Combine 2-5 subjects into one clip |
| \`pika-2.1-t2v\` | t2v | v2.1 | Prior-gen t2v |
| \`pika-2.1-i2v\` | i2v | v2.1 | Prior-gen i2v |
| \`pika-2-turbo-t2v\` | t2v | v2 turbo | Fastest Pika t2v |
| \`pika-2-turbo-i2v\` | i2v | v2 turbo | Fastest Pika i2v |

Pricing tiers: 5s @ 720p ≈ $0.20, 5s @ 1080p ≈ $0.45 for v2.2.

## Known strengths
- Distinctive motion aesthetic — recognizable in feed.
- Pika Scenes (multi-image input) is unique on fal.
- Turbo variants give 2× faster inference.

## Known weaknesses
- Output style is opinionated — not a neutral/realistic baseline.
- Older versions (v2 turbo) trail v2.2 noticeably.
- No native audio.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to \`image_url\`.
- For Pika Scenes: pass \`extra_params: { image_urls: [url1, url2, ...] }\` (an array, NOT a single \`image_url\`). Combined with \`ingredients_mode: "precise" | "creative"\` to control how literally Pika fuses the inputs.
- \`resolution\`: \`"720p"\` or \`"1080p"\`.
- \`duration\` is an integer (seconds) on v2.1 / v2-turbo.

## Prompt structure
Pika responds well to short prompts with strong nouns + a motion verb. Avoid overly directorial prose; Pika's strength is visual style, not directorial fidelity.

## Example prompts
- T2V: \`prompt: "Neon-lit Tokyo street at night, slow forward dolly, rain on the pavement"\`
- Pika Scenes: \`prompt: "A chef and a dog cooking together in a sunny kitchen", extra_params: { image_urls: [chef.jpg, dog.jpg], ingredients_mode: "creative" }\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`pika-2.2-t2v\` | \`fal-ai/pika/v2.2/text-to-video\` |
| \`pika-2.2-pikascenes-i2v\` | \`fal-ai/pika/v2.2/pikascenes\` |
| \`pika-2.1-t2v\` | \`fal-ai/pika/v2.1/text-to-video\` |
| \`pika-2.1-i2v\` | \`fal-ai/pika/v2.1/image-to-video\` |
| \`pika-2-turbo-t2v\` | \`fal-ai/pika/v2/turbo/text-to-video\` |
| \`pika-2-turbo-i2v\` | \`fal-ai/pika/v2/turbo/image-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/pika/v2.2/text-to-video
- Pika: https://pika.art
`;

export function registerPikaPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'pika_prompt_guide',
    'Reference guide for Pika Video — t2v / i2v / Pika Scenes (multi-image) across v2.2 / v2.1 / v2 Turbo. Distinctive social-reel motion aesthetic. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: PIKA_GUIDE }] }),
  );
}

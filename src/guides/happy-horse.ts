import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const HAPPY_HORSE_GUIDE = `# Alibaba Happy Horse — Prompt Guide

## What this model is best for
Alibaba's Happy Horse lineage — talking-head video with **native audio output and multilingual lip-sync**. Best when:
- The narration audio is in a non-English language (multilingual lip-sync is the differentiator).
- You need talking-head from a t2v or i2v starting point with synchronized audio in one model call.
- You're producing localized content for Asian markets where Happy Horse's lip-sync quality often beats English-tuned competitors.

## Picking a model
| Slug | Modality | Best for |
|------|----------|----------|
| \`happy-horse-t2v\` | t2v | Generate talking-head clip from prompt only |
| \`happy-horse-i2v\` | i2v | Animate a specific source portrait |
| \`happy-horse-ref-i2v\` | reference-to-video | Multi-image identity for talking-head |

Pricing: $0.14/s for 720p, $0.28/s for 1080p (uniform across modalities).

## Known strengths
- **Multilingual lip-sync** — model handles Mandarin, Cantonese, Japanese, Korean, English, more.
- Native audio in one call (no separate TTS step).
- Reference-to-video variant supports multi-image identity composition.

## Known weaknesses
- Subject animation outside of speech is conservative (gestures, body movement).
- Caps at 1080p.
- Lip-sync quality on heavily-accented English may trail dedicated avatar models like Kling AI Avatar v2 Pro.

## Input requirements
- **prompt** (required) — the narration text or scene description.
- **image** (required for i2v + ref) — source portrait. Maps to fal's \`image_url\`.
- For ref-to-video: pass additional reference images via \`extra_params: { reference_image_urls: [...] }\`.
- \`resolution\` — \`"720p"\` or \`"1080p"\`.

## Prompt structure
For talking-head output, the \`prompt\` is the narration text the avatar will speak. Add scene direction in brackets if the model accepts them. Pass language hints via \`extra_params\` if generating non-English speech.

## Example prompts
- T2V: \`prompt: "Hello and welcome to our shop. Today I'll show you our newest sourdough loaf."\`
- I2V: \`prompt: "你好，欢迎来到我们的店铺。", image: portrait.jpg\` (Mandarin example)
- Ref: \`prompt: "Welcome back!", extra_params: { reference_image_urls: [front.jpg, side.jpg] }\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`happy-horse-t2v\` | \`alibaba/happy-horse/text-to-video\` |
| \`happy-horse-i2v\` | \`alibaba/happy-horse/image-to-video\` |
| \`happy-horse-ref-i2v\` | \`alibaba/happy-horse/reference-to-video\` |

## Newer routes (added 2026-09-24)
Added in the 2026-09-24 fal catalog refresh. Model descriptions are fal's own; inputs come from each route's committed spec (\`src/catalog/fal-specs/<slug>/openapi.json\`). The sections above predate these routes and were not re-verified against them, so check a newer model's spec before assuming it matches.

| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`happy-horse-1.1-t2v\` | Happy Horse 1.1 is Alibaba's #1-ranked video model. This text-to-video endpoint generates 1080p video with synchronized native audio and multilingual lip-syn… | **\`prompt\`**, \`duration\`, \`resolution\`, \`aspect_ratio\` (+2 more) |
| \`happy-horse-1.1-i2v\` | Happy Horse 1.1 is Alibaba's #1-ranked video model. This image-to-video endpoint animates a still image into 1080p video with synchronized native audio and m… | **\`image_url\`**, \`duration\`, \`resolution\`, \`prompt\` (+2 more) |
| \`happy-horse-1.1-ref\` | Happy Horse 1.1 is Alibaba's #1-ranked video model. This reference-to-video endpoint turns up to 9 reference images into 1080p video with synchronized native… | **\`image_urls\`**, **\`prompt\`**, \`duration\`, \`resolution\`, \`aspect_ratio\` (+2 more) |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/alibaba/happy-horse/image-to-video
`;

export function registerHappyHorsePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'happy_horse_prompt_guide',
    'Reference guide for Alibaba Happy Horse — talking-head with native audio + multilingual lip-sync (Mandarin, Cantonese, Japanese, Korean, English). t2v / i2v / reference variants. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: HAPPY_HORSE_GUIDE }] }),
  );
}

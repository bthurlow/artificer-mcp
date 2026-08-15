import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MAREY_GUIDE = `# Moonvalley Marey — Prompt Guide

## What this model is best for
**Marey is the only major fal-hosted video model trained exclusively on fully licensed footage.** Best when generated content needs to clear commercial / IP review (advertising, agency work, branded content) and "model trained on scraped web data" is a deal-breaker for legal or sourcing reasons.

## Picking a model
| Slug | Modality | Best for |
|------|----------|----------|
| \`marey-t2v\` | text-to-video | Original scenes from prompt only |
| \`marey-i2v\` | image-to-video | Animating a clean source image |

Both share the licensed-data lineage. Pick by input modality.

## Known strengths
- **Clean training data lineage** — every frame Marey saw during training was licensed from rightsholders. The model's outputs do not encode pixels from scraped video.
- Cinematic output style, suitable for premium brand work.
- Predictable pricing — flat fee per clip.

## Known weaknesses
- Output style is constrained by the licensed corpus — narrower stylistic range than models trained on the open web.
- Single duration tier per call (5s or 10s — not arbitrary).
- No audio output.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to fal's \`image_url\`.
- Marey uses \`dimensions\` (not \`aspect_ratio\`) on the wire — pass via \`extra_params: { dimensions: "1920x1080" }\` if you need a non-default frame size.
- \`duration\` is an enum: \`"5s"\` or \`"10s"\` (string with unit suffix). Don't pass an integer.

## Prompt structure
Cinematic-style prompts perform best. Marey was trained on professional footage, so it understands directorial vocabulary: shot sizes (wide, medium, close), camera moves (dolly, crane, push-in), lighting cues (golden hour, overcast, key-rim).

## Example prompts
- T2V: \`prompt: "Wide establishing shot of a bakery at dawn, soft golden window light, slow dolly-in toward the shop"\`
- I2V: \`prompt: "Camera slowly orbits left around the subject, shallow depth of field"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`marey-t2v\` | \`moonvalley/marey/t2v\` |
| \`marey-i2v\` | \`moonvalley/marey/i2v\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/moonvalley/marey/t2v
- Moonvalley: https://moonvalley.com
`;

export function registerMareyPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'marey_prompt_guide',
    'Reference guide for Moonvalley Marey — t2v + i2v trained exclusively on licensed footage. Pick when commercial / IP-clean training data lineage matters. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MAREY_GUIDE }] }),
  );
}

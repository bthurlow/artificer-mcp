import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LUMA_RAY_GUIDE = `# Luma Dream Machine Ray 2 — Prompt Guide

## What this model is best for
Luma Ray 2 is the cinematic-realism tier of the Dream Machine line. It excels at coherent natural motion (animals running, water flowing, hair / cloth physics, atmospheric effects) and supports a wider aspect-ratio palette than most peers (16:9, 9:16, 4:3, 3:4, 21:9, 9:21). No native audio. Use Ray when motion realism matters more than dialogue, or when you need a non-standard aspect like 21:9 cinema or 4:3 retro.

Per tier orientation:
- **Ray 2** — full-quality model. ~$0.50 per 5 seconds at 540p. 720p costs 2x, 1080p costs 4x. 9s duration costs 2x.
- **Ray 2 Flash** — fast / cheap variant. ~$0.20 per 5 seconds at 540p. Same multipliers for higher resolution and 9s duration.

Both tiers support text-to-video and image-to-video. Image-to-video also supports an \`end_image_url\` for first-last-frame style transitions.

## Picking a model

| Slug | Modality | Max duration | Resolution options | Audio | Base cost (5s, 540p) | Best for |
|------|----------|--------------|--------------------|-------|----------------------|----------|
| \`luma-ray-2-t2v\` | t2v | 9s | 540p / 720p / 1080p | None (silent) | $0.50 | Full-quality cinematic clips |
| \`luma-ray-2-i2v\` | i2v + optional end-frame | 9s | 540p / 720p / 1080p | None | $0.50 | Anchored cinematic with optional end frame |
| \`luma-ray-2-flash-t2v\` | t2v | 9s | 540p / 720p / 1080p | None | $0.20 | Fast iteration, cheap drafts |
| \`luma-ray-2-flash-i2v\` | i2v + optional end-frame | 9s | 540p / 720p / 1080p | None | $0.20 | Cheap anchored clips |

Cost scales: 720p × 2, 1080p × 4, 9s duration × 2. So a Ray 2 t2v at 1080p / 9s is \`$0.50 × 4 × 2 = $4.00\`.

Default picks:
- Cheap looping background clip → **luma-ray-2-flash-t2v** with \`loop: true\`.
- Hero motion-realism shot → **luma-ray-2-t2v** at 1080p.
- Bridge between two stills → **luma-ray-2-i2v** with both \`image_url\` (start) and \`end_image_url\`.

## Known strengths
- Best-in-class natural motion physics (water, fire, fur, foliage).
- Wide aspect ratio support including 4:3, 3:4, 21:9, 9:21 — the only major fal video model with this range.
- \`loop: true\` cleanly blends end into beginning for tile-able backgrounds.
- I2V supports both \`image_url\` (start frame) and \`end_image_url\` (end frame) — built-in first-last-frame without a separate endpoint.

## Known weaknesses / quirks
- **No native audio.** Generate audio separately (lyria / minimax-music / elevenlabs-sfx) and mux post-hoc.
- **Default resolution is 540p**, not 720p. If you don't specify, you get 540p output. Pass \`resolution: "720p"\` (or 1080p) explicitly.
- **Duration is enum \`"5s"\` or \`"9s"\` only.** No 4s, no 8s, no integer-ish values. The artificer transport's \`duration_seconds\` integer is stringified — pass \`5\` or \`9\`. Other values 4xx.
- **9s duration multiplies cost by 2x.** Plan accordingly.
- **\`end_image_url\` is optional but pairs with \`image_url\`.** You can pass \`end_image_url\` alone (rare) or both for first-last-frame motion.
- I2V \`image_url\` is technically optional in the schema — passing only a prompt without an image effectively makes it t2v but billed at the i2v slug. Not useful; just call the t2v slug.

## Input requirements

The artificer transport (\`fal_generate_video\`) maps \`image\` → \`image_url\`. Ray 2 i2v uses \`image_url\` as the start-frame key, so the structural arg flows through cleanly. The end-frame must go through \`extra_params\`.

| Variant | Required wire keys | Optional via \`extra_params\` | Notes |
|---------|--------------------|------------------------------|-------|
| \`luma-ray-2-t2v\` / \`luma-ray-2-flash-t2v\` | \`prompt\` | \`aspect_ratio\`, \`loop\`, \`resolution\`, \`duration\` | Pure t2v. |
| \`luma-ray-2-i2v\` / \`luma-ray-2-flash-i2v\` | \`prompt\` | \`image_url\`, \`end_image_url\`, \`aspect_ratio\`, \`loop\`, \`resolution\`, \`duration\` | Transport \`image\` → \`image_url\` (start frame). For end frame, pass via \`extra_params: { end_image_url: "..." }\`. \`image_url\` is technically optional in the schema. |

Common knobs:
- \`aspect_ratio\` — \`"16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21"\`. Default \`"16:9"\`.
- \`resolution\` — \`"540p" | "720p" | "1080p"\`. Default \`"540p"\`.
- \`duration\` — \`"5s" | "9s"\`. Default \`"5s"\`. (Transport accepts integer 5 or 9.)
- \`loop\` — boolean. \`true\` blends end into beginning.
- \`negative_prompt\` — NOT in the Ray 2 schema. Don't pass it.

## Prompt structure

Ray 2 prompts work best as **dense visual descriptions** that emphasize motion, light, and texture. The model is a motion specialist — explicit motion language rewards more than abstract mood.

Patterns that consistently work:
- Lead with the **shot type and motion** ("wide tracking shot", "slow drone descent", "static close-up with subtle parallax").
- Pile on **physical detail**: textures, light direction, color temperature, atmospheric effects (dust motes, mist, particle drift).
- Include **action verbs in present tense**: gallops, drifts, swirls, crashes, glides.
- Specify **lens / film vocabulary** ("shot on 35mm", "shallow depth of field", "anamorphic flare") — Ray honors these.
- Keep prompts to one or two sentences. Long multi-clause prompts dilute focus.

For i2v, lean on **motion direction** and **time-of-day or atmospheric shift**: "subtle parallax push-in, light shifts from cool to warm, gentle wind through hair." The image carries scene; you describe how it should move.

For first-last-frame (i2v with both \`image_url\` and \`end_image_url\`), describe the **transition arc** — what changes between the two frames in motion / light / camera position.

## Example prompts

**T2V cinematic motion realism:**
> "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind. Wide tracking shot with dynamic motion, warm natural lighting, anamorphic flare, 35mm film grain."

**T2V looping background (use \`loop: true\`):**
> "Slow drift of bioluminescent plankton in deep ocean water, soft blue light filtering down from the surface, particles swirling gently. Static composition, cinematic depth, subtle motion."

**I2V with start frame:**
> "Subtle parallax push-in, gentle wind moving through her hair, light shifts from cool morning to soft golden hour. Calm steady frame."
>
> Pair with a single still passed through the structural \`image\` arg.

**I2V with first-last-frame motion (Flash, cheap option):**
> "Camera arcs around the subject from left to right; light transitions from cool morning to warm midday glow."
>
> Pair with a structural \`image\` arg (start frame) AND \`extra_params: { end_image_url: "..." }\` (end frame).

## Access routes

| Slug | fal endpoint id |
|------|-----------------|
| \`luma-ray-2-t2v\` | \`fal-ai/luma-dream-machine/ray-2\` |
| \`luma-ray-2-i2v\` | \`fal-ai/luma-dream-machine/ray-2/image-to-video\` |
| \`luma-ray-2-flash-t2v\` | \`fal-ai/luma-dream-machine/ray-2-flash\` |
| \`luma-ray-2-flash-i2v\` | \`fal-ai/luma-dream-machine/ray-2-flash/image-to-video\` |

All four route through \`fal_generate_video\` with \`FAL_KEY\`. No Google or direct-Luma route in this catalog.

## Last verified
2026-04-28 — initial seed of full fal video catalog. Pricing and input schemas grounded in committed fal-specs (luma-ray-2-t2v, luma-ray-2-i2v, luma-ray-2-flash-t2v, luma-ray-2-flash-i2v).

## Official references
- Ray 2 (t2v): https://fal.ai/models/fal-ai/luma-dream-machine/ray-2
- Ray 2 (i2v): https://fal.ai/models/fal-ai/luma-dream-machine/ray-2/image-to-video
- Ray 2 Flash (t2v): https://fal.ai/models/fal-ai/luma-dream-machine/ray-2-flash
- Ray 2 Flash (i2v): https://fal.ai/models/fal-ai/luma-dream-machine/ray-2-flash/image-to-video
- Luma upstream: https://lumalabs.ai/dream-machine
`;

export function registerLumaRayPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'luma_ray_prompt_guide',
    'Reference guide for Luma Dream Machine Ray 2 on fal (Ray 2 + Ray 2 Flash, t2v + i2v). Covers tier selection, the wide aspect-ratio palette (16:9 / 9:16 / 4:3 / 3:4 / 21:9 / 9:21), end_image_url for first-last-frame, the 540p default and 9s 2x cost multiplier, motion-realism prompt patterns, and example prompts. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: LUMA_RAY_GUIDE }],
    }),
  );
}

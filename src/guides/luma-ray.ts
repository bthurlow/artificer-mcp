import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LUMA_RAY_GUIDE = `# Luma Ray 3.2 — Prompt Guide

## What this model is best for
Luma Ray is the cinematic-realism line from Luma (Dream Machine). It excels at coherent natural motion (animals running, water flowing, hair / cloth physics, atmospheric effects) and offers a wider aspect-ratio palette than most peers (16:9, 9:16, 4:3, 3:4, 1:1, 21:9). No native audio. Use Ray when motion realism matters more than dialogue, or when you need 21:9 cinema or 4:3 retro framing.

Ray 3.2 adds seamless loops, HDR output (with optional EXR export), and multi-keyframe image-to-video: up to 64 guide images pinned at chosen frames.

**Ray 2 and Ray 2 Flash are gone.** fal removed \`fal-ai/luma-dream-machine/ray-2\` and \`ray-2-flash\` (t2v and i2v) in November 2026, so the \`luma-ray-2-*\` slugs were retired. Ray 3.2 is the replacement for all four. There is no cheap "Flash" tier any more; for cheap drafts use the 540p tier below, or another family's fast tier.

## Picking a model

| Slug | Modality | Durations | Resolutions | Audio | Cost (5s: 540p / 720p / 1080p) | Best for |
|------|----------|-----------|-------------|-------|--------------------------------|----------|
| \`luma-ray-3.2-t2v\` | t2v | 5s, 10s | 540p / 720p / 1080p | None (silent) | $0.50 / $1.00 / $2.00 (10s doubles) | Cinematic clips from a prompt |
| \`luma-ray-3.2-i2v\` | i2v: start frame + optional end frame, or keyframes | 5s (10s with keyframes) | 540p / 720p / 1080p | None | $0.15 / $0.30 / $1.20 | Anchored motion, first-last-frame bridges, keyframed sequences |

Costs are fal's published pricing for each route. HDR i2v (5s) is $0.60 at 720p and $2.40 at 1080p; HDR + EXR is $0.90 / $3.60. HDR is not offered at 540p.

The same model also edits video: \`luma-ray-3.2-v2v\` (restyle) and \`luma-ray-3.2-reframe\` (change aspect ratio). Those are covered by \`fal_video_edit_prompt_guide\`.

Default picks:
- Cheap looping background clip → **luma-ray-3.2-t2v** at 540p with \`loop: true\` (5s only).
- Hero motion-realism shot → **luma-ray-3.2-t2v** at 1080p.
- Bridge between two stills → **luma-ray-3.2-i2v** with \`image_url\` (start) and \`end_image_url\`.
- A shot that must hit several set poses → **luma-ray-3.2-i2v** with \`keyframes\` + \`keyframe_indexes\`.

## Known strengths
- Best-in-class natural motion physics (water, fire, fur, foliage).
- Wide aspect-ratio support, including 4:3, 3:4, 1:1 and 21:9.
- \`loop: true\` cleanly blends the end into the beginning for tileable backgrounds.
- Three i2v anchoring modes: a start frame, start + end frames, or up to 64 keyframes.
- HDR MP4 output (and EXR export) for grading pipelines, where the account has HDR access.

## Known weaknesses / quirks
- **No native audio.** Generate audio separately (lyria / minimax-music / elevenlabs-sfx) and mux it afterwards.
- **Default resolution is 540p**, not 720p. Pass \`resolution: "720p"\` (or 1080p) explicitly.
- **\`duration\` is the string enum \`"5s"\` or \`"10s"\`.** The \`fal_generate_video\` \`duration_seconds\` argument sends an integer, which these routes reject. Leave \`duration_seconds\` unset and pass \`extra_params: { duration: "10s" }\` instead (omit it for the 5s default).
- **10s i2v needs keyframes.** The schema allows 10s only with \`keyframes\` / \`keyframe_indexes\`, not with \`image_url\` / \`end_image_url\`. fal's pricing note for i2v lists 5s prices only, so test a 10s keyframed run before relying on it.
- **\`loop\`** works only for SDR output without an end frame or keyframes, and on t2v only at 5s.
- **\`hdr\`** needs HDR access on the fal account and 720p or 1080p. On t2v it is not supported with 10s. Neither route supports HDR with \`loop\`. \`exr_export\` requires \`hdr: true\`.
- **Anchoring modes are exclusive.** \`image_url\` (with optional \`end_image_url\`) or \`keyframes\`, never both.
- No \`negative_prompt\` in the schema. Don't pass it.

## Input requirements

The artificer transport (\`fal_generate_video\`) maps \`image\` → \`image_url\` (the start frame). The end frame and keyframes are extra files: pass them through \`extra_files\` so local or \`gs://\` paths are uploaded first.

| Variant | Required wire keys | Optional | Notes |
|---------|--------------------|----------|-------|
| \`luma-ray-3.2-t2v\` | \`prompt\` | \`aspect_ratio\`, \`resolution\`, \`duration\`, \`loop\`, \`hdr\`, \`exr_export\` | Pure t2v. |
| \`luma-ray-3.2-i2v\` | \`prompt\` | \`image_url\`, \`end_image_url\`, \`keyframes\`, \`keyframe_indexes\`, \`aspect_ratio\`, \`resolution\`, \`duration\`, \`loop\`, \`hdr\`, \`exr_export\` | \`image\` → \`image_url\`. End frame: \`extra_files: { end_image_url: "..." }\`. Keyframes: \`extra_files: { keyframes: [...] }\` + \`extra_params: { keyframe_indexes: [...] }\`. |

Common knobs:
- \`aspect_ratio\` — \`"16:9" | "9:16" | "4:3" | "3:4" | "1:1" | "21:9"\`. Default \`"16:9"\`. (Ray 2's 9:21 is not offered.)
- \`resolution\` — \`"540p" | "720p" | "1080p"\`. Default \`"540p"\`.
- \`duration\` — \`"5s" | "10s"\` via \`extra_params\`. Default \`"5s"\`.
- \`loop\` — boolean. \`true\` blends the end into the beginning.

**Keyframe math.** \`keyframe_indexes\` are output frame positions at 24 fps, not seconds: 0–120 for 5s, 0–240 for 10s. They must be non-negative, unique, and the same length as \`keyframes\`. A pose at 2.5 s is index 60.

## Prompt structure

Ray prompts work best as **dense visual descriptions** that emphasize motion, light, and texture. The model is a motion specialist: explicit motion language pays off more than abstract mood.

Patterns that consistently work:
- Lead with the **shot type and motion** ("wide tracking shot", "slow drone descent", "static close-up with subtle parallax").
- Pile on **physical detail**: textures, light direction, color temperature, atmospheric effects (dust motes, mist, particle drift).
- Use **action verbs in the present tense**: gallops, drifts, swirls, crashes, glides.
- Use **lens / film vocabulary** ("shot on 35mm", "shallow depth of field", "anamorphic flare").
- Keep prompts to one or two sentences. Long multi-clause prompts dilute focus.

For i2v, lean on **motion direction** and a **time-of-day or atmospheric shift**: "subtle parallax push-in, light shifts from cool to warm, gentle wind through hair." The image carries the scene; you describe how it should move.

For first-last-frame and keyframed i2v, describe the **transition arc**: what changes between anchors in motion, light, and camera position.

## Example prompts

**T2V cinematic motion realism:**
> "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind. Wide tracking shot with dynamic motion, warm natural lighting, anamorphic flare, 35mm film grain."

**T2V looping background (\`loop: true\`, 5s):**
> "Slow drift of bioluminescent plankton in deep ocean water, soft blue light filtering down from the surface, particles swirling gently. Static composition, cinematic depth, subtle motion."

**I2V with a start frame:**
> "Subtle parallax push-in, gentle wind moving through her hair, light shifts from cool morning to soft golden hour. Calm steady frame."
>
> Pair with a single still passed through the structural \`image\` arg.

**I2V first-last-frame:**
> "Camera arcs around the subject from left to right; light transitions from cool morning to warm midday glow."
>
> Pair with the structural \`image\` arg (start frame) and \`extra_files: { end_image_url: "..." }\` (end frame).

## Access routes

| Slug | fal endpoint id |
|------|-----------------|
| \`luma-ray-3.2-t2v\` | \`luma/agent/ray/v3.2/text-to-video\` |
| \`luma-ray-3.2-i2v\` | \`luma/agent/ray/v3.2/image-to-video\` |

Both route through \`fal_generate_video\` with \`FAL_KEY\`. No Google or direct-Luma route in this catalog.

## Last verified
2026-11-11 — rewritten for Ray 3.2 after fal retired Ray 2 / Ray 2 Flash. Inputs and pricing from the committed fal specs (\`src/catalog/fal-specs/luma-ray-3.2-t2v\`, \`luma-ray-3.2-i2v\`). The prompt-structure advice carries over from Ray 2 and has not been re-tested on 3.2.

## Official references
- Ray 3.2 (t2v): https://fal.ai/models/luma/agent/ray/v3.2/text-to-video
- Ray 3.2 (i2v): https://fal.ai/models/luma/agent/ray/v3.2/image-to-video
- Luma upstream: https://lumalabs.ai/dream-machine
`;

export function registerLumaRayPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'luma_ray_prompt_guide',
    'Reference guide for Luma Ray 3.2 on fal (t2v + i2v; Ray 2 / Ray 2 Flash were retired). Covers pricing, the aspect-ratio palette (16:9 / 9:16 / 4:3 / 3:4 / 1:1 / 21:9), the "5s"/"10s" duration enum (pass via extra_params), loops, HDR, end_image_url first-last-frame and multi-keyframe i2v, motion-realism prompt patterns, and example prompts. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: LUMA_RAY_GUIDE }],
    }),
  );
}

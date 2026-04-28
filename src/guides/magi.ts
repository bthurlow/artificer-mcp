import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MAGI_GUIDE = `# MAGI-1 — Prompt Guide

## What this model is best for
Physics-aware video generation — MAGI-1 incorporates explicit physics priors so motion respects momentum, gravity, and surface contact more reliably than aesthetic-trained models. Best for product demos, physical-action scenes (sports, mechanics, splash/fluid), and synthetic data where motion plausibility matters.

## Picking a model
| Slug | Modality | Variant | Best for |
|------|----------|---------|----------|
| \`magi-t2v\` | t2v | full | Best quality from prompt only |
| \`magi-distilled-t2v\` | t2v | distilled | Faster t2v at slightly lower quality |
| \`magi-i2v\` | i2v | full | Animating a known starting frame |
| \`magi-distilled-i2v\` | i2v | distilled | Faster i2v |

Pricing tiers by inference steps — base = 16 steps; doubling steps roughly doubles cost. Default 4-second clip; additional seconds priced linearly.

## Known strengths
- Physics-plausible motion (collisions, momentum, fluid).
- Strong on object trajectories and contact reactions.
- Distilled variants give ~2× faster inference.

## Known weaknesses
- Aesthetic / cinematic quality trails Veo / Sora / Kling.
- Inference-step pricing model — overshooting steps gets expensive fast.
- No native audio.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to \`image_url\`.
- \`num_inference_steps\` knob via \`extra_params\` — defaults to 16; max 64. Doubling steps multiplies cost by ~2×.

## Prompt structure
Lead with the physical action, then add subject details. Concrete physics descriptors help: "ball drops onto trampoline and bounces twice", "water splashes outward as rock hits surface". Avoid abstract aesthetic prompts — that's not what MAGI is for.

## Example prompts
- T2V: \`prompt: "A glass falls from a table and shatters on tile floor, fragments scattering"\`
- I2V: \`prompt: "Subject jumps off a stool, lands and stumbles slightly forward"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`magi-t2v\` | \`fal-ai/magi\` |
| \`magi-distilled-t2v\` | \`fal-ai/magi-distilled\` |
| \`magi-i2v\` | \`fal-ai/magi/image-to-video\` |
| \`magi-distilled-i2v\` | \`fal-ai/magi-distilled/image-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/magi
`;

export function registerMagiPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'magi_prompt_guide',
    'Reference guide for MAGI-1 — physics-aware video generation. Pick when motion plausibility (collisions, momentum, fluids) matters more than cinematic aesthetic. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MAGI_GUIDE }] }),
  );
}

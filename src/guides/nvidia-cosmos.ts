import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const COSMOS_GUIDE = `# NVIDIA Cosmos Predict 2.5 — Prompt Guide

## What this model is best for
NVIDIA's Cosmos Predict lineage — world-model / robotics-aware video generation. Best for physics-plausible motion, object permanence across frames, and synthetic data for robotics/sim-to-real workflows. Not aimed at cinematic / social-content output.

## Picking a model
| Slug | Modality | Variant | Best for |
|------|----------|---------|----------|
| \`cosmos-2.5-t2v\` | t2v | full | Physics-plausible motion from text |
| \`cosmos-2.5-i2v\` | i2v | full | Animating a known scene state |
| \`cosmos-2.5-distilled-t2v\` | t2v | distilled | Faster t2v at slightly lower quality |

Fixed resolution and duration per call (1280×704, 93 frames @ 16fps ≈ 5.8s).

## Known strengths
- World-model training — strong physics plausibility (gravity, object interaction, surface contact).
- Object permanence holds across the full clip.
- Good for synthetic data generation (robotics sim, AV scenarios).

## Known weaknesses
- Aesthetic output trails models tuned for entertainment.
- Fixed resolution + duration. No per-call control.
- Limited stylistic range — leans naturalistic / photoreal.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to \`image_url\`.
- No \`duration_seconds\`, \`resolution\`, or \`aspect_ratio\` knobs — these are fixed.

## Prompt structure
Describe scene state and any directional motion. Concrete physical descriptors (mass, surface, motion vector) help more than artistic vocabulary.

## Example prompts
- T2V: \`prompt: "A robot arm picks up a red cube from a table and places it in a bin"\`
- I2V: \`prompt: "subject continues walking forward at the same pace, no camera movement"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`cosmos-2.5-t2v\` | \`fal-ai/cosmos-predict-2.5/text-to-video\` |
| \`cosmos-2.5-i2v\` | \`fal-ai/cosmos-predict-2.5/image-to-video\` |
| \`cosmos-2.5-distilled-t2v\` | \`fal-ai/cosmos-predict-2.5/distilled/text-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/cosmos-predict-2.5/text-to-video
- NVIDIA Cosmos: https://www.nvidia.com/en-us/ai/cosmos/
`;

export function registerNvidiaCosmosPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'nvidia_cosmos_prompt_guide',
    'Reference guide for NVIDIA Cosmos Predict 2.5 — world-model / robotics-aware video generation. Physics-plausible motion, object permanence; not cinematic. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: COSMOS_GUIDE }] }),
  );
}

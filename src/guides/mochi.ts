import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MOCHI_GUIDE = `# Mochi 1 — Prompt Guide

## What this model is best for
Open-weights text-to-video preview model from Genmo. Best for research workflows, fine-tuning experiments, or when caller wants the lineage compatible with locally-runnable Mochi-1 weights. Not the right pick for premium-quality output — reach for Veo, Sora, or Kling for production.

## Picking a model
Single fal route. Mochi has limited duration (a few seconds) and modest resolution by current premium-tier standards.

## Known strengths
- Open-weights lineage — replicable locally with the same model weights if needed.
- Reasonable adherence to prompt for general scenes.
- Cheaper than premium-tier alternatives at fal.

## Known weaknesses
- Output quality and motion realism trail Veo / Sora / Kling.
- Short duration cap.
- No audio output.

## Input requirements
- **prompt** (required) — scene description.
- T2V only — no image-conditioning route on fal.

## Prompt structure
Standard t2v phrasing: subject, action, camera/composition cue, optional style/lighting note. Mochi was trained heavily on naturalistic captions; verbose shot direction is fine but flowery prose helps less than concrete nouns.

## Example prompts
- \`prompt: "An astronaut riding a horse on Mars, dust kicking up behind, cinematic wide shot"\`
- \`prompt: "Close-up of a glowing jellyfish drifting in dark water, soft bioluminescent light"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`mochi-v1-t2v\` | \`fal-ai/mochi-v1\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/mochi-v1
- Genmo Mochi-1: https://github.com/genmoai/models
`;

export function registerMochiPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'mochi_prompt_guide',
    'Reference guide for Mochi 1 — open-weights t2v preview from Genmo. Research / replication workflows; production work should pick a premium-tier model. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MOCHI_GUIDE }] }),
  );
}

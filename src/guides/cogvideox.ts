import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const COGVIDEOX_GUIDE = `# CogVideoX-5B — Prompt Guide

## What this model is best for
Open-weights 5B-parameter video model from THUDM / Zhipu AI. Best for research workflows, fine-tuning experiments, or when caller wants a fal-hosted alias for the popular CogVideoX local model. Production-quality output trails Veo / Sora / Kling.

## Picking a model
| Slug | Modality | Best for |
|------|----------|----------|
| \`cogvideox-5b-t2v\` | text-to-video | General prompt-driven scenes |
| \`cogvideox-5b-i2v\` | image-to-video | Animating a known starting frame |

## Known strengths
- Open weights — replicable locally.
- Reasonable scene composition for general prompts.
- Cheap per-clip cost.

## Known weaknesses
- Motion realism trails premium peers.
- Short duration cap.
- No native audio.

## Input requirements
- **prompt** (required, both modalities).
- **image** (required for i2v) — maps to fal's \`image_url\`.

## Prompt structure
Standard t2v / i2v phrasing. Subject-action-camera framing works well. Verbose prompts are tolerated but not required.

## Example prompts
- T2V: \`prompt: "A panda eating bamboo in a misty forest, gentle camera pan"\`
- I2V: \`prompt: "subject begins walking forward, slight head turn"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`cogvideox-5b-t2v\` | \`fal-ai/cogvideox-5b\` |
| \`cogvideox-5b-i2v\` | \`fal-ai/cogvideox-5b/image-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/cogvideox-5b
- THUDM CogVideoX: https://github.com/THUDM/CogVideo
`;

export function registerCogVideoxPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'cogvideox_prompt_guide',
    'Reference guide for CogVideoX-5B — open-weights t2v + i2v from THUDM. Research / replication workflows. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: COGVIDEOX_GUIDE }] }),
  );
}

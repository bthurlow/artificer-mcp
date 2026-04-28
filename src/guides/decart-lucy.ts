import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const DECART_LUCY_GUIDE = `# Decart Lucy — Prompt Guide

## What this model is best for
Lightning-fast image-to-video generation. Lucy prioritizes throughput over fidelity — best when you need many short clips quickly (animated thumbnails, quick concept tests, batch UGC-style content) and don't need premium motion realism.

## Picking a model
Single fal route today. If you need higher quality at the cost of speed, reach for Wan 2.7 i2v, Hailuo 02 Pro i2v, or Kling 2.6 Pro i2v.

## Known strengths
- Sub-second-per-frame inference. The fastest fal i2v in the catalog.
- Cheap per-clip cost relative to quality tier.
- Stable on simple motion (camera pan, slow zoom, talking head idle).

## Known weaknesses
- Limited motion complexity. Complex action prompts under-deliver vs. mid-tier models.
- Lower temporal coherence over longer clips (3s+).
- No native audio output.

## Input requirements
- **prompt** (required) — short motion description.
- **image** (required) — source frame. Maps to fal's \`image_url\` automatically.
- Lucy is i2v-only; \`prompt\` describes the motion to apply, not the scene composition.

## Prompt structure
Treat the image as the first frame and describe how it should animate. Short imperatives work best: "slow zoom in", "subject turns head left", "camera dolly forward".

## Example prompts
- \`prompt: "slow camera push-in, subject's hair gently moving"\`
- \`prompt: "static shot, candle flame flickering"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`decart-lucy-i2v\` | \`decart/lucy-i2v\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/decart/lucy-i2v
`;

export function registerDecartLucyPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'decart_lucy_prompt_guide',
    'Reference guide for Decart Lucy i2v — lightning-fast image-to-video for high-throughput / cheap clip generation. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: DECART_LUCY_GUIDE }] }),
  );
}

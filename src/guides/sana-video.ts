import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const SANA_GUIDE = `# Sana Video — Prompt Guide

## What this model is best for
NVIDIA / MIT Sana video lineage — ultra-fast, lightweight text-to-video. Best when latency matters more than fidelity (live UX, batch previews, cheap iteration). Not a flagship pick.

## Picking a model
Single fal route today.

## Known strengths
- Fast inference relative to peers.
- Lightweight model — keeps fal compute cost down.

## Known weaknesses
- Quality trails premium and most mid-tier models.
- Limited duration / resolution cap.
- No audio output.

## Input requirements
- **prompt** (required) — scene description.
- T2V only.

## Prompt structure
Concise prompts perform best. Long elaborate prompts dilute since the model has less capacity than premium peers. Lead with subject + clear action.

## Example prompts
- \`prompt: "A red sports car drifting around a corner, motion blur"\`
- \`prompt: "Time-lapse of clouds rolling over snow-capped mountains"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`sana-video-t2v\` | \`fal-ai/sana-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/sana-video
`;

export function registerSanaPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'sana_prompt_guide',
    'Reference guide for Sana Video — ultra-fast lightweight t2v. Latency-first / cheap-iteration use cases. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: SANA_GUIDE }] }),
  );
}

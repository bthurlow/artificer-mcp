import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const BYTEDANCE_LYNX_GUIDE = `# ByteDance Lynx — Prompt Guide

## What this model is best for
Subject-consistent image-to-video — Lynx preserves the input subject's identity across the generated clip's frames better than generic i2v models. Best when the same person / character / product needs to appear coherently throughout a longer-form animation. Lives in \`video.talking_head\` because identity preservation is its primary value, but it's not strictly lip-sync.

## Picking a model
Single fal route. For lip-synced talking-head output, prefer Kling AI Avatar v2 Pro, Wan 2.7 i2v with audio, VEED Fabric, or Happy Horse i2v. Lynx is for cases where identity matters more than mouth movement.

## Known strengths
- Strong subject identity preservation across the clip's duration.
- Handles non-frontal subject orientations better than most i2v models.
- Works well on stylized character art, not just photoreal portraits.

## Known weaknesses
- Not a lip-sync model — mouth movement does not track audio.
- Motion quality varies with subject complexity.
- Single source image only; multi-reference identity is not supported.

## Input requirements
- **image** (required) — source frame containing the subject. Maps to fal's \`image_url\`.
- **prompt** (required) — describe the desired motion / scene evolution.

## Prompt structure
Describe the action while assuming the subject's identity is fixed. Avoid prompts that contradict the source image (e.g., "subject turns into a robot"). Treat the source as the authoritative subject reference.

## Example prompts
- \`prompt: "Subject walks forward through a forest path, leaves blowing"\`
- \`prompt: "Subject smiles slowly and waves at the camera"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`bytedance-lynx-i2v\` | \`bytedance/lynx\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/bytedance/lynx
`;

export function registerBytedanceLynxPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'bytedance_lynx_prompt_guide',
    'Reference guide for ByteDance Lynx — subject-consistent i2v. Strong identity preservation across frames; not a lip-sync model. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: BYTEDANCE_LYNX_GUIDE }] }),
  );
}

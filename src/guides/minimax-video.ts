import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MINIMAX_VIDEO_GUIDE = `# MiniMax Video 01 — Prompt Guide

## What this model is best for
The original MiniMax video lineage — predates Hailuo. Use only when you specifically want the "Video 01" aesthetic or one of its specialized variants (Director for camera-direction prompts, Live for live-style motion, Subject Reference for identity-locked generation). For most production work, prefer Hailuo 2.3 (newer, cheaper, better quality).

## Picking a model
| Slug | Modality | Variant | Best for |
|------|----------|---------|----------|
| \`minimax-video-01-t2v\` | t2v | base | Standard t2v |
| \`minimax-video-01-i2v\` | i2v | base | Standard i2v |
| \`minimax-video-01-live-t2v\` | t2v | Live | "Live-style" motion (looser, more dynamic) |
| \`minimax-video-01-live-i2v\` | i2v | Live | Live-style i2v |
| \`minimax-video-01-director-t2v\` | t2v | Director | Camera-direction-focused prompts |
| \`minimax-video-01-director-i2v\` | i2v | Director | Director i2v |
| \`minimax-video-01-subject-ref-i2v\` | i2v | Subject Ref | Identity-locked output from a portrait |

## Known strengths
- Director variant accepts explicit camera-language prompts ("dolly", "crane", "rack focus") more reliably than base.
- Subject Ref preserves portrait identity across the clip.
- Live variant generates looser, more handheld-feeling motion.

## Known weaknesses
- Trails Hailuo 2.3 in quality and price.
- Variant differences are subtle — picking the wrong one wastes a generation.
- No native audio.

## Input requirements
- **prompt** (required, all variants).
- **image** (required for all i2v variants) — maps to \`image_url\`.
- For \`minimax-video-01-subject-ref-i2v\`: pass via \`extra_params: { subject_reference_image_url: <portrait_url> }\` instead of the structural \`image\` arg. The portrait is the identity reference, not the starting frame.

## Prompt structure
Director variant: lead with camera direction, then subject. Example: "Slow dolly-in toward a violinist on stage, shallow DOF". Live variant: more freeform, motion-heavy verbs. Subject Ref: describe what the referenced subject does in the clip.

## Example prompts
- Director: \`prompt: "Crane shot rising above a vintage car driving along a coastal road"\`
- Live: \`prompt: "Two friends laughing in a kitchen, handheld camera, natural light"\`
- Subject Ref: \`prompt: "the subject delivering a TED-talk on stage", extra_params: { subject_reference_image_url: portrait.jpg }\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`minimax-video-01-t2v\` | \`fal-ai/minimax/video-01\` |
| \`minimax-video-01-live-t2v\` | \`fal-ai/minimax/video-01-live\` |
| \`minimax-video-01-live-i2v\` | \`fal-ai/minimax/video-01-live/image-to-video\` |
| \`minimax-video-01-director-t2v\` | \`fal-ai/minimax/video-01-director\` |
| \`minimax-video-01-director-i2v\` | \`fal-ai/minimax/video-01-director/image-to-video\` |
| \`minimax-video-01-i2v\` | \`fal-ai/minimax/video-01/image-to-video\` |
| \`minimax-video-01-subject-ref-i2v\` | \`fal-ai/minimax/video-01-subject-reference\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/minimax/video-01
- MiniMax: https://www.minimax.io
`;

export function registerMinimaxVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'minimax_video_prompt_guide',
    'Reference guide for MiniMax Video 01 lineage — t2v / i2v / Live / Director / Subject Reference variants. Predates Hailuo; prefer Hailuo 2.3 for most new work. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MINIMAX_VIDEO_GUIDE }] }),
  );
}

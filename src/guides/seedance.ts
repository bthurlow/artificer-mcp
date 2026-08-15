import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const SEEDANCE_GUIDE = `# ByteDance Seedance Video — Prompt Guide

## What this model is best for
ByteDance's Seedance is a premium-tier video model with multi-reference inputs, native audio, and start/end-frame control. Seedance 2.0 is the latest; 1.5 Pro and 1.0 lineages remain available for cost-conscious use cases. Best for high-quality social and ad content where Veo / Sora pricing is too high but mid-tier (Wan / Hailuo) is too low.

## Picking a model
| Slug | Generation | Modality | Audio | Cost (720p) | Best for |
|------|-----------|----------|-------|-------------|----------|
| \`seedance-2-t2v\` | 2.0 | t2v | yes | $0.30/s | Latest premium t2v |
| \`seedance-2-i2v\` | 2.0 | i2v | yes | $0.30/s | Latest premium i2v |
| \`seedance-2-ref-to-video\` | 2.0 | multi-ref | yes | $0.30/s (0.6× w/ video) | Up to 9 imgs / 3 vids / 3 audios |
| \`seedance-2-fast-t2v\` | 2.0 fast | t2v | yes | $0.24/s | Cheaper Seedance 2 t2v |
| \`seedance-2-fast-i2v\` | 2.0 fast | i2v | yes | $0.24/s | Cheaper Seedance 2 i2v |
| \`seedance-2-fast-ref\` | 2.0 fast | multi-ref | yes | $0.24/s | Cheaper multi-ref |
| \`seedance-1.5-pro-t2v\` | 1.5 Pro | t2v | yes | $0.26/5s | Mid-Seedance |
| \`seedance-1.5-pro-i2v\` | 1.5 Pro | i2v | yes | $0.26/5s | Mid-Seedance i2v |
| \`seedance-1-pro-t2v\` | 1.0 Pro | t2v | yes | $0.62/5s @ 1080p | Older premium |
| \`seedance-1-pro-i2v\` | 1.0 Pro | i2v | yes | $0.62/5s @ 1080p | Older premium i2v |
| \`seedance-1-pro-fast-t2v\` | 1.0 Pro fast | t2v | yes | cheaper | Faster 1.0 Pro |
| \`seedance-1-pro-fast-i2v\` | 1.0 Pro fast | i2v | yes | cheaper | Faster 1.0 Pro i2v |
| \`seedance-1-lite-t2v\` | 1.0 Lite | t2v | yes | $0.18/5s | Cheap 1.0 t2v |
| \`seedance-1-lite-i2v\` | 1.0 Lite | i2v | yes | cheaper | Cheap 1.0 i2v |
| \`seedance-1-lite-ref\` | 1.0 Lite | multi-ref | yes | cheaper | 1–4 refs |

## Known strengths
- **Multi-reference fusion** — up to 9 image refs, 3 video refs, 3 audio refs in one call (Seedance 2.0). Unique on fal.
- Native audio output across the lineage.
- Start / end-frame control on i2v variants.
- Camera-fixed mode (locks the camera position) for stable shots.

## Known weaknesses
- Pricing higher than Hailuo / Wan mid-tier.
- Multi-ref input shape is the most complex in the catalog — easy to mis-pass.
- 1.0 Pro 1080p tier is expensive ($0.62/5s) — usually 1.5 Pro is the better value.

## Input requirements
- **prompt** (required, all variants).
- **image** (required for i2v) — maps to \`image_url\`.
- For start/end-frame i2v: pass \`extra_params: { end_image_url: <url> }\` alongside the structural \`image\`.
- For multi-ref variants: pass \`extra_params: { reference_image_urls: [...], image_urls: [...], video_urls: [...], audio_urls: [...] }\` arrays. Use the relevant array for the inputs you have. Up to 9 image refs total on Seedance 2.0.
- \`generate_audio\` boolean (default true on most variants) — set false to skip audio.
- \`camera_fixed\` boolean — locks camera if true.

## Prompt structure
Seedance handles directorial vocabulary well — shot types, camera moves, lighting cues are respected. For multi-ref, the prompt describes the desired scene; the references provide the identity / style / motion anchors.

## Example prompts
- T2V: \`prompt: "Wide cinematic shot of a sailboat at sunset, gentle wave motion, ambient ocean audio"\`
- I2V with end frame: \`prompt: "smooth dolly-in", extra_params: { end_image_url: tighter-shot.jpg }\`
- Multi-ref: \`prompt: "the subject from the first reference performing the action from the second reference, in the style of the third", extra_params: { reference_image_urls: [a.jpg, b.jpg, c.jpg] }\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`seedance-2-t2v\` | \`bytedance/seedance-2.0/text-to-video\` |
| \`seedance-2-i2v\` | \`bytedance/seedance-2.0/image-to-video\` |
| \`seedance-2-ref-to-video\` | \`bytedance/seedance-2.0/reference-to-video\` |
| \`seedance-2-fast-t2v\` | \`bytedance/seedance-2.0/fast/text-to-video\` |
| \`seedance-2-fast-i2v\` | \`bytedance/seedance-2.0/fast/image-to-video\` |
| \`seedance-2-fast-ref\` | \`bytedance/seedance-2.0/fast/reference-to-video\` |
| \`seedance-1.5-pro-t2v\` | \`fal-ai/bytedance/seedance/v1.5/pro/text-to-video\` |
| \`seedance-1.5-pro-i2v\` | \`fal-ai/bytedance/seedance/v1.5/pro/image-to-video\` |
| \`seedance-1-pro-t2v\` | \`fal-ai/bytedance/seedance/v1/pro/text-to-video\` |
| \`seedance-1-pro-i2v\` | \`fal-ai/bytedance/seedance/v1/pro/image-to-video\` |
| \`seedance-1-pro-fast-t2v\` | \`fal-ai/bytedance/seedance/v1/pro/fast/text-to-video\` |
| \`seedance-1-pro-fast-i2v\` | \`fal-ai/bytedance/seedance/v1/pro/fast/image-to-video\` |
| \`seedance-1-lite-t2v\` | \`fal-ai/bytedance/seedance/v1/lite/text-to-video\` |
| \`seedance-1-lite-i2v\` | \`fal-ai/bytedance/seedance/v1/lite/image-to-video\` |
| \`seedance-1-lite-ref\` | \`fal-ai/bytedance/seedance/v1/lite/reference-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/bytedance/seedance-2.0/text-to-video
`;

export function registerSeedancePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'seedance_prompt_guide',
    'Reference guide for ByteDance Seedance Video — 2.0 / 1.5 Pro / 1.0 Pro / 1.0 Lite across t2v / i2v / multi-reference. Native audio + start-end-frame control + multi-ref fusion. 15 routes. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: SEEDANCE_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const SPECIALIZED_VIDEO_GUIDE = `# Specialized Video Models — Prompt Guide

## What's in this guide
Niche / research-grade fal video models, each solving a specific problem mainstream models don't. Read this when a standard t2v / i2v model can't do what you need (joint audio, autoregressive generation), or to find out that the niche you need is no longer covered. Four were retired with no replacement: TransPixar (alpha channel), Lyra-2 Zoom (pseudo-3D zoom), MultiShot Master (narrative multi-shot) and SkyReels V1 (human-centric i2v).

## MultiShot Master — RETIRED 2026-11
Narrative multi-shot t2v (a sequence of shots in one call). fal removed \`fal-ai/multishot-master\` — the endpoint now 404s — and the \`multishot-master-t2v\` slug was dropped with it. For storyboard-style sequences, generate each shot separately and join them with \`video_concatenate\`.

## TransPixar — RETIRED 2026-08-15
TransPixar produced **RGB + a real alpha channel**, and was the only model in fal's catalog that did. fal removed \`fal-ai/transpixar\` — the endpoint now 404s — and the \`transpixar-t2v\` slug was dropped with it.

**There is no longer any alpha-channel video route in this catalog.** (Wan Alpha, the other one, was retired in 2026-11.) If you need overlay assets with transparency, the fallback is to generate on a flat, saturated background and key it out afterwards with \`background_remove\` (color-key mode) plus \`composite\` — noticeably worse than a true alpha channel on soft edges, motion blur, and semi-transparent elements like particles or smoke, which is exactly what this model was good at. Plan for hard-edged subjects, or source the asset outside this pipeline.

## SkyReels V1 — RETIRED 2026-11
Human-centric i2v. fal removed \`fal-ai/skyreels-i2v\` — the endpoint now 404s — and the \`skyreels-i2v\` slug was dropped with it. For people in motion, use a current general i2v model (Kling, Veo 3.1, Seedance).

## Lyra-2 Zoom — RETIRED 2026-09-24
Lyra-2 Zoom produced a pseudo-3D, parallax-aware camera zoom from a single still. fal removed \`fal-ai/lyra-2/zoom\` — the endpoint now 404s — and the \`lyra-2-zoom-i2v\` slug was dropped with it.

For Ken Burns-style motion on a still, prompt a general i2v model for camera-only movement (e.g. \`"slow push-in toward the focal subject, the scene itself stays still"\`). Expect some subject motion to creep in, which Lyra-2 avoided by construction.

## Ovi
**Joint audio + video generation.** Both modalities produced together in one model call (not video + separate TTS). Best when audio and motion need to be co-generated — e.g., a clip of a dog barking where the bark sound and the mouth movement are produced jointly.
- Slugs: \`ovi-t2v\` → \`fal-ai/ovi\`, \`ovi-i2v\` → \`fal-ai/ovi/image-to-video\`
- Output: video with bundled audio track.
- Example: \`prompt: "A glass shattering on tile, with audio"\`

## Infinity Star
Autoregressive 720p video generation — predicts each frame conditioned on prior frames in an autoregressive loop. Distinct from diffusion-based models. Use when you want longer sequences than diffusion typically delivers, or when autoregressive lineage matches a downstream pipeline expectation.
- Slug: \`infinity-star-t2v\` → \`fal-ai/infinity-star/text-to-video\`
- Example: \`prompt: "A spaceship slowly drifting past a nebula, gentle rotation"\`

## Wire-key quirks
None of these models share a uniform schema — read each model's \`fal-specs/{slug}/openapi.json\` before integrating. Most accept the artificer transport's structural args (\`prompt\`, \`image\`, \`negative_prompt\`) but model-specific knobs vary.

## Access routes (combined)
| Slug | fal endpoint |
|------|--------------|
| \`ovi-t2v\` | \`fal-ai/ovi\` |
| \`ovi-i2v\` | \`fal-ai/ovi/image-to-video\` |
| \`infinity-star-t2v\` | \`fal-ai/infinity-star/text-to-video\` |

## Last verified
2026-11-06 — \`multishot-master-t2v\` and \`skyreels-i2v\` retired (both endpoints 404). 2026-09-24 — \`lyra-2-zoom-i2v\` retired (endpoint 404s). 2026-08-15 — \`transpixar-t2v\` retired. Model notes are otherwise unchanged since the 2026-04-28 initial seed and were not re-verified.

## Official references
Per-model fal pages — search at https://fal.ai/explore for the exact slug.
`;

export function registerSpecializedVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'specialized_video_prompt_guide',
    'Reference guide for specialized fal video models — Ovi (joint audio+video) and Infinity Star (autoregressive). One model per niche. Also records the retired routes, none with a replacement: TransPixar (alpha channel), Lyra-2 Zoom (pseudo-3D zoom), MultiShot Master (narrative multi-shot) and SkyReels (human-centric i2v). No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: SPECIALIZED_VIDEO_GUIDE }] }),
  );
}

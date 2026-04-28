import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const SPECIALIZED_VIDEO_GUIDE = `# Specialized Video Models — Prompt Guide

## What's in this guide
Niche / research-grade fal video models, each solving a specific problem mainstream models don't. Read this when a standard t2v / i2v model can't do what you need (alpha channel, joint audio, specific subject focus, etc.).

## MultiShot Master
Narrative multi-shot t2v — generates a sequence of shots forming a short narrative arc rather than a single continuous take. Useful for storyboard-style output, animatics, or short-form content where shot variety matters more than per-shot polish.
- Slug: \`multishot-master-t2v\` → \`fal-ai/multishot-master\`
- Prompt structure: describe the narrative beats. The model splits across shots automatically.
- Example: \`prompt: "A barista preparing coffee: pulling espresso, steaming milk, latte art, handing the cup to a customer"\`

## TransPixar
**RGB + alpha-channel output.** The unique model in fal's catalog that produces video with a real alpha channel — usable directly for compositing without green-screen / chroma-key removal. Best for motion graphics, overlay assets, branded animations that need to drop onto other footage.
- Slug: \`transpixar-t2v\` → \`fal-ai/transpixar\`
- Output: video with alpha (typically WebM with alpha or animated PNG sequence).
- Example: \`prompt: "Animated logo reveal, golden particles dispersing, transparent background"\`

## SkyReels V1
Human-centric video foundation model. Trained heavily on people-and-action footage; better than generic models at human movement, gesture, and posture preservation. Use for any clip where the subject is a person in motion.
- Slug: \`skyreels-i2v\` → \`fal-ai/skyreels-i2v\`
- Input: portrait or full-body source image. Maps to \`image_url\`.
- Example: \`prompt: "Subject walks confidently toward the camera, slight smile, hands in pockets"\`

## Lyra-2 Zoom
Pseudo-3D camera-zoom motion from a single image. NOT full 3D scene reconstruction — generates the appearance of a parallax-aware zoom into the source image. Best for Ken Burns-style cinematic motion on still photos, real estate hero shots, photo-to-reel conversion.
- Slug: \`lyra-2-zoom-i2v\` → \`fal-ai/lyra-2/zoom\`
- Input: source image. The motion is camera-zoom-only; no subject animation.
- Example: \`prompt: "slow push-in toward the focal subject"\`

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
| \`multishot-master-t2v\` | \`fal-ai/multishot-master\` |
| \`transpixar-t2v\` | \`fal-ai/transpixar\` |
| \`skyreels-i2v\` | \`fal-ai/skyreels-i2v\` |
| \`lyra-2-zoom-i2v\` | \`fal-ai/lyra-2/zoom\` |
| \`ovi-t2v\` | \`fal-ai/ovi\` |
| \`ovi-i2v\` | \`fal-ai/ovi/image-to-video\` |
| \`infinity-star-t2v\` | \`fal-ai/infinity-star/text-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
Per-model fal pages — search at https://fal.ai/explore for the exact slug.
`;

export function registerSpecializedVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'specialized_video_prompt_guide',
    'Reference guide for specialized fal video models — MultiShot Master (narrative arcs), TransPixar (alpha channel), SkyReels (human-centric), Lyra-2 Zoom (pseudo-3D), Ovi (joint audio+video), Infinity Star (autoregressive). One model per niche. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: SPECIALIZED_VIDEO_GUIDE }] }),
  );
}

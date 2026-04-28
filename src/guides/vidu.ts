import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const VIDU_GUIDE = `# Vidu Video — Prompt Guide

## What this model is best for
Vidu (from Shengshu Technology) has a recognizable stylized lineage especially well-suited to anime and illustrated content. Q3 is the latest, Q1 / Q2 are prior gens still useful for legacy workflow consistency. Vidu also has strong reference-to-video and first-last-frame (FLF) variants for controlled motion.

## Picking a model
| Slug | Generation | Modality | Best for |
|------|-----------|----------|----------|
| \`vidu-q3-t2v\` | Q3 | t2v | Latest Vidu, default pick |
| \`vidu-q3-i2v\` | Q3 | i2v | Latest i2v |
| \`vidu-q3-turbo-t2v\` | Q3 turbo | t2v | Faster Q3 t2v |
| \`vidu-q3-turbo-i2v\` | Q3 turbo | i2v | Faster Q3 i2v |
| \`vidu-q3-ref-mix-i2v\` | Q3 | reference fusion | Multi-image scene composition |
| \`vidu-q2-t2v\` | Q2 | t2v | Q2 t2v |
| \`vidu-q2-turbo-i2v\` | Q2 turbo | i2v | Faster Q2 i2v |
| \`vidu-q2-pro-i2v\` | Q2 pro | i2v | Higher-quality Q2 i2v |
| \`vidu-q2-pro-ref-i2v\` | Q2 pro | reference | Multi-ref Q2 |
| \`vidu-q1-t2v\` | Q1 | t2v | **Strongest anime lineage** (lives in video.stylized) |
| \`vidu-q1-i2v\` | Q1 | i2v | Anime i2v |
| \`vidu-q1-flf-i2v\` | Q1 | first-last frame | Animate between two anchored frames |
| \`vidu-q1-ref-i2v\` | Q1 | reference | Multi-ref Q1 |
| \`vidu-basic-i2v\` | basic | i2v | Generic Vidu i2v |
| \`vidu-ref-i2v\` | basic | reference | Generic multi-ref |
| \`vidu-flf-i2v\` | basic | first-last frame | Generic FLF |
| \`vidu-template-i2v\` | basic | template | Effect-template-driven |

Q3 pricing: $0.07/s for 360/540p, 2.2× for 720/1080p.

## Known strengths
- **Q1's anime lineage is the strongest stylized output on fal.** Don't dismiss the older generation if you specifically want anime.
- FLF variants (first + last frame) give rare motion-anchor control.
- Reference-fusion (ref-mix) blends multiple inputs — useful for composite scenes.
- Template-to-video offers preset effect lanes.

## Known weaknesses
- Q1 / Q2 quality on realistic content trails newer mid-tier (Wan 2.7, Hailuo 2.3).
- Many variants — picking the right one requires reading this guide.
- No native audio.

## Input requirements
- **prompt** (required).
- **image** (required for most i2v variants) — maps to \`image_url\`.
- For FLF variants: pass \`extra_params: { start_image_url: <url>, end_image_url: <url> }\`. The structural \`image\` arg is ignored on FLF.
- For reference / ref-mix variants: pass \`extra_params: { reference_image_urls: [...] }\` array.
- For \`vidu-template-i2v\`: pass \`extra_params: { template: <enum> }\` — the available templates are listed in the synced spec at \`src/catalog/fal-specs/vidu-template-i2v/openapi.json\`.

## Prompt structure
Q1 (anime): booru-tag-style prompts work well alongside prose. Q3 (modern): standard subject + action + camera framing. Reference variants: describe the desired scene; the references provide identity / style anchors.

## Example prompts
- Q3 t2v: \`prompt: "A figure skater performing a triple axel, slow motion replay"\`
- Q1 anime: \`prompt: "anime girl, school uniform, walking under cherry blossoms, gentle breeze"\`
- FLF: \`prompt: "smooth transition between the two anchored states", extra_params: { start_image_url: a.jpg, end_image_url: b.jpg }\`
- Ref: \`prompt: "the subject in a snowy mountain scene", extra_params: { reference_image_urls: [portrait.jpg, mountain.jpg] }\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`vidu-q3-t2v\` | \`fal-ai/vidu/q3/text-to-video\` |
| \`vidu-q3-i2v\` | \`fal-ai/vidu/q3/image-to-video\` |
| \`vidu-q3-turbo-t2v\` | \`fal-ai/vidu/q3/text-to-video/turbo\` |
| \`vidu-q3-turbo-i2v\` | \`fal-ai/vidu/q3/image-to-video/turbo\` |
| \`vidu-q3-ref-mix-i2v\` | \`fal-ai/vidu/q3/reference-to-video/mix\` |
| \`vidu-q2-t2v\` | \`fal-ai/vidu/q2/text-to-video\` |
| \`vidu-q2-turbo-i2v\` | \`fal-ai/vidu/q2/image-to-video/turbo\` |
| \`vidu-q2-pro-i2v\` | \`fal-ai/vidu/q2/image-to-video/pro\` |
| \`vidu-q2-pro-ref-i2v\` | \`fal-ai/vidu/q2/reference-to-video/pro\` |
| \`vidu-q1-t2v\` | \`fal-ai/vidu/q1/text-to-video\` |
| \`vidu-q1-i2v\` | \`fal-ai/vidu/q1/image-to-video\` |
| \`vidu-q1-flf-i2v\` | \`fal-ai/vidu/q1/start-end-to-video\` |
| \`vidu-q1-ref-i2v\` | \`fal-ai/vidu/q1/reference-to-video\` |
| \`vidu-basic-i2v\` | \`fal-ai/vidu/image-to-video\` |
| \`vidu-ref-i2v\` | \`fal-ai/vidu/reference-to-video\` |
| \`vidu-flf-i2v\` | \`fal-ai/vidu/start-end-to-video\` |
| \`vidu-template-i2v\` | \`fal-ai/vidu/template-to-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/vidu/q3/text-to-video
- Vidu: https://www.vidu.studio
`;

export function registerViduPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'vidu_prompt_guide',
    'Reference guide for Vidu Video — Q1 / Q2 / Q3 + basic across t2v / i2v / first-last-frame / reference / template. 17 routes total. Q1 has the strongest anime lineage on fal. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: VIDU_GUIDE }] }),
  );
}

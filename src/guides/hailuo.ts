import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const HAILUO_GUIDE = `# MiniMax Hailuo Video — Prompt Guide

## What this model is best for
MiniMax Hailuo is the cost-conscious mid-tier workhorse: predictable pricing, solid output quality, reliable for batch jobs. Best for high-volume social-content production where unit economics matter and Veo / Sora premium tier is overkill. Three generations active: **H3 (Hailuo 3.0, latest — start here)**, Hailuo 2.3, and Hailuo 02.

## MiniMax H3 (Hailuo 3.0) — the current generation

H3 is the newest MiniMax video model and supersedes 2.3 for most work. It is the only generation in this family that offers **first-to-last keyframe control**, **multi-modal reference conditioning**, and **resolutions above 1080p**.

| Slug | Mode | Wire id | Cost |
|------|------|---------|------|
| \`minimax-h3-t2v\` | text-to-video | \`minimax/h3/text-to-video\` | $0.05/s 480p · $0.08/s 768p · $0.13/s 2K · $0.16/s 4K |
| \`minimax-h3-i2v\` | image-to-video **+ first-last-frame** | \`minimax/h3/image-to-video\` | same |
| \`minimax-h3-r2v\` | reference-to-video | \`minimax/h3/reference-to-video\` | same, +$0.08 per reference image beyond the first 5 |

**Endpoint ids have no \`fal-ai/\` prefix.** They are \`minimax/h3/...\`, unlike the 2.3 and 02 routes. A \`fal-ai/minimax/hailuo-03/...\` alias also resolves but exposes a reduced schema (no \`seed\`, no \`enable_prompt_expansion\`) — use the \`minimax/h3/\` form.

### Shared H3 knobs (via \`extra_params\`)
- **\`duration\`** — integer seconds, **5 to 15**, default 5. No native chaining; concatenate downstream for longer pieces.
- **\`resolution\`** — \`"480P"\` / \`"768P"\` / \`"2K"\` / \`"4K"\`, default \`"2K"\`. **Note the capital P.** Only 480P and 768P are native generation modes; **2K and 4K upscale a 768P base**, so they cost more without adding real detail. If budget matters, 768P is the honest native ceiling.
- **\`aspect_ratio\`** — \`"21:9"\`, \`"16:9"\`, \`"4:3"\`, \`"1:1"\`, \`"3:4"\`, \`"9:16"\`. Default \`"16:9"\` on t2v, \`"adaptive"\` on r2v. **9:16 is native**, which makes H3 a strong vertical short-form pick.
- **\`seed\`** — integer, random when omitted.
- **\`enable_prompt_expansion\`** — default **true**; a VLM rewrites your prompt before generation. Turn it **off** for carefully crafted prompts you don't want altered.
- **\`enable_safety_checker\`** — default true.

### First-to-last keyframe (i2v only)
\`minimax-h3-i2v\` takes both ends of a shot:
- **\`image_url\`** — first frame. The transport's structural \`image\` arg maps here. When provided, **output aspect ratio follows this image**; omit it and the request behaves as text-to-video at 16:9.
- **\`end_image_url\`** — last frame, for first-to-last keyframe generation. Pass via \`extra_files\` so the file is uploaded and rewritten to a URL.

### Reference-to-video (\`minimax-h3-r2v\`)
Conditions on up to **12 reference files total** across three lists, addressed positionally in the prompt as "Image 1", "Video 1", "Audio 1":
- **\`reference_image_urls\`** — subject/style images. First 5 free, then $0.08 each.
- **\`reference_video_urls\`** — motion references, 2–15s each, 15s combined max.
- **\`reference_audio_urls\`** — 2–15s each, 15s combined max. **Audio cannot be the only reference** — pair it with at least one image or video.

Pass all three through \`extra_files\` so local paths are uploaded to fal storage.

### Output is silent
The fal output schema returns a bare \`video\` File with no audio track. Some MiniMax marketing describes H3 as producing native stereo audio; **fal's hosted endpoints do not expose it**. For a music video under a fixed master this is an advantage — nothing to strip.

## Picking a model (2.3 and 02 — prior generations)
| Slug | Generation | Tier | Resolution | Cost | Best for |
|------|-----------|------|------------|------|----------|
| \`hailuo-2.3-pro-t2v\` | 2.3 | Pro | 1080p | $0.49/video | Latest Hailuo, premium tier |
| \`hailuo-2.3-pro-i2v\` | 2.3 | Pro | 1080p | $0.49/video | Latest, image-conditioned |
| \`hailuo-2.3-std-t2v\` | 2.3 | Standard | 768p | mid-tier | Cheaper 2.3 t2v |
| \`hailuo-2.3-std-i2v\` | 2.3 | Standard | 768p | $0.28–0.56/video | Cheaper 2.3 i2v |
| \`hailuo-2.3-fast-std-i2v\` | 2.3 | Fast Std | 768p | $0.19–0.32/video | Fastest 2.3 i2v |
| \`hailuo-02-pro-t2v\` | 02 | Pro | 1080p | $0.08/s | Per-second 1080p |
| \`hailuo-02-pro-i2v\` | 02 | Pro | 1080p | $0.08/s | Per-second 1080p i2v |
| \`hailuo-02-std-t2v\` | 02 | Standard | 768p | ~$0.045/s | Cheaper 02 t2v |
| \`hailuo-02-std-i2v\` | 02 | Standard | 768p | $0.017–0.045/s | Batch-friendly mid |
| \`hailuo-02-fast-i2v\` | 02 | Fast | 512p | $0.017/s | **Cheapest i2v in catalog** |

## Known strengths
- **Predictable pricing** — flat-rate per-video on 2.3 makes batch budgeting trivial.
- 2.3 Pro hits real 1080p with reasonable motion fidelity.
- 02 Fast i2v at $0.017/s is the cheapest i2v option across all fal video models.
- Solid prompt adherence on naturalistic scenes.

## Known weaknesses
- No native audio output on any generation, including H3 as hosted on fal.
- 768p / 512p tiers are not premium quality — fine for social, weak for hero content.
- Hailuo 2.3 std \`duration\` is an enum (\`"6"\` / \`"10"\`), not a free integer — pass as a string.
- 02-std-i2v exposes \`resolution\` (\`"512P"\` / \`"768P"\`) and \`duration\` (\`6\` / \`10\` integer) — others don't.

## Input requirements
- **prompt** (required, all variants).
- **image** (required for i2v) — maps to \`image_url\`.
- \`prompt_optimizer\` knob (boolean) on most variants — fal applies a prompt-rewriting pass when true. Default true; set false via \`extra_params\` if you want raw passthrough.
- 2.3 std \`duration\` — pass as string \`"6"\` or \`"10"\`.
- 02-std-i2v \`resolution\` — uppercase \`"512P"\` or \`"768P"\`. Note the capital P.

## Prompt structure
Subject + clear motion + optional camera direction. Hailuo handles human action well; complex object choreography is hit-or-miss. The \`prompt_optimizer\` rewrite usually helps short prompts; turn off for long detailed prompts you've crafted carefully.

## Example prompts
- T2V: \`prompt: "A baker shaping dough on a flour-dusted counter, soft morning light, gentle hand movements"\`
- I2V: \`prompt: "Subject smiles and waves at the camera"\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`minimax-h3-t2v\` | \`minimax/h3/text-to-video\` |
| \`minimax-h3-i2v\` | \`minimax/h3/image-to-video\` |
| \`minimax-h3-r2v\` | \`minimax/h3/reference-to-video\` |
| \`hailuo-2.3-pro-t2v\` | \`fal-ai/minimax/hailuo-2.3/pro/text-to-video\` |
| \`hailuo-2.3-pro-i2v\` | \`fal-ai/minimax/hailuo-2.3/pro/image-to-video\` |
| \`hailuo-2.3-std-t2v\` | \`fal-ai/minimax/hailuo-2.3/standard/text-to-video\` |
| \`hailuo-2.3-std-i2v\` | \`fal-ai/minimax/hailuo-2.3/standard/image-to-video\` |
| \`hailuo-2.3-fast-std-i2v\` | \`fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video\` |
| \`hailuo-02-pro-t2v\` | \`fal-ai/minimax/hailuo-02/pro/text-to-video\` |
| \`hailuo-02-pro-i2v\` | \`fal-ai/minimax/hailuo-02/pro/image-to-video\` |
| \`hailuo-02-std-t2v\` | \`fal-ai/minimax/hailuo-02/standard/text-to-video\` |
| \`hailuo-02-std-i2v\` | \`fal-ai/minimax/hailuo-02/standard/image-to-video\` |
| \`hailuo-02-fast-i2v\` | \`fal-ai/minimax/hailuo-02-fast/image-to-video\` |

## Last verified
2026-08-15 — MiniMax H3 (Hailuo 3.0) added: 3 routes, schemas and pricing synced from fal. 2.3 / 02 sections unchanged since the 2026-04-28 initial seed and not re-verified in this pass.

## Official references
- H3: https://fal.ai/models/minimax/h3/image-to-video
- https://fal.ai/models/fal-ai/minimax/hailuo-2.3/pro/text-to-video
- MiniMax: https://www.minimax.io
`;

export function registerHailuoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'hailuo_prompt_guide',
    'Reference guide for MiniMax Hailuo Video — MiniMax H3 (Hailuo 3.0, current: t2v / i2v with first-to-last keyframe / reference-to-video, 5-15s, up to 4K, native 9:16, silent output) plus the older Hailuo 2.3 and 02 lineages across Pro / Standard / Fast tiers. Covers H3 endpoint-id naming, resolution and duration limits, reference-file budgets, and per-second pricing. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: HAILUO_GUIDE }] }),
  );
}

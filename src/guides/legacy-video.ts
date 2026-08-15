import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LEGACY_VIDEO_GUIDE = `# Legacy Video Models — Prompt Guide

## What's in this guide
Older / open-weights video models in the fal catalog. These exist for completeness — they are **not** flagship picks. Reach for these only when:
- You need an open-weights / replicable model (AnimateDiff, SVD lineage).
- You want the cheapest possible per-clip fallback for non-critical work.
- A downstream pipeline specifically expects one of these model lineages.

For new production work, prefer the modern catalog: Veo / Sora / Kling / Wan / Hailuo / LTX-2.x.

## AnimateDiff lineage
Older anime/illustrated-style t2v built on top of Stable Diffusion + temporal modules. Stylized aesthetic. Three variants on fal: SparseCtrl LCM, Fast AnimateDiff, AnimateDiff Turbo. Turbo is fastest but lowest quality.
- Slugs: \`animatediff-sparsectrl-lcm-t2v\`, \`fast-animatediff-t2v\`, \`fast-animatediff-turbo-t2v\`
- Example: \`prompt: "anime girl with blue hair waving in a flower field"\`

## T2V Turbo
Generic open-weights t2v turbo — short clips, cheap. Use only when nothing else fits the budget.
- Slug: \`t2v-turbo-t2v\` → \`fal-ai/t2v-turbo\`

## Stable Video Diffusion (SVD) lineage
Stability AI's image-to-video diffusion model. Older but well-known. Three SVD variants on fal: base SVD t2v, SVD-LCM t2v (lightning), SVD-LCM i2v.
- Slugs: \`fast-svd-t2v\`, \`fast-svd-lcm-t2v\`, \`fast-svd-lcm-i2v\`
- Use when: you specifically want SVD output, or your downstream pipeline expects it.
- Example: \`prompt: "subject smoothly turns head, gentle camera drift"\`

## Stable Video (i2v)
Stability's image-to-clip endpoint. Distinct from the SVD-LCM variant — slower but slightly higher quality.
- Slug: \`stable-video-i2v\` → \`fal-ai/stable-video\`
- Input: source image. Mostly motion-only, no rich prompt control.

## Wire-key quirks
- AnimateDiff models often accept \`negative_prompt\` and respond to anime-tag style prompting (booru-style tags). Test before committing to a prompt format.
- SVD variants typically take \`motion_bucket_id\` (controls motion intensity) via \`extra_params\`. Higher = more motion; default works for most subjects.

## Access routes (combined)
| Slug | fal endpoint |
|------|--------------|
| \`animatediff-sparsectrl-lcm-t2v\` | \`fal-ai/animatediff-sparsectrl-lcm\` |
| \`fast-animatediff-t2v\` | \`fal-ai/fast-animatediff/text-to-video\` |
| \`fast-animatediff-turbo-t2v\` | \`fal-ai/fast-animatediff/turbo/text-to-video\` |
| \`t2v-turbo-t2v\` | \`fal-ai/t2v-turbo\` |
| \`fast-svd-t2v\` | \`fal-ai/fast-svd/text-to-video\` |
| \`fast-svd-lcm-t2v\` | \`fal-ai/fast-svd-lcm/text-to-video\` |
| \`fast-svd-lcm-i2v\` | \`fal-ai/fast-svd-lcm\` |
| \`stable-video-i2v\` | \`fal-ai/stable-video\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog.

## Official references
- Stability SVD: https://stability.ai/news/stable-video-diffusion-open-ai-video-model
- AnimateDiff: https://github.com/guoyww/AnimateDiff
`;

export function registerLegacyVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'legacy_video_prompt_guide',
    'Reference guide for legacy / open-weights fal video models — AnimateDiff variants, T2V Turbo, SVD / SVD-LCM, Stable Video. Cheap fallbacks; not flagship picks. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: LEGACY_VIDEO_GUIDE }] }),
  );
}

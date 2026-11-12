import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LEGACY_VIDEO_GUIDE = `# Legacy Video Models — Prompt Guide

## What's in this guide
Older open-weights video models in the fal catalog: today, only the Stable Video Diffusion (SVD) lineage. These exist for completeness — they are **not** flagship picks. Reach for these only when:
- You need an open-weights / replicable model from the SVD lineage.
- You want a cheap per-clip fallback for non-critical work.
- A downstream pipeline specifically expects SVD output.

For new production work, prefer the modern catalog: Veo / Kling / Wan / Hailuo / LTX-2.x. For the cheapest clip on fal, \`wan-2.2-5b-fastvideo-t2v\` (\`wan_video_prompt_guide\`) usually beats these on both price and quality.

## Stable Video Diffusion (SVD) lineage
Stability AI's image-to-video diffusion model. Older but well-known. Three SVD variants on fal: base SVD t2v, SVD-LCM t2v (lightning), SVD-LCM i2v.
- Slugs: \`fast-svd-t2v\`, \`fast-svd-lcm-t2v\`, \`fast-svd-lcm-i2v\`
- Use when: you specifically want SVD output, or your downstream pipeline expects it.
- Example: \`prompt: "subject smoothly turns head, gentle camera drift"\`

## Retired from this guide
fal removed these endpoints and they now 404, so their slugs were dropped from the catalog:
- **AnimateDiff** — \`animatediff-sparsectrl-lcm-t2v\` on 2026-08-15; \`fast-animatediff-t2v\` and \`fast-animatediff-turbo-t2v\` in 2026-11. No AnimateDiff route remains. For a cheap prompt-only clip use \`fast-svd-lcm-t2v\` or \`wan-2.2-5b-fastvideo-t2v\`.
- **T2V Turbo** — \`t2v-turbo-t2v\` (\`fal-ai/t2v-turbo\`), 2026-11.
- **Stable Video** — \`stable-video-i2v\` (\`fal-ai/stable-video\`), 2026-11. \`fast-svd-lcm-i2v\` is the remaining SVD image-to-video route.

## Wire-key quirks
- SVD variants typically take \`motion_bucket_id\` (controls motion intensity) via \`extra_params\`. Higher = more motion; default works for most subjects.
- \`fast-svd-lcm-i2v\` is mostly motion-only: the source image carries the scene, with little prompt control.

## Access routes (combined)
| Slug | fal endpoint |
|------|--------------|
| \`fast-svd-t2v\` | \`fal-ai/fast-svd/text-to-video\` |
| \`fast-svd-lcm-t2v\` | \`fal-ai/fast-svd-lcm/text-to-video\` |
| \`fast-svd-lcm-i2v\` | \`fal-ai/fast-svd-lcm\` |

## Last verified
2026-04-28 — initial seed of full fal video catalog. Trimmed to the SVD lineage on 2026-11-12 after fal's retirements.

## Official references
- Stability SVD: https://stability.ai/news/stable-video-diffusion-open-ai-video-model
`;

export function registerLegacyVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'legacy_video_prompt_guide',
    'Reference guide for legacy open-weights fal video models — the Stable Video Diffusion lineage (SVD / SVD-LCM). AnimateDiff, T2V Turbo and Stable Video were retired upstream. Cheap fallbacks; not flagship picks. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: LEGACY_VIDEO_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const HAILUO_GUIDE = `# MiniMax Hailuo Video — Prompt Guide

## What this model is best for
MiniMax Hailuo is the cost-conscious mid-tier workhorse: predictable flat-rate pricing per video, solid output quality, reliable for batch jobs. Best for high-volume social-content production where unit economics matter and Veo / Sora premium tier is overkill. Two generations active: Hailuo 2.3 (latest) and Hailuo 02 (prior gen, often cheaper).

## Picking a model
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
- No native audio output.
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
2026-04-28 — initial seed of full fal video catalog.

## Official references
- https://fal.ai/models/fal-ai/minimax/hailuo-2.3/pro/text-to-video
- MiniMax: https://www.minimax.io
`;

export function registerHailuoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'hailuo_prompt_guide',
    'Reference guide for MiniMax Hailuo Video — Hailuo 2.3 + 02 lineages, t2v + i2v across Pro / Standard / Fast tiers. Cost-conscious mid-tier workhorse with flat-rate pricing. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: HAILUO_GUIDE }] }),
  );
}

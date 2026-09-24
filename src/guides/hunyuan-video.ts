import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const HUNYUAN_GUIDE = `# Tencent Hunyuan Video — Prompt Guide

## What this model is best for
Tencent's open-weights video lineage. Best for research workflows, fine-tuning experiments, and identity-preservation use cases (Hunyuan Custom). Production-quality output is decent but not premium-tier. Open-weights means you can replicate locally with the same model.

## Picking a model
| Slug | Modality | Variant | Best for |
|------|----------|---------|----------|
| \`hunyuan-video-1.5-t2v\` | t2v | v1.5 | Latest Hunyuan, best quality |
| \`hunyuan-video-1.5-i2v\` | i2v | v1.5 | Latest i2v |
| \`hunyuan-video-t2v\` | t2v | v1 | Older Hunyuan |
| \`hunyuan-video-i2v\` | i2v | v1 | Older i2v |
| \`hunyuan-custom-i2v\` | i2v | identity | Identity-preserving (similar use to Lynx) |

**No LoRA support any more.** Both Hunyuan LoRA routes are gone: \`hunyuan-video-img2vid-lora-i2v\` was dropped on 2026-08-15 and \`hunyuan-video-lora-t2v\` on 2026-09-24 — fal removed \`fal-ai/hunyuan-video-img2vid-lora\` and \`fal-ai/hunyuan-video-lora\`, and both now 404. For custom-style work, use the LTX LoRA variants, which cover both t2v and i2v (\`ltx_video_prompt_guide\`).

## Known strengths
- Open weights — replicable locally.
- Hunyuan Custom does identity preservation for portrait-driven i2v.

## Known weaknesses
- Quality trails Veo / Sora / Kling Pro.
- No native audio.

## Input requirements
- **prompt** (required, all variants).
- **image** (required for i2v variants) — maps to \`image_url\`.
- Hunyuan Custom: same i2v shape; the model itself handles identity preservation.

## Prompt structure
Standard t2v / i2v phrasing.

## Example prompts
- T2V: \`prompt: "Wide aerial shot of a mountain temple at sunrise"\`
- Custom: \`prompt: "the subject reading a book by a window", image: portrait.jpg\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`hunyuan-video-t2v\` | \`fal-ai/hunyuan-video\` |
| \`hunyuan-video-1.5-t2v\` | \`fal-ai/hunyuan-video-v1.5/text-to-video\` |
| \`hunyuan-video-1.5-i2v\` | \`fal-ai/hunyuan-video-v1.5/image-to-video\` |
| \`hunyuan-video-i2v\` | \`fal-ai/hunyuan-video-image-to-video\` |
| \`hunyuan-custom-i2v\` | \`fal-ai/hunyuan-custom\` |

## Last verified
2026-09-24 — \`hunyuan-video-lora-t2v\` retired (endpoint 404s), leaving no LoRA-capable Hunyuan route. 2026-08-15 — route list re-synced against fal; \`hunyuan-video-img2vid-lora-i2v\` retired (endpoint 404s). Capability notes and prompt guidance are unchanged since the 2026-04-28 initial seed and were not re-verified.

## Official references
- https://fal.ai/models/fal-ai/hunyuan-video-v1.5/text-to-video
- Tencent Hunyuan: https://github.com/Tencent/HunyuanVideo
`;

export function registerHunyuanVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'hunyuan_video_prompt_guide',
    'Reference guide for Tencent Hunyuan Video — open-weights t2v / i2v + identity-preservation variants (no LoRA routes remain). No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: HUNYUAN_GUIDE }] }),
  );
}

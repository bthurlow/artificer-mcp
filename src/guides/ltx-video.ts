import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LTX_GUIDE = `# Lightricks LTX Video — Prompt Guide

## What this model is best for
LTX is the cheapest path to 1080p / 2160p video on fal with native audio support (LTX-2 lineage). Best for high-volume social content, batch jobs, and anywhere unit economics matter. Open-weights variants (LTX-2-19b, LTX-2.3-22b) support custom LoRAs for style fine-tuning.

## Picking a model — by lineage

### LTX-2.3 lineage (latest closed-tier)
| Slug | Variant | Modality | Best for |
|------|---------|----------|----------|
| \`ltx-2.3-pro-t2v\` | Pro | t2v | Latest LTX premium t2v |
| \`ltx-2.3-fast-t2v\` | Fast | t2v | $0.06/s at 1080p, $0.24/s at 2160p — still the cheapest 2160p path |
| \`ltx-2.3-pro-i2v\` | Pro | i2v | Latest premium i2v |
| \`ltx-2.3-fast-i2v\` | Fast | i2v | Cheap 2160p i2v |

### LTX-2.3-22b lineage (open weights, 22B params)
| Slug | Variant | Modality | LoRA |
|------|---------|----------|------|
| \`ltx-2.3-22b-t2v\` | base | t2v | no |
| \`ltx-2.3-22b-i2v\` | base | i2v | no |
| \`ltx-2.3-22b-distilled-t2v\` | distilled | t2v | no |
| \`ltx-2.3-22b-distilled-i2v\` | distilled | i2v | no |
| \`ltx-2.3-22b-lora-t2v\` | base | t2v | yes |
| \`ltx-2.3-22b-lora-i2v\` | base | i2v | yes |
| \`ltx-2.3-22b-distilled-lora-t2v\` | distilled | t2v | yes |
| \`ltx-2.3-22b-distilled-lora-i2v\` | distilled | i2v | yes |

### LTX-2 lineage (closed-tier prior gen)
| Slug | Variant | Modality |
|------|---------|----------|
| \`ltx-2-pro-t2v\` | Pro | t2v |
| \`ltx-2-fast-t2v\` | Fast | t2v |
| \`ltx-2-pro-i2v\` | Pro | i2v |
| \`ltx-2-fast-i2v\` | Fast | i2v |

### LTX-2-19b lineage (open weights, 19B)
| Slug | Variant | Modality | LoRA |
|------|---------|----------|------|
| \`ltx-2-19b-t2v\` | base | t2v | no |
| \`ltx-2-19b-distilled-t2v\` | distilled | t2v | no |
| \`ltx-2-19b-i2v\` | base | i2v | no |
| \`ltx-2-19b-distilled-i2v\` | distilled | i2v | no |
| \`ltx-2-19b-lora-t2v\` | base | t2v | yes |
| \`ltx-2-19b-distilled-lora-t2v\` | distilled | t2v | yes |
| \`ltx-2-19b-lora-i2v\` | base | i2v | yes |
| \`ltx-2-19b-distilled-lora-i2v\` | distilled | i2v | yes |

### LTX legacy
| Slug | Variant | Notes |
|------|---------|-------|
| \`ltx-video-preview-t2v\` | preview | Original LTX preview |
| \`ltx-video-13b-distilled-t2v\` | 13B distilled | Older 13B distilled t2v |
| \`ltx-video-13b-distilled-i2v\` | 13B distilled | Older 13B distilled i2v |
| \`ltx-video-13b-dev-t2v\` | 13B dev | LoRA-supporting dev variant |
| \`ltx-video-13b-dev-i2v\` | 13B dev | LoRA-supporting i2v |
| \`ltx-video-v095-t2v\` | v0.9.5 | Earlier checkpoint |
| \`ltx-video-preview-i2v\` | preview | Original i2v |
| \`ltxv-13b-098-distilled-t2v\` | v0.9.8 13B distilled | Long-form variant |
| \`ltxv-13b-098-distilled-i2v\` | v0.9.8 13B distilled | Long-form i2v |

## Pricing
| Tier | 1080p | 1440p | 2160p |
|------|-------|-------|-------|
| LTX-2.3 **Pro** (t2v + i2v) | $0.08/s | $0.16/s | $0.32/s |
| LTX-2.3 **Fast** (t2v + i2v) | $0.06/s | $0.12/s | $0.24/s |

- LTX-2-19b token-priced: $0.0018/megapixel base, $0.0008/megapixel distilled.
- Legacy 13B distilled: \`-t2v\` is still flat-rate **$0.04 per video**, but \`-i2v\` now bills **$0.04 per second** (at 24 fps), doubling to **$0.08/s** with the detail pass. The two are no longer priced alike — see the warning below.

⚠️ **Closed-tier rates rose in the 2026-08-15 sync** (Fast $0.04→$0.06/s, Pro i2v $0.06→$0.08/s at 1080p), and \`ltx-video-13b-distilled-i2v\` switched from **per-video to per-second** billing. That last one is the trap: a 10-second clip that used to cost a flat $0.04 now costs $0.40, or $0.80 with the detail pass — a 10–20× jump for callers who budgeted against the old flat rate. The sibling \`-t2v\` route did *not* change, so don't assume the pair behaves the same.

## Known strengths
- **Cheapest path to 1080p+ with audio** (LTX-2 family).
- 2160p / 4K supported on LTX-2.3 closed tier.
- LoRA endpoints accept caller-supplied custom-style fine-tunes.
- Open-weights 19B / 22B variants are replicable locally.

## Known weaknesses
- Per-frame quality at top tiers trails Veo / Sora / Kling Pro.
- Many variants — picking the right one needs this guide.
- Legacy variants are noticeably weaker than current.

## Input requirements
- **prompt** (required).
- **image** (required for i2v) — maps to \`image_url\`.
- LoRA endpoints: pass \`extra_params: { loras: [{ path: <url>, scale: <float> }] }\`. Multiple LoRAs supported as array entries; \`scale\` typically 0.5–1.5.
- LTX-2 audio: \`extra_params: { generate_audio: true }\` to enable native audio output.
- Resolution: \`extra_params: { resolution: "1080p" | "2160p" | ... }\` per variant; check the synced spec at \`src/catalog/fal-specs/{slug}/openapi.json\`.

## Prompt structure
LTX accepts standard scene + camera + style prompts. Open-weights variants respond to verbose prompts; closed-tier (LTX-2.3) is more efficient with concise prompts. LoRA-driven generation: keep the prompt about the scene, let the LoRA carry style.

## Example prompts
- LTX-2 Fast: \`prompt: "A drone shot rising over a forest at dawn, mist between trees", extra_params: { generate_audio: true, resolution: "1080p" }\`
- LoRA: \`prompt: "A cyberpunk city at night, neon reflections", extra_params: { loras: [{ path: "https://...lora.safetensors", scale: 1.0 }] }\`
- LTX-2.3 Pro 4K: \`prompt: "Slow-motion close-up of water droplets on a leaf", extra_params: { resolution: "2160p" }\`

## Access routes
See per-lineage tables above. Total: 31 routes spanning 5 lineages. (\`ltx-video-lora-i2v\` was dropped on 2026-08-15 — fal removed the endpoint and it now 404s.)

## Last verified
2026-08-15 — pricing re-synced from fal for the LTX-2.3 closed tier and the legacy 13B distilled routes; \`ltx-video-lora-i2v\` retired. Lineage tables and prompt guidance are unchanged since the 2026-04-28 initial seed and were not re-verified in this pass.

## Official references
- https://fal.ai/models/fal-ai/ltx-2/text-to-video
- https://fal.ai/models/fal-ai/ltx-2.3/text-to-video
- Lightricks LTX-Video: https://github.com/Lightricks/LTX-Video
`;

export function registerLtxVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'ltx_video_prompt_guide',
    'Reference guide for Lightricks LTX Video — full lineage including LTX-2.3 / LTX-2.3-22b / LTX-2 / LTX-2-19b / LTX legacy. 31 routes spanning closed-tier and open-weights with LoRA support. Cheapest path to 1080p+ with audio. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: LTX_GUIDE }] }),
  );
}

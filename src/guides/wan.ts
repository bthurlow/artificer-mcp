import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const WAN_GUIDE = `# Alibaba Wan Video — Prompt Guide

## What this model is best for
Wan is the largest Alibaba video model lineage on fal — spans cost-conscious mid-tier (Wan 2.1 / 2.2) through latest premium (Wan 2.7) with t2v / i2v / reference-to-video / audio-driven talking-head modes. Wan 2.7 i2v with audio is artificer's default talking-head model after the Q2 bake-off. Open-weights variants (2.2 a14b, 2.2 5b, 2.1) support custom LoRAs.

## Picking a model

### Wan 2.7 (latest, premium mid-tier)
| Slug | Modality | Best for |
|------|----------|----------|
| \`wan-2.7\` (in \`video.talking_head\`) | i2v + audio | **Default talking-head model** — see Known landmines below |
| \`wan-2.7-t2v\` | t2v | Latest Wan, prompt-only generation |
| \`wan-2.7-ref-to-video\` | multi-image i2v | Multi-image conditioning for product / character continuity |

Pricing: $0.10/s 720p, $0.15/s 1080p (Wan 2.7 family).

### Wan 2.6
| Slug | Modality | Best for |
|------|----------|----------|
| \`wan-2.6-t2v\` | t2v | Wan 2.6 t2v |
| \`wan-2.6-i2v\` | i2v | Wan 2.6 i2v |
| \`wan-2.6-flash-i2v\` | i2v fast | Cheap Wan 2.6 i2v |

### Wan 2.5 preview
| Slug | Modality | Best for |
|------|----------|----------|
| \`wan-2.5-t2v\` | t2v | Wan 2.5 preview, tier-aware pricing |
| \`wan-2.5-i2v\` | i2v | Wan 2.5 preview i2v |

### Wan 2.2 a14b (open weights, 14B activated)
| Slug | Modality | LoRA | Best for |
|------|----------|------|----------|
| \`wan-2.2-a14b-t2v\` | t2v | no | Open base 2.2 t2v |
| \`wan-2.2-a14b-turbo-t2v\` | t2v | no | Faster 2.2 t2v |
| \`wan-2.2-a14b-lora-t2v\` | t2v | yes | Custom-style 2.2 t2v |
| \`wan-2.2-a14b-i2v\` | i2v | no | Open 2.2 i2v |
| \`wan-2.2-a14b-turbo-i2v\` | i2v | no | Faster 2.2 i2v |

### Wan 2.2 5b (smaller open weights)
| Slug | Modality | Best for |
|------|----------|----------|
| \`wan-2.2-5b-t2v\` | t2v | Open 5B base |
| \`wan-2.2-5b-fastvideo-t2v\` | t2v | **Cheapest Wan** at $0.0125–0.025/video |
| \`wan-2.2-5b-distill-t2v\` | t2v | Distilled fast variant |
| \`wan-2.2-5b-i2v\` | i2v | Open 5B i2v |

### Wan 2.1 (compact pricing)
| Slug | Modality | Best for |
|------|----------|----------|
| \`wan-2.1-t2v\` | t2v | $0.20 480p / $0.40 720p per video |
| \`wan-2.1-i2v\` | i2v | Compact i2v pricing |
| \`wan-2.1-pro-t2v\` | t2v Pro | 1080p 30fps |
| \`wan-2.1-pro-i2v\` | i2v Pro | 1080p 30fps i2v |
| \`wan-2.1-t2v-lora\` | t2v + LoRA | Custom-style 2.1 t2v |
| \`wan-2.1-i2v-lora\` | i2v + LoRA | Custom-style 2.1 i2v |

### Wan Alpha + Krea Wan
| Slug | Modality | Best for |
|------|----------|----------|
| \`wan-alpha-t2v\` | t2v | **Transparent backgrounds** (alpha channel) |
| \`krea-wan-14b-t2v\` | t2v | Krea-tuned Wan 14B fast endpoint |

## Wan 2.7 talking-head — KNOWN LANDMINES

The talking-head entry (\`wan-2.7\` in \`video.talking_head\`) hits these three landmines hard. Read before any audio-driven call:

1. **\`resolution: "720p"\` is MANDATORY for audio-driven mode.** The fal-hosted runner cannot complete 1080p audio-driven inference within fal's generation budget. Schema allows "1080p" but it does not finish.

2. **\`duration\` must be an INTEGER and caps output length.** Wan does NOT auto-match output duration to audio length. \`duration: 5\` with 6.76s of audio truncates the last 1.76s. Pass \`Math.ceil(audio_seconds)\` plus margin for tail silence.

3. **Wall time varies 8× between cold and warm runners.** First run ~63s, warm runs ~8s. Set \`poll_timeout_seconds\` to at least 120 for cold starts.

Validated 2026-04-24 against artificer-mcp v0.9.0 in the Q2 talking-head bake-off.

## Known strengths (family-wide)
- **Wan 2.7** is the default talking-head pick (fastest, cheapest with rubric-parity to Kling Avatar v2 Pro).
- Wan 2.1 and 2.2 5b lineages give the cheapest video options on fal — Wan 2.2 5B FastVideo at $0.0125/video.
- LoRA endpoints (a14b, 2.1) accept caller-supplied custom-style fine-tunes.
- Wan Alpha is the only fal model producing alpha-channel video besides TransPixar.
- Krea Wan 14B brings a Krea-tuned style without leaving the Wan family.

## Known weaknesses
- Wan family is sprawling — picking the right version requires reading this guide.
- Older versions (2.1) noticeably trail 2.6 / 2.7 quality.
- Open-weights variants (a14b, 5b, 2.1) carry compute-time pricing — long generations can exceed flat-rate alternatives.

## Input requirements
- **prompt** (required for most variants; optional on talking-head where audio + image carry the signal).
- **image** (required for i2v) — maps to \`image_url\`.
- **audio** (talking-head only — the \`wan-2.7\` slug in \`video.talking_head\`) — maps to \`audio_url\`. WAV or MP3, 2–30s, max 15 MB.
- **duration** — typically integer (seconds). Wan 2.7 talking-head: enum {2..15}, default 5.
- **resolution** — strings vary by version: "720p" / "1080p" on closed-tier; \`"480p" / "720p" / "1080p"\` on Wan 2.1.
- **negative_prompt** — supported on most variants.
- LoRA variants: \`extra_params: { loras: [{ path, scale }] }\`.
- Wan 2.7 reference-to-video: pass references via \`extra_params: { reference_image_urls: [...] }\` array.

## Prompt structure
- **Talking-head (Wan 2.7)**: image anchors identity, audio drives mouth, prompt describes setting + shot. Don't describe dialogue or mouth movement — that competes with audio.
- **General t2v**: standard subject + action + camera framing. Wan handles cinematic vocabulary well.
- **LoRA variants**: keep prompt about the scene; let the LoRA carry style.
- **Wan Alpha**: describe the foreground subject; the model produces transparent background output for compositing.

## Example prompts
- Talking-head: \`prompt: "A woman speaking directly to camera, natural lighting, head and shoulders, steady frame", audio: voice.wav, image: portrait.jpg, extra_params: { resolution: "720p", duration: 7 }\`
- t2v cinematic: \`prompt: "Wide shot of a sailboat at sunset, gentle wave motion"\` (Wan 2.7-t2v)
- LoRA: \`prompt: "city skyline at night", extra_params: { loras: [{ path: "https://...lora.safetensors", scale: 1.0 }] }\` (wan-2.2-a14b-lora-t2v)
- Alpha: \`prompt: "Animated logo reveal, golden particles, transparent background"\` (wan-alpha-t2v)
- Cheapest fallback: \`prompt: "A panda eating bamboo"\` (wan-2.2-5b-fastvideo-t2v at $0.0125)

## Access routes (full table)
| Slug | fal endpoint |
|------|--------------|
| \`wan-2.7\` | \`fal-ai/wan/v2.7/image-to-video\` (talking-head) |
| \`wan-2.7-t2v\` | \`fal-ai/wan/v2.7/text-to-video\` |
| \`wan-2.7-ref-to-video\` | \`fal-ai/wan/v2.7/reference-to-video\` |
| \`wan-2.6-t2v\` | \`wan/v2.6/text-to-video\` |
| \`wan-2.6-i2v\` | \`wan/v2.6/image-to-video\` |
| \`wan-2.6-flash-i2v\` | \`wan/v2.6/image-to-video/flash\` |
| \`wan-2.5-t2v\` | \`fal-ai/wan-25-preview/text-to-video\` |
| \`wan-2.5-i2v\` | \`fal-ai/wan-25-preview/image-to-video\` |
| \`wan-2.2-a14b-t2v\` | \`fal-ai/wan/v2.2-a14b/text-to-video\` |
| \`wan-2.2-a14b-turbo-t2v\` | \`fal-ai/wan/v2.2-a14b/text-to-video/turbo\` |
| \`wan-2.2-a14b-lora-t2v\` | \`fal-ai/wan/v2.2-a14b/text-to-video/lora\` |
| \`wan-2.2-a14b-i2v\` | \`fal-ai/wan/v2.2-a14b/image-to-video\` |
| \`wan-2.2-a14b-turbo-i2v\` | \`fal-ai/wan/v2.2-a14b/image-to-video/turbo\` |
| \`wan-2.2-5b-t2v\` | \`fal-ai/wan/v2.2-5b/text-to-video\` |
| \`wan-2.2-5b-fastvideo-t2v\` | \`fal-ai/wan/v2.2-5b/text-to-video/fast-wan\` |
| \`wan-2.2-5b-distill-t2v\` | \`fal-ai/wan/v2.2-5b/text-to-video/distill\` |
| \`wan-2.2-5b-i2v\` | \`fal-ai/wan/v2.2-5b/image-to-video\` |
| \`wan-2.1-t2v\` | \`fal-ai/wan-t2v\` |
| \`wan-2.1-i2v\` | \`fal-ai/wan-i2v\` |
| \`wan-2.1-pro-t2v\` | \`fal-ai/wan-pro/text-to-video\` |
| \`wan-2.1-pro-i2v\` | \`fal-ai/wan-pro/image-to-video\` |
| \`wan-2.1-t2v-lora\` | \`fal-ai/wan-t2v-lora\` |
| \`wan-2.1-i2v-lora\` | \`fal-ai/wan-i2v-lora\` |
| \`wan-alpha-t2v\` | \`fal-ai/wan-alpha\` |
| \`krea-wan-14b-t2v\` | \`fal-ai/krea-wan-14b/text-to-video\` |

## Last verified
- Wan 2.7 talking-head: 2026-04-24 (Q2 bake-off).
- Full family seed: 2026-04-28.

## Official references
- Wan 2.7: https://fal.ai/models/fal-ai/wan/v2.7/image-to-video
- Wan upstream: https://github.com/Wan-Video
- Q2 bake-off: docs/plans/fal-bakeoff-2026-04-23.md
`;

export function registerWanPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'wan_video_prompt_guide',
    'Reference guide for Alibaba Wan Video — full lineage from Wan 2.1 (compact pricing) through Wan 2.7 (default talking-head). 25 routes covering t2v / i2v / reference / talking-head / LoRA / alpha-channel modes across Wan 2.1, 2.2 a14b, 2.2 5b, 2.5, 2.6, 2.7, Wan Alpha, and Krea Wan. Includes the 3 mandatory talking-head landmines for the Wan 2.7 i2v audio-driven path. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: WAN_GUIDE }] }),
  );
}

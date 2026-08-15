import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const SORA_GUIDE = `# Sora 2 — Prompt Guide

## What this model is best for
OpenAI's Sora 2 hosted on fal. Strong on long, narrative-style clips (up to 20s natively, no concatenation needed) with native audio including lip-synced dialogue. Choose Sora when you want a single-shot 12s-20s scene with natural sound, or when you need 1080p / true-1080p output without stitching.

Per tier orientation:
- **Sora 2 Pro** — top-tier quality, 720p / legacy 1080p (1792x1024 or 1024x1792) / true 1080p (1920x1080 or 1080x1920). Higher per-second cost but the right choice for hero scenes.
- **Sora 2 Standard** — cheaper baseline tier ($0.10/s), default 720p. Use for drafts and lower-stakes social clips.

Both tiers support text-to-video and image-to-video on fal. Both can produce up to 20s in a single call.

## Picking a model

| Slug | Modality | Max duration | Resolution options | Audio | Cost (per second) | Best for |
|------|----------|--------------|--------------------|-------|--------------------|----------|
| \`sora-2-pro-t2v\` | t2v | 20s | 720p / 1080p (legacy) / true_1080p | Native | $0.30/s 720p, $0.50/s legacy 1080p, $0.70/s true 1080p | Hero shots, dialogue at full quality |
| \`sora-2-pro-i2v\` | i2v | 20s | auto / 720p / 1080p / true_1080p | Native | Same as Pro t2v | First-frame-anchored cinematic |
| \`sora-2-t2v\` | t2v | 20s | 720p (default) | Native | $0.10/s | Default for drafts and social |
| \`sora-2-i2v\` | i2v | 20s | See fal.ai listing | Native | $0.10/s baseline | Cheapest i2v with audio |

Default picks:
- Long-form social clip (12-20s) with dialogue → **sora-2-t2v** at default 720p.
- 1080p hero with native audio → **sora-2-pro-t2v** at \`resolution: "true_1080p"\`.
- Anchored character scene with motion → **sora-2-i2v** (baseline) or **sora-2-pro-i2v** for full quality.

## Known strengths
- Native audio including ambient + Foley + lip-synced dialogue.
- 20-second single-shot generation — longest in the catalog.
- Strong physics realism on natural motion (water, cloth, hair, faces).
- Good prompt adherence on cinematic vocabulary (POV, action-cam, close-mic'd voice).

## Known weaknesses / quirks
- **Two distinct 1080p flavors on Pro.** \`"1080p"\` is the legacy 1792x1024 / 1024x1792 (cheaper). \`"true_1080p"\` is 1920x1080 / 1080x1920 (more expensive). Pick deliberately.
- **\`duration\` is an INTEGER**, not a string. Schema accepts \`4 | 8 | 12 | 16 | 20\`. Other values 4xx. The artificer transport's \`duration_seconds\` is already integer — pass \`8\`, not \`"8"\`.
- **\`delete_video\` defaults to \`true\`.** If \`true\`, the output cannot be remixed and is permanently deleted on fal's side after fetch. If you want to keep the upstream copy for re-fetch / debugging, pass \`delete_video: false\` via \`extra_params\`. The artificer transport downloads the bytes immediately so this rarely matters in practice.
- **\`detect_and_block_ip\`**: defaults to \`false\`. If your prompt mentions a recognizable IP (a celebrity, a brand, a film) and you want the request to fail-fast rather than risk a moderation block deeper in inference, set this to \`true\`.
- **\`character_ids\`** (Sora's persistent characters): when set, fal forces the OpenAI provider only — bypasses fal-side optimizations. Reference characters by name in the prompt body.
- **Aspect ratio** is constrained to 16:9 or 9:16 (Pro t2v) or auto / 16:9 / 9:16 (Pro i2v). No 1:1, no 4:5.
- IP detection on the prompt body (and on the image for i2v) can refuse seemingly innocuous requests if a familiar character / logo appears in the source.

## Input requirements

The artificer transport (\`fal_generate_video\`) maps \`image\` to the wire key \`image_url\`. Sora 2 i2v uses \`image_url\` directly, so the structural arg flows through without remapping. T2V variants take only a prompt.

| Variant | Required wire keys | Optional via \`extra_params\` | Notes |
|---------|--------------------|------------------------------|-------|
| \`sora-2-pro-t2v\` / \`sora-2-t2v\` | \`prompt\` | \`resolution\`, \`aspect_ratio\`, \`duration\` (int), \`delete_video\`, \`detect_and_block_ip\`, \`character_ids\`, \`model\` (Standard only — pin a specific snapshot) | Use \`resolution: "true_1080p"\` on Pro for full HD. |
| \`sora-2-pro-i2v\` / \`sora-2-i2v\` | \`prompt\`, \`image_url\` | Same as t2v | Transport \`image\` → \`image_url\`. Source first frame must be 16:9 or 9:16; \`resolution: "auto"\` lets fal infer. |

Common knobs (artificer structural args):
- \`prompt\` — required.
- \`image\` — i2v only; first-frame anchor.
- \`duration_seconds\` — integer, one of \`4 | 8 | 12 | 16 | 20\`.
- \`aspect_ratio\` — \`"16:9"\` or \`"9:16"\`. (Pro i2v also accepts \`"auto"\`.)
- \`resolution\` — Pro: \`"720p" | "1080p" | "true_1080p"\` (Pro i2v also \`"auto"\`). Standard: \`"720p"\` is the listed value.
- \`negative_prompt\` — Sora 2 schema does NOT list \`negative_prompt\`. Don't pass it.

## Prompt structure

Sora prompts work best as **single-paragraph cinematographic descriptions** that interleave camera, subject, action, audio cues, and mood:

\`[Camera setup and motion] of [subject] [action]; [environmental detail]; [audio cue]; [lighting and tone]\`

Patterns that consistently work:
- **Camera vocabulary first.** Sora reads "Front-facing 'invisible' action-cam", "drone descending", "handheld 35mm", "static wide", and follows them.
- **Quote dialogue inline.** Lip-sync is reliable. Same pattern as Veo: speaker + speech verb + quoted line. Keep dialogue short for the clip duration (one sentence per ~4-8 seconds).
- **Describe the audio.** "Natural wind roar, voice close-mic'd and slightly compressed" — the model uses this to shape ambient + Foley.
- **End on a beat.** Sora respects "End on first tug of canopy" kind of closing-frame instructions; useful for stitching plans.
- Avoid trying to force multi-shot transitions in a single prompt; Sora gives the most coherent single-shot scenes.
- Avoid ambient prompts with no concrete subject — the model artifacts more on abstract atmosphere than on explicit action.

## Example prompts

**Single-shot dialogue (Standard t2v, 720p, 12s):**
> "Medium close-up of a young chef in a warm restaurant kitchen at golden hour, gentle handheld motion. She looks toward the camera and says with quiet pride, \\"This is the dish I've been working on for two years.\\" Subtle clatter of pans in the background, soft ambient music, shallow depth of field, warm tungsten lighting."

**POV action scene (Pro t2v, true_1080p, 8s):**
> "Front-facing 'invisible' action-cam on a skydiver in freefall above bright clouds; camera locked on his face. He speaks over the wind with clear lipsync: \\"This is insanely fun!\\" Natural wind roar, voice close-mic'd and slightly compressed so it's intelligible. Midday sun, goggles and jumpsuit flutter, energetic but stable framing with subtle shake."

**I2V with anchored character (Pro i2v, 20s):**
> "Slow push-in on the subject; she takes a breath, then says warmly, \\"You can do this.\\" Soft window light, gentle ambient room tone, calm steady frame, ending on a small smile."
>
> Pair with a 16:9 or 9:16 first-frame still pre-rendered with nano-banana matching the target aspect.

## Access routes

| Slug | fal endpoint id |
|------|-----------------|
| \`sora-2-pro-t2v\` | \`fal-ai/sora-2/text-to-video/pro\` |
| \`sora-2-pro-i2v\` | \`fal-ai/sora-2/image-to-video/pro\` |
| \`sora-2-t2v\` | \`fal-ai/sora-2/text-to-video\` |
| \`sora-2-i2v\` | \`fal-ai/sora-2/image-to-video\` |

All four route through \`fal_generate_video\` with \`FAL_KEY\`. No Google / Vertex route — Sora is fal-hosted only in this catalog.

## Last verified
2026-04-28 — initial seed of full fal video catalog. Pricing and input schemas grounded in committed fal-specs (sora-2-pro-t2v, sora-2-pro-i2v, sora-2-t2v, sora-2-i2v).

## Official references
- Sora 2 Pro t2v: https://fal.ai/models/fal-ai/sora-2/text-to-video/pro
- Sora 2 Pro i2v: https://fal.ai/models/fal-ai/sora-2/image-to-video/pro
- Sora 2 t2v: https://fal.ai/models/fal-ai/sora-2/text-to-video
- Sora 2 i2v: https://fal.ai/models/fal-ai/sora-2/image-to-video
- OpenAI upstream: https://openai.com/sora
`;

export function registerSoraPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'sora_video_prompt_guide',
    'Reference guide for OpenAI Sora 2 on fal (Pro and Standard tiers, t2v + i2v). Covers tier selection (720p / legacy 1080p / true 1080p), the duration-int and delete_video / detect_and_block_ip / character_ids quirks, dialogue prompt patterns, and example prompts. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: SORA_GUIDE }],
    }),
  );
}

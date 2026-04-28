import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const KLING_GUIDE = `# Kling Video — Prompt Guide (non-avatar)

## What this guide covers
The full Kling video lineage on fal EXCEPT the avatar / talking-head models, which have their own guide (\`kling_avatar_prompt_guide\`). Covers Kling v1, v1.5, v1.6, v2, v2.1, v2.5-turbo, v2.6, v3 (current), o1 (first-last-frame + reference), and o3 (reference / pro / standard / 4k tiers). All slugs route through \`fal_generate_video\` with \`FAL_KEY\`.

Per family / tier orientation:
- **Kling 3.0** — current top of the line. Pro / Standard / 4k tiers, all with native audio, multi-shot prompts, multi-prompt video generation, and "elements" (per-character / per-object reference packs).
- **Kling O3** — reference-to-video and 4k focused tier. Pro / Standard / 4k variants. Built around \`elements\` and reference image packs for consistent characters across multi-shot scenes.
- **Kling 2.6 Pro** — strong middle-quality tier; predates the v3 multi-shot redesign.
- **Kling 2.5 Turbo** — fast, cheap. Pro and Standard sub-tiers. Top pick when latency / cost matters and you don't need v3's multi-shot.
- **Kling 2.1 Master / 2.0 Master** — premium pre-v3 tiers. Cinematic visuals; no native audio in the schema.
- **Kling 2.1 Pro / Standard** — mid-tier i2v workhorses.
- **Kling 1.6** — last-gen Pro / Standard. Workhorse for cheap drafts.
- **Kling 1.5 Pro** — legacy Pro tier; still in catalog for continuity.
- **Kling 1.0 Standard** — oldest in catalog; t2v + i2v.
- **Kling O1** — original first-last-frame i2v + reference-to-video tier. Smaller surface than O3.

Native audio is **only on the v3 line and (some) O3 variants**; older tiers are silent.

## Picking a model

| Slug | Modality | Max duration | Resolution | Audio | Approx. cost (5s) | Best for |
|------|----------|--------------|------------|-------|--------------------|----------|
| \`kling-3-pro-t2v\` | t2v + multi-shot | 15s | up to 1080p | Native (default on) | $0.56 audio off / $0.84 audio on | Top-tier text-to-video with audio |
| \`kling-3-pro-i2v\` | i2v + multi-shot + elements | 15s | up to 1080p | Native (default on) | $0.56 / $0.84 | Top-tier i2v with consistent elements |
| \`kling-3-std-t2v\` | t2v + multi-shot | 15s | up to 1080p | Native (default on) | $0.42 / $0.63 | Cheaper v3 t2v |
| \`kling-3-std-i2v\` | i2v + multi-shot + elements | 15s | up to 1080p | Native (default on) | $0.42 / $0.63 | Cheaper v3 i2v |
| \`kling-3-4k-t2v\` | t2v 4k | 15s | 4k | Native (always on at 4k) | $2.10 (5s) | Native 4k output, no upscale |
| \`kling-3-4k-i2v\` | i2v 4k + elements | 15s | 4k | Native | $2.10 (5s) | Native 4k i2v |
| \`kling-o3-pro-t2v\` | t2v | 15s | See fal.ai listing | Native (audio toggle) | See listing | O3 tier t2v |
| \`kling-o3-pro-i2v\` | i2v | 15s | See listing | Native | See listing | O3 tier i2v |
| \`kling-o3-std-t2v\` | t2v | 15s | See listing | Native | See listing | Cheaper O3 t2v |
| \`kling-o3-std-i2v\` | i2v | 15s | See listing | Native | See listing | Cheaper O3 i2v |
| \`kling-o3-pro-ref\` | reference-to-video (\`elements\` + \`image_urls\`) | 15s | See listing | Optional (default off) | $0.56 audio off / $0.70 audio on | Multi-character / multi-element scenes with consistency |
| \`kling-o3-std-ref\` | reference-to-video | 15s | See listing | Optional | See listing | Cheaper reference scenes |
| \`kling-o3-4k-i2v\` | i2v 4k | 15s | 4k | Native | See listing | Native 4k i2v on O3 |
| \`kling-o3-4k-ref\` | reference-to-video 4k | 15s | 4k | Optional | See listing | Native 4k reference scenes |
| \`kling-2.6-pro-t2v\` | t2v | See fal.ai listing | See listing | See listing | See listing | Pre-v3 Pro t2v |
| \`kling-2.6-pro-i2v\` | i2v | See listing | See listing | See listing | See listing | Pre-v3 Pro i2v |
| \`kling-2.5-turbo-pro-t2v\` | t2v | 5s or 10s | See listing | None in schema | See fal.ai listing | Fast/cheap Pro t2v |
| \`kling-2.5-turbo-pro-i2v\` | i2v + tail-image | 5s or 10s | See listing | None | $0.35 (5s) + $0.07/extra-second | Fast/cheap Pro i2v |
| \`kling-2.5-turbo-std-i2v\` | i2v | 5s or 10s | See listing | None | See listing | Cheapest 2.5 turbo i2v |
| \`kling-2.1-master-t2v\` | t2v | 5s or 10s | See listing | None in schema | $1.40 (5s) + $0.28/extra-second | Premium pre-v3 t2v |
| \`kling-2.1-master-i2v\` | i2v | 5s or 10s | See listing | None | See listing | Premium pre-v3 i2v |
| \`kling-2.1-pro-i2v\` | i2v | See listing | See listing | None | See listing | Mid-tier i2v workhorse |
| \`kling-2.1-std-i2v\` | i2v | See listing | See listing | None | See listing | Cheap mid-tier i2v |
| \`kling-2-master-t2v\` | t2v | 5s or 10s | See listing | None | $1.40 (5s) + $0.28/extra-second | v2 master t2v |
| \`kling-2-master-i2v\` | i2v | 5s or 10s | See listing | None | See listing | v2 master i2v |
| \`kling-1.6-pro-t2v\` | t2v | See listing | See listing | None | See listing | Pre-2.0 Pro t2v |
| \`kling-1.6-pro-i2v\` | i2v | See listing | See listing | None | See listing | Pre-2.0 Pro i2v |
| \`kling-1.6-std-t2v\` | t2v | See listing | See listing | None | See listing | Cheap legacy t2v |
| \`kling-1.6-std-i2v\` | i2v | See listing | See listing | None | See listing | Cheap legacy i2v |
| \`kling-1.5-pro-t2v\` | t2v | See listing | See listing | None | See listing | Legacy Pro t2v |
| \`kling-1.5-pro-i2v\` | i2v | See listing | See listing | None | See listing | Legacy Pro i2v |
| \`kling-1-std-t2v\` | t2v | See listing | See listing | None | See listing | Oldest t2v |
| \`kling-1-std-i2v\` | i2v | See listing | See listing | None | See listing | Oldest i2v |
| \`kling-o1-i2v-flf\` | first-last-frame i2v | See listing | See listing | None | See listing | First-last-frame on the O1 generation |
| \`kling-o1-std-ref\` | reference-to-video | See listing | See listing | None | See listing | Reference-to-video on O1 |

Default picks:
- Cinematic clip with audio + character consistency → **kling-3-pro-i2v** with \`elements\`.
- Multi-character action scene → **kling-o3-pro-ref** with \`elements\` array.
- Cheap draft → **kling-2.5-turbo-std-i2v**.
- Native 4k hero → **kling-3-4k-i2v** or **kling-o3-4k-ref**.
- First-last-frame motion → **kling-o1-i2v-flf** (O1 generation) or use start_image_url + end_image_url on a v3 i2v slug.

## Known strengths
- Strong character consistency on \`elements\`-based generation (v3, O3) — frontal_image + reference set holds identity across multi-shot output.
- Native audio (v3, parts of O3) including ambient and dialogue.
- Multi-shot generation in a single call: \`multi_prompt\` array divides one render into multiple shots with per-shot prompts and durations.
- Extensive duration range on v3 / O3: 3-15 seconds in 1-second increments.
- Native 4k output on v3-4k and O3-4k tiers (no post-upscale).
- Wide cinematography vocabulary — Kling responds well to film terms (35mm, anamorphic, dutch angle, dolly).

## Known weaknesses / quirks
- **Wire-key inconsistency across versions.** This is the LLM trap. See "Input requirements" below. Short version: v2.5-turbo-pro-i2v uses \`image_url\` and \`tail_image_url\`. v3 / O3 i2v use \`start_image_url\` and \`end_image_url\`. v3 / O3 reference-to-video uses \`image_urls\` (array) and / or \`elements\`. The artificer transport's \`image\` structural arg always sends \`image_url\` — so for v3 / O3 you typically pass via \`extra_params\` and OMIT the structural \`image\` arg.
- **\`prompt\` is optional on v3 / O3** — schema accepts an empty body if you pass \`multi_prompt\` instead. Older tiers (1.x, 2.x non-master) require \`prompt\`.
- **\`negative_prompt\` defaults to \`"blur, distort, and low quality"\`** on most Kling tiers. Override deliberately if you want to remove that bias.
- **\`cfg_scale\`** ranges 0-1 on Kling (NOT 0-20 like SD). Default 0.5. Higher values stick closer to prompt; lower values give the model more freedom.
- **\`generate_audio\` defaults differ.** On v3 t2v / i2v: default \`true\`. On O3 reference-to-video: default \`false\`. Check the per-slug schema before assuming.
- **\`shot_type\`** ("customize" or "intelligent") is required when \`multi_prompt\` is provided.
- **Voice control on v3** ($0.196/s vs $0.168/s with audio) is gated behind extra wire keys not surfaced here — see fal.ai for the latest.
- Fast / aggressive motion still artifacts on v1.x and v2.x; v3 / O3 are notably better but not perfect.
- 4k variants are slow — budget extra wall time and \`poll_timeout_seconds\`.

## Input requirements

The artificer transport (\`fal_generate_video\`) maps the structural arg \`image\` to wire key \`image_url\`. For Kling v3 and O3, the wire key is \`start_image_url\` instead. **For those models, pass the start frame via \`extra_params: { start_image_url: "..." }\` and OMIT the structural \`image\` arg.** Otherwise the transport will set \`image_url\` (which v3 / O3 will ignore or error on) in addition to your \`start_image_url\`.

| Variant family | Required | Optional via \`extra_params\` | Wire-key gotchas |
|----------------|----------|------------------------------|-------------------|
| Kling 3 / O3 t2v (Pro / Std / 4k) | \`prompt\` OR \`multi_prompt\` (not both) | \`duration\` (string \`"3"\`-\`"15"\`), \`generate_audio\` (default \`true\` on v3), \`shot_type\`, \`aspect_ratio\`, \`negative_prompt\`, \`cfg_scale\` | \`prompt\` is OPTIONAL if you pass \`multi_prompt\`. |
| Kling 3 / O3 i2v (Pro / Std / 4k) | \`start_image_url\` (+ \`prompt\` or \`multi_prompt\`) | \`end_image_url\`, \`elements\`, \`duration\`, \`generate_audio\`, \`shot_type\`, \`negative_prompt\`, \`cfg_scale\` | **Wire key is \`start_image_url\`, NOT \`image_url\`.** OMIT the artificer \`image\` arg; pass via \`extra_params\`. \`elements\` is an array of \`{reference_image_urls, frontal_image_url}\` or \`{video_url}\` objects. |
| Kling O3 reference-to-video (Pro / Std / 4k) | \`prompt\` (or \`multi_prompt\`) + \`image_urls\` (array) and/or \`elements\` array | \`start_image_url\`, \`end_image_url\`, \`generate_audio\` (default \`false\`), \`shot_type\`, \`aspect_ratio\` | **Wire key is \`image_urls\` (plural array).** Reference in prompt with \`@Image1\`, \`@Image2\`, etc. \`elements\` referenced as \`@Element1\`, \`@Element2\`. Max 4 total (elements + reference images). |
| Kling 2.5-turbo Pro / Std i2v | \`prompt\`, \`image_url\` | \`tail_image_url\`, \`duration\` (\`"5"\` or \`"10"\`), \`negative_prompt\`, \`cfg_scale\` | Wire key is \`image_url\` — transport \`image\` arg flows through. End frame is \`tail_image_url\` (NOT \`end_image_url\`). |
| Kling 2.5-turbo Pro t2v | \`prompt\` | \`duration\`, \`aspect_ratio\`, \`negative_prompt\`, \`cfg_scale\` | Plain t2v. |
| Kling 2.x Master / 2.1 Pro/Std / 1.6 / 1.5 / 1.0 t2v | \`prompt\` | \`duration\` (\`"5"\` or \`"10"\` on Master), \`aspect_ratio\`, \`negative_prompt\`, \`cfg_scale\` | Plain t2v. No native audio in schema. |
| Kling 2.x / 1.x i2v | \`prompt\`, \`image_url\` | \`duration\`, \`aspect_ratio\`, \`negative_prompt\`, \`cfg_scale\` | Wire key is \`image_url\` — transport \`image\` arg flows through. |
| Kling O1 i2v (first-last-frame) | \`prompt\`, \`image_url\`, end-frame wire key (see fal.ai listing) | \`duration\`, \`negative_prompt\`, \`cfg_scale\` | End-frame key not currently in synced specs; check fal.ai listing for \`end_image_url\` vs \`tail_image_url\` before calling. |
| Kling O1 std reference-to-video | \`prompt\`, reference image keys | See fal.ai listing | Reference-image wire keys not currently in synced specs; check fal.ai listing. |

Common knobs (artificer structural args):
- \`prompt\` — required on most tiers; optional on v3 / O3 if \`multi_prompt\` is provided.
- \`image\` — for variants where the wire key is \`image_url\` (i.e., 1.x / 2.x i2v, 2.5-turbo i2v). For v3 / O3 i2v, OMIT this arg and pass \`start_image_url\` via \`extra_params\`.
- \`duration_seconds\` — integer; transport stringifies. v3 / O3 accept 3-15. 2.x master and 2.5-turbo accept 5 or 10 only. Check the per-slug schema.
- \`aspect_ratio\` — \`"16:9" | "9:16" | "1:1"\` on most Kling tiers.
- \`negative_prompt\` — supported across the family. Default \`"blur, distort, and low quality"\`.
- \`resolution\` — NOT a standard Kling arg. Resolution is implicit in the slug (Pro / Standard / 4k).

## Prompt structure

Kling prompts respond to **dense cinematic descriptions** with film-vocabulary cues. The model is trained heavily on film footage — references to camera, lens, lighting, and grade improve output noticeably.

Patterns that consistently work:
- Lead with **camera motion + shot type**: "Slow drone descent", "static close-up", "tracking shot from behind", "dutch-angle low push-in".
- Layer on **film vocabulary**: "shot on 35mm Kodak Portra 400", "anamorphic flare", "shallow depth of field", "warm tungsten grade".
- **Action verbs in present tense**: gallops, drifts, glides, tilts, frolics. Kling renders verbs more reliably than mood adjectives.
- **Multi-shot with \`multi_prompt\`** (v3 / O3): provide an array of \`{prompt, duration}\` objects to split a single render into shots. Use \`shot_type: "customize"\` to honor your timing exactly, \`"intelligent"\` to let Kling pace.
- **Reference characters / objects with \`@Element1\`, \`@Element2\`** when you pass an \`elements\` array (v3 / O3). Reference reference-images with \`@Image1\`, \`@Image2\` (O3 reference-to-video).
- For dialogue (v3 / O3 with audio on): same pattern as Veo / Sora — quote the line, lead with speaker + speech verb, keep to one sentence per shot. English / Chinese supported natively; other languages auto-translate to English.

For older Kling tiers (1.x / 2.x non-v3): no audio in schema; treat as silent cinematic. Multi-prompt is not available — write a single dense paragraph.

## Example prompts

**T2V cinematic (v3 Pro):**
> "Close-up of glowing fireflies dancing in a dark forest at twilight. Soft bioluminescent particles float through the air. Shallow depth of field, bokeh lights in background. Magical atmosphere, gentle movement."

**I2V with element pack (v3 Pro):**
> Prompt: "@Element1 examines the bowl, turning it gently. Subtle smile forms on his face. Dust particles drift in warm light. Breathing motion, blinking eyes."
>
> Pair with \`extra_params: { start_image_url: "...", elements: [{ frontal_image_url: "...", reference_image_urls: ["..."] }] }\`. OMIT the structural \`image\` arg.

**Reference-to-video (O3 Pro):**
> Prompt: "@Element1 and @Element2 enter the scene from opposite sides. The elephant starts to play with the ball."
>
> Pair with \`extra_params: { elements: [{frontal_image_url, reference_image_urls}, {frontal_image_url, reference_image_urls}], image_urls: ["..."] }\`.

**Multi-shot (v3 Std):**
> Prompt unset; pass via \`extra_params\`:
> \`\`\`json
> {
>   "multi_prompt": [
>     { "prompt": "Wide establishing shot of a coastal town at sunrise.", "duration": "4" },
>     { "prompt": "Push-in to a fisherman casting nets from a small boat.", "duration": "5" },
>     { "prompt": "Close-up of his weathered hands gripping the rope.", "duration": "3" }
>   ],
>   "shot_type": "customize"
> }
> \`\`\`

**Cheap legacy i2v draft (1.6 Standard):**
> "Slow gentle parallax push-in. Soft natural lighting, calm mood, steady frame."
>
> Pair with structural \`image\` arg.

## Access routes

| Slug | fal endpoint id |
|------|-----------------|
| \`kling-3-pro-t2v\` | \`fal-ai/kling-video/v3/pro/text-to-video\` |
| \`kling-3-pro-i2v\` | \`fal-ai/kling-video/v3/pro/image-to-video\` |
| \`kling-3-std-t2v\` | \`fal-ai/kling-video/v3/standard/text-to-video\` |
| \`kling-3-std-i2v\` | \`fal-ai/kling-video/v3/standard/image-to-video\` |
| \`kling-3-4k-t2v\` | \`fal-ai/kling-video/v3/4k/text-to-video\` |
| \`kling-3-4k-i2v\` | \`fal-ai/kling-video/v3/4k/image-to-video\` |
| \`kling-o3-pro-t2v\` | \`fal-ai/kling-video/o3/pro/text-to-video\` |
| \`kling-o3-pro-i2v\` | \`fal-ai/kling-video/o3/pro/image-to-video\` |
| \`kling-o3-std-t2v\` | \`fal-ai/kling-video/o3/standard/text-to-video\` |
| \`kling-o3-std-i2v\` | \`fal-ai/kling-video/o3/standard/image-to-video\` |
| \`kling-o3-pro-ref\` | \`fal-ai/kling-video/o3/pro/reference-to-video\` |
| \`kling-o3-std-ref\` | \`fal-ai/kling-video/o3/standard/reference-to-video\` |
| \`kling-o3-4k-i2v\` | \`fal-ai/kling-video/o3/4k/image-to-video\` |
| \`kling-o3-4k-ref\` | \`fal-ai/kling-video/o3/4k/reference-to-video\` |
| \`kling-2.6-pro-t2v\` | \`fal-ai/kling-video/v2.6/pro/text-to-video\` |
| \`kling-2.6-pro-i2v\` | \`fal-ai/kling-video/v2.6/pro/image-to-video\` |
| \`kling-2.5-turbo-pro-t2v\` | \`fal-ai/kling-video/v2.5-turbo/pro/text-to-video\` |
| \`kling-2.5-turbo-pro-i2v\` | \`fal-ai/kling-video/v2.5-turbo/pro/image-to-video\` |
| \`kling-2.5-turbo-std-i2v\` | \`fal-ai/kling-video/v2.5-turbo/standard/image-to-video\` |
| \`kling-2.1-master-t2v\` | \`fal-ai/kling-video/v2.1/master/text-to-video\` |
| \`kling-2.1-master-i2v\` | \`fal-ai/kling-video/v2.1/master/image-to-video\` |
| \`kling-2.1-pro-i2v\` | \`fal-ai/kling-video/v2.1/pro/image-to-video\` |
| \`kling-2.1-std-i2v\` | \`fal-ai/kling-video/v2.1/standard/image-to-video\` |
| \`kling-2-master-t2v\` | \`fal-ai/kling-video/v2/master/text-to-video\` |
| \`kling-2-master-i2v\` | \`fal-ai/kling-video/v2/master/image-to-video\` |
| \`kling-1.6-pro-t2v\` | \`fal-ai/kling-video/v1.6/pro/text-to-video\` |
| \`kling-1.6-pro-i2v\` | \`fal-ai/kling-video/v1.6/pro/image-to-video\` |
| \`kling-1.6-std-t2v\` | \`fal-ai/kling-video/v1.6/standard/text-to-video\` |
| \`kling-1.6-std-i2v\` | \`fal-ai/kling-video/v1.6/standard/image-to-video\` |
| \`kling-1.5-pro-t2v\` | \`fal-ai/kling-video/v1.5/pro/text-to-video\` |
| \`kling-1.5-pro-i2v\` | \`fal-ai/kling-video/v1.5/pro/image-to-video\` |
| \`kling-1-std-t2v\` | \`fal-ai/kling-video/v1/standard/text-to-video\` |
| \`kling-1-std-i2v\` | \`fal-ai/kling-video/v1/standard/image-to-video\` |
| \`kling-o1-i2v-flf\` | \`fal-ai/kling-video/o1/image-to-video\` |
| \`kling-o1-std-ref\` | \`fal-ai/kling-video/o1/standard/reference-to-video\` |

All slugs route through \`fal_generate_video\` with \`FAL_KEY\`. Avatar / talking-head models are out of scope here — see \`kling_avatar_prompt_guide\`.

## Last verified
2026-04-28 — initial seed of full fal video catalog. Pricing and input schemas grounded in committed fal-specs (kling-3-pro-t2v, kling-3-pro-i2v, kling-3-std-t2v, kling-3-4k-i2v, kling-o3-pro-ref, kling-2.5-turbo-pro-i2v, kling-2.1-master-t2v, kling-2-master-t2v). v1.x, v1.6, v2.6, and O1 specs are not currently in the local \`fal-specs\` sync — defer to the live fal.ai listing for those slugs' exact wire keys, durations, and pricing.

## Official references
- Kling v3 Pro t2v: https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video
- Kling v3 Pro i2v: https://fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video
- Kling v3 4k i2v: https://fal.ai/models/fal-ai/kling-video/v3/4k/image-to-video
- Kling O3 Pro reference-to-video: https://fal.ai/models/fal-ai/kling-video/o3/pro/reference-to-video
- Kling 2.5 Turbo Pro i2v: https://fal.ai/models/fal-ai/kling-video/v2.5-turbo/pro/image-to-video
- Kling 2.1 Master t2v: https://fal.ai/models/fal-ai/kling-video/v2.1/master/text-to-video
- Kling 2.0 Master t2v: https://fal.ai/models/fal-ai/kling-video/v2/master/text-to-video
- Kling 1.6 Pro t2v: https://fal.ai/models/fal-ai/kling-video/v1.6/pro/text-to-video
- Kling O1 i2v: https://fal.ai/models/fal-ai/kling-video/o1/image-to-video
- Kuaishou (Kling upstream): https://www.klingai.com
`;

export function registerKlingVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'kling_video_prompt_guide',
    'Reference guide for the full non-avatar Kling video catalog on fal (v1 / v1.5 / v1.6 / v2 / v2.1 / v2.5-turbo / v2.6 / v3 / O1 / O3, across Pro / Standard / Master / Turbo / 4k tiers and t2v / i2v / reference-to-video / first-last-frame modalities). Covers tier selection, the per-version wire-key inconsistencies (image_url vs start_image_url vs image_urls / elements), multi-shot via multi_prompt, native-audio defaults, and example prompts. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: KLING_GUIDE }],
    }),
  );
}

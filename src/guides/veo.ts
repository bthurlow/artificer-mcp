import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const VEO_GUIDE = `# Veo Video Generation — Prompt Guide

## What this model is best for
Google Veo is the cinematic-tier video family with **native audio** (ambient + Foley + lip-synced dialogue) on every 3.x tier. Use Veo when you need talking-head dialogue without a separate TTS leg, when you want the highest fidelity per dollar at 720p/1080p, or when you need 4k output (Pro tier only). Veo 2 stays in the catalog for legacy continuity but Veo 3.x is the default for everything new.

Per family/tier orientation:
- **Veo 3.1 Pro** — top-tier 720p / 1080p / 4k, native audio, supports text-to-video, image-to-video, reference-to-video (multi-image style consistency), and first-last-frame.
- **Veo 3.1 Fast** — same modality matrix as Pro, faster wall time, lower cost. No 4k.
- **Veo 3.1 Lite** — cheapest 3.1 tier (~$0.05/sec at 720p with audio). t2v, i2v, FLF only. No reference-to-video. No 4k.
- **Veo 3** (Pro / Fast) — prior generation; t2v + i2v only. Use when you specifically want the v3 look or pinning matters.
- **Veo 2** — legacy text-to-video with extensive camera-control prompt vocabulary. No native audio, no i2v on this slug. Use only if a workflow already targets it.

## Picking a model

| Slug | Modality | Max duration | Max resolution | Audio | Cost (per second) | Best for |
|------|----------|--------------|----------------|-------|--------------------|----------|
| \`veo-3.1-t2v\` | t2v | 8s | 4k | Native | $0.20 (no audio) / $0.40 (audio) at 720p+1080p, $0.40 / $0.60 at 4k | Hero shots, cinematic dialogue at full quality |
| \`veo-3.1-fast-t2v\` | t2v | 8s | 1080p | Native | See fal.ai listing for current per-second rates | Fast iteration on 3.1 prompts |
| \`veo-3.1-lite-t2v\` | t2v | 8s | 1080p | Native | $0.03/s 720p no-audio, $0.05/s 720p audio, $0.05/s 1080p no-audio, $0.08/s 1080p audio | Default for social-content drafts |
| \`veo-3.1-i2v\` | i2v | 8s | 4k | Native | Same as 3.1 t2v | First-frame-anchored cinematic clips |
| \`veo-3.1-fast-i2v\` | i2v | 8s | 1080p | Native | Faster tier of 3.1 i2v | Fast iteration on i2v |
| \`veo-3.1-lite-i2v\` | i2v | 8s | 1080p | Native | Lite-tier rates | Cheapest i2v with audio |
| \`veo-3.1-ref-to-video\` | reference (multi-image) | 8s | 4k | Native | Same as 3.1 t2v | Style/character consistency from 1-3 reference images |
| \`veo-3.1-flf\` | first-last-frame | 8s | 4k | Native | Same as 3.1 t2v | Controlled motion between two anchored frames |
| \`veo-3.1-fast-flf\` | first-last-frame | 8s | 1080p | Native | Faster tier | Faster FLF |
| \`veo-3.1-lite-flf\` | first-last-frame | 8s | 1080p | Native | Lite-tier rates | Cheapest FLF |
| \`veo-3-t2v\` | t2v | 8s | 1080p | Native | See fal.ai listing | Pin to v3 look |
| \`veo-3-fast-t2v\` | t2v | 8s | 1080p | Native | $0.10/s no-audio, $0.15/s audio | Fastest v3 t2v |
| \`veo-3-i2v\` | i2v | 8s | 1080p | Native | See fal.ai listing | v3 i2v pinning |
| \`veo-3-fast-i2v\` | i2v | 8s | 1080p | Native | See fal.ai listing | Fast v3 i2v |
| \`veo-2-t2v\` | t2v (legacy) | 8s | See fal.ai listing | None (silent) | $2.50 for 5s + $0.50/extra-second | Legacy continuity only |

Default picks:
- Talking-head social clip → **veo-3.1-lite-t2v** (cheapest 3.1 with audio + lip-sync) or **veo-3.1-lite-i2v** if you have a locked character still.
- Multi-aspect campaign with consistent character → **veo-3.1-ref-to-video** (Pro tier — Lite/Fast don't support reference).
- 4k hero shot → **veo-3.1-t2v** or **veo-3.1-i2v** at \`resolution: "4k"\`.
- Two anchored beats with motion in between → **veo-3.1-flf** (or Fast/Lite variant).

## Known strengths
- Native audio on Veo 3.x: ambient sound, Foley, music, AND lip-synced dialogue. No separate TTS leg required.
- Strong prompt adherence on cinematic camera vocabulary (dolly, pan, tilt, push, parallax, tracking).
- Excellent identity preservation with image-to-video when source aspect matches output aspect.
- Reference-to-video (Pro 3.1 only) holds character/style across multiple shots in a series.
- Veo 2 retains the most expressive camera-control language in the family.

## Known weaknesses / quirks
- **Source-image aspect must match output aspect** for image-to-video. A 1:1 source with \`aspect_ratio: "9:16"\` produces a landscape-composed shot awkwardly cropped vertical — the #1 i2v pitfall. Pre-generate the source at the target aspect.
- **Reference-to-video is Pro-only.** Veo 3.1 Lite and Fast return errors if you try to pass reference images. Use single-image i2v instead.
- **Veo 3.1 Lite caps resolution at 1080p**, no 4k. The schema enum reflects this.
- **\`generate_audio\`**: defaults to \`true\` on all 3.x. The Gemini Developer API rejects this field if passed; on fal it works — but most callers should leave it as default.
- **Duration enum**, not arbitrary integer. Veo 3.x accepts \`"4s" | "6s" | "8s"\`. Veo 2 accepts \`"5s" | "6s" | "7s" | "8s"\`. The artificer transport's \`duration_seconds\` is an integer; pass the integer and the transport stringifies — but if you want \`"6s"\` you pass \`6\`. Other values 4xx.
- **\`auto_fix\`** rewrites prompts that hit content-policy. Default \`true\` on most 3.x t2v, default \`false\` on i2v / FLF / ref. If you depend on exact prompt wording, pass \`auto_fix: false\` via \`extra_params\`.
- Complex physics (explosions, dense particle fields, fast crowd action) tends to artifact. Plan multi-shot stories as 4-8s segments and concatenate.

## Input requirements

The artificer transport (\`fal_generate_video\`) maps the structural arg \`image\` to the wire key \`image_url\`. Anything else (reference arrays, first/last frames, end-image hints) must go through \`extra_params\` with the exact wire key. The Veo family uses **different wire keys per modality** — this is the LLM trap section.

| Variant | Required wire keys | Optional via \`extra_params\` | Notes |
|---------|--------------------|------------------------------|-------|
| Veo 3.1 t2v / Fast / Lite | \`prompt\` | \`generate_audio\`, \`auto_fix\`, \`safety_tolerance\`, \`seed\` | Pass \`prompt\` only; transport handles the rest. |
| Veo 3.1 i2v / Fast / Lite | \`prompt\`, \`image_url\` | same as t2v | Transport \`image\` arg → \`image_url\`. Source must be 720p+ in 16:9 or 9:16. |
| Veo 3.1 ref-to-video | \`prompt\`, \`image_urls\` (array) | Same as t2v + \`safety_tolerance\` | **Wire key is \`image_urls\` (plural array).** Transport \`image\` arg only sends one URL into \`image_url\` — pass the array via \`extra_params: { image_urls: [url1, url2, url3] }\` and **omit the structural \`image\` arg**. |
| Veo 3.1 FLF / Fast-FLF / Lite-FLF | \`prompt\`, \`first_frame_url\`, \`last_frame_url\` | Same as t2v | **Wire keys are \`first_frame_url\` and \`last_frame_url\`** (NOT \`first_image_url\` / \`last_image_url\`). Pass both via \`extra_params\`. **Omit the structural \`image\` arg** so the transport doesn't also set \`image_url\`. |
| Veo 3 t2v / Fast | \`prompt\` | \`generate_audio\`, \`auto_fix\`, \`safety_tolerance\`, \`seed\` | Resolution caps at 1080p. |
| Veo 3 i2v / Fast | \`prompt\`, \`image_url\` | same as t2v | Transport \`image\` → \`image_url\`. |
| Veo 2 t2v | \`prompt\` | \`enhance_prompt\`, \`auto_fix\`, \`seed\` | Aspect ratios include 1:1 in addition to 16:9 / 9:16. No native audio. |

Common knobs:
- \`aspect_ratio\` — 3.x accepts \`"16:9"\`, \`"9:16"\`, plus \`"auto"\` on i2v / FLF / ref. Veo 2 also accepts \`"1:1"\`.
- \`resolution\` — Pro accepts \`"720p"\`, \`"1080p"\`, \`"4k"\`. Fast and Lite cap at \`"1080p"\`.
- \`duration\` — \`"4s" | "6s" | "8s"\` on 3.x, \`"5s" | "6s" | "7s" | "8s"\` on Veo 2.
- \`negative_prompt\` — supported on most slugs; ref-to-video schema does NOT list it.

## Prompt structure

Veo prompts are sentence-level cinematography. The reliable pattern is:

\`[Camera movement] of [subject] [action] in [setting], [visual style], [lighting], [mood]\`

For dialogue (3.x only):
1. **Quote the exact line** the character speaks.
2. Put the speaker + speech verb (\`says\`, \`exclaims\`, \`whispers\`) BEFORE the quoted dialogue.
3. Keep dialogue to ~1 sentence per 8-second clip. Rushed delivery breaks lip-sync.
4. Describe tone/emotion in the same clause: "says in a frustrated tone", "whispers warmly".
5. No multi-character conversations in a single clip — one speaker per clip.
6. For talking-head identity consistency, combine with image-to-video (anchor the face on the first frame).

For image-to-video, focus the prompt on **motion and camera**, not scene description — the source image already provides setting and subject. Works best with: gentle zoom, parallax, slow push, slow pan.

For reference-to-video, describe the action and reference the elements in the prompt naturally; the model uses the image_urls for style/character anchoring without needing prompt tags.

For first-last-frame, describe the transition / motion between the two anchored frames. The model inferpolates camera and subject motion to bridge them.

## Example prompts

**T2V cinematic establishing:**
> "Slow aerial drone descent over a coastal town at golden hour, Mediterranean architecture with white buildings and blue roofs, warm cinematic lighting, 35mm film grain"

**T2V dialogue with native audio:**
> "Medium close-up of a baker in a warm sunlit kitchen. She looks at the camera and says in a frustrated tone, \\"If one more person tells you to just double your ingredient cost, walk out.\\" Soft morning window light, calm steady frame."

**I2V (image anchors character):**
> "Gentle parallax push-in with subtle warmth shift; she breathes in, then exhales softly, ambient kitchen sound."
>
> Pair with a 9:16 character still pre-rendered with nano-banana at the matching aspect.

**FLF (first-last-frame):**
> "Smooth tracking motion from the first frame to the last; the subject turns toward camera, light shifts from cool morning to warm midday."
>
> Pair with two stills via \`extra_params: { first_frame_url, last_frame_url }\`.

**Reference-to-video (multi-image style):**
> "The chef plates the dish under warm restaurant lighting, then looks up and smiles."
>
> Pair with three reference images of the chef + the kitchen via \`extra_params: { image_urls: [url1, url2, url3] }\`. Do NOT pass a structural \`image\` arg.

## Access routes

| Slug | fal endpoint id |
|------|-----------------|
| \`veo-3.1-t2v\` | \`fal-ai/veo3.1\` |
| \`veo-3.1-fast-t2v\` | \`fal-ai/veo3.1/fast\` |
| \`veo-3.1-lite-t2v\` | \`fal-ai/veo3.1/lite\` (also has google route \`veo-3.1-lite-generate-preview\` via \`gemini_generate_video\`) |
| \`veo-3.1-i2v\` | \`fal-ai/veo3.1/image-to-video\` |
| \`veo-3.1-fast-i2v\` | \`fal-ai/veo3.1/fast/image-to-video\` |
| \`veo-3.1-lite-i2v\` | \`fal-ai/veo3.1/lite/image-to-video\` |
| \`veo-3.1-ref-to-video\` | \`fal-ai/veo3.1/reference-to-video\` |
| \`veo-3.1-flf\` | \`fal-ai/veo3.1/first-last-frame-to-video\` |
| \`veo-3.1-fast-flf\` | \`fal-ai/veo3.1/fast/first-last-frame-to-video\` |
| \`veo-3.1-lite-flf\` | \`fal-ai/veo3.1/lite/first-last-frame-to-video\` |
| \`veo-3-t2v\` | \`fal-ai/veo3\` |
| \`veo-3-fast-t2v\` | \`fal-ai/veo3/fast\` |
| \`veo-3-i2v\` | \`fal-ai/veo3/image-to-video\` |
| \`veo-3-fast-i2v\` | \`fal-ai/veo3/fast/image-to-video\` |
| \`veo-2-t2v\` | \`fal-ai/veo2\` |

All fal slugs route through \`fal_generate_video\` with \`FAL_KEY\`. The Lite t2v slug also has a Google route via \`gemini_generate_video\` (model id \`veo-3.1-lite-generate-preview\`) for callers who already have GOOGLE_API_KEY plumbing.

## Last verified
2026-04-28 — initial seed of full fal video catalog. Pricing and input schemas grounded in committed fal-specs (veo-3.1, veo-3.1-t2v, veo-3.1-flf, veo-3.1-ref-to-video, veo-3.1-lite-t2v, veo-3-fast-t2v, veo-2-t2v). Some Fast-tier per-second prices are not currently in synced specs and reference the live fal.ai listing.

## Official references
- Veo 3.1 (i2v): https://fal.ai/models/fal-ai/veo3.1
- Veo 3.1 (t2v): https://fal.ai/models/fal-ai/veo3.1/api
- Veo 3.1 reference-to-video: https://fal.ai/models/fal-ai/veo3.1/reference-to-video
- Veo 3.1 first-last-frame: https://fal.ai/models/fal-ai/veo3.1/first-last-frame-to-video
- Veo 3.1 Lite: https://fal.ai/models/fal-ai/veo3.1/lite
- Veo 3 Fast: https://fal.ai/models/fal-ai/veo3/fast
- Veo 2: https://fal.ai/models/fal-ai/veo2
- Google upstream: https://ai.google.dev/gemini-api/docs/veo
- Audio + dialogue: https://ai.google.dev/gemini-api/docs/video#audio-generation
`;

export function registerVeoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'veo_video_prompt_guide',
    'Reference guide for the Veo video family on fal (Veo 3.1 Pro/Fast/Lite across t2v/i2v/reference-to-video/first-last-frame, Veo 3 Pro/Fast t2v+i2v, Veo 2 legacy t2v). Covers tier selection, native-audio dialogue patterns, the per-modality wire-key quirks (image_urls array for ref, first_frame_url+last_frame_url for FLF), input requirements, and example prompts. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: VEO_GUIDE }],
    }),
  );
}

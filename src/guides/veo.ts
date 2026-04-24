import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const VIDEO_GUIDE = `# Veo Video Generation — Prompt Guide

## Overview
Google Veo generates short videos (4-8 seconds) from text prompts or text + image. Veo 3.x generates **native audio** including ambient sound, Foley, and **lip-synced dialogue** — so talking-head content is fully achievable without external TTS. Best for: establishing shots, product demos, ambient scenes, short-form social content, and talking heads when combined with image-to-video for character consistency.

## Prompt Template
\`[Camera movement] of [subject] [doing action] in [setting], [visual style], [lighting], [mood]\`

## Good Examples

**Establishing shot:**
> "Slow aerial drone shot of a coastal town at golden hour, Mediterranean architecture with white buildings and blue roofs, warm cinematic lighting, 4K film quality"

**Product demo:**
> "Smooth tracking shot of a pour-over coffee brewing process, steam rising from the cup, close-up macro detail, warm morning light, minimalist kitchen background"

**Social content (image-to-video):**
> "Gentle zoom in with subtle parallax movement, soft natural lighting, cozy atmosphere" (with an input image of a bakery scene)

## Bad Examples

> "A person says a lot of stuff about pricing and then laughs and then says more stuff" — Too long and unquoted. Quote the exact line and keep it to one sentence per clip. See "Native Audio + Dialogue" below.

> "Fast action sequence with explosions" — Complex physics and rapid motion tend to produce artifacts.

> "A 30-second commercial" — Veo generates 4 or 8-second clips. Plan your story in short segments and use video_concatenate or video_add_transitions to join them.

## Image-to-Video Tips

Providing an input image dramatically improves consistency:
1. Generate or prepare a high-quality still frame
2. Pass it as the \`image\` parameter
3. Keep the prompt focused on MOTION and CAMERA, not scene description (the image provides that)
4. Works best with: zoom, pan, parallax, gentle camera movements

**Critical: source image aspect ratio MUST match target video aspect ratio.**

Veo honors the \`aspect_ratio\` you request for the output container, but it composes the scene based on the source image's aspect. If you pass a 1:1 source with \`aspect_ratio: "9:16"\`, the result looks like a landscape-composed shot awkwardly cropped vertically — subjects centered, framing wrong. This is the #1 pitfall in image-to-video workflows.

**Rule:** pre-generate the source image at the exact target aspect with nano-banana before calling Veo.

| Target video aspect | Pre-generate source image at |
|---|---|
| 9:16 (TikTok/Reels/Stories) | 9:16 |
| 16:9 (YouTube/LinkedIn) | 16:9 |
| 1:1 (IG feed legacy) | 1:1 |
| 4:5 (IG feed preferred) | 4:5 |

If you need the same character/scene in multiple aspects, generate the reference multiple times — once per aspect — rather than cropping.

## Native Audio + Dialogue (Veo 3.x)

Veo 3 generates audio automatically — ambient sound, Foley, music, AND lip-synced dialogue. You do NOT need a separate TTS pipeline for talking-head content.

**Dialogue pattern** — quote the exact line the character should speak in the prompt:
\`\`\`
A woman says, "If one more person tells you to just double your ingredient cost..."
\`\`\`

Other working patterns:
- \`The baker looks at the camera and says, "That's not a pricing method."\`
- \`She says in a frustrated tone, "This is why you're broke."\`
- \`He whispers, "They don't tell you this part."\`

**Rules for reliable lip-sync:**
1. Put the speaker + speech verb (\`says\`, \`exclaims\`, \`whispers\`) **before** the quoted dialogue.
2. Keep each line short — ~1 sentence per 8-sec clip. Rushed delivery breaks lip-sync.
3. Describe tone/emotion in the same clause ("says in a frustrated tone", "says warmly").
4. No multi-character conversations in a single clip.
5. Combine with image-to-video for character identity consistency.

**Do NOT pass \`generate_audio: true\`** — Gemini Developer API rejects this field. Audio generates automatically on Veo 3.x; the flag is Vertex-only.

## Workflow: Talking-Head Video (100% AI with synced dialogue)

Veo 3 + nano-banana closes the loop — no real footage required:

1. Generate the speaker as a still with nano-banana using locked character references (consistent face/outfit).
2. Feed the still into \`gemini_generate_video\` as the \`image\` param (image-to-video) with a prompt using the dialogue pattern above. The still anchors the first frame so the face stays consistent.
3. Repeat per dialogue beat — 4s or 8s clips.
4. Stitch with \`video_concatenate\` or \`video_add_transitions\`.
5. Optionally layer \`video_add_subtitles\` for sound-off accessibility.
6. \`audio_normalize\` at the end for consistent loudness across clips.

## Gemini Developer API quirks (empirically validated)

- **\`generate_audio\`**: rejected. Omit — audio generates by default on Veo 3.x.
- **\`negative_prompt\`**: not supported on Veo 3.x Lite. Drop it if using Lite.
- **\`duration_seconds\`**: only \`4\` and \`8\` are accepted with image-to-video on most 3.x models. Other values may 400.
- **\`reference_images\` config** (multi-reference): Veo 3.1 **Standard only**. Lite and Fast return 400 — use single \`image\` param (image-to-video) instead.
- **Files API download URIs** (\`generativelanguage.googleapis.com/v1beta/files/...\`): require \`x-goog-api-key\` header. \`gemini_generate_video\` handles this automatically.

## Model tier guidance

| Tier | Model ID | Cost | When to use |
|---|---|---|---|
| Lite | \`veo-3.1-lite-generate-preview\` | ~$0.05/sec | Default. Indistinguishable from Standard for most social content. |
| Fast | \`veo-3.1-fast-generate-preview\` | ~$0.10/sec | Faster iteration during drafting. |
| Standard | \`veo-3.1-generate-preview\` | ~$0.40/sec | Multi-reference composition; critical hero shots. |

Override the default via \`ARTIFICER_VEO_MODEL\` env var.

## Misc

- **Aspect ratios**: 16:9 (landscape) or 9:16 (portrait). Choose based on platform.
- **Polling**: Video generation typically takes 60-180 seconds. Default poll timeout is 5 minutes.

## Access routes

| Provider | Tool                     | Model ID                       | Cost                              | Notes |
|----------|--------------------------|--------------------------------|-----------------------------------|-------|
| google   | \`gemini_generate_video\`  | \`veo-3.1-lite-generate-preview\` (default) / \`veo-3.1-generate-preview\` / \`veo-3.1-fast-generate-preview\` | See Google Cloud pricing          | Exposes \`generate_audio\` (rejected by Developer API — omit), \`person_generation\`, \`seed\`, \`negative_prompt\` (not on Lite), \`reference_images\` (Standard only). Uses Google's long-running operations API with polling. |
| fal      | \`fal_generate_video\`     | \`fal-ai/veo3.1/image-to-video\` | Per-second pricing; see fal model page | Same Veo model hosted through fal's queue. Per-second billing instead of Google's per-video. Stub — fal route entry lands with Phase 4+ once a caller need emerges and a parity smoke has run. |

The prompt *language* is identical across routes — Veo's dialogue patterns, camera directives, and image-to-video rules apply regardless of which tool you call. Per-route differences are request-shape only (which config knobs each provider surfaces).

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — prompt structure and Gemini Developer API quirks validated through shipping use; fal-route notes are stubbed pending a parity smoke (tracked in docs/plans/fal-multi-provider-design-2026-04-23.md, Phase 2 step 2).

## Official References
- Veo API: https://ai.google.dev/gemini-api/docs/veo
- Model cards: https://ai.google.dev/gemini-api/docs/models/veo
- Audio + dialogue: https://ai.google.dev/gemini-api/docs/video#audio-generation
`;

export function registerVeoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'veo_video_prompt_guide',
    'Get structured prompt guidance for Veo video generation. Returns best practices, templates, good/bad examples, image-to-video tips, and workflow patterns. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: VIDEO_GUIDE }],
    }),
  );
}

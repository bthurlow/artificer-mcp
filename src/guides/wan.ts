import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const WAN_GUIDE = `# Wan 2.7 (Image-to-Video) Prompt Guide

## What this model is best for
Audio-driven talking-head generation where cost and wall time matter. Wan 2.7 is artificer's default talking-head model after the Q2 bake-off (2026-04-23 to 2026-04-24). Rubric-parity with Kling AI Avatar v2 Pro on lip-sync, character consistency, and silence preservation, with ~25× faster warm wall time and ~13% lower cost per second.

## Known strengths
- Lip-sync accuracy on audio-driven mode
- Character consistency frame-to-frame on a single-image anchor
- Silence preservation: closed-mouth rendering for silent audio segments (when \`duration\` covers the tail)
- Fast warm-runner wall time (~8s for 7s output)
- Consistently unbilled on server-side 504 generation_timeout errors (fal's documented policy — empirically confirmed)

## Known weaknesses / quirks

**THREE LANDMINES — READ BEFORE CALLING:**

1. **\`resolution: "720p"\` is MANDATORY for audio-driven mode.**
   The fal-hosted runner cannot complete 1080p audio-driven inference within fal's generation budget. Observed failure: \`generation_timeout\` after 2723s of inference on the default 1080p. The schema ALLOWS "1080p" as a value; it just does not finish. Always pass \`resolution: "720p"\` explicitly when using \`audio\`.

2. **\`duration\` must be an INTEGER and caps output length.**
   Wan does NOT auto-match output duration to audio length. If you pass \`duration: 5\` with 6.76s of audio, the last 1.76s of audio is truncated from the output — including any silence tail. Pass \`Math.ceil(audio_seconds)\` (plus a small margin if you want tail silence preserved).
   - Observed failure: \`duration: "5"\` (string) returns 422 \`literal_error\`. Artificer's schema rejects this at validation time, but if you bypass via \`extra_params\` it will still fail.

3. **Wall time varies 8× between cold and warm runners.**
   First run on an idle GPU pool: ~63s. Subsequent runs on a warm pool: ~8s. Production pipelines should budget for the cold-start case. Set \`poll_timeout_seconds\` to at least 120 for cold starts.

## Input requirements

Sourced from \`src/catalog/fal-specs/wan-2.7/openapi.json\` + \`llms.md\` (committed by \`scripts/sync-fal-specs.mjs\`):

- **image** (optional) — first frame reference. JPEG/JPG/PNG/BMP/WEBP. Max 20 MB.
- **audio** (optional) — WAV or MP3. Duration 2-30s. Max 15 MB. Required for lip-sync mode.
- **prompt** (optional) — max 5000 chars. Can be empty string when image + audio carry the full signal.
- **duration** — enum of integers {2,3,4,5,6,7,8,9,10,11,12,13,14,15}. Default 5.
- **resolution** — "720p" or "1080p". Default "1080p" (AVOID for audio-driven mode — see quirks).
- **negative_prompt** (optional) — max 500 chars.
- **seed** (optional) — 0 to 2,147,483,647 for reproducibility.
- Public HTTPS URLs pass through to fal (confirmed for \`storage.googleapis.com\`). \`gs://\`, \`s3://\`, and local paths are uploaded to fal storage automatically by \`fal_generate_video\`.

## Prompt structure

Prompts describe what happens in the video; the image anchors identity, the audio drives mouth movement. Keep it concrete:

- **Subject + action:** "A woman speaking directly to camera"
- **Setting / context:** "natural lighting, head and shoulders"
- **Shot stability:** "steady frame" or "slight natural breathing motion"
- Avoid specifying dialogue — the audio provides it. Describing mouth movement in the prompt competes with the audio-driven lip-sync.
- Avoid camera movement hints ("zoom in", "pan right") for talking-head — they destabilize identity preservation.

## Example prompts

**Talking head, clean brief:**
> "A woman speaking directly to camera, natural lighting, head and shoulders, steady frame."

Use when the image already communicates setting; let the audio do the work.

**With slight stylization:**
> "A baker speaking confidently to camera in a warm kitchen, soft morning window light, medium close-up, calm breathing, stable composition."

Use when you want the model to reinforce mood beyond the image's implicit tone.

**Image-to-video (no audio):**
> "Gentle parallax zoom on a coastal town at golden hour, subtle wind in the palms, cinematic film grain."

Use when you're generating a cinematic-style clip. Keep audio-driven prompts separate from cinematic ones — the model responds differently to each mode.

## Access routes

| Provider | Tool                 | Model ID                            | Cost                              | Notes |
|----------|----------------------|-------------------------------------|-----------------------------------|-------|
| fal      | \`fal_generate_video\` | \`fal-ai/wan/v2.7/image-to-video\`   | $0.10/sec (720p), $0.15/sec (1080p) | Pass \`resolution: "720p"\` + integer \`duration\` explicitly. See Known weaknesses. |

No Google route — Wan is fal-hosted only.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — prompt structure and quirks from the Q2 talking-head bake-off; cost parsed from fal's llms.txt on the same date.

## Official references
- Model page: https://fal.ai/models/fal-ai/wan/v2.7/image-to-video
- Input schema (committed): src/catalog/fal-specs/wan-2.7/openapi.json
- Bake-off results: docs/plans/fal-bakeoff-2026-04-23.md
`;

export function registerWanPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'wan_video_prompt_guide',
    'Get structured prompt guidance for Wan 2.7 image-to-video (fal-ai/wan/v2.7/image-to-video). Covers talking-head defaults, the three mandatory caller-side quirks (resolution=720p, integer duration, cold-vs-warm wall time), input requirements, and example prompts. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: WAN_GUIDE }],
    }),
  );
}

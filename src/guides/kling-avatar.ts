import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const KLING_AVATAR_GUIDE = `# Kling AI Avatar v2 Pro (Image-to-Video, Audio-Driven) Prompt Guide

## What this model is best for
Talking-head generation when native 1080p output is required or when auto-matched audio length is an ergonomic win. Artificer's high-resolution fallback for the talking-head class after the Q2 bake-off — rubric parity with Wan 2.7 at ~1.5× the pixel count, auto-matches output duration to audio (no \`duration\` param needed), at higher cost and ~24× slower wall time.

## Known strengths
- **Native 1080p output** (1072×1920 for 9:16). Highest-resolution talking-head option on fal.
- **Auto-matches output duration to audio length** — no duration coordination burden on the caller. Pass audio, get a video that covers it.
- Strong lip-sync and character consistency on single-image anchor.
- Silence preservation confirmed: closed-mouth rendering on tail silence.
- Vendor diversity — Kuaishou's Kling is independent of Alibaba's Wan, useful as a fallback when Wan has runner-side issues.

## Known weaknesses / quirks
- **Wall time ~191s** per 7s output. ~24× slower than Wan 2.7 on warm runners. Batch workloads compound this — 5 clips serial is ~16 minutes.
- **Cost per second ~13% higher than Wan** ($0.115/sec vs $0.10/sec at 720p). For high-volume pipelines, the delta adds up.
- **Output duration pads slightly** (+0.44s observed on 6.76s audio). If downstream processing assumes exact-length outputs, use veed/fabric-1.0 instead — it matches audio duration exactly.

## Input requirements

Sourced from \`src/catalog/fal-specs/kling-ai-avatar-v2-pro/llms.md\`:

- **image** — first frame / avatar reference. REQUIRED. The model animates this face to match the audio.
- **audio** — WAV or MP3. REQUIRED.
- **prompt** (optional) — default is \`"."\` if unset. The image + audio carry most of the signal; prompt adds subtle mood/context hints only.
- Public HTTPS URLs pass through to fal (confirmed for \`storage.googleapis.com\`). \`gs://\`, \`s3://\`, and local paths upload automatically.

No \`duration\`, \`resolution\`, or \`aspect_ratio\` parameters — Kling infers those from the audio and the image.

## Prompt structure

Because Kling auto-matches audio and resolution, the prompt is the thinnest knob available. Use it for:

- Minor mood/lighting hints: "warm morning light", "confident expression"
- Composition polish: "centered, medium close-up"
- Stability requests: "steady frame, minimal head movement"

Avoid:
- Dialogue text (the audio supplies it)
- Camera movement directions (destabilize identity)
- Contradicting the image (the image wins)

## Example prompts

**Default talking-head with minimal prompt (most common):**
> "A woman speaking directly to camera, natural lighting, head and shoulders, steady frame."

**Subtle mood reinforcement:**
> "A baker speaking warmly in a sunlit kitchen, gentle breathing, stable medium close-up."

**Bare minimum (effectively image + audio only):**
> "."

The default prompt of \`"."\` is a valid signal that you want the image and audio to carry the full weight.

## Access routes

| Provider | Tool                 | Model ID                                   | Cost             | Notes |
|----------|----------------------|--------------------------------------------|------------------|-------|
| fal      | \`fal_generate_video\` | \`fal-ai/kling-video/ai-avatar/v2/pro\`    | $0.115 per second | Auto-matches audio duration. Native 1080p. Slower wall time than Wan. |

No Google route — Kling is fal-hosted only.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — prompt structure and wall-time observations from the Q2 talking-head bake-off; cost parsed from fal's llms.txt on the same date.

## Official references
- Model page: https://fal.ai/models/fal-ai/kling-video/ai-avatar/v2/pro
- Input schema (committed): src/catalog/fal-specs/kling-ai-avatar-v2-pro/openapi.json
- Bake-off results: docs/plans/fal-bakeoff-2026-04-23.md
`;

export function registerKlingAvatarPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'kling_avatar_prompt_guide',
    'Get structured prompt guidance for Kling AI Avatar v2 Pro (fal-ai/kling-video/ai-avatar/v2/pro). Covers native 1080p talking-head generation, auto-match-audio behavior, input requirements, and example prompts. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: KLING_AVATAR_GUIDE }],
    }),
  );
}

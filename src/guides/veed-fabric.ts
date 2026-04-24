import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const VEED_FABRIC_GUIDE = `# veed/fabric-1.0 (Image-to-Video, Audio-Driven) Prompt Guide

## What this model is best for
Fast-preview and disaster-recovery talking-head generation. Cheapest and fastest of the three Phase 1 talking-head models — 480p by default, ~51s wall time for 7s output, exact audio-length matching. Use as a draft-quality check before spending on a Wan or Kling production run, or as a fallback when Wan and Kling routes are both unhealthy.

## Known strengths
- **Exact audio-length output** — 6.76s audio in produces 6.76s video out, no padding, no truncation. When downstream processing assumes exact-length, veed is the cleanest fit.
- **~51s wall time** (cold) for 7s output. Fastest cold-start of the three.
- **Cheapest**: $0.08/sec at 480p, $0.15/sec at 720p.
- **Independent vendor** (not Kuaishou/Kling, not Alibaba/Wan) — when a fal-side outage hits one vendor, the other two routes often stay up.

## Known weaknesses / quirks
- **Default is 480p.** Resolution is REQUIRED per the schema; pass \`resolution: "480p"\` explicitly for the fast-preview path, or \`"720p"\` when you need higher fidelity. No 1080p option.
- **480p is draft-quality.** Fine for internal previews and pipeline testing; upscaling this to 1080p for delivery is visible. Prefer Wan 2.7 or Kling for production 9:16 reels.
- Lip-sync is good at 480p but slightly softer than Wan/Kling at 720p. The fidelity floor kicks in visibly below 720p regardless of model.

## Input requirements

Sourced from \`src/catalog/fal-specs/veed-fabric-1.0/llms.md\`:

- **image** — REQUIRED. First frame / avatar reference.
- **audio** — REQUIRED. Format: WAV / MP3.
- **resolution** — REQUIRED. Enum \`"720p"\` or \`"480p"\`. Default path in artificer is \`"480p"\` for fast preview.
- No \`prompt\`, \`duration\`, or \`negative_prompt\` parameters on the input schema — veed matches audio duration and doesn't accept a prompt. If \`fal_generate_video\` is called with a \`prompt\`, fal will return 422; the model's OpenAPI is the source of truth here.
- Public HTTPS URLs pass through; \`gs://\` / \`s3://\` / local paths upload automatically.

## Prompt structure

veed/fabric-1.0 does not accept a \`prompt\` field. The image + audio + resolution are the entire input. This section exists for convention only — there is no prompt to structure.

If the caller needs prompt-driven control over the talking-head output, use Wan 2.7 (supports prompt) or Kling AI Avatar v2 Pro (accepts minimal prompt for mood hints).

## Example prompts

N/A — no prompt accepted. Usage example:

\`\`\`json
{
  "model": "veed/fabric-1.0",
  "image": "https://storage.googleapis.com/b/avatar.jpg",
  "audio": "https://storage.googleapis.com/b/tts.mp3",
  "resolution": "480p",
  "output": "out.mp4"
}
\`\`\`

## Access routes

| Provider | Tool                 | Model ID           | Cost                                 | Notes |
|----------|----------------------|--------------------|--------------------------------------|-------|
| fal      | \`fal_generate_video\` | \`veed/fabric-1.0\` | $0.08 per second (480p); $0.15 per second (720p) | REQUIRES \`resolution\`. Does not accept \`prompt\`. Matches audio length exactly. |

No Google route — veed is fal-hosted only.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — behavior and wall-time observations from the Q2 talking-head bake-off; cost parsed from fal's llms.txt on the same date.

## Official references
- Model page: https://fal.ai/models/veed/fabric-1.0
- Input schema (committed): src/catalog/fal-specs/veed-fabric-1.0/openapi.json
- Bake-off results: docs/plans/fal-bakeoff-2026-04-23.md
`;

export function registerVeedFabricPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'veed_fabric_prompt_guide',
    'Get structured prompt guidance for veed/fabric-1.0 (fal). Audio-driven talking head at 480p (fast preview) or 720p. Covers the resolution requirement, exact-audio-match behavior, lack of prompt parameter, and when to pick veed over Wan or Kling. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: VEED_FABRIC_GUIDE }],
    }),
  );
}

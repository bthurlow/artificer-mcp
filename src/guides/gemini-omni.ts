import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const OMNI_GUIDE = `# Gemini Omni Flash (video) — Prompt Guide

## What this model is best for
Google's conversational video model. Generates 3–10 second clips and — uniquely — lets you **edit a result by asking**, in a follow-up call that keeps the rest of the clip intact. Google positions it as the default video model going forward.

Reach for it when you want fast iteration on a shot ("same scene, relight it for dusk") rather than one-shot generation.

## ⚠️ Output is SILENT
Omni Flash generates video **without native audio**. Google's docs draw the contrast explicitly: Veo 3.1 is the model that produces video with native audio. Some launch coverage claimed Omni carries audio — it does not.

For a music-video pipeline laying a fixed master underneath, this is an advantage: nothing to strip.

## Capabilities and limits
| | |
|---|---|
| Duration | **3–10 seconds**. No native extend — concatenate with \`video_concatenate\` for longer pieces. |
| Resolution | **720p** |
| Frame rate | 24 fps |
| Aspect ratios | **16:9 and 9:16** (9:16 makes it viable for vertical short-form) |
| Audio | **None** |
| Cost | **~$0.10 per second** of output — same tier as Veo 3.1 Fast, which does include audio |

## Tasks
Set \`task\` explicitly, or omit it and let the model infer from the prompt and attached media:
- **\`text_to_video\`** — prompt only.
- **\`image_to_video\`** — pass \`image\`. Animates a still.
- **\`reference_to_video\`** — pass \`reference_images\`. Holds a subject or style consistent across shots.
- **\`edit\`** — pair with \`previous_interaction_id\` (see below).

## Conversational editing — the differentiator
Every call returns an \`interaction_id\`. Pass it back as \`previous_interaction_id\` and describe a change; the model edits that result rather than starting over.

\`\`\`json
{ "prompt": "A neon-lit alley at night, slow dolly forward", "output": "./shot1.mp4", "duration_seconds": 8 }
\`\`\`
→ returns \`interaction_id: "int_abc123"\`

\`\`\`json
{
  "prompt": "Same shot, but make it rain and add reflections on the pavement",
  "output": "./shot1-rain.mp4",
  "previous_interaction_id": "int_abc123",
  "task": "edit"
}
\`\`\`

This is stateful in a way Veo is not. Chain edits to converge on a look instead of re-rolling prompts.

## Prompt structure
Same anatomy that works for Veo: subject + action + setting + camera move + lighting + mood.

> "A lone figure in a long coat walks away down a rain-slicked alley, slow dolly forward, neon signage reflecting in puddles, cold blue key with warm amber practicals, moody and cinematic"

For **edits**, describe only the change and what to preserve — "same framing and character, change the time of day to dawn" — rather than restating the whole scene.

## Choosing between Omni, Veo, and MiniMax H3
| Need | Pick |
|---|---|
| Synchronized diegetic audio in the clip | **Veo 3.1** — Omni is silent |
| Iterative "tweak this shot" editing | **Omni Flash** — nothing else here is stateful |
| Above 720p, or 2K/4K | **MiniMax H3** (\`hailuo_prompt_guide\`) — Omni caps at 720p |
| Clips longer than 10s in one call | **MiniMax H3** (up to 15s) |
| Cheapest per second at vertical short-form | **MiniMax H3** at 480P/768P |
| Silent B-roll under a fixed music master | **H3 or Omni** — both silent; H3 wins on resolution, Omni on editability |

## Access routes
| Provider | Tool | Model ID | Cost | Notes |
|----------|------|----------|------|-------|
| google | \`gemini_omni_generate_video\` | \`gemini-omni-flash-preview\` | ~$0.10/second | Interactions API. Silent output. Override the model via \`ARTIFICER_OMNI_VIDEO_MODEL\`. |

Omni uses Google's **Interactions API**, not the \`generateVideos\` call Veo uses — which is why it is a separate tool rather than another model id on \`gemini_generate_video\`. Both work off \`GOOGLE_API_KEY\`; neither requires Vertex.

**Veo is not deprecated.** Google has published no sunset date. "Replaces Veo" is strategic direction, not an API removal — keep using Veo where audio or resolution matter.

## Last verified
2026-08-15 — capabilities, silent-output behavior, Interactions-API usage, and the ~$0.10/s rate verified against ai.google.dev. Duration/resolution ceilings are preview-era limits Google has said will lift; re-check before assuming 720p and 10s still bind.

## Official references
- Video generation: https://ai.google.dev/gemini-api/docs/video
- Models: https://ai.google.dev/gemini-api/docs/models
- Pricing: https://ai.google.dev/gemini-api/docs/pricing
`;

export function registerOmniVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_omni_video_prompt_guide',
    'Prompt guidance for Google Gemini Omni Flash video generation. Covers the four task modes (text/image/reference-to-video and edit), stateful conversational editing via previous_interaction_id, the 3-10s / 720p / 24fps / 16:9-9:16 limits, silent output (no native audio, unlike Veo 3.1), ~$0.10/s pricing, and when to pick Omni vs Veo vs MiniMax H3. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: OMNI_GUIDE }] }),
  );
}

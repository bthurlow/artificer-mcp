import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const OMNI_GUIDE = `# Gemini Omni Flash (video) — Prompt Guide

## What this model is best for
Google's conversational video model. Generates 3–10 second clips and — uniquely — lets you **edit a result by asking**, in a follow-up call that keeps the rest of the clip intact. Google positions it as the default video model going forward.

Reach for it when you want fast iteration on a shot ("same scene, relight it for dusk") rather than one-shot generation.

## Audio: generated natively, and you cannot turn it off
Omni Flash writes picture and soundtrack **in the same pass**. Google's docs are explicit: *"The model generates a video with audio based on your text description"* and *"By default the model will try to generate an appropriate audio track for a video."* Speech, music, and sound effects are all in scope.

**There is no flag to disable it.** No \`generate_audio\` parameter, no silent mode — audio is architectural, not optional. Your two levers are:

1. **Steer it in the prompt.** Describe the audio you want the same way you describe the picture: *"calm background music, distant traffic hum"*, *"the audio is a low tinny radio broadcast"*. Adding **"No dialogue"** suppresses speech specifically.
2. **Strip it downstream.** For a fixed-master pipeline, run the result through \`audio_extract_from_video\` / \`video_set_audio\` (or mute the track) before laying your own bed under it.

⚠️ **For the music-video pilot this means Omni is the higher-friction option.** Every clip arrives with a synthetic soundtrack that has to be removed before the Cathode Saint master goes underneath. MiniMax H3 on fal returns a bare video file with no audio track, so it needs no strip step — see \`hailuo_prompt_guide\`.

**Terminology trap in Google's own model card.** The Vertex page lists two rows that look contradictory:
- *Modalities → Audio: **Not supported*** — this is about the **message interface**: you cannot feed Omni an audio file, and you cannot ask it for an audio-only response.
- *Capabilities → Sound generation: Speech, music, sound effects — **Supported*** — this is the audio track **inside the generated video**.

Both are true at once. The technical-specs row settles it by listing *"Maximum video length (with audio)"* separately from *"(without audio)"* — a distinction that only exists because generated video carries sound. Note the first row does rule out **audio reference inputs**: you cannot condition a generation on a supplied audio clip.

## Capabilities and limits
| | |
|---|---|
| Duration | **3–10 seconds**. No native extend — concatenate with \`video_concatenate\` for longer pieces. |
| Resolution | **720p** |
| Frame rate | 24 fps |
| Aspect ratios | **16:9 and 9:16** (9:16 makes it viable for vertical short-form) |
| Audio | **Native, always on** — speech, music, and sound effects. No off switch. |
| Audio input | **Not supported** — no audio reference conditioning |
| Images per prompt | Up to **10** (720p, 16:9 or 9:16) |
| Provenance | SynthID watermark + Content Credentials (C2PA) |
| Cost | **~$0.10 per second** of output — same tier as Veo 3.1 Fast |

**Not supported on this model:** system instructions, structured output, context caching, function calling, grounding, code execution, tuning, or batch inference. Thinking and token counting are supported. Worth knowing before designing a prompt pipeline around it — a system-instruction-based house style will not apply here, so fold that guidance into the prompt itself.

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
| Synchronized diegetic audio in the clip | **Omni or Veo 3.1** — both generate native audio; Omni lets you then *revise* the shot conversationally |
| Iterative "tweak this shot" editing | **Omni Flash** — nothing else here is stateful |
| Above 720p, or 2K/4K | **MiniMax H3** (\`hailuo_prompt_guide\`) — Omni caps at 720p |
| Clips longer than 10s in one call | **MiniMax H3** (up to 15s) |
| Cheapest per second at vertical short-form | **MiniMax H3** at 480P/768P |
| **Silent** B-roll under a fixed music master | **MiniMax H3** — returns a bare video file. Omni always bakes in audio you would have to strip. |
| Conditioning on a supplied audio clip | **MiniMax H3 r2v** — Omni accepts no audio input |

## Access routes
| Provider | Tool | Model ID | Cost | Notes |
|----------|------|----------|------|-------|
| google | \`gemini_omni_generate_video\` | \`gemini-omni-flash-preview\` | ~$0.10/second | Interactions API. Native audio, always on. Override the model via \`ARTIFICER_OMNI_VIDEO_MODEL\`. |

Omni uses Google's **Interactions API**, not the \`generateVideos\` call Veo uses — which is why it is a separate tool rather than another model id on \`gemini_generate_video\`. Both work off \`GOOGLE_API_KEY\`; neither requires Vertex.

**Veo is not deprecated.** Google has published no sunset date. "Replaces Veo" is strategic direction, not an API removal — keep using Veo where audio or resolution matter.

## Last verified
2026-08-15 — **corrected**: an earlier revision of this guide claimed Omni output was silent. That was wrong. It came from reading \`ai.google.dev/gemini-api/docs/video\`, which is the **Veo** page, instead of \`/docs/omni\`. Native audio is confirmed against the Omni page and the Vertex model card. Capabilities, the unsupported-features list, Interactions-API usage, and the ~$0.10/s rate re-verified in the same pass. Duration/resolution ceilings are preview-era limits Google has said will lift; re-check before assuming 720p and 10s still bind.

## Official references
- **Omni video generation (the authoritative page for this model): https://ai.google.dev/gemini-api/docs/omni**
- Vertex model card: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/omni-flash-preview
- Models: https://ai.google.dev/gemini-api/docs/models
- Pricing: https://ai.google.dev/gemini-api/docs/pricing

Note \`ai.google.dev/gemini-api/docs/video\` covers **Veo**, not Omni. Reading it for Omni behavior is what produced the silent-output error above.
`;

export function registerOmniVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_omni_video_prompt_guide',
    'Prompt guidance for Google Gemini Omni Flash video generation. Covers the four task modes (text/image/reference-to-video and edit), stateful conversational editing via previous_interaction_id, the 3-10s / 720p / 24fps / 16:9-9:16 limits, native audio (speech/music/SFX, always on with no off switch — steer via prompt or strip downstream), unsupported features (no system instructions, no structured output, no audio input), ~$0.10/s pricing, and when to pick Omni vs Veo vs MiniMax H3. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: OMNI_GUIDE }] }),
  );
}

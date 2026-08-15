import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LYRIA2_GUIDE = `# Google Lyria 2 (via fal) Prompt Guide

## What this model is best for
Instrumental music generation from descriptive text prompts — ambient soundscapes, cinematic beds, genre-driven instrumental pieces. Google's Lyria 2 is stronger at coherent instrumental arrangements than at songs-with-vocals; pair with MiniMax Music 2.6 when vocals are needed.

Lyria 3 is also available via Google directly (\`gemini_generate_music\` — see \`gemini_lyria_prompt_guide\`). Lyria 2 via fal is the choice when you want the fal billing model (per-request) or can't use Google credentials for this workload.

## Known strengths
- **Coherent instrumental arrangements** — builds and resolutions feel musical rather than random.
- **\`negative_prompt\` support** — a dedicated field (most fal music models don't have this; they require prompt-engineered "Avoid: ..." tricks instead). Use it to exclude unwanted elements like vocals, tempo ranges, or specific instruments.
- **\`seed\` support** for deterministic generation — same prompt + same seed reliably reproduces.
- Descriptive prompts with atmosphere / environment language work especially well — Lyria understands soundscape descriptions in a way prompt-stack models like ElevenLabs Music don't.

## Known weaknesses / quirks
- **No vocals / lyrics.** Instrumental-only.
- **No duration control** exposed in the Lyria 2 fal schema — clip length is model-determined.
- **Negative prompt defaults to "low quality"** — leave it as-is unless you have something specific to exclude. Overriding to an empty string removes this safety hint.
- Less widely tested than Lyria 3 (Google) for production use. If you're already on the Google route for other tools, the Lyria 3 tools (\`gemini_generate_music\` / \`gemini_generate_music_live\`) may be more familiar.

## Input requirements
- **prompt** (required) — text description. Passes via the tool's structural \`prompt\` arg.
- **negative_prompt** (optional) — content to exclude. Default "low quality". Via \`extra_params\`.
- **seed** (optional) — integer for deterministic generation. Via \`extra_params\`.

Source: \`src/catalog/fal-specs/lyria-2/llms.md\`.

## Prompt structure
Lyria responds best to atmospheric / descriptive prose rather than keyword stacks. Write prompts as scene descriptions:

- **Setting / environment**: \`flowing river\`, \`distant mountain wind\`, \`late-night city\`
- **Instruments that carry the arrangement**: \`gentle piano melody\`, \`swelling strings\`, \`fingerpicked acoustic guitar\`
- **Emotional arc**: \`slowly unfolds\`, \`builds to a climax\`, \`remains contemplative throughout\`
- **Mood / texture adjectives**: \`melancholic\`, \`lush\`, \`sparse\`, \`cinematic\`

Lyria handles longer, more literary prompts gracefully. Don't feel compelled to keep it under 20 words like SFX models.

## Example prompts

**Ambient soundscape:**
\`\`\`json
{
  "model": "fal-ai/lyria2",
  "prompt": "A lush, ambient soundscape featuring the serene sounds of a flowing river, complemented by the distant chirping of birds, and a gentle, melancholic piano melody that slowly unfolds.",
  "output": "./ambient.mp3"
}
\`\`\`

**Cinematic build:**
\`\`\`json
{
  "model": "fal-ai/lyria2",
  "prompt": "A cinematic orchestral piece that starts with sparse piano and soft strings, gradually builds with brass and timpani, and culminates in a triumphant resolution.",
  "output": "./cinematic.mp3",
  "extra_params": { "negative_prompt": "vocals, slow tempo" }
}
\`\`\`

**Deterministic reproduction:**
\`\`\`json
{
  "model": "fal-ai/lyria2",
  "prompt": "Warm lo-fi beat with vinyl crackle, soft electric piano, and brushed drums.",
  "output": "./lofi.mp3",
  "extra_params": { "seed": 12345 }
}
\`\`\`

## Access routes

| Provider | Tool                   | Model ID         | Cost                    | Notes |
|----------|------------------------|------------------|-------------------------|-------|
| fal      | \`fal_generate_music\` | \`fal-ai/lyria2\`| $0.10 per 30 seconds    | Instrumental only. negative_prompt and seed supported natively. |

Google route: \`gemini_generate_music\` for Lyria 3 (batch) / \`gemini_generate_music_live\` for Lyria RealTime — see \`gemini_lyria_prompt_guide\`. The prompt language transfers between Lyria 2 and 3, but Lyria 3 Pro adds timeline-marker support and song structure that Lyria 2 does not.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/lyria-2/llms.md\`.

## Official references
- Model page: https://fal.ai/models/fal-ai/lyria2
- Google Lyria 2 upstream: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/lyria-music-generation
`;

export function registerLyria2PromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'lyria2_prompt_guide',
    'Prompt guidance for Google Lyria 2 via fal. Instrumental music generation with atmospheric/descriptive prompts, native negative_prompt support, seed-deterministic mode. Pair with MiniMax Music 2.6 when vocals are needed. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: LYRIA2_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const ELEVENLABS_SFX_GUIDE = `# ElevenLabs Sound Effects v2 Prompt Guide

## What this model is best for
Short, descriptive sound effects — impacts, ambient textures, Foley cues, transitions — 0.5 to 22 seconds. Cheap enough ($0.002/second) to iterate and pick favorites.

## Known strengths
- **Fast**: typical generation under 10 seconds wall time.
- **Cheapest SFX on fal** by a wide margin ($0.002/sec vs Cassette at $0.01/generation flat).
- **\`prompt_influence\` knob** lets you tune how literally the model follows the prompt (0.3 default; raise for strict adherence, lower for creative variation).
- **\`loop: true\`** produces seamless loops — critical for ambient beds and background textures in videos.
- Wide output format support (MP3 / PCM / Opus / μ-law / a-law) via \`output_format\` in extra_params.

## Known weaknesses / quirks
- **Max duration is 22 seconds.** Anything longer truncates. For longer ambient textures, use \`loop: true\` and repeat in post.
- **If you omit \`duration_seconds\` the model chooses.** Usually reasonable for effect-like sounds but unpredictable for ambients — set it explicitly for anything time-sensitive.
- **Tool-level \`prompt\` maps to fal's \`text\` field** — the tool's structural arg name differs from the underlying fal key. Both work via the tool; just know the mapping if you inspect the fal payload.
- Descriptive English prompts work best. Non-English descriptions sometimes produce less characteristic sounds.

## Input requirements
- **text** (required) — description of the sound. Best results: concrete nouns + concrete descriptors.
- **duration_seconds** (optional) — float 0.5–22. Pass via \`extra_params\`.
- **prompt_influence** (optional) — float 0–1. Default 0.3. Pass via \`extra_params\`.
- **loop** (optional, boolean) — default false. Pass via \`extra_params\`.
- **output_format** (optional) — codec_samplerate_bitrate. Default "mp3_44100_128".

Source: \`src/catalog/fal-specs/eleven-sfx-v2/llms.md\`.

Note on tool mapping: \`fal_generate_music\`'s structural \`prompt\` arg is what you pass — it's mapped to fal's \`text\` key transparently. If you bypass via \`extra_params.text\` you get the same result.

## Prompt structure
Lead with the object making the sound, then texture/material, then action verb, then environment if relevant:

- **Object + material**: \`glass shattering\`, \`metal spoon on cast iron pan\`
- **Action verb**: \`whooshing\`, \`crackling\`, \`tinkling\`
- **Texture adjectives**: \`sharp\`, \`low\`, \`muffled\`, \`metallic\`, \`organic\`
- **Environment (optional)**: \`in a large empty hall\`, \`outdoors in wind\`, \`indoors small room\`

Keep prompts under ~15 words. Long prompts don't help SFX the way they help music.

## Example prompts

**Transition whoosh for a reel (2s, loopable):**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/sound-effects/v2",
  "prompt": "quick whoosh of air, sharp fast transition, tight reverb tail",
  "output": "./whoosh.mp3",
  "extra_params": { "duration_seconds": 2, "prompt_influence": 0.5 }
}
\`\`\`

**Ambient kitchen loop (12s, loop on):**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/sound-effects/v2",
  "prompt": "warm home kitchen ambience, gentle oven hum, faint bird song through a window, subtle refrigerator drone",
  "output": "./kitchen.mp3",
  "extra_params": { "duration_seconds": 12, "loop": true }
}
\`\`\`

**Trailer braam impact:**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/sound-effects/v2",
  "prompt": "spacious braam, deep sub bass impact suitable for a high-impact movie trailer moment",
  "output": "./braam.mp3",
  "extra_params": { "duration_seconds": 3, "prompt_influence": 0.7 }
}
\`\`\`

## Access routes

| Provider | Tool                   | Model ID                                | Cost                 | Notes |
|----------|------------------------|-----------------------------------------|----------------------|-------|
| fal      | \`fal_generate_music\` | \`fal-ai/elevenlabs/sound-effects/v2\`  | $0.002 per second    | Max 22s. Use \`loop: true\` for ambient beds. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/eleven-sfx-v2/llms.md\`. Cost verified against llms.md Pricing block.

## Official references
- Model page: https://fal.ai/models/fal-ai/elevenlabs/sound-effects/v2
- ElevenLabs upstream SFX docs: https://elevenlabs.io/docs/api-reference/sound-generation
`;

export function registerElevenlabsSfxPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'elevenlabs_sfx_prompt_guide',
    'Prompt guidance for ElevenLabs Sound Effects v2 on fal. Short descriptive SFX up to 22s. Covers duration_seconds, prompt_influence, loop:true for ambient beds, output format choices, and prompt anatomy (object + material + action verb + environment). No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: ELEVENLABS_SFX_GUIDE }] }),
  );
}

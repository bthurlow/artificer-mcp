import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const CASSETTE_SFX_GUIDE = `# Cassette AI Sound Effects Generator Prompt Guide

## What this model is best for
Fast sound-effect generation with flat-per-call pricing. Use when you want predictable cost regardless of clip length, or when ElevenLabs SFX's 22-second cap isn't enough — Cassette goes up to 30 seconds.

## Known strengths
- **Flat $0.01 per generation** regardless of duration (vs ElevenLabs SFX's $0.002/second). At 5+ seconds Cassette becomes cheaper.
- **30-second max duration** (vs ElevenLabs SFX's 22-second cap) — slightly longer ambient beds possible in one call.
- **Very fast**: Cassette advertises sub-second processing for 30-second clips. Good for iterative SFX work.
- **Duration is REQUIRED** — no auto-length inference; you always know what you're going to get.

## Known weaknesses / quirks
- **\`duration\` is required and integer-only** (1-30 seconds). Fractional durations rejected. Pass via \`extra_params.duration\`.
- **No \`loop\` flag** unlike ElevenLabs SFX — for ambient beds needing seamless loops, Eleven SFX is the cleaner pick.
- **No \`prompt_influence\` or guidance knob** — prompt adherence is whatever the model decides. Cassette is less tunable than Stable Audio or ElevenLabs SFX.
- **Advertised as "professional consistency with no breaks, no squeaks"** — in practice this holds for simple one-shot SFX but complex layered textures can still produce artifacts.

## Input requirements
- **prompt** (required) — short text description. Passes via the tool's structural \`prompt\` arg.
- **duration** (required) — integer 1-30 (seconds). Passes via \`extra_params.duration\`.

Source: \`src/catalog/fal-specs/cassette-sfx/llms.md\`.

## Prompt structure
Short concrete descriptions work best, same pattern as other SFX models:

- **Object + action**: \`dog barking\`, \`car engine starting\`, \`window breaking\`
- **Context / environment**: \`in the rain\`, \`inside a large hall\`, \`outdoors distant\`
- **Texture adjectives** (sparingly): \`loud\`, \`muffled\`, \`sharp\`, \`distant\`

Keep it under ~10 words. Cassette is less prompt-reactive than Stable Audio or ElevenLabs SFX — more detail doesn't always improve output.

## Example prompts

**Classic SFX (30s, full-length):**
\`\`\`json
{
  "model": "cassetteai/sound-effects-generator",
  "prompt": "dog barking in the rain",
  "output": "./dog-rain.mp3",
  "extra_params": { "duration": 30 }
}
\`\`\`

**Short impact (2s):**
\`\`\`json
{
  "model": "cassetteai/sound-effects-generator",
  "prompt": "glass shattering on tile floor",
  "output": "./glass.mp3",
  "extra_params": { "duration": 2 }
}
\`\`\`

**Ambient bed (30s, distant):**
\`\`\`json
{
  "model": "cassetteai/sound-effects-generator",
  "prompt": "distant thunderstorm with occasional rumbles and light rain",
  "output": "./storm.mp3",
  "extra_params": { "duration": 30 }
}
\`\`\`

## When to use Cassette vs ElevenLabs SFX v2

| Scenario | Pick |
|----------|------|
| Clip is 5+ seconds and cost matters | Cassette ($0.01 flat vs Eleven's $0.01+ at 5s) |
| Need loopable ambient bed | ElevenLabs (has \`loop: true\`) |
| Need 22+ second duration | Cassette (30s max) |
| Need tunable prompt adherence | ElevenLabs (has \`prompt_influence\`) |
| Fast draft iteration | Cassette (sub-second processing) |
| Production-critical quality | ElevenLabs (more tunable) |

## Access routes

| Provider | Tool                   | Model ID                              | Cost                 | Notes |
|----------|------------------------|---------------------------------------|----------------------|-------|
| fal      | \`fal_generate_music\` | \`cassetteai/sound-effects-generator\` | $0.01 per generation | Duration (1-30s, integer) is required. No loop flag. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/cassette-sfx/llms.md\`.

## Official references
- Model page: https://fal.ai/models/cassetteai/sound-effects-generator
`;

export function registerCassetteSfxPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'cassette_sfx_prompt_guide',
    'Prompt guidance for Cassette AI Sound Effects Generator on fal. Flat $0.01 per generation (1-30s). Fast processing. Duration is required. Includes a Cassette-vs-ElevenLabs-SFX comparison table for sub-class decisions. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: CASSETTE_SFX_GUIDE }] }),
  );
}

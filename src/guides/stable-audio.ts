import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const STABLE_AUDIO_GUIDE = `# Stable Audio 2.5 (StabilityAI, via fal) Prompt Guide

## What this model is best for
High-quality music and sound effect generation from text, with diffusion-style controls (inference steps, guidance scale, seed). Stronger than Cassette SFX on complex textures; more tunable than ElevenLabs Music. Best pick when you want knob-level control over prompt adherence and quality / speed trade-offs.

## Known strengths
- **Long duration**: up to 190 seconds (~3 minutes) in a single generation — longer than most fal music models. Good for full-length background beds.
- **\`guidance_scale\`** (1-25, default 1) tunes how strictly the diffusion process follows the prompt. Higher = more literal; lower = more creative.
- **\`num_inference_steps\`** (4-8, default 8) trades speed for quality. 4 is noticeably faster; 8 produces the cleanest output.
- **\`seed\`** for deterministic generation.
- Covers music, sound effects, and mixed audio textures equally well — not locked to a specific style bucket.

## Known weaknesses / quirks
- **No vocals / lyrics support.** Stable Audio is instrumental / ambient / SFX-focused.
- **Default \`seconds_total\` is 190** — that's max duration, NOT a reasonable default for most use cases. Explicitly set a shorter value unless you actually want a 3-minute clip (and the associated cost).
- **\`guidance_scale\` behavior inverts common intuition**: higher value = closer to prompt. If outputs feel off, try 10-15 rather than staying at the default 1.
- **Billed per audio output** not per duration — a 190s clip costs the same as a 5s clip ($0.20 flat). Generate at full duration when cost is the same regardless.

## Input requirements
- **prompt** (required) — text description. Passes via the tool's structural \`prompt\` arg.
- **seconds_total** (optional) — integer 1-190. Default 190. Via \`extra_params\`.
- **num_inference_steps** (optional) — integer 4-8. Default 8. Via \`extra_params\`.
- **guidance_scale** (optional) — float 1-25. Default 1. Via \`extra_params\`.
- **seed** (optional) — integer. Via \`extra_params\`.
- **sync_mode** (optional, boolean) — default false. When true, returns data URI directly (bypasses artificer's download flow). Leave false for normal operation.

Source: \`src/catalog/fal-specs/stable-audio-2.5/llms.md\`.

## Prompt structure
Stable Audio handles both descriptive prose and keyword stacks. For music, use prose. For SFX, use short concrete keywords.

**Music (prose style):**
- Setting / arc: \`piano arpeggio grows into a grand orchestral climax\`
- Atmosphere: \`tense\`, \`hopeful\`, \`melancholic\`, \`driving\`
- Instrumentation: \`strings\`, \`brass\`, \`synthesizer lead\`, \`percussion\`

**SFX (keyword style):**
- Object + action: \`glass shattering\`, \`engine revving\`, \`thunder rumbling\`
- Texture: \`sharp\`, \`low\`, \`metallic\`, \`wet\`
- Duration hint (optional): \`quick\`, \`sustained\`, \`fading\`

## Example prompts

**Orchestral piece (full 30s):**
\`\`\`json
{
  "model": "fal-ai/stable-audio-25/text-to-audio",
  "prompt": "A beautiful piano arpeggio grows into a grand orchestral climax with sweeping strings and triumphant brass.",
  "output": "./orchestral.mp3",
  "extra_params": { "seconds_total": 30, "guidance_scale": 7, "num_inference_steps": 8 }
}
\`\`\`

**Quick sound effect (2s, strict prompt adherence):**
\`\`\`json
{
  "model": "fal-ai/stable-audio-25/text-to-audio",
  "prompt": "Sharp metallic impact with short reverb tail, low-end emphasis.",
  "output": "./impact.mp3",
  "extra_params": { "seconds_total": 2, "guidance_scale": 15, "num_inference_steps": 8 }
}
\`\`\`

**Fast draft pass (low steps, looser adherence):**
\`\`\`json
{
  "model": "fal-ai/stable-audio-25/text-to-audio",
  "prompt": "Warm electronic ambient bed, slow pads, soft pulse.",
  "output": "./draft.mp3",
  "extra_params": { "seconds_total": 10, "num_inference_steps": 4 }
}
\`\`\`

## Access routes

| Provider | Tool                   | Model ID                               | Cost              | Notes |
|----------|------------------------|----------------------------------------|-------------------|-------|
| fal      | \`fal_generate_music\` | \`fal-ai/stable-audio-25/text-to-audio\`| $0.20 per audio   | Flat per-output pricing — generate full-length clips when cost is the same regardless. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/stable-audio-2.5/llms.md\`. Parameter ranges validated.

## Official references
- Model page: https://fal.ai/models/fal-ai/stable-audio-25/text-to-audio
- Stability AI upstream: https://stability.ai/stable-audio
`;

export function registerStableAudioPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'stable_audio_prompt_guide',
    'Prompt guidance for Stable Audio 2.5 (StabilityAI) on fal. Music + SFX up to 190s with diffusion controls (guidance_scale, num_inference_steps, seed). Best for tunable quality / speed trade-offs. No vocals. Flat per-audio pricing — generate full duration when cost is equivalent. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: STABLE_AUDIO_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const ELEVENLABS_MUSIC_GUIDE = `# ElevenLabs Music (fal-hosted) Prompt Guide

## What this model is best for
Full music track generation from a text description — genre, mood, instrumentation, tempo — with the option to structure sections through a \`composition_plan\` or let the model decide length and arrangement. Solid default for music beds, intro stingers, and short-form social content.

## Known strengths
- **Composition-plan support** — rather than giving one prose prompt, you can pass a structured plan with sections + durations for precise tracks.
- **music_length_ms** controls clip length from 3000ms to 600000ms (3 seconds up to 10 minutes) in prompt mode.
- Wide format coverage for output: MP3 (22kHz / 44.1kHz, 32 / 64 / 96 / 128 / 192 kbps), PCM (8-48kHz), Opus, μ-law, a-law. Switch via \`output_format\` in extra_params.
- Billing is per output audio minute, rounded up — short clips are cost-effective for iterative drafting.

## Known weaknesses / quirks
- **Uses \`music_length_ms\`, not \`duration_seconds\`.** Pass via \`extra_params\` — the tool-level structural args do not include a duration field.
- **Billing rounds up to the nearest minute.** A 10-second clip costs the same as a 55-second clip. For rapid iteration, generate at 60s and edit down, not at 10s × 6.
- **No native lyrics support in prompt mode** — for songs with vocals use MiniMax Music 2.6 (\`minimax_music_prompt_guide\`). Eleven Music is primarily for instrumental / soundtrack-style generation.
- **No reference-audio style transfer.** Style comes entirely from the text prompt.

## Input requirements
- **prompt** (optional) — text description. Required unless you pass \`composition_plan\` instead.
- **composition_plan** (optional) — structured plan (see Eleven docs for format). Mutually exclusive with prompt when you want precise section control.
- **music_length_ms** (optional) — integer 3000-600000. Passed via extra_params.
- **force_instrumental** (optional, boolean) — guarantees no vocals. Only applies when using \`prompt\`.
- **respect_sections_durations** (optional, boolean) — strict enforcement of composition_plan section durations. Only applies when \`composition_plan\` is used.
- **output_format** (optional) — codec_samplerate_bitrate string. Default "mp3_44100_128".

Source: \`src/catalog/fal-specs/eleven-music/llms.md\`.

## Prompt structure
Stack these descriptors:

| Element | Examples |
|---------|----------|
| Genre / style | \`lo-fi hip-hop\`, \`cinematic orchestral\`, \`80s synthwave\`, \`indie folk\` |
| Mood / emotion | \`warm\`, \`contemplative\`, \`uplifting\`, \`tense\`, \`bittersweet\` |
| Instrumentation | \`acoustic guitar\`, \`analog synths\`, \`brushed drums\`, \`soft piano\` |
| Tempo / BPM | \`90 bpm\`, \`driving beat\`, \`syncopated rhythm\`, \`slow half-time\` |
| Soundscape | \`spacious reverb\`, \`vinyl crackle\`, \`city ambience\` |
| Production | \`clean modern mix\`, \`vintage lo-fi\`, \`raw demo quality\` |

Lead with genre, then mood, then instrumentation. Tempo and soundscape go last.

## Example prompts

**Music bed for a reel (30s mp3):**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/music",
  "prompt": "warm indie folk, acoustic guitar and light hand claps, uplifting, 110 bpm, clean modern mix",
  "output": "./bed.mp3",
  "extra_params": { "music_length_ms": 30000, "force_instrumental": true }
}
\`\`\`

**Cinematic trailer sting:**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/music",
  "prompt": "cinematic orchestral, tense strings rising to a brass hit at the end, dark and heroic, spacious reverb",
  "output": "./sting.mp3",
  "extra_params": { "music_length_ms": 10000 }
}
\`\`\`

**Lo-fi background for an explainer video (2 min):**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/music",
  "prompt": "calm lo-fi hip-hop, mellow electric piano, soft brushed drums, subtle vinyl crackle, 85 bpm, thoughtful mood",
  "output": "./background.mp3",
  "extra_params": { "music_length_ms": 120000, "force_instrumental": true, "output_format": "mp3_44100_128" }
}
\`\`\`

## Access routes

| Provider | Tool                   | Model ID                    | Cost                                                                    | Notes |
|----------|------------------------|-----------------------------|-------------------------------------------------------------------------|-------|
| fal      | \`fal_generate_music\` | \`fal-ai/elevenlabs/music\` | $0.80 per output audio minute (rounded up to the nearest whole minute)  | Lyrics-less by default. Composition plan supported via extra_params. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/eleven-music/llms.md\`. Output format list matches committed spec.

## Official references
- Model page: https://fal.ai/models/fal-ai/elevenlabs/music
- ElevenLabs upstream music docs: https://elevenlabs.io/docs/api-reference/music
`;

export function registerElevenlabsMusicPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'elevenlabs_music_prompt_guide',
    'Prompt guidance for ElevenLabs Music on fal. Covers prompt anatomy (genre + mood + instrumentation + BPM), composition_plan option, music_length_ms knob, force_instrumental, output_format variants. Note: uses music_length_ms not duration_seconds. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: ELEVENLABS_MUSIC_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MINIMAX_MUSIC_GUIDE = `# MiniMax Music 2.6 (Song Generation) Prompt Guide

## What this model is best for
**Full songs with vocals and lyrics.** MiniMax Music 2.6 is the Phase 5 catalog's \`music.song\` sub-class default — it creates complete tracks with singing, backing music, and song-structured arrangements (verse / chorus / bridge) from a style description plus optional lyrics.

Use this when you need actual vocals in the output. For instrumental music beds, use \`elevenlabs_music_prompt_guide\` or \`lyria2_prompt_guide\` instead.

## Known strengths
- **Vocals + lyrics synthesis** — one of the few fal-hosted models that does this as a single-call generation.
- **Structure tags** parsed in lyrics: \`[Intro]\`, \`[Verse]\`, \`[Pre Chorus]\`, \`[Chorus]\`, \`[Post Chorus]\`, \`[Hook]\`, \`[Bridge]\`, \`[Interlude]\`, \`[Transition]\`, \`[Build Up]\`, \`[Break]\`, \`[Inst]\`, \`[Solo]\`, \`[Outro]\`. Use these to shape arrangement explicitly.
- **\`lyrics_optimizer\`** auto-generates lyrics from the prompt if you don't supply your own.
- **\`is_instrumental: true\`** switches off vocals when you want a song-structured but vocal-free track.

## Known weaknesses / quirks
- **Prompt is 10-2000 characters, required.** Shorter than a style-only description — MiniMax expects genre + mood + instrumentation + scenario.
- **Lyrics max 3500 characters.** Long songs need lyrics trimmed.
- **\`lyrics_optimizer\` overrides manual lyrics** only when your \`lyrics\` field is empty. Setting it to true with explicit lyrics is a no-op.
- **Vocals are synthetic** — recognizable as AI-generated. Don't expect chart-ready quality; expect "demo-quality track with plausible vocals".
- **Style blending is prompt-driven only** — no reference audio support. Stacking genres ("indie folk meets 80s synthwave") sometimes produces incoherent mixes.

## Input requirements
- **prompt** (required) — style + mood + instrumentation + scenario, 10-2000 chars. Passed via the tool's structural \`prompt\` arg.
- **lyrics** (optional) — song lyrics with structure tags. Passed via the tool's structural \`lyrics\` arg. Required when \`is_instrumental\` is false AND \`lyrics_optimizer\` is false.
- **lyrics_optimizer** (optional, boolean) — auto-generate lyrics from prompt. Via \`extra_params\`.
- **is_instrumental** (optional, boolean) — no vocals. Via \`extra_params\`.
- **audio_setting** (optional) — sample rate / bitrate. Via \`extra_params\`.

Source: \`src/catalog/fal-specs/minimax-music-2.6/llms.md\`.

## Prompt structure
**Prompt field** — stack these in order:

1. **Genre** (\`city pop\`, \`indie folk\`, \`trap\`, \`synthwave\`)
2. **Era / style descriptors** (\`80s retro\`, \`vintage\`, \`modern lo-fi\`)
3. **Instrumentation** (\`groovy synth bass\`, \`warm acoustic guitar\`, \`808 drums\`)
4. **Vocal character** (\`warm female vocal\`, \`breathy male voice\`, \`chopped and pitched\`)
5. **Tempo / BPM** (\`104 BPM\`, \`slow ballad tempo\`)
6. **Scenario / mood** (\`nostalgic urban night\`, \`rainy afternoon\`, \`triumphant finale\`)

**Lyrics field** — use structure tags on their own lines:

\`\`\`
[Verse]
Streetlights flicker, the night breeze sighs
Shadows stretch as I walk alone
[Chorus]
Wandering, longing, where should I go
\`\`\`

Tip: structure tags are more reliable than trying to describe arrangement in the prompt. "[Bridge]" in lyrics reliably produces a bridge section; "add a bridge" in the prompt may or may not.

## Example prompts

**Full song with structured lyrics:**
\`\`\`json
{
  "model": "fal-ai/minimax-music/v2.6",
  "prompt": "City Pop, 80s retro, groovy synth bass, warm female vocal, 104 BPM, nostalgic urban night",
  "lyrics": "[Verse]\\nStreetlights flicker, the night breeze sighs\\nShadows stretch as I walk alone\\n[Chorus]\\nWandering, longing, where should I go\\n[Verse]\\nMemories drift like smoke in the rain\\n[Chorus]\\nWandering, longing, where should I go",
  "output": "./song.mp3"
}
\`\`\`

**Let the model write the lyrics:**
\`\`\`json
{
  "model": "fal-ai/minimax-music/v2.6",
  "prompt": "Mellow acoustic indie folk, warm male vocal, fingerpicked guitar, subtle hand claps, 90 BPM, cozy kitchen morning",
  "output": "./auto-lyrics.mp3",
  "extra_params": { "lyrics_optimizer": true }
}
\`\`\`

**Instrumental track with song structure (no vocals):**
\`\`\`json
{
  "model": "fal-ai/minimax-music/v2.6",
  "prompt": "Uplifting cinematic orchestral, strings build to triumphant brass, 120 BPM, hopeful ending",
  "output": "./instrumental.mp3",
  "extra_params": { "is_instrumental": true }
}
\`\`\`

## Access routes

| Provider | Tool                   | Model ID                      | Cost                   | Notes |
|----------|------------------------|-------------------------------|------------------------|-------|
| fal      | \`fal_generate_music\` | \`fal-ai/minimax-music/v2.6\` | $0.15 per audio        | Full songs with vocals. Use is_instrumental:true to disable vocals. |

Earlier versions (2.5, V2, V1) are also on fal under the minimax-music family with similar prompt language.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/minimax-music-2.6/llms.md\`. Structure-tag list matches fal's published spec.

## Official references
- Model page: https://fal.ai/models/fal-ai/minimax-music/v2.6
- MiniMax upstream docs: https://www.minimax.io/platform/document
`;

export function registerMinimaxMusicPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'minimax_music_prompt_guide',
    'Prompt guidance for MiniMax Music 2.6 on fal. Full songs with synthetic vocals and structured lyrics. Covers prompt anatomy (genre + era + instrumentation + vocal character + BPM + scenario), lyrics structure tags ([Verse], [Chorus], [Bridge], etc.), and is_instrumental / lyrics_optimizer options. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MINIMAX_MUSIC_GUIDE }] }),
  );
}

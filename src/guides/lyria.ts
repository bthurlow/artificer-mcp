import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const LYRIA_GUIDE = `# Lyria music generation prompt guide

Artificer exposes two Lyria tools with different tradeoffs:

| Tool | When to use | Duration | Latency |
|---|---|---|---|
| \`gemini_generate_music\` (**batch**, Lyria 3) | Music beds, title-card stingers, one-shot clips | 30s (Clip) or up to ~2min (Pro) | Synchronous, one API call |
| \`gemini_generate_music_live\` (Lyria RealTime) | Interactive apps, streaming, live steering | Unbounded wall-clock (capped 120s by artificer) | Streaming WebSocket |

**For static music beds in videos, use the batch tool.** Realtime is for interactive use cases.

## Model IDs

| Env var | Default | Notes |
|---|---|---|
| \`ARTIFICER_LYRIA_MODEL\` | \`lyria-3-clip-preview\` | Fixed 30s, MP3 output |
| \`ARTIFICER_LYRIA_MODEL\` | \`lyria-3-pro-preview\` | Up to ~2min, duration prompt-controllable, WAV output |
| \`ARTIFICER_LYRIA_LIVE_MODEL\` | \`models/lyria-realtime-exp\` | Realtime streaming |

## Prompt anatomy

Based on the [Vertex AI Lyria prompt guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/music/music-gen-prompt-guide). Identify your core idea, then stack these descriptors:

| Element | Keywords |
|---|---|
| **Genre / style** | \`indie folk\`, \`cinematic orchestral\`, \`lo-fi hip-hop\`, \`ambient electronic\`, \`80s synthwave\` |
| **Mood / emotion** | \`warm\`, \`uplifting\`, \`contemplative\`, \`tense\`, \`bittersweet\`, \`playful\` |
| **Instrumentation** | \`acoustic guitar\`, \`analog synths\`, \`fingerpicked ukulele\`, \`soft piano\`, \`brushed drums\` |
| **Tempo / rhythm** | \`110 bpm\`, \`slow\`, \`driving beat\`, \`syncopated\`, \`swung eighths\` |
| **Arrangement** (optional) | \`starts solo piano, builds with strings\`, \`drop at 0:20\` |
| **Soundscape** (optional) | \`spacious reverb\`, \`warm room tone\`, \`vinyl crackle\`, \`city ambience\` |
| **Production** (optional) | \`clean modern mix\`, \`vintage lo-fi\`, \`raw demo\` |

## Lyria 3 Pro: structured timestamps

Pro supports timeline prompts using \`[mm:ss - mm:ss]\` markers plus intensity scales 1/10 to 10/10:

\`\`\`
[0:00 - 0:15] solo fingerpicked acoustic guitar, intensity 3/10, warm and intimate.
[0:15 - 0:45] add light hand claps and upright bass, intensity 6/10, lift the mood.
[0:45 - 1:00] bring in brushed drums and a short strings swell, intensity 8/10, hopeful ending.
\`\`\`

Also controllable: \`song key\` (e.g., "A major"), \`BPM\` (e.g., "132 BPM").

## Negative prompts

- **Lyria 2** (Vertex) supports \`negative_prompt\` field directly.
- **Lyria 3** (Gemini API) does **not** have a dedicated field — artificer's batch tool accepts a \`negative_prompt\` param and appends it to the prompt as \`\\nAvoid: ...\`. This is prompt-engineered guidance, not a guarantee.

## Example prompts

### Bakery / cozy kitchen vibe (music bed under dialogue)
\`\`\`
upbeat indie folk with acoustic guitar, light hand claps, warm kitchen vibe, 110 bpm, no vocals, positive mood, clean modern mix
\`\`\`

### Educational / content explainer background
\`\`\`
calm lo-fi hip-hop, mellow electric piano, soft brushed drums, subtle vinyl crackle, 85 bpm, thoughtful mood, spacious reverb
\`\`\`

### Social media reel intro sting
\`\`\`
short punchy synthwave intro, analog lead, driving 4-on-the-floor kick, 120 bpm, confident mood, modern mix, 10 seconds
\`\`\`

## Realtime (\`gemini_generate_music_live\`) tips

Realtime uses \`weightedPrompts\` — a single prompt with weight 1.0 is the default, but the underlying SDK supports multi-prompt blending. This tool currently sends one prompt at weight 1.0.

**Session lifecycle** (internally managed by artificer):
1. Connect → wait for \`setupComplete\` (≤10s)
2. \`setWeightedPrompts\` with the text prompt
3. Optional: \`setMusicGenerationConfig\` (temperature/seed/guidance)
4. \`play()\` → audio chunks stream in
5. Wall-clock wait for \`duration_seconds\`
6. \`stop()\` + \`close()\` (force-closed after hard deadline)

Output: 16-bit PCM 48kHz stereo, wrapped in WAV by artificer.

**Known gotchas** (from [ai.google.dev/gemini-api/docs/realtime-music-generation](https://ai.google.dev/gemini-api/docs/realtime-music-generation)):
- Call \`resetContext()\` when drastically changing prompts (not yet exposed in this tool)
- Sessions can stall silently — artificer enforces \`duration_seconds + 15s\` hard deadline
- Cap \`duration_seconds\` at 120; for longer beds, use the batch tool (Pro supports ~2min) or concatenate multiple generations

## Safety / content filters

Lyria applies safety filters. Common triggers:
- Copyrighted artist names ("in the style of Taylor Swift") — blocked
- Explicit lyrics — Lyria 3 is mostly instrumental; avoid vocal requests
- Specific commercial brand sounds

Describe style via attributes, not by referencing named artists.

## Access routes

| Provider | Tool                              | Model ID                         | Cost                   | Notes |
|----------|-----------------------------------|----------------------------------|------------------------|-------|
| google   | \`gemini_generate_music\`         | \`lyria-3-clip-preview\` (default, 30s MP3) / \`lyria-3-pro-preview\` (up to ~2min WAV) | See Google Cloud pricing | Batch, synchronous. Pro supports timeline prompts with \`[mm:ss - mm:ss]\` markers and intensity scales. No dedicated \`negative_prompt\` field on Lyria 3 — artificer appends \`\\nAvoid: ...\` as prompt guidance. |
| google   | \`gemini_generate_music_live\`    | \`models/lyria-realtime-exp\`    | See Google Cloud pricing | Streaming WebSocket session. Caller-side deadline capped 120s in artificer. Output is 16-bit PCM 48kHz stereo wrapped in WAV. |

Fal hosts alternative music generation (Suno, MusicGen) — those are separate logical models with their own guides when Phase 5 lands.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — Lyria 3 / 3 Pro prompt anatomy, timeline-marker syntax, and realtime session lifecycle validated through shipping use.

## Reference
- [Music generation (Lyria 3 batch) docs](https://ai.google.dev/gemini-api/docs/music-generation)
- [Realtime music generation (Lyria RealTime) docs](https://ai.google.dev/gemini-api/docs/realtime-music-generation)
- [Vertex AI Lyria 2 API reference](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/lyria-music-generation)
- [Lyria prompt guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/music/music-gen-prompt-guide)
`;

export function registerLyriaPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_lyria_prompt_guide',
    'Get structured prompt guidance for Lyria music generation (batch via gemini_generate_music + realtime via gemini_generate_music_live). Covers prompt anatomy, Lyria 3 Pro timestamps, negative prompts, realtime session lifecycle, and safety filter notes with official doc links. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: LYRIA_GUIDE }],
    }),
  );
}

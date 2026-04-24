import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const TTS_GUIDE = `# Gemini TTS prompt guide

Generate natural-sounding speech from text via \`gemini_generate_speech\`. Based on [ai.google.dev/gemini-api/docs/speech-generation](https://ai.google.dev/gemini-api/docs/speech-generation) and [Gemini TTS models page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-preview-tts).

## Models

| Model ID | Use when |
|---|---|
| \`gemini-3.1-flash-tts-preview\` | Newest (2026). Expressive, multilingual. Recommended default. |
| \`gemini-2.5-flash-preview-tts\` | Fast, cheap. Conversational use cases, high-volume narration. |
| \`gemini-2.5-pro-preview-tts\` | Long-form content, professional narration, highest clarity. |

Override via \`ARTIFICER_TTS_MODEL\` env var.

## Voices (30 prebuilt)

Each has a character. Match voice to content tone:

| Voice | Character | Voice | Character |
|---|---|---|---|
| Zephyr | Bright | Puck | Upbeat |
| Charon | Informative | **Kore** | **Firm, calm** (default) |
| Fenrir | Excitable | Leda | Youthful |
| Orus | Firm | Aoede | Breezy |
| Callirrhoe | Easy-going | Autonoe | Bright |
| Enceladus | Breathy | Iapetus | Clear |
| Umbriel | Easy-going | Algieba | Smooth |
| Despina | Smooth | Erinome | Clear |
| Algenib | Gravelly | Rasalgethi | Informative |
| Laomedeia | Upbeat | Achernar | Soft |
| Alnilam | Firm | Schedar | Even |
| Gacrux | Mature | Pulcherrima | Forward |
| Achird | Friendly | Zubenelgenubi | Casual |
| Vindemiatrix | Gentle | Sadachbia | Lively |
| Sadaltager | Knowledgeable | Sulafat | Warm |

Sample voices in AI Studio before picking.

## Three ways to control delivery

### 1. Voice choice (baseline character)
### 2. \`style\` parameter (prepended as a natural-language directive)
\`\`\`
style: "In a warm, conversational baker-to-baker tone"
text: "Ingredients are only about 30% of your real cost..."
\`\`\`

### 3. Inline audio tags (fine-grained control within the text)
\`\`\`
"[whispers] Here's the secret baker math [normal voice] most people miss..."
\`\`\`

Supported tags include: \`[whispers]\`, \`[laughs]\`, \`[excited]\`, \`[sarcastic]\`, \`[shouting]\`, \`[pause]\`. Full list in the official docs.

## Prompt recipe (single speaker)

1. Pick voice matching the tone (e.g., \`Sulafat\` for warmth, \`Charon\` for authority)
2. Add a \`style\` directive describing delivery: tempo, mood, accent, emotional register
3. Write the text with sparse audio tags at key emphasis points
4. Keep each call under ~1000 characters; split longer narration into multiple calls

## Examples

### Warm narration
\`\`\`json
{
  "voice": "Sulafat",
  "style": "In a warm, encouraging baker-to-baker tone, slightly slower than conversational pace",
  "text": "You might think doubling your ingredient cost sets a fair price. [pause] It doesn't. [pause] Ingredients are only about thirty percent of what a dozen cookies really costs you."
}
\`\`\`

### Upbeat social CTA
\`\`\`json
{
  "voice": "Puck",
  "style": "Energetic and punchy, like a good ad read",
  "text": "[excited] Real baker math, automatically! Try DoughMetrics free today."
}
\`\`\`

## Multi-speaker (dialogue)

Use \`multiSpeakerVoiceConfig\` in the API directly (not yet exposed in this tool's schema). Assign voice names per speaker, prefix lines with \`Speaker:\` in the text:
\`\`\`
Jenn: Hey, have you seen your real cost per batch?
Baker: I just use twice the ingredients...
\`\`\`

## Tips

- **Model picks matter more than voice for quality.** Flash is great for short clips; Pro handles long-form better.
- **Style beats voice for emotion.** "Kore" + style directive "excited" outperforms switching to Puck for mild enthusiasm.
- **Audio tags should be sparse.** Overusing them breaks flow.
- **Keep punctuation natural.** Periods add short pauses; em-dashes work for mid-sentence pauses.
- **For ingestion into video workflows**, .wav is preferred — no transcode cost.

## Access routes

| Provider | Tool                        | Model ID                              | Cost                   | Notes |
|----------|-----------------------------|---------------------------------------|------------------------|-------|
| google   | \`gemini_generate_speech\`  | \`gemini-2.5-flash-preview-tts\` (default) / Pro / Flash 3.1 | See Google Cloud pricing | Exposes \`voice\`, \`language_code\`, \`style\`. 30 prebuilt voices. Emits WAV natively; other formats transcoded via ffmpeg. |

Fal hosts alternative TTS providers (ElevenLabs, OpenAI-compatible voices) — those are their own logical models with their own guides when Phase 5 lands.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — voice list, style/audio-tag patterns, and multi-speaker behavior validated through shipping use.

## Reference
- [Speech generation docs](https://ai.google.dev/gemini-api/docs/speech-generation)
- [Gemini 2.5 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-preview-tts)
- [Gemini 2.5 Pro TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro-preview-tts)
`;

export function registerGeminiTtsPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_tts_prompt_guide',
    'Get structured prompt guidance for Gemini TTS (gemini_generate_speech). Covers 30 prebuilt voices, model tiers, style directives, inline audio tags, and multi-speaker patterns with official doc links. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: TTS_GUIDE }],
    }),
  );
}

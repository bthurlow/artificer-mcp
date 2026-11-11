import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const TTS_GUIDE = `# Gemini TTS prompt guide

Generate natural-sounding speech from text via \`gemini_generate_speech\`. Based on [Google's speech-generation docs](https://aistudio.google.com/docs/speech-generation).

## Models

| Model ID | Use when |
|---|---|
| \`gemini-3.8-flash-tts\` | **Default.** 130+ languages, voice design and replication. Served through the Interactions API (the tool handles it). |
| \`gemini-3.8-flash-lite-tts\` | Cheaper 3.8 tier, 100+ languages (some, e.g. Thai, Swedish, Finnish, are Flash-only). |
| \`gemini-3.1-flash-tts-preview\` | Preview, generateContent. |
| \`gemini-2.5-pro-preview-tts\` | Preview, generateContent. Long-form narration. |

\`gemini-2.5-flash-preview-tts\`, the old default, **shuts down 2026-11-17**; Google's replacement is \`gemini-3.8-flash-tts\`. Override the default via the \`ARTIFICER_TTS_MODEL\` env var.

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
### 2. \`style\` parameter (sustained delivery)
\`\`\`
style: "In a warm, conversational baker-to-baker tone"
text: "Ingredients are only about 30% of your real cost..."
\`\`\`

On the 3.8 models the text is a **verbatim transcript**: everything in \`text\` is spoken, so put delivery instructions in \`style\` (sent as \`speech_metadata\`), never in the text. On the preview models \`style\` is prepended to the text as a stage direction.

### 3. Inline tags (momentary sounds and pauses within the text)
3.8 uses angle-bracket tags; the preview models use square brackets:
\`\`\`
3.8:      "<whispers> Here's the secret baker math most people miss..."
preview:  "[whispers] Here's the secret baker math [normal voice] most people miss..."
\`\`\`

Preview tags include \`[whispers]\`, \`[laughs]\`, \`[excited]\`, \`[sarcastic]\`, \`[shouting]\`, \`[pause]\`. The 3.8 tag list is in the official docs.

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

Not yet exposed in this tool's schema (the fal route below takes \`speakers\`). On 3.8 the API takes one content item per turn with a \`speaker\` annotation and up to two prebuilt voices; the preview models took \`multiSpeakerVoiceConfig\` with lines prefixed \`Speaker:\`:
\`\`\`
Jenn: Hey, have you seen your real cost per batch?
Baker: I just use twice the ingredients...
\`\`\`

## Tips

- **Model picks matter more than voice for quality.** 3.8 Flash is the default; Flash-Lite trades some languages for price.
- **Style beats voice for emotion.** "Kore" + style directive "excited" outperforms switching to Puck for mild enthusiasm.
- **Audio tags should be sparse.** Overusing them breaks flow.
- **Keep punctuation natural.** Periods add short pauses; em-dashes work for mid-sentence pauses.
- **For ingestion into video workflows**, .wav is preferred — no transcode cost.

## Access routes

| Provider | Tool                        | Model ID                              | Cost                   | Notes |
|----------|-----------------------------|---------------------------------------|------------------------|-------|
| google   | \`gemini_generate_speech\`  | \`gemini-3.8-flash-tts\` (default) / 3.8 Flash-Lite / previews | See Google Cloud pricing | Exposes \`voice\`, \`language_code\`, \`style\`. 30 prebuilt voices. Emits WAV natively (24 kHz mono 16-bit); other formats transcoded via ffmpeg. |
| fal      | \`fal_generate_speech\`     | \`fal-ai/gemini-3.1-flash-tts\` (slug \`gemini-3.1-flash-tts\`) | $0.05 per 1000 characters | Gemini 3.1 Flash TTS hosted on fal; uses FAL_KEY instead of GOOGLE_API_KEY. The fal spec takes the text as \`prompt\` (pass it via extra_params), plus \`voice\`, \`language_code\`, \`style_instructions\`, \`speakers\` (multi-speaker), \`temperature\`, \`output_format\`. Added 2026-09-24. |

Fal hosts alternative TTS providers (ElevenLabs, OpenAI-compatible voices) — those are their own logical models with their own guides when Phase 5 lands.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — voice list, style/audio-tag patterns, and multi-speaker behavior validated through shipping use. 2026-11-11: 3.8 models, Interactions request shape and the 2.5 Flash shutdown from Google's speech-generation and deprecations pages (3.8 not yet run live).

## Reference
- [Speech generation docs](https://aistudio.google.com/docs/speech-generation)
- [Deprecations](https://aistudio.google.com/docs/deprecations)
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

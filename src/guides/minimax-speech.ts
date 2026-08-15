import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MINIMAX_SPEECH_GUIDE = `# MiniMax Speech 2.8 HD Prompt Guide

## What this model is best for
High-quality single-voice TTS from MiniMax, with strong multilingual coverage (38 language hints supported) and inline interjection tags. Use when you need Chinese, Japanese, Korean, or other non-English output and want reliable dialect recognition, or when you want explicit control over pauses via \`<#x#>\` timing markers.

## Known strengths
- **Multilingual coverage**: 38-language \`language_boost\` enum (Chinese incl. Yue, English, Arabic, Russian, Spanish, French, Portuguese, German, Turkish, Dutch, Ukrainian, Vietnamese, Indonesian, Japanese, Italian, Korean, Thai, Polish, Romanian, Greek, Czech, Finnish, Hindi, Bulgarian, Danish, Hebrew, Malay, Slovak, Swedish, Croatian, Hungarian, Norwegian, Slovenian, Catalan, Nynorsk, Afrikaans, auto).
- **Inline timing markers**: \`<#0.5#>\` inserts a precise 0.5-second pause. Range 0.01-99.99 seconds.
- **Interjection tags** parsed inline: \`(laughs)\`, \`(sighs)\`, \`(coughs)\`, \`(clears throat)\`, \`(gasps)\`, \`(sniffs)\`, \`(groans)\`, \`(yawns)\`.
- **voice_modify** allows pitch / intensity / timbre adjustment beyond the base voice.
- **pronunciation_dict** for custom phoneme overrides — useful for brand names / proper nouns.

## Known weaknesses / quirks
- **IMPORTANT: the tool-level \`text\` arg does NOT map for this model.** MiniMax uses \`prompt\` as its input field name, not \`text\`. Pass the script via \`extra_params.prompt\` instead. (Alternatively, use the Turbo variant models under the same family.) This is the #1 papercut callers hit.
- **\`output_format\` defaults to \`"hex"\`** which returns hex-encoded audio (not a URL). For artificer's download-and-write flow you want \`output_format: "url"\` in extra_params.
- **Voice selection via \`voice_setting\` is a structured object**, not a simple voice name string. Check MiniMax docs for the voice ID format.
- Less widely-adopted voices than ElevenLabs — if voice consistency across pipelines is a goal, Eleven's library is the safer default.

## Input requirements
- **prompt** (required) — the script. Passed via \`extra_params.prompt\`.
- **voice_setting** (optional) — object with voice id + settings. Via \`extra_params\`.
- **audio_setting** (optional) — sample rate / bitrate / format settings. Via \`extra_params\`.
- **language_boost** (optional) — one of the 38 language enum values. Via \`extra_params\`.
- **output_format** (optional) — \`"url"\` or \`"hex"\`. Set to \`"url"\` for artificer's download flow.
- **pronunciation_dict** / **normalization_setting** / **voice_modify** — advanced knobs, via \`extra_params\`.

Source: \`src/catalog/fal-specs/minimax-speech-2.8-hd/llms.md\`.

## Prompt structure
Write natural prose in the target language. Use timing markers and interjections sparingly:

- **\`<#0.3#>\`** — inserts a 0.3-second silence. Good for dramatic pauses.
- **\`(laughs)\`**, **\`(sighs)\`** — interjections. One or two per paragraph maximum.
- **Punctuation still matters** — commas and periods produce natural pauses even without timing markers.
- For non-English content, set \`language_boost\` to the target language explicitly rather than relying on "auto".

## Example prompts

**English intro with timed pause + laugh:**
\`\`\`json
{
  "model": "fal-ai/minimax/speech-2.8-hd",
  "output": "./intro.mp3",
  "extra_params": {
    "prompt": "Hello world! Welcome to the MiniMax text to speech model <#0.5#> Speech 2.8 HD (laughs) now available on Fal!",
    "output_format": "url",
    "language_boost": "English"
  }
}
\`\`\`

**Japanese narration:**
\`\`\`json
{
  "model": "fal-ai/minimax/speech-2.8-hd",
  "output": "./ja.mp3",
  "extra_params": {
    "prompt": "ベーカリーの朝、パンの香りが広がります。",
    "output_format": "url",
    "language_boost": "Japanese"
  }
}
\`\`\`

**Brand-name pronunciation override:**
\`\`\`json
{
  "model": "fal-ai/minimax/speech-2.8-hd",
  "output": "./brand.mp3",
  "extra_params": {
    "prompt": "DoughMetrics helps bakers price correctly.",
    "output_format": "url",
    "pronunciation_dict": { "DoughMetrics": "dow-metrics" }
  }
}
\`\`\`

## Access routes

| Provider | Tool                    | Model ID                        | Cost                         | Notes |
|----------|-------------------------|---------------------------------|------------------------------|-------|
| fal      | \`fal_generate_speech\` | \`fal-ai/minimax/speech-2.8-hd\`| $0.10 per 1000 characters    | Uses \`prompt\` not \`text\`. Set \`output_format: "url"\` in extra_params. |

Other MiniMax speech variants on fal (Speech 2.8 Turbo, 2.6 HD, 2.6 Turbo, 02 HD, 02 Turbo) share this prompt language; pick per cost / latency trade-off. See \`model_catalog\` with capability:"speech".

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/minimax-speech-2.8-hd/llms.md\`. 38-language list and interjection tags validated against fal's published spec.

## Official references
- Model page: https://fal.ai/models/fal-ai/minimax/speech-2.8-hd
- MiniMax upstream docs: https://www.minimax.io/platform/document
`;

export function registerMinimaxSpeechPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'minimax_speech_prompt_guide',
    'Prompt guidance for MiniMax Speech 2.8 HD on fal. Single-voice TTS with 38-language multilingual coverage, inline <#x#> pause markers, interjection tags. Key quirk: uses `prompt` (via extra_params) not `text`. Set output_format:"url" for artificer download flow. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MINIMAX_SPEECH_GUIDE }] }),
  );
}

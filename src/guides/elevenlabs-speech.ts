import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const ELEVENLABS_SPEECH_GUIDE = `# ElevenLabs Speech (fal-hosted TTS) Prompt Guide

## What this model is best for
Natural-sounding single-speaker narration across three tiers of the ElevenLabs TTS lineup on fal:
- **Turbo v2.5** — fastest and cheapest Eleven tier, best for high-volume short-form content (reels, ad reads, short narration).
- **Multilingual v2** — same voices, but explicit language-code support; best when localizing the same script across multiple languages.
- **Eleven v3** — newest Eleven model, highest expressiveness; best for longer-form narration where emotional range matters more than cost.

One guide covers all three because the prompt language is identical. Cost, latency, and multilingual support differ (see Access routes).

## Known strengths
- 20+ prebuilt voices (Rachel, Aria, Roger, Sarah, Charlie, George, Callum, River, Liam, Charlotte, Alice, Matilda, Will, Jessica, Eric, Chris, Brian, Daniel, Lily, Bill). "Rachel" is the API default when \`voice\` is omitted.
- Fine-grained control over voice character via \`stability\`, \`similarity_boost\`, \`style\`, and \`speed\` knobs (passed through \`extra_params\`).
- Continuity support via \`previous_text\` / \`next_text\` in extra_params — helpful when stitching generated segments together.
- Multilingual v2 + v3 handle non-English text reliably when \`language_code\` is set explicitly.

## Known weaknesses / quirks
- **No inline audio tags** like Gemini TTS. Use Gemini TTS when you need \`[whispers]\` / \`[excited]\` / \`[laughs]\` tags inline.
- **Turbo v2.5 is English-first.** Multilingual needs come from Multilingual v2 or v3.
- Voice character is baked in per voice. To shape tone, lean on \`stability\` / \`similarity_boost\` / \`style\` rather than prompt-text tricks.
- Character limit per request is generous but not unlimited — split long narration into 1-2 minute chunks and use \`previous_text\` / \`next_text\` for smooth joins.

## Input requirements
- **text** (required) — the script. UTF-8 string, max a few thousand characters per call in practice.
- **voice** (optional) — voice name string. Defaults to "Rachel".
- **stability** / **similarity_boost** / **style** / **speed** — floats 0–1 (speed is 0.7–1.2). All optional, all passed via \`extra_params\`.
- **language_code** (optional) — ISO 639-1 like "en", "es", "fr". Required on Multilingual v2 for reliable non-English output.
- **apply_text_normalization** — "auto" | "on" | "off". Controls whether numbers are spelled out. Default "auto".

Source: \`src/catalog/fal-specs/eleven-turbo-v2.5/llms.md\` + siblings for v2/v3.

## Prompt structure
The \`text\` field carries the full script. There is no separate "style prompt" — tone is controlled via voice selection + knob tuning, not prose instructions. Tips:

- **Write natural prose.** Don't stage-direct the speaker in brackets; ElevenLabs doesn't parse those.
- **Punctuation matters.** Periods produce short pauses, em-dashes mid-sentence pauses, ellipses longer pauses.
- **Paragraph breaks** create breath pauses. Use them to structure long narration.
- **Numbers and dates**: with \`apply_text_normalization: "auto"\` the model decides; set "on" when you want "2026" read as "twenty twenty-six" consistently.

## Example prompts

**Short product intro (Turbo v2.5, Rachel):**
> \`{"model": "fal-ai/elevenlabs/tts/turbo-v2.5", "text": "Most bakers get pricing wrong by 40 percent. Here's the math.", "voice": "Rachel", "output": "./intro.mp3"}\`

Natural prose, no stage direction. Turbo's default voice nails confident explanatory tone without extra knob tuning.

**Warm narration (Eleven v3, Charlotte, style bumped):**
> \`{"model": "fal-ai/elevenlabs/tts/eleven-v3", "text": "You walk into the kitchen, flour dusting the counter, and the smell of yeast hits you first.", "voice": "Charlotte", "output": "./scene.mp3", "extra_params": {"stability": 0.4, "style": 0.3}}\`

Lower stability lets the v3 model reach for more emotional expressiveness; modest style bump adds warmth without over-acting.

**Spanish localization (Multilingual v2, language enforced):**
> \`{"model": "fal-ai/elevenlabs/tts/multilingual-v2", "text": "La mayoría de los panaderos calculan mal su precio.", "voice": "Sarah", "output": "./intro_es.mp3", "extra_params": {"language_code": "es"}}\`

Multilingual v2 with an explicit \`language_code\` is the reliable path. Without it, the model may auto-detect and occasionally mis-pronounce.

## Access routes

| Provider | Tool                    | Model ID                                    | Cost                        | Notes |
|----------|-------------------------|---------------------------------------------|-----------------------------|-------|
| fal      | \`fal_generate_speech\` | \`fal-ai/elevenlabs/tts/turbo-v2.5\`        | $0.05 per 1000 characters   | Fastest Eleven tier, English-first. |
| fal      | \`fal_generate_speech\` | \`fal-ai/elevenlabs/tts/multilingual-v2\`   | $0.10 per 1000 characters   | Explicit \`language_code\` support. |
| fal      | \`fal_generate_speech\` | \`fal-ai/elevenlabs/tts/eleven-v3\`         | $0.10 per 1000 characters   | Highest expressiveness; best with emotion-heavy scripts. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema sourced from the three llms.md files committed under \`src/catalog/fal-specs/\`. Voice list and parameter ranges match fal's published specs.

## Official references
- Eleven Turbo v2.5: https://fal.ai/models/fal-ai/elevenlabs/tts/turbo-v2.5
- Multilingual v2: https://fal.ai/models/fal-ai/elevenlabs/tts/multilingual-v2
- Eleven v3: https://fal.ai/models/fal-ai/elevenlabs/tts/eleven-v3
- ElevenLabs upstream docs: https://elevenlabs.io/docs
`;

export function registerElevenlabsSpeechPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'elevenlabs_speech_prompt_guide',
    'Prompt guidance for ElevenLabs TTS on fal — covers Turbo v2.5, Multilingual v2, and Eleven v3. 20+ prebuilt voices, stability / similarity / style / speed knobs, previous_text / next_text continuity hints, language_code for multilingual paths. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: ELEVENLABS_SPEECH_GUIDE }] }),
  );
}

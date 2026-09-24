import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_TTS_GUIDE = `# fal Text-to-Speech (grouped) — Prompt Guide

## What's in this guide
Text-to-speech models on fal that have no family guide of their own: Qwen, xAI, Inworld, Chatterbox and ByteDance Seed Speech. All run through \`fal_generate_speech\`.

Covered elsewhere: Gemini 3.1 Flash TTS on fal (\`gemini_tts_prompt_guide\`), MiniMax Speech (\`minimax_speech_prompt_guide\`), ElevenLabs (\`elevenlabs_speech_prompt_guide\`), multi-speaker scripts (\`fal_dialogue_prompt_guide\`), voice cloning (\`minimax_voice_clone_prompt_guide\`).

## Picking a model
| Slug | Model | Key inputs (from the fal spec) |
|------|-------|--------------------------------|
| \`qwen-audio-3-tts\` | Alibaba Qwen Audio 3 TTS | \`text\`, \`voice\`, \`language\` |
| \`qwen-3-tts-1.7b\` | Qwen 3 TTS, 1.7B | \`text\`, \`voice\`, \`language\`, \`prompt\` (style instruction), \`speaker_voice_embedding_file_url\`, \`reference_text\`, sampling knobs |
| \`qwen-3-tts-0.6b\` | Qwen 3 TTS, 0.6B (smaller, cheaper) | same as 1.7B |
| \`xai-tts-v1\` | xAI TTS | \`text\`, \`voice\`, \`language\`, \`output_format\` |
| \`inworld-tts\` | Inworld TTS | \`text\`, \`voice\`, \`sample_rate_hertz\` |
| \`chatterbox-multilingual\` | Chatterbox Multilingual | \`text\`, \`voice\`, \`custom_audio_language\`, \`exaggeration\`, \`temperature\`, \`cfg_scale\`, \`seed\` |
| \`bytedance-seed-speech-v2\` | ByteDance Seed Speech TTS v2 | \`text\`, \`voice\`, \`language\`, \`voice_instruction\`, \`speed\`, \`volume\`, \`pitch\`, \`output_format\`, \`sample_rate\` |
| \`bytedance-seed-audio-1-tts\` | ByteDance Seed Audio 1.0 (voice generation from text, reference clips or an image) | **\`prompt\`** (the text to speak), \`voice\` (preset or cloned id), \`audio_urls\` (up to 3 reference clips, cited in the prompt as @Audio1…), \`image_url\`, \`speed\`, \`pitch\`, \`volume\`, \`multilingual\`, \`output_format\`, \`sample_rate\` |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week.

## Inputs
\`fal_generate_speech\` sends its \`text\` arg as the fal \`text\` key and \`voice\` as \`voice\`. Every model in this guide uses those names **except Seed Audio 1.0**, which takes the text as \`prompt\`: pass \`extra_params: { prompt: "…" }\` and leave \`text\` unset. Anything else in the table goes in \`extra_params\` (plain values) or \`extra_files\` (file URLs, e.g. Qwen's \`speaker_voice_embedding_file_url\`).

Check a model's spec before assuming it matches: several fal TTS models outside this guide take the text as \`prompt\` instead (Gemini 3.1 Flash TTS, MiniMax Speech) or as \`script\` (VibeVoice). For those, \`text\` is silently dropped; see their own guides.

Voice names and language codes are model-specific. Read the enum in \`src/catalog/fal-specs/<slug>/openapi.json\`.

## Example calls
\`\`\`
fal_generate_speech({
  model: "fal-ai/chatterbox/text-to-speech/multilingual",
  text: "Bonjour. Comment allez-vous ?",
  output: "./fr.mp3",
  extra_params: { custom_audio_language: "fr" }
})

fal_generate_speech({
  model: "fal-ai/qwen-3-tts/text-to-speech/1.7b",
  text: "Welcome back to the show.",
  output: "./intro.wav",
  extra_params: { prompt: "warm, unhurried, late-night radio" }
})

fal_generate_speech({
  model: "fal-ai/bytedance/seed-speech/tts/v2",
  text: "Your order has shipped.",
  output: "./notice.mp3",
  extra_params: { speed: 1.1, voice_instruction: "friendly and brisk" }
})
\`\`\`

## Gotchas
- **\`prompt\` means different things.** On Qwen 3 TTS it is a style instruction next to \`text\`; on Gemini and MiniMax it IS the text. Don't carry an argument pattern across models without checking the spec.
- **Output format knobs differ**: \`output_format\` (xAI, ByteDance), \`sample_rate_hertz\` (Inworld), none at all (Qwen, Chatterbox). The file is saved as the model returns it.
- **Billing is per character** on most of these, per the synced \`cost\` field; long scripts cost proportionally more.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`qwen-audio-3-tts\` | \`alibaba/qwen-audio-3-tts\` |
| \`qwen-3-tts-1.7b\` | \`fal-ai/qwen-3-tts/text-to-speech/1.7b\` |
| \`qwen-3-tts-0.6b\` | \`fal-ai/qwen-3-tts/text-to-speech/0.6b\` |
| \`xai-tts-v1\` | \`xai/tts/v1\` |
| \`inworld-tts\` | \`fal-ai/inworld-tts\` |
| \`chatterbox-multilingual\` | \`fal-ai/chatterbox/text-to-speech/multilingual\` |
| \`bytedance-seed-speech-v2\` | \`fal-ai/bytedance/seed-speech/tts/v2\` |
| \`bytedance-seed-audio-1-tts\` | \`bytedance/seed-audio-1.0\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs (input keys) and llms.txt (pricing, via the catalog). Voice quality is not compared here.
`;

export function registerFalTtsPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_tts_prompt_guide',
    'Grouped guide for fal text-to-speech models without a family guide (Qwen Audio 3 / Qwen 3 TTS, xAI, Inworld, Chatterbox Multilingual, ByteDance Seed Speech): which input keys each takes and how they map onto fal_generate_speech. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_TTS_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const TRANSCRIPTION_GUIDE = `# fal Transcription (ASR) Prompt Guide

## What this guide covers
All seven fal-hosted speech-to-text (ASR) models accessible via \`fal_transcribe\`. ASR models don't take prompts the way generative models do — selection criteria and per-model wire-key quirks dominate. One guide covers all seven because the call shape is uniform: pick a \`model\`, pass an \`audio\` URI, optionally pass model-specific knobs via \`extra_params\`.

## Picking a model

| Model | Word-level timing | Diarization | Cost | Notes |
|-------|-------------------|-------------|------|-------|
| \`fal-ai/elevenlabs/speech-to-text/scribe-v2\` | ✅ words[] with type discriminator | ✅ default on | $0.008 / input minute | **Recommended default for karaoke captions.** Returns \`type: "word" \\| "spacing" \\| "audio_event"\` per token — \`spacing\` entries carry timing, perfect for ASS \`\\k\` gap rendering. |
| \`fal-ai/elevenlabs/speech-to-text\` (Scribe v1) | ✅ words[] | ✅ | $0.03 / minute | Older Scribe. Same shape as v2; v2 is preferred unless you need v1 specifically. |
| \`fal-ai/whisper\` | ⚠️ chunk-level only (segments[]) | ✅ separate \`diarization_segments\` | Compute-time billed | Industry standard. Use when scribe isn't available or the transcript-only path is fine. |
| \`fal-ai/wizper\` | ⚠️ chunk-level only (segments[]) | ❌ | Compute-time billed | Whisper v3 Large, fal-optimized — ~2x speed, same WER. Choose over \`whisper\` when speed matters. |
| \`fal-ai/speech-to-text\` | ❌ no timing | ❌ | $0.0008 / second | NVIDIA Canary backend — text-only. Use only when you don't need timing. |
| \`fal-ai/speech-to-text/turbo\` | ❌ no timing | ❌ | $0.0008 / second | Faster Canary variant — same shape. |
| \`fal-ai/cohere-transcribe\` | ❌ (the \`timings\` field is perf metrics, not word timing) | ❌ | ~$0.00007 / second | Business-audio focus. Use when transcript text quality matters more than timestamps. |

**Quick picks:**
- Karaoke captions (need word timing) → **scribe-v2**.
- Generic subtitles (segment timing OK) → **wizper**.
- Multi-speaker meeting transcript (diarization) → **scribe-v2** (built-in) or **whisper** (\`diarize: true\` in extra_params).
- Cheapest transcript-only path → **speech-to-text/turbo**.
- Highest text quality on conversational audio → **cohere-transcribe**.

## Wire-key quirks (LLM-trap section)

The transport's only structural arg is \`audio\` (which maps to fal's \`audio_url\`). Everything else flows through \`extra_params\` — and the wire keys differ across models:

| Knob | Scribe v1/v2 | Whisper | Wizper | Cohere | Notes |
|------|--------------|---------|--------|--------|-------|
| Language | \`language_code\` | \`language\` | \`language\` | \`language\` | ISO 639-1 codes. Pass via \`extra_params\` with the correct key per model. |
| Diarization | \`diarize\` (default \`true\`) | \`diarize\` (default \`false\`) | not supported | not supported | Whisper also accepts \`num_speakers\` hint. |
| Keyterms (boost domain words) | \`keyterms: string[]\` (+30% cost) | not supported | not supported | not supported | Scribe-only feature. |
| Tag audio events | \`tag_audio_events\` (default \`true\`) | not supported | not supported | not supported | Scribe emits \`type: "audio_event"\` for laughter / noise — useful for karaoke gaps. |
| Initial prompt | not used | \`prompt\` | not used | not used | Whisper's biasing prompt. |
| Chunk granularity | not used | \`chunk_level: "segment" \\| "word"\` | \`chunk_level: "segment" \\| "word"\` | not used | Set to \`"word"\` if you want word-level chunks (still less rich than scribe's words[]). |
| Translation mode | not used | \`task: "translate"\` | \`task: "translate"\` | not used | Translates non-English audio to English text. |

**Bug to avoid:** passing \`language: "en"\` to scribe-v2 silently fails (key mismatch). Use \`language_code: "en"\`.

## Input requirements

- **audio** (required) — public HTTPS URL passes through; \`gs://\`, \`s3://\`, and local paths upload to fal storage automatically.
- All models require \`audio_url\` on the wire — \`fal_transcribe\` maps \`audio\` to \`audio_url\` for you.
- Audio formats: mp3, wav, flac, m4a, ogg, opus, mp4 (audio track) all work for every model. Whisper handles up to 25MB raw upload; longer clips need pre-segmentation or a public HTTPS URL.

## Prompt structure
ASR models don't accept prose prompts. The "prompt" Whisper exposes (via \`extra_params.prompt\`) is a domain-bias hint, not instruction text — pass a few sentences of in-domain text to nudge Whisper toward consistent terminology. Example: \`extra_params: { prompt: "Bakers Assistant, dough hydration, autolyse, levain" }\` for sourdough-content audio.

For scribe-v2, the equivalent is \`extra_params: { keyterms: ["Bakers Assistant", "autolyse"] }\`.

## Example calls

**Karaoke captions (scribe-v2 word timing):**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/speech-to-text/scribe-v2",
  "audio": "gs://doughmetrics-content/voiceover.mp3",
  "extra_params": { "language_code": "en", "tag_audio_events": true }
}
\`\`\`

**Standard subtitles (wizper segments):**
\`\`\`json
{
  "model": "fal-ai/wizper",
  "audio": "gs://doughmetrics-content/voiceover.mp3",
  "extra_params": { "language": "en", "chunk_level": "segment" }
}
\`\`\`

**Diarized meeting (whisper):**
\`\`\`json
{
  "model": "fal-ai/whisper",
  "audio": "https://example.com/meeting.mp3",
  "extra_params": { "language": "en", "diarize": true, "num_speakers": 3 }
}
\`\`\`

**Domain-biased transcription (whisper with prompt):**
\`\`\`json
{
  "model": "fal-ai/whisper",
  "audio": "./podcast.mp3",
  "extra_params": { "prompt": "sourdough, hydration, autolyse, levain, bulk fermentation" }
}
\`\`\`

## Response shape

All models return the same normalized envelope from \`fal_transcribe\`:

\`\`\`json
{
  "model": "fal-ai/...",
  "text": "full transcript",
  "language": "en" | null,
  "words": [
    { "text": "hello", "type": "word", "start": 0.12, "end": 0.41, "speaker_id": "S1" },
    { "text": " ", "type": "spacing", "start": 0.41, "end": 0.45 }
  ],
  "segments": [
    { "text": "Hello world.", "start": 0.0, "end": 1.2, "speaker": null }
  ],
  "raw": { /* full unmodified fal response */ }
}
\`\`\`

- \`words[]\` is populated **only by scribe v1/v2**. Empty array on every other model.
- \`segments[]\` is populated **only by whisper / wizper** (from their \`chunks[]\`). Empty for scribe (you can derive segments by speaker grouping over \`words[]\` if needed) and for the text-only models.
- \`language\` is best-effort. Whisper / Wizper populate from their inferred-language list; scribe from \`language_code\`; the text-only models leave it null.
- \`raw\` is always the unmodified upstream payload — reach for it when you need a model-specific field that isn't in the normalized envelope.

## Access routes
All seven models route through \`fal_transcribe\` with \`FAL_KEY\` in env. Catalog discovery: call \`model_catalog\` with \`capability: "transcription"\`.

| Model | fal endpoint id |
|-------|-----------------|
| Scribe v2 | \`fal-ai/elevenlabs/speech-to-text/scribe-v2\` |
| Scribe v1 | \`fal-ai/elevenlabs/speech-to-text\` |
| Whisper | \`fal-ai/whisper\` |
| Wizper | \`fal-ai/wizper\` |
| fal STT | \`fal-ai/speech-to-text\` |
| fal STT Turbo | \`fal-ai/speech-to-text/turbo\` |
| Cohere Transcribe | \`fal-ai/cohere-transcribe\` |

## Last verified
2026-04-25 — bake-off picked scribe-v2 as the karaoke-caption default for the doughmetrics pipeline.

## Official references
- Scribe v2: https://fal.ai/models/fal-ai/elevenlabs/speech-to-text/scribe-v2
- Whisper: https://fal.ai/models/fal-ai/whisper
- Wizper: https://fal.ai/models/fal-ai/wizper
- ElevenLabs Scribe upstream: https://elevenlabs.io/docs/capabilities/speech-to-text
- Whisper paper: https://arxiv.org/abs/2212.04356
`;

export function registerTranscriptionPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'transcription_prompt_guide',
    'Reference guide for fal-hosted speech-to-text (ASR) models — covers all seven fal STT routes, model selection criteria, per-model wire-key quirks (scribe expects language_code, whisper expects language, etc.), normalized response shape, and example calls. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: TRANSCRIPTION_GUIDE }] }),
  );
}

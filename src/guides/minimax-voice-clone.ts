import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MINIMAX_VOICE_CLONE_GUIDE = `# MiniMax Voice Clone Prompt Guide

## What this model is best for
Cloning a custom voice from a short audio sample and returning a \`custom_voice_id\` that can be reused with MiniMax TTS endpoints for subsequent generations. Ideal for brand voices, character voices, or author narration continuity.

## Known strengths
- **Single-call voice cloning** — no training, no fine-tuning flow. Provide a sample, get back a voice id.
- **Reusable output**: the returned \`custom_voice_id\` works with MiniMax's speech-02-hd / speech-02-turbo / speech-01-hd / speech-01-turbo endpoints. The voice is retained automatically when used with a TTS endpoint within 7 days.
- **Optional preview**: pass \`text\` to get a sample audio back along with the voice id — useful for confirming the clone captured the right character before committing to production use.
- **\`noise_reduction\`** and **\`need_volume_normalization\`** flags clean up noisy sample inputs.

## Known weaknesses / quirks
- **Sample audio MUST be at least 10 seconds.** Shorter samples fail.
- **Voice expires after 7 days of non-use.** To retain permanently, call any MiniMax TTS endpoint with the voice id at least once within the 7-day window.
- **Each clone request costs $1.50 flat** (preview text adds $0.30 per 1000 chars). Expensive relative to other Phase 5 tools — validate the sample before calling.
- **Returns either audio OR voice_id OR both** depending on whether \`text\` is set. artificer's \`fal_generate_speech\` tool handles all three cases: it skips the output-file write when no audio is returned.

## Input requirements
- **reference_audio** (required) — URL or local path to the voice sample. Passed via the tool's structural \`reference_audio\` arg, which maps to fal's \`audio_url\` and supports HTTPS passthrough / gs:// / s3:// / local upload.
- **text** (optional) — preview script. Default: "Hello, this is a preview of your cloned voice! I hope you like it!". Pass via the tool's \`text\` arg.
- **noise_reduction** (optional, boolean) — default false. Via \`extra_params\`.
- **need_volume_normalization** (optional, boolean) — default false. Via \`extra_params\`.
- **accuracy** (optional) — float 0-1, text validation threshold. Via \`extra_params\`.
- **model** (optional) — which preview TTS model to use: speech-02-hd (default), speech-02-turbo, speech-01-hd, speech-01-turbo. Via \`extra_params.model\` (inner key name) — NOTE: this is the inner fal field, distinct from the outer fal_generate_speech \`model\` arg.

Source: \`src/catalog/fal-specs/minimax-voice-clone/llms.md\`.

## Prompt structure
There is no creative prompt here — the \`text\` is just a preview script. Keep it short and neutral (15-30 words) so you can judge tone quickly without paying for a long preview.

## Example

**Clone + preview:**
\`\`\`json
{
  "model": "fal-ai/minimax/voice-clone",
  "reference_audio": "gs://doughmetrics-content/voice-samples/jenn-baseline.wav",
  "text": "Hello, this is Jenn, and today we're going to talk about real baker math.",
  "output": "./preview.mp3",
  "extra_params": { "noise_reduction": true, "need_volume_normalization": true, "model": "speech-02-hd" }
}
\`\`\`

Returns (example):
\`\`\`json
{
  "model": "fal-ai/minimax/voice-clone",
  "audio": { "uri": "./preview.mp3", "bytes": 89234, "mime": "audio/mpeg" },
  "custom_voice_id": "voice-abc-123",
  "source_url": "https://fal.media/files/.../speech.mp3"
}
\`\`\`

**Clone only, no preview** (cheapest path — $1.50, no preview audio):
\`\`\`json
{
  "model": "fal-ai/minimax/voice-clone",
  "reference_audio": "gs://doughmetrics-content/voice-samples/jenn-baseline.wav",
  "output": "./unused.mp3"
}
\`\`\`

Capture \`custom_voice_id\` from the response and use it in subsequent \`fal_generate_speech\` calls with a MiniMax TTS model.

## Using the cloned voice downstream

\`\`\`json
{
  "model": "fal-ai/minimax/speech-2.8-hd",
  "output": "./jenn_intro.mp3",
  "extra_params": {
    "prompt": "Welcome back to the show.",
    "voice_setting": { "voice_id": "voice-abc-123" },
    "output_format": "url"
  }
}
\`\`\`

(Voice-setting field names may vary — check the MiniMax TTS upstream docs for the exact structure.)

## Access routes

| Provider | Tool                    | Model ID                      | Cost                                                                            | Notes |
|----------|-------------------------|-------------------------------|---------------------------------------------------------------------------------|-------|
| fal      | \`fal_generate_speech\` | \`fal-ai/minimax/voice-clone\`| $1.50 per clone request; $0.30 per 1000 preview-text characters if preview used | 10s minimum sample. 7-day voice retention unless re-used. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/minimax-voice-clone/llms.md\`.

## Official references
- Model page: https://fal.ai/models/fal-ai/minimax/voice-clone
`;

export function registerMinimaxVoiceClonePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'minimax_voice_clone_prompt_guide',
    'Prompt guidance for MiniMax Voice Clone on fal. Clone a voice from a 10s+ audio sample and get back a custom_voice_id reusable with MiniMax TTS. Covers sample requirements, preview-text option, 7-day retention rule, and the downstream flow for using the cloned voice. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MINIMAX_VOICE_CLONE_GUIDE }] }),
  );
}

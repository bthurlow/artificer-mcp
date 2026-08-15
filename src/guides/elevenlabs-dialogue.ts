import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const ELEVENLABS_DIALOGUE_GUIDE = `# ElevenLabs Dialogue v3 (Text-to-Dialogue, Multi-Speaker) Prompt Guide

## What this model is best for
Generating multi-speaker dialogue clips in a single call — two or more named speakers with turn-taking, natural interruptions, and emotional range. Use this when you need a conversation rendered as one audio file rather than stitching separate TTS calls.

## Known strengths
- **Native multi-speaker**: each dialogue block declares its own voice, and the model handles pacing between speakers.
- **Inline audio tags work here** (unlike straight ElevenLabs TTS): \`[applause]\`, \`[gulps]\`, \`[excited]\`, \`[laughs]\`, \`[whispers]\`, \`[strong canadian accent]\` etc. are parsed inside each dialogue block's text.
- **use_speaker_boost** improves voice similarity (at slight latency cost) — helpful when the listener needs to clearly distinguish speakers.
- Same voice library as Eleven TTS (Rachel, Aria, Charlotte, Charlie, etc.) — voice casts are consistent across artificer's ElevenLabs surface.

## Known weaknesses / quirks
- **The tool-level \`text\` arg does NOT apply here.** Dialogue v3 takes a structured \`inputs\` array of \`{ text, voice }\` blocks as the required input. With \`fal_generate_speech\` you pass that array via \`extra_params.inputs\`. The structural \`text\` / \`voice\` args on the tool are not used.
- **Stability is quantized** to 0.0 / 0.5 / 1.0 — any other value rounds to the nearest. Don't try to fine-tune stability below this granularity.
- **Dialogue length adds up fast.** Each block is a TTS generation; a 10-turn dialogue costs ~10x a single-speaker clip of the same total duration.

## Input requirements
- **inputs** (required) — array of \`{ text, voice }\` blocks. Each text may include inline tags. Each voice is a prebuilt voice name string. Passed via \`extra_params.inputs\`.
- **stability** (optional) — 0.0 / 0.5 / 1.0 only (others round). Set via \`extra_params\`.
- **use_speaker_boost** (optional, boolean) — passed via \`extra_params\`.
- **language_code** (optional) — ISO 639-1. Errors if not supported.
- **seed** (optional) — integer for reproducibility.

Source: \`src/catalog/fal-specs/eleven-dialogue-v3/llms.md\`.

## Prompt structure
Each \`inputs\` block is a turn. Structure them like a script:

1. **One speaker per block.** Don't mix speakers inside a single text field.
2. **Inline tags at the start** of a block set the entire turn's tone: \`[excited] Hello everyone!\`
3. **Audio cues** like \`[applause]\`, \`[gulps]\`, \`[pause]\` render as real sounds and work well between dialogue.
4. **Accent / style tags** like \`[strong canadian accent]\` or \`[whispers]\` take effect for the rest of the block.
5. **Keep blocks short.** ~1-2 sentences per block produces the most natural turn-taking.

## Example prompts

**Two-person interview opener:**
\`\`\`json
{
  "model": "fal-ai/elevenlabs/text-to-dialogue/eleven-v3",
  "output": "./interview.mp3",
  "extra_params": {
    "inputs": [
      { "text": "[applause] Thank you all for coming tonight! Today we have a very special guest with us.", "voice": "Aria" },
      { "text": "[excited] Hello everyone! Thank you all for having me tonight on this special day.", "voice": "Charlotte" },
      { "text": "So tell us - what got you into sourdough in the first place?", "voice": "Aria" },
      { "text": "[laughs] It started as a pandemic hobby and, well... here we are three years later.", "voice": "Charlotte" }
    ],
    "stability": 0.5,
    "use_speaker_boost": true
  }
}
\`\`\`

**Short podcast-style banter (2 blocks):**
\`\`\`json
{
  "inputs": [
    { "text": "[whispers] Is the mic on?", "voice": "Will" },
    { "text": "[laughs] It's been on the whole time, Brian.", "voice": "Jessica" }
  ]
}
\`\`\`

## Access routes

| Provider | Tool                    | Model ID                                          | Cost                       | Notes |
|----------|-------------------------|---------------------------------------------------|----------------------------|-------|
| fal      | \`fal_generate_speech\` | \`fal-ai/elevenlabs/text-to-dialogue/eleven-v3\`  | $0.10 per 1000 characters  | Same voice library as Eleven v3 TTS. Input shape is \`inputs[]\`, NOT the tool-level \`text\` arg. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/eleven-dialogue-v3/llms.md\`. Inline tag list validated against fal's example payload.

## Official references
- Model page: https://fal.ai/models/fal-ai/elevenlabs/text-to-dialogue/eleven-v3
- ElevenLabs upstream dialogue docs: https://elevenlabs.io/docs
`;

export function registerElevenlabsDialoguePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'elevenlabs_dialogue_prompt_guide',
    'Prompt guidance for ElevenLabs Dialogue v3 (multi-speaker text-to-dialogue) on fal. Covers the inputs[] array structure, inline audio tags, use_speaker_boost, and the gotcha that the tool-level text arg is not used for this model. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: ELEVENLABS_DIALOGUE_GUIDE }] }),
  );
}

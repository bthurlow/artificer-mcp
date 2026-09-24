import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_DIALOGUE_GUIDE = `# fal Multi-Speaker Dialogue (grouped) — Prompt Guide

## What's in this guide
Multi-speaker script-to-speech on fal without a family guide: VibeVoice 7B. Runs through \`fal_generate_speech\`.

Covered elsewhere: ElevenLabs dialogue (\`elevenlabs_dialogue_prompt_guide\`), Dia (\`dia_dialogue_prompt_guide\`), single-voice TTS (\`fal_tts_prompt_guide\`).

## Picking a model
| Slug | Model | Key inputs (from the fal spec) |
|------|-------|--------------------------------|
| \`vibevoice-7b\` | Microsoft VibeVoice 7B | \`script\` (required), \`speakers\` (required), \`cfg_scale\` (default 1.3), \`seed\` |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week.

## Inputs
VibeVoice takes \`script\` and \`speakers\`, not \`text\`, so pass both in \`extra_params\` and leave \`text\` unset.

- **\`script\`**: the dialogue. The spec says it "can be formatted with 'Speaker X:' prefixes for multi-speaker dialogues".
- **\`speakers\`**: a list, one object per speaker, each with either:
  - \`preset\`: one of the model's voices, e.g. \`"Alice [EN]"\`, \`"Carter [EN]"\`, \`"Frank [EN]"\`, \`"Maya [EN]"\`, \`"Bowen [ZH]"\`, \`"Xinran [ZH]"\`. Some presets include background music, marked \`(Background Music)\` in their names. The full enum is in \`src/catalog/fal-specs/vibevoice-7b/openapi.json\`.
  - \`audio_url\`: a voice sample to clone. If set, \`preset\` is ignored.

## Example call
\`\`\`
fal_generate_speech({
  model: "fal-ai/vibevoice/7b",
  output: "./episode.wav",
  extra_params: {
    script: "Speaker 1: Welcome back to the show.\\nSpeaker 2: Thanks, glad to be here.",
    speakers: [{ preset: "Carter [EN]" }, { preset: "Maya [EN]" }]
  }
})
\`\`\`
To clone a voice, give that speaker an \`audio_url\` instead of a \`preset\`. \`extra_params\` values are not uploaded for you, so use an \`https\` URL (upload a local file first with \`fal_upload\`).

## Gotchas
- **Presets with "(Background Music)"** add music under the voice; pick a plain preset for clean dialogue.
- The spec doesn't say how \`Speaker N:\` labels map onto the \`speakers\` list. Order is the natural reading but is **unverified**, so check the first output.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`vibevoice-7b\` | \`fal-ai/vibevoice/7b\` |

## Last verified
2026-09-24 against fal's live OpenAPI spec and llms.txt.
`;

export function registerFalDialoguePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_dialogue_prompt_guide',
    'Grouped guide for fal multi-speaker dialogue models without a family guide (VibeVoice 7B): script and speakers inputs, voice presets vs cloned samples, via fal_generate_speech. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_DIALOGUE_GUIDE }] }),
  );
}

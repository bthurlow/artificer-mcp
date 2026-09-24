import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_SFX_GUIDE = `# fal Sound Effects (grouped) — Prompt Guide

## What's in this guide
Text-to-sound-effect models on fal: Mirelo SFX 1.6, Stable Audio 3 Small SFX and Sonilo V1.1 SFX. All run through \`fal_generate_music\`.

Covered elsewhere: ElevenLabs SFX (\`elevenlabs_sfx_prompt_guide\`), CassetteAI SFX (\`cassette_sfx_prompt_guide\`).

## Picking a model
| Slug | Model | Key inputs (from the fal spec) |
|------|-------|--------------------------------|
| \`mirelo-sfx-1.6\` | Mirelo SFX 1.6. Also makes seamlessly loopable ambience tiles. | \`text_prompt\` (required), \`duration\` (default 10s), \`ambience\`, \`double_output\`, \`num_samples\` (default **2**), \`seed\`, \`upload_audio_format\` (wav/mp3/aac/flac) |
| \`stable-audio-3-sfx-small\` | Stable Audio 3 Small, SFX checkpoint | \`prompt\`, \`duration\` (default 30s), \`negative_prompt\`, \`seed\`, \`num_inference_steps\`, \`guidance_scale\`, \`output_format\` (mp3/wav/flac/ogg/opus/m4a/aac), \`bitrate\` |
| \`sonilo-text-to-sfx\` | Sonilo V1.1 sound effects | \`prompt\`, \`duration\` (0.5–180s, default 8), \`audio_format\` (default **aac**; wav/mp3/flac) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week.

## Inputs
\`fal_generate_music\`'s \`prompt\` maps to the fal \`prompt\` key. That works for Stable Audio 3 and Sonilo.

**Mirelo is different: its text field is \`text_prompt\`.** Pass it in \`extra_params\` and leave \`prompt\` unset; Mirelo ignores \`prompt\` and fails without \`text_prompt\`.

Each model names its output-format knob differently: \`upload_audio_format\` (Mirelo), \`output_format\` (Stable Audio 3), \`audio_format\` (Sonilo). The file is saved as the model returns it, so match your output extension to the format you ask for.

## Example calls
\`\`\`
fal_generate_music({
  model: "mirelo-ai/sfx1.6/text-to-audio",
  output: "./rain-loop.wav",
  extra_params: { text_prompt: "steady rain on a tin roof", ambience: true, duration: 20, num_samples: 1 }
})

fal_generate_music({
  model: "fal-ai/stable-audio-3/small/sfx/text-to-audio",
  prompt: "heavy wooden door slamming in a stone hallway, short reverb tail",
  output: "./door.wav",
  extra_params: { duration: 3, output_format: "wav" }
})

fal_generate_music({
  model: "sonilo/v1.1/text-to-sound-effects",
  prompt: "crowded subway platform, train doors closing, distant announcement",
  output: "./subway.mp3",
  extra_params: { duration: 12, audio_format: "mp3" }
})
\`\`\`

## Gotchas
- **Mirelo generates 2 samples by default** (\`num_samples: 2\`); set it to 1 if you only want one.
- **Mirelo ambience mode** needs a minimum 1s duration (0.1s otherwise); \`double_output\` only applies with \`ambience: true\`.
- **Sonilo defaults to AAC**; a \`.wav\` output path would hold AAC bytes unless you set \`audio_format: "wav"\`.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`mirelo-sfx-1.6\` | \`mirelo-ai/sfx1.6/text-to-audio\` |
| \`stable-audio-3-sfx-small\` | \`fal-ai/stable-audio-3/small/sfx/text-to-audio\` |
| \`sonilo-text-to-sfx\` | \`sonilo/v1.1/text-to-sound-effects\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Not listened to side by side.
`;

export function registerFalSfxPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_sfx_prompt_guide',
    "Grouped guide for fal text-to-sound-effect models (Mirelo SFX 1.6 incl. loopable ambience, Stable Audio 3 Small SFX, Sonilo V1.1 SFX): each model's inputs and output-format knob, and Mirelo's `text_prompt` quirk. No API call — pure reference.",
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_SFX_GUIDE }] }),
  );
}

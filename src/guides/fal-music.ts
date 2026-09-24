import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_MUSIC_GUIDE = `# fal Music (grouped) — Prompt Guide

## What's in this guide
fal music models without a family guide of their own. Today that is Sonilo V1.1 text-to-music.

Covered elsewhere: Lyria (\`gemini_lyria_prompt_guide\`), ElevenLabs Music (\`elevenlabs_music_prompt_guide\`), Stable Audio (\`stable_audio_prompt_guide\`), MiniMax Music (\`minimax_music_prompt_guide\`), sound effects (\`fal_sfx_prompt_guide\`).

## Picking a model
| Slug | Model | Key inputs (from the fal spec) |
|------|-------|--------------------------------|
| \`sonilo-text-to-music\` | Sonilo V1.1 text-to-music. fal describes it as licensed, commercial-use-safe music with control over style, mood, instrumentation and exact duration. | \`prompt\`, \`duration\` (seconds, default 90, max 600), \`num_samples\` (default 1) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week. Sonilo bills per second of output **per sample**, so \`num_samples: 3\` costs three times as much.

## Inputs
\`fal_generate_music\`'s \`prompt\` maps to Sonilo's \`prompt\`. Pass \`duration\` and \`num_samples\` in \`extra_params\`.

fal's documentation does not say whether Sonilo produces vocals, so the catalog leaves its \`vocals\` field unset. Treat it as unverified until tested.

## Example call
\`\`\`
fal_generate_music({
  model: "sonilo/v1.1/text-to-music",
  prompt: "Warm lo-fi hip hop, dusty vinyl drums, Rhodes chords, slow and relaxed",
  output: "./bed.wav",
  extra_params: { duration: 60 }
})
\`\`\`

## Gotchas
- **\`duration\` drives the bill**: it sets the output length and the billed seconds (rounded up per sample).
- **Several samples**: with \`num_samples\` > 1, check the result; the transport saves the primary \`audio\` output.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`sonilo-text-to-music\` | \`sonilo/v1.1/text-to-music\` |

## Last verified
2026-09-24 against fal's live OpenAPI spec and llms.txt. Not listened to side by side.
`;

export function registerFalMusicPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_music_prompt_guide',
    'Grouped guide for fal music models without a family guide (Sonilo V1.1 text-to-music): inputs, billing per second per sample, and how they map onto fal_generate_music. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_MUSIC_GUIDE }] }),
  );
}

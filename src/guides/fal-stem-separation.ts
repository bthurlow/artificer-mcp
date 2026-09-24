import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_STEM_SEPARATION_GUIDE = `# Audio Stem Separation — Prompt Guide

## What's in this guide

This guide covers fal.ai's audio stem separation models for decomposing mixed audio into individual instrumental and vocal stems. Use this when you need to extract drums, bass, vocals, or other instruments from a recording for remixing, editing, or analysis.

## Picking a model

| Slug | Best for | Key inputs |
|------|----------|-----------|
| demucs-stem-separation | Professional stem separation (vocals, drums, bass, piano, guitar, other) | audio, output_dir, stems |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week.

## Inputs

All stem separation models require:

1. **audio** (required): Path or URL to the audio file to separate. Public HTTPS URLs pass through; local paths are uploaded to fal storage.
2. **output_dir** (required): Directory (local path or storage URI like gs://bucket/stems) where stem files are written.

Optional:
- **basename**: File name prefix for the stems (default: input file name without extension). Stems are saved as \`<basename>-<stem>.<ext>\`
- **stems**: Array of stem names to extract (e.g., \`["vocals"]\` for isolated vocals only). Omit for all available stems. Demucs stems: vocals, drums, bass, other, guitar, piano.
- **extra_params**: Model-specific knobs, e.g., \`{model: "htdemucs_ft", output_format: "wav"}\`. Demucs model variants: \`htdemucs\`, \`htdemucs_ft\`, \`htdemucs_6s\`, \`hdemucs_mmi\`, \`mdx\`, \`mdx_extra\`, \`mdx_q\`, \`mdx_extra_q\`.

## Stem output

Demucs returns a JSON map from stem name to file path:

\`\`\`json
{
  "vocals": "./stems/song-vocals.mp3",
  "drums": "./stems/song-drums.mp3",
  "bass": "./stems/song-bass.mp3",
  "piano": "./stems/song-piano.mp3",
  "guitar": "./stems/song-guitar.mp3",
  "other": "./stems/song-other.mp3"
}
\`\`\`

**Note:** Piano and guitar stems are only available with the \`htdemucs_6s\` model variant.

## Example calls

**Basic stem separation:**
\`\`\`javascript
fal_separate_audio({
  model: "fal-ai/demucs",
  audio: "https://example.com/song.mp3",
  output_dir: "./stems"
})
\`\`\`

**Extract vocals only with WAV format:**
\`\`\`javascript
fal_separate_audio({
  model: "fal-ai/demucs",
  audio: "./song.mp3",
  output_dir: "./stems",
  basename: "song",
  stems: ["vocals"],
  extra_params: {
    output_format: "wav"
  }
})
\`\`\`

**Use htdemucs_6s for guitar/piano separation:**
\`\`\`javascript
fal_separate_audio({
  model: "fal-ai/demucs",
  audio: "./live-recording.wav",
  output_dir: "./stems",
  stems: ["vocals", "drums", "guitar", "piano"],
  extra_params: {
    model: "htdemucs_6s",
    output_format: "wav"
  }
})
\`\`\`

**Extract all stems for remix:**
\`\`\`javascript
const result = await fal_separate_audio({
  model: "fal-ai/demucs",
  audio: "./song.mp3",
  output_dir: "./remix",
  extra_params: {
    output_format: "wav"
  }
});

// result is a map of stem name → file path
// {
//   vocals: "./remix/song-vocals.wav",
//   drums: "./remix/song-drums.wav",
//   bass: "./remix/song-bass.wav",
//   other: "./remix/song-other.wav"
// }
\`\`\`

## Gotchas

- **Duet/overlapping vocals limitation**: Demucs does not handle duets or two singers performing simultaneously. It will blend overlapping vocals into a single stem rather than separating them. For multi-vocalist material, expect lower vocal separation quality.
- **Audio quality**: Input audio quality affects separation quality. Low-bitrate or heavily processed audio produces lower-fidelity stems.
- **Duration and cost**: Pricing is $0.0007 per second of input. A 5-minute song costs ~$0.21. Very long recordings (e.g., 1-hour podcast) cost proportionally more.
- **Stem assignment**: with the 4-stem networks, anything that isn't vocals, drums or bass lands in \`other\`. Listen to the stems before relying on them.
- **Model variants**: The \`htdemucs_6s\` variant supports 6 stems including guitar/piano. Other variants output 4 stems (vocals, drums, bass, other).

## Access routes

| Slug | fal endpoint |
|------|-------------|
| demucs-stem-separation | fal-ai/demucs |

## Last verified

2026-09-24 against fal's live OpenAPI + vendor docs. Demucs duet limitation documented in TODO #21. Stem output structure confirmed from OpenAPI schema.
`;

export function registerFalStemSeparationPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_stem_separation_prompt_guide',
    'Grouped guide for audio stem separation covering output stem types, quality vs speed tradeoffs, and known limitations (e.g. Demucs duet handling from TODO #21). No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_STEM_SEPARATION_GUIDE }] }),
  );
}

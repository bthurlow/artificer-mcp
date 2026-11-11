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

- **Duets: use MVSep, not Demucs.** Demucs puts every singer in one \`vocals\` stem, overlapping lines included. For one stem per singer (lip-sync each singer separately), see "Duets" below.
- **Audio quality**: Input audio quality affects separation quality. Low-bitrate or heavily processed audio produces lower-fidelity stems.
- **Duration and cost**: Pricing is $0.0007 per second of input. A 5-minute song costs ~$0.21. Very long recordings (e.g., 1-hour podcast) cost proportionally more.
- **Stem assignment**: with the 4-stem networks, anything that isn't vocals, drums or bass lands in \`other\`. Listen to the stems before relying on them.
- **Model variants**: The \`htdemucs_6s\` variant supports 6 stems including guitar/piano. Other variants output 4 stems (vocals, drums, bass, other).

## Duets: one stem per singer (MVSep)

\`mvsep_separate_audio\` runs MVSep's Male/Female separation (sep_type 57) and writes \`<basename>-male\` and \`<basename>-female\` stems. Needs \`MVSEP_API_TOKEN\` (mvsep.com/user-api; keys from before 6 October 2026 were reset after MVSep's security incident).

\`\`\`
mvsep_separate_audio({ audio: "./master.wav", output_dir: "./stems" })
// → { hash, stems: { male: "./stems/master-male.wav", female: "./stems/master-female.wav" } }

audio_gate({ input: "./stems/master-male.wav", output: "./stems/male-gated.wav",
             windows: [[52.1, 66.4], [112.0, 124.8], [173.6, 186.6]] })
\`\`\`

- **Send the full master**, with the defaults: MelRoformer 2025.01 (\`add_opt1\` 2) and "extract vocals first with BS Roformer" (\`add_opt2\` 1). On a male/female duet (btmusic, 2026-11-11) that gave 0 ms offset against the master, wrong-singer leakage of −29 to −61 dB in solo sections, and overlapping lines split one voice per stem. Feeding a Demucs vocal stem in instead was not better overall.
- **Gate every stem** to its singer's lines with \`audio_gate\` before lip-sync. The separator can still route a whole line to the wrong stem at full level (there, the female singer's last verse line landed in the male stem), and lip-sync models mouth whatever is in their audio. Gating also leaves true silence between lines.
- **Same-gender duets** are not what this model separates; it splits by voice type.
- **Free account limits:** 50 jobs a day, 10 minutes and 100 MB per file, one job at a time; WAV output needs an account. Jobs are never published to MVSep's demo page (\`is_demo\` is always 0).
- **Timeouts:** the job's hash goes out as a progress message. A timed-out job is cancelled (refunded if it had not started); pass \`hash\` to collect a job that finished.

## Access routes

| Slug | Route |
|------|-------|
| demucs-stem-separation | fal: fal-ai/demucs (\`fal_separate_audio\`) |
| mvsep-male-female | MVSep: sep_type 57 (\`mvsep_separate_audio\`) |

## Last verified

2026-09-24 against fal's live OpenAPI + vendor docs. Demucs duet limitation documented in TODO #21. Stem output structure confirmed from OpenAPI schema. MVSep section 2026-11-11 from mvsep.com/en/full_api and the btmusic duet test (TODO #35).
`;

export function registerFalStemSeparationPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_stem_separation_prompt_guide',
    'Grouped guide for audio stem separation covering output stem types, quality vs speed tradeoffs, and known limitations, and duets: one stem per singer via MVSep (mvsep_separate_audio) gated with audio_gate. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_STEM_SEPARATION_GUIDE }] }),
  );
}

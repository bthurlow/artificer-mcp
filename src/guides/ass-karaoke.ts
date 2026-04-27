import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const ASS_KARAOKE_GUIDE = `# ASS Karaoke Captions Prompt Guide

## What this tool builds
\`build_ass_karaoke\` generates an ASS subtitle file with per-word karaoke highlighting from word-level timestamps. Each phrase is one Dialogue event; words "fill in" with the accent color as the speaker says them. Pairs with \`fal_transcribe\` (input) and \`video_add_subtitles\` (downstream burn-in) for a complete karaoke pipeline.

## When to use this vs. plain SRT
Use ASS karaoke when:
- The audio source is a TTS or talking-head voiceover (single continuous track) and you want word-level highlight tied to lip movement.
- The downstream renderer is libass-aware (ffmpeg's \`subtitles\` filter, mpv, VLC).

Use plain SRT when:
- You only have segment-level timing (Whisper / Wizper chunks).
- The renderer doesn't support ASS (rare).
- You want maximum format portability.

## Why karaoke timing wants forced-alignment-grade ASR
Whisper-style ASR chains word boundaries — each word's \`end\` equals the next word's \`start\`. Used as karaoke timing this reads as **rushed**: highlights chase each other tightly with no breathing room, which doesn't match real lip movement.

Forced-alignment-grade ASR (Scribe v2) leaves real acoustic gaps between words — the \`end\` of "the" might be 0.219s but the next word "toothpick" starts at 0.319s, a real 100ms gap. Karaoke highlights respect that gap and the result feels naturally synced to speech.

**Recommended ASR for karaoke:** \`fal-ai/elevenlabs/speech-to-text/scribe-v2\` (call via \`fal_transcribe\`). See \`transcription_prompt_guide\` for ASR-side details.

## ASS color literal format

ASS color literals use \`&HAABBGGRR\` — alpha-BGR with the **alpha inverted**:
- \`00\` = fully opaque
- \`FF\` = fully transparent

To convert from a hex web color \`#RRGGBB\` to ASS \`&H00BBGGRR\`:
1. Reverse the byte order: \`#b0445b\` (hex) → \`5B 44 B0\` (BGR).
2. Prepend opaque alpha: \`&H005B44B0\`.

Common picks:
- Opaque white: \`&H00FFFFFF\` (default unhighlighted)
- Brand accent (this repo: #b0445b): \`&H005B44B0\`
- Opaque black outline: \`&H00000000\` (default outline)
- Yellow karaoke highlight: \`&H0000FFFF\`
- Cyan karaoke highlight: \`&H00FFFF00\`

## Karaoke override semantics

The writer emits libass \`\\k\` (instant flip) tags — at the karaoke offset, the word color **flips instantly** from \`SecondaryColour\` (unhighlighted) to \`PrimaryColour\` (highlighted) and stays through event end. Trailing-fill aesthetic.

Two related override tags exist but are NOT used here:
- \`\\kf\` — sweeps the highlight gradually across the word (fill effect).
- \`\\ko\` — outlines the highlight before the fill.

If you want a sweep instead of an instant flip, post-process the ASS file to swap \`\\k\` for \`\\kf\`. The default \`\\k\` matches modern social-reel aesthetic where most popular karaoke captions use instant flip.

## Phrase grouping rules

The writer groups consecutive words into phrases for on-screen display. Rules (in order of precedence):
1. **Terminal punctuation** (\`.\`, \`!\`, \`?\`) closes a phrase immediately.
2. **Clause punctuation** (\`,\`, \`;\`, \`:\`) closes a phrase immediately.
3. **\`max_words_per_phrase\` cap** — default 3.

So "Hello, world." becomes two phrases (\`["Hello,"]\`, \`["world."]\`) even though the cap allows 3 words. This produces natural reading pacing — speakers pause at commas, captions should too.

## Sizing guidance

| Aspect ratio | PlayRes | font_size | margin_v | max_words_per_phrase |
|--------------|---------|-----------|----------|----------------------|
| 9:16 phone (TikTok / Reels / Shorts) | 1080×1920 (default) | 96 | 240 | 3 |
| 16:9 desktop | 1920×1080 | 64 | 80 | 4–5 |
| 1:1 square | 1080×1080 | 80 | 120 | 3 |

The 240 default \`margin_v\` is calibrated for TikTok specifically — its bottom UI (username, sound badge, captions strip) overlaps the lower ~200px of frame. Reels and Shorts have less aggressive bottom UI; 160 works fine there.

## Common pitfalls

- **Font not installed on the rendering host.** ASS specifies fonts by name; \`subtitles\` filter resolves them via libass / fontconfig. If \`DM Sans\` (default) isn't installed where ffmpeg runs, libass falls back to Arial silently. Verify the font is present on the artificer host or pass \`font_name\` matching what's installed.
- **Forgetting Scribe \`type\` filter.** Scribe v2 returns \`type: "spacing"\` and \`type: "audio_event"\` entries in \`words[]\`. \`build_ass_karaoke\` filters these automatically when reading from \`transcript_file\`. If you pass \`words\` inline, **filter to \`type === "word"\` yourself** — including spacing/audio_event tokens makes the karaoke highlight on space chars and laughter, which looks broken.
- **\`\\k0\` zero-duration timing.** ASS / libass treat \`\\k0\` as a no-op. The writer clamps to \`\\k1\` (1cs = 10ms) when adjacent words have identical starts (degenerate ASR output). Don't try to game this with \`max_words_per_phrase: 1\` and zero-gap timing.
- **PlayRes mismatch with the video.** ASS positioning is relative to PlayResX × PlayResY. If you build the ASS at 1080×1920 but the video is 720×1280, libass scales but the font_size feels off. Match PlayRes to your final video resolution.

## Example calls

**Karaoke from a fal_transcribe transcript file (typical):**
\`\`\`json
{
  "transcript_file": "gs://bucket/transcripts/voiceover.json",
  "output": "gs://bucket/captions/voiceover.ass"
}
\`\`\`

**Inline words with custom color:**
\`\`\`json
{
  "words": [
    { "text": "Most", "start": 0.14, "end": 0.42 },
    { "text": "bakers", "start": 0.46, "end": 0.79 },
    { "text": "get", "start": 0.85, "end": 0.99 },
    { "text": "this", "start": 1.04, "end": 1.21 },
    { "text": "wrong.", "start": 1.26, "end": 1.78 }
  ],
  "output": "./out.ass",
  "highlighted_color": "&H0000FFFF"
}
\`\`\`

**16:9 desktop preset (manual):**
\`\`\`json
{
  "transcript_file": "./transcript.json",
  "output": "./out.ass",
  "play_res_x": 1920,
  "play_res_y": 1080,
  "font_size": 64,
  "margin_v": 80,
  "max_words_per_phrase": 5
}
\`\`\`

## Composing the pipeline

The full karaoke flow uses three artificer tools chained:

1. \`fal_transcribe\` — \`{model: "fal-ai/elevenlabs/speech-to-text/scribe-v2", audio: voice_uri, output: transcript_uri}\`
2. \`build_ass_karaoke\` — \`{transcript_file: transcript_uri, output: ass_uri, ...style}\`
3. \`video_add_subtitles\` — \`{input: video_uri, output: captioned_uri, subtitle_file: ass_uri, burn_in: true}\`

The intermediate transcript and ASS files are pure data — they can live in temp storage if you don't need them again, or in a known path if you want to debug captions independently of the burn-in.

## Last verified
2026-04-27 — pipeline V1 ported from social-content-pipeline; validated end-to-end on the toothpick reel (Kling talking-head + Scribe v2 transcript).

## Official references
- ASS / SubStation Alpha format spec: http://www.tcax.org/docs/ass-specs.htm
- libass override tags: https://github.com/libass/libass/wiki/ASS-Tags
- ffmpeg \`subtitles\` filter docs: https://ffmpeg.org/ffmpeg-filters.html#subtitles-1
`;

export function registerAssKaraokePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'ass_karaoke_prompt_guide',
    'Reference guide for `build_ass_karaoke` — covers ASS color literal format (`&HAABBGGRR` with inverted alpha), karaoke override tag semantics (`\\k` vs `\\kf` vs `\\ko`), phrase-grouping rules, sizing presets for 9:16 / 16:9 / 1:1, why forced-alignment ASR (Scribe v2) is preferred over Whisper for karaoke timing, and common pitfalls. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: ASS_KARAOKE_GUIDE }] }),
  );
}

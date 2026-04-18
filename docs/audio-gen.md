# Audio Generation

artificer-mcp ships AI-powered speech and music generation via Google's Gemini TTS and Lyria stacks. Both accept any output URI the storage layer supports; non-native output extensions are transcoded via ffmpeg.

## Speech (Gemini TTS)

### gemini_generate_speech

Generate natural-sounding speech from text. Returns PCM wrapped in WAV; other extensions (`.mp3`, `.aac`, `.ogg`, ...) are transcoded automatically.

| Param | Default | Description |
|-------|---------|-------------|
| `text` | required | Script to narrate |
| `output` | required | Output path or URI (.wav / .mp3 / ...) |
| `model` | `gemini-2.5-flash-preview-tts` | Override via `ARTIFICER_TTS_MODEL`. Also valid: `gemini-2.5-pro-preview-tts`. |
| `voice` | `Kore` (or brand spec) | Prebuilt voice name — `Kore`, `Puck`, `Zephyr`, `Charon`, `Fenrir`, `Leda`, `Aoede`, `Orus`, `Sage`, etc. |
| `language_code` | — | Optional ISO code (e.g., `en-US`). |
| `style` | — | Natural-language delivery style (tone / pace / emotion). Composed with `tts.accent` from the brand spec when set. |

### Brand-spec fallbacks

When `ARTIFICER_BRAND_SPEC.tts.*` is set:
- `voice` falls back to `tts.voice`
- `style` composes from `tts.style` + `tts.accent` when the caller omits it
- `language_code` falls back to `tts.language_code`

Pair with `gemini_tts_prompt_guide` for the full voice catalog and style-prompt examples.

## Music (Lyria)

Two tools — batch for simple music-bed use cases, realtime for interactive / streaming.

### gemini_generate_music (Lyria 3 batch)

Generate music synchronously. Default model `lyria-3-clip-preview` returns a fixed 30-second MP3. `lyria-3-pro-preview` generates up to ~2 minutes (duration is prompt-driven — e.g., "30 second clip at 120 BPM...") and emits WAV.

| Param | Default | Description |
|-------|---------|-------------|
| `prompt` | required | Genre / tempo / mood / instruments description |
| `output` | required | Output path or URI |
| `model` | `lyria-3-clip-preview` | Override via `ARTIFICER_LYRIA_MODEL`. Pro variant: `lyria-3-pro-preview`. |
| `negative_prompt` | — | What to avoid (e.g., "no vocals, no drums") |

### gemini_generate_music_live (Lyria RealTime)

Open a WebSocket session, send a weighted prompt, collect audio for `duration_seconds`, then force-close. Enforces a hard wall-clock deadline so the tool always returns even when the upstream session hangs. 48 kHz stereo PCM → WAV (transcoded if the output extension isn't `.wav`).

| Param | Default | Description |
|-------|---------|-------------|
| `prompt` | required | Weighted prompt string |
| `output` | required | Output path or URI |
| `duration_seconds` | required | Audio capture length |
| `model` | `models/lyria-realtime-exp` | Override via `ARTIFICER_LYRIA_LIVE_MODEL`. |
| `temperature`, `seed`, `guidance` | — | Generation controls |

Prefer `gemini_generate_music` for one-shot music beds (simpler, deterministic). Use realtime only when you need streaming / long-form / interactive prompting.

### Brand-spec fallbacks

`ARTIFICER_BRAND_SPEC.music.default_prompt` is used by higher-level workflows (e.g., `workflow_narrated_explainer`) when the caller doesn't pass their own prompt. The raw `gemini_generate_music` tools always require an explicit prompt.

## Prompt guide

`gemini_lyria_prompt_guide` — prompt anatomy, Lyria 3 Pro timestamp syntax, negative-prompt patterns, realtime session lifecycle, safety-filter notes.

## Prerequisites

- `GOOGLE_API_KEY` environment variable

## Composition with post-processing

Typical pipeline:

1. `gemini_generate_speech` → WAV narration
2. `gemini_generate_music` → MP3 / WAV music bed
3. `audio_mix` with `duck_to` / `duck_against_track` → one mixed track with the music ducked under the VO
4. `video_set_audio` to mux the final mix onto a finished video

`workflow_narrated_explainer` runs this entire chain in a single call.

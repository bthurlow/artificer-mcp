# Video & Audio Post-Processing

25 FFmpeg-backed tools for video and audio post-processing. Requires FFmpeg 6+ with `ffmpeg` and `ffprobe` in PATH (hard floor is 4.3 for `xfade`; 6+ is the tested baseline). A libass-enabled build is needed for `video_add_subtitles` burn-in.

## Video tools (16)

### Core operations

| Tool | Description | Key params |
|------|-------------|------------|
| `video_concatenate` | Join videos end-to-end, optionally with a transition (fade/wipe/dissolve/slide/etc.) when `transition` is set | `inputs[]`, `reencode`, `transition`, `transition_duration` |
| `video_from_image` | Create a short video clip from a still image (title / end cards, static intros) | `input` (image), `duration_seconds`, `frame_rate`, optional `width`/`height`, optional `audio` |
| `video_set_audio` | Replace or add an audio track on a finished video (video stream copied, audio re-encoded) | `input`, `audio`, `audio_codec`, `shortest` |
| `video_trim` | Cut to time range | `start_seconds`, `duration_seconds` or `end_seconds`, `reencode` |
| `video_change_aspect_ratio` | Reframe via crop or pad | `aspect_ratio` ("9:16", "1:1", etc.), `mode` (crop/pad), `pad_color` |
| `video_convert_format` | Change container format | `format` (mp4/webm/mov/mkv/avi/flv). Codec picked per target. |
| `video_change_speed` | Speed up or slow down | `speed` (2.0=2x), `preserve_audio` (true=pitch-preserving, limited to 0.5-2.0x) |
| `video_set_resolution` | Resize to target dimensions | `preset` (480p/720p/1080p/1440p/4k) or explicit `width`/`height`, `preserve_aspect_ratio` |

### Effects & overlays

| Tool | Description | Key params |
|------|-------------|------------|
| `video_add_transitions` | xfade transitions between clips | `inputs[]`, `transition` (fade/wipeleft/dissolve/...), `duration` |
| `video_add_image_overlay` | Logo/watermark overlay | `overlay` (image path), `x`, `y`, `opacity`, `start_seconds`, `end_seconds` |
| `video_add_text_overlay` | Burn text onto video | `text`, `font_file`, `font_size`, `color`, `box`, time range |
| `video_add_subtitles` | SRT/VTT/ASS subtitles | `subtitle_file`, `burn_in` (true=rendered, false=soft track), `force_style` |
| `video_add_b_roll` | Insert b-roll at a time point | `main`, `b_roll`, `insert_at_seconds`, `b_roll_duration_seconds`, `replace_main_duration` |

### Encoding controls

| Tool | Description | Key params |
|------|-------------|------------|
| `video_set_bitrate` | Target video/audio bitrate | `video_bitrate`, `audio_bitrate`, `two_pass` |
| `video_set_codec` | Change codec + quality | `video_codec`, `audio_codec`, `crf`, `preset` |
| `video_set_frame_rate` | Change fps | `frame_rate`, `drop_duplicate_frames` (true=fps filter, false=-r flag) |

## Audio tools (9)

| Tool | Description | Key params |
|------|-------------|------------|
| `audio_extract_from_video` | Strip audio track from video | `codec` (copy/libmp3lame/aac/...), `bitrate` |
| `audio_mix` | Mix 2+ audio tracks into one output with per-track volume and optional delay; supports sidechain ducking against a designated dialogue track | `tracks[]`, `duration`, `duck_to`, `duck_against_track`, `duck_attack_ms`, `duck_release_ms` |
| `audio_normalize` | Loudness normalization | `mode` (loudnorm=EBU R128, peak=simple), `target_lufs` (-14 for Spotify/YT), `target_peak_db` |
| `audio_convert_format` | Change container/codec | `format` (mp3/aac/wav/flac/ogg/opus), `codec` |
| `audio_convert_properties` | Multi-property change in one pass | `sample_rate`, `channels`, `bitrate`, `codec` |
| `audio_set_bitrate` | Bitrate-only re-encode | `bitrate` (e.g., "128k") |
| `audio_set_channels` | Mono/stereo/5.1 conversion | `channels` (1/2/6/8) |
| `audio_set_sample_rate` | Resample audio | `sample_rate` (22050/44100/48000/96000) |
| `audio_remove_silence` | Trim silence | `threshold_db`, `min_silence_duration`, `remove` (start/end/both/all) |

## Common patterns

### Convert landscape video to portrait for Reels/Shorts

```
video_change_aspect_ratio input=./landscape.mp4 output=./portrait.mp4 aspect_ratio=9:16 mode=crop
```

### Join clips with a crossfade

```
video_concatenate inputs=[clip1.mp4, clip2.mp4, clip3.mp4] output=./joined.mp4 transition=fade transition_duration=0.5
```

Transitions force re-encode and yuv420p output for broad player compatibility. `video_add_transitions` is also available if you want the xfade-specific surface. Inputs must share resolution and frame rate — use `video_set_resolution` first if they differ.

### Add a logo watermark

```
video_add_image_overlay input=./video.mp4 overlay=./logo.png output=./branded.mp4 x="main_w-overlay_w-10" y=10 opacity=0.7
```

Position supports FFmpeg expressions for dynamic placement.

### Prepare audio for Spotify upload

```
audio_normalize input=./raw.wav output=./mastered.wav mode=loudnorm target_lufs=-14 target_peak_db=-1
```

Common loudness targets: -14 LUFS (Spotify/YouTube), -16 LUFS (Apple Music), -23 LUFS (EBU broadcast).

### Trim silence from a podcast recording

```
audio_remove_silence input=./raw.mp3 output=./clean.mp3 threshold_db=-40 min_silence_duration=1.0 remove=both
```

`remove=both` trims leading and trailing silence. Use `remove=all` to also cut mid-audio silence (may sound unnatural).

### Insert b-roll as a cutaway

```
video_add_b_roll main=./interview.mp4 b_roll=./product-shot.mp4 output=./final.mp4 insert_at_seconds=15 b_roll_duration_seconds=3 replace_main_duration=true
```

`replace_main_duration=true` keeps the main audio continuous (standard cutaway pattern). Set to `false` to insert additively (extends total length).

### Duck a music bed under dialogue

```
audio_mix tracks=[{input:./vo.wav, volume:1.0}, {input:./music.mp3, volume:0.6}] output=./mixed.wav duck_to=-14 duck_against_track=1
```

Track 0 (dialogue) drives a sidechain compressor against track 1 (music). Whenever the VO is audible, the music drops by the `duck_to` amount (dB). `duck_attack_ms` / `duck_release_ms` shape the envelope.

### Turn a title card into a short clip

```
video_from_image input=./title-card.png output=./title.mp4 duration_seconds=2.5 frame_rate=30 width=1080 height=1920
```

Output is H.264 + yuv420p so it concatenates cleanly with other clips via `video_concatenate`.

### Attach a finished mix to a finished video

```
video_set_audio input=./video.mp4 audio=./mixed.wav output=./final.mp4 audio_codec=aac shortest=true
```

Video is stream-copied (no re-encode). Use after `audio_mix` to produce the final broadcast file.

## Codec defaults

When no explicit codec is specified, tools pick sensible defaults by output extension:

| Extension | Video codec | Audio codec |
|-----------|-------------|-------------|
| `.mp4` | libx264 | aac |
| `.mov` | libx264 | aac |
| `.webm` | libvpx-vp9 | libopus |
| `.mkv` | libx264 | aac |
| `.mp3` | — | libmp3lame |
| `.aac` / `.m4a` | — | aac |
| `.wav` | — | pcm_s16le |
| `.flac` | — | flac |
| `.ogg` | — | libvorbis |
| `.opus` | — | libopus |

## Architecture

- **FFmpeg wrapper** (`src/utils/exec-ffmpeg.ts`): `ffmpeg()`, `ffmpegBatch()`, `ffprobe()`, `getVideoInfo()`. Uses `execFile` (no shell) with configurable timeouts (120s default, 600s batch).
- **Video module** (`src/video/`): types + index with all 16 tool registrations.
- **Audio module** (`src/audio/`): types + index with all 9 tool registrations.
- **ADR**: See [docs/adr/004-imagemagick-cli-wrapper.md](adr/004-imagemagick-cli-wrapper.md) for the CLI wrapper pattern that both ImageMagick and FFmpeg follow.

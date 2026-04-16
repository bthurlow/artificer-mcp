# Video & Audio Post-Processing

22 FFmpeg-backed tools for video and audio post-processing. Requires FFmpeg 6+ with `ffmpeg` and `ffprobe` in PATH.

## Video tools (14)

### Core operations

| Tool | Description | Key params |
|------|-------------|------------|
| `video_concatenate` | Join videos end-to-end | `inputs[]`, `reencode` (false=fast demuxer, true=filter for mixed formats) |
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

## Audio tools (8)

| Tool | Description | Key params |
|------|-------------|------------|
| `audio_extract_from_video` | Strip audio track from video | `codec` (copy/libmp3lame/aac/...), `bitrate` |
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
video_add_transitions inputs=[clip1.mp4, clip2.mp4, clip3.mp4] output=./joined.mp4 transition=fade duration=1
```

Inputs must share resolution and frame rate. Use `video_set_resolution` first if they differ.

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
- **Video module** (`src/video/`): types + index with all 14 tool registrations.
- **Audio module** (`src/audio/`): types + index with all 8 tool registrations.
- **ADR**: See [docs/adr/004-imagemagick-cli-wrapper.md](adr/004-imagemagick-cli-wrapper.md) for the CLI wrapper pattern that both ImageMagick and FFmpeg follow.

# Opinionated Workflows

Workflows are compound tools that chain multiple primitives into a single call for common creative patterns. Each produces multiple outputs and returns a summary of every step taken.

## Tools

### workflow_brand_asset_pack

Generate a complete brand asset pack from a single logo image.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `logo` | string? | — | Path to source logo (SVG or raster, square recommended, min 1024x1024). Falls back to `ARTIFICER_BRAND_SPEC.logo.full → logo.icon`. |
| `output_dir` | string | required | Directory for all generated assets |
| `brand_name` | string? | — | Brand name for social card text. Falls back to `ARTIFICER_BRAND_SPEC.name`. Omit entirely for logo only. |
| `brand_color` | string? | — | Primary brand color (hex) for social card background. Falls back to `ARTIFICER_BRAND_SPEC.colors.primary`, else `#000000`. |
| `background_color` | string | `#FFFFFF` | Background for assets that need padding |

**Produces:**
- `favicons/` — 6 sizes (16, 32, 48, 180, 192, 512px)
- `app-icons/` — 9 sizes (iOS 60@2x, 60@3x, 1024; Android mdpi through playstore)
- `social-card.png` — 1200x630 with centered logo + brand name
- `og-image.png` — copy of social card

**17 assets** in one call.

### workflow_social_carousel

Create uniform carousel slides from a set of images, optionally with caption bars.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `images` | string[] | required | 2-10 slide image paths |
| `output_dir` | string | required | Directory for slides |
| `width` | number | 1080 | Slide width |
| `height` | number | 1080 | Slide height |
| `captions` | string[]? | — | Caption per slide (must match images length) |
| `caption_color` | string | `white` | Caption text color |
| `caption_background` | string | `#00000080` | Caption bar background with alpha |
| `caption_font_size` | number | 48 | Font size in pixels |
| `font_file` | string? | — | Path to .ttf/.otf font |

**Produces:** `slide_1.png`, `slide_2.png`, ... — each resized and center-cropped to exact dimensions with optional semi-transparent caption bar.

### workflow_carousel_compose

Compose multi-element carousel slides from a declarative spec. Each slide takes a background (solid color or image) plus ordered `text` / `rect` / `line` / `image` elements drawn in order (later elements on top). One call replaces dozens of manual overlay steps. Writes to local dirs or `gs://` output dirs.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `slides` | Slide[] | required | 1–20 slide specs (see element schemas) |
| `output_dir` | string | required | Directory (local path or `gs://`) |
| `width` | number | 1080 | Slide width |
| `height` | number | 1080 | Slide height |
| `brand.font` | string? | — | Default font for text elements. Falls back to `ARTIFICER_BRAND_SPEC.fonts.regular`. |
| `filename_pattern` | string | `slide_{n:02d}.png` | `{n}` = 1-based; `{n:02d}` = zero-padded |

Element types:
- `text` — content, font, font_size, color, gravity, x/y, optional box_width/box_height for auto-wrap, stroke, background
- `rect` — x, y, width, height, color, optional corner_radius
- `line` — x1, y1, x2, y2, color, width
- `image` — source (URI), x, y, optional width/height

`color` on text elements falls back to `ARTIFICER_BRAND_SPEC.colors.primary`.

### workflow_talking_head

Process a talking-head video through a configurable pipeline. Each step is optional — skip by omitting its params.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `input` | string | required | Raw talking-head video |
| `output` | string | required | Final processed video path |
| `trim_start_seconds` | number? | — | Trim start |
| `trim_end_seconds` | number? | — | Trim end |
| `b_roll` | string? | — | B-roll clip for cutaway insert |
| `b_roll_insert_at_seconds` | number? | — | Where to insert b-roll |
| `b_roll_duration_seconds` | number? | — | How much b-roll to use |
| `subtitle_file` | string? | — | SRT/VTT/ASS for burn-in subtitles |
| `normalize_audio` | boolean | true | EBU R128 loudnorm |
| `target_lufs` | number | -14 | Loudness target (-14 for YouTube/Spotify) |

**Pipeline:** trim → b-roll cutaway → burn subtitles → normalize audio → export.

B-roll is inserted as a cutaway (main audio continues over the b-roll footage).

### workflow_ad_creative_set

Generate a complete ad creative set: resize background to standard banner sizes, add headline + CTA button.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `background` | string | required | Background image |
| `output_dir` | string | required | Directory for banners |
| `headline` | string | required | Ad headline text |
| `cta_text` | string | `Learn More` | CTA button text |
| `headline_color` | string | `white` | Headline color |
| `cta_color` | string | `white` | CTA button text color |
| `cta_background` | string | `#FF6600` | CTA button background |
| `font_file` | string? | — | Path to .ttf/.otf font |
| `sizes` | array? | 6 standard sizes | Custom `{name, w, h}` array |

**Default sizes:**
- Leaderboard (728x90)
- Medium Rectangle (300x250)
- Wide Skyscraper (160x600)
- Mobile Banner (320x50)
- Large Rectangle (336x280)
- Half Page (300x600)

Each banner gets a dark overlay for readability, centered headline, and a rounded CTA button.

### workflow_ig_reel / workflow_tiktok_reel / workflow_yt_short / workflow_fb_reel

Compose a finished 9:16 short-form video (1080×1920, H.264 + AAC 48kHz, 30 fps default) from body clips plus optional title/end cards, captions, watermark, and a music bed. Target loudness: -14 LUFS. All four tools share identical encoding — pick the platform-named one for intent clarity.

Platform caveats (enforced loosely — the tool does not reject over-duration content):
- IG Reels: up to 90s
- TikTok: up to 10m (most perform best 15–60s)
- YouTube Shorts: hard 60s limit
- Facebook Reels: up to 90s

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `clips` | string[] | required | Ordered body clips (1+) |
| `output` | string | required | Path for the finished MP4 |
| `title_card` | object? | — | `{image, duration_seconds, audio?}` shown before the body |
| `end_card` | object? | — | `{image, duration_seconds, audio?}` shown after the body |
| `transition` | string? | — | xfade transition between body clips (`fade`, `dissolve`, ...). Omit for hard cuts. |
| `transition_duration` | number | 0.5 | Transition length (s) |
| `captions_srt` | string? | — | SRT file burned in via subtitles filter |
| `watermark` | object? | — | `{image?, gravity, x, y, width?, height?, opacity}` — omit `image` to use `ARTIFICER_BRAND_SPEC.logo.watermark → wordmark → icon`. Pass `{}` to apply brand defaults. |
| `music` | object? | — | `{input, volume, duck_to?, duck_attack_ms, duck_release_ms}` — sidechain-ducks under dialogue when `duck_to` is set (typical `-12` dB) |
| `normalize_lufs` | number | -14 | Final loudness target |
| `fps` | number | 30 | Output frame rate |

One call replaces roughly 10 ffmpeg invocations: clip normalization, concat with transitions, loudness-matched audio mix with ducking, caption burn-in, watermark overlay, and platform-spec encoding.

### workflow_narrated_explainer

Compose a finished narrated-explainer reel (9:16, H.264 + AAC 48kHz, 30 fps) from a narration script and an ordered list of still-image visuals. Auto-generates TTS narration (Gemini TTS) and a music bed (Lyria 3 batch) when not provided. Applies Ken Burns slow zoom on each visual, crossfades between them, sidechain-ducks the music under the voice, and normalizes to -14 LUFS. Useful for tip-of-the-day / myth-bust / Baker Math Monday formats where there's no talking-head clip.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `narration_text` | string | required | Script to send to Gemini TTS |
| `visuals` | string[] | required | Ordered still-image paths/URIs |
| `output` | string | required | Final MP4 path |
| `voice` | string? | — | TTS voice. Falls back to `ARTIFICER_BRAND_SPEC.tts.voice`, else `Kore`. |
| `style` | string? | — | Natural-language TTS delivery style. Composed from brand spec `tts.style` + `tts.accent` when omitted. |
| `tts_model` | string | `gemini-2.5-flash-preview-tts` | Override via `ARTIFICER_TTS_MODEL`. |
| `music_prompt` | string? | — | Lyria prompt. Falls back to `ARTIFICER_BRAND_SPEC.music.default_prompt`. Ignored if `music_input` is set. |
| `music_input` | string? | — | Pre-existing music track. Skips music generation. |
| `music_model` | string | `lyria-3-clip-preview` | Lyria 3 batch model. |
| `music_volume` | number | 0.25 | Linear music-bed volume (0–1). |
| `music_duck_to` | number | -12 | dB to duck music under the voice. |
| `music_duck_attack_ms` | number | 20 | Sidechain attack. |
| `music_duck_release_ms` | number | 250 | Sidechain release. |
| `ken_burns` | boolean | true | Apply slow zoom to each visual. |
| `title_card` / `end_card` | object? | — | Same shape as the reel workflows. |
| `watermark` | object? | — | Same shape as the reel workflows; falls back to brand-spec logo. |
| `transition` | string? | — | xfade transition between visuals. |
| `transition_duration` | number | 0.5 | Transition duration (s). |
| `fps` | number | 30 | Output frame rate. |
| `normalize_lufs` | number | -14 | Final loudness target. |
| `width` / `height` | number | 1080 / 1920 | Output resolution (default is 9:16). |

## Design principles

- **One call** — accepts all inputs, produces all outputs without intermediate user intervention.
- **Sensible defaults** — every parameter has a default tuned for the most common use case.
- **Override anything** — every intermediate step's parameters are exposed for fine-tuning.
- **Transparent** — the response describes each step taken, so the user understands what happened.

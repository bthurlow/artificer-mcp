# Opinionated Workflows

Workflows are compound tools that chain multiple primitives into a single call for common creative patterns. Each produces multiple outputs and returns a summary of every step taken.

## Tools

### workflow_brand_asset_pack

Generate a complete brand asset pack from a single logo image.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `logo` | string | required | Path to source logo (square recommended, min 1024x1024) |
| `output_dir` | string | required | Directory for all generated assets |
| `brand_name` | string? | — | Brand name for social card text. Omit for logo only. |
| `brand_color` | string | `#000000` | Primary brand color for social card background |
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

## Design principles

- **One call** — accepts all inputs, produces all outputs without intermediate user intervention.
- **Sensible defaults** — every parameter has a default tuned for the most common use case.
- **Override anything** — every intermediate step's parameters are exposed for fine-tuning.
- **Transparent** — the response describes each step taken, so the user understands what happened.

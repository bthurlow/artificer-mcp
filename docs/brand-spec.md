# Brand Spec

`ARTIFICER_BRAND_SPEC` is an optional environment variable that holds a JSON object of project-wide brand defaults. When set, every tool that accepts fonts, colors, TTS voices, music prompts, or logo variants can soft-default from it — so you don't need to re-pass the same values to every call.

## Why

Creative-media pipelines are dozens of tool invocations deep, and the same brand choices (primary color, font file, TTS voice, logo URI) recur in almost every one. Forcing the agent to memorize and re-pass those values every call is error-prone and bloats the context. The brand spec is a single source of truth the agent fetches once per session via `brand_spec_get`, then composes into prompts and tool args without the caller restating specifics.

## Shape

All fields are optional — partial specs are valid.

```json
{
  "name": "Acme Bakery",
  "colors": {
    "primary": "#e11d48",
    "primary_name": "rose-600",
    "secondary": "#1e293b",
    "secondary_name": "slate-800"
  },
  "fonts": {
    "regular": "/fonts/Inter-Regular.ttf",
    "medium":  "/fonts/Inter-Medium.ttf",
    "semibold": "/fonts/Inter-SemiBold.ttf",
    "bold": "/fonts/Inter-Bold.ttf"
  },
  "scene_description": "Log cabin kitchen with gold mixers, warm natural light, flour on the counter...",
  "tts": {
    "voice": "Kore",
    "accent": "spoken with a gentle North Mississippi drawl — soft consonants, unhurried cadence",
    "style": "warm, confident, slightly folksy",
    "language_code": "en-US"
  },
  "music": {
    "default_prompt": "warm acoustic folk instrumental, 90 BPM, fingerpicked guitar, light brushed drums, no vocals"
  },
  "logo": {
    "full": "gs://acme-assets/logo/full.svg",
    "wordmark": "gs://acme-assets/logo/wordmark.svg",
    "icon": "gs://acme-assets/logo/icon.svg",
    "watermark": "gs://acme-assets/logo/watermark-white.png"
  }
}
```

Pass it as a single JSON string on the env var. Invalid JSON or schema violations throw at first read so misconfiguration surfaces loudly instead of silently defaulting.

## How tools use it

- **Text/overlay tools** (`text_draw`, carousel compose elements): font falls back to `fonts.regular`; color falls back to `colors.primary`.
- **Speech** (`gemini_generate_speech` and the narrated-explainer workflow): voice falls back to `tts.voice`; `style` composes from `tts.style` + `tts.accent`; language from `tts.language_code`.
- **Music** (`workflow_narrated_explainer`): `music_prompt` falls back to `music.default_prompt`.
- **Watermarking** (video overlay workflows): watermark URI falls back through `logo.watermark → logo.wordmark → logo.icon`.
- **Logo / raster consumption** (`workflow_brand_asset_pack`, social cards): source falls back through `logo.full → logo.icon`. SVGs are rasterized on demand at high density.

Explicit per-call params always win over the brand spec.

## brand_spec_get

Agents should call `brand_spec_get` once per session. It returns either:

```json
{ "configured": false, "hint": "Set ARTIFICER_BRAND_SPEC..." }
```

or:

```json
{ "configured": true, "spec": { ... } }
```

The agent can then compose `scene_description` into Veo prompts, pick font paths, etc., without guessing.

## Tips

- Keep `tts.accent` natural-language. It's inlined into the Gemini TTS style directive, not parsed as a code.
- Use absolute paths or `gs://` / `https://` URIs for fonts and logos. Relative paths are resolved against the MCP server's working directory, which may not be what you expect when invoked from a Claude Code session.
- SVG logos are acceptable anywhere a raster is needed — the server rasterizes on demand at 300 DPI.
- The spec is cached for the life of the process. Restart the MCP server after editing the env var.

# Image Generation

artificer-mcp ships AI-powered image generation via Google's Gemini stack.

## Tools

| Tool | Backed by | Purpose |
|------|-----------|---------|
| `gemini_generate_image` | Imagen 4 (`imagen-4.0-generate-001`) | Text-to-image generation |
| `gemini_edit_image` | Imagen 3 capability (`imagen-3.0-capability-001`) | Edit an existing image from a text instruction |
| `gemini_upscale_image` | Imagen upscale (`imagen-4.0-upscale-preview`) | Upscale an existing image 2× or 4× |
| `gemini_nanobanana_generate_image` | Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) | Fast, low-cost alternative image generator |

All four accept per-call `model` overrides. Env fallbacks (see [README](../README.md#environment-variables)): `ARTIFICER_IMAGEN_MODEL`, `ARTIFICER_IMAGEN_EDIT_MODEL`, `ARTIFICER_IMAGEN_UPSCALE_MODEL`, `ARTIFICER_NANOBANANA_MODEL`.

## Prompt guides

Pair any image tool with its prompt guide:

- `gemini_image_prompt_guide` — Imagen 3/4 best practices (style keywords, aspect ratios, negative prompts, safety-filter avoidance)
- `gemini_nanobanana_prompt_guide` — Nano Banana quirks (what it does well vs. Imagen)

Guides return structured markdown with official-doc links, field-tested good/bad examples, and model-specific notes. No API call.

## Brand spec integration

When `ARTIFICER_BRAND_SPEC` is set, agents can retrieve `scene_description`, colors, and other shared context via `brand_spec_get` and compose it into the image prompt for project-consistent results. See [docs/brand-spec.md](brand-spec.md).

## Prerequisites

- `GOOGLE_API_KEY` environment variable

## I/O contract

Every tool accepts a local path, `file://`, `gs://`, or `https://` URI as input (where applicable) and writes to any URI supported by the configured storage providers. URI resolution is transparent to the caller.

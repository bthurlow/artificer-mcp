# Image Generation

artificer-mcp ships AI-powered image generation via Google's Gemini stack.

## Tools

| Tool | Backed by | Purpose |
|------|-----------|---------|
| `gemini_generate_image` | Imagen 4 (`imagen-4.0-generate-001`) | Text-to-image generation |
| `gemini_edit_image` | Imagen 3 capability (`imagen-3.0-capability-001`) | Edit an existing image from a text instruction |
| `gemini_upscale_image` | Imagen upscale (`imagen-4.0-upscale-preview`) | Upscale an existing image 2× or 4× |
| `gemini_nanobanana_generate_image` | Nano Banana 2 (`gemini-3.1-flash-image`) by default | Generation, edits and composites from reference images. `image_size` picks 1K/2K/4K, and the file format follows the output extension |

All four accept per-call `model` overrides. Env fallbacks (see [README](../README.md#environment-variables)): `ARTIFICER_IMAGEN_MODEL`, `ARTIFICER_IMAGEN_EDIT_MODEL`, `ARTIFICER_IMAGEN_UPSCALE_MODEL`, `ARTIFICER_NANOBANANA_MODEL`.

### fal image models (`fal_generate_image`)

`fal_generate_image` is a thin transport for every fal-hosted image model in `model_catalog` (capability `image`). Pass an explicit fal endpoint as `model` and read its guide first. Structural inputs: `prompt`, `image` → `image_url`, `images` → `image_urls`, `mask` → `mask_url`, `aspect_ratio`, `image_size`, `resolution`, `num_images`, `negative_prompt`. Everything else goes in `extra_params`, and extra file inputs (try-on person and garment images, reference images) go in `extra_files`, which uploads local paths.

Unlike `gemini_nanobanana_generate_image`, **the fal tool saves each image exactly as the model returns it**. Choose a format with `extra_params.output_format` where the model supports it, and use a matching extension; the result flags any mismatch. Extra outputs (masks, layers) are reported by URL.

| Group | What | Guide |
|---|---|---|
| `image.general` | Text-to-image (Seedream 5, GPT Image 2/2.5, FLUX.2, Recraft 4.1 incl. SVG, Ideogram 4, Qwen, MAI, Grok, Krea 2, …) | `fal_image_generation_prompt_guide` |
| `image.edit` | Instruction / multi-reference edits, outpaint, reframe, background replacement, object removal, try-on | `fal_image_edit_prompt_guide` |
| `image.upscale` | Upscale, restore, denoise, sharpen, face restore, colorize | `fal_image_upscale_prompt_guide` |
| `image.background_removal` | ML cutouts, matting, segmentation | `fal_background_removal_prompt_guide` |

Nano Banana itself is also on fal (Nano Banana 2, Pro, Lite), with native `output_format` and `resolution`; see `gemini_nanobanana_prompt_guide`. Requires `FAL_KEY`.

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

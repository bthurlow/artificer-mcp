# Video Generation

artificer-mcp ships AI-powered video generation via Google Veo.

## Tool

`gemini_generate_video` — one tool covers both text-to-video and image-to-video:

- Pass `prompt` only → text-to-video.
- Pass `prompt` + `image` → image-to-video (the image drives the first frame / style).

The operation is long-running; the tool polls until complete or the poll timeout is hit, then downloads the result to the requested `output` URI (local, `gs://`, `https://`, etc.).

## Model selection

Pass any valid Veo model string via the `model` param, or set `ARTIFICER_VEO_MODEL` as the default. There is no hardcoded enum — new Veo tiers work the moment Google exposes them.

## Key params

| Param | Description |
|-------|-------------|
| `prompt` | Scene description. See `veo_video_prompt_guide` for structure. |
| `image` | Optional reference image for image-to-video. Aspect ratio must match Veo's expectations — see the prompt guide. |
| `duration_seconds` | Clip length; model-dependent. |
| `aspect_ratio` | e.g., `16:9`, `9:16`. |
| `resolution` | `720p` / `1080p` on tiers that support it. |
| `fps` | Frame rate. |
| `negative_prompt` | Things to avoid. |
| `person_generation` | Veo safety setting. |
| `generate_audio` | Request audio (dialogue + SFX). Model-dependent. |
| `enhance_prompt` | Let Veo rewrite the prompt before generation. |
| `seed` | Reproducibility. |
| `poll_interval_seconds`, `poll_timeout_seconds` | Polling cadence and ceiling. |

## Prompt guide

Pair the tool with `veo_video_prompt_guide` — it returns model-specific notes (aspect-ratio interop for image-to-video, dialogue syntax, Dev API vs Vertex differences) plus field-tested templates and examples.

## Prerequisites

- `GOOGLE_API_KEY` environment variable
- GCS credentials only if you're writing output to `gs://`

## Brand spec integration

When `ARTIFICER_BRAND_SPEC.scene_description` is set, compose it into your Veo prompt for project-consistent environments / lighting / props across generations.

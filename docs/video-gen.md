# Video Generation

artificer-mcp ships AI-powered video generation via Google Veo (on Vertex AI), Gemini Omni, and fal-hosted models.

## Tool

`gemini_generate_video` — one tool covers both text-to-video and image-to-video:

- Pass `prompt` only → text-to-video.
- Pass `prompt` + `image` → image-to-video (the image drives the first frame / style).

The operation is long-running; the tool polls until complete or the poll timeout is hit, then downloads the result to the requested `output` URI (local, `gs://`, `https://`, etc.).

## Model selection

**Veo runs on Vertex AI only.** Google shut Veo down on the Gemini API (the last models on 2026-10-22), so `gemini_generate_video` uses the Vertex client: set `GOOGLE_CLOUD_PROJECT` (and optionally `GOOGLE_CLOUD_LOCATION`) and authenticate with Application Default Credentials. A `GOOGLE_API_KEY` alone is not enough; with only a key, use `gemini_omni_generate_video` (the replacement Google names) or a fal Veo route.

The default model is `veo-3.1-generate-001`; also `veo-3.1-fast-generate-001` and `veo-3.1-lite-generate-001` (preview). Pass any Vertex Veo model string via `model`, or set `ARTIFICER_VEO_MODEL`. The result comes back as bytes, or as a `gs://` URI that is copied through the storage layer.

## Key params

| Param | Description |
|-------|-------------|
| `prompt` | Scene description. See `veo_video_prompt_guide` for structure. |
| `image` | Optional reference image for image-to-video. Aspect ratio must match Veo's expectations — see the prompt guide. |
| `duration_seconds` | Clip length; Veo 3.1 takes 4, 6 or 8. |
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

Pair the tool with `veo_video_prompt_guide` — it returns model-specific notes (aspect-ratio interop for image-to-video, dialogue syntax) plus field-tested templates and examples.

## Prerequisites

- `GOOGLE_CLOUD_PROJECT` and Application Default Credentials (`gcloud auth application-default login`, or `GOOGLE_APPLICATION_CREDENTIALS` pointing at a service-account key)
- GCS credentials only if you're writing output to `gs://`

## Brand spec integration

When `ARTIFICER_BRAND_SPEC.scene_description` is set, compose it into your Veo prompt for project-consistent environments / lighting / props across generations.

## fal video models (`fal_generate_video`)

`fal_generate_video` is a thin transport for every fal-hosted video model in `model_catalog` (capability `video`). Pass an explicit fal endpoint as `model`, and read the model's prompt guide first. Structural inputs map onto fal's common keys: `image` → `image_url`, `audio` → `audio_url`, `video` → `video_url`, `duration_seconds` → `duration`, plus `aspect_ratio`, `resolution` and `negative_prompt`. Anything model-specific goes in `extra_params`, and extra file inputs (end frames, references, masks) go in `extra_files`, which uploads local paths for you.

The `video` input covers video-to-video work. Catalog groups:

| Group | What | Guide |
|---|---|---|
| `video.upscale` | Upscale, interpolate, denoise, deblur, SDR→HDR, colorize (Topaz, SeedVR2, FlashVSR, …) | `fal_video_upscale_prompt_guide` |
| `video.edit` | Modify / restyle, extend, inpaint / outpaint, reframe, erase objects, remove background | `fal_video_edit_prompt_guide` |
| `video.lipsync` | Lip-sync a still or re-sync an existing clip to new audio, including singing | `fal_lipsync_prompt_guide` |

Many video-to-video models bill per second of **input** video. Check the route's `cost` in `model_catalog` before running a long clip.

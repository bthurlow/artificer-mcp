# Video Generation

> **Status**: Planned for Phase 4. Not yet implemented.

artificer-mcp will support AI-powered video generation via:

- **Veo** (Google) — text-to-video and image-to-video across three tiers:
  - **Standard** — highest quality, longest generation time
  - **Fast** — balanced quality/speed
  - **Lite** — lowest cost, fastest generation (~$0.05/sec)

## Planned tools

- `gemini_generate_video_from_text` — generate a video from a text prompt
- `gemini_generate_video_from_image` — generate a video starting from a reference image
- Prompt guide tools with model-specific best practices and tier recommendations

## Prerequisites

- Google Gemini API key (`GOOGLE_API_KEY` environment variable)

See [docs/prompt-guides.md](prompt-guides.md) for structured prompt guidance (also planned).

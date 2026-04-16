# Image Generation

> **Status**: Planned for Phase 4. Not yet implemented.

artificer-mcp will support AI-powered image generation via:

- **Gemini** (Google) — text-to-image and image editing via the Gemini API
- **Nano Banana** — alternative Gemini-based generation provider

## Planned tools

- `gemini_generate_image` — generate an image from a text prompt
- `gemini_edit_image` — edit an existing image with a text instruction
- Prompt guide tools with model-specific best practices

## Prerequisites

- Google Gemini API key (`GOOGLE_API_KEY` environment variable)

See [docs/prompt-guides.md](prompt-guides.md) for structured prompt guidance (also planned).

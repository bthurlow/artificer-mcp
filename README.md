# artificer-mcp

[![CI](https://github.com/bthurlow/artificer-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/bthurlow/artificer-mcp/actions/workflows/ci.yml)
[![Release](https://github.com/bthurlow/artificer-mcp/actions/workflows/release.yml/badge.svg)](https://github.com/bthurlow/artificer-mcp/actions/workflows/release.yml)
[![Coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fbthurlow.github.io%2Fartificer-mcp%2Fbadges%2Fcoverage.json&cacheSeconds=300)](https://github.com/bthurlow/artificer-mcp/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/bthurlow/artificer-mcp)](https://github.com/bthurlow/artificer-mcp/releases/latest)
[![License: Apache 2.0](https://img.shields.io/github/license/bthurlow/artificer-mcp)](https://github.com/bthurlow/artificer-mcp/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple)](https://modelcontextprotocol.io/)

> **Status:** Pre-release (v0.1.0 in development). API may change before v1.0.

**artificer-mcp** is a public MCP server for AI-powered creative media generation and processing. One server covering the full creative pipeline:

- **Image generation** via Gemini / Nano Banana
- **Video generation** via Veo (all 3.1 tiers: Standard, Fast, Lite)
- **Image processing** via ImageMagick (~70 tools — resize, composite, text, social cards, ad creatives, app icons, and more)
- **Video/audio post-processing** via FFmpeg (concat, transitions, trim, overlays, subtitles, audio mix/normalize)
- **Pluggable storage** — local filesystem + Google Cloud Storage out of the box; S3 / OneDrive stubbed for contribution
- **Opinionated workflows** — one-call chains for common patterns (talking-head video, social carousel, brand asset pack)
- **Prompt guides** — structured prompt guidance per AI provider with official-doc references + field-tested good/bad examples

Built for the [Model Context Protocol](https://modelcontextprotocol.io/). Works with Claude Code, Claude Desktop, Cursor, and any MCP-compatible client.

**Repository:** [github.com/bthurlow/artificer-mcp](https://github.com/bthurlow/artificer-mcp)

## Why artificer-mcp

Current creative-media MCP servers are fragmented — one for ImageMagick, one for FFmpeg, one for Veo, one for Nano Banana, each with its own quirks (local-path-only inputs, hardcoded model enums, safety-filter crashes, hanging processes). artificer-mcp consolidates them into one coherent server with URI-first I/O, dynamic model IDs, pluggable providers, and first-class prompt guidance.

Looking for just ImageMagick without AI generation dependencies? Use the focused [imagemagick-mcp](https://github.com/bthurlow/imagemagick-mcp) instead.

## Prerequisites

- **Node.js** 22+
- **ImageMagick 7+** with `magick` in PATH — [install](https://imagemagick.org/script/download.php)
- **FFmpeg 6+** with `ffmpeg` in PATH — [install](https://ffmpeg.org/download.html)
- **Google Gemini API key** (if using image or video generation) — [get one](https://aistudio.google.com/apikey)
- **Google Cloud credentials** (if using GCS storage) — `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to a service account JSON

## Installation

### From source

```bash
git clone https://github.com/bthurlow/artificer-mcp.git
cd artificer-mcp
yarn install
yarn build
```

### Claude Code

```bash
claude mcp add artificer -- node /path/to/artificer-mcp/dist/index.js
```

### Claude Desktop / Cursor

Add to your MCP config:

```json
{
  "mcpServers": {
    "artificer": {
      "command": "node",
      "args": ["/path/to/artificer-mcp/dist/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your-gemini-api-key",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/gcs-service-account.json"
      }
    }
  }
}
```

### npx (once published to npm)

<!-- TODO: Uncomment once published to npm
```bash
claude mcp add artificer -- npx artificer-mcp
```
-->

## Architecture

- **URI-first API** — every tool accepts local paths (`./foo.jpg`, `file:///...`) or URIs (`gs://bucket/key`, `https://...`). Storage resolution happens inside the tool.
- **Per-provider AI tools** — no unified `generate_video` enum; separate tools like `gemini_generate_video_from_image`. Each surfaces its native params. More providers pluggable.
- **Dynamic model IDs** — pass any model string. No hardcoded enums; the MCP stays forward-compatible as providers release new models.
- **Pluggable storage** — `StorageProvider` interface with URI scheme routing. Local + GCS fully implemented. S3 + OneDrive stubbed for contribution.
- **Two-tier tools** — primitives (one-op) and opinionated workflows (chained) clearly separated in descriptions.
- **Prompt guidance** — `*_prompt_guide` tools return structured markdown with official doc links, prompt templates, good/bad examples, and model-specific notes.

See [docs/](docs/) for detailed documentation per area.

## Documentation

| Doc | Covers |
|-----|--------|
| [docs/storage.md](docs/storage.md) | Storage providers, URI routing, extending with new providers |
| [docs/image-gen.md](docs/image-gen.md) | Gemini image generation tools, prompt patterns |
| [docs/video-gen.md](docs/video-gen.md) | Veo video generation tools, tier selection, prompt patterns |
| [docs/video-audio-post.md](docs/video-audio-post.md) | FFmpeg-backed video/audio post-processing tools |
| [docs/workflows.md](docs/workflows.md) | Opinionated compound workflows |
| [docs/prompt-guides.md](docs/prompt-guides.md) | How prompt guides are structured and extended |
| [docs/adr/](docs/adr/) | Architectural decision records |

## Development

```bash
yarn install       # Install dependencies
yarn dev           # Run in development (tsx, no build needed)
yarn build         # Build for production (tsup)

# Checks
yarn lint          # ESLint
yarn lint:fix      # ESLint auto-fix
yarn format        # Prettier write
yarn format:check  # Prettier check
yarn typecheck     # tsc --noEmit
yarn test          # Vitest (unit + integration)
yarn test:unit     # Unit tests only
yarn test:integration  # Integration tests (requires ImageMagick + FFmpeg)
yarn test:coverage # Coverage report
yarn ci            # lint + format:check + typecheck + build + test:unit (what CI runs)
```

## Contributing

Contributions welcome, especially for:

- Additional storage providers (AWS S3, OneDrive, Azure Blob, etc.)
- Additional AI generation providers (Runway, Kling, OpenAI, etc.)
- Audio generation providers (ElevenLabs, Suno, etc.)
- Prompt guide improvements and corrections

See `docs/` for extension contracts. Before opening a PR, please run `yarn ci` to make sure all linting, types, build, and tests pass.

## License

Apache License 2.0 — see [LICENSE](LICENSE).

Copyright 2026 bthurlow.

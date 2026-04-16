# Opinionated Workflows

> **Status**: Planned. Not yet implemented.

Workflows are compound tools that chain multiple primitives into a single call for common creative patterns. Each workflow wraps a sequence of tool invocations (generation, processing, storage) behind a high-level API.

## Planned workflows

| Workflow | Description | Chains |
|----------|-------------|--------|
| Talking-head video | Record → trim → add b-roll → add subtitles → normalize audio → export | video_trim, video_add_b_roll, video_add_subtitles, audio_normalize |
| Social carousel | Generate images → resize per platform → add text overlays → export set | image gen, resize, text-overlay, carousel-set |
| Brand asset pack | Logo input → app icons, favicons, social cards, splash screens, OG images | app-icon-set, favicon-set, social-card, splash-screen, responsive-set |
| Ad creative set | Base design → A/B variants → platform-specific banner sizes → export | banner-set, a-b-variants, cta-button |

## Design principles

- **One call** — a workflow accepts all necessary inputs and produces all outputs without intermediate user intervention.
- **Sensible defaults** — every parameter has a default tuned for the most common use case.
- **Override anything** — every intermediate step's parameters are exposed for fine-tuning.
- **Transparent** — the response describes each step taken, so the user understands what happened.

Contributions welcome. See `src/` for the tool registration pattern.

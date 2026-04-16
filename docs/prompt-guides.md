# Prompt Guides

> **Status**: Planned. Not yet implemented.

Prompt guide tools return structured markdown with best practices for prompting specific AI providers. They are reference tools (no side effects) designed to be called before generation tools to help compose effective prompts.

## Planned guides

| Guide | Provider | Covers |
|-------|----------|--------|
| `gemini_image_prompt_guide` | Gemini | Text-to-image prompting — style keywords, aspect ratio guidance, negative prompts, safety filter avoidance |
| `veo_video_prompt_guide` | Veo | Text-to-video and image-to-video — camera motion terms, scene descriptions, tier selection, duration limits |

## Structure

Each guide returns:

1. **Overview** — what the model does well and poorly
2. **Prompt template** — a fill-in-the-blank structure
3. **Good examples** — field-tested prompts with expected output descriptions
4. **Bad examples** — common mistakes and why they fail
5. **Model-specific notes** — version differences, parameter interactions
6. **Official doc links** — references to the provider's documentation

## Design principles

- Guides are **tools, not static files** — they can be versioned, extended, and called programmatically by AI agents before composing a generation call.
- Content is based on **official documentation + field-tested experience**, not speculation.
- Each guide is self-contained and returns in a single tool call.

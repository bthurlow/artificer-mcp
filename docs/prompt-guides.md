# Prompt Guides

Prompt guide tools return structured markdown with best practices for prompting specific AI providers. They are reference tools (no side effects, no API calls) designed to be called before a generation tool to help the agent compose an effective prompt.

## Shipping guides

| Guide | Provider / model | Covers |
|-------|------------------|--------|
| `gemini_image_prompt_guide` | Imagen 3/4 | Style keywords, aspect ratios, negative prompts, safety-filter avoidance, model-version differences |
| `gemini_nanobanana_prompt_guide` | Gemini 2.5 Flash Image (Nano Banana) | What Nano Banana does better/worse than Imagen, prompt-structure differences, env-var model override |
| `veo_video_prompt_guide` | Veo | Camera motion vocabulary, scene structure, image-to-video aspect-ratio interop, dialogue syntax, Dev API quirks, tier selection |
| `gemini_tts_prompt_guide` | Gemini TTS | Prebuilt voices, natural-language style + accent directives, model tiers (flash vs pro preview) |
| `gemini_lyria_prompt_guide` | Lyria 3 (batch) + Lyria RealTime | Prompt anatomy (genre / tempo / mood / instruments), Lyria 3 Pro timestamps, negative prompts, realtime session lifecycle, safety-filter notes |

## Structure

Each guide returns:

1. **Overview** — what the model does well and poorly
2. **Prompt template** — a fill-in-the-blank structure
3. **Good examples** — field-tested prompts with expected output descriptions
4. **Bad examples** — common mistakes and why they fail
5. **Model-specific notes** — version differences, parameter interactions, env-var overrides
6. **Official doc links** — references to the provider's documentation

## Design principles

- Guides are **tools, not static files** — versioned, call-able by agents, and distributed with the server.
- Content is based on **official documentation + field-tested experience**, not speculation.
- Each guide is self-contained and returns in a single tool call.
- Guides evolve with the APIs — bugs and quirks discovered in real use get folded back in (see the Veo guide's aspect-ratio and dialogue notes).

## Also see

- `brand_spec_get` — not a prompt guide, but returns your project's shared brand defaults (colors, fonts, TTS voice, music prompt, scene description) so agents can compose prompts consistently across tools. See [docs/brand-spec.md](brand-spec.md).

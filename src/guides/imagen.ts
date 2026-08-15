import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const IMAGE_GUIDE = `# Google Imagen — RETIRED

## ⚠️ Imagen is retired in artificer. Use nano-banana.

Google has **deprecated Imagen 4**. \`imagen-4.0-generate-001\` and its siblings are listed under "Previous models" with a shutdown notice ("will be shut down soon; migrate to newer models to prevent service interruptions").

Artificer has retired the Imagen route accordingly:

- **\`model_catalog\` no longer lists an Imagen entry.** \`image.general\` now offers nano-banana only.
- **\`gemini_generate_image\` / \`gemini_edit_image\` remain registered** as thin transports — they take any model ID you pass, so they keep working for anyone with a live Imagen deployment (notably Vertex AI, where deprecation timelines differ). They are no longer a recommended route and have no maintained default.
- **New work should call \`gemini_nanobanana_generate_image\`** and follow \`gemini_nanobanana_prompt_guide\`.

## What to use instead

| You wanted Imagen for… | Use instead |
|---|---|
| Text-to-image generation | \`gemini_nanobanana_generate_image\` (no reference images) |
| Photorealism | \`gemini_nanobanana_generate_image\` — Nano Banana 2 closed most of the fidelity gap that made Imagen the photoreal pick |
| Edits / inpainting / background swap | \`gemini_nanobanana_generate_image\` with \`reference_images\` |
| Composites and style transfer | \`gemini_nanobanana_generate_image\` with \`reference_images\` |
| Text rendering inside an image | \`gemini_nanobanana_generate_image\` (was already the stronger route) |
| N variations of one prompt | Loop \`gemini_nanobanana_generate_image\` client-side — there is no \`number_of_images\` equivalent |
| Upscaling | \`gemini_upscale_image\` (**requires Vertex AI credentials** — see that tool's error message), or a fal upscale route |

## Capabilities that do not carry over

Nano-banana does **not** expose these Imagen-only knobs. Plan around them:

- **\`negative_prompt\`** — unsupported. The Gemini Developer API rejects it outright. Fold exclusions into the positive prompt instead: instead of \`negative_prompt: "text, watermark"\`, write "…clean composition with no text, lettering, or watermarks."
- **\`seed\`** — no reproducibility knob.
- **\`number_of_images\`** — one image per call.
- **\`safety_filter_level\` / \`person_generation\`** — server-side defaults only.
- **\`enhance_prompt\`** — no automatic prompt rewriting.

## Prompt structure still applies

The prompt anatomy that worked for Imagen carries over to nano-banana generation:

\`[Subject] [doing action] in [setting/environment], [style/aesthetic], [lighting], [camera angle/composition], [mood/atmosphere]\`

> "A sleek matte black coffee mug on a marble countertop, morning sunlight streaming through a window, shallow depth of field, warm tones, product photography"

See \`gemini_nanobanana_prompt_guide\` for the full templates, reference-image tips, and the aspect-ratio interop rule for image-to-video handoffs.

## Access routes

Imagen has no catalog route. \`gemini_generate_image\` and \`gemini_edit_image\` remain callable with an explicit \`model\` argument but are unsupported and undefaulted.

## Last verified
2026-08-15 — Imagen 4 deprecation confirmed against ai.google.dev model docs ("Previous models", shutdown notice). Route retired from \`models.json\`; guide converted to a migration pointer.

## Official References
- Model list (current + previous): https://ai.google.dev/gemini-api/docs/models
- Gemini image generation: https://ai.google.dev/gemini-api/docs/image-generation
`;

export function registerImagenPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_image_prompt_guide',
    'RETIRED — Google Imagen is deprecated and has no artificer catalog route. Returns a migration pointer to gemini_nanobanana_generate_image, a capability-mapping table, and the Imagen-only knobs (negative_prompt, seed, number_of_images, safety levels) that do not carry over. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: IMAGE_GUIDE }],
    }),
  );
}

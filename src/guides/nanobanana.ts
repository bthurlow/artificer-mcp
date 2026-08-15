import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const NANOBANANA_GUIDE = `# Gemini Nano-Banana (gemini-3.1-flash-image) — Prompt Guide

## Overview
Nano-banana is a multimodal image model accessed via \`generateContent\` with IMAGE response modality. It accepts **text + reference images** as multimodal parts — enabling generation, edits, composites, style transfer, and reference-guided work from a single tool.

**This is artificer's only Google image route.** Imagen is deprecated by Google and retired from the catalog (see \`gemini_image_prompt_guide\` for the migration mapping), so nano-banana now covers both the from-scratch and the work-with-existing-imagery lanes.

**Strengths:**
- Photoreal generation from text alone
- Edits (add/remove/replace elements in an existing image)
- Composites across multiple references (subject from A, scene from B)
- Style transfer from a reference
- **Text rendering** inside images
- Character consistency across iterations

**Weaknesses:**
- No native batch variations (one image per call; loop for multiples)
- No \`negative_prompt\`, \`seed\`, or \`enhance_prompt\` — these were Imagen-only and did not carry over
- No explicit safety-level knob (server-side defaults only)

## Prompt Templates

**Generation (no references):**
\`[Subject] [action] in [setting], [style], [lighting], [composition]\`

**Edit (1 reference):**
\`In this image, [change description]. Keep [things to preserve].\`

**Composite (2+ references):**
\`Place the [subject from image 1] into the [scene from image 2]. Match the [lighting/style/perspective] of image 2.\`

**Style transfer:**
\`Redraw the subject of image 1 in the style of image 2.\`

## Good Examples

**Edit:**
> "In this image, remove the coffee cup from the table and replace it with a small vase of wildflowers. Keep the lighting and table texture identical." (+ reference image of a table)

**Composite:**
> "Place the sourdough loaf from image 1 onto the marble countertop in image 2. Match the warm morning lighting of image 2 and cast a soft shadow from the loaf." (+ 2 reference images)

**Style transfer:**
> "Redraw this photograph in the style of a loose watercolor illustration with visible brush strokes and bleeding edges, preserving the composition." (+ 1 reference image)

**Text-in-image:**
> "A minimalist product poster that reads 'Sourdough Sunday' in elegant serif lettering, centered, cream background, subtle paper texture, no other elements."

## Bad Examples

> "Make it better" — Too vague. Specify what to change and what to preserve.

> "Remove the background" (no reference image passed) — Nano-banana needs the source image as a reference to edit. Pass it in \`reference_images\`.

> "Generate 4 variations of this prompt" — One image per call. Loop on the client side instead.

## Reference-Image Tips
- The text prompt is the first \`part\`; reference images follow as \`inlineData\` parts.
- 1–3 references is the sweet spot. More than 3 and the model starts blending them unpredictably.
- When referencing multiple images, name them in the prompt ("image 1", "image 2") so the model disambiguates.
- Higher-resolution references preserve more detail.

## Aspect ratio — generate for the platform you'll use

The \`aspect_ratio\` you pass must match the aspect ratio of the downstream destination. Nano-banana composes the scene natively at the requested aspect — it does not re-crop a square generation into a portrait intelligently, so generating at the wrong aspect and hoping to crop later produces bad framing (subjects centered for 1:1 end up cut off at 9:16).

**Critical interop rule — image-to-video:** If the generated image will be fed into Veo as an image-to-video source (\`gemini_generate_video\` with \`image=\` set), the image aspect **must match** the target video aspect. Veo honors the container size you request but composes based on the source image's aspect, so a 1:1 source going into a 9:16 video renders like a "zoomed wide shot cropped vertically" — it does not generate a true portrait composition. Always pre-generate the reference at the target aspect before calling Veo.

**Standard social aspects — pick by destination:**

| Aspect | Dimensions (1080 long edge) | Primary use |
|---|---|---|
| 9:16 | 1080 × 1920 | TikTok, Instagram Reels, Stories, YouTube Shorts, Facebook Reels |
| 1:1 | 1080 × 1080 | Instagram carousel, Facebook feed, LinkedIn feed |
| 4:5 | 1080 × 1350 | Instagram feed preferred — Meta's recommended aspect; more screen real estate on mobile |
| 16:9 | 1920 × 1080 | YouTube thumbnails, blog hero images, LinkedIn native video, web embeds |
| 2:3 | 1080 × 1620 | Pinterest standard pin — taller pins get more organic distribution |
| 1.91:1 | 1200 × 628 | Facebook/Instagram link cards, Open Graph images for blog shares |
| 3:4 | 1080 × 1440 | Older Instagram portrait, some Pinterest content |

**Pre-generation workflow for campaign assets:** if one reference asset will be used across multiple destinations (e.g., a character, a product shot), generate it once per target aspect up front. Don't generate at 1:1 and try to reuse for 9:16 video or 2:3 Pinterest — quality degrades from cropping, and image-to-video breaks.

## Model-Specific Notes
- **gemini-3.1-flash-image** (Nano Banana 2) — Production default. Fast (seconds, not minutes). Override via \`ARTIFICER_NANOBANANA_MODEL\` env var.
- **Siblings** you can pass explicitly via \`model\` or the env override: \`gemini-3.1-flash-lite-image\` (Nano Banana 2 Lite — cheaper/faster) and \`gemini-3-pro-image\` (Nano Banana Pro — highest fidelity). \`gemini-2.5-flash-image\` is the previous generation and still active.
- **Resolution drives cost** — roughly $0.045 per 0.5K image, $0.067 per 1K, $0.101 per 2K, $0.151 per 4K.
- **aspect_ratio**: Optional hint but strongly recommended when composition matters. Common values: 1:1, 3:4, 4:3, 9:16, 16:9, 4:5, 2:3, 1.91:1. See "Aspect ratio" section above for the interop rule with Veo image-to-video.
- **include_text**: If true, the model can emit a text commentary alongside the image — useful when you want the model to _explain_ what it changed.
- **No negative prompts / seed / enhance_prompt / safety knobs.** These were Imagen-only and Imagen is retired — there is no route that offers them. **Express exclusions as positive prompt language**: instead of \`negative_prompt: "blurry, text, watermark"\`, write "…sharp focus throughout, clean composition with no text, lettering, or watermarks." Use explicit preservation language on edits ("keep the lighting", "do not change the pose").

## Access routes

| Provider | Tool                                  | Model ID                    | Cost                   | Notes |
|----------|---------------------------------------|-----------------------------|------------------------|-------|
| google   | \`gemini_nanobanana_generate_image\`  | \`gemini-3.1-flash-image\`  | $0.045 (0.5K) / $0.067 (1K) / $0.101 (2K) / $0.151 (4K) per image | Multimodal (text + reference images). Exposes \`aspect_ratio\`, \`reference_images[]\`, \`include_text\`. No \`seed\` / \`number_of_images\` / \`negative_prompt\` / safety knobs. |

Nano-banana is Google-route only. Fal hosts other multimodal image models (Flux, Seedream, etc.) — those are their own logical models with their own guides when the fal image transport lands.

## Last verified
2026-08-15 against artificer-mcp — prompt structure, aspect interop rule, and reference-image limits validated through shipping use. Model ID promoted from \`gemini-2.5-flash-image\` to \`gemini-3.1-flash-image\` and pricing added, verified against ai.google.dev model + pricing docs 2026-08-15.

## Official References
- Gemini image-generation docs: https://ai.google.dev/gemini-api/docs/image-generation
- Model list: https://ai.google.dev/gemini-api/docs/models
- Pricing: https://ai.google.dev/gemini-api/docs/pricing
`;

export function registerNanobananaPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_nanobanana_prompt_guide',
    "Get structured prompt guidance for Gemini nano-banana (gemini-3.1-flash-image) — artificer's only Google image route now that Imagen is retired. Covers templates for generation/edit/composite/style transfer, reference-image tips, the aspect-ratio interop rule for image-to-video, model siblings and per-resolution pricing, and how to express exclusions without negative_prompt. No API call — pure reference.",
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: NANOBANANA_GUIDE }],
    }),
  );
}

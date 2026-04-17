import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const IMAGE_GUIDE = `# Gemini Image Generation — Prompt Guide

## Overview
Google Imagen generates high-quality images from text prompts. It excels at photorealistic scenes, artistic styles, and product visualization. It can struggle with precise text rendering, complex spatial relationships, and counting specific numbers of objects.

## Prompt Template
\`[Subject] [doing action] in [setting/environment], [style/aesthetic], [lighting], [camera angle/composition], [mood/atmosphere]\`

## Good Examples

**Photorealistic product shot:**
> "A sleek matte black coffee mug on a marble countertop, morning sunlight streaming through a window, shallow depth of field, warm tones, product photography"

**Artistic illustration:**
> "A cozy bookshop interior with floor-to-ceiling shelves, a cat sleeping on a stack of books, warm golden lamp light, watercolor illustration style, whimsical atmosphere"

**Social media content:**
> "Flat lay of fresh baking ingredients on a rustic wooden table — flour, eggs, butter, vanilla, chocolate chips — overhead shot, bright natural lighting, food photography style"

## Bad Examples

> "A nice picture" — Too vague. Specify subject, style, lighting, composition.

> "Generate me 5 red cars and 3 blue trucks" — Imagen struggles with precise counting. Keep object counts simple.

> "Text that says SALE 50% OFF" — Text rendering is unreliable. Use ImageMagick text-overlay tools for precise text.

## Model-Specific Notes

- **imagen-4.0-generate-001** — Latest model. Best quality. Supports \`enhancePrompt\` for automatic prompt improvement.
- **Aspect ratios**: 1:1, 3:4, 4:3, 9:16, 16:9. Choose based on platform (1:1 for Instagram, 9:16 for Stories/Reels, 16:9 for YouTube thumbnails).
- **Negative prompts**: Use to exclude unwanted elements ("blurry, low quality, text, watermark").
- **Safety filters**: Default is BLOCK_MEDIUM_AND_ABOVE. Lower to BLOCK_ONLY_HIGH for creative freedom; raise for child-safe content.
- **Seed**: Set for reproducibility. Same seed + same prompt = same image.

## When to use nano-banana instead
For **edits, composites, style transfer, text rendering, or reference-guided generation**, prefer \`gemini_nanobanana_generate_image\` and its dedicated \`gemini_nanobanana_prompt_guide\`. Imagen is stronger for clean one-shot photorealism and multi-variation batches; nano-banana is stronger when you need to work _with_ existing imagery.

## Official References
- Imagen API: https://ai.google.dev/gemini-api/docs/imagen
- Model cards: https://ai.google.dev/gemini-api/docs/models/imagen
`;

const NANOBANANA_GUIDE = `# Gemini Nano-Banana (gemini-2.5-flash-image) — Prompt Guide

## Overview
Nano-banana is a multimodal image model accessed via \`generateContent\` with IMAGE response modality. Unlike Imagen (text-only input), nano-banana accepts **text + reference images** as multimodal parts — enabling edits, composites, style transfer, and reference-guided generation from a single tool.

**Strengths:**
- Edits (add/remove/replace elements in an existing image)
- Composites across multiple references (subject from A, scene from B)
- Style transfer from a reference
- **Text rendering** inside images (usually more reliable than Imagen)
- Character consistency across iterations

**Weaknesses:**
- Lower max fidelity than Imagen 4 for pristine photorealism
- No native batch variations (one image per call; loop for multiples)
- No explicit safety-level knob (server-side defaults only)

## When to use nano-banana vs Imagen
| Task | Pick |
|---|---|
| Generate a brand-new image from text only, photoreal quality matters | Imagen |
| Edit an existing image (remove/add/change something) | Nano-banana |
| Composite multiple images | Nano-banana |
| Apply the style of reference A to image B | Nano-banana |
| Render specific text inside the image | Nano-banana |
| 4 variations of the same prompt | Imagen (\`number_of_images\`) |
| Maintain a character across edits | Nano-banana |

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

## Model-Specific Notes
- **gemini-2.5-flash-image** — Production model. Fast (seconds, not minutes). Override via \`ARTIFICER_NANOBANANA_MODEL\` env var.
- **aspect_ratio**: Optional hint. Same set as Imagen (1:1, 3:4, 4:3, 9:16, 16:9).
- **include_text**: If true, the model can emit a text commentary alongside the image — useful when you want the model to _explain_ what it changed.
- **No negative prompts / seed / enhance_prompt / safety knobs** — these are Imagen-only. Use explicit preservation language in the prompt instead ("keep the lighting", "do not change the pose").

## Official References
- Gemini image-generation docs: https://ai.google.dev/gemini-api/docs/image-generation
- Model card (gemini-2.5-flash-image): https://ai.google.dev/gemini-api/docs/models
`;

const VIDEO_GUIDE =`# Veo Video Generation — Prompt Guide

## Overview
Google Veo generates short videos (5-8 seconds) from text prompts or text + image. Best for establishing shots, product demos, ambient scenes, and social content. Currently limited in precise character animation and dialogue sync.

## Prompt Template
\`[Camera movement] of [subject] [doing action] in [setting], [visual style], [lighting], [mood]\`

## Good Examples

**Establishing shot:**
> "Slow aerial drone shot of a coastal town at golden hour, Mediterranean architecture with white buildings and blue roofs, warm cinematic lighting, 4K film quality"

**Product demo:**
> "Smooth tracking shot of a pour-over coffee brewing process, steam rising from the cup, close-up macro detail, warm morning light, minimalist kitchen background"

**Social content (image-to-video):**
> "Gentle zoom in with subtle parallax movement, soft natural lighting, cozy atmosphere" (with an input image of a bakery scene)

## Bad Examples

> "A person talking to the camera" — Veo struggles with lip sync and natural human motion. Use real footage for talking heads.

> "Fast action sequence with explosions" — Complex physics and rapid motion tend to produce artifacts.

> "A 30-second commercial" — Veo generates 5-8 second clips. Plan your story in short segments and use video_concatenate or video_add_transitions to join them.

## Image-to-Video Tips

Providing an input image dramatically improves consistency:
1. Generate or prepare a high-quality still frame
2. Pass it as the \`image\` parameter
3. Keep the prompt focused on MOTION and CAMERA, not scene description (the image provides that)
4. Works best with: zoom, pan, parallax, gentle camera movements

## Model-Specific Notes

- **veo-2.0-generate-001** — Current production model. 5-8 second clips at 720p or 1080p.
- **Aspect ratios**: 16:9 (landscape) or 9:16 (portrait). Choose based on platform.
- **generate_audio**: Set to true for ambient audio generation (model-dependent).
- **Polling**: Video generation takes 30-120 seconds typically. Default poll timeout is 5 minutes.
- **Cost**: Varies by model tier. Veo Lite is ~$0.05/sec of generated video.

## Workflow: Talking-Head Video

Veo alone can't do talking heads. Recommended pipeline:
1. Record real talking-head footage
2. Use \`video_trim\` to cut segments
3. Generate b-roll with Veo (\`gemini_generate_video\`)
4. Use \`video_add_b_roll\` to insert b-roll as cutaways
5. Use \`video_add_subtitles\` for captions
6. Use \`audio_normalize\` for consistent loudness

## Official References
- Veo API: https://ai.google.dev/gemini-api/docs/veo
- Model cards: https://ai.google.dev/gemini-api/docs/models/veo
`;

/**
 * Register prompt guide tools with the MCP server.
 *
 * Covers: gemini_image_prompt_guide, veo_video_prompt_guide.
 *
 * These are pure reference tools — no side effects, no API calls.
 * They return structured markdown to help compose effective prompts.
 */
export function registerGuideTools(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_image_prompt_guide',
    'Get structured prompt guidance for Gemini/Imagen image generation. Returns best practices, templates, good/bad examples, and model-specific notes. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: IMAGE_GUIDE }],
    }),
  );

  registerTool<Record<string, never>>(
    server,
    'gemini_nanobanana_prompt_guide',
    'Get structured prompt guidance for Gemini nano-banana (gemini-2.5-flash-image). Covers when to use it over Imagen, templates for generation/edit/composite/style transfer, reference-image tips, and model-specific notes. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: NANOBANANA_GUIDE }],
    }),
  );

  registerTool<Record<string, never>>(
    server,
    'veo_video_prompt_guide',
    'Get structured prompt guidance for Veo video generation. Returns best practices, templates, good/bad examples, image-to-video tips, and workflow patterns. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: VIDEO_GUIDE }],
    }),
  );
}

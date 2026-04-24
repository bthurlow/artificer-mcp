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

## Access routes

| Provider | Tool                     | Model ID                       | Cost                   | Notes |
|----------|--------------------------|--------------------------------|------------------------|-------|
| google   | \`gemini_generate_image\`  | \`imagen-4.0-generate-001\` (default) | See Google Cloud pricing | Exposes \`number_of_images\` (1-4), \`aspect_ratio\`, \`seed\`, \`safety_filter_level\`, \`person_generation\`, \`enhance_prompt\`, \`negative_prompt\`. |

Fal hosts Imagen routes as well; they land in Phase 4 alongside the \`fal_generate_image\` transport when a pipeline use case emerges. Until then, Imagen is Google-route only.

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — prompt structure and parameter set validated through shipping use.

## Official References
- Imagen API: https://ai.google.dev/gemini-api/docs/imagen
- Model cards: https://ai.google.dev/gemini-api/docs/models/imagen
`;

export function registerImagenPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_image_prompt_guide',
    'Get structured prompt guidance for Gemini/Imagen image generation. Returns best practices, templates, good/bad examples, and model-specific notes. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: IMAGE_GUIDE }],
    }),
  );
}

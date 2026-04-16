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

## Official References
- Imagen API: https://ai.google.dev/gemini-api/docs/imagen
- Model cards: https://ai.google.dev/gemini-api/docs/models/imagen
`;

const VIDEO_GUIDE = `# Veo Video Generation — Prompt Guide

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
    'veo_video_prompt_guide',
    'Get structured prompt guidance for Veo video generation. Returns best practices, templates, good/bad examples, image-to-video tips, and workflow patterns. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: VIDEO_GUIDE }],
    }),
  );
}

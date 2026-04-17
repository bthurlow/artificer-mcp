import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { getGenAIClient } from './client.js';
import { getProvider } from '../storage/providers/registry.js';
import {
  type GenerateImageParams,
  type EditImageParams,
  type UpscaleImageParams,
  generateImageSchema,
  editImageSchema,
  upscaleImageSchema,
} from './types.js';
import type {
  SafetyFilterLevel,
  PersonGeneration,
  EditMode,
  RawReferenceImage,
  MaskReferenceImage,
} from '@google/genai';

/** Write generated images to numbered output paths and return descriptions. */
async function writeGeneratedImages(
  images: Array<{
    image?: { imageBytes?: string; mimeType?: string };
    raiFilteredReason?: string;
    enhancedPrompt?: string;
  }>,
  output: string,
): Promise<string[]> {
  const ext = extname(output) || '.png';
  const base = output.slice(0, -ext.length);
  const lines: string[] = [];
  let written = 0;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (img.raiFilteredReason) {
      lines.push(`Image ${i + 1}: blocked by safety filter — ${img.raiFilteredReason}`);
      continue;
    }
    if (!img.image?.imageBytes) {
      lines.push(`Image ${i + 1}: no image data returned`);
      continue;
    }
    const path = images.length === 1 ? output : `${base}_${i + 1}${ext}`;
    const bytes = Buffer.from(img.image.imageBytes, 'base64');
    await getProvider(path).write(path, bytes, img.image.mimeType ?? 'image/png');
    written++;
    lines.push(`Image ${i + 1}: saved to ${path}`);
    if (img.enhancedPrompt) {
      lines.push(`  Enhanced prompt: ${img.enhancedPrompt}`);
    }
  }
  if (written === 0) {
    lines.unshift('No images were generated (all filtered or empty).');
  }
  return lines;
}

/**
 * Register image generation tools with the MCP server.
 *
 * Covers: gemini_generate_image, gemini_edit_image, gemini_upscale_image.
 */
export function registerImageGenTools(server: McpServer): void {
  // ── gemini_generate_image ──────────────────────────────────────────────
  registerTool<GenerateImageParams>(
    server,
    'gemini_generate_image',
    'Generate images from a text prompt via Google Imagen. Returns 1-4 images saved to the output path. Uses GOOGLE_API_KEY env var.',
    generateImageSchema.shape,
    async ({
      model,
      prompt,
      output,
      negative_prompt,
      number_of_images,
      aspect_ratio,
      seed,
      safety_filter_level,
      person_generation,
      enhance_prompt,
    }) => {
      const client = getGenAIClient();
      const response = await client.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: number_of_images,
          aspectRatio: aspect_ratio,
          negativePrompt: negative_prompt,
          seed,
          ...(safety_filter_level
            ? { safetyFilterLevel: safety_filter_level as SafetyFilterLevel }
            : {}),
          ...(person_generation
            ? { personGeneration: person_generation as PersonGeneration }
            : {}),
          ...(enhance_prompt ? { enhancePrompt: true } : {}),
          outputMimeType: `image/${(extname(output).slice(1) || 'png').toLowerCase()}`,
        },
      });

      const images = response.generatedImages ?? [];
      const lines = await writeGeneratedImages(images, output);

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    },
  );

  // ── gemini_edit_image ──────────────────────────────────────────────────
  registerTool<EditImageParams>(
    server,
    'gemini_edit_image',
    'Edit an existing image with a text instruction via Google Imagen. Supports inpainting, outpainting, style transfer, background swap, and more.',
    editImageSchema.shape,
    async ({
      model,
      prompt,
      image,
      output,
      edit_mode,
      mask_image,
      negative_prompt,
      number_of_images,
      seed,
    }) => {
      const client = getGenAIClient();
      const imageBytes = await readFile(image);

      const referenceImages: Array<RawReferenceImage | MaskReferenceImage> = [
        {
          referenceImage: {
            imageBytes: imageBytes.toString('base64'),
            mimeType: `image/${(extname(image).slice(1) || 'png').toLowerCase()}`,
          },
          referenceType: 'REFERENCE_TYPE_RAW',
        } as RawReferenceImage,
      ];

      if (mask_image) {
        const maskBytes = await readFile(mask_image);
        referenceImages.push({
          referenceImage: {
            imageBytes: maskBytes.toString('base64'),
            mimeType: `image/${(extname(mask_image).slice(1) || 'png').toLowerCase()}`,
          },
          referenceType: 'REFERENCE_TYPE_MASK',
          config: { maskMode: 'MASK_MODE_FOREGROUND' },
        } as unknown as MaskReferenceImage);
      }

      const response = await client.models.editImage({
        model,
        prompt,
        referenceImages,
        config: {
          editMode: edit_mode as EditMode,
          negativePrompt: negative_prompt,
          numberOfImages: number_of_images,
          seed,
        },
      });

      const images = response.generatedImages ?? [];
      const lines = await writeGeneratedImages(images, output);

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    },
  );

  // ── gemini_upscale_image ───────────────────────────────────────────────
  registerTool<UpscaleImageParams>(
    server,
    'gemini_upscale_image',
    'Upscale an image 2x or 4x via Google Imagen. Improves resolution while preserving quality.',
    upscaleImageSchema.shape,
    async ({ model, image, output, upscale_factor }) => {
      const client = getGenAIClient();
      const imageBytes = await readFile(image);

      const response = await client.models.upscaleImage({
        model,
        image: {
          imageBytes: imageBytes.toString('base64'),
          mimeType: `image/${(extname(image).slice(1) || 'png').toLowerCase()}`,
        },
        upscaleFactor: upscale_factor,
        config: {
          outputMimeType: `image/${(extname(output).slice(1) || 'png').toLowerCase()}`,
        },
      });

      const images = response.generatedImages ?? [];
      const lines = await writeGeneratedImages(images, output);

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    },
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { getGenAIClient } from './client.js';
import { getProvider } from '../storage/providers/registry.js';
import { resolveInput, type ResolvedInput } from '../utils/resource.js';
import { type NanobananaGenerateImageParams, nanobananaGenerateImageSchema } from './types.js';

/**
 * Infer an image MIME type from a file path extension.
 * Defaults to image/png when the extension is missing or unknown.
 */
function mimeFromPath(path: string): string {
  const ext = extname(path).slice(1).toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'gif':
      return 'image/gif';
    case '':
    case 'png':
    default:
      return 'image/png';
  }
}

/**
 * Register the nano-banana (gemini-2.5-flash-image) generation tool with the MCP server.
 *
 * Unlike Imagen (`generateImages` endpoint), nano-banana uses `generateContent`
 * with IMAGE response modality and accepts both text prompts and reference
 * images as multimodal `parts` — enabling generation, edit, and composite
 * through a single tool.
 */
export function registerNanobananaTools(server: McpServer): void {
  registerTool<NanobananaGenerateImageParams>(
    server,
    'gemini_nanobanana_generate_image',
    'Generate or edit an image via Gemini nano-banana (gemini-2.5-flash-image). Pass reference_images for edit/composite/style-transfer. Uses GOOGLE_API_KEY.',
    nanobananaGenerateImageSchema.shape,
    async ({ model, prompt, output, reference_images, aspect_ratio, include_text }) => {
      const client = getGenAIClient();

      // Resolve reference images through the storage abstraction so remote URIs work.
      const resolvedRefs: ResolvedInput[] = [];
      if (reference_images) {
        for (const refPath of reference_images) {
          resolvedRefs.push(await resolveInput(refPath));
        }
      }
      try {
      // Build the multimodal parts array: prompt text + any reference images.
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
        { text: prompt },
      ];
      if (reference_images) {
        for (let i = 0; i < reference_images.length; i++) {
          const bytes = await readFile(resolvedRefs[i].localPath);
          parts.push({
            inlineData: {
              mimeType: mimeFromPath(reference_images[i]),
              data: bytes.toString('base64'),
            },
          });
        }
      }

      const responseModalities = include_text ? ['IMAGE', 'TEXT'] : ['IMAGE'];

      // Nano-banana models take aspect ratio as a generation-config hint when supported.
      const config: Record<string, unknown> = { responseModalities };
      if (aspect_ratio) {
        config.imageConfig = { aspectRatio: aspect_ratio };
      }

      // The @google/genai SDK typings for generateContent are strict on unions;
      // cast through unknown for the multimodal parts + imageConfig fields.
      const response = await client.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config,
      } as unknown as Parameters<typeof client.models.generateContent>[0]);

      const candidate = response.candidates?.[0];
      const responseParts = candidate?.content?.parts ?? [];

      const lines: string[] = [];
      let written = 0;
      let imageIndex = 0;
      const ext = extname(output) || '.png';
      const base = output.slice(0, -ext.length);

      for (const part of responseParts) {
        const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
        const text = (part as { text?: string }).text;
        if (inline?.data) {
          imageIndex++;
          const path = imageIndex === 1 ? output : `${base}_${imageIndex}${ext}`;
          const bytes = Buffer.from(inline.data, 'base64');
          await getProvider(path).write(path, bytes, inline.mimeType ?? 'image/png');
          written++;
          lines.push(`Image ${imageIndex}: saved to ${path}`);
        } else if (text) {
          lines.push(`Text: ${text}`);
        }
      }

      if (written === 0) {
        const finishReason = candidate?.finishReason;
        const safety = candidate?.safetyRatings
          ?.filter((r) => r.blocked)
          ?.map((r) => r.category)
          ?.join(', ');
        const reason =
          safety && safety.length > 0
            ? `blocked by safety filter (${safety})`
            : finishReason
              ? `finishReason=${finishReason}`
              : 'no image data returned';
        lines.unshift(`No images were generated — ${reason}.`);
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
      } finally {
        await Promise.all(resolvedRefs.map((r) => r.cleanup?.()));
      }
    },
  );
}

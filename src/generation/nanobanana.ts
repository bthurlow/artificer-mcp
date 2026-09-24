import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { magick, tempPath } from '../utils/exec.js';
import { getGenAIClient } from './client.js';
import { getProvider } from '../storage/providers/registry.js';
import { resolveInput, type ResolvedInput } from '../utils/resource.js';
import { type NanobananaGenerateImageParams, nanobananaGenerateImageSchema } from './types.js';
import {
  formatFromExtension,
  imageDimensions,
  sniffImageFormat,
  sniffImageMime,
} from './image-bytes.js';

/**
 * Make the bytes match the format the output extension promises.
 *
 * The model picks its own encoding (in practice JPEG, even for a `.png`
 * request), and the Gemini API has no output-MIME option; that is
 * Vertex-only. So convert locally when the bytes and the extension
 * disagree. Bytes that already match are written untouched.
 */
export async function matchRequestedFormat(
  bytes: Buffer,
  outputPath: string,
  apiMime: string | undefined,
): Promise<{ bytes: Buffer; mime: string; note?: string }> {
  const actual = sniffImageFormat(bytes);
  const ext = extname(outputPath).slice(1).toLowerCase();
  const wanted = formatFromExtension(ext);
  if (!actual || !wanted || actual === wanted) {
    const note =
      actual && ext && !wanted
        ? `${actual.magick} bytes; .${ext} is not a format this tool converts to`
        : undefined;
    return { bytes, mime: actual?.mime ?? apiMime ?? 'image/png', note };
  }
  const src = tempPath(`.${actual.ext}`);
  const dst = tempPath(`.${wanted.ext}`);
  try {
    await writeFile(src, bytes);
    await magick([src, `${wanted.magick}:${dst}`]);
    return {
      bytes: await readFile(dst),
      mime: wanted.mime,
      note: `converted from ${actual.magick} to ${wanted.magick}`,
    };
  } finally {
    await Promise.all([rm(src, { force: true }), rm(dst, { force: true })]);
  }
}

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
    'Generate or edit an image via Gemini nano-banana (default gemini-3.1-flash-image). Pass reference_images for edit/composite/style-transfer, and image_size ("2K"/"4K") for more than the ~1K default. The file format follows the output extension (png/jpg/webp/gif), converting when the model returns a different encoding. Uses GOOGLE_API_KEY.',
    nanobananaGenerateImageSchema.shape,
    async ({ model, prompt, output, reference_images, aspect_ratio, image_size, include_text }) => {
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
                // Trust the bytes over the name: a reused output may carry the
                // wrong extension (JPEG in a .png, TODO #25).
                mimeType: sniffImageMime(bytes) ?? mimeFromPath(reference_images[i]),
                data: bytes.toString('base64'),
              },
            });
          }
        }

        const responseModalities = include_text ? ['IMAGE', 'TEXT'] : ['IMAGE'];

        // Nano-banana models take aspect ratio as a generation-config hint when supported.
        const config: Record<string, unknown> = { responseModalities };
        const imageConfig: Record<string, string> = {};
        if (aspect_ratio) imageConfig.aspectRatio = aspect_ratio;
        // Only sent when asked for, so existing calls keep the API's 1K default.
        if (image_size) imageConfig.imageSize = image_size;
        if (Object.keys(imageConfig).length > 0) config.imageConfig = imageConfig;

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
            const raw = Buffer.from(inline.data, 'base64');
            const out = await matchRequestedFormat(raw, path, inline.mimeType);
            await getProvider(path).write(path, out.bytes, out.mime);
            written++;
            const dims = imageDimensions(raw);
            const details = [dims ? `${dims.width}×${dims.height}` : undefined, out.note].filter(
              Boolean,
            );
            lines.push(
              `Image ${imageIndex}: saved to ${path}${details.length ? ` (${details.join(', ')})` : ''}`,
            );
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

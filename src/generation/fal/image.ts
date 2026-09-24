import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { extname } from 'node:path';
import { registerTool } from '../../utils/register.js';
import { downloadAndWrite } from '../utils/download-and-write.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { resolveExtraFiles } from './inputs.js';
import { checkExtraParams } from './extra-params.js';
import { type FalGenerateImageParams, falGenerateImageSchema } from './types-image.js';

/** Payload keys set from structural args. Structural args win over extra_params. */
const STRUCTURAL_FAL_KEYS = new Set([
  'prompt',
  'image_url',
  'image_urls',
  'mask_url',
  'aspect_ratio',
  'image_size',
  'resolution',
  'num_images',
  'negative_prompt',
]);

/**
 * Build the fal input payload. Same precedence rule as `fal_generate_video`:
 * structural args win, and a collision with extra_params is reported so
 * the override is visible.
 */
export function buildFalImageInput(
  structural: Record<string, unknown>,
  extra: Record<string, unknown> | undefined,
): { input: Record<string, unknown>; collisions: string[] } {
  const input: Record<string, unknown> = { ...(extra ?? {}) };
  const collisions: string[] = [];
  for (const [key, value] of Object.entries(structural)) {
    if (value === undefined) continue;
    if (key in input && STRUCTURAL_FAL_KEYS.has(key)) collisions.push(key);
    input[key] = value;
  }
  return { input, collisions };
}

export interface FalImageFile {
  url: string;
  content_type?: string;
  width?: number;
  height?: number;
}

function asImageFile(v: unknown): FalImageFile | undefined {
  if (typeof v !== 'object' || v === null) return undefined;
  const url = (v as { url?: unknown }).url;
  if (typeof url !== 'string' || url.length === 0) return undefined;
  return v as FalImageFile;
}

/**
 * Pull the images out of a fal response, plus a short list of anything
 * else worth telling the caller about.
 *
 * Generation and edit models return `images: [{ url, … }]`; task models
 * (upscalers, background removal) return a single `image: { url }`; a few
 * return both, describing the same result, so `images` wins when present.
 * Other file outputs (masks, layers, zips) are reported by URL, not
 * downloaded: they vary per model and the caller asked for one output path.
 */
export function extractImageOutputs(data: unknown): { images: FalImageFile[]; notes: string[] } {
  if (typeof data !== 'object' || data === null) {
    throw new Error(`fal returned a non-object result (got ${typeof data}); expected images`);
  }
  const record = data as Record<string, unknown>;
  const list = Array.isArray(record.images)
    ? record.images.map(asImageFile).filter((f): f is FalImageFile => f !== undefined)
    : [];
  const single = asImageFile(record.image);
  const images = list.length > 0 ? list : single ? [single] : [];
  if (images.length === 0) {
    throw new Error('fal response has no `images[].url` or `image.url`');
  }

  const notes: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (key === 'images' || key === 'image') continue;
    const file = asImageFile(value);
    if (file) {
      notes.push(`Also returned ${key}: ${file.url}`);
    } else if (Array.isArray(value) && value.length > 0 && value.every((v) => asImageFile(v))) {
      notes.push(
        `Also returned ${key} (${value.length}): ${value.map((v) => (v as FalImageFile).url).join(', ')}`,
      );
    }
  }
  if (Array.isArray(record.has_nsfw_concepts) && record.has_nsfw_concepts.some(Boolean)) {
    notes.push('fal flagged NSFW content (has_nsfw_concepts); the image may be blurred or blank.');
  }
  for (const key of ['revised_prompt', 'description']) {
    const text = record[key];
    if (typeof text === 'string' && text.trim()) notes.push(`${key}: ${text.trim()}`);
  }
  if (typeof record.seed === 'number') notes.push(`seed: ${record.seed}`);
  return { images, notes };
}

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

/** Path for the n-th image (1-based): the output itself, then <name>_2, <name>_3, … */
export function nthOutputPath(output: string, n: number): string {
  if (n === 1) return output;
  const ext = extname(output);
  return `${ext ? output.slice(0, -ext.length) : output}_${n}${ext}`;
}

export function registerFalImageTools(server: McpServer): void {
  registerTool<FalGenerateImageParams>(
    server,
    'fal_generate_image',
    'Generate, edit, upscale or cut out images via any fal-hosted image model. Transport tool: pass an explicit `model` (no server-side default); use `model_catalog` (capability "image") to discover models and the matching prompt guide to learn their inputs. Images are saved exactly as the model returns them; choose a format with extra_params.output_format where the model supports it. Uses FAL_KEY env var.',
    falGenerateImageSchema.shape,
    async ({
      model,
      prompt,
      output,
      image,
      images,
      mask,
      aspect_ratio,
      image_size,
      resolution,
      num_images,
      negative_prompt,
      extra_params,
      extra_files,
      poll_timeout_seconds,
    }) => {
      const client = getFalClient();
      const upload = (b: Blob): Promise<string> => client.storage.upload(b);

      // Structural file args resolve exactly like extra_files (upload when local).
      const structuralFiles: Record<string, string | string[]> = {};
      if (image) structuralFiles.image_url = image;
      if (images) structuralFiles.image_urls = images;
      if (mask) structuralFiles.mask_url = mask;
      const filesResolved = await resolveExtraFiles(structuralFiles, upload);
      const extraFilesResolved = await resolveExtraFiles(extra_files, upload);

      try {
        const mergedExtra = { ...(extra_params ?? {}), ...extraFilesResolved.resolved };
        const { input, collisions } = buildFalImageInput(
          {
            prompt,
            ...filesResolved.resolved,
            aspect_ratio,
            image_size,
            resolution,
            num_images,
            negative_prompt,
          },
          mergedExtra,
        );

        if (collisions.length > 0) {
          console.error(
            `fal_generate_image: ${collisions.join(', ')} present in extra_params ` +
              `but also as structural arg(s); structural args win. ` +
              `Remove from extra_params to silence this warning.`,
          );
        }
        for (const warning of await checkExtraParams('fal_generate_image', model, mergedExtra)) {
          console.error(warning);
        }

        let result;
        try {
          result = await client.subscribe(model, {
            input,
            logs: true,
            startTimeout: poll_timeout_seconds,
          });
        } catch (err) {
          const falErr = parseFalError(err);
          throw new Error(
            `fal_generate_image failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
              `status=${falErr.status}, retryable=${falErr.retryable}, ` +
              `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
            { cause: err },
          );
        }

        const { images: files, notes } = extractImageOutputs(result.data);
        const lines: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const path = nthOutputPath(output, i + 1);
          const { mime, bytes } = await downloadAndWrite(files[i].url, path, {
            defaultMime: files[i].content_type ?? 'image/png',
          });
          const details = [
            files[i].width && files[i].height ? `${files[i].width}×${files[i].height}` : undefined,
            mime,
            `${bytes} bytes`,
          ].filter(Boolean);
          const expected = MIME_BY_EXT[extname(path).slice(1).toLowerCase()];
          const mismatch =
            expected && expected !== mime
              ? `; saved as returned, so the .${extname(path).slice(1)} extension does not match the ${mime} bytes`
              : '';
          lines.push(`Image ${i + 1}: saved to ${path} (${details.join(', ')}${mismatch})`);
        }

        return {
          content: [
            {
              type: 'text',
              text: [
                `fal model "${model}" returned ${files.length} image(s).`,
                ...lines,
                ...notes,
              ].join('\n'),
            },
          ],
        };
      } finally {
        await filesResolved.cleanup();
        await extraFilesResolved.cleanup();
      }
    },
  );
}

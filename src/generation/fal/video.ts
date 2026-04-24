import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { registerTool } from '../../utils/register.js';
import { resolveInput, guessMime } from '../../utils/resource.js';
import { downloadAndWrite } from '../utils/download-and-write.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { type FalGenerateVideoParams, falGenerateVideoSchema } from './types.js';

/**
 * Keys we map onto the fal payload from top-level tool args. Used to detect
 * collisions with `extra_params`: if the caller passes e.g. `image_url`
 * via `extra_params` AND also passes `image` as a structural arg, the
 * structural arg wins and we log a warning so the override is visible.
 */
const STRUCTURAL_FAL_KEYS = new Set([
  'prompt',
  'image_url',
  'audio_url',
  'duration',
  'aspect_ratio',
  'resolution',
  'negative_prompt',
]);

function isPublicHttpsUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

/**
 * Resolve an input that may be a public HTTP(S) URL, a `gs://` / `s3://`
 * URI, or a local path, into a URL fal can fetch.
 *
 * Public HTTPS URLs pass straight through (Q2 bake-off confirmed fal
 * fetches `storage.googleapis.com/...` objects without re-upload). For
 * anything else we resolve to a local path via the storage registry and
 * upload to fal's object store, returning the fal-hosted URL.
 *
 * Returns `{ url, cleanup }` where cleanup removes any temp download from
 * the resolveInput step. Safe to call `cleanup()` even when no temp was
 * created (it's a no-op in that case).
 */
async function resolveForFal(
  input: string,
  upload: (blob: Blob) => Promise<string>,
): Promise<{ url: string; cleanup: () => Promise<void> }> {
  if (isPublicHttpsUrl(input)) {
    return { url: input, cleanup: async () => {} };
  }
  const resolved = await resolveInput(input);
  const bytes = await readFile(resolved.localPath);
  const mime = guessMime(input) ?? 'application/octet-stream';
  const blob = new Blob([bytes], { type: mime });
  const url = await upload(blob);
  return {
    url,
    cleanup: async () => {
      await resolved.cleanup?.();
    },
  };
}

/**
 * Build the fal input payload from tool args + extra_params, enforcing
 * the precedence rule (structural args win over extra_params).
 */
function buildFalInput(
  args: {
    prompt?: string;
    imageUrl?: string;
    audioUrl?: string;
    duration?: number;
    aspectRatio?: string;
    resolution?: string;
    negativePrompt?: string;
  },
  extra: Record<string, unknown> | undefined,
): { input: Record<string, unknown>; collisions: string[] } {
  const input: Record<string, unknown> = { ...(extra ?? {}) };
  const collisions: string[] = [];

  const assign = (key: string, value: unknown): void => {
    if (value === undefined) return;
    if (key in input && STRUCTURAL_FAL_KEYS.has(key)) {
      collisions.push(key);
    }
    input[key] = value;
  };

  assign('prompt', args.prompt);
  assign('image_url', args.imageUrl);
  assign('audio_url', args.audioUrl);
  assign('duration', args.duration);
  assign('aspect_ratio', args.aspectRatio);
  assign('resolution', args.resolution);
  assign('negative_prompt', args.negativePrompt);

  return { input, collisions };
}

/**
 * Extract the output video URL from fal's response. All three Phase 1
 * target models (Wan 2.7, Kling AI Avatar v2 Pro, veed/fabric-1.0) return
 * `{ video: { url: string, ... } }` per their committed OpenAPI specs in
 * `src/catalog/fal-specs/`. Future models may differ; expand here when a
 * new output shape shows up.
 */
function extractVideoUrl(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error(
      `fal returned a non-object result (got ${typeof data}); expected { video: { url } }`,
    );
  }
  const video = (data as { video?: unknown }).video;
  if (typeof video !== 'object' || video === null) {
    throw new Error('fal response missing `video` field');
  }
  const url = (video as { url?: unknown }).url;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('fal response `video.url` missing or not a string');
  }
  return url;
}

export function registerFalVideoTools(server: McpServer): void {
  registerTool<FalGenerateVideoParams>(
    server,
    'fal_generate_video',
    'Generate a video via any fal-hosted video model. Transport tool only — pass an explicit `model` (no server-side default). Use `model_catalog` to discover available models and the matching `*_prompt_guide` tool to learn the per-model prompt structure. Uses FAL_KEY env var.',
    falGenerateVideoSchema.shape,
    async ({
      model,
      prompt,
      output,
      image,
      audio,
      duration_seconds,
      aspect_ratio,
      resolution,
      negative_prompt,
      extra_params,
      poll_timeout_seconds,
    }) => {
      const client = getFalClient();

      const imageResolved = image
        ? await resolveForFal(image, (b) => client.storage.upload(b))
        : undefined;
      const audioResolved = audio
        ? await resolveForFal(audio, (b) => client.storage.upload(b))
        : undefined;

      try {
        const { input, collisions } = buildFalInput(
          {
            prompt,
            imageUrl: imageResolved?.url,
            audioUrl: audioResolved?.url,
            duration: duration_seconds,
            aspectRatio: aspect_ratio,
            resolution,
            negativePrompt: negative_prompt,
          },
          extra_params,
        );

        if (collisions.length > 0) {
          // eslint is configured to allow only console.error — this is a
          // warning-level diagnostic but the only sanctioned channel.
          console.error(
            `fal_generate_video: ${collisions.join(', ')} present in extra_params ` +
              `but also as structural arg(s); structural args win. ` +
              `Remove from extra_params to silence this warning.`,
          );
        }

        // fal.subscribe's `timeout` is in ms and limits queue + inference.
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
            `fal_generate_video failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
              `status=${falErr.status}, retryable=${falErr.retryable}, ` +
              `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
            // Preserve the ORIGINAL caught error as cause per eslint's
            // preserve-caught-error rule. The parsed FalError is already
            // embedded in the rich message; debug traces keep the raw SDK
            // error reachable via .cause.
            { cause: err },
          );
        }

        const videoUrl = extractVideoUrl(result.data);
        const { mime, bytes } = await downloadAndWrite(videoUrl, output, {
          defaultMime: 'video/mp4',
        });

        return {
          content: [
            {
              type: 'text',
              text:
                `Video generated via fal model "${model}" and saved to ${output} ` +
                `(downloaded from ${videoUrl}, ${bytes} bytes, ${mime}).`,
            },
          ],
        };
      } finally {
        await imageResolved?.cleanup?.();
        await audioResolved?.cleanup?.();
      }
    },
  );
}

// Re-export for test access without pulling the whole module surface.
export { buildFalInput, extractVideoUrl, isPublicHttpsUrl };

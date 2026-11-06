import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { getGenAIClient } from './client.js';
import { resolveInput } from '../utils/resource.js';
import { downloadAndWrite, geminiDownloadHeaders } from './utils/download-and-write.js';
import { type OmniGenerateVideoParams, omniGenerateVideoSchema } from './types.js';

/** Sleep for the given number of milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Interaction statuses that mean the job will not progress further. */
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled', 'incomplete']);

/** Minimal shape we rely on from an Interaction response. */
interface InteractionLike {
  id: string;
  status: string;
  errors?: Array<{ message?: string }>;
  steps?: Array<{
    type?: string;
    content?: Array<{ type?: string; uri?: string; data?: string; mime_type?: string }>;
    error?: { message?: string };
  }>;
}

/**
 * Pull the generated video off a completed interaction.
 *
 * Output arrives as a `video` content block on a `model_output` step. The
 * block carries either a `uri` (delivery mode "uri") or inline base64 `data`.
 * We prefer the uri — inline video is large and the caller wants a file.
 *
 * Exported for unit testing.
 */
export function extractOmniVideo(interaction: InteractionLike): {
  uri?: string;
  data?: string;
  mimeType: string;
} {
  const steps = interaction.steps ?? [];

  // Surface a step-level error before reporting "no video", which would be a
  // misleading diagnosis of an upstream failure.
  for (const step of steps) {
    if (step.error?.message) {
      throw new Error(
        `gemini_omni_generate_video: model reported an error — ${step.error.message}`,
      );
    }
  }

  for (const step of steps) {
    for (const block of step.content ?? []) {
      if (block.type !== 'video') continue;
      if (block.uri) return { uri: block.uri, mimeType: block.mime_type ?? 'video/mp4' };
      if (block.data) return { data: block.data, mimeType: block.mime_type ?? 'video/mp4' };
    }
  }

  throw new Error(
    'gemini_omni_generate_video: interaction completed but returned no video content. ' +
      `Status was "${interaction.status}".`,
  );
}

/**
 * Largest input video sent inline as base64. Google recommends the Files API
 * for big videos but gives no hard inline limit; Gemini requests cap out
 * around 20 MB, and a 15s input (the API maximum) is normally well under it.
 */
const MAX_INLINE_VIDEO_BYTES = 20_000_000;

function imageMime(path: string): string {
  const ext = (extname(path).slice(1) || 'png').toLowerCase();
  return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
}

function videoMime(path: string): string {
  const ext = (extname(path).slice(1) || 'mp4').toLowerCase();
  if (ext === 'mov') return 'video/quicktime';
  return `video/${ext}`;
}

/**
 * Reject combinations the API would refuse, with a message that names the
 * fix, before uploading anything or spending a generation.
 *
 * Exported for unit testing.
 */
export function validateOmniInputs(p: {
  image?: string;
  last_frame?: string;
  video?: string;
  task?: string;
  duration_seconds?: number;
  previous_interaction_id?: string;
}): void {
  const fail = (msg: string): never => {
    throw new Error(`gemini_omni_generate_video: ${msg}`);
  };
  if (p.last_frame && !p.image) {
    fail('last_frame needs `image` as the first frame (first-to-last-frame mode).');
  }
  if (p.last_frame && p.duration_seconds !== undefined && p.duration_seconds > 10) {
    fail(`first-to-last-frame clips are 3-10s; got duration_seconds ${p.duration_seconds}.`);
  }
  if ((p.task === 'edit' || p.task === 'extend') && !p.video && !p.previous_interaction_id) {
    fail(
      `task "${p.task}" needs an input: pass \`video\`, or previous_interaction_id for a clip this tool generated.`,
    );
  }
  if (p.task === 'extend' && p.duration_seconds !== undefined && p.duration_seconds > 10) {
    fail(`an extend continuation is 3-10s; got duration_seconds ${p.duration_seconds}.`);
  }
  if (p.video && p.previous_interaction_id) {
    fail('pass either `video` or previous_interaction_id, not both.');
  }
}

/**
 * Register the Gemini Omni Flash video tool.
 *
 * Deliberately a SEPARATE tool from `gemini_generate_video` (Veo) rather than
 * a new model id on it: Omni uses the Interactions API, not `generateVideos`,
 * so the request shape, the poll contract, and the output shape all differ.
 * Veo remains available and is not deprecated by Google.
 */
export function registerOmniVideoTools(server: McpServer): void {
  registerTool<OmniGenerateVideoParams>(
    server,
    'gemini_omni_generate_video',
    'Generate video via Google Gemini Omni Flash (Interactions API). Text-to-video, image-to-video, first-to-last-frame (image + last_frame), or reference-to-video, at 360p-4k (1080p/4k upscaled); edit or extend an input `video`; plus stateful conversational editing or extending of a previous result via previous_interaction_id. Output carries NATIVE AUDIO (speech/music/SFX) generated in the same pass, with no flag to disable it — describe the audio you want in the prompt, or strip the track downstream if you are laying your own music under the clip. Long-running; polls until complete or timeout. Uses GOOGLE_API_KEY env var.',
    omniGenerateVideoSchema.shape,
    async ({
      model,
      prompt,
      output,
      image,
      last_frame,
      reference_images,
      video,
      task,
      aspect_ratio,
      resolution,
      duration_seconds,
      previous_interaction_id,
      seed,
      poll_timeout_seconds,
      poll_interval_seconds,
    }) => {
      validateOmniInputs({
        image,
        last_frame,
        video,
        task,
        duration_seconds,
        previous_interaction_id,
      });

      const client = getGenAIClient();

      // Build the multimodal input: media first, then the prompt text, as in
      // Google's examples. Order carries meaning: for first-to-last-frame the
      // API has no role field, so the first image is the start frame and the
      // second the end frame.
      const content: Array<Record<string, unknown>> = [];

      const cleanups: Array<() => Promise<void>> = [];
      const attach = async (path: string, kind: 'image' | 'video'): Promise<void> => {
        const resolved = await resolveInput(path);
        if (resolved.cleanup) cleanups.push(async () => void (await resolved.cleanup?.()));
        const bytes = await readFile(resolved.localPath);
        if (kind === 'video' && bytes.byteLength > MAX_INLINE_VIDEO_BYTES) {
          throw new Error(
            `gemini_omni_generate_video: input video is ${(bytes.byteLength / 1e6).toFixed(1)} MB, ` +
              `over the ${MAX_INLINE_VIDEO_BYTES / 1e6} MB this tool sends inline. Trim it (inputs ` +
              'must be 15s or shorter anyway) or re-encode at a lower bitrate.',
          );
        }
        content.push({
          type: kind,
          data: bytes.toString('base64'),
          mime_type: kind === 'image' ? imageMime(path) : videoMime(path),
        });
      };

      try {
        if (video) await attach(video, 'video');
        if (image) await attach(image, 'image');
        if (last_frame) await attach(last_frame, 'image');
        for (const ref of reference_images ?? []) await attach(ref, 'image');
        content.push({ type: 'text', text: prompt });

        const generationConfig: Record<string, unknown> = {};
        if (task) generationConfig['video_config'] = { task };
        if (seed !== undefined) generationConfig['seed'] = seed;

        const responseFormat: Record<string, unknown> = { type: 'video', delivery: 'uri' };
        if (aspect_ratio) responseFormat['aspect_ratio'] = aspect_ratio;
        if (resolution) responseFormat['resolution'] = resolution;
        if (duration_seconds !== undefined) {
          // The API takes a duration string, not a bare number.
          responseFormat['duration'] = `${duration_seconds}s`;
        }

        const request: Record<string, unknown> = {
          model,
          input: content,
          response_format: responseFormat,
        };
        if (Object.keys(generationConfig).length > 0) {
          request['generation_config'] = generationConfig;
        }
        if (previous_interaction_id) {
          request['previous_interaction_id'] = previous_interaction_id;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const interactions = (client as any).interactions;
        if (!interactions?.create) {
          throw new Error(
            'gemini_omni_generate_video: the installed @google/genai does not expose the ' +
              'Interactions API. Upgrade to >=2.x.',
          );
        }

        let interaction = (await interactions.create(request)) as InteractionLike;

        // Poll to completion. Unlike Veo's operation polling, an Interaction
        // reports a status string and is fetched back by id.
        const deadline = Date.now() + poll_timeout_seconds * 1000;
        while (!TERMINAL_STATUSES.has(interaction.status)) {
          if (Date.now() > deadline) {
            throw new Error(
              `gemini_omni_generate_video: timed out after ${poll_timeout_seconds}s ` +
                `(interaction ${interaction.id} last status "${interaction.status}"). ` +
                'Raise poll_timeout_seconds, or fetch the interaction later by id.',
            );
          }
          await sleep(poll_interval_seconds * 1000);
          interaction = (await interactions.get(interaction.id)) as InteractionLike;
        }

        if (interaction.status !== 'completed') {
          const detail = interaction.errors
            ?.map((e) => e.message)
            .filter(Boolean)
            .join('; ');
          throw new Error(
            `gemini_omni_generate_video: interaction ${interaction.id} ended with status ` +
              `"${interaction.status}"${detail ? ` — ${detail}` : ''}.`,
          );
        }

        const generated = extractOmniVideo(interaction);

        let bytes: number;
        let mime: string;
        if (generated.uri) {
          // Omni returns `delivery: "uri"` results on the Gemini Files API,
          // which serves them behind the API key — without this header the
          // download 403s.
          const written = await downloadAndWrite(generated.uri, output, {
            headers: geminiDownloadHeaders(generated.uri),
            defaultMime: generated.mimeType,
          });
          bytes = written.bytes;
          mime = written.mime;
        } else {
          const buf = Buffer.from(generated.data ?? '', 'base64');
          const { getProvider } = await import('../storage/providers/registry.js');
          await getProvider(output).write(output, buf, generated.mimeType);
          bytes = buf.byteLength;
          mime = generated.mimeType;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  model,
                  video: { uri: output, bytes, mime },
                  // Callers need this to chain a conversational edit.
                  interaction_id: interaction.id,
                  // Omni bakes a soundtrack into every clip and offers no way
                  // to disable it. Callers laying their own music underneath
                  // must strip this track — saying so here is cheaper than
                  // discovering it when two audio beds collide in a master.
                  audio:
                    'native — Omni Flash generates a soundtrack (speech/music/SFX) in the same pass. ' +
                    'There is no off switch: steer it in the prompt, or strip it downstream before ' +
                    'laying your own audio under the clip.',
                },
                null,
                2,
              ),
            },
          ],
        };
      } finally {
        for (const cleanup of cleanups) await cleanup();
      }
    },
  );
}

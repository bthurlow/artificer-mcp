import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { getGenAIClient } from './client.js';
import { resolveInput } from '../utils/resource.js';
import { downloadAndWrite } from './utils/download-and-write.js';
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
    'Generate video via Google Gemini Omni Flash (Interactions API). Text-to-video, image-to-video, or reference-to-video, plus stateful conversational editing of a previous result via previous_interaction_id. Output carries NATIVE AUDIO (speech/music/SFX) generated in the same pass, with no flag to disable it — describe the audio you want in the prompt, or strip the track downstream if you are laying your own music under the clip. Long-running; polls until complete or timeout. Uses GOOGLE_API_KEY env var.',
    omniGenerateVideoSchema.shape,
    async ({
      model,
      prompt,
      output,
      image,
      reference_images,
      task,
      aspect_ratio,
      duration_seconds,
      previous_interaction_id,
      seed,
      poll_timeout_seconds,
      poll_interval_seconds,
    }) => {
      const client = getGenAIClient();

      // Build the multimodal input: prompt text first, then any imagery.
      const content: Array<Record<string, unknown>> = [{ type: 'text', text: prompt }];

      const cleanups: Array<() => Promise<void>> = [];
      const attachImage = async (path: string): Promise<void> => {
        const resolved = await resolveInput(path);
        if (resolved.cleanup) cleanups.push(async () => void (await resolved.cleanup?.()));
        const bytes = await readFile(resolved.localPath);
        const ext = (extname(path).slice(1) || 'png').toLowerCase();
        content.push({
          type: 'image',
          data: bytes.toString('base64'),
          mime_type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        });
      };

      try {
        if (image) await attachImage(image);
        for (const ref of reference_images ?? []) await attachImage(ref);

        const generationConfig: Record<string, unknown> = {};
        if (task) generationConfig['video_config'] = { task };
        if (seed !== undefined) generationConfig['seed'] = seed;

        const responseFormat: Record<string, unknown> = { type: 'video', delivery: 'uri' };
        if (aspect_ratio) responseFormat['aspect_ratio'] = aspect_ratio;
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

        const video = extractOmniVideo(interaction);

        let bytes: number;
        let mime: string;
        if (video.uri) {
          const written = await downloadAndWrite(video.uri, output, {
            defaultMime: video.mimeType,
          });
          bytes = written.bytes;
          mime = written.mime;
        } else {
          const buf = Buffer.from(video.data ?? '', 'base64');
          const { getProvider } = await import('../storage/providers/registry.js');
          await getProvider(output).write(output, buf, video.mimeType);
          bytes = buf.byteLength;
          mime = video.mimeType;
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

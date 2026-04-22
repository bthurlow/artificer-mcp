import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { getGenAIClient } from './client.js';
import { getProvider } from '../storage/providers/registry.js';
import { resolveInput } from '../utils/resource.js';
import { type GenerateVideoParams, generateVideoSchema } from './types.js';
import type { Image } from '@google/genai';

/** Sleep for the given number of milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Register video generation tools with the MCP server.
 *
 * Covers: gemini_generate_video.
 */
export function registerVideoGenTools(server: McpServer): void {
  registerTool<GenerateVideoParams>(
    server,
    'gemini_generate_video',
    'Generate a video from a text prompt (text-to-video) or from a text prompt + input image (image-to-video) via Google Veo. Long-running — polls until complete or timeout. Uses GOOGLE_API_KEY env var.',
    generateVideoSchema.shape,
    async ({
      model,
      prompt,
      output,
      image,
      duration_seconds,
      aspect_ratio,
      resolution,
      fps,
      negative_prompt,
      person_generation,
      generate_audio,
      enhance_prompt,
      seed,
      poll_interval_seconds,
      poll_timeout_seconds,
    }) => {
      const client = getGenAIClient();

      // Build the image input for image-to-video, if provided.
      // Resolve through the storage abstraction so gs://, s3://, https:// URIs work.
      const imageR = image ? await resolveInput(image) : undefined;
      try {
        let inputImage: Image | undefined;
        if (imageR) {
          const imageBytes = await readFile(imageR.localPath);
          inputImage = {
            imageBytes: imageBytes.toString('base64'),
            mimeType: `image/${(extname(image ?? '').slice(1) || 'png').toLowerCase()}`,
          };
        }

        // Start the long-running operation.
        let operation = await client.models.generateVideos({
          model,
          prompt,
          image: inputImage,
          config: {
            durationSeconds: duration_seconds,
            aspectRatio: aspect_ratio,
            resolution,
            fps,
            negativePrompt: negative_prompt,
            ...(person_generation ? { personGeneration: person_generation } : {}),
            ...(generate_audio ? { generateAudio: true } : {}),
            ...(enhance_prompt ? { enhancePrompt: true } : {}),
            seed,
            numberOfVideos: 1,
          },
        });

        // Poll until the operation completes or we time out.
        const deadline = Date.now() + poll_timeout_seconds * 1000;
        while (!operation.done) {
          if (Date.now() > deadline) {
            throw new Error(
              `Video generation timed out after ${poll_timeout_seconds}s. ` +
                `Operation: ${operation.name ?? 'unknown'}. Try increasing poll_timeout_seconds.`,
            );
          }
          await sleep(poll_interval_seconds * 1000);

          operation = await client.operations.getVideosOperation({
            operation,
          });
        }

        // Check for errors.
        if (operation.error) {
          const errMsg =
            typeof operation.error === 'object'
              ? JSON.stringify(operation.error)
              : String(operation.error);
          throw new Error(`Video generation failed: ${errMsg}`);
        }

        // Extract the generated video.
        const response = operation.response;
        const videos = response?.generatedVideos ?? [];
        if (videos.length === 0) {
          const filtered = response?.raiMediaFilteredReasons?.join(', ') ?? 'unknown';
          return {
            content: [
              {
                type: 'text',
                text: `No video generated. Filtered: ${filtered}`,
              },
            ],
          };
        }

        const video = videos[0].video;
        const mime = video?.mimeType ?? 'video/mp4';
        if (video?.videoBytes) {
          const bytes = Buffer.from(video.videoBytes, 'base64');
          await getProvider(output).write(output, bytes, mime);
          return {
            content: [{ type: 'text', text: `Video generated and saved to ${output}` }],
          };
        } else if (video?.uri) {
          // Video returned as a URI (GCS or HTTP) — download it.
          // Gemini Files API URIs require the API key as x-goog-api-key header.
          const isGeminiFilesApi = video.uri.includes('generativelanguage.googleapis.com');
          const headers: Record<string, string> = {};
          if (isGeminiFilesApi && process.env.GOOGLE_API_KEY) {
            headers['x-goog-api-key'] = process.env.GOOGLE_API_KEY;
          }
          const resp = await fetch(video.uri, { headers });
          if (!resp.ok)
            throw new Error(`Failed to download video from ${video.uri}: ${resp.status}`);
          const buf = Buffer.from(await resp.arrayBuffer());
          await getProvider(output).write(output, buf, mime);
          return {
            content: [
              {
                type: 'text',
                text: `Video generated and saved to ${output} (downloaded from ${video.uri})`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: 'Video generation completed but no video data was returned.',
            },
          ],
        };
      } finally {
        await imageR?.cleanup?.();
      }
    },
  );
}

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../../utils/register.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { resolveForFal, isPublicHttpsUrl } from './inputs.js';

export const falUploadSchema = z.object({
  source: z
    .string()
    .min(1)
    .describe(
      'File to expose to fal. Public http(s) URLs pass through unchanged. gs:// / s3:// / file:// / bare local paths are uploaded to fal storage; the returned URL stays valid for fal.subscribe() calls. Use this when a fal model needs a secondary image / audio / video reference (start_frame, end_frame, ref images, etc.) that must be supplied via `extra_params`.',
    ),
});

export interface FalUploadParams {
  source: string;
}

export function registerFalUploadTool(server: McpServer): void {
  registerTool<FalUploadParams>(
    server,
    'fal_upload',
    'Upload a local file (or gs:// / s3:// / file:// URI) to fal storage and return the resulting HTTPS URL. Public http(s) URLs are passed through unchanged. Use this to supply secondary image / audio inputs (e.g. Kling O3 start_frame + end_frame, multi-image reference-to-video models) where the URL must be embedded inside `extra_params`. For one-shot calls you can pass an `extra_files` map directly to any `fal_*` transport instead. Uses FAL_KEY env var.',
    falUploadSchema.shape,
    async ({ source }) => {
      const client = getFalClient();
      let resolved;
      try {
        resolved = await resolveForFal(source, (b) => client.storage.upload(b));
      } catch (err) {
        const falErr = parseFalError(err);
        throw new Error(
          `fal_upload failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
            `status=${falErr.status}, retryable=${falErr.retryable}, ` +
            `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
          { cause: err },
        );
      }
      try {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  url: resolved.url,
                  was_uploaded: !isPublicHttpsUrl(source),
                  source,
                },
                null,
                2,
              ),
            },
          ],
        };
      } finally {
        await resolved.cleanup?.();
      }
    },
  );
}

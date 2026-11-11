import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../../utils/register.js';
import { downloadAndWrite } from '../utils/download-and-write.js';
import { getFalClient } from './client.js';
import { nthOutputPath } from './image.js';
import { findFalJob, listFalJobs, recordFalJob } from './jobs.js';
import { falFailure } from './queue.js';

/**
 * Recovery tools for fal queue jobs (TODO #32): check or collect a job by
 * request_id after its tool call timed out or was stopped, and cancel one.
 */

export const falFetchResultSchema = z.object({
  request_id: z
    .string()
    .min(1)
    .optional()
    .describe(
      "The fal request_id to check, as named by a fal tool error, its progress messages, or this tool's job list. Omit to list recent jobs from the local job log instead.",
    ),
  model: z
    .string()
    .min(1)
    .optional()
    .describe(
      'The fal model id the job was submitted to. Optional when the job is in the local job log (it was submitted from this machine).',
    ),
  output: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Where to save the result once the job has completed. With several media files the 2nd and later go to <name>_2, <name>_3, …. Omit to get the status and the raw result only.',
    ),
});

export interface FalFetchResultParams {
  request_id?: string;
  model?: string;
  output?: string;
}

export const falCancelSchema = z.object({
  request_id: z.string().min(1).describe('The fal request_id to cancel.'),
  model: z
    .string()
    .min(1)
    .optional()
    .describe('The fal model id. Optional when the job is in the local job log.'),
});

export interface FalCancelParams {
  request_id: string;
  model?: string;
}

/** A media file in a fal result: any object carrying an http(s) `url`. */
export interface FalMediaFile {
  /** JSON path within the result, e.g. `video` or `images[1]`. */
  path: string;
  url: string;
  content_type?: string;
}

/**
 * Collect every fal File-shaped object (`{ url, content_type? }`) in a result.
 * Every fal output parser looks for one of these under a model-specific key;
 * walking the whole result keeps recovery independent of the model type.
 *
 * Exported for unit testing.
 */
export function findMediaFiles(data: unknown, path = ''): FalMediaFile[] {
  if (Array.isArray(data)) {
    return data.flatMap((item, i) => findMediaFiles(item, `${path}[${i}]`));
  }
  if (typeof data !== 'object' || data === null) return [];
  const record = data as Record<string, unknown>;
  if (typeof record['url'] === 'string' && /^https?:\/\//.test(record['url'])) {
    const contentType = record['content_type'];
    return [
      {
        path: path || '(root)',
        url: record['url'],
        ...(typeof contentType === 'string' ? { content_type: contentType } : {}),
      },
    ];
  }
  return Object.entries(record).flatMap(([key, value]) =>
    findMediaFiles(value, path ? `${path}.${key}` : key),
  );
}

/** Keep the raw result readable in a tool reply. */
const MAX_RAW_CHARS = 20_000;

async function resolveModel(requestId: string, model: string | undefined): Promise<string> {
  if (model) return model;
  const job = await findFalJob(requestId);
  if (!job) {
    throw new Error(
      `request_id ${requestId} is not in the local fal job log; pass \`model\` (the fal model id it was submitted to).`,
    );
  }
  return job.model;
}

function json(value: unknown): { content: { type: 'text'; text: string }[] } {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

export function registerFalRecoveryTools(server: McpServer): void {
  registerTool<FalFetchResultParams>(
    server,
    'fal_fetch_result',
    'Check or collect a fal queue job by request_id: returns its status (queue position, recent logs) while it runs, and once completed returns the raw result and, with `output`, downloads its media files. Use it when a fal_* call timed out or was stopped, so a job is not paid for twice. With no request_id, lists recent jobs from the local job log (model, request_id, tool, last event). Uses FAL_KEY env var.',
    falFetchResultSchema.shape,
    async ({ request_id, model, output }) => {
      if (!request_id) {
        const jobs = await listFalJobs();
        return json({
          jobs,
          note: jobs.length === 0 ? 'The local fal job log is empty.' : undefined,
        });
      }

      const resolvedModel = await resolveModel(request_id, model);
      const client = getFalClient();

      let status;
      try {
        status = await client.queue.status(resolvedModel, { requestId: request_id, logs: true });
      } catch (err) {
        throw falFailure('fal_fetch_result', err, request_id);
      }

      if (status.status !== 'COMPLETED') {
        return json({
          model: resolvedModel,
          request_id,
          status: status.status,
          ...(status.status === 'IN_QUEUE' ? { queue_position: status.queue_position } : {}),
          ...(status.status === 'IN_PROGRESS' && status.logs?.length
            ? { recent_logs: status.logs.slice(-10).map((l) => l.message) }
            : {}),
          note: 'Not finished yet. Call fal_fetch_result again later, or fal_cancel to stop it.',
        });
      }

      let data: unknown;
      try {
        data = (await client.queue.result(resolvedModel, { requestId: request_id })).data;
      } catch (err) {
        throw falFailure('fal_fetch_result', err, request_id);
      }

      const media = findMediaFiles(data);
      const saved: Array<{ uri: string; from: string; bytes: number; mime: string }> = [];
      if (output) {
        if (media.length === 0) {
          throw new Error(
            `fal_fetch_result: request ${request_id} completed but its result has no media file to save. ` +
              'Call again without `output` to see the raw result.',
          );
        }
        for (let i = 0; i < media.length; i++) {
          const uri = nthOutputPath(output, i + 1);
          const { bytes, mime } = await downloadAndWrite(media[i].url, uri, {
            defaultMime: media[i].content_type ?? 'application/octet-stream',
          });
          saved.push({ uri, from: media[i].path, bytes, mime });
        }
        await recordFalJob({
          event: 'completed',
          tool: 'fal_fetch_result',
          model: resolvedModel,
          request_id,
          output,
        });
      }

      const raw = JSON.stringify(data);
      return json({
        model: resolvedModel,
        request_id,
        status: 'COMPLETED',
        ...(saved.length ? { saved } : { media }),
        result: raw.length > MAX_RAW_CHARS ? `${raw.slice(0, MAX_RAW_CHARS)}… (truncated)` : data,
      });
    },
  );

  registerTool<FalCancelParams>(
    server,
    'fal_cancel',
    'Cancel a fal queue job by request_id. A queued job is dropped; a running one is asked to stop, which the model may or may not honor. Check the outcome with fal_fetch_result. Uses FAL_KEY env var.',
    falCancelSchema.shape,
    async ({ request_id, model }) => {
      const resolvedModel = await resolveModel(request_id, model);
      const client = getFalClient();
      try {
        await client.queue.cancel(resolvedModel, { requestId: request_id });
      } catch (err) {
        throw falFailure('fal_cancel', err, request_id);
      }
      await recordFalJob({
        event: 'cancelled',
        tool: 'fal_cancel',
        model: resolvedModel,
        request_id,
      });
      return json({
        model: resolvedModel,
        request_id,
        cancelled: true,
        note: 'Cancellation sent. A job already running may still finish; fal_fetch_result shows the final status.',
      });
    },
  );
}

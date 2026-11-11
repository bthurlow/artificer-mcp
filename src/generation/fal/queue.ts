import type { FalClient } from '@fal-ai/client';
import { z } from 'zod';
import type { ToolExtra } from '../../utils/register.js';
import { parseFalError } from './errors.js';
import { recordFalJob } from './jobs.js';

/**
 * Run a fal job through the queue with a deadline we enforce (TODO #32).
 *
 * Replaces `client.subscribe`, which had two problems:
 *  - its `startTimeout` is a server-side limit on time spent WAITING in the
 *    queue only, and its client-side `timeout` is documented as not
 *    enforced, so a job stuck IN_PROGRESS was waited on forever;
 *  - it never exposed the request_id unless it threw, so the caller could
 *    not see, recover or cancel the job.
 *
 * Here the request_id is logged to stderr, sent as an MCP progress message
 * and written to the local job log the moment the job is submitted. On the
 * deadline, or when the client cancels the call, the job is cancelled on fal
 * (a job nobody collects should not keep billing) and the error names the
 * request_id so `fal_fetch_result` can still check whether it finished.
 */

/** The shared `poll_timeout_seconds` field of the fal transports. */
export function falPollTimeout(defaultSeconds: number): z.ZodDefault<z.ZodNumber> {
  return z
    .number()
    .positive()
    .default(defaultSeconds)
    .describe(
      `Maximum seconds to wait for the fal job, queue plus generation. Default ${defaultSeconds}. ` +
        'The request_id is sent as a progress message as soon as the job is submitted. On timeout ' +
        'the job is cancelled on fal and the error names its request_id; check it with fal_fetch_result.',
    );
}

/** The slice of FalClient this module needs; tests pass a fake. */
export type FalQueueClient = Pick<FalClient, 'queue'>;

export interface RunFalJobOptions {
  /** Tool name, for messages and the job log. */
  tool: string;
  model: string;
  input: Record<string, unknown>;
  /** Wall-clock limit on queue + generation, in seconds. */
  timeoutSeconds: number;
  /** Ask fal for runner logs in status responses. */
  logs?: boolean;
  /** Output path, recorded in the job log so a fetch can reuse it. */
  output?: string;
  /** MCP request extra: progress notifications and client cancellation. */
  extra?: ToolExtra;
  /** Status poll interval in ms. Default 2000. */
  pollIntervalMs?: number;
}

export interface FalJobResult {
  data: unknown;
  requestId: string;
}

/** Status-check failures tolerated in a row before giving up. */
const MAX_STATUS_ERRORS = 3;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timer = setTimeout(done, ms);
    function done(): void {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    }
    signal?.addEventListener('abort', done, { once: true });
  });
}

/** Wrap an SDK error in the message format the fal tools have always used. */
export function falFailure(tool: string, err: unknown, requestId?: string): Error {
  const falErr = parseFalError(err);
  return new Error(
    `${tool} failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
      `status=${falErr.status}, retryable=${falErr.retryable}, ` +
      `requestId=${falErr.requestId ?? requestId ?? 'unknown'}): ${falErr.message}`,
    { cause: err },
  );
}

function describeStatus(status: { status: string; queue_position?: number }): string {
  return status.status === 'IN_QUEUE' && status.queue_position !== undefined
    ? `IN_QUEUE (position ${status.queue_position})`
    : status.status;
}

export async function runFalJob(
  client: FalQueueClient,
  opts: RunFalJobOptions,
): Promise<FalJobResult> {
  const { tool, model, input, timeoutSeconds, extra } = opts;
  const pollIntervalMs = opts.pollIntervalMs ?? 2000;
  const signal = extra?.signal;
  const started = Date.now();
  const deadline = started + timeoutSeconds * 1000;

  let progress = 0;
  const notify = async (message: string): Promise<void> => {
    const token = extra?._meta?.progressToken;
    if (token === undefined || !extra?.sendNotification) return;
    try {
      await extra.sendNotification({
        method: 'notifications/progress',
        params: { progressToken: token, progress: ++progress, message },
      });
    } catch {
      // Progress is advisory; a closed transport must not fail the job.
    }
  };

  let requestId: string;
  try {
    const submitted = await client.queue.submit(model, {
      input,
      // Server-side cap on queue wait; our deadline below covers the rest.
      startTimeout: timeoutSeconds,
    });
    requestId = submitted.request_id;
  } catch (err) {
    throw falFailure(tool, err);
  }

  console.error(`${tool}: submitted to fal model "${model}", request_id ${requestId}`);
  await recordFalJob({
    event: 'submitted',
    tool,
    model,
    request_id: requestId,
    output: opts.output,
  });
  await notify(`fal request_id ${requestId} submitted (${model})`);

  const cancelOnFal = async (event: 'timed_out' | 'cancelled', detail: string): Promise<string> => {
    let outcome: string;
    try {
      await client.queue.cancel(model, { requestId });
      outcome = 'cancellation sent to fal';
    } catch (err) {
      outcome = `cancel request failed (${(err as Error).message})`;
    }
    await recordFalJob({
      event,
      tool,
      model,
      request_id: requestId,
      detail: `${detail}; ${outcome}`,
    });
    return outcome;
  };

  let last: { status: string; queue_position?: number } = { status: 'unknown' };
  let statusErrors = 0;
  for (;;) {
    if (signal?.aborted) {
      const outcome = await cancelOnFal('cancelled', 'client cancelled the tool call');
      throw new Error(
        `${tool}: the call was cancelled by the client; fal request ${requestId} (${model}): ${outcome}.`,
      );
    }

    try {
      const status = await client.queue.status(model, {
        requestId,
        logs: opts.logs ?? false,
      });
      statusErrors = 0;
      const now = {
        status: status.status,
        queue_position: status.status === 'IN_QUEUE' ? status.queue_position : undefined,
      };
      if (now.status !== last.status || now.queue_position !== last.queue_position) {
        await notify(`fal request_id ${requestId}: ${describeStatus(now)}`);
      }
      last = now;
      if (status.status === 'COMPLETED') break;
    } catch (err) {
      // A transient network error should not abandon a running job, but a
      // persistent one (bad id, auth) must surface.
      if (++statusErrors >= MAX_STATUS_ERRORS) {
        await recordFalJob({
          event: 'failed',
          tool,
          model,
          request_id: requestId,
          detail: (err as Error).message,
        });
        throw falFailure(tool, err, requestId);
      }
    }

    // Checked after the status call, so the job is always looked at once
    // and the error reports a real last status.
    if (Date.now() >= deadline) {
      const elapsed = Math.round((Date.now() - started) / 1000);
      const lastStatus = describeStatus(last);
      const outcome = await cancelOnFal('timed_out', `last status ${lastStatus} after ${elapsed}s`);
      throw new Error(
        `${tool}: fal request ${requestId} (${model}) did not finish within ` +
          `poll_timeout_seconds ${timeoutSeconds} (waited ${elapsed}s, last status ${lastStatus}); ` +
          `${outcome}. A job already running may still finish and bill: check it with ` +
          `fal_fetch_result({ model: "${model}", request_id: "${requestId}" }).`,
      );
    }

    await sleep(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())), signal);
  }

  try {
    const result = await client.queue.result(model, { requestId });
    await recordFalJob({ event: 'completed', tool, model, request_id: requestId });
    return { data: result.data, requestId };
  } catch (err) {
    await recordFalJob({
      event: 'failed',
      tool,
      model,
      request_id: requestId,
      detail: (err as Error).message,
    });
    throw falFailure(tool, err, requestId);
  }
}

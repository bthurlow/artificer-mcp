import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rm } from 'node:fs/promises';
import { runFalJob, type FalQueueClient } from '../../../src/generation/fal/queue.js';
import { falJobsFile, listFalJobs } from '../../../src/generation/fal/jobs.js';

type Status = { status: string; queue_position?: number; logs?: unknown[] };

/** A fake queue whose status() walks a script of statuses, then repeats the last. */
function fakeQueue(statuses: Array<Status | Error>, data: unknown = { ok: true }) {
  let i = 0;
  const queue = {
    submit: vi.fn(async () => ({ status: 'IN_QUEUE', request_id: 'req-123', queue_position: 3 })),
    status: vi.fn(async () => {
      const s = statuses[Math.min(i++, statuses.length - 1)];
      if (s instanceof Error) throw s;
      return s;
    }),
    result: vi.fn(async () => ({ data, requestId: 'req-123' })),
    cancel: vi.fn(async () => undefined),
  };
  return { client: { queue } as unknown as FalQueueClient, queue };
}

const base = { tool: 'fal_generate_video', model: 'fal-ai/x', input: { prompt: 'p' } };

beforeEach(async () => {
  await rm(falJobsFile(), { force: true });
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('runFalJob', () => {
  it('submits, polls to COMPLETED and returns the data with the request_id', async () => {
    const { client, queue } = fakeQueue([
      { status: 'IN_QUEUE', queue_position: 2 },
      { status: 'IN_PROGRESS', logs: [] },
      { status: 'COMPLETED', logs: [] },
    ]);
    const res = await runFalJob(client, { ...base, timeoutSeconds: 5, pollIntervalMs: 1, output: 'out.mp4' });
    expect(res).toEqual({ data: { ok: true }, requestId: 'req-123' });
    expect(queue.submit).toHaveBeenCalledWith('fal-ai/x', { input: { prompt: 'p' }, startTimeout: 5 });
    expect(queue.status).toHaveBeenCalledTimes(3);
    expect(queue.cancel).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('request_id req-123'));

    const [job] = await listFalJobs();
    expect(job).toMatchObject({ request_id: 'req-123', event: 'completed', model: 'fal-ai/x', output: 'out.mp4' });
  });

  it('sends the request_id and status changes as progress notifications', async () => {
    const { client } = fakeQueue([
      { status: 'IN_QUEUE', queue_position: 2 },
      { status: 'IN_QUEUE', queue_position: 2 },
      { status: 'IN_PROGRESS' },
      { status: 'COMPLETED' },
    ]);
    const sendNotification = vi.fn(async () => undefined);
    await runFalJob(client, {
      ...base,
      timeoutSeconds: 5,
      pollIntervalMs: 1,
      extra: { _meta: { progressToken: 'tok' }, sendNotification },
    });
    const messages = sendNotification.mock.calls.map(
      (c) => (c as unknown as [{ params: { message: string; progress: number } }])[0].params,
    );
    expect(messages.map((m) => m.message)).toEqual([
      'fal request_id req-123 submitted (fal-ai/x)',
      'fal request_id req-123: IN_QUEUE (position 2)',
      'fal request_id req-123: IN_PROGRESS',
      'fal request_id req-123: COMPLETED',
    ]);
    expect(messages.map((m) => m.progress)).toEqual([1, 2, 3, 4]);
  });

  it('sends no progress without a progressToken', async () => {
    const { client } = fakeQueue([{ status: 'COMPLETED' }]);
    const sendNotification = vi.fn(async () => undefined);
    await runFalJob(client, { ...base, timeoutSeconds: 5, pollIntervalMs: 1, extra: { sendNotification } });
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('on timeout cancels the job on fal and names the request_id', async () => {
    const { client, queue } = fakeQueue([{ status: 'IN_PROGRESS', logs: [] }]);
    await expect(
      runFalJob(client, { ...base, timeoutSeconds: 0.05, pollIntervalMs: 5 }),
    ).rejects.toThrow(
      /fal request req-123 \(fal-ai\/x\) did not finish within poll_timeout_seconds 0\.05 .*last status IN_PROGRESS.*cancellation sent to fal.*fal_fetch_result/,
    );
    expect(queue.cancel).toHaveBeenCalledWith('fal-ai/x', { requestId: 'req-123' });
    expect(queue.result).not.toHaveBeenCalled();
    const [job] = await listFalJobs();
    expect(job.event).toBe('timed_out');
  });

  it('reports the queue position when it times out while queued', async () => {
    const { client } = fakeQueue([{ status: 'IN_QUEUE', queue_position: 7 }]);
    await expect(runFalJob(client, { ...base, timeoutSeconds: 0.03, pollIntervalMs: 5 })).rejects.toThrow(
      /last status IN_QUEUE \(position 7\)/,
    );
  });

  it('still names the request_id when the cancel call itself fails', async () => {
    const { client, queue } = fakeQueue([{ status: 'IN_PROGRESS' }]);
    queue.cancel.mockRejectedValueOnce(new Error('already completed'));
    await expect(runFalJob(client, { ...base, timeoutSeconds: 0.03, pollIntervalMs: 5 })).rejects.toThrow(
      /req-123.*cancel request failed \(already completed\)/,
    );
  });

  it('cancels the job on fal when the client cancels the call', async () => {
    const { client, queue } = fakeQueue([{ status: 'IN_PROGRESS' }]);
    const ac = new AbortController();
    const run = runFalJob(client, {
      ...base,
      timeoutSeconds: 60,
      pollIntervalMs: 10_000,
      extra: { signal: ac.signal },
    });
    setTimeout(() => ac.abort(), 20);
    await expect(run).rejects.toThrow(/cancelled by the client; fal request req-123/);
    expect(queue.cancel).toHaveBeenCalledWith('fal-ai/x', { requestId: 'req-123' });
    const [job] = await listFalJobs();
    expect(job.event).toBe('cancelled');
  });

  it('rides out transient status errors', async () => {
    const { client } = fakeQueue([new Error('ECONNRESET'), new Error('ECONNRESET'), { status: 'COMPLETED' }]);
    await expect(runFalJob(client, { ...base, timeoutSeconds: 5, pollIntervalMs: 1 })).resolves.toMatchObject({
      requestId: 'req-123',
    });
  });

  it('gives up after three status errors in a row, naming the request_id', async () => {
    const { client } = fakeQueue([new Error('nope')]);
    await expect(runFalJob(client, { ...base, timeoutSeconds: 5, pollIntervalMs: 1 })).rejects.toThrow(
      /fal_generate_video failed .*requestId=req-123/,
    );
    const [job] = await listFalJobs();
    expect(job.event).toBe('failed');
  });

  it('wraps a failed result with the request_id', async () => {
    const { client, queue } = fakeQueue([{ status: 'COMPLETED' }]);
    queue.result.mockRejectedValueOnce(new Error('model crashed'));
    await expect(runFalJob(client, { ...base, timeoutSeconds: 5, pollIntervalMs: 1 })).rejects.toThrow(
      /fal_generate_video failed .*requestId=req-123.*model crashed/,
    );
  });

  it('wraps a failed submit without a request_id', async () => {
    const { client, queue } = fakeQueue([]);
    queue.submit.mockRejectedValueOnce(new Error('bad key'));
    await expect(runFalJob(client, { ...base, timeoutSeconds: 5 })).rejects.toThrow(
      /fal_generate_video failed .*requestId=unknown.*bad key/,
    );
    expect(await listFalJobs()).toEqual([]);
  });
});

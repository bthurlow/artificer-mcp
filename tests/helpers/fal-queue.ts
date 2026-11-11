import { vi, type Mock } from 'vitest';

/**
 * Build a fake `client.queue` around a `subscribe`-style mock, so the fal tool
 * tests keep asserting on `mockSubscribe(model, { input })` while the tools
 * drive the queue API (submit / status / result) through runFalJob.
 *
 * submit() calls the mock and holds its promise; status() reports COMPLETED
 * once it settles; result() resolves or rejects with it, which is where a
 * real fal job surfaces a failure.
 */
export function queueFromSubscribe(mockSubscribe: Mock) {
  const jobs = new Map<string, Promise<unknown>>();
  let n = 0;
  return {
    submit: vi.fn(async (model: string, opts: Record<string, unknown>) => {
      const id = `req-${++n}`;
      const p = Promise.resolve().then(() => mockSubscribe(model, opts));
      p.catch(() => undefined);
      jobs.set(id, p);
      return { status: 'IN_QUEUE', request_id: id, queue_position: 0 };
    }),
    status: vi.fn(async (_model: string, { requestId }: { requestId: string }) => {
      await jobs.get(requestId)?.catch(() => undefined);
      return { status: 'COMPLETED', request_id: requestId, logs: [] };
    }),
    result: vi.fn(async (_model: string, { requestId }: { requestId: string }) => {
      const data = (await jobs.get(requestId)) as { data?: unknown } | undefined;
      return { data: data?.data, requestId };
    }),
    cancel: vi.fn(async () => undefined),
  };
}

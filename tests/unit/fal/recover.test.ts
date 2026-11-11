import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockQueue = {
  status: vi.fn(),
  result: vi.fn(),
  cancel: vi.fn(),
};

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({ queue: mockQueue }),
}));

const mockProviderWrite = vi.fn();
vi.mock('../../../src/storage/providers/registry.js', async () => {
  const actual = await vi.importActual<typeof import('../../../src/storage/providers/registry.js')>(
    '../../../src/storage/providers/registry.js',
  );
  return {
    ...actual,
    getProvider: () => ({
      scheme: 'file',
      read: vi.fn(),
      write: mockProviderWrite,
      list: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      getPublicUrl: vi.fn(),
      getSignedUrl: vi.fn(),
    }),
  };
});

import { rm } from 'node:fs/promises';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { findMediaFiles, registerFalRecoveryTools } from '../../../src/generation/fal/recover.js';
import { falJobsFile, listFalJobs, recordFalJob } from '../../../src/generation/fal/jobs.js';

describe('findMediaFiles', () => {
  it('finds fal File objects anywhere in a result', () => {
    expect(
      findMediaFiles({
        video: { url: 'https://v3.fal.media/a.mp4', content_type: 'video/mp4' },
        images: [{ url: 'https://v3.fal.media/1.png' }, { url: 'https://v3.fal.media/2.png' }],
        seed: 4,
        nested: { stems: { vocals: { url: 'https://v3.fal.media/v.wav' } } },
        not_media: { url: 'gs://x' },
      }),
    ).toEqual([
      { path: 'video', url: 'https://v3.fal.media/a.mp4', content_type: 'video/mp4' },
      { path: 'images[0]', url: 'https://v3.fal.media/1.png' },
      { path: 'images[1]', url: 'https://v3.fal.media/2.png' },
      { path: 'nested.stems.vocals', url: 'https://v3.fal.media/v.wav' },
    ]);
  });

  it('returns nothing for a text-only result', () => {
    expect(findMediaFiles({ text: 'hello', chunks: [{ text: 'h' }] })).toEqual([]);
  });
});

describe('listFalJobs', () => {
  beforeEach(async () => {
    await rm(falJobsFile(), { force: true });
  });

  it('folds events per request, newest submission first, keeping the output path', async () => {
    await recordFalJob({ event: 'submitted', tool: 't', model: 'm1', request_id: 'a', output: 'a.mp4' });
    await new Promise((r) => setTimeout(r, 5));
    await recordFalJob({ event: 'submitted', tool: 't', model: 'm2', request_id: 'b' });
    await recordFalJob({ event: 'timed_out', tool: 't', model: 'm1', request_id: 'a', detail: 'x' });
    const jobs = await listFalJobs();
    expect(jobs.map((j) => [j.request_id, j.event, j.output])).toEqual([
      ['b', 'submitted', undefined],
      ['a', 'timed_out', 'a.mp4'],
    ]);
  });

  it('is empty when there is no log', async () => {
    expect(await listFalJobs()).toEqual([]);
  });
});

describe('fal_fetch_result / fal_cancel (MCP)', () => {
  let client: Client;

  beforeEach(async () => {
    await rm(falJobsFile(), { force: true });
    for (const fn of Object.values(mockQueue)) fn.mockReset();
    mockProviderWrite.mockReset();
    const server = new McpServer({ name: 'test', version: '0.0.0' });
    registerFalRecoveryTools(server);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const call = async (name: string, args: Record<string, unknown>) => {
    const res = (await client.callTool({ name, arguments: args })) as {
      isError?: boolean;
      content: Array<{ text: string }>;
    };
    return { isError: res.isError, text: res.content[0].text };
  };

  it('lists recent jobs when no request_id is given', async () => {
    await recordFalJob({ event: 'submitted', tool: 'fal_generate_video', model: 'fal-ai/x', request_id: 'r1' });
    const { text } = await call('fal_fetch_result', {});
    expect(JSON.parse(text).jobs).toEqual([
      expect.objectContaining({ request_id: 'r1', model: 'fal-ai/x', event: 'submitted' }),
    ]);
  });

  it('reports status while the job is still queued', async () => {
    mockQueue.status.mockResolvedValue({ status: 'IN_QUEUE', queue_position: 4 });
    const { text } = await call('fal_fetch_result', { request_id: 'r1', model: 'fal-ai/x' });
    expect(JSON.parse(text)).toMatchObject({ status: 'IN_QUEUE', queue_position: 4 });
    expect(mockQueue.result).not.toHaveBeenCalled();
  });

  it('looks the model up in the job log', async () => {
    await recordFalJob({ event: 'submitted', tool: 'fal_generate_video', model: 'fal-ai/logged', request_id: 'r1' });
    mockQueue.status.mockResolvedValue({ status: 'IN_PROGRESS', logs: [{ message: 'step 3' }] });
    const { text } = await call('fal_fetch_result', { request_id: 'r1' });
    expect(mockQueue.status).toHaveBeenCalledWith('fal-ai/logged', { requestId: 'r1', logs: true });
    expect(JSON.parse(text).recent_logs).toEqual(['step 3']);
  });

  it('asks for the model when the job is not in the log', async () => {
    const { isError, text } = await call('fal_fetch_result', { request_id: 'nope' });
    expect(isError).toBe(true);
    expect(text).toMatch(/not in the local fal job log; pass `model`/);
  });

  it('downloads every media file of a completed job', async () => {
    mockQueue.status.mockResolvedValue({ status: 'COMPLETED' });
    mockQueue.result.mockResolvedValue({
      data: { images: [{ url: 'https://v3.fal.media/1.png' }, { url: 'https://v3.fal.media/2.png' }] },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? 'image/png' : null) },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      }),
    );
    const { text } = await call('fal_fetch_result', {
      request_id: 'r1',
      model: 'fal-ai/x',
      output: '/tmp/out.png',
    });
    const body = JSON.parse(text);
    expect(body.saved.map((s: { uri: string }) => s.uri)).toEqual(['/tmp/out.png', '/tmp/out_2.png']);
    expect(mockProviderWrite).toHaveBeenCalledTimes(2);
  });

  it('returns the raw result of a completed text job', async () => {
    mockQueue.status.mockResolvedValue({ status: 'COMPLETED' });
    mockQueue.result.mockResolvedValue({ data: { text: 'hello' } });
    const { text } = await call('fal_fetch_result', { request_id: 'r1', model: 'fal-ai/x' });
    expect(JSON.parse(text)).toMatchObject({ status: 'COMPLETED', media: [], result: { text: 'hello' } });
  });

  it('refuses `output` for a result without media', async () => {
    mockQueue.status.mockResolvedValue({ status: 'COMPLETED' });
    mockQueue.result.mockResolvedValue({ data: { text: 'hello' } });
    const { isError, text } = await call('fal_fetch_result', {
      request_id: 'r1',
      model: 'fal-ai/x',
      output: '/tmp/out.txt',
    });
    expect(isError).toBe(true);
    expect(text).toMatch(/has no media file to save/);
  });

  it('fal_cancel cancels and records it', async () => {
    mockQueue.cancel.mockResolvedValue(undefined);
    const { text } = await call('fal_cancel', { request_id: 'r9', model: 'fal-ai/x' });
    expect(mockQueue.cancel).toHaveBeenCalledWith('fal-ai/x', { requestId: 'r9' });
    expect(JSON.parse(text).cancelled).toBe(true);
    expect((await listFalJobs())[0]).toMatchObject({ request_id: 'r9', event: 'cancelled' });
  });
});

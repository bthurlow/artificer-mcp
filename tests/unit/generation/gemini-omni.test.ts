import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// vi.mock factories are hoisted above module scope, so the fns they close
// over must be created with vi.hoisted rather than plain consts.
const { mockCreate, mockGet, mockDownloadAndWrite } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockGet: vi.fn(),
  mockDownloadAndWrite: vi.fn(),
}));

vi.mock('../../../src/generation/client.js', () => ({
  getGenAIClient: () => ({ interactions: { create: mockCreate, get: mockGet } }),
  getGenAIClientForVertex: () => ({ interactions: { create: mockCreate, get: mockGet } }),
}));

// Only `downloadAndWrite` is stubbed — `geminiDownloadHeaders` stays REAL.
// Mocking it too would mean asserting on our own stub instead of on the
// header logic the tool actually depends on, which is precisely the gap
// that let the 403 ship.
vi.mock('../../../src/generation/utils/download-and-write.js', async () => {
  const actual = await vi.importActual<
    typeof import('../../../src/generation/utils/download-and-write.js')
  >('../../../src/generation/utils/download-and-write.js');
  return { ...actual, downloadAndWrite: mockDownloadAndWrite };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerOmniVideoTools, extractOmniVideo } from '../../../src/generation/gemini-omni.js';

/** A completed interaction carrying a video uri. */
function completed(id = 'int_1', uri = 'https://example.test/v.mp4'): Record<string, unknown> {
  return {
    id,
    status: 'completed',
    steps: [{ type: 'model_output', content: [{ type: 'video', uri, mime_type: 'video/mp4' }] }],
  };
}

describe('gemini_omni_generate_video', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerOmniVideoTools(server);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [c, s] = InMemoryTransport.createLinkedPair();
    await server.connect(s);
    await client.connect(c);
    cleanup = async (): Promise<void> => {
      await client.close();
      await server.close();
    };
  });

  const savedApiKey = process.env['GOOGLE_API_KEY'];

  afterAll(async () => {
    await cleanup();
    if (savedApiKey === undefined) delete process.env['GOOGLE_API_KEY'];
    else process.env['GOOGLE_API_KEY'] = savedApiKey;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockDownloadAndWrite.mockResolvedValue({ bytes: 1234, mime: 'video/mp4' });
  });

  it('creates an interaction with a video response format and writes the result', async () => {
    mockCreate.mockResolvedValue(completed());

    const result = await client.callTool({
      name: 'gemini_omni_generate_video',
      arguments: { prompt: 'a neon alley', output: '/tmp/clip.mp4', duration_seconds: 8 },
    });

    expect(mockCreate).toHaveBeenCalledOnce();
    const req = mockCreate.mock.calls[0][0];
    expect(req.model).toBe('gemini-omni-flash-preview');
    expect(req.response_format).toMatchObject({ type: 'video', delivery: 'uri', duration: '8s' });
    expect(req.input[0]).toEqual({ type: 'text', text: 'a neon alley' });

    const text = (result.content as Array<{ text: string }>)[0].text;
    const payload = JSON.parse(text);
    expect(payload.video.uri).toBe('/tmp/clip.mp4');
    // Callers need the id to chain a conversational edit.
    expect(payload.interaction_id).toBe('int_1');
    // Omni bakes in a soundtrack with no way to disable it. A caller laying
    // their own music underneath has to strip it, so the payload must say
    // so — an earlier revision claimed the opposite and would have sent
    // fixed-master pipelines into a collision.
    expect(payload.audio).toContain('native');
    expect(payload.audio).toContain('strip');
    expect(payload.audio).not.toContain('does not');
  });

  it('sends the Gemini Files API key when downloading the result', async () => {
    // This is the bug that reached a live run: the tool called
    // downloadAndWrite with only defaultMime, so a Files API URI came back
    // 403. The mock hid it — asserting on the ARGUMENTS is what makes the
    // mock able to catch a missing header at all.
    process.env['GOOGLE_API_KEY'] = 'test-key';
    mockCreate.mockResolvedValue(
      completed('int_dl', 'https://generativelanguage.googleapis.com/v1beta/files/abc:download'),
    );

    await client.callTool({
      name: 'gemini_omni_generate_video',
      arguments: { prompt: 'x', output: '/tmp/dl.mp4' },
    });

    const [, , opts] = mockDownloadAndWrite.mock.calls[0];
    expect(opts.headers).toEqual({ 'x-goog-api-key': 'test-key' });
  });

  it('omits the key for a non-Google delivery host', async () => {
    process.env['GOOGLE_API_KEY'] = 'test-key';
    mockCreate.mockResolvedValue(completed('int_cdn', 'https://cdn.example.test/v.mp4'));

    await client.callTool({
      name: 'gemini_omni_generate_video',
      arguments: { prompt: 'x', output: '/tmp/cdn.mp4' },
    });

    const [, , opts] = mockDownloadAndWrite.mock.calls[0];
    expect(opts.headers).toBeUndefined();
  });

  it('polls until the interaction reaches a terminal status', async () => {
    mockCreate.mockResolvedValue({ id: 'int_2', status: 'queued' });
    mockGet
      .mockResolvedValueOnce({ id: 'int_2', status: 'in_progress' })
      .mockResolvedValueOnce(completed('int_2'));

    await client.callTool({
      name: 'gemini_omni_generate_video',
      arguments: {
        prompt: 'x',
        output: '/tmp/p.mp4',
        poll_interval_seconds: 0.01,
        poll_timeout_seconds: 5,
      },
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('passes task and previous_interaction_id for conversational edits', async () => {
    mockCreate.mockResolvedValue(completed('int_3'));

    await client.callTool({
      name: 'gemini_omni_generate_video',
      arguments: {
        prompt: 'make it rain',
        output: '/tmp/e.mp4',
        task: 'edit',
        previous_interaction_id: 'int_prev',
      },
    });

    const req = mockCreate.mock.calls[0][0];
    expect(req.previous_interaction_id).toBe('int_prev');
    expect(req.generation_config.video_config.task).toBe('edit');
  });

  it('surfaces a failed interaction with its error detail', async () => {
    mockCreate.mockResolvedValue({
      id: 'int_4',
      status: 'failed',
      errors: [{ message: 'safety block' }],
    });

    const result = await client.callTool({
      name: 'gemini_omni_generate_video',
      arguments: { prompt: 'x', output: '/tmp/f.mp4' },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('failed');
    expect(text).toContain('safety block');
  });

  it('times out rather than polling forever', async () => {
    mockCreate.mockResolvedValue({ id: 'int_5', status: 'in_progress' });
    mockGet.mockResolvedValue({ id: 'int_5', status: 'in_progress' });

    const result = await client.callTool({
      name: 'gemini_omni_generate_video',
      arguments: {
        prompt: 'x',
        output: '/tmp/t.mp4',
        poll_interval_seconds: 0.01,
        poll_timeout_seconds: 0.05,
      },
    });

    expect(result.isError).toBe(true);
    expect((result.content as Array<{ text: string }>)[0].text).toContain('timed out');
  });

  describe('extractOmniVideo', () => {
    it('prefers a uri over inline data', () => {
      const out = extractOmniVideo({
        id: 'i',
        status: 'completed',
        steps: [
          {
            type: 'model_output',
            content: [{ type: 'video', uri: 'https://x/y.mp4', data: 'BASE64' }],
          },
        ],
      });
      expect(out.uri).toBe('https://x/y.mp4');
      expect(out.data).toBeUndefined();
    });

    it('falls back to inline data when no uri is present', () => {
      const out = extractOmniVideo({
        id: 'i',
        status: 'completed',
        steps: [{ type: 'model_output', content: [{ type: 'video', data: 'BASE64' }] }],
      });
      expect(out.data).toBe('BASE64');
    });

    it('reports a step error instead of a misleading "no video" message', () => {
      expect(() =>
        extractOmniVideo({
          id: 'i',
          status: 'completed',
          steps: [{ type: 'model_output', error: { message: 'recitation' } }],
        }),
      ).toThrow(/recitation/);
    });

    it('throws when the interaction carries no video block', () => {
      expect(() =>
        extractOmniVideo({
          id: 'i',
          status: 'completed',
          steps: [{ type: 'model_output', content: [{ type: 'text' }] }],
        }),
      ).toThrow(/no video content/);
    });
  });
});

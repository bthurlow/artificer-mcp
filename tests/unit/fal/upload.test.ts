import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

const mockUpload = vi.fn();

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({ storage: { upload: mockUpload } }),
}));

vi.mock('../../../src/utils/resource.js', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/resource.js')>(
    '../../../src/utils/resource.js',
  );
  return {
    ...actual,
    resolveInput: vi.fn(async (uri: string) => ({
      localPath: `/tmp/fake-${uri.split('/').pop()}`,
      cleanup: vi.fn(),
    })),
  };
});

vi.mock('node:fs/promises', async () => {
  const actual =
    await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return {
    ...actual,
    readFile: vi.fn(async () => Buffer.from('fake-bytes')),
  };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerFalUploadTool } from '../../../src/generation/fal/upload.js';
import { resolveExtraFiles } from '../../../src/generation/fal/inputs.js';

describe('resolveExtraFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty resolved + no-op cleanup when extra_files is undefined', async () => {
    const upload = vi.fn();
    const out = await resolveExtraFiles(undefined, upload);
    expect(out.resolved).toEqual({});
    await out.cleanup();
    expect(upload).not.toHaveBeenCalled();
  });

  it('passes public https values through unchanged', async () => {
    const upload = vi.fn();
    const out = await resolveExtraFiles(
      {
        start_image_url: 'https://example.com/start.png',
        end_image_url: 'https://example.com/end.png',
      },
      upload,
    );
    expect(out.resolved).toEqual({
      start_image_url: 'https://example.com/start.png',
      end_image_url: 'https://example.com/end.png',
    });
    expect(upload).not.toHaveBeenCalled();
  });

  it('uploads non-https values and returns the uploaded URLs', async () => {
    const upload = vi
      .fn()
      .mockResolvedValueOnce('https://v3.fal.media/u/start.png')
      .mockResolvedValueOnce('https://v3.fal.media/u/end.png');
    const out = await resolveExtraFiles(
      {
        start_image_url: '/local/start.png',
        end_image_url: 'gs://bucket/end.png',
      },
      upload,
    );
    expect(upload).toHaveBeenCalledTimes(2);
    expect(out.resolved.start_image_url).toBe('https://v3.fal.media/u/start.png');
    expect(out.resolved.end_image_url).toBe('https://v3.fal.media/u/end.png');
  });

  it('resolves array values element-by-element', async () => {
    const upload = vi
      .fn()
      .mockResolvedValueOnce('https://v3.fal.media/u/r1.png')
      .mockResolvedValueOnce('https://v3.fal.media/u/r2.png');
    const out = await resolveExtraFiles(
      {
        reference_image_urls: ['/local/r1.png', '/local/r2.png'],
      },
      upload,
    );
    expect(upload).toHaveBeenCalledTimes(2);
    expect(out.resolved.reference_image_urls).toEqual([
      'https://v3.fal.media/u/r1.png',
      'https://v3.fal.media/u/r2.png',
    ]);
  });

  it('mixes string and array values, https passthrough included', async () => {
    const upload = vi.fn().mockResolvedValueOnce('https://v3.fal.media/u/uploaded.png');
    const out = await resolveExtraFiles(
      {
        start_image_url: 'https://example.com/start.png',
        end_image_url: '/local/end.png',
        refs: ['https://example.com/r1.png'],
      },
      upload,
    );
    expect(upload).toHaveBeenCalledTimes(1);
    expect(out.resolved).toEqual({
      start_image_url: 'https://example.com/start.png',
      end_image_url: 'https://v3.fal.media/u/uploaded.png',
      refs: ['https://example.com/r1.png'],
    });
  });
});

describe('fal_upload (MCP)', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerFalUploadTool(server);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    cleanup = async () => {
      await client.close();
      await server.close();
    };
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes a public https URL through without uploading', async () => {
    const result = await client.callTool({
      name: 'fal_upload',
      arguments: { source: 'https://example.com/start.png' },
    });
    expect(mockUpload).not.toHaveBeenCalled();
    const text = (result.content as Array<{ text: string }>)[0].text;
    const parsed = JSON.parse(text) as {
      url: string;
      was_uploaded: boolean;
      source: string;
    };
    expect(parsed.url).toBe('https://example.com/start.png');
    expect(parsed.was_uploaded).toBe(false);
    expect(parsed.source).toBe('https://example.com/start.png');
  });

  it('uploads a local path and returns the fal storage URL', async () => {
    mockUpload.mockResolvedValue('https://v3.fal.media/u/abc.png');
    const result = await client.callTool({
      name: 'fal_upload',
      arguments: { source: '/local/path/start.png' },
    });
    expect(mockUpload).toHaveBeenCalledTimes(1);
    const text = (result.content as Array<{ text: string }>)[0].text;
    const parsed = JSON.parse(text) as { url: string; was_uploaded: boolean };
    expect(parsed.url).toBe('https://v3.fal.media/u/abc.png');
    expect(parsed.was_uploaded).toBe(true);
  });

  it('uploads a gs:// URI', async () => {
    mockUpload.mockResolvedValue('https://v3.fal.media/u/gs.png');
    const result = await client.callTool({
      name: 'fal_upload',
      arguments: { source: 'gs://bucket/file.png' },
    });
    expect(mockUpload).toHaveBeenCalledTimes(1);
    const text = (result.content as Array<{ text: string }>)[0].text;
    const parsed = JSON.parse(text) as { url: string; was_uploaded: boolean };
    expect(parsed.url).toBe('https://v3.fal.media/u/gs.png');
    expect(parsed.was_uploaded).toBe(true);
  });

  it('rejects an empty source', async () => {
    const result = await client.callTool({
      name: 'fal_upload',
      arguments: { source: '' },
    });
    expect(result.isError).toBe(true);
  });
});

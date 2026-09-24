import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

const mockSubscribe = vi.fn();
const mockUpload = vi.fn(async () => 'https://fal.media/uploaded/song.wav');

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({ subscribe: mockSubscribe, storage: { upload: mockUpload } }),
}));

const mockProviderWrite = vi.fn();
vi.mock('../../../src/storage/providers/registry.js', async () => {
  const actual = await vi.importActual<
    typeof import('../../../src/storage/providers/registry.js')
  >('../../../src/storage/providers/registry.js');
  return { ...actual, getProvider: () => ({ scheme: 'file', write: mockProviderWrite }) };
});

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
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return { ...actual, readFile: vi.fn(async () => Buffer.from('fake-audio')) };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  defaultBasename,
  extractStems,
  joinOutput,
  registerFalSeparationTools,
} from '../../../src/generation/fal/separation.js';

describe('fal_separate_audio — pure helpers', () => {
  it('collects one file per stem and ignores null stems', () => {
    const stems = extractStems({
      vocals: { url: 'https://fal.media/x/vocals.wav', content_type: 'audio/wav' },
      drums: { url: 'https://fal.media/x/drums.mp3' },
      guitar: null,
      piano: null,
    });
    expect(stems.map((s) => [s.stem, s.ext])).toEqual([
      ['vocals', 'wav'],
      ['drums', 'mp3'],
    ]);
  });

  it('takes the extension from file_name, then URL, then content type, then wav', () => {
    expect(extractStems({ a: { url: 'https://h/x', file_name: 'a.flac' } })[0].ext).toBe('flac');
    expect(extractStems({ a: { url: 'https://h/x', content_type: 'audio/mpeg' } })[0].ext).toBe(
      'mp3',
    );
    expect(extractStems({ a: { url: 'https://h/x' } })[0].ext).toBe('wav');
  });

  it('rejects a result with no stem files', () => {
    expect(() => extractStems({ vocals: null })).toThrow(/no stem files/);
    expect(() => extractStems('x')).toThrow(/non-object/);
  });

  it('derives the default basename from paths and URLs', () => {
    expect(defaultBasename('./music/Cathode Saint.wav')).toBe('Cathode Saint');
    expect(defaultBasename('https://cdn.example.com/a/b/track.mp3?sig=1')).toBe('track');
    expect(defaultBasename('gs://bucket/mix')).toBe('mix');
  });

  it('joins local dirs and storage URIs without doubling slashes', () => {
    expect(joinOutput('./stems/', 'a-vocals.wav')).toBe('./stems/a-vocals.wav');
    expect(joinOutput('gs://bucket/stems', 'a-vocals.wav')).toBe('gs://bucket/stems/a-vocals.wav');
  });
});

describe('fal_separate_audio — tool', () => {
  let client: Client;
  let server: McpServer;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0' });
    registerFalSeparationTools(server);
    client = new Client({ name: 'test-client', version: '0' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(b);
    await client.connect(a);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'audio/wav' }),
        arrayBuffer: async () => new TextEncoder().encode('pcm').buffer,
      })),
    );
  });

  it('uploads the mix, sends stems + extra_params, writes <basename>-<stem>.<ext>', async () => {
    mockSubscribe.mockResolvedValue({
      data: {
        vocals: { url: 'https://fal.media/v.wav' },
        other: { url: 'https://fal.media/o.wav' },
        drums: null,
      },
    });
    const r = await client.callTool({
      name: 'fal_separate_audio',
      arguments: {
        model: 'fal-ai/demucs',
        audio: './song.wav',
        output_dir: './stems',
        stems: ['vocals', 'other'],
        extra_params: { model: 'htdemucs_ft', output_format: 'wav' },
      },
    });

    const [endpoint, opts] = mockSubscribe.mock.calls[0];
    expect(endpoint).toBe('fal-ai/demucs');
    // Demucs's own `model` input (its network) rides extra_params untouched.
    expect(opts.input).toEqual({
      audio_url: 'https://fal.media/uploaded/song.wav',
      stems: ['vocals', 'other'],
      model: 'htdemucs_ft',
      output_format: 'wav',
    });
    expect(mockProviderWrite.mock.calls.map((c) => c[0])).toEqual([
      './stems/song-vocals.wav',
      './stems/song-other.wav',
    ]);
    const body = JSON.parse((r.content as Array<{ text: string }>)[0].text);
    expect(body.stems).toEqual({
      vocals: './stems/song-vocals.wav',
      other: './stems/song-other.wav',
    });
  });

  it('honors an explicit basename', async () => {
    mockSubscribe.mockResolvedValue({ data: { vocals: { url: 'https://fal.media/v.mp3' } } });
    await client.callTool({
      name: 'fal_separate_audio',
      arguments: {
        model: 'fal-ai/demucs',
        audio: 'https://example.com/master.wav',
        output_dir: 'gs://bucket/stems',
        basename: 'track-01',
      },
    });
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockProviderWrite.mock.calls[0][0]).toBe('gs://bucket/stems/track-01-vocals.mp3');
  });

  it('wraps fal errors', async () => {
    mockSubscribe.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));
    const r = await client.callTool({
      name: 'fal_separate_audio',
      arguments: { model: 'fal-ai/demucs', audio: './s.wav', output_dir: './o' },
    });
    expect((r as { isError?: boolean }).isError).toBe(true);
    expect((r.content as Array<{ text: string }>)[0].text).toContain('fal_separate_audio failed');
  });
});

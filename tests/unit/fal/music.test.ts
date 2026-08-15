import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

const mockSubscribe = vi.fn();
const mockUpload = vi.fn();

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({
    subscribe: mockSubscribe,
    storage: { upload: mockUpload },
  }),
}));

const mockProviderWrite = vi.fn();
vi.mock('../../../src/storage/providers/registry.js', async () => {
  const actual = await vi.importActual<
    typeof import('../../../src/storage/providers/registry.js')
  >('../../../src/storage/providers/registry.js');
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

vi.mock('../../../src/utils/resource.js', async () => {
  const actual =
    await vi.importActual<typeof import('../../../src/utils/resource.js')>(
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
    await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    );
  return { ...actual, readFile: vi.fn(async () => Buffer.from('fake-bytes')) };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  registerFalMusicTools,
  buildMusicInput,
  extractMusicOutput,
} from '../../../src/generation/fal/music.js';

function stubFetch(contentType = 'audio/mpeg') {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {
      get: (key: string) =>
        key.toLowerCase() === 'content-type' ? contentType : null,
    },
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(64)),
  });
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

describe('buildMusicInput', () => {
  it('maps structural args', () => {
    const { input, collisions } = buildMusicInput(
      { prompt: 'sunset lofi', lyrics: '[verse]\nhi', audioUrl: 'https://ref' },
      undefined,
    );
    expect(input).toEqual({
      prompt: 'sunset lofi',
      lyrics: '[verse]\nhi',
      audio_url: 'https://ref',
    });
    expect(collisions).toEqual([]);
  });

  it('spreads extra_params for model-specific knobs (music_length_ms, force_instrumental)', () => {
    const { input } = buildMusicInput(
      { prompt: 'x' },
      { music_length_ms: 15000, force_instrumental: true, output_format: 'mp3_44100_128' },
    );
    expect(input).toMatchObject({
      prompt: 'x',
      music_length_ms: 15000,
      force_instrumental: true,
      output_format: 'mp3_44100_128',
    });
  });

  it('structural prompt wins over extra_params.prompt collision', () => {
    const { input, collisions } = buildMusicInput(
      { prompt: 'structural' },
      { prompt: 'extra', seed: 42 },
    );
    expect(input.prompt).toBe('structural');
    expect(input.seed).toBe(42);
    expect(collisions).toEqual(['prompt']);
  });
});

describe('extractMusicOutput', () => {
  it('pulls audio.url from response', () => {
    expect(
      extractMusicOutput({ audio: { url: 'https://v3.fal.media/music.mp3' } }),
    ).toBe('https://v3.fal.media/music.mp3');
  });

  it('throws when audio.url missing', () => {
    expect(() => extractMusicOutput({ audio: {} })).toThrow(/url.*missing/);
    expect(() => extractMusicOutput({})).toThrow(/missing `audio`/);
  });

  it('throws on non-object', () => {
    expect(() => extractMusicOutput(null)).toThrow(/non-object/);
  });
});

describe('fal_generate_music (MCP)', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerFalMusicTools(server);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await server.connect(st);
    await client.connect(ct);
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
    vi.unstubAllGlobals();
  });

  it('instrumental music path: writes output and returns JSON', async () => {
    mockSubscribe.mockResolvedValue({
      data: { audio: { url: 'https://v3.fal.media/song.mp3' } },
      requestId: 'req-m1',
    });
    stubFetch();

    const result = await client.callTool({
      name: 'fal_generate_music',
      arguments: {
        model: 'fal-ai/lyria2',
        prompt: 'warm indie folk acoustic guitar 110 bpm',
        output: '/tmp/bed.mp3',
      },
    });

    expect(mockSubscribe.mock.calls[0][1].input.prompt).toBe(
      'warm indie folk acoustic guitar 110 bpm',
    );
    const payload = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text,
    );
    expect(payload.audio.uri).toBe('/tmp/bed.mp3');
    expect(payload.source_url).toBe('https://v3.fal.media/song.mp3');
  });

  it('song with lyrics: passes both prompt and lyrics to fal', async () => {
    mockSubscribe.mockResolvedValue({
      data: { audio: { url: 'https://v3.fal.media/song.mp3' } },
      requestId: 'req-m2',
    });
    stubFetch();

    await client.callTool({
      name: 'fal_generate_music',
      arguments: {
        model: 'fal-ai/minimax-music/v2.6',
        prompt: 'city pop 80s',
        lyrics: '[verse]\nStreetlights flicker',
        output: '/tmp/song.mp3',
      },
    });

    const input = mockSubscribe.mock.calls[0][1].input;
    expect(input.prompt).toBe('city pop 80s');
    expect(input.lyrics).toBe('[verse]\nStreetlights flicker');
  });

  it('SFX path: short prompt + extra_params duration works', async () => {
    mockSubscribe.mockResolvedValue({
      data: { audio: { url: 'https://v3.fal.media/sfx.mp3' } },
      requestId: 'req-m3',
    });
    stubFetch();

    await client.callTool({
      name: 'fal_generate_music',
      arguments: {
        model: 'fal-ai/elevenlabs/sound-effects/v2',
        prompt: 'glass shattering on tile floor',
        output: '/tmp/sfx.mp3',
        extra_params: { duration_seconds: 3 },
      },
    });

    const input = mockSubscribe.mock.calls[0][1].input;
    expect(input.prompt).toBe('glass shattering on tile floor');
    expect(input.duration_seconds).toBe(3);
  });

  it('style-reference gs:// audio uploads via fal storage', async () => {
    mockUpload.mockResolvedValue('https://v3.fal.media/ref.mp3');
    mockSubscribe.mockResolvedValue({
      data: { audio: { url: 'https://v3.fal.media/out.mp3' } },
      requestId: 'req-m4',
    });
    stubFetch();

    await client.callTool({
      name: 'fal_generate_music',
      arguments: {
        model: 'fal-ai/stable-audio-25/text-to-audio',
        prompt: 'reference this style',
        reference_audio: 'gs://bucket/ref.mp3',
        output: '/tmp/out.mp3',
      },
    });

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockSubscribe.mock.calls[0][1].input.audio_url).toBe(
      'https://v3.fal.media/ref.mp3',
    );
  });

  it('requires model', async () => {
    const result = await client.callTool({
      name: 'fal_generate_music',
      arguments: { output: '/tmp/x.mp3', prompt: 'x' },
    });
    expect(result.isError).toBe(true);
  });

  it('surfaces fal content_policy_violation for blocked lyrics', async () => {
    mockSubscribe.mockRejectedValue(
      Object.assign(new Error('HTTP 422'), {
        status: 422,
        body: {
          detail: [
            {
              loc: ['body', 'lyrics'],
              msg: 'blocked',
              type: 'content_policy_violation',
            },
          ],
        },
        requestId: 'req-blocked',
      }),
    );

    const result = await client.callTool({
      name: 'fal_generate_music',
      arguments: {
        model: 'fal-ai/minimax-music/v2.6',
        prompt: 'x',
        lyrics: 'y',
        output: '/tmp/x.mp3',
      },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('FalContentPolicyViolationError');
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — must be set up before importing anything that transitively loads
// the fal SDK or the storage providers.
// ---------------------------------------------------------------------------

const mockSubscribe = vi.fn();
const mockUpload = vi.fn();

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({
    subscribe: mockSubscribe,
    storage: { upload: mockUpload },
  }),
}));

// Stub the storage provider registry so the downloadAndWrite call at the end
// of the tool doesn't try to hit a real filesystem/gcs/etc.
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

// Stub resolveInput so tests don't touch real filesystem / GCS.
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

// Stub readFile so the Blob construction path doesn't read a real file.
vi.mock('node:fs/promises', async () => {
  const actual =
    await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    );
  return {
    ...actual,
    readFile: vi.fn(async () => Buffer.from('fake-bytes')),
  };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerFalVideoTools } from '../../../src/generation/fal/video.js';
import {
  buildFalInput,
  extractVideoUrl,
  isPublicHttpsUrl,
} from '../../../src/generation/fal/video.js';

// ---------------------------------------------------------------------------
// Helper: mocked fetch that returns a minimal Response downloadAndWrite
// understands. Used by tests that need the full tool path to succeed.
// ---------------------------------------------------------------------------

function stubFetch(contentType = 'video/mp4') {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {
      get: (key: string) =>
        key.toLowerCase() === 'content-type' ? contentType : null,
    },
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)),
  });
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

// ---------------------------------------------------------------------------
// Pure helper tests (no MCP plumbing needed).
// ---------------------------------------------------------------------------

describe('isPublicHttpsUrl', () => {
  it.each([
    ['https://example.com/x.jpg', true],
    ['http://example.com/x.jpg', true],
    ['HTTPS://example.com/x.jpg', true],
    ['gs://bucket/x.jpg', false],
    ['s3://bucket/x.jpg', false],
    ['/tmp/x.jpg', false],
    ['C:\\Users\\x.jpg', false],
    ['file:///tmp/x.jpg', false],
  ])('%s → %s', (input, expected) => {
    expect(isPublicHttpsUrl(input)).toBe(expected);
  });
});

describe('buildFalInput', () => {
  it('maps structural args to fal input keys', () => {
    const { input, collisions } = buildFalInput(
      {
        prompt: 'test prompt',
        imageUrl: 'https://img',
        audioUrl: 'https://aud',
        duration: 7,
        aspectRatio: '9:16',
        resolution: '720p',
        negativePrompt: 'blurry',
      },
      undefined,
    );
    expect(input).toEqual({
      prompt: 'test prompt',
      image_url: 'https://img',
      audio_url: 'https://aud',
      duration: 7,
      aspect_ratio: '9:16',
      resolution: '720p',
      negative_prompt: 'blurry',
    });
    expect(collisions).toEqual([]);
  });

  it('omits undefined structural args', () => {
    const { input } = buildFalInput({ prompt: 'x' }, undefined);
    expect(input).toEqual({ prompt: 'x' });
    expect(Object.keys(input)).not.toContain('image_url');
    expect(Object.keys(input)).not.toContain('audio_url');
  });

  it('spreads extra_params onto the payload', () => {
    const { input, collisions } = buildFalInput(
      { prompt: 'x' },
      { seed: 42, enable_prompt_expansion: false },
    );
    expect(input).toEqual({
      prompt: 'x',
      seed: 42,
      enable_prompt_expansion: false,
    });
    expect(collisions).toEqual([]);
  });

  it('lets structural args win over extra_params and records the collision', () => {
    const { input, collisions } = buildFalInput(
      { prompt: 'structural', duration: 7 },
      { prompt: 'via extra', duration: 5, seed: 42 },
    );
    expect(input.prompt).toBe('structural');
    expect(input.duration).toBe(7);
    expect(input.seed).toBe(42);
    expect(collisions.sort()).toEqual(['duration', 'prompt']);
  });

  it('does NOT flag collisions for non-structural keys in extra_params', () => {
    // Caller passes `image_url` via extra_params only, no structural `image`.
    // This is the happy "advanced escape hatch" path — no warning.
    const { input, collisions } = buildFalInput(
      { prompt: 'x' },
      { image_url: 'https://e/img.jpg', custom_model_flag: 'z' },
    );
    expect(input.image_url).toBe('https://e/img.jpg');
    expect(input.custom_model_flag).toBe('z');
    expect(collisions).toEqual([]);
  });

  it('structural `imageUrl` overrides extra_params.image_url with collision', () => {
    const { input, collisions } = buildFalInput(
      { imageUrl: 'https://resolved.example/a.jpg' },
      { image_url: 'https://caller-supplied.example/b.jpg' },
    );
    expect(input.image_url).toBe('https://resolved.example/a.jpg');
    expect(collisions).toContain('image_url');
  });
});

describe('extractVideoUrl', () => {
  it('pulls video.url from fal response data', () => {
    expect(
      extractVideoUrl({ video: { url: 'https://v3.fal.media/x.mp4' } }),
    ).toBe('https://v3.fal.media/x.mp4');
  });

  it('throws descriptively when data is not an object', () => {
    expect(() => extractVideoUrl(null)).toThrow(/non-object/);
    expect(() => extractVideoUrl('nope')).toThrow(/non-object/);
  });

  it('throws when video field is missing', () => {
    expect(() => extractVideoUrl({ notVideo: {} })).toThrow(/missing `video`/);
  });

  it('throws when video.url is missing or empty', () => {
    expect(() => extractVideoUrl({ video: {} })).toThrow(/url.*missing/);
    expect(() => extractVideoUrl({ video: { url: '' } })).toThrow(
      /url.*missing/,
    );
    expect(() => extractVideoUrl({ video: { url: 42 } })).toThrow(
      /not a string/,
    );
  });
});

// ---------------------------------------------------------------------------
// MCP-level tests — wire the tool through InMemoryTransport and call it as
// an external client would.
// ---------------------------------------------------------------------------

describe('fal_generate_video (MCP)', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerFalVideoTools(server);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
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
    vi.unstubAllGlobals();
  });

  it('passes public HTTPS image/audio URLs through without upload', async () => {
    mockSubscribe.mockResolvedValue({
      data: { video: { url: 'https://v3.fal.media/out.mp4' } },
      requestId: 'req-1',
    });
    stubFetch();

    await client.callTool({
      name: 'fal_generate_video',
      arguments: {
        model: 'fal-ai/wan/v2.7/image-to-video',
        prompt: 'A cat.',
        output: '/tmp/out.mp4',
        image: 'https://storage.googleapis.com/b/cat.jpg',
        audio: 'https://storage.googleapis.com/b/cat.mp3',
        duration_seconds: 7,
        resolution: '720p',
      },
    });

    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    const [modelArg, opts] = mockSubscribe.mock.calls[0];
    expect(modelArg).toBe('fal-ai/wan/v2.7/image-to-video');
    expect(opts.input.image_url).toBe(
      'https://storage.googleapis.com/b/cat.jpg',
    );
    expect(opts.input.audio_url).toBe(
      'https://storage.googleapis.com/b/cat.mp3',
    );
    expect(opts.input.duration).toBe(7);
    expect(opts.input.resolution).toBe('720p');
    expect(opts.input.prompt).toBe('A cat.');
  });

  it('uploads gs:// image via fal storage and uses returned URL', async () => {
    mockUpload.mockResolvedValue('https://v3.fal.media/uploaded/img.jpg');
    mockSubscribe.mockResolvedValue({
      data: { video: { url: 'https://v3.fal.media/out.mp4' } },
      requestId: 'req-2',
    });
    stubFetch();

    await client.callTool({
      name: 'fal_generate_video',
      arguments: {
        model: 'fal-ai/kling-video/ai-avatar/v2/pro',
        prompt: 'Speaking.',
        output: '/tmp/out.mp4',
        image: 'gs://bucket/jenn.jpg',
      },
    });

    expect(mockUpload).toHaveBeenCalledTimes(1);
    const [blob] = mockUpload.mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg'); // from guessMime
    expect(mockSubscribe.mock.calls[0][1].input.image_url).toBe(
      'https://v3.fal.media/uploaded/img.jpg',
    );
  });

  it('spreads extra_params into the fal input', async () => {
    mockSubscribe.mockResolvedValue({
      data: { video: { url: 'https://v3.fal.media/out.mp4' } },
      requestId: 'req-3',
    });
    stubFetch();

    await client.callTool({
      name: 'fal_generate_video',
      arguments: {
        model: 'fal-ai/wan/v2.7/image-to-video',
        output: '/tmp/out.mp4',
        prompt: 'x',
        extra_params: { seed: 12345, enable_prompt_expansion: false },
      },
    });

    const input = mockSubscribe.mock.calls[0][1].input;
    expect(input.seed).toBe(12345);
    expect(input.enable_prompt_expansion).toBe(false);
  });

  it('rejects duration passed as a string at the schema layer (regression guard for 422)', async () => {
    // The Q2 bake-off hit a fal 422 because the bake-off script sent
    // `duration: "5"` instead of `duration: 5`. The tool schema must
    // reject this shape before it ever reaches fal.
    const result = await client.callTool({
      name: 'fal_generate_video',
      arguments: {
        model: 'fal-ai/wan/v2.7/image-to-video',
        output: '/tmp/out.mp4',
        duration_seconds: '7', // wrong type on purpose
      },
    });

    expect(result.isError).toBe(true);
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('surfaces a fal 422 via parseFalError (content_policy_violation)', async () => {
    mockSubscribe.mockRejectedValue(
      Object.assign(new Error('HTTP 422'), {
        status: 422,
        body: {
          detail: [
            {
              loc: ['body', 'prompt'],
              msg: 'Content policy violation',
              type: 'content_policy_violation',
            },
          ],
        },
        requestId: 'req-blocked',
      }),
    );

    const result = await client.callTool({
      name: 'fal_generate_video',
      arguments: {
        model: 'fal-ai/wan/v2.7/image-to-video',
        prompt: 'something blocked',
        output: '/tmp/out.mp4',
      },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('FalContentPolicyViolationError');
    expect(text).toContain('content_policy_violation');
    expect(text).toContain('req-blocked');
  });

  it('requires explicit model — no default', async () => {
    const result = await client.callTool({
      name: 'fal_generate_video',
      arguments: { output: '/tmp/out.mp4' }, // model missing
    });
    expect(result.isError).toBe(true);
    expect(mockSubscribe).not.toHaveBeenCalled();
  });
});


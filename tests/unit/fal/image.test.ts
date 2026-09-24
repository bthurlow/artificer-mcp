import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Mocks — set up before importing anything that loads the fal SDK or storage.
const mockSubscribe = vi.fn();
const mockUpload = vi.fn(async () => 'https://fal.media/uploaded.png');

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
  return { ...actual, readFile: vi.fn(async () => Buffer.from('fake-bytes')) };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  buildFalImageInput,
  extractImageOutputs,
  nthOutputPath,
  registerFalImageTools,
} from '../../../src/generation/fal/image.js';

/** fetch stub: every download returns a small body with the given content type. */
function stubDownloads(contentType = 'image/png'): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': contentType }),
      arrayBuffer: async () => new TextEncoder().encode('img').buffer,
    })),
  );
}

describe('fal_generate_image — pure helpers', () => {
  it('structural args win over extra_params and report the collision', () => {
    const { input, collisions } = buildFalImageInput(
      { prompt: 'a cat', image_size: 'square_hd', num_images: undefined },
      { prompt: 'ignored', seed: 7 },
    );
    expect(input).toEqual({ prompt: 'a cat', image_size: 'square_hd', seed: 7 });
    expect(collisions).toEqual(['prompt']);
  });

  it('prefers images[] and falls back to a single image', () => {
    expect(extractImageOutputs({ images: [{ url: 'a' }, { url: 'b' }] }).images).toHaveLength(2);
    expect(extractImageOutputs({ image: { url: 'u', width: 2, height: 3 } }).images).toEqual([
      { url: 'u', width: 2, height: 3 },
    ]);
    // Bria returns both, describing the same result: don't double-download.
    expect(
      extractImageOutputs({ image: { url: 'same' }, images: [{ url: 'same' }] }).images,
    ).toHaveLength(1);
  });

  it('reports extra file outputs, NSFW flags, revised prompts and seeds', () => {
    const { notes } = extractImageOutputs({
      image: { url: 'cutout.png' },
      mask_image: { url: 'mask.png' },
      layers: [{ url: 'l1.png' }, { url: 'l2.png' }],
      has_nsfw_concepts: [false, true],
      revised_prompt: 'a tabby cat',
      seed: 42,
    });
    expect(notes).toContain('Also returned mask_image: mask.png');
    expect(notes).toContain('Also returned layers (2): l1.png, l2.png');
    expect(notes.some((n) => n.includes('NSFW'))).toBe(true);
    expect(notes).toContain('revised_prompt: a tabby cat');
    expect(notes).toContain('seed: 42');
  });

  it('rejects responses with no image', () => {
    expect(() => extractImageOutputs({ masks: [] })).toThrow(/no `images\[\]\.url` or `image\.url`/);
    expect(() => extractImageOutputs('nope')).toThrow(/non-object/);
  });

  it('numbers additional outputs beside the first', () => {
    expect(nthOutputPath('/o/cat.png', 1)).toBe('/o/cat.png');
    expect(nthOutputPath('/o/cat.png', 3)).toBe('/o/cat_3.png');
    expect(nthOutputPath('/o/cat', 2)).toBe('/o/cat_2');
  });
});

describe('fal_generate_image — tool', () => {
  let client: Client;
  let server: McpServer;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0' });
    registerFalImageTools(server);
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
    stubDownloads();
  });

  const text = (r: unknown): string => (r as { content: Array<{ text: string }> }).content[0].text;

  it('text-to-image: sends structural args and saves every image', async () => {
    mockSubscribe.mockResolvedValue({
      data: {
        images: [
          { url: 'https://fal.media/1.png', width: 1024, height: 1024, content_type: 'image/png' },
          { url: 'https://fal.media/2.png', width: 1024, height: 1024, content_type: 'image/png' },
        ],
        seed: 9,
      },
    });
    const r = await client.callTool({
      name: 'fal_generate_image',
      arguments: {
        model: 'bytedance/seedream/v5/pro/text-to-image',
        prompt: 'a lighthouse at dusk',
        output: '/tmp/lh.png',
        image_size: 'square_hd',
        num_images: 2,
        extra_params: { output_format: 'png' },
      },
    });

    const [model, opts] = mockSubscribe.mock.calls[0];
    expect(model).toBe('bytedance/seedream/v5/pro/text-to-image');
    expect(opts.input).toEqual({
      prompt: 'a lighthouse at dusk',
      image_size: 'square_hd',
      num_images: 2,
      output_format: 'png',
    });
    expect(mockProviderWrite.mock.calls.map((c) => c[0])).toEqual(['/tmp/lh.png', '/tmp/lh_2.png']);
    expect(text(r)).toContain('Image 1: saved to /tmp/lh.png (1024×1024, image/png');
    expect(text(r)).toContain('seed: 9');
  });

  it('edit: uploads local images/mask and maps them to image_urls / mask_url', async () => {
    mockSubscribe.mockResolvedValue({ data: { images: [{ url: 'https://fal.media/e.png' }] } });
    await client.callTool({
      name: 'fal_generate_image',
      arguments: {
        model: 'fal-ai/flux-2-pro/edit',
        prompt: 'make it night',
        output: '/tmp/e.png',
        images: ['./a.png', 'https://example.com/b.png'],
        mask: './mask.png',
      },
    });

    const input = mockSubscribe.mock.calls[0][1].input;
    // Local paths upload; the public URL passes through untouched.
    expect(input.image_urls).toEqual(['https://fal.media/uploaded.png', 'https://example.com/b.png']);
    expect(input.mask_url).toBe('https://fal.media/uploaded.png');
    expect(mockUpload).toHaveBeenCalledTimes(2);
  });

  it('task model: prompt-less single image in, single image out', async () => {
    mockSubscribe.mockResolvedValue({ data: { image: { url: 'https://fal.media/up.png' } } });
    await client.callTool({
      name: 'fal_generate_image',
      arguments: {
        model: 'topaz/upscale/image/precision',
        image: 'https://example.com/small.png',
        output: '/tmp/up.png',
        extra_params: { upscale_factor: 4 },
      },
    });
    expect(mockSubscribe.mock.calls[0][1].input).toEqual({
      image_url: 'https://example.com/small.png',
      upscale_factor: 4,
    });
  });

  it('saves what the model returned and says so when the extension disagrees', async () => {
    stubDownloads('image/jpeg');
    mockSubscribe.mockResolvedValue({ data: { images: [{ url: 'https://fal.media/j.jpeg' }] } });
    const r = await client.callTool({
      name: 'fal_generate_image',
      arguments: { model: 'openai/gpt-image-2', prompt: 'x', output: '/tmp/x.png' },
    });
    expect(mockProviderWrite.mock.calls[0][2]).toBe('image/jpeg');
    expect(text(r)).toContain('does not match the image/jpeg bytes');
  });

  it('wraps fal errors with the parsed type', async () => {
    mockSubscribe.mockRejectedValue(Object.assign(new Error('Unprocessable'), { status: 422 }));
    const r = await client.callTool({
      name: 'fal_generate_image',
      arguments: { model: 'm', prompt: 'x', output: '/tmp/x.png' },
    });
    expect((r as { isError?: boolean }).isError).toBe(true);
    expect(text(r)).toContain('fal_generate_image failed');
  });
});

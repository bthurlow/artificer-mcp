import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

const mockGenerateContent = vi.fn();

vi.mock('../../../src/generation/client.js', () => ({
  getGenAIClient: () => ({
    models: {
      generateContent: mockGenerateContent,
    },
  }),
}));

vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return {
    ...actual,
    mkdir: vi.fn(async () => undefined),
    writeFile: vi.fn(async () => undefined),
    readFile: vi.fn(async () => Buffer.from('fake-reference-image')),
  };
});

// vi.hoisted: the vi.mock factory below runs before normal top-level code.
const { mockMagick } = vi.hoisted(() => ({ mockMagick: vi.fn(async (_args: string[]) => '') }));
vi.mock('../../../src/utils/exec.js', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/exec.js')>(
    '../../../src/utils/exec.js',
  );
  return { ...actual, magick: mockMagick };
});

import { readFile } from 'node:fs/promises';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerNanobananaTools } from '../../../src/generation/nanobanana.js';

describe('gemini_nanobanana_generate_image', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerNanobananaTools(server);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    cleanup = async (): Promise<void> => {
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

  it('text-to-image: calls generateContent with IMAGE modality and saves output', async () => {
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: Buffer.from('png-bytes').toString('base64') } },
            ],
          },
        },
      ],
    });

    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: {
        prompt: 'a loaf of bread',
        output: '/tmp/bread.png',
      },
    });

    expect(mockGenerateContent).toHaveBeenCalledOnce();
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.model).toBe('gemini-3.1-flash-image');
    expect(call.contents[0].parts[0]).toEqual({ text: 'a loaf of bread' });
    expect(call.config.responseModalities).toEqual(['IMAGE']);

    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain('saved to /tmp/bread.png');
  });

  it('image-to-image: appends inlineData parts for each reference image', async () => {
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: Buffer.from('edited').toString('base64') } },
            ],
          },
        },
      ],
    });

    await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: {
        prompt: 'put the bread on a marble countertop',
        output: '/tmp/composite.png',
        reference_images: ['/tmp/bread.png', '/tmp/counter.jpg'],
      },
    });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.contents[0].parts).toHaveLength(3);
    expect(call.contents[0].parts[0]).toEqual({ text: 'put the bread on a marble countertop' });
    expect(call.contents[0].parts[1].inlineData.mimeType).toBe('image/png');
    expect(call.contents[0].parts[2].inlineData.mimeType).toBe('image/jpeg');
  });

  it('include_text=true requests IMAGE+TEXT modalities and surfaces narration', async () => {
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { text: 'Here is your sourdough loaf.' },
              { inlineData: { mimeType: 'image/png', data: Buffer.from('png').toString('base64') } },
            ],
          },
        },
      ],
    });

    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: {
        prompt: 'a loaf of bread',
        output: '/tmp/bread.png',
        include_text: true,
      },
    });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.responseModalities).toEqual(['IMAGE', 'TEXT']);

    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain('Text: Here is your sourdough loaf.');
    expect(content[0].text).toContain('saved to /tmp/bread.png');
  });

  it('aspect_ratio flows into imageConfig', async () => {
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: Buffer.from('png').toString('base64') } },
            ],
          },
        },
      ],
    });

    await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: {
        prompt: 'a loaf',
        output: '/tmp/bread.png',
        aspect_ratio: '9:16',
      },
    });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.imageConfig).toEqual({ aspectRatio: '9:16' });
  });

  it('reports safety block when no image returned', async () => {
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: { parts: [] },
          finishReason: 'SAFETY',
          safetyRatings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', blocked: true }],
        },
      ],
    });

    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: {
        prompt: 'blocked content',
        output: '/tmp/out.png',
      },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain('No images were generated');
    expect(content[0].text).toContain('HARM_CATEGORY_DANGEROUS_CONTENT');
  });

  it('numbers multi-image outputs', async () => {
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { inlineData: { mimeType: 'image/png', data: Buffer.from('1').toString('base64') } },
              { inlineData: { mimeType: 'image/png', data: Buffer.from('2').toString('base64') } },
            ],
          },
        },
      ],
    });

    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: {
        prompt: 'two variations',
        output: '/tmp/variant.png',
      },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain('saved to /tmp/variant.png');
    expect(content[0].text).toContain('saved to /tmp/variant_2.png');
  });

  // ── TODO #25: output format + image_size ───────────────────────────────

  /** Real magic bytes: JPEG SOI + SOF0 (896×1200), as the model actually returns. */
  const JPEG_896x1200 = Buffer.from([
    0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x04, 0xb0, 0x03, 0x80, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  function respondWith(bytes: Buffer, mimeType: string): void {
    mockGenerateContent.mockResolvedValue({
      candidates: [{ content: { parts: [{ inlineData: { mimeType, data: bytes.toString('base64') } }] } }],
    });
  }

  it('converts JPEG bytes to PNG when the output is .png, and reports it', async () => {
    respondWith(JPEG_896x1200, 'image/jpeg');
    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: { prompt: 'a bust', output: '/tmp/bust.png' },
    });

    expect(mockMagick).toHaveBeenCalledOnce();
    const args = mockMagick.mock.calls[0][0] as unknown as string[];
    expect(args[0]).toMatch(/\.jpg$/);
    expect(args[1]).toMatch(/^PNG:.*\.png$/);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('saved to /tmp/bust.png (896×1200, converted from JPEG to PNG)');
  });

  it('leaves bytes alone when they already match the extension', async () => {
    respondWith(JPEG_896x1200, 'image/jpeg');
    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: { prompt: 'a bust', output: '/tmp/bust.jpg' },
    });

    expect(mockMagick).not.toHaveBeenCalled();
    expect((result.content as Array<{ text: string }>)[0].text).toContain(
      'saved to /tmp/bust.jpg (896×1200)',
    );
  });

  it('notes an extension it cannot convert to instead of silently mislabeling', async () => {
    respondWith(JPEG_896x1200, 'image/jpeg');
    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: { prompt: 'a bust', output: '/tmp/bust.tiff' },
    });

    expect(mockMagick).not.toHaveBeenCalled();
    expect((result.content as Array<{ text: string }>)[0].text).toContain(
      'JPEG bytes; .tiff is not a format this tool converts to',
    );
  });

  it('passes image_size through to imageConfig alongside aspect_ratio', async () => {
    respondWith(Buffer.from('png'), 'image/png');
    await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: { prompt: 'a bust', output: '/tmp/bust.png', image_size: '2K', aspect_ratio: '3:4' },
    });

    expect(mockGenerateContent.mock.calls[0][0].config.imageConfig).toEqual({
      aspectRatio: '3:4',
      imageSize: '2K',
    });
  });

  it('sends no imageConfig when neither knob is set (unchanged default)', async () => {
    respondWith(Buffer.from('png'), 'image/png');
    await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: { prompt: 'a bust', output: '/tmp/bust.png' },
    });

    expect(mockGenerateContent.mock.calls[0][0].config.imageConfig).toBeUndefined();
  });

  it('rejects an unknown image_size', async () => {
    const result = await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: { prompt: 'a bust', output: '/tmp/bust.png', image_size: '8K' },
    });
    expect(result.isError).toBe(true);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('sends a reference image with the MIME type of its bytes, not its extension', async () => {
    respondWith(Buffer.from('png'), 'image/png');
    // A previous output: JPEG bytes in a .png file.
    vi.mocked(readFile).mockResolvedValueOnce(JPEG_896x1200 as never);
    await client.callTool({
      name: 'gemini_nanobanana_generate_image',
      arguments: { prompt: 'same singer', output: '/tmp/next.png', reference_images: ['/tmp/bust.png'] },
    });

    expect(mockGenerateContent.mock.calls[0][0].contents[0].parts[1].inlineData.mimeType).toBe(
      'image/jpeg',
    );
  });
});

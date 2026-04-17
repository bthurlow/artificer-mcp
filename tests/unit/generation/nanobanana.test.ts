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
    expect(call.model).toBe('gemini-2.5-flash-image');
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
});

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Mock the genai client before any imports that use it.
const mockGenerateImages = vi.fn();
const mockEditImage = vi.fn();
const mockUpscaleImage = vi.fn();
const mockGenerateVideos = vi.fn();
const mockGetVideosOperation = vi.fn();

vi.mock('../../../src/generation/client.js', () => ({
  getGenAIClient: () => ({
    models: {
      generateImages: mockGenerateImages,
      editImage: mockEditImage,
      upscaleImage: mockUpscaleImage,
      generateVideos: mockGenerateVideos,
    },
    operations: {
      getVideosOperation: mockGetVideosOperation,
    },
  }),
}));

// Mock fs operations so tests don't hit the real filesystem.
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return {
    ...actual,
    mkdir: vi.fn(async () => undefined),
    writeFile: vi.fn(async () => undefined),
    readFile: vi.fn(async () => Buffer.from('fake-image-bytes')),
    rm: vi.fn(async () => undefined),
  };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerImageGenTools } from '../../../src/generation/image.js';
import { registerVideoGenTools } from '../../../src/generation/video.js';

describe('Generation Tools', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerImageGenTools(server);
    registerVideoGenTools(server);

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

  // ── gemini_generate_image ──────────────────────────────────────────────

  describe('gemini_generate_image', () => {
    it('calls generateImages with correct params and saves output', async () => {
      mockGenerateImages.mockResolvedValue({
        generatedImages: [
          {
            image: { imageBytes: Buffer.from('test-png').toString('base64'), mimeType: 'image/png' },
          },
        ],
      });

      const result = await client.callTool({
        name: 'gemini_generate_image',
        arguments: {
          prompt: 'a cat on a beach',
          output: '/tmp/cat.png',
        },
      });

      expect(mockGenerateImages).toHaveBeenCalledOnce();
      const call = mockGenerateImages.mock.calls[0][0];
      expect(call.model).toBe('imagen-4.0-generate-001');
      expect(call.prompt).toBe('a cat on a beach');
      expect(call.config.numberOfImages).toBe(1);
      expect(call.config.aspectRatio).toBe('1:1');

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('saved to /tmp/cat.png');
    });

    it('reports safety filter blocks without error', async () => {
      mockGenerateImages.mockResolvedValue({
        generatedImages: [
          { raiFilteredReason: 'content policy violation' },
        ],
      });

      const result = await client.callTool({
        name: 'gemini_generate_image',
        arguments: {
          prompt: 'blocked content',
          output: '/tmp/out.png',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('safety filter');
      expect(content[0].text).toContain('No images were generated');
    });
  });

  // ── gemini_edit_image ──────────────────────────────────────────────────

  describe('gemini_edit_image', () => {
    it('calls editImage with reference images', async () => {
      mockEditImage.mockResolvedValue({
        generatedImages: [
          {
            image: { imageBytes: Buffer.from('edited').toString('base64'), mimeType: 'image/png' },
          },
        ],
      });

      const result = await client.callTool({
        name: 'gemini_edit_image',
        arguments: {
          prompt: 'remove the background',
          image: '/tmp/input.png',
          output: '/tmp/edited.png',
          edit_mode: 'EDIT_MODE_BGSWAP',
        },
      });

      expect(mockEditImage).toHaveBeenCalledOnce();
      const call = mockEditImage.mock.calls[0][0];
      expect(call.prompt).toBe('remove the background');
      expect(call.referenceImages).toHaveLength(1);
      expect(call.config.editMode).toBe('EDIT_MODE_BGSWAP');

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('saved to /tmp/edited.png');
    });
  });

  // ── gemini_upscale_image ───────────────────────────────────────────────

  describe('gemini_upscale_image', () => {
    it('calls upscaleImage with correct factor', async () => {
      mockUpscaleImage.mockResolvedValue({
        generatedImages: [
          {
            image: { imageBytes: Buffer.from('upscaled').toString('base64'), mimeType: 'image/png' },
          },
        ],
      });

      const result = await client.callTool({
        name: 'gemini_upscale_image',
        arguments: {
          image: '/tmp/small.png',
          output: '/tmp/big.png',
          upscale_factor: 'x4',
        },
      });

      expect(mockUpscaleImage).toHaveBeenCalledOnce();
      const call = mockUpscaleImage.mock.calls[0][0];
      expect(call.upscaleFactor).toBe('x4');

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('saved to /tmp/big.png');
    });
  });

  // ── gemini_generate_video ──────────────────────────────────────────────

  describe('gemini_generate_video', () => {
    it('polls until done and saves video bytes', async () => {
      mockGenerateVideos.mockResolvedValue({
        done: false,
        name: 'operations/123',
      });
      mockGetVideosOperation.mockResolvedValue({
        done: true,
        response: {
          generatedVideos: [
            { video: { videoBytes: Buffer.from('fake-video').toString('base64'), mimeType: 'video/mp4' } },
          ],
        },
      });

      const result = await client.callTool({
        name: 'gemini_generate_video',
        arguments: {
          prompt: 'a sunset timelapse',
          output: '/tmp/video.mp4',
          poll_interval_seconds: 0.01,
          poll_timeout_seconds: 5,
        },
      });

      expect(mockGenerateVideos).toHaveBeenCalledOnce();
      expect(mockGetVideosOperation).toHaveBeenCalled();

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('saved to /tmp/video.mp4');
    });

    it('downloads video from URI when videoBytes not present', async () => {
      // Mock global fetch for URI download. Response needs `.headers.get()`
      // because the shared downloadAndWrite helper checks Content-Type.
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: (key: string) => (key.toLowerCase() === 'content-type' ? 'video/mp4' : null) },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });
      vi.stubGlobal('fetch', mockFetch);

      mockGenerateVideos.mockResolvedValue({
        done: true,
        response: {
          generatedVideos: [
            { video: { uri: 'https://storage.googleapis.com/video.mp4', mimeType: 'video/mp4' } },
          ],
        },
      });

      const result = await client.callTool({
        name: 'gemini_generate_video',
        arguments: {
          prompt: 'test',
          output: '/tmp/video.mp4',
        },
      });

      // When no auth headers are needed (non-Gemini-Files URL), the helper
      // calls fetch without options rather than with an empty headers object.
      expect(mockFetch).toHaveBeenCalledWith(
        'https://storage.googleapis.com/video.mp4',
        undefined,
      );
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('downloaded from');

      vi.unstubAllGlobals();
    });

    it('sends x-goog-api-key header when downloading from Gemini Files API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: (key: string) => (key.toLowerCase() === 'content-type' ? 'video/mp4' : null) },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });
      vi.stubGlobal('fetch', mockFetch);
      const prevKey = process.env.GOOGLE_API_KEY;
      process.env.GOOGLE_API_KEY = 'test-api-key-xyz';

      mockGenerateVideos.mockResolvedValue({
        done: true,
        response: {
          generatedVideos: [
            {
              video: {
                uri: 'https://generativelanguage.googleapis.com/v1beta/files/abc:download?alt=media',
                mimeType: 'video/mp4',
              },
            },
          ],
        },
      });

      await client.callTool({
        name: 'gemini_generate_video',
        arguments: { prompt: 'test', output: '/tmp/video.mp4' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/files/abc:download?alt=media',
        { headers: { 'x-goog-api-key': 'test-api-key-xyz' } },
      );

      process.env.GOOGLE_API_KEY = prevKey;
      vi.unstubAllGlobals();
    });

    it('handles video with no data (no bytes, no uri)', async () => {
      mockGenerateVideos.mockResolvedValue({
        done: true,
        response: {
          generatedVideos: [{ video: {} }],
        },
      });

      const result = await client.callTool({
        name: 'gemini_generate_video',
        arguments: {
          prompt: 'test',
          output: '/tmp/video.mp4',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('no video data');
    });

    it('throws on operation error', async () => {
      mockGenerateVideos.mockResolvedValue({
        done: true,
        error: { code: 400, message: 'bad request' },
      });

      const result = await client.callTool({
        name: 'gemini_generate_video',
        arguments: {
          prompt: 'test',
          output: '/tmp/video.mp4',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const text = content.map((c) => c.text).join(' ');
      const isError = result.isError === true || /failed/i.test(text);
      expect(isError).toBe(true);
    });

    it('reports filtered videos without error', async () => {
      mockGenerateVideos.mockResolvedValue({
        done: true,
        response: {
          generatedVideos: [],
          raiMediaFilteredReasons: ['safety policy'],
        },
      });

      const result = await client.callTool({
        name: 'gemini_generate_video',
        arguments: {
          prompt: 'blocked',
          output: '/tmp/video.mp4',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain('Filtered');
      expect(content[0].text).toContain('safety policy');
    });
  });
});

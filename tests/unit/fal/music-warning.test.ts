import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Deliberately a separate file from music.test.ts, which mocks
// node:fs/promises wholesale. The point here is the OPPOSITE: let the
// real fal-input-keys.json load off disk so the warning is exercised
// against the actually-committed data, end to end through the tool.

const mockSubscribe = vi.fn();

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({
    subscribe: mockSubscribe,
    storage: { upload: vi.fn() },
  }),
}));

const mockProviderWrite = vi.fn();
vi.mock('../../../src/storage/providers/registry.js', async () => {
  const actual =
    await vi.importActual<typeof import('../../../src/storage/providers/registry.js')>(
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

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { registerFalMusicTools } from '../../../src/generation/fal/music.js';
import { __resetFalInputKeysCacheForTests } from '../../../src/catalog/fal-input-keys.js';

const MINIMAX = 'fal-ai/minimax-music/v2.6';

describe('fal_generate_music — warns against the real committed key map', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerFalMusicTools(server);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [c, s] = InMemoryTransport.createLinkedPair();
    await server.connect(s);
    await client.connect(c);
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
    __resetFalInputKeysCacheForTests();
    mockSubscribe.mockResolvedValue({ data: { audio: { url: 'https://x/a.mp3' } } });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? 'audio/mpeg' : null) },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(64)),
      }),
    );
  });

  async function callWith(extra_params: Record<string, unknown>): Promise<string[]> {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await client.callTool({
        name: 'fal_generate_music',
        arguments: { model: MINIMAX, prompt: 'city pop', output: '/tmp/s.mp3', extra_params },
      });
      return spy.mock.calls.map((c) => String(c[0]));
    } finally {
      spy.mockRestore();
    }
  }

  it('warns on the audio_format case that motivated this, naming the nested knob', async () => {
    const errors = await callWith({ audio_format: 'wav' });
    const warning = errors.find((e) => e.includes('audio_format'));
    expect(warning).toBeDefined();
    expect(warning).toContain('silently ignore');
    expect(warning).toContain('audio_setting.format');
  });

  it('says nothing when the caller already uses the correct nested shape', async () => {
    const errors = await callWith({ audio_setting: { format: 'wav', sample_rate: 44100 } });
    expect(errors.filter((e) => e.includes('silently ignore'))).toEqual([]);
  });

  it('sends the payload through unmodified — the warning never rewrites it', async () => {
    await callWith({ audio_format: 'wav' });
    const input = mockSubscribe.mock.calls[0][1].input;
    expect(input.audio_format).toBe('wav');
    expect(input.audio_setting).toBeUndefined();
  });
});

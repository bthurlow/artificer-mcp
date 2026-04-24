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
  registerFalSpeechTools,
  buildSpeechInput,
  extractSpeechOutput,
} from '../../../src/generation/fal/speech.js';

function stubFetch(contentType = 'audio/mpeg') {
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

describe('buildSpeechInput', () => {
  it('maps structural args to fal input keys', () => {
    const { input, collisions } = buildSpeechInput(
      { text: 'Hi', voice: 'Rachel', audioUrl: 'https://ref' },
      undefined,
    );
    expect(input).toEqual({ text: 'Hi', voice: 'Rachel', audio_url: 'https://ref' });
    expect(collisions).toEqual([]);
  });

  it('spreads extra_params alongside structural args', () => {
    const { input } = buildSpeechInput(
      { text: 'Hi' },
      { stability: 0.7, similarity_boost: 0.9 },
    );
    expect(input).toMatchObject({
      text: 'Hi',
      stability: 0.7,
      similarity_boost: 0.9,
    });
  });

  it('structural args win over extra_params on collision', () => {
    const { input, collisions } = buildSpeechInput(
      { text: 'structural', voice: 'Rachel' },
      { text: 'via extra', voice: 'Brian', stability: 0.5 },
    );
    expect(input.text).toBe('structural');
    expect(input.voice).toBe('Rachel');
    expect(input.stability).toBe(0.5);
    expect(collisions.sort()).toEqual(['text', 'voice']);
  });
});

describe('extractSpeechOutput', () => {
  it('extracts audio url on a TTS response', () => {
    expect(
      extractSpeechOutput({ audio: { url: 'https://v3.fal.media/out.mp3' } }),
    ).toEqual({
      audioUrl: 'https://v3.fal.media/out.mp3',
      customVoiceId: undefined,
      raw: { audio: { url: 'https://v3.fal.media/out.mp3' } },
    });
  });

  it('extracts voice_id + optional audio on a voice-clone response', () => {
    const data = {
      custom_voice_id: 'abc-123',
      audio: { url: 'https://v3.fal.media/preview.mp3' },
    };
    const r = extractSpeechOutput(data);
    expect(r.customVoiceId).toBe('abc-123');
    expect(r.audioUrl).toBe('https://v3.fal.media/preview.mp3');
  });

  it('extracts voice_id only when audio is omitted', () => {
    const r = extractSpeechOutput({ custom_voice_id: 'xyz-999' });
    expect(r.customVoiceId).toBe('xyz-999');
    expect(r.audioUrl).toBeUndefined();
  });

  it('throws when neither audio nor voice_id is present', () => {
    expect(() => extractSpeechOutput({})).toThrow(/unrecognized output shape/);
    expect(() => extractSpeechOutput({ audio: {} })).toThrow(
      /unrecognized output shape/,
    );
  });

  it('throws on non-object input', () => {
    expect(() => extractSpeechOutput(null)).toThrow(/non-object/);
    expect(() => extractSpeechOutput('boom')).toThrow(/non-object/);
  });
});

describe('fal_generate_speech (MCP)', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerFalSpeechTools(server);
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

  it('TTS path: writes audio output and returns JSON with no voice_id', async () => {
    mockSubscribe.mockResolvedValue({
      data: { audio: { url: 'https://v3.fal.media/out.mp3' } },
      requestId: 'req-1',
    });
    stubFetch('audio/mpeg');

    const result = await client.callTool({
      name: 'fal_generate_speech',
      arguments: {
        model: 'fal-ai/elevenlabs/tts/turbo-v2.5',
        text: 'Hello world',
        voice: 'Rachel',
        output: '/tmp/out.mp3',
      },
    });

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    const [modelArg, opts] = mockSubscribe.mock.calls[0];
    expect(modelArg).toBe('fal-ai/elevenlabs/tts/turbo-v2.5');
    expect(opts.input).toEqual({ text: 'Hello world', voice: 'Rachel' });

    const text = (result.content as Array<{ text: string }>)[0].text;
    const payload = JSON.parse(text);
    expect(payload.model).toBe('fal-ai/elevenlabs/tts/turbo-v2.5');
    expect(payload.audio.uri).toBe('/tmp/out.mp3');
    expect(payload.audio.mime).toBe('audio/mpeg');
    expect(payload.custom_voice_id).toBeNull();
  });

  it('voice-clone path: uploads reference audio via gs:// path, returns voice_id + optional audio', async () => {
    mockUpload.mockResolvedValue('https://v3.fal.media/uploaded.wav');
    mockSubscribe.mockResolvedValue({
      data: {
        custom_voice_id: 'clone-abc',
        audio: { url: 'https://v3.fal.media/preview.mp3' },
      },
      requestId: 'req-2',
    });
    stubFetch('audio/mpeg');

    const result = await client.callTool({
      name: 'fal_generate_speech',
      arguments: {
        model: 'fal-ai/minimax/voice-clone',
        reference_audio: 'gs://bucket/sample.wav',
        output: '/tmp/preview.mp3',
      },
    });

    expect(mockUpload).toHaveBeenCalledTimes(1);
    const [blob] = mockUpload.mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(mockSubscribe.mock.calls[0][1].input.audio_url).toBe(
      'https://v3.fal.media/uploaded.wav',
    );

    const payload = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text,
    );
    expect(payload.custom_voice_id).toBe('clone-abc');
    expect(payload.audio.uri).toBe('/tmp/preview.mp3');
  });

  it('HTTPS reference audio passes through without upload', async () => {
    mockSubscribe.mockResolvedValue({
      data: { custom_voice_id: 'v-999' },
      requestId: 'req-3',
    });

    await client.callTool({
      name: 'fal_generate_speech',
      arguments: {
        model: 'fal-ai/minimax/voice-clone',
        reference_audio: 'https://storage.googleapis.com/b/sample.wav',
        output: '/tmp/unused.mp3',
      },
    });

    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockSubscribe.mock.calls[0][1].input.audio_url).toBe(
      'https://storage.googleapis.com/b/sample.wav',
    );
  });

  it('voice-clone with voice_id only + no audio: returns without writing output', async () => {
    mockSubscribe.mockResolvedValue({
      data: { custom_voice_id: 'v-no-preview' },
      requestId: 'req-4',
    });
    const fetchSpy = stubFetch();

    const result = await client.callTool({
      name: 'fal_generate_speech',
      arguments: {
        model: 'fal-ai/minimax/voice-clone',
        reference_audio: 'https://x/s.wav',
        output: '/tmp/unused.mp3',
      },
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    const payload = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text,
    );
    expect(payload.audio).toBeNull();
    expect(payload.custom_voice_id).toBe('v-no-preview');
  });

  it('spreads extra_params (stability, similarity_boost) into fal input', async () => {
    mockSubscribe.mockResolvedValue({
      data: { audio: { url: 'https://v3.fal.media/x.mp3' } },
      requestId: 'req-5',
    });
    stubFetch();

    await client.callTool({
      name: 'fal_generate_speech',
      arguments: {
        model: 'fal-ai/elevenlabs/tts/turbo-v2.5',
        text: 'Hi',
        output: '/tmp/x.mp3',
        extra_params: { stability: 0.7, similarity_boost: 0.9, language_code: 'en' },
      },
    });

    const input = mockSubscribe.mock.calls[0][1].input;
    expect(input.stability).toBe(0.7);
    expect(input.similarity_boost).toBe(0.9);
    expect(input.language_code).toBe('en');
  });

  it('requires model — no server-side default', async () => {
    const result = await client.callTool({
      name: 'fal_generate_speech',
      arguments: { output: '/tmp/x.mp3' },
    });
    expect(result.isError).toBe(true);
  });

  it('surfaces fal 422 as rich error via parseFalError', async () => {
    mockSubscribe.mockRejectedValue(
      Object.assign(new Error('HTTP 422'), {
        status: 422,
        body: {
          detail: [
            {
              loc: ['body', 'text'],
              msg: 'Field required',
              type: 'missing',
            },
          ],
        },
        requestId: 'req-fail',
      }),
    );

    const result = await client.callTool({
      name: 'fal_generate_speech',
      arguments: {
        model: 'fal-ai/elevenlabs/tts/turbo-v2.5',
        output: '/tmp/out.mp3',
      },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('FalValidationError');
    expect(text).toContain('req-fail');
  });
});

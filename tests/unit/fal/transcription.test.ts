import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

const mockSubscribe = vi.fn();
const mockUpload = vi.fn();

vi.mock('../../../src/generation/fal/client.js', () => ({
  getFalClient: () => ({
    subscribe: mockSubscribe,
    storage: { upload: mockUpload },
  }),
}));

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
    await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return { ...actual, readFile: vi.fn(async () => Buffer.from('fake-bytes')) };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  registerFalTranscriptionTools,
  buildTranscriptionInput,
  normalizeTranscriptionResponse,
} from '../../../src/generation/fal/transcription.js';

describe('buildTranscriptionInput', () => {
  it('always sets audio_url as the structural arg', () => {
    const { input, collisions } = buildTranscriptionInput('https://x/a.mp3', undefined);
    expect(input).toEqual({ audio_url: 'https://x/a.mp3' });
    expect(collisions).toEqual([]);
  });

  it('spreads extra_params alongside audio_url', () => {
    const { input } = buildTranscriptionInput('https://x/a.mp3', {
      language_code: 'en',
      diarize: true,
    });
    expect(input).toMatchObject({
      audio_url: 'https://x/a.mp3',
      language_code: 'en',
      diarize: true,
    });
  });

  it('audio_url wins on collision with extra_params', () => {
    const { input, collisions } = buildTranscriptionInput('https://structural', {
      audio_url: 'https://from-extra',
      keyterms: ['baker'],
    });
    expect(input.audio_url).toBe('https://structural');
    expect(input.keyterms).toEqual(['baker']);
    expect(collisions).toEqual(['audio_url']);
  });
});

describe('normalizeTranscriptionResponse', () => {
  it('scribe shape: populates words[] with type discriminator + speaker_id', () => {
    const raw = {
      text: 'Hello world.',
      language_code: 'en',
      language_probability: 0.99,
      words: [
        { type: 'word', text: 'Hello', start: 0.1, end: 0.4, speaker_id: 'S1' },
        { type: 'spacing', text: ' ', start: 0.4, end: 0.45, speaker_id: 'S1' },
        { type: 'word', text: 'world', start: 0.45, end: 0.8, speaker_id: 'S1' },
      ],
    };
    const r = normalizeTranscriptionResponse(raw);
    expect(r.text).toBe('Hello world.');
    expect(r.language).toBe('en');
    expect(r.words).toHaveLength(3);
    expect(r.words[0]).toEqual({
      text: 'Hello',
      type: 'word',
      start: 0.1,
      end: 0.4,
      speaker_id: 'S1',
    });
    expect(r.words[1].type).toBe('spacing');
    expect(r.segments).toEqual([]);
  });

  it('scribe shape: unknown type values fall back to "word"', () => {
    const raw = { words: [{ type: 'something_new', text: 'x', start: 0, end: 1 }] };
    const r = normalizeTranscriptionResponse(raw);
    expect(r.words[0].type).toBe('word');
  });

  it('whisper shape: populates segments[] from chunks[]', () => {
    const raw = {
      text: 'Hello world.',
      inferred_languages: ['en'],
      chunks: [
        { timestamp: [0.0, 1.2], text: 'Hello world.' },
        { timestamp: [1.5, 2.0], text: 'Goodbye.' },
      ],
    };
    const r = normalizeTranscriptionResponse(raw);
    expect(r.text).toBe('Hello world.');
    expect(r.language).toBe('en');
    expect(r.words).toEqual([]);
    expect(r.segments).toHaveLength(2);
    expect(r.segments[0]).toEqual({ text: 'Hello world.', start: 0.0, end: 1.2, speaker: null });
  });

  it('wizper shape: populates segments[] using languages[] (not inferred_languages)', () => {
    const raw = {
      text: 'Bonjour.',
      languages: ['fr'],
      chunks: [{ timestamp: [0, 0.7], text: 'Bonjour.' }],
    };
    const r = normalizeTranscriptionResponse(raw);
    expect(r.language).toBe('fr');
    expect(r.segments[0].start).toBe(0);
    expect(r.segments[0].end).toBe(0.7);
  });

  it('whisper chunk with null timestamp tuple: surfaces null start/end', () => {
    const raw = { chunks: [{ timestamp: [null, null], text: '...' }], text: '...' };
    const r = normalizeTranscriptionResponse(raw);
    expect(r.segments[0].start).toBeNull();
    expect(r.segments[0].end).toBeNull();
  });

  it('fal-speech-to-text shape: text from `output` field, no timing', () => {
    const r = normalizeTranscriptionResponse({ output: 'transcript text', partial: false });
    expect(r.text).toBe('transcript text');
    expect(r.language).toBeNull();
    expect(r.words).toEqual([]);
    expect(r.segments).toEqual([]);
  });

  it('cohere shape: text only, no word/segment timing', () => {
    const r = normalizeTranscriptionResponse({
      text: 'Cohere transcript.',
      timings: { audio: 0.5, transcribe: 0.2 },
    });
    expect(r.text).toBe('Cohere transcript.');
    expect(r.words).toEqual([]);
    expect(r.segments).toEqual([]);
  });

  it('preserves the raw payload pass-through on every shape', () => {
    const raw = { weird: 'shape', text: 'fallback' };
    const r = normalizeTranscriptionResponse(raw);
    expect(r.raw).toBe(raw);
  });

  it('handles non-object input safely', () => {
    expect(normalizeTranscriptionResponse(null)).toEqual({
      text: '',
      language: null,
      words: [],
      segments: [],
      raw: null,
    });
  });
});

describe('fal_transcribe (MCP)', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerFalTranscriptionTools(server);
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
  });

  it('scribe path: returns normalized JSON with words[] and language', async () => {
    mockSubscribe.mockResolvedValue({
      data: {
        text: 'Hi.',
        language_code: 'en',
        words: [{ type: 'word', text: 'Hi', start: 0, end: 0.3 }],
      },
      requestId: 'req-1',
    });

    const result = await client.callTool({
      name: 'fal_transcribe',
      arguments: {
        model: 'fal-ai/elevenlabs/speech-to-text/scribe-v2',
        audio: 'https://example.com/a.mp3',
      },
    });

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    const [modelArg, opts] = mockSubscribe.mock.calls[0];
    expect(modelArg).toBe('fal-ai/elevenlabs/speech-to-text/scribe-v2');
    expect(opts.input.audio_url).toBe('https://example.com/a.mp3');

    const payload = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(payload.model).toBe('fal-ai/elevenlabs/speech-to-text/scribe-v2');
    expect(payload.text).toBe('Hi.');
    expect(payload.language).toBe('en');
    expect(payload.words).toHaveLength(1);
    expect(payload.segments).toEqual([]);
  });

  it('uploads non-HTTPS audio via fal storage', async () => {
    mockUpload.mockResolvedValue('https://v3.fal.media/uploaded.mp3');
    mockSubscribe.mockResolvedValue({ data: { text: 'x' }, requestId: 'req-2' });

    await client.callTool({
      name: 'fal_transcribe',
      arguments: {
        model: 'fal-ai/whisper',
        audio: 'gs://bucket/clip.mp3',
      },
    });

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockSubscribe.mock.calls[0][1].input.audio_url).toBe(
      'https://v3.fal.media/uploaded.mp3',
    );
  });

  it('HTTPS audio passes through without upload', async () => {
    mockSubscribe.mockResolvedValue({ data: { text: 'x' }, requestId: 'req-3' });

    await client.callTool({
      name: 'fal_transcribe',
      arguments: {
        model: 'fal-ai/whisper',
        audio: 'https://example.com/a.mp3',
      },
    });

    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockSubscribe.mock.calls[0][1].input.audio_url).toBe(
      'https://example.com/a.mp3',
    );
  });

  it('spreads extra_params (language, diarize, keyterms) into fal input', async () => {
    mockSubscribe.mockResolvedValue({ data: { text: 'x' }, requestId: 'req-4' });

    await client.callTool({
      name: 'fal_transcribe',
      arguments: {
        model: 'fal-ai/elevenlabs/speech-to-text/scribe-v2',
        audio: 'https://x/a.mp3',
        extra_params: {
          language_code: 'en',
          diarize: true,
          keyterms: ['Bakers Assistant'],
        },
      },
    });

    const input = mockSubscribe.mock.calls[0][1].input;
    expect(input.language_code).toBe('en');
    expect(input.diarize).toBe(true);
    expect(input.keyterms).toEqual(['Bakers Assistant']);
  });

  it('requires model — no server-side default', async () => {
    const result = await client.callTool({
      name: 'fal_transcribe',
      arguments: { audio: 'https://x/a.mp3' },
    });
    expect(result.isError).toBe(true);
  });

  it('whisper path: returns normalized JSON with segments[] from chunks[]', async () => {
    mockSubscribe.mockResolvedValue({
      data: {
        text: 'Hello.',
        inferred_languages: ['en'],
        chunks: [{ timestamp: [0.0, 0.6], text: 'Hello.' }],
      },
      requestId: 'req-5',
    });

    const result = await client.callTool({
      name: 'fal_transcribe',
      arguments: {
        model: 'fal-ai/whisper',
        audio: 'https://x/a.mp3',
      },
    });

    const payload = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(payload.words).toEqual([]);
    expect(payload.segments).toHaveLength(1);
    expect(payload.segments[0]).toEqual({ text: 'Hello.', start: 0.0, end: 0.6, speaker: null });
  });

  it('text-only model (cohere): empty words/segments, raw preserved', async () => {
    mockSubscribe.mockResolvedValue({
      data: { text: 'plain', timings: { audio: 0.1 } },
      requestId: 'req-6',
    });

    const result = await client.callTool({
      name: 'fal_transcribe',
      arguments: { model: 'fal-ai/cohere-transcribe', audio: 'https://x/a.mp3' },
    });

    const payload = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(payload.text).toBe('plain');
    expect(payload.words).toEqual([]);
    expect(payload.segments).toEqual([]);
    expect(payload.raw.timings).toBeDefined();
  });

  it('surfaces fal 422 as rich error via parseFalError', async () => {
    mockSubscribe.mockRejectedValue(
      Object.assign(new Error('HTTP 422'), {
        status: 422,
        body: {
          detail: [
            { loc: ['body', 'audio_url'], msg: 'Field required', type: 'missing' },
          ],
        },
        requestId: 'req-fail',
      }),
    );

    const result = await client.callTool({
      name: 'fal_transcribe',
      arguments: { model: 'fal-ai/whisper', audio: 'https://x/a.mp3' },
    });

    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toContain('FalValidationError');
    expect(text).toContain('req-fail');
  });
});

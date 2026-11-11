import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

const mockGenerateContent = vi.fn();
const mockInteractionsCreate = vi.fn();
const mockInteractionsGet = vi.fn();

vi.mock('../../../src/generation/client.js', () => ({
  getGenAIClient: () => ({
    models: { generateContent: mockGenerateContent },
    interactions: { create: mockInteractionsCreate, get: mockInteractionsGet },
  }),
}));

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  audioToPcm,
  buildTtsInteraction,
  extractInteractionAudio,
  registerSpeechGenTools,
  usesInteractions,
} from '../../../src/generation/speech.js';

/** 0.5 s of 24 kHz mono 16-bit PCM. */
const PCM = Buffer.alloc(24000, 1);
const b64 = (b: Buffer): string => b.toString('base64');

function wav(pcm: Buffer, rate: number): Buffer {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

describe('Gemini 3.8 TTS helpers', () => {
  it('routes only the 3.8 models through Interactions', () => {
    expect(usesInteractions('gemini-3.8-flash-tts')).toBe(true);
    expect(usesInteractions('models/gemini-3.8-flash-lite-tts')).toBe(true);
    expect(usesInteractions('gemini-2.5-pro-preview-tts')).toBe(false);
    expect(usesInteractions('gemini-3.1-flash-tts-preview')).toBe(false);
  });

  it('keeps the text verbatim, with style as speech_metadata and raw PCM requested', () => {
    expect(
      buildTtsInteraction({
        model: 'gemini-3.8-flash-tts',
        text: 'Hello baker',
        voice: 'Kore',
        style: 'warm',
        language: 'en-US',
      }),
    ).toEqual({
      model: 'gemini-3.8-flash-tts',
      input: [
        {
          type: 'user_input',
          content: [
            {
              type: 'text',
              text: 'Hello baker',
              annotations: [{ type: 'speech_metadata', style: 'warm' }],
            },
          ],
        },
      ],
      response_format: { type: 'audio', mime_type: 'audio/l16', sample_rate: 24000 },
      generation_config: { speech_config: [{ voice: 'Kore', language: 'en-US' }] },
    });
    const plain = buildTtsInteraction({ model: 'm', text: 't', voice: 'Puck' });
    expect((plain.input as Array<{ content: object[] }>)[0].content[0]).toEqual({
      type: 'text',
      text: 't',
    });
    expect(plain.generation_config).toEqual({ speech_config: [{ voice: 'Puck' }] });
  });

  it('finds the audio in output_audio or the last audio block of the steps', () => {
    expect(
      extractInteractionAudio({ output_audio: { data: 'AA', mime_type: 'audio/l16' } }),
    ).toEqual({
      data: 'AA',
      mimeType: 'audio/l16',
    });
    expect(
      extractInteractionAudio({
        steps: [
          { type: 'model_output', content: [{ type: 'text' }, { type: 'audio', data: 'B1' }] },
          {
            type: 'model_output',
            content: [{ type: 'audio', data: 'B2', mime_type: 'audio/wav' }],
          },
        ],
      }),
    ).toEqual({ data: 'B2', mimeType: 'audio/wav' });
    expect(extractInteractionAudio({ steps: [] })).toBeUndefined();
  });

  it('takes raw L16 as is, and unwraps a WAV if one comes back anyway', () => {
    expect(audioToPcm({ data: b64(PCM), mimeType: 'audio/l16;rate=24000' })).toMatchObject({
      sampleRate: 24000,
      channels: 1,
    });
    const fromWav = audioToPcm({ data: b64(wav(PCM, 16000)), mimeType: 'audio/wav' });
    expect(fromWav.sampleRate).toBe(16000);
    expect(fromWav.pcm.equals(PCM)).toBe(true);
  });
});

describe('gemini_generate_speech', () => {
  let server: McpServer;
  let client: Client;
  let dir: string;

  beforeAll(async () => {
    delete process.env['ARTIFICER_BRAND_SPEC'];
    delete process.env['ARTIFICER_TTS_MODEL'];
    dir = await mkdtemp(join(tmpdir(), 'tts-'));
    server = new McpServer({ name: 'test', version: '0' });
    registerSpeechGenTools(server);
    client = new Client({ name: 'test-client', version: '0' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(b);
    await client.connect(a);
  });
  afterAll(async () => {
    await client.close();
    await server.close();
    await rm(dir, { recursive: true, force: true });
  });
  beforeEach(() => vi.clearAllMocks());

  const call = async (args: Record<string, unknown>): Promise<string> => {
    const r = (await client.callTool({ name: 'gemini_generate_speech', arguments: args })) as {
      content: Array<{ text: string }>;
    };
    return r.content[0].text;
  };

  it('defaults to gemini-3.8-flash-tts through Interactions and writes a 24 kHz WAV', async () => {
    mockInteractionsCreate.mockResolvedValue({
      id: 'i1',
      status: 'completed',
      output_audio: { data: b64(PCM), mime_type: 'audio/l16' },
    });
    const out = join(dir, 'hello.wav');
    const text = await call({ text: 'Hello baker', output: out, style: 'warm' });
    expect(text).toBe(`Generated speech (Kore, 24000Hz, 1ch, 0.5s) → ${out}`);
    expect(mockGenerateContent).not.toHaveBeenCalled();
    const req = mockInteractionsCreate.mock.calls[0][0] as { model: string; input: unknown };
    expect(req.model).toBe('gemini-3.8-flash-tts');
    // The style is metadata, not spoken text.
    expect(JSON.stringify(req.input)).toContain('"text":"Hello baker"');
    const bytes = await readFile(out);
    expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
    expect(bytes.readUInt32LE(24)).toBe(24000);
    expect(bytes.subarray(44).equals(PCM)).toBe(true);
  });

  it('reports a failed interaction with its errors', async () => {
    mockInteractionsCreate.mockResolvedValue({
      id: 'i2',
      status: 'failed',
      errors: [{ message: 'voice not found' }],
    });
    expect(await call({ text: 'x', output: join(dir, 'x.wav'), voice: 'Nobody' })).toBe(
      'Speech generation failed — interaction failed: voice not found.',
    );
  });

  it('keeps the preview models on generateContent, with the style prefixed', async () => {
    mockGenerateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [{ inlineData: { data: b64(PCM), mimeType: 'audio/L16;codec=pcm;rate=24000' } }],
          },
        },
      ],
    });
    await call({
      model: 'gemini-2.5-pro-preview-tts',
      text: 'Hello',
      output: join(dir, 'p.wav'),
      style: 'warm',
    });
    expect(mockInteractionsCreate).not.toHaveBeenCalled();
    const req = mockGenerateContent.mock.calls[0][0] as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };
    expect(req.contents[0].parts[0].text).toBe('warm: Hello');
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  alignLines,
  lowConfidenceWords,
  lrcTime,
  normalizeToken,
  parseAlignerWords,
  splitLines,
  srtTime,
  toLrc,
  toSrt,
  type AlignedWord,
} from '../../../src/generation/fal/align.js';

/** Aligner-style words, one per token, 0.5s each starting at `t0`. */
function words(tokens: string[], t0 = 0): AlignedWord[] {
  return tokens.map((text, i) => ({ text, start: t0 + i * 0.5, end: t0 + i * 0.5 + 0.4, loss: 0.1 }));
}

describe('normalizeToken / splitLines', () => {
  it('ignores case, punctuation and apostrophes', () => {
    expect(normalizeToken("Don't,")).toBe('dont');
    expect(normalizeToken('—')).toBe('');
    expect(normalizeToken('Café')).toBe('cafe');
  });

  it('keeps non-empty trimmed lines', () => {
    expect(splitLines('  first line \n\n second\r\n')).toEqual(['first line', 'second']);
  });
});

describe('parseAlignerWords', () => {
  it('reads words and overall loss, dropping malformed entries', () => {
    const r = parseAlignerWords({
      loss: 0.2,
      words: [{ text: 'hi', start: 0, end: 0.3, loss: 0.1 }, { text: 'x' }, null],
      characters: [],
    });
    expect(r.loss).toBe(0.2);
    expect(r.words).toEqual([{ text: 'hi', start: 0, end: 0.3, loss: 0.1 }]);
  });

  it('rejects results without a words array', () => {
    expect(() => parseAlignerWords({ text: 'x' })).toThrow(/no `words` array/);
    expect(() => parseAlignerWords(3)).toThrow(/non-object/);
  });
});

describe('alignLines', () => {
  it('gives each script line the span of its words', () => {
    const lines = alignLines('Hello there\nGeneral Kenobi', words(['Hello', 'there', 'General', 'Kenobi']));
    expect(lines).toEqual([
      { text: 'Hello there', start: 0, end: 0.9, matched_words: 2, total_words: 2, interpolated: false },
      { text: 'General Kenobi', start: 1, end: 1.9, matched_words: 2, total_words: 2, interpolated: false },
    ]);
  });

  it('skips punctuation tokens and joins a split contraction', () => {
    const w = words(['I', 'don', "'t", 'know', ',', 'friend']);
    const [line] = alignLines("I don't know, friend", w);
    expect(line.matched_words).toBe(4);
    expect(line.start).toBe(0);
    expect(line.end).toBeCloseTo(w[5].end);
  });

  it('never lets a short token claim a longer word by prefix', () => {
    // Script "and" must not match the aligner's "a".
    const [line] = alignLines('and', words(['a']));
    expect(line.matched_words).toBe(0);
    expect(line.interpolated).toBe(true);
  });

  it('interpolates a line the aligner did not time from its neighbours', () => {
    const w = [...words(['one', 'two'], 0), ...words(['five', 'six'], 10)];
    const lines = alignLines('one two\nthree four\nfive six', w);
    expect(lines[1]).toMatchObject({ interpolated: true, matched_words: 0, start: 0.9, end: 10 });
    expect(lines[2].start).toBe(10);
  });
});

describe('lowConfidenceWords', () => {
  it('flags words whose loss stands far above the clip’s own spread', () => {
    const w: AlignedWord[] = Array.from({ length: 10 }, (_, i) => ({
      text: `w${i}`,
      start: i,
      end: i + 0.5,
      loss: 0.1 + (i % 2) * 0.01,
    }));
    w.push({ text: 'mumbled', start: 10, end: 10.5, loss: 2 });
    expect(lowConfidenceWords(w).map((x) => x.text)).toEqual(['mumbled']);
  });

  it('says nothing with too few scored words or no spread', () => {
    expect(lowConfidenceWords(words(['a', 'b', 'c']))).toEqual([]);
    expect(lowConfidenceWords(words(['a', 'b', 'c', 'd', 'e', 'f']))).toEqual([]);
  });
});

describe('LRC / SRT', () => {
  it('formats timestamps', () => {
    expect(lrcTime(0)).toBe('[00:00.00]');
    expect(lrcTime(83.456)).toBe('[01:23.46]');
    expect(srtTime(3723.0045)).toBe('01:02:03,005');
  });

  it('renders one line per LRC entry and numbered SRT cues', () => {
    const lines = alignLines('Hello there\nGeneral Kenobi', words(['Hello', 'there', 'General', 'Kenobi']));
    expect(toLrc(lines)).toBe('[00:00.00]Hello there\n[00:01.00]General Kenobi\n');
    expect(toSrt(lines)).toBe(
      '1\n00:00:00,000 --> 00:00:00,900\nHello there\n\n2\n00:00:01,000 --> 00:00:01,900\nGeneral Kenobi\n',
    );
  });
});

// ── tool ─────────────────────────────────────────────────────────────────

const mockSubscribe = vi.fn();
const mockUpload = vi.fn(async () => 'https://fal.media/uploaded/vocal.wav');
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
    resolveInput: vi.fn(async (uri: string) => ({ localPath: `/tmp/${uri.split('/').pop()}`, cleanup: vi.fn() })),
  };
});
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return { ...actual, readFile: vi.fn(async () => Buffer.from('pcm')) };
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { DEFAULT_ALIGNER, registerAlignmentTools } from '../../../src/generation/fal/alignment.js';

describe('align_text_to_audio — tool', () => {
  let client: Client;
  let server: McpServer;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0' });
    registerAlignmentTools(server);
    client = new Client({ name: 'test-client', version: '0' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(b);
    await client.connect(a);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscribe.mockResolvedValue({
      data: { loss: 0.1, words: words(['Hello', 'there', 'General', 'Kenobi']), characters: [] },
    });
  });

  const body = (r: unknown): Record<string, unknown> =>
    JSON.parse((r as { content: Array<{ text: string }> }).content[0].text);

  it('sends audio_url + text to the default aligner and returns line timings', async () => {
    const r = await client.callTool({
      name: 'align_text_to_audio',
      arguments: { audio: './vocal.wav', text: 'Hello there\nGeneral Kenobi' },
    });
    const [model, opts] = mockSubscribe.mock.calls[0];
    expect(model).toBe(DEFAULT_ALIGNER);
    expect(opts.input).toEqual({
      audio_url: 'https://fal.media/uploaded/vocal.wav',
      text: 'Hello there\nGeneral Kenobi',
    });
    const b = body(r);
    expect(b.line_count).toBe(2);
    expect(b.word_count).toBe(4);
    expect(mockProviderWrite).not.toHaveBeenCalled();
  });

  it('writes LRC when the output ends in .lrc', async () => {
    const r = await client.callTool({
      name: 'align_text_to_audio',
      arguments: { audio: 'https://x/vocal.wav', text: 'Hello there\nGeneral Kenobi', output: './song.lrc' },
    });
    const [path, buf, mime] = mockProviderWrite.mock.calls[0];
    expect(path).toBe('./song.lrc');
    expect(mime).toBe('text/plain');
    expect(buf.toString()).toBe('[00:00.00]Hello there\n[00:01.00]General Kenobi\n');
    expect(body(r).written).toBe('./song.lrc (lrc)');
  });

  it('honors an explicit format over the extension', async () => {
    await client.callTool({
      name: 'align_text_to_audio',
      arguments: { audio: 'https://x/v.wav', text: 'Hello there', output: './captions.txt', format: 'srt' },
    });
    expect(mockProviderWrite.mock.calls[0][1].toString()).toMatch(/^1\n00:00:00,000 --> /);
  });

  it('rejects text with no lines before calling fal', async () => {
    const r = await client.callTool({
      name: 'align_text_to_audio',
      arguments: { audio: 'https://x/v.wav', text: ' \n  \n' },
    });
    expect((r as { isError?: boolean }).isError).toBe(true);
    expect(mockSubscribe).not.toHaveBeenCalled();
  });
});

/**
 * MCP-tool tests for `build_ass_karaoke`.
 *
 * Covers the wrapper layer — input parsing (transcript_file vs inline
 * words, mutual exclusion, scribe `type` filtering, both-shapes JSON
 * acceptance) — and the round-trip through resolveOutput. The pure
 * writer is exercised by ass.test.ts.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  registerKaraokeTools,
  projectWord,
  extractWordsFromTranscript,
} from '../../../src/karaoke/index.js';

describe('projectWord', () => {
  it('keeps an entry without a `type` field', () => {
    expect(projectWord({ text: 'hi', start: 0, end: 0.3 })).toEqual({
      text: 'hi',
      start: 0,
      end: 0.3,
    });
  });

  it('keeps a Scribe v2 word entry', () => {
    expect(projectWord({ text: 'hi', start: 0, end: 0.3, type: 'word' })).toEqual({
      text: 'hi',
      start: 0,
      end: 0.3,
    });
  });

  it('drops Scribe v2 spacing entries', () => {
    expect(projectWord({ text: ' ', start: 0.3, end: 0.35, type: 'spacing' })).toBeNull();
  });

  it('drops Scribe v2 audio_event entries', () => {
    expect(
      projectWord({ text: '[laughter]', start: 1.0, end: 1.5, type: 'audio_event' }),
    ).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    expect(projectWord({ text: 'hi' })).toBeNull();
    expect(projectWord({ start: 0, end: 1 })).toBeNull();
    expect(projectWord({})).toBeNull();
  });

  it('returns null when timing fields are non-numeric', () => {
    expect(projectWord({ text: 'hi', start: '0' as unknown, end: 1 })).toBeNull();
  });
});

describe('extractWordsFromTranscript', () => {
  it('reads top-level words[] (artificer fal_transcribe shape)', () => {
    const transcript = {
      model: 'fal-ai/elevenlabs/speech-to-text/scribe-v2',
      text: 'Hi.',
      language: 'en',
      words: [
        { text: 'Hi.', start: 0, end: 0.4, type: 'word' },
        { text: ' ', start: 0.4, end: 0.45, type: 'spacing' },
      ],
      segments: [],
      raw: {},
    };
    const out = extractWordsFromTranscript(transcript);
    expect(out).toEqual([{ text: 'Hi.', start: 0, end: 0.4 }]);
  });

  it('falls back to data.words[] (raw fal-client subscribe shape)', () => {
    const transcript = {
      data: {
        words: [
          { text: 'Hello', start: 0, end: 0.3 },
          { text: 'world', start: 0.4, end: 0.7 },
        ],
      },
      requestId: 'req-1',
    };
    const out = extractWordsFromTranscript(transcript);
    expect(out).toEqual([
      { text: 'Hello', start: 0, end: 0.3 },
      { text: 'world', start: 0.4, end: 0.7 },
    ]);
  });

  it('throws when there is no words array anywhere', () => {
    expect(() => extractWordsFromTranscript({ text: 'plain transcript only' })).toThrow(
      /missing a `words\[\]` array/,
    );
  });

  it('throws when the parsed value is not an object', () => {
    expect(() => extractWordsFromTranscript(null)).toThrow(/parse to an object/);
    expect(() => extractWordsFromTranscript('not json')).toThrow(/parse to an object/);
  });

  it('throws when no usable words remain after filtering (all spacing)', () => {
    expect(() =>
      extractWordsFromTranscript({
        words: [
          { text: ' ', start: 0, end: 0.1, type: 'spacing' },
          { text: ' ', start: 0.1, end: 0.2, type: 'spacing' },
        ],
      }),
    ).toThrow(/no usable word entries/);
  });
});

describe('build_ass_karaoke (MCP)', () => {
  let client: Client;
  let server: McpServer;
  let cleanup: () => Promise<void>;
  let scratch: string;

  beforeAll(async () => {
    server = new McpServer({ name: 'test', version: '0.1.0' });
    registerKaraokeTools(server);
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

  beforeEach(async () => {
    scratch = join(tmpdir(), `artificer-karaoke-${randomUUID()}`);
    await mkdir(scratch, { recursive: true });
  });

  it('inline words path: writes a valid ASS file to the output path', async () => {
    const output = join(scratch, 'out.ass');
    const result = await client.callTool({
      name: 'build_ass_karaoke',
      arguments: {
        words: [
          { text: 'Hello', start: 0, end: 0.3 },
          { text: 'world.', start: 0.4, end: 0.8 },
        ],
        output,
      },
    });

    expect(result.isError).toBeUndefined();
    const ass = await readFile(output, 'utf8');
    expect(ass).toContain('[Script Info]');
    expect(ass).toContain('[Events]');
    expect(ass).toContain('Hello');
    expect(ass).toContain('world.');

    const payload = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(payload.output).toBe(output);
    expect(payload.word_count).toBe(2);
    expect(payload.bytes).toBeGreaterThan(0);

    await rm(scratch, { recursive: true, force: true });
  });

  it('transcript_file path: reads JSON from disk and filters scribe spacing tokens', async () => {
    const transcriptPath = join(scratch, 'transcript.json');
    const output = join(scratch, 'out.ass');
    await writeFile(
      transcriptPath,
      JSON.stringify({
        words: [
          { text: 'Hi.', start: 0, end: 0.4, type: 'word' },
          { text: ' ', start: 0.4, end: 0.45, type: 'spacing' },
          { text: 'There.', start: 0.5, end: 0.9, type: 'word' },
        ],
      }),
      'utf8',
    );

    const result = await client.callTool({
      name: 'build_ass_karaoke',
      arguments: { transcript_file: transcriptPath, output },
    });

    expect(result.isError).toBeUndefined();
    const payload = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    expect(payload.word_count).toBe(2); // spacing filtered
    const ass = await readFile(output, 'utf8');
    expect(ass).toContain('Hi.');
    expect(ass).toContain('There.');

    await rm(scratch, { recursive: true, force: true });
  });

  it('rejects when neither transcript_file nor words supplied', async () => {
    const result = await client.callTool({
      name: 'build_ass_karaoke',
      arguments: { output: join(scratch, 'never.ass') },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toMatch(/exactly one of/i);

    await rm(scratch, { recursive: true, force: true });
  });

  it('rejects when both transcript_file and words supplied', async () => {
    const result = await client.callTool({
      name: 'build_ass_karaoke',
      arguments: {
        transcript_file: '/tmp/fake.json',
        words: [{ text: 'hi', start: 0, end: 0.3 }],
        output: join(scratch, 'never.ass'),
      },
    });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ text: string }>)[0].text;
    expect(text).toMatch(/exactly one of/i);

    await rm(scratch, { recursive: true, force: true });
  });

  it('propagates style overrides into the ASS file', async () => {
    const output = join(scratch, 'styled.ass');
    await client.callTool({
      name: 'build_ass_karaoke',
      arguments: {
        words: [{ text: 'hi', start: 0, end: 0.5 }],
        output,
        font_name: 'Inter',
        font_size: 120,
        highlighted_color: '&H0000FFFF',
        margin_v: 320,
        play_res_x: 1920,
        play_res_y: 1080,
      },
    });
    const ass = await readFile(output, 'utf8');
    expect(ass).toContain('Inter');
    expect(ass).toContain(',120,');
    expect(ass).toContain('&H0000FFFF');
    expect(ass).toContain(',320,');
    expect(ass).toContain('PlayResX: 1920');
    expect(ass).toContain('PlayResY: 1080');

    await rm(scratch, { recursive: true, force: true });
  });

  it('integration-style round trip: parse the written ASS back and verify structure', async () => {
    const output = join(scratch, 'roundtrip.ass');
    await client.callTool({
      name: 'build_ass_karaoke',
      arguments: {
        words: [
          { text: 'The', start: 0.14, end: 0.219 },
          { text: 'toothpick', start: 0.319, end: 0.659 },
          { text: 'test.', start: 0.759, end: 1.059 },
        ],
        output,
      },
    });

    const ass = await readFile(output, 'utf8');
    const lines = ass.split('\n');

    // Section headers exist and in order
    const scriptInfoIdx = lines.indexOf('[Script Info]');
    const stylesIdx = lines.indexOf('[V4+ Styles]');
    const eventsIdx = lines.indexOf('[Events]');
    expect(scriptInfoIdx).toBeGreaterThanOrEqual(0);
    expect(stylesIdx).toBeGreaterThan(scriptInfoIdx);
    expect(eventsIdx).toBeGreaterThan(stylesIdx);

    // Exactly one Dialogue line for the single phrase
    const dialogues = lines.filter((l) => l.startsWith('Dialogue:'));
    expect(dialogues).toHaveLength(1);

    // The Dialogue text must contain three \k tags whose centiseconds
    // sum to the phrase duration (1.059 - 0.14 = 0.919s = 92cs).
    const ks = [...(dialogues[0] ?? '').matchAll(/\\k(\d+)/g)].map((m) => Number(m[1]));
    expect(ks).toHaveLength(3);
    expect(ks.reduce((a, b) => a + b, 0)).toBe(92);

    await rm(scratch, { recursive: true, force: true });
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createSeparation,
  extractMvsepFiles,
  waitForSeparation,
} from '../../../src/generation/mvsep/client.js';
import { registerMvsepTools, stemNames } from '../../../src/generation/mvsep/separate.js';

const TOKEN = 'secret-token-123';
const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

interface Call {
  method: string;
  url: string;
  form?: Record<string, unknown>;
}

/**
 * A fetch stand-in routing MVSep's endpoints: `statuses` are returned by
 * successive status checks, then files download from https://dl.test/.
 */
function mockMvsep(statuses: Array<Response | (() => Response)>) {
  const calls: Call[] = [];
  let n = 0;
  const fn = vi.fn(async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    const call: Call = { method: init?.method ?? 'GET', url };
    if (init?.body instanceof FormData) {
      call.form = Object.fromEntries(
        [...init.body.entries()].map(([k, v]) => [
          k,
          typeof v === 'string' ? v : `<blob ${(v as File).name}>`,
        ]),
      );
    }
    calls.push(call);
    if (url.endsWith('/separation/create'))
      return json({ success: true, data: { hash: 'H1', link: 'x' } });
    if (url.endsWith('/separation/cancel')) return json({ success: true });
    if (url.includes('/separation/get')) {
      const next = statuses[Math.min(n++, statuses.length - 1)];
      return typeof next === 'function' ? next() : next.clone();
    }
    if (url.startsWith('https://dl.test/')) {
      return new Response(Buffer.from(`audio:${url.split('/').pop()}`), {
        headers: { 'content-type': 'audio/wav' },
      });
    }
    return new Response('nope', { status: 404 });
  });
  vi.stubGlobal('fetch', fn);
  return calls;
}

const done = json({
  success: true,
  status: 'done',
  data: {
    algorithm: 'MVSep Male/Female separation',
    files: [
      {
        url: 'https:\\/\\/dl.test\\/song_male_female_mt_2_male.wav',
        download: 'song_male_female_mt_2_male.wav',
      },
      {
        url: 'https://dl.test/song_male_female_mt_2_female.wav',
        download: 'song_male_female_mt_2_female.wav',
      },
    ],
  },
});

describe('mvsep helpers', () => {
  it('names stems by the last "_" token, de-duplicating', () => {
    expect(
      stemNames([
        { url: 'u', download: 'song_male_female_mt_2_male.wav' },
        { url: 'u', download: 'song_male_female_mt_2_female.wav' },
        { url: 'u', download: 'other_male.wav' },
        { url: 'u', download: 'x_.wav' },
      ]),
    ).toEqual(['male', 'female', 'male3', 'stem4']);
  });

  it('reads files as an array or an object, unescaping slashes', () => {
    const files = [{ url: 'https:\\/\\/dl.test\\/a_vocals.wav', download: 'a_vocals.wav' }];
    expect(extractMvsepFiles({ files })).toEqual([
      { url: 'https://dl.test/a_vocals.wav', download: 'a_vocals.wav' },
    ]);
    expect(extractMvsepFiles({ files: { 0: files[0] } })).toHaveLength(1);
    expect(
      extractMvsepFiles({ files: [{ url: 'https://dl.test/x/b%20c_male.wav' }] })[0].download,
    ).toBe('b c_male.wav');
    expect(extractMvsepFiles({})).toEqual([]);
  });
});

describe('mvsep client', () => {
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'mvsep-'));
    await writeFile(join(dir, 'song.wav'), 'fake');
  });
  afterAll(async () => rm(dir, { recursive: true, force: true }));
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env['MVSEP_API_URL'];
  });

  it('uploads with is_demo forced to 0, the options and the format code', async () => {
    const calls = mockMvsep([done]);
    process.env['MVSEP_API_URL'] = 'https://de.mvsep.com/api/';
    const hash = await createSeparation({
      token: TOKEN,
      audio: { path: join(dir, 'song.wav') },
      sepType: 57,
      addOpts: { add_opt1: '2', add_opt2: '1', add_opt3: undefined },
      outputFormat: 'wav16',
    });
    expect(hash).toBe('H1');
    expect(calls[0]).toEqual({
      method: 'POST',
      url: 'https://de.mvsep.com/api/separation/create',
      form: {
        api_token: TOKEN,
        audiofile: '<blob song.wav>',
        sep_type: '57',
        add_opt1: '2',
        add_opt2: '1',
        output_format: '1',
        is_demo: '0',
      },
    });
  });

  it('passes a public URL for MVSep to fetch', async () => {
    const calls = mockMvsep([done]);
    await createSeparation({
      token: TOKEN,
      audio: { url: 'https://cdn.test/song.wav' },
      sepType: 40,
      addOpts: {},
      outputFormat: 'flac24',
    });
    expect(calls[0].form).toMatchObject({
      url: 'https://cdn.test/song.wav',
      remote_type: 'direct',
      output_format: '5',
    });
    expect(calls[0].form).not.toHaveProperty('audiofile');
  });

  it('reports an unknown token without echoing it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ success: false, data: { message: 'Invalid api_token' } }, 401)),
    );
    const err = await createSeparation({
      token: TOKEN,
      audio: { url: 'https://cdn.test/a.wav' },
      sepType: 57,
      addOpts: {},
      outputFormat: 'wav16',
    }).catch((e: Error) => e);
    expect((err as Error).message).toMatch(/HTTP 401.*check MVSEP_API_TOKEN.*Invalid api_token/);
    expect((err as Error).message).not.toContain(TOKEN);
  });

  it('polls through the queue, sending progress with the hash', async () => {
    mockMvsep([
      json({ success: true, status: 'waiting', data: { queue_count: 3, current_order: 2 } }),
      json({ success: true, status: 'processing', data: {} }),
      json({ success: true, status: 'processing', data: {} }),
      done,
    ]);
    const sendNotification = vi.fn(async () => undefined);
    const status = await waitForSeparation({
      tool: 't',
      token: TOKEN,
      hash: 'H1',
      timeoutSeconds: 10,
      pollIntervalMs: 1,
      extra: { _meta: { progressToken: 'p' }, sendNotification } as never,
    });
    expect(status.status).toBe('done');
    const messages = sendNotification.mock.calls.map(
      (c) => (c[0] as { params: { message: string } }).params.message,
    );
    expect(messages).toEqual([
      'MVSep job H1: waiting (position 2 of 3)',
      'MVSep job H1: processing',
    ]);
  });

  it("reports a failed job with MVSep's message", async () => {
    mockMvsep([json({ success: true, status: 'failed', data: { message: 'File too long' } })]);
    await expect(
      waitForSeparation({
        tool: 't',
        token: TOKEN,
        hash: 'H1',
        timeoutSeconds: 10,
        pollIntervalMs: 1,
      }),
    ).rejects.toThrow(/MVSep job H1 failed: File too long/);
  });

  it('cancels on the deadline and names the hash', async () => {
    const calls = mockMvsep([json({ success: true, status: 'processing', data: {} })]);
    const err = (await waitForSeparation({
      tool: 't',
      token: TOKEN,
      hash: 'H1',
      timeoutSeconds: 0.05,
      pollIntervalMs: 10,
    }).catch((e: Error) => e)) as Error;
    expect(err.message).toMatch(
      /not done after 0\.05s \(last status: processing\); job H1 cancelled on MVSep\. .*pass hash "H1"/,
    );
    const cancel = calls.find((c) => c.url.endsWith('/separation/cancel'));
    expect(cancel?.form).toEqual({ api_token: TOKEN, hash: 'H1' });
  });

  it('cancels when the client aborts', async () => {
    const calls = mockMvsep([json({ success: true, status: 'waiting', data: {} })]);
    const ac = new AbortController();
    setTimeout(() => ac.abort(), 20);
    await expect(
      waitForSeparation({
        tool: 't',
        token: TOKEN,
        hash: 'H1',
        timeoutSeconds: 60,
        pollIntervalMs: 5,
        extra: { signal: ac.signal } as never,
      }),
    ).rejects.toThrow(/cancelled by the client; job H1 cancelled on MVSep/);
    expect(calls.some((c) => c.url.endsWith('/separation/cancel'))).toBe(true);
  });

  it('rides out rate limits, but gives up after three errors in a row', async () => {
    mockMvsep([
      new Response('', { status: 429 }),
      new Response('', { status: 429 }),
      new Response('', { status: 429 }),
      done,
    ]);
    await expect(
      waitForSeparation({
        tool: 't',
        token: TOKEN,
        hash: 'H1',
        timeoutSeconds: 10,
        pollIntervalMs: 1,
      }),
    ).resolves.toMatchObject({ status: 'done' });

    mockMvsep([json({}, 500)]);
    await expect(
      waitForSeparation({
        tool: 't',
        token: TOKEN,
        hash: 'H1',
        timeoutSeconds: 10,
        pollIntervalMs: 1,
      }),
    ).rejects.toThrow(/3 status checks in a row failed for job H1.*pass hash "H1"/);
  });
});

describe('mvsep_separate_audio tool', () => {
  let server: McpServer;
  let client: Client;
  let dir: string;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'mvsep-tool-'));
    await writeFile(join(dir, 'duet.wav'), 'fake');
    server = new McpServer({ name: 'test', version: '0' });
    registerMvsepTools(server);
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
  beforeEach(() => {
    process.env['MVSEP_API_TOKEN'] = TOKEN;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env['MVSEP_API_TOKEN'];
  });

  const call = async (args: Record<string, unknown>) => {
    const r = (await client.callTool({ name: 'mvsep_separate_audio', arguments: args })) as {
      isError?: boolean;
      content: Array<{ text: string }>;
    };
    return { isError: r.isError, text: r.content[0].text };
  };

  it('separates a duet with the proven defaults and writes one file per singer', async () => {
    // Done on the first check (polling is covered above; the tool waits 5 s between checks).
    const calls = mockMvsep([done]);
    const out = join(dir, 'stems');
    const r = await call({ audio: join(dir, 'duet.wav'), output_dir: out });
    expect(r.isError, r.text).toBeFalsy();
    const reply = JSON.parse(r.text) as {
      hash: string;
      stems: Record<string, string>;
      algorithm: string;
    };
    expect(reply.hash).toBe('H1');
    expect(reply.algorithm).toBe('MVSep Male/Female separation');
    expect(reply.stems).toEqual({ male: `${out}/duet-male.wav`, female: `${out}/duet-female.wav` });
    expect(await readFile(reply.stems.male, 'utf8')).toBe('audio:song_male_female_mt_2_male.wav');
    expect(calls[0].form).toMatchObject({
      sep_type: '57',
      add_opt1: '2',
      add_opt2: '1',
      output_format: '1',
      is_demo: '0',
    });
  });

  it('collects an earlier job by hash without uploading', async () => {
    const calls = mockMvsep([done]);
    const r = await call({ hash: 'H1', output_dir: join(dir, 'again') });
    expect(r.isError, r.text).toBeFalsy();
    expect(Object.keys((JSON.parse(r.text) as { stems: object }).stems)).toEqual([
      'male',
      'female',
    ]);
    expect(JSON.parse(r.text).stems.male).toBe(`${join(dir, 'again')}/H1-male.wav`);
    expect(calls.some((c) => c.url.endsWith('/separation/create'))).toBe(false);
  });

  it('needs exactly one of audio or hash, and the token', async () => {
    expect((await call({ output_dir: dir })).text).toMatch(/exactly one of `audio` or `hash`/);
    delete process.env['MVSEP_API_TOKEN'];
    expect((await call({ hash: 'H1', output_dir: dir })).text).toMatch(
      /MVSEP_API_TOKEN environment variable is not set.*mvsep\.com\/user-api/,
    );
  });

  it('leaves add_opts unset for other algorithms', async () => {
    const calls = mockMvsep([done]);
    await call({
      audio: join(dir, 'duet.wav'),
      output_dir: join(dir, 'o'),
      sep_type: 40,
      add_opt1: 7,
    });
    expect(calls[0].form).toMatchObject({ sep_type: '40', add_opt1: '7' });
    expect(calls[0].form).not.toHaveProperty('add_opt2');
  });
});

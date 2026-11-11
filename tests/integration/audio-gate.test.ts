/**
 * Integration tests for audio_gate, against the real ffmpeg.
 *
 * Skipped automatically if ffmpeg is not available.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { createTestServerClient } from '../helpers/server.js';

const execFileAsync = promisify(execFile);

function hasFfmpeg(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const run = hasFfmpeg();
if (!run) console.error('⚠ ffmpeg not found — skipping audio_gate integration tests');

/** Peak level in dBFS of [start, end) of a file; -Infinity for digital silence. */
async function peakDb(path: string, start: number, end: number): Promise<number> {
  const { stderr } = await execFileAsync('ffmpeg', [
    '-v',
    'info',
    '-i',
    path,
    '-af',
    `atrim=${start}:${end},volumedetect`,
    '-f',
    'null',
    '-',
  ]);
  const m = stderr.match(/max_volume: (-?[\d.]+|-inf) dB/);
  if (!m) throw new Error(`no volumedetect output:\n${stderr}`);
  return m[1] === '-inf' ? -Infinity : Number(m[1]);
}

/** MD5 of the decoded samples of [start, end). */
async function md5(path: string, start: number, end: number): Promise<string> {
  const { stdout } = await execFileAsync('ffmpeg', [
    '-v',
    'error',
    '-i',
    path,
    '-af',
    `atrim=${start}:${end}`,
    '-f',
    'md5',
    '-',
  ]);
  return stdout.trim();
}

describe.runIf(run)('Integration: audio_gate', () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  const dir = join(tmpdir(), `artificer-gate-${randomUUID()}`);
  const input = join(dir, 'stem.wav'); // 6 s, 48 kHz stereo, 24-bit

  beforeAll(async () => {
    await mkdir(dir, { recursive: true });
    await execFileAsync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-f',
      'lavfi',
      '-i',
      'sine=frequency=1000:sample_rate=48000:duration=6',
      '-ac',
      '2',
      '-c:a',
      'pcm_s24le',
      input,
    ]);
    ({ client, cleanup } = await createTestServerClient());
  }, 60_000);

  afterAll(async () => {
    await cleanup();
    await rm(dir, { recursive: true, force: true });
  });

  it('keeps the windows bit-exact and silences the rest, same length and depth', async () => {
    const output = join(dir, 'gated.wav');
    const res = (await client.callTool({
      name: 'audio_gate',
      arguments: {
        input,
        output,
        windows: [
          [4, 4.5],
          [1, 2],
        ],
        fade_ms: 10,
      },
    })) as { isError?: boolean; content: Array<{ text: string }> };
    expect(res.isError, res.content[0].text).toBeFalsy();
    const reply = JSON.parse(res.content[0].text) as {
      windows: number[][];
      kept_seconds: number;
      codec: string;
    };
    expect(reply).toMatchObject({
      windows: [
        [1, 2],
        [4, 4.5],
      ],
      kept_seconds: 1.5,
      codec: 'pcm_s24le',
    });

    const probe = async (f: string): Promise<string> =>
      (
        await execFileAsync('ffprobe', [
          '-v',
          'error',
          '-show_entries',
          'stream=codec_name,sample_rate,channels,duration_ts',
          '-of',
          'csv=p=0',
          f,
        ])
      ).stdout.trim();
    expect(await probe(output)).toBe(await probe(input));

    // The kept audio is untouched (gain exactly 1), ramps included.
    expect(await md5(output, 1, 2)).toBe(await md5(input, 1, 2));
    expect(await md5(output, 4, 4.5)).toBe(await md5(input, 4, 4.5));
    // Silent outside, up to the ramps 10 ms either side (volumedetect
    // measures in 16-bit, where digital silence reads -91 dB).
    for (const [s, e] of [
      [0, 0.99],
      [2.01, 3.99],
      [4.51, 6],
    ]) {
      expect(await peakDb(output, s, e)).toBeLessThanOrEqual(-90);
    }
    // The ramps: partial level just outside each edge.
    const ramp = await peakDb(output, 0.99, 1);
    expect(ramp).toBeGreaterThan(-60);
    expect(ramp).toBeLessThan(await peakDb(input, 0.99, 1));
  }, 120_000);

  it('rejects a reversed window', async () => {
    const res = (await client.callTool({
      name: 'audio_gate',
      arguments: { input, output: join(dir, 'x.wav'), windows: [[3, 1]] },
    })) as { isError?: boolean; content: Array<{ text: string }> };
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/window 0 \[3, 1\]: end must be after start/);
  });
});

/**
 * Integration test for audio_beat_grid: a synthetic drum loop written as a
 * WAV, decoded by the real ffmpeg, analysed through the MCP tool.
 *
 * Skipped automatically if ffmpeg is not available.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { createTestServerClient } from '../helpers/server.js';
import { drumLoop, nearest, toWav } from '../helpers/drums.js';

function hasFfmpeg(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const run = hasFfmpeg();
if (!run) console.error('⚠ ffmpeg not found — skipping audio_beat_grid integration test');

describe.runIf(run)('Integration: audio_beat_grid', () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  const dir = join(tmpdir(), `artificer-beatgrid-${randomUUID()}`);
  const wav = join(dir, 'loop.wav');
  const loop = drumLoop({ bpm: 92.3, seconds: 45, kickPhase: 1, sr: 44_100 });

  beforeAll(async () => {
    await mkdir(dir, { recursive: true });
    await writeFile(wav, toWav(loop.samples, loop.sr));
    ({ client, cleanup } = await createTestServerClient());
  });

  afterAll(async () => {
    await cleanup();
    await rm(dir, { recursive: true, force: true });
  });

  const call = async (args: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const res = (await client.callTool({ name: 'audio_beat_grid', arguments: args })) as {
      isError?: boolean;
      content: Array<{ text: string }>;
    };
    if (res.isError) throw new Error(res.content[0].text);
    return JSON.parse(res.content[0].text) as Record<string, unknown>;
  };

  it('returns the full grid in the reply', async () => {
    const g = await call({ input: wav });
    expect(g['tempo_bpm']).toBeGreaterThan(91.8);
    expect(g['tempo_bpm']).toBeLessThan(92.8);
    const downbeats = g['downbeats'] as number[];
    for (const d of downbeats) expect(Math.abs(nearest(loop.kicks, d))).toBeLessThan(0.05);
    expect((g['beat_energy'] as { kick: number[] }).kick).toHaveLength((g['beats'] as number[]).length);
  });

  it('analyses a window in song time and writes the JSON file', async () => {
    const out = join(dir, 'grid.json');
    const summary = await call({ input: wav, start: 10, end: 40, output: out });
    expect(summary['output']).toBe(out);
    expect(summary['beats']).toBeUndefined();
    expect(summary['beat_count']).toBeGreaterThan(40);

    const file = JSON.parse(await readFile(out, 'utf8')) as {
      analysed: { start: number; end: number };
      beats: number[];
      downbeats: number[];
      kick_ref: number;
      offset_s: number;
    };
    expect(file.analysed.start).toBe(10);
    expect(file.analysed.end).toBeCloseTo(40, 1);
    expect(file.beats[0]).toBeGreaterThanOrEqual(10);
    expect(file.beats[file.beats.length - 1]).toBeLessThanOrEqual(40);
    expect(Math.abs(nearest(loop.kicks, file.kick_ref + file.offset_s))).toBeLessThan(0.015);
  });

  it('rejects end before start', async () => {
    await expect(call({ input: wav, start: 20, end: 10 })).rejects.toThrow(/must be after start/);
  });
});

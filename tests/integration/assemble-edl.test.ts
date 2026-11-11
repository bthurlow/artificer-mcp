/**
 * Integration tests for video_assemble_edl, against the real ffmpeg.
 *
 * The clips are flat frames whose luma IS the source frame number (geq
 * lum=N, lossless), and the render is lossless too, so each output frame's
 * average luma says exactly which source frame landed there. That checks the
 * frame-exact placement, the seek, and the 25 → 24 fps conversion against a
 * reference conversion of the whole clip.
 *
 * Skipped automatically if ffmpeg is not available.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm, writeFile } from 'node:fs/promises';
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
if (!run) console.error('⚠ ffmpeg not found — skipping video_assemble_edl integration tests');

/** Per-frame average luma of a video. */
async function lumaPerFrame(path: string, vf = ''): Promise<number[]> {
  const { stderr } = await execFileAsync(
    'ffmpeg',
    [
      '-v',
      'info',
      '-i',
      path,
      '-vf',
      `${vf}${vf ? ',' : ''}signalstats,metadata=print:key=lavfi.signalstats.YAVG`,
      '-f',
      'null',
      '-',
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  return [...stderr.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map((m) =>
    Math.round(Number(m[1])),
  );
}

async function frameHashes(path: string): Promise<string[]> {
  const { stdout } = await execFileAsync(
    'ffmpeg',
    ['-v', 'error', '-i', path, '-map', '0:v', '-f', 'framemd5', '-'],
    {
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  return stdout
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(',')[5].trim());
}

describe.runIf(run)('Integration: video_assemble_edl', () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  const dir = join(tmpdir(), `artificer-edl-${randomUUID()}`);
  const clipA = join(dir, 'a.mp4'); // 8 s at 25 fps, luma = frame number
  const clipB = join(dir, 'b.mp4'); // 5 s at 25 fps, luma = 128 + frame number
  const song = join(dir, 'song.wav');
  let refA: number[] = [];
  let refB: number[] = [];

  const lossless = { width: 64, height: 36, fps: 24, crf: 0, preset: 'ultrafast' };

  beforeAll(async () => {
    await mkdir(dir, { recursive: true });
    const clip = (out: string, seconds: number, lum: string): Promise<unknown> =>
      execFileAsync('ffmpeg', [
        '-v',
        'error',
        '-y',
        '-f',
        'lavfi',
        '-i',
        `color=c=black:s=64x36:r=25:d=${seconds},format=yuv420p,geq=lum=${lum}:cb=128:cr=128`,
        '-c:v',
        'libx264',
        '-qp',
        '0',
        '-preset',
        'ultrafast',
        out,
      ]);
    await Promise.all([
      clip(clipA, 8, 'N'),
      clip(clipB, 5, '128+N'),
      execFileAsync('ffmpeg', [
        '-v',
        'error',
        '-y',
        '-f',
        'lavfi',
        '-i',
        'sine=frequency=440:duration=30',
        song,
      ]),
    ]);
    // The reference: each clip converted to 24 fps as a whole, unseeked.
    [refA, refB] = await Promise.all([
      lumaPerFrame(clipA, 'fps=24'),
      lumaPerFrame(clipB, 'fps=24'),
    ]);
    ({ client, cleanup } = await createTestServerClient());
  }, 60_000);

  afterAll(async () => {
    await cleanup();
    await rm(dir, { recursive: true, force: true });
  });

  afterEach(() => {
    delete process.env['ARTIFICER_EDL_SHOTS_PER_PASS'];
  });

  const call = async (args: Record<string, unknown>) => {
    const res = (await client.callTool({ name: 'video_assemble_edl', arguments: args }, undefined, {
      timeout: 120_000,
    })) as { isError?: boolean; content: Array<{ text: string }> };
    return { isError: res.isError, text: res.content[0].text };
  };

  // seg 0, song 2-5: A from src 2.0 s (seeked), then B at 3.5 s from src 2.5 s
  // seg 1, song 10-12: A from src 4.0 s
  const edl = {
    audio: song,
    ...lossless,
    segments: [
      {
        song: [2, 5],
        shots: [
          { clip: clipA, clip_song_start: 0 },
          { clip: clipB, clip_song_start: 1, start: 3.5 },
        ],
      },
      { song: [10, 12], shots: [{ clip: clipA, clip_song_start: 6 }] },
    ],
  };
  const expected = (): number[] => [
    ...refA.slice(48, 48 + 36), // 2.0 s → frame 48, 1.5 s = 36 frames
    ...refB.slice(60, 60 + 36), // 2.5 s → frame 60, 1.5 s
    ...refA.slice(96, 96 + 48), // 4.0 s → frame 96, 2 s
  ];

  it('places every source frame exactly, across seeks and segments', async () => {
    const output = join(dir, 'out.mp4');
    const { isError, text } = await call({ edl, output });
    expect(isError, text).toBeFalsy();
    const reply = JSON.parse(text) as {
      frames: number;
      passes: number;
      shots: Array<{ out_start: number }>;
    };
    expect(reply.frames).toBe(120);
    expect(reply.passes).toBe(1);
    expect(reply.shots.map((s) => s.out_start)).toEqual([0, 1.5, 3]);
    expect(await lumaPerFrame(output)).toEqual(expected());
  }, 120_000);

  it('renders the same frames in batches', async () => {
    const single = join(dir, 'single.mp4');
    const batched = join(dir, 'batched.mp4');
    expect((await call({ edl, output: single })).isError).toBeFalsy();
    process.env['ARTIFICER_EDL_SHOTS_PER_PASS'] = '1';
    const res = await call({ edl, output: batched });
    expect(res.isError, res.text).toBeFalsy();
    expect((JSON.parse(res.text) as { passes: number }).passes).toBe(4);
    expect(await frameHashes(batched)).toEqual(await frameHashes(single));
  }, 120_000);

  it('reads an EDL file with paths relative to it, and snaps to an audio_beat_grid file', async () => {
    const sub = join(dir, 'proj');
    await mkdir(sub, { recursive: true });
    await writeFile(
      join(sub, 'grid.json'),
      JSON.stringify({
        beats: [2, 2.5, 3, 3.5, 4, 4.5],
        kick_ref: 2,
        offset_s: 0,
        beats_per_bar: 4,
      }),
    );
    await writeFile(
      join(sub, 'edl.json'),
      JSON.stringify({
        ...edl,
        audio: '../song.wav',
        beat_grid: 'grid.json',
        segments: [
          {
            song: [2, 5],
            shots: [
              { clip: '../a.mp4', clip_song_start: 0 },
              { clip: '../b.mp4', clip_song_start: 1, start: 3.7, snap: 'kick' },
            ],
          },
        ],
      }),
    );
    const res = await call({ edl_path: join(sub, 'edl.json'), output: join(dir, 'snapped.mp4') });
    expect(res.isError, res.text).toBeFalsy();
    const shots = (JSON.parse(res.text) as { shots: Array<Record<string, number>> }).shots;
    // kick on 2 → downbeats 2 and 4; 3.7 snaps to 4
    expect(shots[1]).toMatchObject({ song_start: 4, requested_start: 3.7, out_start: 2 });
  }, 120_000);

  it('screens an element so it appears max_lead before the cut, keeping every frame', async () => {
    // A flat white 3 s element, peak 1 s, at most 0.5 s before the cut at
    // 1.5 s (frame 36): element seconds 0.5-3 cover output frames 24-83.
    const white = join(dir, 'white.mp4');
    await execFileAsync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-f',
      'lavfi',
      '-i',
      'color=c=white:s=64x36:r=24:d=3',
      '-c:v',
      'libx264',
      '-qp',
      '0',
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p',
      white,
    ]);
    const fxEdl = {
      ...edl,
      fx: { burn: { src: white, peak: 1, max_lead: 0.5, mode: 'screen' } },
      segments: [
        {
          song: [2, 5],
          shots: [
            { clip: clipA, clip_song_start: 0 },
            { clip: clipB, clip_song_start: 1, start: 3.5, in: 'burn' },
          ],
        },
        edl.segments[1],
      ],
    };
    const output = join(dir, 'fx.mp4');
    const res = await call({ edl: fxEdl, output });
    expect(res.isError, res.text).toBeFalsy();
    const luma = await lumaPerFrame(output);
    expect(luma).toHaveLength(120);
    const base = expected();
    // Before the element: the shot, give or take the RGB round trip.
    for (const i of [0, 12, 23]) expect(Math.abs(luma[i] - base[i])).toBeLessThanOrEqual(2);
    // Under it: white (limited range).
    for (const i of [24, 36, 60, 83]) expect(luma[i]).toBeGreaterThanOrEqual(233);
    // After it.
    for (const i of [84, 100, 119]) expect(Math.abs(luma[i] - base[i])).toBeLessThanOrEqual(2);

    process.env['ARTIFICER_EDL_SHOTS_PER_PASS'] = '1';
    const batched = join(dir, 'fx-batched.mp4');
    expect((await call({ edl: fxEdl, output: batched })).isError).toBeFalsy();
    expect(await frameHashes(batched)).toEqual(await frameHashes(output));
  }, 180_000);

  it('sweeps a still across the cut, both shots in song sync, the incoming one behind it', async () => {
    // A black 16x36 "wing" (dark on white, so fully opaque). dur 0.5 s =
    // 12 frames from 30, centred on the cut at 36; margin 8 = half its
    // width keeps it off-frame on the window's first and last frames.
    const wingPng = join(dir, 'wing.png');
    await execFileAsync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-f',
      'lavfi',
      '-i',
      'color=c=black:s=16x36',
      '-frames:v',
      '1',
      wingPng,
    ]);
    const sweepEdl = {
      ...edl,
      fx: { wing: { type: 'sweep', src: wingPng, dur: 0.5, scale: 1, margin_px: 8 } },
      segments: [
        {
          song: [2, 5],
          shots: [
            { clip: clipA, clip_song_start: 0 },
            { clip: clipB, clip_song_start: 1, start: 3.5, in: 'wing' },
          ],
        },
        edl.segments[1],
      ],
    };
    const output = join(dir, 'sweep.mp4');
    const res = await call({ edl: sweepEdl, output });
    expect(res.isError, res.text).toBeFalsy();
    const near = (got: number, want: number): void =>
      expect(Math.abs(got - want)).toBeLessThanOrEqual(2);
    const base = expected();
    const whole = await lumaPerFrame(output);
    expect(whole).toHaveLength(120);
    // Outside the window, and on its first (all outgoing) and last (all
    // incoming) frames: the plain cut.
    for (const i of [0, 29, 30, 41, 42, 119]) near(whole[i], base[i]);
    // Frame 36, a little past half way: the edge is at x = 37.4. Left of the
    // wing is the incoming shot (B's first frame), right of it the outgoing
    // one still playing in sync (A's source frame 84), the wing between.
    const left = await lumaPerFrame(output, 'crop=16:36:0:0');
    const right = await lumaPerFrame(output, 'crop=14:36:50:0');
    const wingCol = await lumaPerFrame(output, 'crop=8:36:33:0');
    near(left[36], refB[60]);
    near(right[36], refA[84]);
    expect(wingCol[36]).toBeLessThanOrEqual(20);
    // Before the cut, the left side already shows B (its source frame 59).
    near(left[35], refB[59]);
    near(right[35], refA[83]);
    // The window's first frame has no still on it; the next has its edge.
    expect(left[31]).toBeLessThan(base[31] - 2);

    process.env['ARTIFICER_EDL_SHOTS_PER_PASS'] = '1';
    const batched = join(dir, 'sweep-batched.mp4');
    const b = await call({ edl: sweepEdl, output: batched });
    expect(b.isError, b.text).toBeFalsy();
    expect(await frameHashes(batched)).toEqual(await frameHashes(output));
  }, 180_000);

  it('lists every problem and renders nothing', async () => {
    const output = join(dir, 'never.mp4');
    const { isError, text } = await call({
      edl: {
        ...edl,
        segments: [
          {
            song: [2, 7],
            shots: [
              { clip: clipA, clip_song_start: 3 },
              { clip: clipB, clip_song_start: 0, start: 4 },
              { clip: join(dir, 'missing.mp4'), start: 6 },
            ],
          },
        ],
      },
      output,
    });
    expect(isError).toBe(true);
    expect(text).toMatch(/3 problem\(s\)/);
    expect(text).toMatch(/shot 0 .*starts 1\.000s before its clip begins/);
    expect(text).toMatch(/shot 1 .*needs the clip up to 6\.000s, but it is 5\.000s long/);
    expect(text).toMatch(/missing\.mp4: cannot be read/);
  }, 60_000);

  it('validates the EDL shape', async () => {
    const { isError, text } = await call({
      edl: { audio: song, segments: [] },
      output: join(dir, 'x.mp4'),
    });
    expect(isError).toBe(true);
    expect(text).toMatch(/invalid EDL:\n- segments:/);
    const both = await call({ edl, edl_path: 'x.json', output: join(dir, 'x.mp4') });
    expect(both.text).toMatch(/exactly one of `edl` or `edl_path`/);
  });
});

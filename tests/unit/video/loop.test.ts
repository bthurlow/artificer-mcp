import { describe, it, expect } from 'vitest';
import {
  buildCrossfadeFilter,
  buildReboundFilter,
  describeSeam,
  judgeSeam,
  MAX_REVERSE_BYTES,
  parseSsimStats,
  parseSsimSummary,
  planLoop,
  type LoopPlanInput,
} from '../../../src/video/loop.js';

const base: LoopPlanInput = {
  mode: 'rebound',
  sourceFrames: 90,
  frameRate: 30,
  width: 320,
  height: 240,
  crossfadeSeconds: 0.5,
};

describe('planLoop — rebound', () => {
  it('drops the turn-around and wrap frames: 2n - 2', () => {
    const plan = planLoop(base);
    expect(plan).toMatchObject({ usedFrames: 90, loopFrames: 178, cycles: 1 });
    expect(plan.warning).toBeUndefined();
  });

  it('max_duration trims the source, never the finished loop', () => {
    // 2s = 60 frames → 31 source frames → 2*31-2 = 60.
    const plan = planLoop({ ...base, maxDuration: 2 });
    expect(plan.usedFrames).toBe(31);
    expect(plan.loopFrames).toBe(60);
  });

  it('min_duration repeats whole cycles', () => {
    // 178 frames = 5.93s; 12s needs 3 cycles.
    expect(planLoop({ ...base, minDuration: 12 }).cycles).toBe(3);
    expect(planLoop({ ...base, minDuration: 3 }).cycles).toBe(1);
  });

  it('refuses clips too short to reverse', () => {
    expect(() => planLoop({ ...base, sourceFrames: 2 })).toThrow(/at least 3 source frames/);
  });

  it('refuses a rebound that would buffer too much in memory', () => {
    const frames = Math.ceil(MAX_REVERSE_BYTES / (1920 * 1080 * 1.5)) + 1;
    expect(() =>
      planLoop({ ...base, sourceFrames: frames, width: 1920, height: 1080 }),
    ).toThrow(/buffer ~\d+ MB/);
  });

  it('max_duration can bring an over-budget rebound back under the memory cap', () => {
    const plan = planLoop({
      ...base,
      sourceFrames: 5000,
      width: 1920,
      height: 1080,
      maxDuration: 8,
    });
    expect(plan.usedFrames).toBe(121);
  });
});

describe('planLoop — crossfade', () => {
  const xf: LoopPlanInput = { ...base, mode: 'crossfade' };

  it('output is one crossfade shorter than the source', () => {
    expect(planLoop(xf)).toMatchObject({ usedFrames: 90, crossfadeFrames: 15, loopFrames: 75 });
  });

  it('max_duration leaves room for the crossfade in the trimmed source', () => {
    // 2s = 60 frames of output → 60 + 15 source frames.
    const plan = planLoop({ ...xf, maxDuration: 2 });
    expect(plan.usedFrames).toBe(75);
    expect(plan.loopFrames).toBe(60);
  });

  it('refuses a crossfade longer than half the clip', () => {
    expect(() => planLoop({ ...xf, crossfadeSeconds: 2 })).toThrow(
      /more than twice crossfade_seconds/,
    );
  });

  it('refuses a crossfade under two frames', () => {
    expect(() => planLoop({ ...xf, crossfadeSeconds: 0.01 })).toThrow(/under 2 frames/);
  });
});

describe('planLoop — shared validation', () => {
  it('rejects min_duration above max_duration', () => {
    expect(() => planLoop({ ...base, minDuration: 9, maxDuration: 8 })).toThrow(
      /greater than max_duration/,
    );
  });

  it('warns rather than cutting mid-cycle when min forces a total above max', () => {
    // Crossfade loop of 75 frames (2.5s): min 4s → 2 cycles = 5s, above max 4.5s.
    const plan = planLoop({ ...base, mode: 'crossfade', minDuration: 4, maxDuration: 4.5 });
    expect(plan.cycles).toBe(2);
    expect(plan.warning).toMatch(/above max_duration/);
  });

  it('rejects an unreadable frame count or frame rate', () => {
    expect(() => planLoop({ ...base, sourceFrames: Number.NaN })).toThrow(/count the frames/);
    expect(() => planLoop({ ...base, frameRate: 0 })).toThrow(/frame rate/);
  });
});

describe('filter graphs', () => {
  it('rebound reverses, then drops the first and last reversed frames', () => {
    const f = buildReboundFilter(planLoop(base), 90);
    expect(f).toContain('reverse,trim=start_frame=1:end_frame=89');
    expect(f).toContain('concat=n=2:v=1:a=0[out]');
    expect(f).not.toContain('[0:v]trim=');
  });

  it('prepends a source trim only when max_duration shortened the source', () => {
    const f = buildReboundFilter(planLoop({ ...base, maxDuration: 2 }), 90);
    expect(f.startsWith('[0:v]trim=end_frame=31,setpts=PTS-STARTPTS,split')).toBe(true);
  });

  it('crossfade blends tail→head with a T-based ramp ending on the clean head frame', () => {
    const plan = planLoop({ ...base, mode: 'crossfade' });
    const f = buildCrossfadeFilter(plan, 90, 30);
    expect(f).toContain('[s1]trim=start_frame=15:end_frame=75');
    expect(f).toContain('[s2]trim=start_frame=75');
    expect(f).toContain('[s3]trim=end_frame=15');
    expect(f).toContain("blend=all_expr='A*(1-clip(T*30/14,0,1))+B*clip(T*30/14,0,1)'");
    expect(f).toContain('[body][blend]concat=n=2:v=1:a=0[out]');
  });
});

describe('SSIM parsing', () => {
  it('reads per-frame All scores from a stats file', () => {
    const stats =
      'n:1 Y:0.921242 U:0.931545 V:0.905285 All:0.920300 (10.985394)\n' +
      'n:2 Y:0.927594 U:0.938318 V:0.912286 All:0.926830 (11.356685)\r\n';
    expect(parseSsimStats(stats)).toEqual([0.9203, 0.92683]);
  });

  it('reads the summary score from ffmpeg stderr', () => {
    const stderr =
      '[Parsed_ssim_4 @ 0000] SSIM Y:0.829 (7.67) U:0.84 (7.9) V:0.80 (7.0) All:0.825913 (7.61)\n';
    expect(parseSsimSummary(stderr)).toBeCloseTo(0.825913);
    expect(parseSsimSummary('no score here')).toBeUndefined();
  });
});

describe('judgeSeam', () => {
  // Real numbers from a testsrc2 clip: adjacent steps ~0.90–0.93.
  const adjacent = Array.from({ length: 20 }, (_, i) => 0.9 + (i % 4) * 0.01);

  it('calls a seam inside the clip’s normal range seamless', () => {
    expect(judgeSeam(0.919, adjacent).verdict).toBe('seamless');
  });

  it('calls a seam just below every normal step minor', () => {
    expect(judgeSeam(0.89, adjacent).verdict).toBe('minor');
  });

  it('calls an un-looped clip’s jump visible', () => {
    expect(judgeSeam(0.826, adjacent).verdict).toBe('visible');
  });

  it('judges against the clip, not an absolute bar: a fast clip can be seamless at 0.6', () => {
    expect(judgeSeam(0.6, [0.55, 0.6, 0.62, 0.58]).verdict).toBe('seamless');
  });

  it('refuses to judge with no adjacent frames', () => {
    expect(() => judgeSeam(0.9, [])).toThrow(/too short/);
  });

  it('describes the numbers', () => {
    expect(describeSeam(judgeSeam(0.826, adjacent))).toContain('visible jump');
  });
});

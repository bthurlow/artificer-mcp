/**
 * Pure planning and parsing helpers for `video_make_loop`.
 *
 * Everything here is frame-based, not time-based. A loop seam is a single
 * frame boundary, and float-second trims land a frame early or late, which
 * is exactly the stutter the tool exists to remove.
 */

/** Loop construction modes. `check` builds nothing, it only measures a seam. */
export type LoopMode = 'rebound' | 'crossfade';

/**
 * Upper bound on the frames `rebound` may hold in memory.
 *
 * FFmpeg's `reverse` filter buffers every frame of its input before it can
 * emit the first one. A 1080x1920 yuv420p frame is ~3.1 MB, so this allows
 * about 16s of 1080p source (one Canvas-length rebound is ≤ 4s of source).
 */
export const MAX_REVERSE_BYTES = 1.5 * 1024 ** 3;

export interface LoopPlanInput {
  mode: LoopMode;
  /** Exact decoded frame count of the source. */
  sourceFrames: number;
  frameRate: number;
  width: number;
  height: number;
  /** Crossfade length in seconds (crossfade mode). */
  crossfadeSeconds: number;
  maxDuration?: number;
  minDuration?: number;
}

export interface LoopPlan {
  /** Source frames actually used (after any max_duration trim). */
  usedFrames: number;
  /** Frames in one loop cycle. */
  loopFrames: number;
  /** Crossfade length in frames (crossfade mode only). */
  crossfadeFrames: number;
  /** How many times the loop cycle is played back-to-back (≥ 1). */
  cycles: number;
  /** Set when min_duration forced a total above max_duration. */
  warning?: string;
}

/** Rebound cycle length: forward, then reversed minus both turn-around frames. */
function reboundFrames(used: number): number {
  return 2 * used - 2;
}

/**
 * Work out which frames to use and how long the result will be.
 *
 * `max_duration` trims the *source* before the loop is built. Trimming the
 * finished loop instead would cut it mid-cycle and reintroduce a seam.
 * `min_duration` repeats whole cycles, which stay seamless by construction.
 */
export function planLoop(p: LoopPlanInput): LoopPlan {
  if (!Number.isFinite(p.sourceFrames) || p.sourceFrames <= 0) {
    throw new Error('Could not count the frames of the input video.');
  }
  if (!(p.frameRate > 0)) {
    throw new Error('Could not read the frame rate of the input video.');
  }
  if (p.minDuration !== undefined && p.maxDuration !== undefined && p.minDuration > p.maxDuration) {
    throw new Error(
      `min_duration (${p.minDuration}s) is greater than max_duration (${p.maxDuration}s).`,
    );
  }

  const maxFrames =
    p.maxDuration !== undefined ? Math.floor(p.maxDuration * p.frameRate + 1e-6) : undefined;

  let usedFrames = p.sourceFrames;
  let crossfadeFrames = 0;
  let loopFrames: number;

  if (p.mode === 'rebound') {
    if (maxFrames !== undefined) {
      // 2u - 2 <= maxFrames  →  u <= maxFrames / 2 + 1
      usedFrames = Math.min(usedFrames, Math.floor(maxFrames / 2) + 1);
    }
    if (usedFrames < 3) {
      throw new Error(
        `rebound needs at least 3 source frames; ${usedFrames} available${
          maxFrames !== undefined ? ' after applying max_duration' : ''
        }.`,
      );
    }
    const bytes = p.width * p.height * 1.5 * usedFrames;
    if (bytes > MAX_REVERSE_BYTES) {
      const mb = Math.round(bytes / 1024 ** 2);
      throw new Error(
        `rebound would buffer ~${mb} MB of frames in memory (FFmpeg's reverse filter holds the whole clip). ` +
          `Pass max_duration, or trim or downscale the input first.`,
      );
    }
    loopFrames = reboundFrames(usedFrames);
  } else {
    crossfadeFrames = Math.round(p.crossfadeSeconds * p.frameRate);
    if (crossfadeFrames < 2) {
      throw new Error(
        `crossfade_seconds (${p.crossfadeSeconds}s) is under 2 frames at ${p.frameRate.toFixed(2)} fps; use a longer crossfade.`,
      );
    }
    if (maxFrames !== undefined) {
      // loop = used - k <= maxFrames  →  used <= maxFrames + k
      usedFrames = Math.min(usedFrames, maxFrames + crossfadeFrames);
    }
    // Body needs at least one frame between head and tail.
    if (usedFrames < 2 * crossfadeFrames + 1) {
      throw new Error(
        `crossfade needs more than twice crossfade_seconds of source: ${usedFrames} frames available, ` +
          `${2 * crossfadeFrames + 1} needed. Shorten crossfade_seconds${
            p.maxDuration !== undefined ? ' or raise max_duration' : ''
          }.`,
      );
    }
    loopFrames = usedFrames - crossfadeFrames;
  }

  let cycles = 1;
  let warning: string | undefined;
  if (p.minDuration !== undefined) {
    const minFrames = Math.ceil(p.minDuration * p.frameRate - 1e-6);
    cycles = Math.max(1, Math.ceil(minFrames / loopFrames));
    if (maxFrames !== undefined && cycles * loopFrames > maxFrames) {
      warning =
        `Repeating whole cycles to reach min_duration gives ${(
          (cycles * loopFrames) /
          p.frameRate
        ).toFixed(2)}s, above max_duration. ` +
        'Kept the seamless length; trimming to max_duration would cut mid-cycle.';
    }
  }

  return { usedFrames, loopFrames, crossfadeFrames, cycles, warning };
}

/** Leading trim so max_duration limits the source before any loop work. */
function sourceTrim(plan: LoopPlan, sourceFrames: number): string {
  return plan.usedFrames < sourceFrames
    ? `trim=end_frame=${plan.usedFrames},setpts=PTS-STARTPTS,`
    : '';
}

/**
 * Rebound: play forward, then reversed with the first and last reversed
 * frames dropped. Without the drop, the turn-around frame and the wrap
 * frame each show twice, which reads as a stall at both ends.
 */
export function buildReboundFilter(plan: LoopPlan, sourceFrames: number): string {
  const u = plan.usedFrames;
  return (
    `[0:v]${sourceTrim(plan, sourceFrames)}split[fwd][rev];` +
    `[rev]reverse,trim=start_frame=1:end_frame=${u - 1},setpts=PTS-STARTPTS[back];` +
    `[fwd][back]concat=n=2:v=1:a=0[out]`
  );
}

/**
 * Crossfade: output = body + blend(tail → head).
 *
 * The loop starts at source frame k (right after the head), runs the body
 * to the tail, then blends the tail into the head so the last frame is
 * exactly head frame k-1, the frame just before where the loop starts.
 *
 * The weight uses the timestamp T, not the frame counter N. An N-based ramp
 * was measured peaking one frame early: the last frame kept a ghost of the
 * tail, and the seam scored below the source's own frame step. The same
 * happened with `xfade`, whose timing did not land on the final frame
 * either. A T-based ramp puts the clean head frame exactly last.
 */
export function buildCrossfadeFilter(
  plan: LoopPlan,
  sourceFrames: number,
  frameRate: number,
): string {
  const u = plan.usedFrames;
  const k = plan.crossfadeFrames;
  const w = `clip(T*${frameRate}/${k - 1},0,1)`;
  return (
    `[0:v]${sourceTrim(plan, sourceFrames)}split=3[s1][s2][s3];` +
    `[s1]trim=start_frame=${k}:end_frame=${u - k},setpts=PTS-STARTPTS[body];` +
    `[s2]trim=start_frame=${u - k},setpts=PTS-STARTPTS[tail];` +
    `[s3]trim=end_frame=${k},setpts=PTS-STARTPTS[head];` +
    `[tail][head]blend=all_expr='A*(1-${w})+B*${w}'[blend];` +
    `[body][blend]concat=n=2:v=1:a=0[out]`
  );
}

/** Parse an ssim `stats_file` into per-frame `All` scores (0..1). */
export function parseSsimStats(text: string): number[] {
  const scores: number[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /\bAll:([0-9.]+)/.exec(line);
    if (m) scores.push(Number(m[1]));
  }
  return scores;
}

/** Parse the `All:` score from an ssim filter's summary line on stderr. */
export function parseSsimSummary(stderr: string): number | undefined {
  const m = /SSIM .*\bAll:([0-9.]+)/.exec(stderr);
  return m ? Number(m[1]) : undefined;
}

export type SeamVerdict = 'seamless' | 'minor' | 'visible';

export interface SeamReport {
  verdict: SeamVerdict;
  /** SSIM of the last frame against the first (the wrap-around step). */
  seamSsim: number;
  /** Mean SSIM of each frame against the next, inside the clip. */
  typicalSsim: number;
  /** 10th-percentile adjacent SSIM: the low end of this clip's normal motion. */
  lowSsim: number;
}

/**
 * Judge a seam against the clip's own motion, not a fixed threshold.
 *
 * A seam is fine when the wrap-around step looks like an ordinary frame
 * step. Fast-moving footage has low adjacent SSIM everywhere, so an
 * absolute cutoff would fail every good action loop and pass bad static
 * ones.
 */
export function judgeSeam(seamSsim: number, adjacent: number[]): SeamReport {
  if (adjacent.length === 0) {
    throw new Error('Clip is too short to measure a seam (needs at least 2 frames).');
  }
  const sorted = [...adjacent].sort((a, b) => a - b);
  const lowSsim = sorted[Math.floor((sorted.length - 1) * 0.1)];
  const typicalSsim = adjacent.reduce((s, v) => s + v, 0) / adjacent.length;
  const minSsim = sorted[0];
  let verdict: SeamVerdict;
  if (seamSsim >= lowSsim) verdict = 'seamless';
  else if (seamSsim >= minSsim - 0.02) verdict = 'minor';
  else verdict = 'visible';
  return { verdict, seamSsim, typicalSsim, lowSsim };
}

/** One-line human summary of a seam report. */
export function describeSeam(r: SeamReport): string {
  const label = {
    seamless: 'seamless (the wrap looks like a normal frame step)',
    minor: 'minor seam (slightly larger than any frame step in the clip)',
    visible: 'visible jump at the seam',
  }[r.verdict];
  return `Seam: ${label}. seam SSIM ${r.seamSsim.toFixed(3)}, typical frame step ${r.typicalSsim.toFixed(
    3,
  )}, low end of normal ${r.lowSsim.toFixed(3)}.`;
}

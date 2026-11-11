import type { Edl } from './schema.js';

/**
 * Planning and filter-graph construction for `video_assemble_edl`. Pure:
 * clip durations and the beat grid come in through the context, so all of
 * it is unit-testable without ffmpeg.
 */

/** The beat grid used for snapping, already resolved from the EDL. */
export interface BeatSource {
  /** Beat times in song seconds, before `offset`. */
  beats: number[];
  kickRef?: number;
  /** Added to every beat (and kickRef) before snapping. */
  offset: number;
  beatsPerBar: number;
}

export type SnapMode = boolean | 'beat' | 'kick' | 'half';

/**
 * Nearest beat to t. "kick" keeps only downbeats (every beatsPerBar-th beat
 * counted from the one nearest kickRef); "half" adds the mid-bar beat. On
 * btmusic "Thought and Memory" the felt hit was a once-per-bar kick, and
 * snapping to any beat put half the cuts a beat early.
 */
export function snapTime(t: number, grid: BeatSource, mode: SnapMode): number {
  const beats = grid.beats.map((b) => b + grid.offset);
  if (beats.length === 0) throw new Error('no beats to snap to');
  let candidates = beats;
  if (mode === 'kick' || mode === 'half') {
    if (grid.kickRef === undefined) throw new Error(`snap "${mode}" needs kick_ref`);
    const ref = grid.kickRef + grid.offset;
    let i0 = 0;
    for (let i = 1; i < beats.length; i++) {
      if (Math.abs(beats[i] - ref) < Math.abs(beats[i0] - ref)) i0 = i;
    }
    const bpb = grid.beatsPerBar;
    const step = mode === 'kick' || bpb % 2 ? bpb : bpb / 2;
    candidates = beats.filter((_, i) => (((i - i0) % step) + step) % step === 0);
  }
  let best = candidates[0];
  for (const b of candidates) if (Math.abs(b - t) < Math.abs(best - t)) best = b;
  return best;
}

export interface PlannedShot {
  segment: number;
  index: number;
  clip: string;
  /** Song time the shot starts, after snapping. */
  songStart: number;
  /** The EDL's start when snapping moved it. */
  requestedStart?: number;
  /** First output frame and frame count. */
  outFrame: number;
  frames: number;
  /** First frame of the clip, on the output frame grid. */
  srcFrame: number;
  punch: number;
  fx: number;
  fy: number;
  transition: string;
}

export interface EdlPlan {
  width: number;
  height: number;
  fps: number;
  shots: PlannedShot[];
  segments: Array<[number, number]>;
  totalFrames: number;
  flash: { strength: number; duration: number };
}

export interface PlanContext {
  /** Clip length in seconds, or undefined if it could not be probed. */
  clipDuration: (clip: string) => number | undefined;
  audioDuration?: number;
  grid?: BeatSource;
}

const TRANSITIONS = new Set(['cut', 'flash']);
const fmt = (t: number): string => t.toFixed(3);

/**
 * Lay the EDL out on the output frame grid. Shot boundaries are rounded to
 * frames from the ABSOLUTE output timeline, so rounding never accumulates:
 * the prototype's time-based trims drifted ~0.2 s over 8 shots and slipped
 * lip-sync. Returns every problem found rather than stopping at the first.
 */
export function planEdl(edl: Edl, ctx: PlanContext): { plan: EdlPlan; errors: string[] } {
  const errors: string[] = [];
  const fps = edl.fps;
  const shots: PlannedShot[] = [];
  let outT = 0;

  edl.segments.forEach((seg, si) => {
    const [a, b] = seg.song;
    const where = `segment ${si}`;
    if (b <= a) {
      errors.push(`${where}: song range [${a}, ${b}] is empty.`);
      return;
    }
    if (ctx.audioDuration !== undefined && b > ctx.audioDuration + 0.01) {
      errors.push(
        `${where}: ends at ${b}s, past the end of the audio (${fmt(ctx.audioDuration)}s).`,
      );
    }

    const starts: number[] = [];
    seg.shots.forEach((sh, k) => {
      if (k === 0) {
        starts.push(a);
        return;
      }
      if (sh.start === undefined) {
        errors.push(`${where} shot ${k}: needs a start (only a segment's first shot may omit it).`);
        starts.push(NaN);
        return;
      }
      let t = sh.start;
      if (sh.snap) {
        if (!ctx.grid) {
          errors.push(`${where} shot ${k}: snap needs beat_grid or beats in the EDL.`);
        } else {
          try {
            t = snapTime(t, ctx.grid, sh.snap);
          } catch (err) {
            errors.push(`${where} shot ${k}: ${(err as Error).message}.`);
          }
        }
      }
      starts.push(t);
    });

    seg.shots.forEach((sh, k) => {
      const label = `${where} shot ${k} (${sh.clip})`;
      const s0 = starts[k];
      const s1 = k + 1 < seg.shots.length ? starts[k + 1] : b;
      if (!TRANSITIONS.has(sh.in)) {
        errors.push(`${label}: unknown transition "${sh.in}" (use "cut" or "flash").`);
      }
      if (Number.isNaN(s0)) return;
      const srcIn = s0 - sh.clip_song_start;
      if (srcIn < -0.5 / fps) {
        errors.push(
          `${label}: starts ${fmt(-srcIn)}s before its clip begins (start ${fmt(s0)}, clip_song_start ${sh.clip_song_start}).`,
        );
      }
      if (k > 0 && (s0 < a || s0 >= b)) {
        errors.push(`${label}: starts at ${fmt(s0)}, outside its segment [${a}, ${b}].`);
      }
      // The next shot's start is unknown (already reported): nothing more to place.
      if (Number.isNaN(s1)) return;
      const dur = s1 - s0;
      const f0 = Math.round(outT * fps);
      const f1 = Math.round((outT + dur) * fps);
      if (f1 - f0 <= 0) {
        errors.push(
          `${label}: lasts ${fmt(dur)}s (${fmt(s0)} to ${fmt(s1)}), under one frame. Check the shot order and snapping.`,
        );
      }
      const srcFrame = Math.max(0, Math.round(srcIn * fps));
      const clipLen = ctx.clipDuration(sh.clip);
      const needed = (srcFrame + Math.max(0, f1 - f0)) / fps;
      if (clipLen !== undefined && needed > clipLen + 0.5 / fps) {
        errors.push(
          `${label}: needs the clip up to ${fmt(needed)}s, but it is ${fmt(clipLen)}s long.`,
        );
      }
      shots.push({
        segment: si,
        index: k,
        clip: sh.clip,
        songStart: s0,
        ...(sh.start !== undefined && k > 0 && s0 !== sh.start ? { requestedStart: sh.start } : {}),
        outFrame: f0,
        frames: Math.max(0, f1 - f0),
        srcFrame,
        punch: sh.punch,
        fx: sh.fx,
        fy: sh.fy,
        transition: sh.in,
      });
      outT += dur;
    });
  });

  return {
    plan: {
      width: edl.width,
      height: edl.height,
      fps,
      shots,
      segments: edl.segments.map((s) => s.song),
      totalFrames: Math.round(outT * fps),
      flash: edl.flash,
    },
    errors,
  };
}

export interface GraphInput {
  /** Options placed before this input's -i. */
  options: string[];
  path: string;
}

export interface FilterGraph {
  inputs: GraphInput[];
  filter: string;
  video: string;
  audio: string;
}

/**
 * Crop for a static punch-in, in pixels of the W×H frame: a (W/z)×(H/z)
 * window centred on (fx, fy), clamped inside the frame, then scaled back up.
 */
export function punchCrop(
  plan: Pick<EdlPlan, 'width' | 'height'>,
  shot: Pick<PlannedShot, 'punch' | 'fx' | 'fy'>,
): string {
  if (shot.punch === 1) return '';
  const { width: W, height: H } = plan;
  // Rounded the way ffmpeg's crop evaluates the prototype's expressions
  // (size truncated, position rounded), so a render is frame-identical to it.
  const w = W / shot.punch;
  const h = H / shot.punch;
  const x = Math.round(Math.min(Math.max(0, shot.fx * W - w / 2), W - w));
  const y = Math.round(Math.min(Math.max(0, shot.fy * H - h / 2), H - h));
  return `crop=${Math.floor(w)}:${Math.floor(h)}:${x}:${y},scale=${W}:${H},`;
}

/**
 * Every shot is tagged BT.709 limited range (metadata only, no pixel change).
 * Generated clips arrive mixed: Kling tags bt709/tv, Omni and Veo leave it
 * unset. ffmpeg 7+ converts where differently tagged frames meet, so in a
 * batched render a whole batch was colour-converted in the join because its
 * first clip was tagged. One tag set for all keeps every pass identical.
 */
const COLOR_TAGS = 'setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709';

/** Seconds of clip decoded before a shot's in-point, so the frame-rate conversion settles. */
const SEEK_MARGIN_SECONDS = 1;

/**
 * Most shots rendered in one ffmpeg pass. Each shot is its own input (see
 * shotChains), and every open input holds a decoder: a 120-shot 1080p test
 * peaked at 4 GB. Longer EDLs render in batches of this many shots to
 * lossless intermediates, then a join pass (that test then peaked at 1.8 GB).
 * `ARTIFICER_EDL_SHOTS_PER_PASS` overrides it (lower on a small machine).
 */
export const MAX_SHOTS_PER_PASS = 24;

export function shotsPerPass(): number {
  const n = Number(process.env['ARTIFICER_EDL_SHOTS_PER_PASS']);
  return Number.isInteger(n) && n >= 1 ? n : MAX_SHOTS_PER_PASS;
}

/** The 10 ms-faded song ranges, joined: input `audioInput`, output [aout]. */
function audioChain(plan: EdlPlan, audioInput: number): string[] {
  const filters: string[] = [];
  const n = plan.segments.length;
  if (n > 1) {
    filters.push(`[${audioInput}:a]asplit=${n}${plan.segments.map((_, i) => `[as${i}]`).join('')}`);
  }
  plan.segments.forEach(([a, b], i) => {
    const src = n > 1 ? `[as${i}]` : `[${audioInput}:a]`;
    // 10 ms fades so a splice between song sections does not click.
    filters.push(
      `${src}atrim=start=${a.toFixed(4)}:end=${b.toFixed(4)},asetpts=PTS-STARTPTS,` +
        `afade=t=in:d=0.01,afade=t=out:st=${Math.max(0, b - a - 0.01).toFixed(4)}:d=0.01[a${i}]`,
    );
  });
  filters.push(`${plan.segments.map((_, i) => `[a${i}]`).join('')}concat=n=${n}:v=0:a=1[aout]`);
  return filters;
}

/**
 * One input per shot, seeked to just before its in-point, trimmed to its
 * frames on the output grid, scaled, cropped and punched in, then joined into
 * `out`. Opening a clip once and `split`ting it would queue every decoded
 * frame of the later shots in memory while concat plays the earlier ones.
 */
function shotChains(
  plan: EdlPlan,
  shots: PlannedShot[],
  clipPath: (clip: string) => string,
  firstInput: number,
  out: string,
): { inputs: GraphInput[]; filters: string[] } {
  const { width: W, height: H, fps } = plan;
  const inputs: GraphInput[] = [];
  const filters: string[] = [];
  shots.forEach((shot, n) => {
    const seekFrames = Math.max(0, shot.srcFrame - Math.round(fps * SEEK_MARGIN_SECONDS));
    // Two decoder threads per input keeps many open inputs affordable.
    const options = ['-threads', '2'];
    // Seeking to a whole output frame keeps the fps filter's grid on the
    // unseeked one: output slot k after the seek is slot seekFrames + k.
    if (seekFrames > 0) options.push('-ss', (seekFrames / fps).toFixed(6));
    inputs.push({ options, path: clipPath(shot.clip) });
    // Trim by PTS, not start_frame. The fps filter's output timebase is
    // 1/fps, so output slot k has pts k exactly. After a seek it can start
    // emitting at slot 1 instead of 0 (a 25 fps source whose frame just
    // before the seek point was dropped), and start_frame counts emitted
    // frames: that put every seeked shot a frame off in the parity test
    // against the prototype. Seconds-based start/end round at half a frame.
    const sf = shot.srcFrame - seekFrames;
    filters.push(
      `[${firstInput + n}:v]fps=${fps},trim=start_pts=${sf}:end_pts=${sf + shot.frames},setpts=PTS-STARTPTS,` +
        `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},` +
        `${punchCrop(plan, shot)}setsar=1,format=yuv420p,${COLOR_TAGS}[v${n}]`,
    );
  });
  filters.push(`${shots.map((_, n) => `[v${n}]`).join('')}concat=n=${shots.length}:v=1:a=0${out}`);
  return { inputs, filters };
}

/** The "flash" transitions over the joined picture, from [base] to [vout]. */
function flashChain(plan: EdlPlan): string {
  const flashes = plan.shots.filter((s) => s.transition === 'flash' && s.outFrame > 0);
  if (flashes.length === 0) return '[base]null[vout]';
  const { strength, duration } = plan.flash;
  // Time from the frame number (n / fps), not `t`: batch intermediates store
  // millisecond timestamps, and t = 5.708 for frame 137 missed a flash
  // starting at 5.7083.
  const now = `n/${plan.fps}`;
  const terms = flashes.map((s) => {
    const t = (s.outFrame / plan.fps).toFixed(4);
    return `if(between(${now}\\,${t}\\,${t}+${duration})\\,${strength}*(1-(${now}-${t})/${duration})\\,0)`;
  });
  return `[base]eq=brightness=${terms.join('+')}:eval=frame[vout]`;
}

/** Single pass: input 0 is the audio, then one input per shot. */
export function buildFilterGraph(
  plan: EdlPlan,
  paths: { audio: string; clip: (clip: string) => string },
): FilterGraph {
  const shots = shotChains(plan, plan.shots, paths.clip, 1, '[base]');
  return {
    inputs: [{ options: [], path: paths.audio }, ...shots.inputs],
    filter: [...audioChain(plan, 0), ...shots.filters, flashChain(plan)].join(';\n'),
    video: '[vout]',
    audio: '[aout]',
  };
}

/** Batched pass 1: one video-only graph per batch of at most `maxShots` shots. */
export function buildBatchGraphs(
  plan: EdlPlan,
  clipPath: (clip: string) => string,
  maxShots = shotsPerPass(),
): Array<Omit<FilterGraph, 'audio'> & { frames: number }> {
  const graphs: Array<Omit<FilterGraph, 'audio'> & { frames: number }> = [];
  for (let i = 0; i < plan.shots.length; i += maxShots) {
    const batch = plan.shots.slice(i, i + maxShots);
    const { inputs, filters } = shotChains(plan, batch, clipPath, 0, '[vout]');
    graphs.push({
      inputs,
      filter: filters.join(';\n'),
      video: '[vout]',
      frames: batch.reduce((sum, s) => sum + s.frames, 0),
    });
  }
  return graphs;
}

/** Batched pass 2: input 0 is the audio, then the batch files in order. */
export function buildJoinGraph(plan: EdlPlan, audio: string, batches: string[]): FilterGraph {
  const inputs: GraphInput[] = [
    { options: [], path: audio },
    ...batches.map((path) => ({ options: [], path })),
  ];
  const join = `${batches.map((_, i) => `[${i + 1}:v]`).join('')}concat=n=${batches.length}:v=1:a=0[base]`;
  return {
    inputs,
    filter: [...audioChain(plan, 0), join, flashChain(plan)].join(';\n'),
    video: '[vout]',
    audio: '[aout]',
  };
}

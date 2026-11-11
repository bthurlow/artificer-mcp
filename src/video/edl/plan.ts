import type { Edl, EdlFx } from './schema.js';

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

/**
 * An element placed over a cut. Times follow the prototype: element time
 * `elIn` appears at output time `delay`, so the element's peak lands on
 * the cut, starting no earlier than `max_lead` before it.
 */
export interface PlannedEffect {
  name: string;
  /** Output frame of the cut. */
  outFrame: number;
  fx: EdlFx;
  /** Element seconds skipped at its start. */
  elIn: number;
  /** Output seconds before the element appears. */
  delay: number;
  /** Seconds from the element's first shown frame to its peak. */
  toPeak: number;
  /** For a sweep: the wipe window, with both shots re-timed to cover it. */
  sweep?: PlannedSweep;
}

/**
 * A sweep's window: `frames` output frames from `startFrame`, centred on
 * the cut. `from` and `to` are the outgoing and incoming shots re-timed to
 * the window, so both keep playing in song sync through it. Their source
 * frames count on from the shots' own, so the window's first frame is the
 * outgoing shot's frame exactly and its last is the incoming shot's.
 */
export interface PlannedSweep {
  startFrame: number;
  frames: number;
  from: PlannedShot;
  to: PlannedShot;
}

export interface EdlPlan {
  width: number;
  height: number;
  fps: number;
  shots: PlannedShot[];
  segments: Array<[number, number]>;
  totalFrames: number;
  flash: { strength: number; duration: number };
  effects: PlannedEffect[];
}

export interface PlanContext {
  /** Clip length in seconds, or undefined if it could not be probed. */
  clipDuration: (clip: string) => number | undefined;
  audioDuration?: number;
  grid?: BeatSource;
}

const BUILT_IN_TRANSITIONS = new Set(['cut', 'flash']);

/** A grade is spliced into the graph, so it must stay one filter chain. */
const GRADE_FORBIDDEN = /[;[\]]/;
/** A sweep's element is a still, looped by the image demuxer. */
const STILL_IMAGE = /\.(png|jpe?g|webp|bmp|tiff?)$/i;
const fmt = (t: number): string => t.toFixed(3);

/**
 * The window of a sweep into `to`, or the problem with it. The window is
 * `dur` centred on the cut (rounded as the prototype did) and must stay
 * inside the segment; the outgoing clip must run to its end and the
 * incoming clip must already have started at its beginning.
 */
function planSweep(
  fx: EdlFx,
  from: PlannedShot,
  to: PlannedShot,
  where: {
    segFirstFrame: number;
    segEndFrame: number;
    fps: number;
    ctx: PlanContext;
    label: string;
  },
): PlannedSweep | string {
  const { fps, ctx, label } = where;
  const frames = Math.round(fx.dur * fps);
  const startFrame = Math.round(to.outFrame - (fx.dur * fps) / 2);
  if (startFrame < where.segFirstFrame || startFrame + frames > where.segEndFrame) {
    return `${label}: the ${fx.dur}s sweep window (output ${fmt(startFrame / fps)} to ${fmt((startFrame + frames) / fps)}s) runs outside its segment; shorten dur.`;
  }
  const retime = (shot: PlannedShot): PlannedShot => ({
    ...shot,
    outFrame: startFrame,
    frames,
    srcFrame: shot.srcFrame + (startFrame - shot.outFrame),
  });
  const a = retime(from);
  const b = retime(to);
  if (b.srcFrame < 0) {
    return `${label}: the sweep starts ${fmt(-b.srcFrame / fps)}s before ${to.clip} begins; shorten dur or start the clip earlier.`;
  }
  const fromLen = ctx.clipDuration(from.clip);
  const needed = (a.srcFrame + frames) / fps;
  if (fromLen !== undefined && needed > fromLen + 0.5 / fps) {
    return `${label}: the sweep plays ${from.clip} up to ${fmt(needed)}s, but it is ${fmt(fromLen)}s long; shorten dur.`;
  }
  return { startFrame, frames, from: a, to: b };
}

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
  const effects: PlannedEffect[] = [];
  let outT = 0;

  const fxNames = Object.keys(edl.fx);
  for (const [name, fx] of Object.entries(edl.fx)) {
    if (fx.type === 'sweep') {
      if (!STILL_IMAGE.test(fx.src)) {
        errors.push(
          `fx "${name}": a sweep's src must be a still image (png, jpg, webp, bmp or tif), not ${fx.src}.`,
        );
      }
      if (Math.round(fx.dur * fps) < 2) {
        errors.push(`fx "${name}": dur ${fx.dur}s is under two frames at ${fps} fps.`);
      }
    } else if (fx.peak === undefined) {
      errors.push(
        `fx "${name}": an overlay needs a peak (the element second that lands on the cut).`,
      );
    }
    if (fx.grade && GRADE_FORBIDDEN.test(fx.grade)) {
      errors.push(`fx "${name}": grade must be a plain filter chain (no ";", "[" or "]").`);
    }
    if (fx.hi <= fx.lo) errors.push(`fx "${name}": hi (${fx.hi}) must be above lo (${fx.lo}).`);
    const len = fx.type === 'sweep' ? undefined : ctx.clipDuration(fx.src);
    if (len !== undefined && fx.peak !== undefined && fx.peak > len) {
      errors.push(`fx "${name}": peak ${fx.peak}s is past the end of ${fx.src} (${fmt(len)}s).`);
    }
  }

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

    // The segment's output frames, which a sweep's window must stay inside.
    const segFirstFrame = Math.round(outT * fps);
    const segEndFrame = Math.round((outT + b - a) * fps);
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
      const isFx = !BUILT_IN_TRANSITIONS.has(sh.in);
      if (isFx && !(sh.in in edl.fx)) {
        errors.push(
          `${label}: unknown transition "${sh.in}" (use "cut", "flash"${fxNames.length ? ` or an fx: ${fxNames.join(', ')}` : ' or define it under fx'}).`,
        );
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
      const shot: PlannedShot = {
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
      };
      shots.push(shot);
      const fx = edl.fx[sh.in];
      if (isFx && fx?.type === 'sweep') {
        const prev = shots.at(-2);
        if (k === 0 || prev?.segment !== si || prev.index !== k - 1) {
          errors.push(
            `${label}: a sweep wipes from the previous shot in the same segment (across a segment boundary the audio jumps).`,
          );
        } else {
          const sweep = planSweep(fx, prev, shot, { segFirstFrame, segEndFrame, fps, ctx, label });
          if (typeof sweep === 'string') errors.push(sweep);
          else effects.push({ name: sh.in, outFrame: f0, fx, elIn: 0, delay: 0, toPeak: 0, sweep });
        }
      } else if (isFx && fx?.peak !== undefined) {
        const t = f0 / fps;
        const elIn = Math.max(0, fx.peak - t, fx.peak - (fx.max_lead ?? Infinity));
        effects.push({
          name: sh.in,
          outFrame: f0,
          fx,
          elIn,
          delay: t - (fx.peak - elIn),
          toPeak: fx.peak - elIn,
        });
      }
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
      effects,
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
  const inputs: GraphInput[] = [];
  const filters: string[] = [];
  shots.forEach((shot, n) => {
    const chain = shotChain(plan, shot, clipPath, firstInput + n);
    inputs.push(chain.input);
    filters.push(`${chain.filter}[v${n}]`);
  });
  filters.push(`${shots.map((_, n) => `[v${n}]`).join('')}concat=n=${shots.length}:v=1:a=0${out}`);
  return { inputs, filters };
}

/** One shot's input and its filter chain (unlabelled output, yuv420p). */
function shotChain(
  plan: EdlPlan,
  shot: PlannedShot,
  clipPath: (clip: string) => string,
  inputIndex: number,
): { input: GraphInput; filter: string } {
  const { width: W, height: H, fps } = plan;
  const seekFrames = Math.max(0, shot.srcFrame - Math.round(fps * SEEK_MARGIN_SECONDS));
  // Two decoder threads per input keeps many open inputs affordable.
  const options = ['-threads', '2'];
  // Seeking to a whole output frame keeps the fps filter's grid on the
  // unseeked one: output slot k after the seek is slot seekFrames + k.
  if (seekFrames > 0) options.push('-ss', (seekFrames / fps).toFixed(6));
  // Trim by PTS, not start_frame. The fps filter's output timebase is
  // 1/fps, so output slot k has pts k exactly. After a seek it can start
  // emitting at slot 1 instead of 0 (a 25 fps source whose frame just
  // before the seek point was dropped), and start_frame counts emitted
  // frames: that put every seeked shot a frame off in the parity test
  // against the prototype. Seconds-based start/end round at half a frame.
  const sf = shot.srcFrame - seekFrames;
  return {
    input: { options, path: clipPath(shot.clip) },
    filter:
      `[${inputIndex}:v]fps=${fps},trim=start_pts=${sf}:end_pts=${sf + shot.frames},setpts=PTS-STARTPTS,` +
      `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},` +
      `${punchCrop(plan, shot)}setsar=1,format=yuv420p,${COLOR_TAGS}`,
  };
}

/** The "flash" transitions over the joined picture, from [base] to `out`. */
function flashChain(plan: EdlPlan, out: string): string {
  const flashes = plan.shots.filter((s) => s.transition === 'flash' && s.outFrame > 0);
  if (flashes.length === 0) return `[base]null${out}`;
  const { strength, duration } = plan.flash;
  // Time from the frame number (n / fps), not `t`: batch intermediates store
  // millisecond timestamps, and t = 5.708 for frame 137 missed a flash
  // starting at 5.7083.
  const now = `n/${plan.fps}`;
  const terms = flashes.map((s) => {
    const t = (s.outFrame / plan.fps).toFixed(4);
    return `if(between(${now}\\,${t}\\,${t}+${duration})\\,${strength}*(1-(${now}-${t})/${duration})\\,0)`;
  });
  return `[base]eq=brightness=${terms.join('+')}:eval=frame${out}`;
}

/**
 * One element stream, padded to the whole timeline so its peak lands on the
 * cut: the prototype's element chain, with the zoom crop computed like the
 * punch-in. Pad colour is the blend's neutral (black, or white for
 * multiply-like and dark mattes), so outside its window it changes nothing.
 */
function elementChain(plan: EdlPlan, e: PlannedEffect, input: number, out: string): string {
  const { width: W, height: H, fps } = plan;
  const { fx } = e;
  const pad = ['multiply', 'darken', 'matte_dark'].includes(fx.mode) ? 'white' : 'black';
  const speed =
    fx.post_speed !== 1
      ? `setpts=if(lt(T\\,${e.toPeak.toFixed(4)})\\,PTS\\,(${e.toPeak.toFixed(4)}+(T-${e.toPeak.toFixed(4)})/${fx.post_speed})/TB),`
      : '';
  let tail = '';
  if (fx.tail !== undefined) {
    const len = e.toPeak + fx.tail;
    tail = `trim=duration=${len.toFixed(4)},fade=t=out:st=${Math.max(0, len - 0.25).toFixed(4)}:d=0.25:color=${pad},`;
  }
  const zoom = punchCrop(plan, { punch: fx.zoom, fx: fx.cx, fy: fx.cy });
  // Padded and cut in FRAMES to exactly the timeline's length. The
  // prototype's trim=duration came out a frame short, and with shortest=1 on
  // the blend then dropped the video's last frame.
  return (
    `[${input}:v]trim=start=${e.elIn.toFixed(4)},setpts=PTS-STARTPTS,${speed}${tail}` +
    `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${zoom}fps=${fps},setsar=1,format=gbrp,` +
    `tpad=start=${Math.round(e.delay * fps)}:start_mode=add:color=${pad}:` +
    `stop=${plan.totalFrames}:stop_mode=add:color=${pad},trim=end_frame=${plan.totalFrames}${out}`
  );
}

/**
 * A sweep's window, as [sw<n>] in gbrp, padded so its frames sit at their
 * output frame numbers: the two shots, in song sync, split at the edge
 * (incoming on the left), with the still matted over the edge. The still
 * is dark on white, so its alpha is inverted luma through the lo..hi ramp.
 *
 * The edge and the still share one smoothstep progress, q = frame/(frames-1),
 * so the first frame is all outgoing shot and the last all incoming. The
 * prototype timed the still by `dur` and the reveal by whole frames, so the
 * still drifted up to ~20 px off the edge it covers at 1080p.
 */
function sweepChain(
  plan: EdlPlan,
  sweep: PlannedSweep,
  fx: EdlFx,
  n: number,
  clipPath: (clip: string) => string,
  firstInput: number,
): { inputs: GraphInput[]; filters: string[] } {
  const { width: W, height: H, fps } = plan;
  const from = shotChain(plan, sweep.from, clipPath, firstInput);
  const to = shotChain(plan, sweep.to, clipPath, firstInput + 1);
  // Read twice, like a matte element: a split shared buffers with the colour copy.
  const still = {
    options: ['-loop', '1', '-t', (sweep.frames / fps + 0.5).toFixed(3)],
    path: clipPath(fx.src),
  };
  const [ic, ia] = [firstInput + 2, firstInput + 3];
  const flip = fx.hflip ? 'hflip,' : '';
  const size = `scale=-2:${Math.round(H * fx.scale)},fps=${fps}`;
  const blur = fx.blur ? `,avgblur=sizeX=${fx.blur}:sizeY=1` : '';
  const grade = fx.grade ? `,${fx.grade}` : '';
  // The window's own frame number, from its timestamps (they start at 0 on
  // the 1/fps grid). Not N/n: in these two-input filters the count read 1
  // on the first frame, which put the still a frame ahead.
  const edge = (time: string): string => {
    const q = `min(1\\,max(0\\,round(${time}*${fps})/${sweep.frames - 1}))`;
    return `(-${fx.margin_px}+${W + 2 * fx.margin_px}*${q}*${q}*(3-2*${q}))`;
  };
  return {
    inputs: [from.input, to.input, still, still],
    filters: [
      `${from.filter},format=gbrp[sa${n}]`,
      `${to.filter},format=gbrp[sb${n}]`,
      `[sa${n}][sb${n}]blend=all_expr=if(lt(X\\,${edge('T')})\\,B\\,A)[sx${n}]`,
      `[${ic}:v]${flip}${size},format=rgba${grade}${blur}[wc${n}]`,
      `[${ia}:v]${flip}${size},format=gray,negate,lut=y=clip((val-${fx.lo})*255/(${fx.hi}-${fx.lo})\\,0\\,255)${blur}[wa${n}]`,
      `[wc${n}][wa${n}]alphamerge[wo${n}]`,
      `[sx${n}][wo${n}]overlay=x=${edge('t')}-overlay_w/2:y=(main_h-overlay_h)/2:format=gbrp:shortest=1,` +
        `tpad=start=${sweep.startFrame}:start_mode=add[sw${n}]`,
    ],
  };
}

/**
 * Everything after the shots are joined, from [base] to [vout]: flashes,
 * then each element in cut order. Elements composite in planar RGB (blending
 * in YUV tinted everything green in the prototype), converted once for the
 * whole chain; the prototype converted to RGB and back for every element.
 * Each element adds an input (two for a matte: reading the file twice keeps
 * the matte from sharing buffers with, and tinting, the colour copy).
 */
function finishChain(
  plan: EdlPlan,
  firstInput: number,
  clipPath: (clip: string) => string,
): { inputs: GraphInput[]; filters: string[] } {
  if (plan.effects.length === 0) return { inputs: [], filters: [flashChain(plan, '[vout]')] };
  const inputs: GraphInput[] = [];
  const filters = [flashChain(plan, '[fl]'), '[fl]format=gbrp[c0]'];
  const addInput = (path: string): number => {
    inputs.push({ options: ['-threads', '2'], path });
    return firstInput + inputs.length - 1;
  };
  plan.effects.forEach((e, n) => {
    const { fx } = e;
    const grade = fx.grade ? `,${fx.grade}` : '';
    if (e.sweep) {
      const win = sweepChain(plan, e.sweep, fx, n, clipPath, firstInput + inputs.length);
      inputs.push(...win.inputs);
      filters.push(
        ...win.filters,
        // Only the window's frames are composited; outside it the picture
        // passes through untouched. Gated by time with half a frame either
        // side: the joined picture's timestamps are microseconds, and the
        // frame count is off by one here too (see sweepChain).
        `[c${n}][sw${n}]overlay=format=gbrp:eof_action=pass:` +
          `enable=between(t\\,${((e.sweep.startFrame - 0.5) / plan.fps).toFixed(6)}\\,${((e.sweep.startFrame + e.sweep.frames - 0.5) / plan.fps).toFixed(6)})[c${n + 1}]`,
      );
      return;
    }
    filters.push(elementChain(plan, e, addInput(clipPath(fx.src)), `[e${n}]`));
    if (fx.mode === 'matte_dark' || fx.mode === 'matte_light') {
      filters.push(elementChain(plan, e, addInput(clipPath(fx.src)), `[em${n}]`));
      const negate = fx.mode === 'matte_dark' ? 'negate,' : '';
      filters.push(
        `[em${n}]format=gray,${negate}lut=y=clip((val-${fx.lo})*255/(${fx.hi}-${fx.lo})\\,0\\,255)[ea${n}]`,
        `[e${n}]format=rgba${grade}[er${n}]`,
        `[er${n}][ea${n}]alphamerge[eo${n}]`,
        `[c${n}][eo${n}]overlay=format=gbrp[c${n + 1}]`,
      );
    } else {
      const graded = grade ? `[e${n}]format=gbrp${grade},format=gbrp[eg${n}]` : '';
      if (graded) filters.push(graded);
      filters.push(`[c${n}][${graded ? `eg${n}` : `e${n}`}]blend=all_mode=${fx.mode}[c${n + 1}]`);
    }
  });
  filters.push(`[c${plan.effects.length}]format=yuv420p,${COLOR_TAGS}[vout]`);
  return { inputs, filters };
}

/** Single pass: input 0 is the audio, then one input per shot. */
export function buildFilterGraph(
  plan: EdlPlan,
  paths: { audio: string; clip: (clip: string) => string },
): FilterGraph {
  const shots = shotChains(plan, plan.shots, paths.clip, 1, '[base]');
  const finish = finishChain(plan, 1 + shots.inputs.length, paths.clip);
  return {
    inputs: [{ options: [], path: paths.audio }, ...shots.inputs, ...finish.inputs],
    filter: [...audioChain(plan, 0), ...shots.filters, ...finish.filters].join(';\n'),
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

/** Batched pass 2: input 0 is the audio, then the batch files in order, then elements. */
export function buildJoinGraph(
  plan: EdlPlan,
  audio: string,
  batches: string[],
  clipPath: (clip: string) => string,
): FilterGraph {
  const inputs: GraphInput[] = [
    { options: [], path: audio },
    ...batches.map((path) => ({ options: [], path })),
  ];
  // fps= puts the batch files' millisecond timestamps back on the exact
  // frame grid (each is within half a frame, so nothing is dropped or
  // doubled). Off-grid, an element blend's frame sync emitted an extra frame.
  const join = `${batches.map((_, i) => `[${i + 1}:v]`).join('')}concat=n=${batches.length}:v=1:a=0,fps=${plan.fps}[base]`;
  const finish = finishChain(plan, inputs.length, clipPath);
  inputs.push(...finish.inputs);
  return {
    inputs,
    filter: [...audioChain(plan, 0), join, ...finish.filters].join(';\n'),
    video: '[vout]',
    audio: '[aout]',
  };
}

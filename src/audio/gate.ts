/**
 * Gain envelope for `audio_gate` (TODO #35): keep the given time windows of
 * a track and silence the rest, without moving or resampling anything.
 *
 * Built for per-singer stems of a duet. A male/female separator routes the
 * odd line into the wrong stem at full level (btmusic t06: a last female
 * line landed in the male stem), and lip-sync models mouth whatever is in
 * their audio, so each singer's stem is gated to that singer's own lines.
 *
 * Each window ramps from 0 to 1 over `fade` seconds BEFORE its start and
 * back down over `fade` seconds AFTER its end, so the kept audio is
 * untouched (a singer's onset is not softened) and the edges do not click.
 */

export type GateWindow = [number, number];

/** Problems with the windows, in order; empty if they are usable. */
export function checkWindows(windows: GateWindow[]): string[] {
  const errors: string[] = [];
  windows.forEach(([a, b], i) => {
    if (!(b > a)) errors.push(`window ${i} [${a}, ${b}]: end must be after start.`);
    if (a < 0) errors.push(`window ${i} [${a}, ${b}]: start must not be negative.`);
  });
  return errors;
}

/**
 * Sorted, with windows whose ramps would meet (gap under two fades) merged
 * into one, so the gain never dips between them and at most one window is
 * active at any time.
 */
export function mergeWindows(windows: GateWindow[], fadeSeconds: number): GateWindow[] {
  const sorted = [...windows].sort((x, y) => x[0] - y[0]);
  const merged: GateWindow[] = [];
  for (const [a, b] of sorted) {
    const last = merged.at(-1);
    if (last && a - fadeSeconds <= last[1] + fadeSeconds) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  return merged;
}

const num = (x: number): string => Number(x.toFixed(6)).toString();

/**
 * The gain at time `t` as an ffmpeg expression, with commas escaped for a
 * filter graph. The windows are searched as a binary tree of `if(lt(t,…))`
 * split halfway between neighbours, so each sample evaluates about log2(n)
 * comparisons and one window's trapezoid. Summing every window per sample
 * took 2 minutes on a 4-minute stereo track with 40 windows.
 */
export function gateGain(windows: GateWindow[], fadeSeconds: number): string {
  const w = mergeWindows(windows, fadeSeconds);
  if (w.length === 0) return '0';
  const one = ([a, b]: GateWindow): string =>
    fadeSeconds > 0
      ? `clip(min(t-${num(a)}\\,${num(b)}-t)/${num(fadeSeconds)}+1\\,0\\,1)`
      : `between(t\\,${num(a)}\\,${num(b)})`;
  const tree = (lo: number, hi: number): string => {
    if (lo === hi) return one(w[lo]);
    const mid = (lo + hi) >> 1;
    const split = (w[mid][1] + w[mid + 1][0]) / 2;
    return `if(lt(t\\,${num(split)})\\,${tree(lo, mid)}\\,${tree(mid + 1, hi)})`;
  };
  return tree(0, w.length - 1);
}

/** The whole `-af` filter: every channel times the gain, per sample. */
export function gateFilter(windows: GateWindow[], fadeSeconds: number): string {
  return `aeval=exprs=val(ch)*${gateGain(windows, fadeSeconds)}:channel_layout=same`;
}

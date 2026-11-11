import { bandEnvelope, hann, melSpectrogram, onsetStrength, type Envelope } from './dsp.js';

/**
 * Beat grid with accent analysis (TODO #34).
 *
 * Beat times alone are not enough to cut to music: on btmusic "Thought and
 * Memory" a once-per-bar kick/808 is ~5x stronger than the other beats, and
 * cuts snapped to arbitrary beats landed a beat early half the time. So on
 * top of a librosa-style beat tracker this measures kick and snare energy at
 * every beat, finds which bar position carries the kick (`kick_phase`), and
 * measures how far the grid sits from the actual kick peaks (`offset_s`).
 *
 * Pipeline: mel spectrogram → spectral-flux onset envelope (median across
 * bands) → tempo by windowed autocorrelation with a log-normal prior → Ellis
 * dynamic-programming beat tracker → per-beat band peaks and kick attacks
 * from 2 ms band envelopes.
 *
 * The beat stage uses librosa `beat_track`'s own defaults (hop 512, median
 * aggregation, no HPSS). On Thought and Memory that matched librosa on 377
 * of 378 beats within 50 ms; hop 256, mean aggregation or HPSS each let the
 * tracker drift onto a syncopated figure for ~18 s, which corrupts the
 * bar phase.
 */

export const ANALYSIS_SR = 22_050;
const N_FFT = 2048;
const HOP = 512;

export interface BeatGridOptions {
  /** Seconds added to every reported time (the analysed window's start). */
  timeOffset?: number;
  beatsPerBar?: number;
  /** Centre of the tempo prior. With it, the prior is narrower (fixes octave errors). */
  bpmHint?: number;
}

export interface PhaseTable {
  /** Mean band energy per bar position, scaled so the strongest is 1. */
  relative: number[];
  /** Strongest position ÷ mean of the others; ~1 means no accent pattern. */
  contrast: number;
  strongest: number;
}

export interface BeatGridSection {
  start: number;
  end: number;
  /** null where the kick has no clear bar position (drumless intro, breakdown). */
  kick_phase: number | null;
  contrast: number;
}

export interface BeatGrid {
  tempo_bpm: number;
  beat_period_s: number;
  beats_per_bar: number;
  beats: number[];
  /** Index (mod beats_per_bar) of the bar position with the strongest kick. */
  kick_phase: number;
  downbeats: number[];
  /** Downbeats plus the beat halfway between them. */
  half_bar: number[];
  /** Median of (kick attack − grid beat) over downbeats; add to a beat to land on the hit. */
  offset_s: number;
  /** First downbeat with a clear kick (grid time; add offset_s for the hit). */
  kick_ref: number | null;
  phase_strength: { kick: PhaseTable; snare: PhaseTable };
  sections: BeatGridSection[];
  /** Per-beat peak band energy, scaled 0..1 per band. */
  beat_energy: { kick: number[]; snare: number[] };
}

const KICK_BAND: [number, number] = [40, 120];
const SNARE_BAND: [number, number] = [1500, 5000];

const round = (x: number, d = 3): number => Math.round(x * 10 ** d) / 10 ** d;

function median(xs: ArrayLike<number>): number {
  const a = Array.from(xs).sort((p, q) => p - q);
  if (a.length === 0) return 0;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

/**
 * Tempo by windowed autocorrelation of the onset envelope (librosa
 * `feature.tempo`): 8 s Hann windows, each normalised by its lag-0 value,
 * averaged; then argmax of log1p(1e6·ac) plus a log-normal prior on BPM,
 * refined to a fractional lag by parabolic interpolation.
 */
export function estimateTempo(onset: Float32Array, frameRate: number, bpmHint?: number): number {
  const win = Math.round(8 * frameRate);
  const minLag = Math.max(1, Math.floor((60 * frameRate) / 320));
  const maxLag = Math.min(win - 1, Math.ceil((60 * frameRate) / 30));
  const ac = new Float64Array(maxLag + 2);
  const w = hann(win);
  const seg = new Float64Array(win);
  const stride = Math.max(1, Math.round(frameRate)); // one window per second
  let windows = 0;
  for (let c = 0; c < onset.length; c += stride) {
    const s0 = c - (win >> 1);
    for (let i = 0; i < win; i++) {
      const j = s0 + i;
      seg[i] = j >= 0 && j < onset.length ? onset[j] * w[i] : 0;
    }
    let zero = 0;
    for (let i = 0; i < win; i++) zero += seg[i] * seg[i];
    if (zero <= 0) continue;
    for (let lag = minLag - 1; lag <= maxLag + 1; lag++) {
      let s = 0;
      for (let i = 0; i + lag < win; i++) s += seg[i] * seg[i + lag];
      ac[lag] += s / zero;
    }
    windows++;
  }
  if (windows === 0) throw new Error('audio_beat_grid: no onsets found (silent input?)');
  for (let lag = 0; lag < ac.length; lag++) ac[lag] /= windows;

  const centre = bpmHint ?? 120;
  const std = bpmHint ? 0.25 : 1; // octaves
  let best = minLag;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = (60 * frameRate) / lag;
    const prior = -0.5 * ((Math.log2(bpm) - Math.log2(centre)) / std) ** 2;
    const score = Math.log1p(1e6 * Math.max(ac[lag], 0)) + prior;
    if (score > bestScore) {
      bestScore = score;
      best = lag;
    }
  }
  const [a, b, c] = [ac[best - 1], ac[best], ac[best + 1]];
  const denom = a - 2 * b + c;
  const frac = denom < 0 ? Math.max(-0.5, Math.min(0.5, (0.5 * (a - c)) / denom)) : 0;
  return (60 * frameRate) / (best + frac);
}

/**
 * Ellis (2007) dynamic-programming beat tracker, as in librosa
 * `beat_track`: a Gaussian-smoothed onset "local score", a log-gap penalty
 * around the beat period (tightness 100), backtracking from the last strong
 * cumulative-score peak, then trimming weak beats at either end.
 * Returns beat positions in onset frames.
 */
export function trackBeats(onset: Float32Array, period: number, tightness = 100): number[] {
  const n = onset.length;
  // Normalise by the standard deviation (ddof 1).
  let mean = 0;
  for (const v of onset) mean += v;
  mean /= n;
  let varSum = 0;
  for (const v of onset) varSum += (v - mean) ** 2;
  const sd = Math.sqrt(varSum / Math.max(1, n - 1)) || 1;

  const half = Math.round(period);
  const kernel = new Float64Array(2 * half + 1);
  for (let i = -half; i <= half; i++) kernel[i + half] = Math.exp(-0.5 * ((i * 32) / period) ** 2);
  const local = new Float64Array(n);
  for (let t = 0; t < n; t++) {
    let s = 0;
    for (let k = -half; k <= half; k++) {
      const j = t + k;
      if (j >= 0 && j < n) s += (onset[j] / sd) * kernel[k + half];
    }
    local[t] = s;
  }

  const lo = -Math.round(2 * period);
  const hi = -Math.round(period / 2);
  const txwt = new Float64Array(hi - lo + 1);
  for (let off = lo; off <= hi; off++) txwt[off - lo] = -tightness * Math.log(-off / period) ** 2;

  const cum = new Float64Array(n);
  const back = new Int32Array(n).fill(-1);
  let localMax = 0;
  for (const v of local) localMax = Math.max(localMax, v);
  let firstBeat = true;
  for (let i = 0; i < n; i++) {
    let best = -Infinity;
    let bi = -1;
    for (let off = lo; off <= hi; off++) {
      const j = i + off;
      if (j < 0) continue;
      const s = cum[j] + txwt[off - lo];
      if (s > best) {
        best = s;
        bi = j;
      }
    }
    cum[i] = bi >= 0 ? local[i] + best : local[i];
    // Until the first real onset, do not chain beats through silence.
    if (firstBeat && local[i] < 0.01 * localMax) back[i] = -1;
    else {
      back[i] = bi;
      firstBeat = false;
    }
  }

  // Last beat: the latest cumulative-score peak above half the median peak.
  const peaks: number[] = [];
  for (let i = 0; i < n; i++) {
    const left = i === 0 ? -Infinity : cum[i - 1];
    const right = i === n - 1 ? -Infinity : cum[i + 1];
    if (cum[i] > left && cum[i] >= right) peaks.push(i);
  }
  if (peaks.length === 0) return [];
  const medPeak = median(peaks.map((i) => cum[i]));
  let last = peaks[peaks.length - 1];
  for (let k = peaks.length - 1; k >= 0; k--) {
    if (cum[peaks[k]] > 0.5 * medPeak) {
      last = peaks[k];
      break;
    }
  }
  const beats: number[] = [];
  for (let i = last; i >= 0; i = back[i]) beats.unshift(i);

  // Trim weak beats at the ends (librosa __trim_beats).
  const w = [0.25, 0.75, 1, 0.75, 0.25]; // hann(5) without its zero ends
  const sm = beats.map((_, k) => {
    let s = 0;
    for (let d = -2; d <= 2; d++) {
      const j = k + d;
      if (j >= 0 && j < beats.length) s += local[beats[j]] * w[d + 2];
    }
    return s;
  });
  const thr = 0.5 * Math.sqrt(sm.reduce((acc, v) => acc + v * v, 0) / Math.max(1, sm.length));
  let a = 0;
  let b = beats.length;
  while (a < b && sm[a] <= thr) a++;
  while (b > a && sm[b - 1] <= thr) b--;
  return beats.slice(a, b);
}

/**
 * Peak of an envelope within ±halfWindow seconds of t, and the attack: the
 * last point before the peak still under 10% of it, i.e. where the hit
 * starts. Cuts belong on the attack. On Thought and Memory the kick attack
 * sits ~27 ms before librosa's grid and its energy peak ~12 ms after, which
 * matches the ~40 ms "grid is late" measured by ear in the btmusic tests.
 */
function peakNear(
  env: Envelope,
  t: number,
  halfWindow: number,
): { value: number; time: number; attack: number } {
  const a = Math.max(0, Math.floor((t - halfWindow) / env.step));
  const b = Math.min(env.data.length - 1, Math.ceil((t + halfWindow) / env.step));
  let value = 0;
  let idx = Math.min(Math.max(0, Math.round(t / env.step)), env.data.length - 1);
  for (let i = a; i <= b; i++) {
    if (env.data[i] > value) {
      value = env.data[i];
      idx = i;
    }
  }
  let on = idx;
  while (on > a && env.data[on] > 0.1 * value) on--;
  return { value, time: idx * env.step, attack: on * env.step };
}

/** Mean energy per bar position over beats [from, to). */
export function phaseTable(
  energy: number[],
  beatsPerBar: number,
  from = 0,
  to = energy.length,
): PhaseTable {
  const sums = new Array<number>(beatsPerBar).fill(0);
  const counts = new Array<number>(beatsPerBar).fill(0);
  for (let i = from; i < to; i++) {
    sums[i % beatsPerBar] += energy[i];
    counts[i % beatsPerBar]++;
  }
  const means = sums.map((s, p) => (counts[p] ? s / counts[p] : 0));
  const max = Math.max(...means);
  const strongest = means.indexOf(max);
  const others = means.filter((_, p) => p !== strongest);
  const otherMean = others.reduce((x, y) => x + y, 0) / Math.max(1, others.length);
  return {
    relative: means.map((m) => round(max > 0 ? m / max : 0)),
    contrast: round(otherMean > 0 ? max / otherMean : max > 0 ? 99 : 1, 2),
    strongest,
  };
}

/** Below this kick contrast a window has no clear downbeat. */
const MIN_CONTRAST = 1.5;

/**
 * Kick phase per stretch of the song: 8-bar windows stepped by 4 bars,
 * consecutive windows with the same phase merged. Catches drumless intros and
 * breakdowns, and a phase that shifts after a section change.
 */
export function kickSections(
  beatTimes: number[],
  kick: number[],
  beatsPerBar: number,
  songEnd: number,
): BeatGridSection[] {
  const win = 8 * beatsPerBar;
  const step = 4 * beatsPerBar;
  const sections: BeatGridSection[] = [];
  if (beatTimes.length < 2 * beatsPerBar) return sections;
  for (let a = 0; a < beatTimes.length; a += step) {
    const b = Math.min(beatTimes.length, a + win);
    if (b - a < 2 * beatsPerBar && sections.length > 0) break;
    const t = phaseTable(kick, beatsPerBar, a, b);
    const phase = t.contrast >= MIN_CONTRAST ? t.strongest : null;
    const start = beatTimes[a];
    const end = b < beatTimes.length ? beatTimes[b] : songEnd;
    const prev = sections[sections.length - 1];
    if (prev && prev.kick_phase === phase) {
      prev.end = end;
      prev.contrast = Math.min(prev.contrast, t.contrast);
    } else {
      // Windows overlap; a new section starts where the previous one stops.
      if (prev) prev.end = start;
      sections.push({ start, end, kick_phase: phase, contrast: t.contrast });
    }
    if (b === beatTimes.length) break;
  }
  return sections;
}

/** Analyse mono samples at ANALYSIS_SR. Times are offset by `timeOffset`. */
export function analyzeBeatGrid(
  samples: Float32Array,
  sr: number,
  opts: BeatGridOptions = {},
): BeatGrid {
  const beatsPerBar = opts.beatsPerBar ?? 4;
  const offset = opts.timeOffset ?? 0;
  const frameRate = sr / HOP;

  const mel = melSpectrogram(samples, sr, { nFft: N_FFT, hop: HOP, nMels: 128 });
  const onset = onsetStrength(mel, N_FFT, 'median');
  const bpm0 = estimateTempo(onset, frameRate, opts.bpmHint);
  const beatFrames = trackBeats(onset, (60 * frameRate) / bpm0);
  if (beatFrames.length < 2) {
    throw new Error('audio_beat_grid: found fewer than 2 beats; is there a beat in this window?');
  }
  const beatsLocal = beatFrames.map((f) => (f * HOP) / sr);

  // Tempo from the tracked beats: least-squares slope of time against index.
  const nB = beatsLocal.length;
  const xm = (nB - 1) / 2;
  const ym = beatsLocal.reduce((a, b) => a + b, 0) / nB;
  let sxy = 0;
  let sxx = 0;
  beatsLocal.forEach((y, x) => {
    sxy += (x - xm) * (y - ym);
    sxx += (x - xm) ** 2;
  });
  const period = sxy / sxx;

  const kickEnv = bandEnvelope(samples, sr, ...KICK_BAND);
  const snareEnv = bandEnvelope(samples, sr, ...SNARE_BAND);
  const halfWin = Math.min(0.08, period / 4);
  const kickPeaks = beatsLocal.map((t) => peakNear(kickEnv, t, halfWin));
  const snarePeaks = beatsLocal.map((t) => peakNear(snareEnv, t, halfWin));
  const scale = (xs: number[]): number[] => {
    const m = Math.max(...xs);
    return xs.map((x) => round(m > 0 ? x / m : 0));
  };
  const kick = scale(kickPeaks.map((p) => p.value));
  const snare = scale(snarePeaks.map((p) => p.value));

  const kickTable = phaseTable(kick, beatsPerBar);
  const snareTable = phaseTable(snare, beatsPerBar);
  const kickPhase = kickTable.strongest;
  const isDown = (i: number): boolean => i % beatsPerBar === kickPhase;
  const isHalf = (i: number): boolean =>
    beatsPerBar % 2 === 0 ? i % (beatsPerBar / 2) === kickPhase % (beatsPerBar / 2) : isDown(i);

  // Offset from downbeats that actually carry a kick, so drumless stretches
  // do not pull the median toward noise.
  const strongDown = beatsLocal.map((_, i) => i).filter((i) => isDown(i) && kick[i] >= 0.3);
  const offsetS = round(median(strongDown.map((i) => kickPeaks[i].attack - beatsLocal[i])));

  const sections = kickSections(
    beatsLocal.map((t) => t + offset),
    kick,
    beatsPerBar,
    samples.length / sr + offset,
  );

  const abs = (t: number): number => round(t + offset);
  return {
    tempo_bpm: round(60 / period, 2),
    beat_period_s: round(period, 4),
    beats_per_bar: beatsPerBar,
    beats: beatsLocal.map(abs),
    kick_phase: kickPhase,
    downbeats: beatsLocal.filter((_, i) => isDown(i)).map(abs),
    half_bar: beatsLocal.filter((_, i) => isHalf(i)).map(abs),
    offset_s: offsetS,
    kick_ref: strongDown.length ? abs(beatsLocal[strongDown[0]]) : null,
    phase_strength: { kick: kickTable, snare: snareTable },
    sections: sections.map((s) => ({ ...s, start: round(s.start), end: round(s.end) })),
    beat_energy: { kick, snare },
  };
}

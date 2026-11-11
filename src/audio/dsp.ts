/**
 * Small DSP kit for audio analysis (beat grid, TODO #34).
 *
 * Plain TypeScript on Float32Arrays so the server needs no Python or native
 * addon: an in-place radix-2 FFT, a centred STFT folded straight into a mel
 * spectrogram, spectral-flux onset strength, and RBJ
 * biquads for band envelopes. Defaults and conventions follow librosa, which
 * the btmusic prototype used, so results can be compared against it.
 */

/** In-place iterative radix-2 complex FFT of a fixed power-of-two size. */
export class FFT {
  readonly size: number;
  private readonly cos: Float64Array;
  private readonly sin: Float64Array;
  private readonly rev: Uint32Array;

  constructor(size: number) {
    if (size < 2 || (size & (size - 1)) !== 0) {
      throw new Error(`FFT size must be a power of two, got ${size}`);
    }
    this.size = size;
    this.cos = new Float64Array(size / 2);
    this.sin = new Float64Array(size / 2);
    for (let i = 0; i < size / 2; i++) {
      this.cos[i] = Math.cos((2 * Math.PI * i) / size);
      this.sin[i] = -Math.sin((2 * Math.PI * i) / size);
    }
    const bits = Math.log2(size);
    this.rev = new Uint32Array(size);
    for (let i = 0; i < size; i++) {
      let r = 0;
      for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b);
      this.rev[i] = r;
    }
  }

  /** Forward transform of (re, im), in place. */
  forward(re: Float64Array, im: Float64Array): void {
    const n = this.size;
    for (let i = 0; i < n; i++) {
      const j = this.rev[i];
      if (j > i) {
        let t = re[i];
        re[i] = re[j];
        re[j] = t;
        t = im[i];
        im[i] = im[j];
        im[j] = t;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const half = len >> 1;
      const step = n / len;
      for (let start = 0; start < n; start += len) {
        for (let k = 0; k < half; k++) {
          const wr = this.cos[k * step];
          const wi = this.sin[k * step];
          const a = start + k;
          const b = a + half;
          const xr = re[b] * wr - im[b] * wi;
          const xi = re[b] * wi + im[b] * wr;
          re[b] = re[a] - xr;
          im[b] = im[a] - xi;
          re[a] += xr;
          im[a] += xi;
        }
      }
    }
  }
}

/** Periodic Hann window (librosa / scipy `get_window('hann', n)`). */
export function hann(n: number): Float64Array {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n);
  return w;
}

const hzToMel = (f: number): number => 2595 * Math.log10(1 + f / 700);
const melToHz = (m: number): number => 700 * (10 ** (m / 2595) - 1);

/**
 * Triangular mel filters in compressed sparse rows: the weights for FFT bin
 * `b` are `band[ptr[b]..ptr[b+1])` / `weight[...]`. Each bin feeds at most two
 * bands, so this is far cheaper than a dense bins×bands product.
 */
interface MelWeights {
  ptr: Int32Array;
  band: Int32Array;
  weight: Float64Array;
}

function melWeights(
  sr: number,
  nFft: number,
  nMels: number,
  fmin: number,
  fmax: number,
): MelWeights {
  const nBins = nFft / 2 + 1;
  const lo = hzToMel(fmin);
  const hi = hzToMel(fmax);
  const edges = Array.from({ length: nMels + 2 }, (_, i) =>
    melToHz(lo + ((hi - lo) * i) / (nMels + 1)),
  );
  const bands: number[] = [];
  const weights: number[] = [];
  const ptr = new Int32Array(nBins + 1);
  for (let bin = 0; bin < nBins; bin++) {
    const f = (bin * sr) / nFft;
    for (let m = 0; m < nMels; m++) {
      const a = edges[m];
      const b = edges[m + 1];
      const c = edges[m + 2];
      if (f <= a || f >= c) continue;
      const w = f < b ? (f - a) / (b - a) : (c - f) / (c - b);
      // Slaney-style area normalisation keeps wide high bands from dominating.
      if (w > 0) {
        bands.push(m);
        weights.push((w * 2) / (c - a));
      }
    }
    ptr[bin + 1] = bands.length;
  }
  return { ptr, band: Int32Array.from(bands), weight: Float64Array.from(weights) };
}

export interface MelSpectrogram {
  /** Power mel spectrogram, frame-major: data[frame * nMels + band]. */
  data: Float32Array;
  frames: number;
  nMels: number;
  hop: number;
  sr: number;
}

/**
 * Centred STFT (zero-padded by nFft/2 each side, so frame t is centred on
 * sample t*hop) of a Hann-windowed signal, folded into a power mel
 * spectrogram without materialising the linear one.
 */
export function melSpectrogram(
  samples: Float32Array,
  sr: number,
  opts: { nFft?: number; hop?: number; nMels?: number; fmin?: number; fmax?: number } = {},
): MelSpectrogram {
  const nFft = opts.nFft ?? 2048;
  const hop = opts.hop ?? 256;
  const nMels = opts.nMels ?? 128;
  const { ptr, band, weight } = melWeights(sr, nFft, nMels, opts.fmin ?? 0, opts.fmax ?? sr / 2);
  const fft = new FFT(nFft);
  const win = hann(nFft);
  const pad = nFft / 2;
  const frames = 1 + Math.floor(samples.length / hop);
  const data = new Float32Array(frames * nMels);
  const re = new Float64Array(nFft);
  const im = new Float64Array(nFft);
  for (let t = 0; t < frames; t++) {
    const start = t * hop - pad;
    for (let i = 0; i < nFft; i++) {
      const s = start + i;
      re[i] = s >= 0 && s < samples.length ? samples[s] * win[i] : 0;
      im[i] = 0;
    }
    fft.forward(re, im);
    const row = t * nMels;
    for (let bin = 0; bin <= nFft / 2; bin++) {
      const a = ptr[bin];
      const b = ptr[bin + 1];
      if (a === b) continue;
      const p = re[bin] * re[bin] + im[bin] * im[bin];
      for (let k = a; k < b; k++) data[row + band[k]] += p * weight[k];
    }
  }
  return { data, frames, nMels, hop, sr };
}

/**
 * Spectral-flux onset strength (librosa `onset_strength`): log-power mel
 * (80 dB floor below the peak), positive first difference per band, mean
 * across bands. Shifted later by nFft/(2·hop) frames, as librosa does, so a
 * peak sits at the transient rather than at the frame that first sees it.
 */
export function onsetStrength(
  mel: MelSpectrogram,
  nFft = 2048,
  aggregate: 'mean' | 'median' = 'median',
): Float32Array {
  const { data, frames, nMels } = mel;
  const db = new Float32Array(data.length);
  let peak = -Infinity;
  for (let i = 0; i < data.length; i++) {
    db[i] = 10 * Math.log10(Math.max(data[i], 1e-10));
    if (db[i] > peak) peak = db[i];
  }
  const floor = peak - 80;
  for (let i = 0; i < db.length; i++) if (db[i] < floor) db[i] = floor;

  const flux = new Float32Array(frames);
  const diffs = new Float32Array(nMels);
  for (let t = 1; t < frames; t++) {
    let sum = 0;
    for (let m = 0; m < nMels; m++) {
      const d = db[t * nMels + m] - db[(t - 1) * nMels + m];
      diffs[m] = d > 0 ? d : 0;
      sum += diffs[m];
    }
    if (aggregate === 'mean') flux[t] = sum / nMels;
    else {
      diffs.sort();
      flux[t] = nMels % 2 ? diffs[nMels >> 1] : (diffs[(nMels >> 1) - 1] + diffs[nMels >> 1]) / 2;
    }
  }
  const shift = Math.floor(nFft / (2 * mel.hop));
  const out = new Float32Array(frames);
  for (let t = shift; t < frames; t++) out[t] = flux[t - shift];
  return out;
}

/** RBJ cookbook biquad, applied in place (direct form I). */
function biquad(
  x: Float32Array,
  sr: number,
  type: 'lowpass' | 'highpass',
  f0: number,
  q = Math.SQRT1_2,
): void {
  const w0 = (2 * Math.PI * f0) / sr;
  const alpha = Math.sin(w0) / (2 * q);
  const cw = Math.cos(w0);
  const b0 = type === 'lowpass' ? (1 - cw) / 2 : (1 + cw) / 2;
  const b1 = type === 'lowpass' ? 1 - cw : -(1 + cw);
  const b2 = b0;
  const a0 = 1 + alpha;
  const a1 = -2 * cw;
  const a2 = 1 - alpha;
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const x0 = x[i];
    const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
    x[i] = y0;
  }
}

export interface Envelope {
  data: Float32Array;
  /** Seconds per envelope sample. */
  step: number;
}

/**
 * Energy envelope of one frequency band: 4th-order band-pass (two
 * high-pass and two low-pass biquads), squared, smoothed over `smoothSec`,
 * sampled every `stepSec`. Fine enough in time (2 ms default) to locate a
 * kick's peak, which a 12 ms STFT hop cannot.
 */
export function bandEnvelope(
  samples: Float32Array,
  sr: number,
  lowHz: number,
  highHz: number,
  opts: { smoothSec?: number; stepSec?: number } = {},
): Envelope {
  const x = Float32Array.from(samples);
  biquad(x, sr, 'highpass', lowHz);
  biquad(x, sr, 'highpass', lowHz);
  biquad(x, sr, 'lowpass', highHz);
  biquad(x, sr, 'lowpass', highHz);
  const smooth = Math.max(1, Math.round((opts.smoothSec ?? 0.01) * sr));
  const step = Math.max(1, Math.round((opts.stepSec ?? 0.002) * sr));
  const n = Math.floor(x.length / step);
  const data = new Float32Array(n);
  // Running sum of squares over a centred window.
  const sq = new Float64Array(x.length + 1);
  for (let i = 0; i < x.length; i++) sq[i + 1] = sq[i] + x[i] * x[i];
  const half = smooth >> 1;
  for (let k = 0; k < n; k++) {
    const c = k * step;
    const a = Math.max(0, c - half);
    const b = Math.min(x.length, c + half + 1);
    data[k] = (sq[b] - sq[a]) / (b - a);
  }
  return { data, step: step / sr };
}

/**
 * Synthetic drum loops with known beat times and kick placement, for the
 * beat-grid tests. Deterministic (seeded noise), mono float.
 */
export interface DrumLoopOptions {
  bpm: number;
  seconds: number;
  sr?: number;
  /** Time of beat 0. */
  firstBeat?: number;
  /** Bar position (beat index mod 4) of the kick. */
  kickPhase?: number;
  /** Beats from the start with no kick or snare (a drumless intro), hats only. */
  introBeats?: number;
}

export interface DrumLoop {
  samples: Float32Array;
  sr: number;
  beats: number[];
  kicks: number[];
}

export function drumLoop(opts: DrumLoopOptions): DrumLoop {
  const sr = opts.sr ?? 22_050;
  const period = 60 / opts.bpm;
  const first = opts.firstBeat ?? 0.5;
  const kickPhase = opts.kickPhase ?? 0;
  const intro = opts.introBeats ?? 0;
  const samples = new Float32Array(Math.round(opts.seconds * sr));
  let seed = 12345;
  const noise = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x3fffffff - 1;
  };
  const add = (t: number, len: number, f: (dt: number) => number): void => {
    const a = Math.round(t * sr);
    for (let i = 0; i < len * sr && a + i < samples.length; i++) samples[a + i] += f(i / sr);
  };

  const beats: number[] = [];
  const kicks: number[] = [];
  for (let i = 0; first + i * period < opts.seconds - 0.2; i++) {
    const t = first + i * period;
    beats.push(t);
    // hats on every beat and off-beat, quiet
    add(t, 0.03, (dt) => 0.15 * noise() * Math.exp(-dt / 0.008));
    add(t + period / 2, 0.03, (dt) => 0.1 * noise() * Math.exp(-dt / 0.008));
    if (i < intro) continue;
    const pos = i % 4;
    if (pos === kickPhase) {
      kicks.push(t);
      // 808-ish kick: pitch drop 90 → 50 Hz, long decay
      add(t, 0.4, (dt) => 0.9 * Math.sin(2 * Math.PI * (50 * dt + 40 * 0.03 * (1 - Math.exp(-dt / 0.03)))) * Math.exp(-dt / 0.12));
    } else if (pos === (kickPhase + 2) % 4) {
      // snare: noise + a 200 Hz body
      add(t, 0.15, (dt) => (0.4 * noise() + 0.2 * Math.sin(2 * Math.PI * 200 * dt)) * Math.exp(-dt / 0.04));
    } else {
      // a soft low tap on the other beats, so kick energy is not zero there
      add(t, 0.1, (dt) => 0.12 * Math.sin(2 * Math.PI * 60 * dt) * Math.exp(-dt / 0.03));
    }
  }
  return { samples, sr, beats, kicks };
}

/** 16-bit mono PCM WAV. */
export function toWav(samples: Float32Array, sr: number): Buffer {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), i * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

/** Distance from t to the nearest of xs. */
export function nearest(xs: number[], t: number): number {
  let best = Infinity;
  for (const x of xs) if (Math.abs(x - t) < Math.abs(best)) best = x - t;
  return best;
}

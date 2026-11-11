import { describe, it, expect } from 'vitest';
import { FFT, bandEnvelope } from '../../../src/audio/dsp.js';
import {
  analyzeBeatGrid,
  kickSections,
  phaseTable,
} from '../../../src/audio/beat-grid.js';
import { drumLoop, nearest } from '../../helpers/drums.js';

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s[s.length >> 1];
};

describe('FFT', () => {
  it('matches a naive DFT', () => {
    const n = 16;
    const x = Array.from({ length: n }, (_, i) => Math.sin(i * 0.7) + 0.3 * Math.cos(i * 2.1));
    const re = Float64Array.from(x);
    const im = new Float64Array(n);
    new FFT(n).forward(re, im);
    for (let k = 0; k < n; k++) {
      let r = 0;
      let i = 0;
      for (let t = 0; t < n; t++) {
        r += x[t] * Math.cos((2 * Math.PI * k * t) / n);
        i -= x[t] * Math.sin((2 * Math.PI * k * t) / n);
      }
      expect(re[k]).toBeCloseTo(r, 9);
      expect(im[k]).toBeCloseTo(i, 9);
    }
  });

  it('rejects a size that is not a power of two', () => {
    expect(() => new FFT(12)).toThrow(/power of two/);
  });
});

describe('bandEnvelope', () => {
  it('passes a tone inside the band and rejects one outside it', () => {
    const sr = 22_050;
    const tone = (f: number): Float32Array =>
      Float32Array.from({ length: sr }, (_, i) => Math.sin((2 * Math.PI * f * i) / sr));
    const level = (x: Float32Array): number => median(Array.from(bandEnvelope(x, sr, 40, 120).data));
    expect(level(tone(70))).toBeGreaterThan(0.3);
    expect(level(tone(3000))).toBeLessThan(0.001);
  });
});

describe('phaseTable', () => {
  it('finds the strongest bar position and its contrast', () => {
    const t = phaseTable([0.2, 1, 0.2, 0.2, 0.2, 1, 0.2, 0.2], 4);
    expect(t.strongest).toBe(1);
    expect(t.relative).toEqual([0.2, 1, 0.2, 0.2]);
    expect(t.contrast).toBe(5);
  });
});

describe('kickSections', () => {
  it('merges windows with the same phase and marks weak ones null', () => {
    const beats = Array.from({ length: 96 }, (_, i) => i * 0.5);
    // 32 beats with no accent, then 64 with the kick on position 2
    const kick = beats.map((_, i) => (i < 32 ? 0.5 : i % 4 === 2 ? 1 : 0.1));
    const s = kickSections(beats, kick, 4, 48);
    expect(s[0].kick_phase).toBeNull();
    expect(s[s.length - 1].kick_phase).toBe(2);
    expect(s[s.length - 1].end).toBe(48);
    for (let i = 1; i < s.length; i++) expect(s[i].start).toBe(s[i - 1].end);
  });
});

describe('analyzeBeatGrid', () => {
  it.each([
    [92.3, 1, undefined],
    [128, 3, undefined],
    // 75 BPM with off-beat hats reads as 150 without a hint (octave ambiguity).
    [75, 2, 75],
  ])('finds tempo, beats and the kick at %s BPM (kick on beat %s)', (bpm, kickPhase, bpmHint) => {
    const loop = drumLoop({ bpm, seconds: 40, kickPhase });
    const g = analyzeBeatGrid(loop.samples, loop.sr, { bpmHint });

    expect(g.tempo_bpm).toBeGreaterThan(bpm - 0.5);
    expect(g.tempo_bpm).toBeLessThan(bpm + 0.5);
    // Every reported beat sits on a true beat. Like librosa's, the grid runs
    // a frame or two (~23 ms each) after the attack; offset_s corrects it.
    expect(median(g.beats.map((t) => Math.abs(nearest(loop.beats, t))))).toBeLessThan(0.05);
    expect(g.beats.length).toBeGreaterThan(loop.beats.length - 4);
    // Downbeats are the kick beats, half_bar adds the snare beats.
    for (const d of g.downbeats) expect(Math.abs(nearest(loop.kicks, d))).toBeLessThan(0.05);
    expect(g.half_bar.length).toBeGreaterThanOrEqual(2 * g.downbeats.length - 1);
    expect(g.phase_strength.kick.contrast).toBeGreaterThan(2);
    expect(g.phase_strength.snare.strongest).toBe((g.kick_phase + 2) % 4);
    // offset_s moves the grid onto the kick attack.
    expect(g.offset_s).toBeLessThan(0);
    expect(g.offset_s).toBeGreaterThan(-0.06);
    const corrected = g.downbeats.map((d) => Math.abs(nearest(loop.kicks, d + g.offset_s)));
    expect(median(corrected)).toBeLessThan(0.012);
    expect(g.kick_ref).toBe(g.downbeats.find((d) => Math.abs(nearest(loop.kicks, d)) < 0.05));
  });

  it('reports times in song time when analysing a window', () => {
    const loop = drumLoop({ bpm: 100, seconds: 20, kickPhase: 0 });
    const g = analyzeBeatGrid(loop.samples, loop.sr, { timeOffset: 60 });
    expect(g.beats[0]).toBeGreaterThan(60);
    expect(Math.abs(nearest(loop.beats.map((t) => t + 60), g.downbeats[0]))).toBeLessThan(0.05);
  });

  it('marks a drumless intro as a section with no kick phase', () => {
    const loop = drumLoop({ bpm: 96, seconds: 60, kickPhase: 0, introBeats: 32 });
    const g = analyzeBeatGrid(loop.samples, loop.sr);
    expect(g.sections[0].kick_phase).toBeNull();
    expect(g.sections[g.sections.length - 1].kick_phase).toBe(g.kick_phase);
    // kick_ref skips the intro.
    expect(g.kick_ref).toBeGreaterThan(loop.beats[31]);
  });

  it('honours beats_per_bar', () => {
    const loop = drumLoop({ bpm: 110, seconds: 30, kickPhase: 0 });
    const two = analyzeBeatGrid(loop.samples, loop.sr, { beatsPerBar: 2 });
    expect(two.phase_strength.kick.relative).toHaveLength(2);
    // In 2/4 the half bar is every beat.
    expect(two.half_bar).toEqual(two.beats);
    const three = analyzeBeatGrid(loop.samples, loop.sr, { beatsPerBar: 3 });
    expect(three.phase_strength.kick.relative).toHaveLength(3);
    // An odd bar has no middle beat: half_bar falls back to the downbeats.
    expect(three.half_bar).toEqual(three.downbeats);
  });

  it('fails clearly on silence', () => {
    expect(() => analyzeBeatGrid(new Float32Array(22_050 * 5), 22_050)).toThrow(/audio_beat_grid/);
  });
});

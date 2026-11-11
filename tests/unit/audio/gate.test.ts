import { describe, it, expect } from 'vitest';
import { checkWindows, gateFilter, gateGain, mergeWindows } from '../../../src/audio/gate.js';

describe('audio_gate windows', () => {
  it('reports empty, reversed and negative windows', () => {
    expect(checkWindows([[1, 2]])).toEqual([]);
    expect(
      checkWindows([
        [2, 2],
        [3, 1],
        [-1, 4],
      ]),
    ).toEqual([
      'window 0 [2, 2]: end must be after start.',
      'window 1 [3, 1]: end must be after start.',
      'window 2 [-1, 4]: start must not be negative.',
    ]);
  });

  it('sorts, and merges windows whose ramps would meet', () => {
    // 10 ms fades: a 15 ms gap merges (ramps overlap), a 25 ms gap does not.
    expect(
      mergeWindows(
        [
          [5, 6],
          [1, 2],
          [2.015, 3],
          [3.025, 4],
          [5.5, 5.8],
        ],
        0.01,
      ),
    ).toEqual([
      [1, 3],
      [3.025, 4],
      [5, 6],
    ]);
  });

  it('builds one trapezoid per window, split halfway between neighbours', () => {
    expect(gateGain([[1, 2]], 0.01)).toBe('clip(min(t-1\\,2-t)/0.01+1\\,0\\,1)');
    expect(gateGain([[1, 2]], 0)).toBe('between(t\\,1\\,2)');
    expect(
      gateGain(
        [
          [4, 5],
          [0, 1],
          [8, 9],
        ],
        0,
      ),
    ).toBe(
      'if(lt(t\\,6.5)\\,if(lt(t\\,2.5)\\,between(t\\,0\\,1)\\,between(t\\,4\\,5))\\,between(t\\,8\\,9))',
    );
  });

  it('multiplies every channel by the gain', () => {
    expect(gateFilter([[1, 2]], 0)).toBe(
      'aeval=exprs=val(ch)*between(t\\,1\\,2):channel_layout=same',
    );
  });
});

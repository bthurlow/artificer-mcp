import { describe, it, expect } from 'vitest';
import { edlSchema, type EdlInput } from '../../../src/video/edl/schema.js';
import {
  type BeatSource,
  buildBatchGraphs,
  buildFilterGraph,
  buildJoinGraph,
  planEdl,
  punchCrop,
  snapTime,
} from '../../../src/video/edl/plan.js';

const parse = (e: EdlInput) => edlSchema.parse(e);
const longClips = { clipDuration: () => 1000, audioDuration: 1000 };

// 120 BPM grid from 0 s; downbeats (kick) on beats 1, 5, 9, … (t = 0.5, 2.5, …)
const grid: BeatSource = {
  beats: Array.from({ length: 64 }, (_, i) => i * 0.5),
  kickRef: 0.5,
  offset: 0,
  beatsPerBar: 4,
};

describe('snapTime', () => {
  it('snaps to the nearest beat', () => {
    expect(snapTime(3.2, grid, true)).toBe(3);
    expect(snapTime(3.3, grid, 'beat')).toBe(3.5);
  });

  it('"kick" snaps to downbeats counted from kick_ref', () => {
    expect(snapTime(3.2, grid, 'kick')).toBe(2.5);
    expect(snapTime(3.6, grid, 'kick')).toBe(4.5);
  });

  it('"half" adds the mid-bar beat', () => {
    expect(snapTime(3.2, grid, 'half')).toBe(3.5);
    expect(snapTime(2.1, grid, 'half')).toBe(2.5);
  });

  it('applies the offset to beats and kick_ref', () => {
    expect(snapTime(2.5, { ...grid, offset: -0.04 }, 'kick')).toBeCloseTo(2.46, 9);
  });

  it('needs kick_ref for kick/half', () => {
    expect(() => snapTime(1, { ...grid, kickRef: undefined }, 'kick')).toThrow(/kick_ref/);
  });

  it('in an odd meter "half" falls back to downbeats', () => {
    expect(snapTime(1.6, { ...grid, beatsPerBar: 3 }, 'half')).toBe(2);
  });
});

describe('planEdl', () => {
  it('places shots frame-exact from the absolute timeline (no accumulated rounding)', () => {
    // 8 shots of 0.53 s at 24 fps: each is 12.72 frames. Per-shot rounding
    // would give 8 × 13 = 104 frames; absolute rounding keeps the total at
    // round(4.24 × 24) = 102.
    const shots = Array.from({ length: 8 }, (_, k) => ({
      clip: 'a.mp4',
      clip_song_start: 10,
      start: 10 + k * 0.53,
    }));
    const { plan, errors } = planEdl(
      parse({ audio: 'm.wav', segments: [{ song: [10, 14.24], shots }] }),
      longClips,
    );
    expect(errors).toEqual([]);
    expect(plan.totalFrames).toBe(102);
    expect(plan.shots.reduce((s, x) => s + x.frames, 0)).toBe(102);
    for (let k = 1; k < 8; k++) {
      const prev = plan.shots[k - 1];
      expect(plan.shots[k].outFrame).toBe(prev.outFrame + prev.frames);
      expect(plan.shots[k].outFrame).toBe(Math.round(k * 0.53 * 24));
    }
  });

  it('keeps lip-sync: the source in-point is start − clip_song_start', () => {
    const { plan } = planEdl(
      parse({
        audio: 'm.wav',
        segments: [
          {
            song: [100, 104],
            shots: [
              { clip: 'a.mp4', clip_song_start: 98 },
              { clip: 'b.mp4', clip_song_start: 101, start: 102 },
            ],
          },
        ],
      }),
      longClips,
    );
    expect(plan.shots.map((s) => s.srcFrame)).toEqual([48, 24]);
    expect(plan.shots.map((s) => s.outFrame)).toEqual([0, 48]);
  });

  it('snaps shot starts and records the requested time', () => {
    const { plan, errors } = planEdl(
      parse({
        audio: 'm.wav',
        segments: [
          {
            song: [0, 8],
            shots: [
              { clip: 'a.mp4' },
              { clip: 'a.mp4', start: 3.2, snap: 'kick' },
              { clip: 'a.mp4', start: 5.0 },
            ],
          },
        ],
      }),
      { ...longClips, grid },
    );
    expect(errors).toEqual([]);
    expect(plan.shots[1]).toMatchObject({ songStart: 2.5, requestedStart: 3.2 });
    expect(plan.shots[2].requestedStart).toBeUndefined();
  });

  it('reports every problem at once', () => {
    const { errors } = planEdl(
      parse({
        audio: 'm.wav',
        segments: [
          {
            song: [10, 20],
            shots: [
              { clip: 'early.mp4', clip_song_start: 12 },
              { clip: 'a.mp4' },
              { clip: 'short.mp4', start: 15, in: 'burn' },
              { clip: 'a.mp4', start: 25 },
              { clip: 'a.mp4', start: 16, snap: true },
            ],
          },
          { song: [30, 30], shots: [{ clip: 'a.mp4' }] },
          { song: [990, 1010], shots: [{ clip: 'a.mp4' }] },
        ],
      }),
      {
        clipDuration: (c) => (c === 'short.mp4' ? 2 : 1000),
        audioDuration: 1000,
      },
    );
    const text = errors.join('\n');
    expect(text).toMatch(/segment 0 shot 0 \(early\.mp4\): starts 2\.000s before its clip begins/);
    expect(text).toMatch(/segment 0 shot 1: needs a start/);
    expect(text).toMatch(/shot 2 \(short\.mp4\): unknown transition "burn"/);
    expect(text).toMatch(/shot 2 \(short\.mp4\): needs the clip up to/);
    expect(text).toMatch(/shot 3 \(a\.mp4\): starts at 25\.000, outside its segment/);
    expect(text).toMatch(/shot 4: snap needs beat_grid or beats/);
    expect(text).toMatch(/segment 1: song range \[30, 30\] is empty/);
    expect(text).toMatch(/segment 2: ends at 1010s, past the end of the audio/);
  });

  it('flags a shot shorter than a frame', () => {
    const { errors } = planEdl(
      parse({
        audio: 'm.wav',
        segments: [{ song: [0, 2], shots: [{ clip: 'a.mp4' }, { clip: 'a.mp4', start: 0.01 }] }],
      }),
      longClips,
    );
    expect(errors.join()).toMatch(/under one frame/);
  });
});

describe('punchCrop', () => {
  const frame = { width: 1920, height: 1080 };

  it('is empty at punch 1', () => {
    expect(punchCrop(frame, { punch: 1, fx: 0.5, fy: 0.5 })).toBe('');
  });

  it('matches ffmpeg evaluating the prototype expressions (size truncated, position rounded)', () => {
    // 1920/1.7 = 1129.41, 1080/1.7 = 635.29; y = 0.34·1080 − 317.65 = 49.55 → 50
    expect(punchCrop(frame, { punch: 1.7, fx: 0.56, fy: 0.34 })).toBe(
      'crop=1129:635:510:50,scale=1920:1080,',
    );
  });

  it('clamps the window inside the frame', () => {
    expect(punchCrop(frame, { punch: 2, fx: 1, fy: 0 })).toBe('crop=960:540:960:0,scale=1920:1080,');
  });
});

describe('filter graphs', () => {
  const edl = parse({
    audio: 'm.wav',
    width: 640,
    height: 360,
    fps: 24,
    segments: [
      {
        song: [10, 14],
        shots: [
          { clip: 'a.mp4', clip_song_start: 0 },
          { clip: 'b.mp4', clip_song_start: 13, start: 13, punch: 1.5, in: 'flash' },
        ],
      },
      { song: [20, 22], shots: [{ clip: 'a.mp4', clip_song_start: 19.5 }] },
    ],
  });
  const { plan } = planEdl(edl, longClips);
  const paths = { audio: '/m.wav', clip: (c: string) => `/clips/${c}` };

  it('seeks long in-points to a whole frame and trims by pts', () => {
    const g = buildFilterGraph(plan, paths);
    // shot 0: src_in 10 s = frame 240; seek 1 s earlier (frame 216 = 9 s); trim local pts 24..96
    expect(g.inputs[1]).toEqual({ options: ['-threads', '2', '-ss', '9.000000'], path: '/clips/a.mp4' });
    expect(g.filter).toContain('[1:v]fps=24,trim=start_pts=24:end_pts=96,setpts=PTS-STARTPTS');
    // shot 1: src_in 0, no seek
    expect(g.inputs[2]).toEqual({ options: ['-threads', '2'], path: '/clips/b.mp4' });
    expect(g.filter).toContain('[2:v]fps=24,trim=start_pts=0:end_pts=24,');
    expect(g.filter).toContain('crop=426:240:107:60,scale=640:360,');
    expect(g.filter).toContain(
      'setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709[v0]',
    );
  });

  it('joins the song ranges with short fades', () => {
    const g = buildFilterGraph(plan, paths);
    expect(g.inputs[0].path).toBe('/m.wav');
    expect(g.filter).toContain('[0:a]asplit=2[as0][as1]');
    expect(g.filter).toContain('[as0]atrim=start=10.0000:end=14.0000');
    expect(g.filter).toContain('afade=t=out:st=1.9900:d=0.01[a1]');
    expect(g.filter).toContain('[a0][a1]concat=n=2:v=0:a=1[aout]');
  });

  it('times the flash from the frame number', () => {
    const g = buildFilterGraph(plan, paths);
    // shot 1 starts at out frame 72 = 3 s
    expect(g.filter).toContain(
      '[base]eq=brightness=if(between(n/24\\,3.0000\\,3.0000+0.25)\\,0.75*(1-(n/24-3.0000)/0.25)\\,0):eval=frame[vout]',
    );
  });

  it('passes the picture through when there is no flash', () => {
    const { plan: p } = planEdl(
      parse({ audio: 'm.wav', segments: [{ song: [0, 1], shots: [{ clip: 'a.mp4' }] }] }),
      longClips,
    );
    expect(buildFilterGraph(p, paths).filter).toContain('[base]null[vout]');
  });

  it('batches shots into video-only graphs, then joins them with the audio and flash', () => {
    const batches = buildBatchGraphs(plan, paths.clip, 2);
    expect(batches).toHaveLength(2);
    expect(batches.map((b) => b.frames)).toEqual([96, 48]);
    expect(batches[0].filter).toContain('[0:v]fps=24');
    expect(batches[0].filter).toContain('[v0][v1]concat=n=2:v=1:a=0[vout]');
    expect(batches[0].filter).not.toContain(':a]');

    const join = buildJoinGraph(plan, '/m.wav', ['/b0.mkv', '/b1.mkv'], paths.clip);
    expect(join.inputs.map((i) => i.path)).toEqual(['/m.wav', '/b0.mkv', '/b1.mkv']);
    expect(join.filter).toContain('[1:v][2:v]concat=n=2:v=1:a=0,fps=24[base]');
    expect(join.filter).toContain('[aout]');
    expect(join.filter).toContain('eq=brightness=');
    expect(join.filter).toContain('[base]eq=');
  });
});

describe('element overlays', () => {
  const paths = { audio: '/m.wav', clip: (c: string) => `/clips/${c}` };
  const withFx = (fx: Record<string, unknown>, shotIn = 'burn') =>
    parse({
      audio: 'm.wav',
      width: 640,
      height: 360,
      fps: 24,
      fx,
      segments: [
        {
          song: [0, 6],
          shots: [
            { clip: 'a.mp4' },
            { clip: 'b.mp4', start: 3, in: shotIn },
          ],
        },
      ],
    });

  it('places the element so its peak lands on the cut, capped by max_lead', () => {
    const { plan, errors } = planEdl(
      withFx({ burn: { src: 'fire.mp4', peak: 3.7, max_lead: 0.9 } }),
      longClips,
    );
    expect(errors).toEqual([]);
    expect(plan.effects).toHaveLength(1);
    const e = plan.effects[0];
    expect(e.outFrame).toBe(72);
    // Without the cap it would start at element 0.7 s, 3 s before the cut.
    expect(e.elIn).toBeCloseTo(2.8, 9);
    expect(e.toPeak).toBeCloseTo(0.9, 9);
    expect(e.delay).toBeCloseTo(2.1, 9);
  });

  it('starts the element at its peak minus the cut time when the cut is early', () => {
    const { plan } = planEdl(withFx({ burn: { src: 'fire.mp4', peak: 5 } }), longClips);
    expect(plan.effects[0]).toMatchObject({ delay: 0, toPeak: 3 });
    expect(plan.effects[0].elIn).toBeCloseTo(2, 9);
  });

  it('reports unknown names, sweeps, bad grades, bad levels and a peak past the end', () => {
    const { errors } = planEdl(
      withFx(
        {
          wing: { type: 'sweep', src: 'wing.png', peak: 0 },
          smoke: { src: 'smoke.mp4', peak: 9, mode: 'matte_light', lo: 120, hi: 25, grade: 'eq=1[x]' },
        },
        'fire',
      ),
      { clipDuration: (c) => (c === 'smoke.mp4' ? 6 : 1000), audioDuration: 1000 },
    );
    const text = errors.join('\n');
    expect(text).toMatch(/fx "wing": the sweep type is not available yet/);
    expect(text).toMatch(/fx "smoke": grade must be a plain filter chain/);
    expect(text).toMatch(/fx "smoke": hi \(25\) must be above lo \(120\)/);
    expect(text).toMatch(/fx "smoke": peak 9s is past the end of smoke\.mp4 \(6\.000s\)/);
    expect(text).toMatch(/unknown transition "fire" \(use "cut", "flash" or an fx: wing, smoke\)/);
  });

  it('blends a screen element in RGB, padded to the timeline in frames', () => {
    const { plan } = planEdl(
      withFx({ burn: { src: 'fire.mp4', peak: 3.7, max_lead: 0.9, zoom: 1.4, cx: 0.62 } }),
      longClips,
    );
    const g = buildFilterGraph(plan, paths);
    expect(g.inputs.map((i) => i.path)).toEqual(['/m.wav', '/clips/a.mp4', '/clips/b.mp4', '/clips/fire.mp4']);
    expect(g.filter).toContain('[base]null[fl]');
    expect(g.filter).toContain('[fl]format=gbrp[c0]');
    expect(g.filter).toContain('[3:v]trim=start=2.8000,setpts=PTS-STARTPTS,');
    expect(g.filter).toContain('crop=457:257:'); // zoom 1.4 on 640x360
    expect(g.filter).toContain('tpad=start=50:start_mode=add:color=black:stop=144:stop_mode=add:color=black,trim=end_frame=144[e0]');
    expect(g.filter).toContain('[c0][e0]blend=all_mode=screen[c1]');
    expect(g.filter).toContain('[c1]format=yuv420p,setparams=range=tv:colorspace=bt709');
    expect(g.filter).not.toContain('shortest');
  });

  it('builds a matte from a second read of the file, with grade, speed-up and tail', () => {
    const { plan } = planEdl(
      withFx({
        wing: {
          src: 'raven.mp4',
          peak: 2.4,
          mode: 'matte_dark',
          lo: 85,
          hi: 200,
          grade: 'colorchannelmixer=rr=0.55',
          post_speed: 2.2,
          tail: 1,
        },
      }, 'wing'),
      longClips,
    );
    const g = buildFilterGraph(plan, paths);
    expect(g.inputs.filter((i) => i.path === '/clips/raven.mp4')).toHaveLength(2);
    expect(g.filter).toContain('setpts=if(lt(T\\,2.4000)\\,PTS\\,(2.4000+(T-2.4000)/2.2)/TB),');
    expect(g.filter).toContain('trim=duration=3.4000,fade=t=out:st=3.1500:d=0.25:color=white,');
    expect(g.filter).toContain('[em0]format=gray,negate,lut=y=clip((val-85)*255/(200-85)\\,0\\,255)[ea0]');
    expect(g.filter).toContain('[e0]format=rgba,colorchannelmixer=rr=0.55[er0]');
    expect(g.filter).toContain('[c0][eo0]overlay=format=gbrp[c1]');
  });

  it('adds the elements to the join pass of a batched render', () => {
    const { plan } = planEdl(withFx({ burn: { src: 'fire.mp4', peak: 1 } }), longClips);
    const join = buildJoinGraph(plan, '/m.wav', ['/b0.mkv'], paths.clip);
    expect(join.inputs.map((i) => i.path)).toEqual(['/m.wav', '/b0.mkv', '/clips/fire.mp4']);
    expect(join.filter).toContain('[2:v]trim=start=');
  });
});

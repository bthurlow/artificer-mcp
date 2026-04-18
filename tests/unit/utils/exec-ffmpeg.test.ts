import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock node:child_process BEFORE importing the module under test so that
// `promisify(execFile)` inside exec-ffmpeg.ts picks up our fake execFile.
//
// The shape we need: a callback-style function that execFile's promisify
// helper recognises (util.promisify.custom is NOT set on child_process'
// execFile, so promisify falls back to the standard
// `(err, result)` callback transform).
const execFileMock = vi.fn();

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return {
    ...actual,
    execFile: (
      ...args: [
        string,
        string[],
        unknown,
        (err: Error | null, result: { stdout: string; stderr: string }) => void,
      ]
    ) => {
      // promisify passes the callback as the LAST argument.
      const callback = args[args.length - 1] as (
        err: Error | null,
        result: { stdout: string; stderr: string },
      ) => void;
      execFileMock(...args.slice(0, -1));
      const next = execFileMock.mock.results[execFileMock.mock.results.length - 1];
      const queued = (next?.value as
        | { err?: Error | null; stdout?: string; stderr?: string }
        | undefined) ?? { stdout: '', stderr: '' };
      if (queued.err) {
        callback(queued.err, { stdout: '', stderr: '' });
      } else {
        callback(null, { stdout: queued.stdout ?? '', stderr: queued.stderr ?? '' });
      }
    },
  };
});

const {
  ffmpeg,
  ffmpegBatch,
  ffprobe,
  getVideoInfo,
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_AUDIO_FORMATS,
  VIDEO_ASPECT_RATIOS,
  VIDEO_RESOLUTIONS,
} = await import('../../../src/utils/exec-ffmpeg.js');

function queueResult(result: { stdout?: string; stderr?: string; err?: Error | null }): void {
  execFileMock.mockImplementationOnce(() => result);
}

describe('exec-ffmpeg', () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  afterEach(() => {
    execFileMock.mockReset();
  });

  describe('ffmpeg', () => {
    it('returns stderr on success (FFmpeg writes progress to stderr)', async () => {
      queueResult({ stderr: 'frame=  123 fps=30 ...' });
      const out = await ffmpeg(['-i', 'in.mp4', 'out.mp4']);
      expect(out).toContain('frame=');
      expect(execFileMock).toHaveBeenCalledWith(
        'ffmpeg',
        ['-i', 'in.mp4', 'out.mp4'],
        expect.objectContaining({ timeout: 120_000 }),
      );
    });

    it('applies the caller-supplied timeout override', async () => {
      queueResult({ stderr: '' });
      await ffmpeg(['-version'], { timeout: 5_000 });
      expect(execFileMock).toHaveBeenCalledWith(
        'ffmpeg',
        ['-version'],
        expect.objectContaining({ timeout: 5_000 }),
      );
    });

    it('applies the caller-supplied maxBuffer override', async () => {
      queueResult({ stderr: '' });
      await ffmpeg(['-version'], { maxBuffer: 1024 });
      expect(execFileMock).toHaveBeenCalledWith(
        'ffmpeg',
        ['-version'],
        expect.objectContaining({ maxBuffer: 1024 }),
      );
    });

    it('maps SIGTERM/killed error into a "timed out" message', async () => {
      const err = Object.assign(new Error('spawn killed'), {
        killed: true,
        signal: 'SIGTERM',
      });
      queueResult({ err });
      await expect(ffmpeg(['-i', 'a.mp4', 'b.mp4'], { timeout: 2_000 })).rejects.toThrow(
        /FFmpeg timed out after 2s/,
      );
    });

    it('maps other subprocess errors into a "FFmpeg failed" message including stderr', async () => {
      const err = Object.assign(new Error('boom'), {
        stderr: 'Invalid argument',
      });
      queueResult({ err });
      await expect(ffmpeg(['-i', 'bad.mp4'])).rejects.toThrow(/FFmpeg failed: Invalid argument/);
    });

    it('falls back to "Unknown FFmpeg error" when err has neither stderr nor message', async () => {
      queueResult({ err: {} as Error });
      await expect(ffmpeg(['-i', 'x.mp4'])).rejects.toThrow(/Unknown FFmpeg error/);
    });
  });

  describe('ffmpegBatch', () => {
    it('delegates to ffmpeg with the batch (600_000ms) timeout', async () => {
      queueResult({ stderr: '' });
      await ffmpegBatch(['-i', 'a.mp4', 'b.mp4']);
      expect(execFileMock).toHaveBeenCalledWith(
        'ffmpeg',
        ['-i', 'a.mp4', 'b.mp4'],
        expect.objectContaining({ timeout: 600_000 }),
      );
    });
  });

  describe('ffprobe', () => {
    it('returns stdout on success', async () => {
      queueResult({ stdout: '{"format":{"duration":"4.5"}}' });
      const out = await ffprobe(['-show_format', '-of', 'json', 'clip.mp4']);
      expect(out).toContain('"duration":"4.5"');
    });

    it('defaults timeout to 30_000ms', async () => {
      queueResult({ stdout: '{}' });
      await ffprobe(['-version']);
      expect(execFileMock).toHaveBeenCalledWith(
        'ffprobe',
        ['-version'],
        expect.objectContaining({ timeout: 30_000 }),
      );
    });

    it('wraps subprocess errors with stderr detail', async () => {
      const err = Object.assign(new Error('boom'), { stderr: 'No such file' });
      queueResult({ err });
      await expect(ffprobe(['missing.mp4'])).rejects.toThrow(/ffprobe failed: No such file/);
    });

    it('falls back to "Unknown ffprobe error" when err has no details', async () => {
      queueResult({ err: {} as Error });
      await expect(ffprobe(['x.mp4'])).rejects.toThrow(/Unknown ffprobe error/);
    });
  });

  describe('getVideoInfo', () => {
    it('parses all fields from a typical ffprobe json payload', async () => {
      queueResult({
        stdout: JSON.stringify({
          streams: [
            {
              width: 1920,
              height: 1080,
              codec_name: 'h264',
              r_frame_rate: '30000/1001',
            },
          ],
          format: { duration: '12.345', format_name: 'mov,mp4,m4a,3gp,3g2,mj2' },
        }),
      });
      const info = await getVideoInfo('clip.mp4');
      expect(info.width).toBe(1920);
      expect(info.height).toBe(1080);
      expect(info.codec).toBe('h264');
      expect(info.durationSeconds).toBeCloseTo(12.345, 3);
      expect(info.frameRate).toBeCloseTo(29.97, 2);
      expect(info.formatName).toBe('mov,mp4,m4a,3gp,3g2,mj2');
    });

    it('handles integer frame rates like "30/1"', async () => {
      queueResult({
        stdout: JSON.stringify({
          streams: [{ width: 100, height: 100, codec_name: 'vp9', r_frame_rate: '30/1' }],
          format: { duration: '1.0', format_name: 'webm' },
        }),
      });
      const info = await getVideoInfo('a.webm');
      expect(info.frameRate).toBe(30);
    });

    it('defaults missing stream/format fields to safe zeros / empty strings', async () => {
      queueResult({ stdout: JSON.stringify({}) });
      const info = await getVideoInfo('empty.mp4');
      expect(info.width).toBe(0);
      expect(info.height).toBe(0);
      expect(info.codec).toBe('');
      expect(info.durationSeconds).toBe(0);
      expect(info.frameRate).toBe(0);
      expect(info.formatName).toBe('');
    });

    it('returns 0 frame rate for malformed r_frame_rate strings', async () => {
      queueResult({
        stdout: JSON.stringify({
          streams: [{ r_frame_rate: 'nope' }],
          format: {},
        }),
      });
      const info = await getVideoInfo('broken.mp4');
      expect(info.frameRate).toBe(0);
    });

    it('returns 0 frame rate when r_frame_rate is absent', async () => {
      queueResult({
        stdout: JSON.stringify({
          streams: [{ width: 10, height: 10 }],
          format: {},
        }),
      });
      const info = await getVideoInfo('no-fps.mp4');
      expect(info.frameRate).toBe(0);
    });

    it('returns 0 frame rate when numerator or denominator is zero', async () => {
      queueResult({
        stdout: JSON.stringify({
          streams: [{ r_frame_rate: '0/1' }],
          format: {},
        }),
      });
      const info = await getVideoInfo('zero-num.mp4');
      expect(info.frameRate).toBe(0);
    });
  });

  describe('constants', () => {
    it('lists common video container formats', () => {
      expect(SUPPORTED_VIDEO_FORMATS).toContain('mp4');
      expect(SUPPORTED_VIDEO_FORMATS).toContain('webm');
      expect(SUPPORTED_VIDEO_FORMATS).toContain('mov');
    });

    it('lists common audio formats including opus', () => {
      expect(SUPPORTED_AUDIO_FORMATS).toContain('mp3');
      expect(SUPPORTED_AUDIO_FORMATS).toContain('opus');
      expect(SUPPORTED_AUDIO_FORMATS).toContain('wav');
    });

    it('VIDEO_ASPECT_RATIOS includes 9:16 for Reels/TikTok', () => {
      expect(VIDEO_ASPECT_RATIOS['9:16']).toEqual({ w: 9, h: 16 });
    });

    it('VIDEO_RESOLUTIONS 1080p is 1920×1080', () => {
      expect(VIDEO_RESOLUTIONS['1080p']).toEqual({ width: 1920, height: 1080 });
    });
  });
});

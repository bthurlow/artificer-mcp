import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Default execution timeout for simple FFmpeg commands (2 minutes).
 *
 * Video ops take much longer than image ops — a 1080p transcode easily
 * runs 30+ seconds. The previous `video-audio-mcp` used a 30s timeout
 * shared with ImageMagick, which was too short and caused the concat-hang.
 */
const EXEC_TIMEOUT = 120_000;

/**
 * Extended timeout for complex pipelines (10 minutes).
 *
 * Multi-input concat with transitions, high-bitrate transcodes, or long
 * source clips need more headroom. Still bounded so a runaway process
 * eventually terminates instead of hanging forever (the other concrete
 * bug we saw in `video-audio-mcp`).
 */
const BATCH_TIMEOUT = 600_000;

/**
 * Execute an `ffmpeg` command via execFile (no shell).
 *
 * FFmpeg writes progress and informational messages to stderr — this is
 * normal and not an error. We only treat a non-zero exit as failure.
 *
 * Always pass `-y` via the args array when you want to overwrite outputs;
 * do not rely on interactive prompts (there's no TTY attached).
 *
 * Returns stderr (where FFmpeg's output goes) on success, throws on failure.
 */
export async function ffmpeg(
  args: string[],
  options?: { timeout?: number; maxBuffer?: number },
): Promise<string> {
  const timeout = options?.timeout ?? EXEC_TIMEOUT;
  const maxBuffer = options?.maxBuffer ?? 50 * 1024 * 1024;
  try {
    const { stderr } = await execFileAsync('ffmpeg', args, { timeout, maxBuffer });
    return stderr;
    /* v8 ignore start — defensive subprocess error paths, covered by integration tests */
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string; killed?: boolean; signal?: string };
    if (err.killed && err.signal === 'SIGTERM') {
      throw new Error(`FFmpeg timed out after ${timeout / 1000}s`, { cause: error });
    }
    const message = err.stderr || err.message || 'Unknown FFmpeg error';
    throw new Error(`FFmpeg failed: ${message}`, { cause: error });
  }
  /* v8 ignore stop */
}

/**
 * Execute an FFmpeg command with the extended (batch) timeout.
 */
export async function ffmpegBatch(args: string[]): Promise<string> {
  return ffmpeg(args, { timeout: BATCH_TIMEOUT });
}

/**
 * Execute `ffprobe` to inspect media metadata.
 *
 * Returns stdout (typically JSON when `-print_format json` is in args).
 */
export async function ffprobe(
  args: string[],
  options?: { timeout?: number; maxBuffer?: number },
): Promise<string> {
  const timeout = options?.timeout ?? 30_000;
  const maxBuffer = options?.maxBuffer ?? 10 * 1024 * 1024;
  try {
    const { stdout } = await execFileAsync('ffprobe', args, { timeout, maxBuffer });
    return stdout;
    /* v8 ignore start — defensive subprocess error path, covered by integration tests */
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string };
    const message = err.stderr || err.message || 'Unknown ffprobe error';
    throw new Error(`ffprobe failed: ${message}`, { cause: error });
  }
  /* v8 ignore stop */
}

/**
 * Parsed video metadata from ffprobe.
 */
export interface VideoInfo {
  /** Duration in seconds */
  durationSeconds: number;
  width: number;
  height: number;
  /** Video codec name (e.g., 'h264', 'hevc', 'vp9') */
  codec: string;
  /** Frame rate as a decimal (e.g., 29.97, 30, 60) */
  frameRate: number;
  /** Container format name (e.g., 'mp4', 'webm', 'mov') */
  formatName: string;
}

/**
 * Fetch video metadata via ffprobe.
 */
export async function getVideoInfo(path: string): Promise<VideoInfo> {
  const stdout = await ffprobe([
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height,codec_name,r_frame_rate:format=duration,format_name',
    '-print_format',
    'json',
    path,
  ]);

  const parsed = JSON.parse(stdout) as {
    streams?: Array<{
      width?: number;
      height?: number;
      codec_name?: string;
      r_frame_rate?: string;
    }>;
    format?: { duration?: string; format_name?: string };
  };
  const stream = parsed.streams?.[0] ?? {};
  const format = parsed.format ?? {};

  return {
    durationSeconds: Number(format.duration ?? 0),
    width: stream.width ?? 0,
    height: stream.height ?? 0,
    codec: stream.codec_name ?? '',
    frameRate: parseFrameRate(stream.r_frame_rate),
    formatName: format.format_name ?? '',
  };
}

/** Parse FFmpeg's "30000/1001" style frame rate into a decimal. */
function parseFrameRate(r?: string): number {
  if (!r) return 0;
  const [num, den] = r.split('/').map(Number);
  if (!num || !den) return 0;
  return num / den;
}

/** Supported video container formats */
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv'] as const;

/** Supported audio formats */
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'aac', 'wav', 'flac', 'ogg', 'm4a', 'opus'] as const;

/** Common aspect ratios for video (same keys as image ASPECT_RATIOS in exec.ts). */
export const VIDEO_ASPECT_RATIOS: Record<string, { w: number; h: number }> = {
  '1:1': { w: 1, h: 1 },
  '4:5': { w: 4, h: 5 },
  '9:16': { w: 9, h: 16 },
  '16:9': { w: 16, h: 9 },
  '3:2': { w: 3, h: 2 },
  '21:9': { w: 21, h: 9 },
};

/** Common video resolutions by label */
export const VIDEO_RESOLUTIONS: Record<string, { width: number; height: number }> = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
};

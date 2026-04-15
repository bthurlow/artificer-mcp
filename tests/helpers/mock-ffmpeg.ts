import { vi } from 'vitest';

/**
 * Captured call from a mocked ffmpeg execution.
 */
export interface FfmpegCall {
  args: string[];
}

/**
 * Shared mock state for ffmpeg — lives at module scope so vi.mock's
 * hoisted factory and tests reference the same object.
 */
export const ffmpegState = {
  calls: [] as FfmpegCall[],
  probeOutput: '',
};

export const mockFfmpeg = vi.fn(async (args: string[]) => {
  ffmpegState.calls.push({ args });
  return '';
});

export const mockFfprobe = vi.fn(async (_args: string[]) => {
  return ffmpegState.probeOutput;
});

export function resetFfmpegMock(): void {
  ffmpegState.calls.length = 0;
  ffmpegState.probeOutput = '';
  mockFfmpeg.mockClear();
  mockFfprobe.mockClear();
}

export function setProbeOutput(output: string): void {
  ffmpegState.probeOutput = output;
}

/**
 * Factory for vi.mock('src/utils/exec-ffmpeg.js').
 * Mirrors the real module's exports — keep in sync when exec-ffmpeg changes.
 */
export function createFfmpegMock(): Record<string, unknown> {
  return {
    ffmpeg: mockFfmpeg,
    ffmpegBatch: mockFfmpeg,
    ffprobe: mockFfprobe,
    getVideoInfo: vi.fn(async () => ({
      durationSeconds: 10,
      width: 1920,
      height: 1080,
      codec: 'h264',
      frameRate: 30,
      formatName: 'mp4',
    })),
    SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv'],
    SUPPORTED_AUDIO_FORMATS: ['mp3', 'aac', 'wav', 'flac', 'ogg', 'm4a', 'opus'],
    VIDEO_ASPECT_RATIOS: {
      '1:1': { w: 1, h: 1 },
      '4:5': { w: 4, h: 5 },
      '9:16': { w: 9, h: 16 },
      '16:9': { w: 16, h: 9 },
      '3:2': { w: 3, h: 2 },
      '21:9': { w: 21, h: 9 },
    },
    VIDEO_RESOLUTIONS: {
      '480p': { width: 854, height: 480 },
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '1440p': { width: 2560, height: 1440 },
      '4k': { width: 3840, height: 2160 },
    },
  };
}

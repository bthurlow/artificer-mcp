/**
 * Integration tests — run real ffmpeg commands against real (tiny, lavfi-generated) media.
 * One test per FFmpeg-backed tool to verify the constructed filter strings,
 * codec picks, and overall graph actually run against the ffmpeg binary.
 *
 * Requires ffmpeg + ffprobe installed. Skipped automatically if ffmpeg
 * is not available — but logs a banner so silent-skipping is visible.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServerClient } from '../helpers/server.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm, stat, access, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

const execFileAsync = promisify(execFile);

// Bundled test font — see tests/fixtures/fonts/README.md.
const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_FONT = join(__dirname, '..', 'fixtures', 'fonts', 'Roboto-Regular.ttf');

/** Synchronously check whether ffmpeg is available on PATH. */
function findFfmpegSync(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const hasFfmpeg = findFfmpegSync();

/** Check whether the drawtext filter is compiled into ffmpeg. */
function hasDrawtextFilter(): boolean {
  if (!hasFfmpeg) return false;
  try {
    const out = execFileSync('ffmpeg', ['-filters'], { encoding: 'utf8', timeout: 5000 });
    return out.includes('drawtext');
  } catch {
    return false;
  }
}

const hasDrawtext = hasDrawtextFilter();

if (!hasFfmpeg) {
  // eslint-disable-next-line no-console
  console.warn(
    '[integration/ffmpeg] ffmpeg/ffprobe not found on PATH — all ffmpeg integration tests will be skipped.',
  );
} else if (!hasDrawtext) {
  // eslint-disable-next-line no-console
  console.warn(
    '[integration/ffmpeg] ffmpeg drawtext filter not available (needs --enable-libfreetype) — drawtext tests will be skipped.',
  );
}

let testDir: string;
let fixtureVideo: string;
let fixtureVideo2: string;
let fixtureVideoSmall: string;
let fixtureAudio: string;
let fixtureOverlayPng: string;
let fixtureSrt: string;
let client: Client;
let cleanup: () => Promise<void>;

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fileSize(path: string): Promise<number> {
  const s = await stat(path);
  return s.size;
}

interface VideoProbe {
  width: number;
  height: number;
  codec: string;
  frameRate: number;
  duration: number;
  hasAudio: boolean;
}

async function probeVideo(path: string): Promise<VideoProbe> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'stream=index,codec_type,codec_name,width,height,r_frame_rate:format=duration',
    '-print_format',
    'json',
    path,
  ]);
  const p = JSON.parse(stdout) as {
    streams?: Array<{
      codec_type?: string;
      codec_name?: string;
      width?: number;
      height?: number;
      r_frame_rate?: string;
    }>;
    format?: { duration?: string };
  };
  const v = p.streams?.find((s) => s.codec_type === 'video') ?? {};
  const a = p.streams?.find((s) => s.codec_type === 'audio');
  const [num, den] = (v.r_frame_rate ?? '0/1').split('/').map(Number);
  return {
    width: v.width ?? 0,
    height: v.height ?? 0,
    codec: v.codec_name ?? '',
    frameRate: den ? num / den : 0,
    duration: parseFloat(p.format?.duration ?? '0'),
    hasAudio: Boolean(a),
  };
}

interface AudioProbe {
  channels: number;
  sampleRate: number;
  codec: string;
  duration: number;
  hasVideo: boolean;
}

async function probeAudio(path: string): Promise<AudioProbe> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'stream=index,codec_type,codec_name,channels,sample_rate:format=duration',
    '-print_format',
    'json',
    path,
  ]);
  const p = JSON.parse(stdout) as {
    streams?: Array<{
      codec_type?: string;
      codec_name?: string;
      channels?: number;
      sample_rate?: string;
    }>;
    format?: { duration?: string };
  };
  const a = p.streams?.find((s) => s.codec_type === 'audio') ?? {};
  const v = p.streams?.find((s) => s.codec_type === 'video');
  return {
    channels: a.channels ?? 0,
    sampleRate: parseInt(a.sample_rate ?? '0', 10),
    codec: a.codec_name ?? '',
    duration: parseFloat(p.format?.duration ?? '0'),
    hasVideo: Boolean(v),
  };
}

beforeAll(async () => {
  if (!hasFfmpeg) return;

  testDir = join(tmpdir(), `artificer-mcp-ffmpeg-test-${randomUUID()}`);
  await mkdir(testDir, { recursive: true });

  // Generate tiny fixtures via ffmpeg lavfi — no binary fixtures checked in.
  // 2s, 320x240 red, with silent stereo audio at 48kHz.
  fixtureVideo = join(testDir, 'fixture_v.mp4');
  await execFileAsync('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'color=c=red:s=320x240:d=2:r=30',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=cl=stereo:r=48000:d=2',
    '-shortest',
    '-c:v',
    'libx264',
    '-c:a',
    'aac',
    '-pix_fmt',
    'yuv420p',
    fixtureVideo,
  ]);

  // Second fixture — blue, same properties (concat demuxer compatible).
  fixtureVideo2 = join(testDir, 'fixture_v2.mp4');
  await execFileAsync('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'color=c=blue:s=320x240:d=2:r=30',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=cl=stereo:r=48000:d=2',
    '-shortest',
    '-c:v',
    'libx264',
    '-c:a',
    'aac',
    '-pix_fmt',
    'yuv420p',
    fixtureVideo2,
  ]);

  // Small fixture for format-convert test (vp9 encode is slow; keep it tiny).
  fixtureVideoSmall = join(testDir, 'fixture_v_small.mp4');
  await execFileAsync('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'color=c=red:s=160x120:d=1:r=15',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=cl=stereo:r=48000:d=1',
    '-shortest',
    '-c:v',
    'libx264',
    '-c:a',
    'aac',
    '-pix_fmt',
    'yuv420p',
    fixtureVideoSmall,
  ]);

  // 2s, 440Hz sine wave mp3.
  fixtureAudio = join(testDir, 'fixture_a.mp3');
  await execFileAsync('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'sine=f=440:d=2:r=44100',
    '-c:a',
    'libmp3lame',
    '-b:a',
    '128k',
    fixtureAudio,
  ]);

  // 64x64 white PNG for image overlay.
  fixtureOverlayPng = join(testDir, 'fixture_overlay.png');
  await execFileAsync('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'color=c=white:s=64x64:d=1',
    '-frames:v',
    '1',
    fixtureOverlayPng,
  ]);

  // Simple SRT subtitle file.
  fixtureSrt = join(testDir, 'fixture.srt');
  await writeFile(
    fixtureSrt,
    `1\n00:00:00,000 --> 00:00:02,000\nHello subtitles\n`,
    'utf8',
  );

  // Boot MCP server + client.
  const setup = await createTestServerClient();
  client = setup.client;
  cleanup = setup.cleanup;
}, 60_000);

afterAll(async () => {
  if (cleanup) await cleanup();
  if (testDir) {
    await rm(testDir, { recursive: true, force: true }).catch(() => {});
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Video tools (14)
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration: video_concatenate', () => {
  it.skipIf(!hasFfmpeg)('concatenates two identical-codec videos via demuxer', async () => {
    const output = join(testDir, 'concat.mp4');
    await client.callTool({
      name: 'video_concatenate',
      arguments: {
        inputs: [fixtureVideo, fixtureVideo2],
        output,
        reencode: false,
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
    const probe = await probeVideo(output);
    // 2 × 2s clips — allow some tolerance from concat timing.
    expect(probe.duration).toBeGreaterThan(3.5);
    expect(probe.duration).toBeLessThan(4.5);
  }, 30_000);
});

describe('Integration: video_trim', () => {
  it.skipIf(!hasFfmpeg)('trims to a shorter duration', async () => {
    const output = join(testDir, 'trim.mp4');
    await client.callTool({
      name: 'video_trim',
      arguments: {
        input: fixtureVideo,
        output,
        start_seconds: 0,
        duration_seconds: 1,
        reencode: true,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    expect(probe.duration).toBeGreaterThan(0.5);
    expect(probe.duration).toBeLessThan(1.5);
  }, 30_000);
});

describe('Integration: video_change_aspect_ratio', () => {
  it.skipIf(!hasFfmpeg)('reframes 4:3 source to 1:1 via crop', async () => {
    const output = join(testDir, 'aspect.mp4');
    await client.callTool({
      name: 'video_change_aspect_ratio',
      arguments: {
        input: fixtureVideo,
        output,
        aspect_ratio: '1:1',
        mode: 'crop',
        pad_color: 'black',
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    // Source 320x240 -> 1:1 crop -> 240x240.
    expect(probe.width).toBe(240);
    expect(probe.height).toBe(240);
  }, 30_000);
});

describe('Integration: video_convert_format', () => {
  it.skipIf(!hasFfmpeg)('converts mp4 → webm with vp9/opus', async () => {
    const output = join(testDir, 'convert.webm');
    await client.callTool({
      name: 'video_convert_format',
      arguments: {
        input: fixtureVideoSmall,
        output,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    expect(probe.codec).toBe('vp9');
    const audio = await probeAudio(output);
    expect(audio.codec).toBe('opus');
  }, 60_000);
});

describe('Integration: video_change_speed', () => {
  it.skipIf(!hasFfmpeg)('doubles playback speed (duration halves)', async () => {
    const output = join(testDir, 'speed.mp4');
    await client.callTool({
      name: 'video_change_speed',
      arguments: {
        input: fixtureVideo,
        output,
        speed: 2,
        preserve_audio: true,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    expect(probe.duration).toBeGreaterThan(0.7);
    expect(probe.duration).toBeLessThan(1.3);
  }, 30_000);
});

describe('Integration: video_set_resolution', () => {
  it.skipIf(!hasFfmpeg)('resizes to explicit width/height', async () => {
    const output = join(testDir, 'resolution.mp4');
    await client.callTool({
      name: 'video_set_resolution',
      arguments: {
        input: fixtureVideo,
        output,
        width: 160,
        height: 120,
        preserve_aspect_ratio: false,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    expect(probe.width).toBe(160);
    expect(probe.height).toBe(120);
  }, 30_000);
});

describe('Integration: video_add_transitions', () => {
  it.skipIf(!hasFfmpeg)('joins two videos with an xfade', async () => {
    const output = join(testDir, 'transitions.mp4');
    await client.callTool({
      name: 'video_add_transitions',
      arguments: {
        inputs: [fixtureVideo, fixtureVideo2],
        output,
        transition: 'fade',
        duration: 0.5,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    // Two 2s clips with a 0.5s crossfade ≈ 3.5s total.
    expect(probe.duration).toBeGreaterThan(3.0);
    expect(probe.duration).toBeLessThan(4.0);
  }, 60_000);
});

describe('Integration: video_add_image_overlay', () => {
  it.skipIf(!hasFfmpeg)('overlays an image on a video', async () => {
    const output = join(testDir, 'image_overlay.mp4');
    await client.callTool({
      name: 'video_add_image_overlay',
      arguments: {
        input: fixtureVideo,
        overlay: fixtureOverlayPng,
        output,
        x: 10,
        y: 10,
        opacity: 1,
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
    const probe = await probeVideo(output);
    expect(probe.duration).toBeGreaterThan(1.5);
  }, 30_000);
});

describe('Integration: video_add_text_overlay', () => {
  it.skipIf(!hasFfmpeg || !hasDrawtext)('burns text onto a video via drawtext (uses bundled font)', async () => {
    const output = join(testDir, 'text_overlay.mp4');
    const result = await client.callTool({
      name: 'video_add_text_overlay',
      arguments: {
        input: fixtureVideo,
        output,
        text: 'Hello',
        font_file: TEST_FONT,
        font_size: 32,
        color: 'white',
        x: 10,
        y: 10,
        box: false,
        box_color: 'black@0.5',
        box_border_width: 10,
      },
    });

    const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? '';
    expect(result.isError, `tool error: ${text}`).not.toBe(true);
    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
  }, 30_000);

  it.skipIf(!hasFfmpeg || !hasDrawtext)('handles text with special chars (colons, quotes)', async () => {
    const output = join(testDir, 'text_overlay_special.mp4');
    const result = await client.callTool({
      name: 'video_add_text_overlay',
      arguments: {
        input: fixtureVideo,
        output,
        text: `It's 3:45`,
        font_file: TEST_FONT,
        font_size: 32,
        color: 'white',
        x: 10,
        y: 10,
        box: false,
        box_color: 'black@0.5',
        box_border_width: 10,
      },
    });

    const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? '';
    expect(result.isError, `tool error: ${text}`).not.toBe(true);
    expect(await fileExists(output)).toBe(true);
  }, 30_000);
});

describe('Integration: video_add_subtitles', () => {
  it.skipIf(!hasFfmpeg)('burns subtitles via the subtitles filter', async () => {
    const output = join(testDir, 'subtitles.mp4');
    await client.callTool({
      name: 'video_add_subtitles',
      arguments: {
        input: fixtureVideo,
        output,
        subtitle_file: fixtureSrt,
        burn_in: true,
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
  }, 30_000);
});

describe('Integration: video_add_b_roll', () => {
  it.skipIf(!hasFfmpeg)('inserts b-roll as a cutaway (replaces duration)', async () => {
    const output = join(testDir, 'broll.mp4');
    await client.callTool({
      name: 'video_add_b_roll',
      arguments: {
        main: fixtureVideo,
        b_roll: fixtureVideo2,
        output,
        insert_at_seconds: 0.5,
        b_roll_duration_seconds: 0.5,
        replace_main_duration: true,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    // Main is 2s; cutaway replaces 0.5s of main — total stays ~2s.
    expect(probe.duration).toBeGreaterThan(1.5);
    expect(probe.duration).toBeLessThan(2.5);
  }, 60_000);
});

describe('Integration: video_set_bitrate', () => {
  it.skipIf(!hasFfmpeg)('re-encodes with a target bitrate', async () => {
    const output = join(testDir, 'bitrate.mp4');
    await client.callTool({
      name: 'video_set_bitrate',
      arguments: {
        input: fixtureVideo,
        output,
        video_bitrate: '200k',
        two_pass: false,
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
  }, 30_000);
});

describe('Integration: video_set_codec', () => {
  it.skipIf(!hasFfmpeg)('switches video codec to libx265 (hevc)', async () => {
    const output = join(testDir, 'codec.mp4');
    await client.callTool({
      name: 'video_set_codec',
      arguments: {
        input: fixtureVideo,
        output,
        video_codec: 'libx265',
        crf: 28,
        preset: 'ultrafast',
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    expect(probe.codec).toBe('hevc');
  }, 60_000);
});

describe('Integration: video_set_frame_rate', () => {
  it.skipIf(!hasFfmpeg)('changes frame rate to 15fps', async () => {
    const output = join(testDir, 'framerate.mp4');
    await client.callTool({
      name: 'video_set_frame_rate',
      arguments: {
        input: fixtureVideo,
        output,
        frame_rate: 15,
        drop_duplicate_frames: true,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeVideo(output);
    expect(probe.frameRate).toBeCloseTo(15, 0);
  }, 30_000);
});

// ═══════════════════════════════════════════════════════════════════════════
// Audio tools (8)
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration: audio_extract_from_video', () => {
  it.skipIf(!hasFfmpeg)('extracts the audio track (no video stream in output)', async () => {
    const output = join(testDir, 'extracted.mp3');
    await client.callTool({
      name: 'audio_extract_from_video',
      arguments: {
        input: fixtureVideo,
        output,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeAudio(output);
    expect(probe.hasVideo).toBe(false);
    expect(probe.codec).toBe('mp3');
  }, 30_000);
});

describe('Integration: audio_normalize', () => {
  it.skipIf(!hasFfmpeg)('applies loudnorm filter without error', async () => {
    const output = join(testDir, 'normalized.mp3');
    await client.callTool({
      name: 'audio_normalize',
      arguments: {
        input: fixtureAudio,
        output,
        mode: 'loudnorm',
        target_lufs: -14,
        target_peak_db: -1,
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
  }, 30_000);
});

describe('Integration: audio_convert_format', () => {
  it.skipIf(!hasFfmpeg)('converts mp3 → ogg (vorbis)', async () => {
    const output = join(testDir, 'converted.ogg');
    await client.callTool({
      name: 'audio_convert_format',
      arguments: {
        input: fixtureAudio,
        output,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeAudio(output);
    expect(probe.codec).toBe('vorbis');
  }, 30_000);
});

describe('Integration: audio_convert_properties', () => {
  it.skipIf(!hasFfmpeg)('changes sample rate + channels + bitrate in one pass', async () => {
    const output = join(testDir, 'props.mp3');
    await client.callTool({
      name: 'audio_convert_properties',
      arguments: {
        input: fixtureAudio,
        output,
        sample_rate: 22050,
        channels: 1,
        bitrate: '64k',
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeAudio(output);
    expect(probe.sampleRate).toBe(22050);
    expect(probe.channels).toBe(1);
  }, 30_000);
});

describe('Integration: audio_set_bitrate', () => {
  it.skipIf(!hasFfmpeg)('re-encodes at a target bitrate', async () => {
    const output = join(testDir, 'bitrate.mp3');
    await client.callTool({
      name: 'audio_set_bitrate',
      arguments: {
        input: fixtureAudio,
        output,
        bitrate: '64k',
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
  }, 30_000);
});

describe('Integration: audio_set_channels', () => {
  it.skipIf(!hasFfmpeg)('downmixes stereo-like source to mono', async () => {
    const output = join(testDir, 'mono.mp3');
    await client.callTool({
      name: 'audio_set_channels',
      arguments: {
        input: fixtureAudio,
        output,
        channels: 1,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeAudio(output);
    expect(probe.channels).toBe(1);
  }, 30_000);
});

describe('Integration: audio_set_sample_rate', () => {
  it.skipIf(!hasFfmpeg)('resamples to 22050 Hz', async () => {
    const output = join(testDir, 'resampled.mp3');
    await client.callTool({
      name: 'audio_set_sample_rate',
      arguments: {
        input: fixtureAudio,
        output,
        sample_rate: 22050,
      },
    });

    expect(await fileExists(output)).toBe(true);
    const probe = await probeAudio(output);
    expect(probe.sampleRate).toBe(22050);
  }, 30_000);
});

describe('Integration: audio_remove_silence', () => {
  it.skipIf(!hasFfmpeg)('applies silenceremove filter (with areverse trick for end mode)', async () => {
    const output = join(testDir, 'desilenced.mp3');
    await client.callTool({
      name: 'audio_remove_silence',
      arguments: {
        input: fixtureAudio,
        output,
        threshold_db: -50,
        min_silence_duration: 0.1,
        remove: 'both',
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);
  }, 30_000);
});

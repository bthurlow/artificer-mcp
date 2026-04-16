import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { ffmpegBatch, VIDEO_ASPECT_RATIOS, VIDEO_RESOLUTIONS } from '../utils/exec-ffmpeg.js';
import { tempPath } from '../utils/exec.js';
import {
  type VideoConcatenateParams,
  type VideoTrimParams,
  type VideoChangeAspectRatioParams,
  type VideoConvertFormatParams,
  type VideoChangeSpeedParams,
  type VideoSetResolutionParams,
  videoConcatenateSchema,
  videoTrimSchema,
  videoChangeAspectRatioSchema,
  videoConvertFormatSchema,
  videoChangeSpeedSchema,
  videoSetResolutionSchema,
} from './types.js';

/** Shell-escape a path for FFmpeg concat-demuxer manifest files. */
function escapeConcatPath(path: string): string {
  // Concat demuxer wants single-quoted paths; escape any existing single quotes.
  return `'${path.replace(/'/g, `'\\''`)}'`;
}

/**
 * Parse an aspect ratio string like "9:16" or a known preset into w:h numbers.
 */
function parseAspectRatio(input: string): { w: number; h: number } {
  const preset = VIDEO_ASPECT_RATIOS[input];
  if (preset) return preset;
  const match = /^(\d+)\s*:\s*(\d+)$/.exec(input);
  if (!match) {
    throw new Error(`Invalid aspect_ratio: ${input}. Use "W:H" (e.g., "16:9") or a known preset.`);
  }
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!w || !h) throw new Error(`aspect_ratio must have positive W and H: ${input}`);
  return { w, h };
}

/**
 * Register video post-processing tools with the MCP server.
 *
 * Covers: video_concatenate, video_trim, video_change_aspect_ratio,
 * video_convert_format, video_change_speed, video_set_resolution.
 */
export function registerVideoTools(server: McpServer): void {
  // ── video_concatenate ───────────────────────────────────────────────────
  registerTool<VideoConcatenateParams>(
    server,
    'video_concatenate',
    'Concatenate videos end-to-end. Use reencode=false for identical codecs/resolutions (fast stream copy) or reencode=true for mixed formats (slower but robust).',
    videoConcatenateSchema.shape,
    async ({ inputs, output, reencode }) => {
      await mkdir(dirname(output), { recursive: true });

      if (!reencode) {
        // Concat demuxer — fast, requires identical streams.
        const manifest = inputs.map((p) => `file ${escapeConcatPath(p)}`).join('\n');
        const manifestPath = tempPath('.txt');
        await writeFile(manifestPath, manifest);
        try {
          await ffmpegBatch([
            '-y',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            manifestPath,
            '-c',
            'copy',
            output,
          ]);
        } finally {
          await rm(manifestPath, { force: true });
        }
      } else {
        // Concat filter — re-encodes, handles mixed inputs.
        const args: string[] = ['-y'];
        for (const p of inputs) {
          args.push('-i', p);
        }
        const streamSpec = inputs.map((_, i) => `[${i}:v:0][${i}:a:0]`).join('');
        const filter = `${streamSpec}concat=n=${inputs.length}:v=1:a=1[outv][outa]`;
        args.push('-filter_complex', filter, '-map', '[outv]', '-map', '[outa]', output);
        await ffmpegBatch(args);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Concatenated ${inputs.length} videos → ${output} (${reencode ? 're-encoded' : 'stream copy'})`,
          },
        ],
      };
    },
  );

  // ── video_trim ──────────────────────────────────────────────────────────
  registerTool<VideoTrimParams>(
    server,
    'video_trim',
    'Trim a video to a time range. Specify duration_seconds OR end_seconds (not both). Set reencode=true for frame-accurate cuts.',
    videoTrimSchema.shape,
    async ({ input, output, start_seconds, duration_seconds, end_seconds, reencode }) => {
      if (duration_seconds !== undefined && end_seconds !== undefined) {
        throw new Error('Specify duration_seconds OR end_seconds, not both');
      }
      await mkdir(dirname(output), { recursive: true });

      const args: string[] = ['-y', '-ss', String(start_seconds), '-i', input];
      if (duration_seconds !== undefined) {
        args.push('-t', String(duration_seconds));
      } else if (end_seconds !== undefined) {
        args.push('-to', String(end_seconds));
      }
      if (reencode) {
        args.push('-c:v', 'libx264', '-c:a', 'aac');
      } else {
        args.push('-c', 'copy');
      }
      args.push(output);

      await ffmpegBatch(args);
      return {
        content: [
          {
            type: 'text',
            text: `Trimmed ${input} from ${start_seconds}s → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_change_aspect_ratio ───────────────────────────────────────────
  registerTool<VideoChangeAspectRatioParams>(
    server,
    'video_change_aspect_ratio',
    'Reframe a video to a target aspect ratio by cropping or padding. Useful for converting landscape → portrait (9:16) for Reels/Shorts.',
    videoChangeAspectRatioSchema.shape,
    async ({ input, output, aspect_ratio, mode, pad_color }) => {
      const { w, h } = parseAspectRatio(aspect_ratio);
      await mkdir(dirname(output), { recursive: true });

      // Build a filter that either crops to target ratio or pads to it.
      // Using input width/height via `iw`/`ih`, crop/pad preserves original pixels where possible.
      const filter =
        mode === 'crop'
          ? `crop='if(gt(iw/ih,${w}/${h}),ih*${w}/${h},iw)':'if(gt(iw/ih,${w}/${h}),ih,iw*${h}/${w})'`
          : `pad=width='if(gt(iw/ih,${w}/${h}),iw,ih*${w}/${h})':height='if(gt(iw/ih,${w}/${h}),iw*${h}/${w},ih)':x='(ow-iw)/2':y='(oh-ih)/2':color=${pad_color}`;

      await ffmpegBatch([
        '-y',
        '-i',
        input,
        '-vf',
        filter,
        '-c:v',
        'libx264',
        '-c:a',
        'copy',
        output,
      ]);

      return {
        content: [
          {
            type: 'text',
            text: `Reframed to ${aspect_ratio} via ${mode} → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_convert_format ────────────────────────────────────────────────
  registerTool<VideoConvertFormatParams>(
    server,
    'video_convert_format',
    'Convert a video to a different container format (mp4/webm/mov/mkv/avi/flv). Re-encodes video/audio to a sensible default for the target container.',
    videoConvertFormatSchema.shape,
    async ({ input, output, format }) => {
      await mkdir(dirname(output), { recursive: true });

      const args: string[] = ['-y', '-i', input];

      // Pick sensible codec defaults per target format.
      const targetExt = (format ?? output.split('.').pop() ?? '').toLowerCase();
      switch (targetExt) {
        case 'webm':
          args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus');
          break;
        case 'mp4':
        case 'mov':
          args.push('-c:v', 'libx264', '-c:a', 'aac');
          break;
        default:
          // For mkv/avi/flv, let FFmpeg pick defaults — or fall back to h264/aac.
          args.push('-c:v', 'libx264', '-c:a', 'aac');
      }

      if (format) {
        args.push('-f', format);
      }
      args.push(output);

      await ffmpegBatch(args);
      return {
        content: [
          {
            type: 'text',
            text: `Converted ${input} → ${output} (${targetExt || format || 'inferred'})`,
          },
        ],
      };
    },
  );

  // ── video_change_speed ──────────────────────────────────────────────────
  registerTool<VideoChangeSpeedParams>(
    server,
    'video_change_speed',
    'Change playback speed. speed > 1 is faster, speed < 1 is slower. preserve_audio requires speed in [0.5, 2.0].',
    videoChangeSpeedSchema.shape,
    async ({ input, output, speed, preserve_audio }) => {
      if (speed <= 0) throw new Error('speed must be positive');
      await mkdir(dirname(output), { recursive: true });

      // Video: setpts is the inverse of the speed multiplier.
      // Audio: atempo's valid range is [0.5, 2.0] per filter instance.
      const vpts = (1 / speed).toFixed(6);

      const args: string[] = ['-y', '-i', input];
      if (preserve_audio) {
        if (speed < 0.5 || speed > 2.0) {
          throw new Error(
            'preserve_audio=true requires speed in [0.5, 2.0]. Set preserve_audio=false for extreme speeds.',
          );
        }
        args.push(
          '-filter_complex',
          `[0:v]setpts=${vpts}*PTS[v];[0:a]atempo=${speed}[a]`,
          '-map',
          '[v]',
          '-map',
          '[a]',
        );
      } else {
        args.push('-vf', `setpts=${vpts}*PTS`, '-an');
      }
      args.push('-c:v', 'libx264');
      if (preserve_audio) args.push('-c:a', 'aac');
      args.push(output);

      await ffmpegBatch(args);
      return {
        content: [
          {
            type: 'text',
            text: `Speed ${speed}× → ${output}${preserve_audio ? '' : ' (audio dropped)'}`,
          },
        ],
      };
    },
  );

  // ── video_set_resolution ────────────────────────────────────────────────
  registerTool<VideoSetResolutionParams>(
    server,
    'video_set_resolution',
    'Resize video to a target resolution. Use preset (480p/720p/1080p/1440p/4k) or explicit width/height. preserve_aspect_ratio=true fits within the target box.',
    videoSetResolutionSchema.shape,
    async ({ input, output, width, height, preset, preserve_aspect_ratio }) => {
      await mkdir(dirname(output), { recursive: true });

      let targetW: number;
      let targetH: number;
      if (preset) {
        const p = VIDEO_RESOLUTIONS[preset];
        if (!p) {
          throw new Error(
            `Unknown preset: ${preset}. Known: ${Object.keys(VIDEO_RESOLUTIONS).join(', ')}`,
          );
        }
        targetW = p.width;
        targetH = p.height;
      } else {
        if (!width && !height) {
          throw new Error('Must specify preset, or at least one of width/height');
        }
        targetW = width ?? -2;
        targetH = height ?? -2;
      }

      // FFmpeg scale filter: -2 means "auto to keep aspect ratio, divisible by 2"
      const scaleArg = preserve_aspect_ratio
        ? `scale=${targetW === -2 ? -2 : `'min(${targetW},iw)'`}:${targetH === -2 ? -2 : `'min(${targetH},ih)'`}:force_original_aspect_ratio=decrease`
        : `scale=${targetW}:${targetH}`;

      await ffmpegBatch([
        '-y',
        '-i',
        input,
        '-vf',
        scaleArg,
        '-c:v',
        'libx264',
        '-c:a',
        'copy',
        output,
      ]);

      return {
        content: [
          {
            type: 'text',
            text: `Resized to ${preset ?? `${targetW}x${targetH}`} → ${output}`,
          },
        ],
      };
    },
  );
}

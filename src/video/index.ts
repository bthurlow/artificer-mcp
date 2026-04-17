import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { registerTool } from '../utils/register.js';
import {
  ffmpegBatch,
  getVideoInfo,
  VIDEO_ASPECT_RATIOS,
  VIDEO_RESOLUTIONS,
} from '../utils/exec-ffmpeg.js';
import { tempPath } from '../utils/exec.js';
import {
  type VideoConcatenateParams,
  type VideoTrimParams,
  type VideoChangeAspectRatioParams,
  type VideoConvertFormatParams,
  type VideoChangeSpeedParams,
  type VideoSetResolutionParams,
  type VideoAddTransitionsParams,
  type VideoAddImageOverlayParams,
  type VideoAddTextOverlayParams,
  type VideoAddSubtitlesParams,
  type VideoAddBRollParams,
  type VideoSetBitrateParams,
  type VideoSetCodecParams,
  type VideoSetFrameRateParams,
  videoConcatenateSchema,
  videoTrimSchema,
  videoChangeAspectRatioSchema,
  videoConvertFormatSchema,
  videoChangeSpeedSchema,
  videoSetResolutionSchema,
  videoAddTransitionsSchema,
  videoAddImageOverlaySchema,
  videoAddTextOverlaySchema,
  videoAddSubtitlesSchema,
  videoAddBRollSchema,
  videoSetBitrateSchema,
  videoSetCodecSchema,
  videoSetFrameRateSchema,
} from './types.js';

/** Escape a file path for the subtitles filter (colons on Windows break it). */
function escapeSubtitlePath(path: string): string {
  // Replace backslashes with forward, escape any colon (Windows drive letters).
  return path.replace(/\\/g, '/').replace(/:/g, '\\:');
}

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
    'Concatenate videos end-to-end. By default uses hard cuts (fast stream copy). Pass `transition` (e.g., "fade", "wipeleft") to blend clips with xfade crossfades — this implicitly re-encodes and requires identical resolution/frame rate.',
    videoConcatenateSchema.shape,
    async ({ inputs, output, reencode, transition, transition_duration }) => {
      await mkdir(dirname(output), { recursive: true });

      if (transition) {
        // Transition mode — chain xfade filters between each pair.
        // Requires identical resolution/frame rate across inputs.
        const infos = await Promise.all(inputs.slice(0, -1).map((p) => getVideoInfo(p)));

        const videoChain: string[] = [];
        const audioChain: string[] = [];
        let vPrev = '[0:v]';
        let aPrev = '[0:a]';
        let runningOffset = 0;
        for (let i = 0; i < infos.length; i++) {
          runningOffset += infos[i].durationSeconds - transition_duration;
          const vLabel = i === infos.length - 1 ? '[vout]' : `[v${i + 1}]`;
          const aLabel = i === infos.length - 1 ? '[aout]' : `[a${i + 1}]`;
          videoChain.push(
            `${vPrev}[${i + 1}:v]xfade=transition=${transition}:duration=${transition_duration}:offset=${runningOffset.toFixed(3)}${vLabel}`,
          );
          audioChain.push(`${aPrev}[${i + 1}:a]acrossfade=d=${transition_duration}${aLabel}`);
          vPrev = vLabel;
          aPrev = aLabel;
        }
        const filter = [...videoChain, ...audioChain].join(';');

        const args: string[] = ['-y'];
        for (const p of inputs) args.push('-i', p);
        args.push(
          '-filter_complex',
          filter,
          '-map',
          '[vout]',
          '-map',
          '[aout]',
          '-c:v',
          'libx264',
          // Force yuv420p so consumer players (QuickTime, mobile, browsers) can decode.
          // Without this, libx264 picks yuv444p from some filter-chain inputs and the
          // output is a 4:4:4 High Predictive profile that most clients can't play.
          '-pix_fmt',
          'yuv420p',
          '-c:a',
          'aac',
          output,
        );
        await ffmpegBatch(args);

        return {
          content: [
            {
              type: 'text',
              text: `Concatenated ${inputs.length} videos with ${transition} transitions (${transition_duration}s) → ${output}`,
            },
          ],
        };
      }

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

  // ── video_add_transitions ───────────────────────────────────────────────
  registerTool<VideoAddTransitionsParams>(
    server,
    'video_add_transitions',
    'Join videos with xfade transitions between each pair. Inputs must share resolution/frame rate; use video_set_resolution first if not. See FFmpeg xfade docs for transition names.',
    videoAddTransitionsSchema.shape,
    async ({ inputs, output, transition, duration }) => {
      await mkdir(dirname(output), { recursive: true });

      // Probe durations of all but the last input so we can place each xfade at the right offset.
      const infos = await Promise.all(inputs.slice(0, -1).map((p) => getVideoInfo(p)));

      // Build chained xfade filter:
      //   [0:v][1:v]xfade=transition=fade:duration=1:offset=<d0 - D>[v01];
      //   [v01][2:v]xfade=...offset=<d0 + d1 - 2D>[v012];
      //   Audio handled separately via acrossfade chain.
      const videoChain: string[] = [];
      const audioChain: string[] = [];
      let vPrev = '[0:v]';
      let aPrev = '[0:a]';
      let runningOffset = 0;
      for (let i = 0; i < infos.length; i++) {
        runningOffset += infos[i].durationSeconds - duration;
        const vLabel = i === infos.length - 1 ? '[vout]' : `[v${i + 1}]`;
        const aLabel = i === infos.length - 1 ? '[aout]' : `[a${i + 1}]`;
        videoChain.push(
          `${vPrev}[${i + 1}:v]xfade=transition=${transition}:duration=${duration}:offset=${runningOffset.toFixed(3)}${vLabel}`,
        );
        audioChain.push(`${aPrev}[${i + 1}:a]acrossfade=d=${duration}${aLabel}`);
        vPrev = vLabel;
        aPrev = aLabel;
      }
      const filter = [...videoChain, ...audioChain].join(';');

      const args: string[] = ['-y'];
      for (const p of inputs) args.push('-i', p);
      args.push(
        '-filter_complex',
        filter,
        '-map',
        '[vout]',
        '-map',
        '[aout]',
        '-c:v',
        'libx264',
        // yuv420p for consumer-player compatibility — see comment in video_concatenate.
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        output,
      );

      await ffmpegBatch(args);

      return {
        content: [
          {
            type: 'text',
            text: `Joined ${inputs.length} videos with ${transition} transitions → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_add_image_overlay ─────────────────────────────────────────────
  registerTool<VideoAddImageOverlayParams>(
    server,
    'video_add_image_overlay',
    'Overlay an image (logo, watermark, badge) on a video. Supports opacity and optional time range.',
    videoAddImageOverlaySchema.shape,
    async ({ input, overlay, output, x, y, opacity, start_seconds, end_seconds }) => {
      await mkdir(dirname(output), { recursive: true });

      // If opacity < 1, pre-apply alpha to the overlay stream.
      // Time-bound with enable='between(t,start,end)' when either is set.
      const enableClause =
        start_seconds !== undefined || end_seconds !== undefined
          ? `:enable='between(t,${start_seconds ?? 0},${end_seconds ?? 999999})'`
          : '';

      let filter: string;
      if (opacity < 1) {
        filter = `[1:v]format=rgba,colorchannelmixer=aa=${opacity}[ov];[0:v][ov]overlay=${x}:${y}${enableClause}[vout]`;
      } else {
        filter = `[0:v][1:v]overlay=${x}:${y}${enableClause}[vout]`;
      }

      await ffmpegBatch([
        '-y',
        '-i',
        input,
        '-i',
        overlay,
        '-filter_complex',
        filter,
        '-map',
        '[vout]',
        '-map',
        '0:a?',
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
            text: `Added image overlay at (${x}, ${y}) → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_add_text_overlay ──────────────────────────────────────────────
  registerTool<VideoAddTextOverlayParams>(
    server,
    'video_add_text_overlay',
    'Burn text onto a video via the drawtext filter. Supports time-bounded display, background box, and custom font file.',
    videoAddTextOverlaySchema.shape,
    async ({
      input,
      output,
      text,
      font_file,
      font_size,
      color,
      x,
      y,
      box,
      box_color,
      box_border_width,
      start_seconds,
      end_seconds,
    }) => {
      await mkdir(dirname(output), { recursive: true });

      // Some FFmpeg builds on Windows don't respect `\:` escaping inside
      // drawtext option values — the filter parser splits on `:` regardless.
      // Single quotes protect `:` but can't contain `'`. Using a textfile=
      // approach bypasses all escaping: we write the raw text to a CWD-
      // relative temp file (just a filename, no directory — so no colons on
      // Windows), pass its name via textfile=, and clean up after.
      const textFileName = `.drawtext-${Date.now()}.txt`;
      await writeFile(textFileName, text);

      const parts: string[] = [
        `textfile=${textFileName}`,
        `fontsize=${font_size}`,
        `fontcolor=${color}`,
      ];
      if (font_file) {
        // Also strip Windows drive-letter colons from the font file path.
        let fontPath = font_file.replace(/\\/g, '/');
        if (/^[A-Za-z]:/.test(fontPath)) {
          const cwd = process.cwd().replace(/\\/g, '/');
          if (fontPath.toLowerCase().startsWith(cwd.toLowerCase() + '/')) {
            fontPath = fontPath.slice(cwd.length + 1);
          }
        }
        parts.push(`fontfile=${fontPath}`);
      }
      parts.push(`x=${typeof x === 'number' ? x : x}`, `y=${typeof y === 'number' ? y : y}`);
      if (box) {
        parts.push('box=1', `boxcolor=${box_color}`, `boxborderw=${box_border_width}`);
      }
      if (start_seconds !== undefined || end_seconds !== undefined) {
        parts.push(`enable='between(t,${start_seconds ?? 0},${end_seconds ?? 999999})'`);
      }

      const filter = `drawtext=${parts.join(':')}`;

      try {
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
      } finally {
        await rm(textFileName, { force: true });
      }

      return {
        content: [
          {
            type: 'text',
            text: `Added text overlay "${text}" → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_add_subtitles ─────────────────────────────────────────────────
  registerTool<VideoAddSubtitlesParams>(
    server,
    'video_add_subtitles',
    'Add subtitles from an SRT/VTT/ASS file. burn_in=true renders them into the pixels (always visible); burn_in=false muxes as a soft track (toggleable in player).',
    videoAddSubtitlesSchema.shape,
    async ({ input, output, subtitle_file, burn_in, force_style }) => {
      await mkdir(dirname(output), { recursive: true });

      if (burn_in) {
        // Use the `subtitles` filter — requires libass support compiled in.
        const escaped = escapeSubtitlePath(subtitle_file);
        const styleClause = force_style ? `:force_style='${force_style}'` : '';
        const filter = `subtitles='${escaped}'${styleClause}`;
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
      } else {
        // Mux subtitles as a soft track. Codec depends on container; mov_text for mp4/mov.
        const ext = output.split('.').pop()?.toLowerCase() ?? '';
        const subCodec = ext === 'mp4' || ext === 'mov' ? 'mov_text' : 'srt';
        await ffmpegBatch([
          '-y',
          '-i',
          input,
          '-i',
          subtitle_file,
          '-c:v',
          'copy',
          '-c:a',
          'copy',
          '-c:s',
          subCodec,
          output,
        ]);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Added subtitles (${burn_in ? 'burned in' : 'soft track'}) → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_add_b_roll ────────────────────────────────────────────────────
  registerTool<VideoAddBRollParams>(
    server,
    'video_add_b_roll',
    'Insert a b-roll clip into the main video at a specific time. replace_main_duration=true cuts that segment out of the main (preserving main audio — cutaway style); false inserts additionally (extends length).',
    videoAddBRollSchema.shape,
    async ({
      main,
      b_roll,
      output,
      insert_at_seconds,
      b_roll_duration_seconds,
      replace_main_duration,
    }) => {
      await mkdir(dirname(output), { recursive: true });

      const t0 = insert_at_seconds;
      const d = b_roll_duration_seconds;
      const postStart = replace_main_duration ? t0 + d : t0;

      // Split main into pre (0..t0) and post (postStart..end).
      // Keep main's audio over both pre and b-roll span (cutaway); then post audio.
      //
      // Graph:
      //  [0:v]trim=0:t0,setpts=PTS-STARTPTS[preV]
      //  [0:v]trim=postStart,setpts=PTS-STARTPTS[postV]
      //  [1:v]trim=0:d,setpts=PTS-STARTPTS,scale=...[brV]
      //  [0:a]atrim=0:t0+d,asetpts=PTS-STARTPTS[firstA]   (keep main audio over cutaway)
      //  [0:a]atrim=postStart,asetpts=PTS-STARTPTS[postA]
      //  [preV][firstA][brV][postV][postA]... but that mixes streams oddly.
      //
      // Simpler correct graph for replace_main_duration=true:
      //  video: [preV][brV][postV] concat(v=1,a=0)
      //  audio: [main_audio_0_to_t0][main_audio_t0_to_t0+d][main_audio_postStart_to_end] concat
      //          = full main audio from 0..end spliced around the cutaway region,
      //            BUT since audio covers the whole span naturally, we just use main audio as-is.
      //
      // For replace_main_duration=false: insert b-roll with b-roll audio (or silence) in between.

      const parts: string[] = [];
      if (replace_main_duration) {
        parts.push(`[0:v]trim=0:${t0},setpts=PTS-STARTPTS[preV]`);
        parts.push(`[1:v]trim=0:${d},setpts=PTS-STARTPTS[brV]`);
        parts.push(`[0:v]trim=${postStart},setpts=PTS-STARTPTS[postV]`);
        parts.push(`[preV][brV][postV]concat=n=3:v=1:a=0[vout]`);
        // For audio: keep main's audio continuous — just reuse [0:a] as is.
        const filter = parts.join(';');
        await ffmpegBatch([
          '-y',
          '-i',
          main,
          '-i',
          b_roll,
          '-filter_complex',
          filter,
          '-map',
          '[vout]',
          '-map',
          '0:a?',
          '-c:v',
          'libx264',
          '-c:a',
          'aac',
          output,
        ]);
      } else {
        // Insert b-roll (with its audio) at t0, extending total length by d.
        parts.push(`[0:v]trim=0:${t0},setpts=PTS-STARTPTS[preV]`);
        parts.push(`[0:a]atrim=0:${t0},asetpts=PTS-STARTPTS[preA]`);
        parts.push(`[1:v]trim=0:${d},setpts=PTS-STARTPTS[brV]`);
        parts.push(`[1:a]atrim=0:${d},asetpts=PTS-STARTPTS[brA]`);
        parts.push(`[0:v]trim=${t0},setpts=PTS-STARTPTS[postV]`);
        parts.push(`[0:a]atrim=${t0},asetpts=PTS-STARTPTS[postA]`);
        parts.push(`[preV][preA][brV][brA][postV][postA]concat=n=3:v=1:a=1[vout][aout]`);
        const filter = parts.join(';');
        await ffmpegBatch([
          '-y',
          '-i',
          main,
          '-i',
          b_roll,
          '-filter_complex',
          filter,
          '-map',
          '[vout]',
          '-map',
          '[aout]',
          '-c:v',
          'libx264',
          '-c:a',
          'aac',
          output,
        ]);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Inserted ${d}s of b-roll at ${t0}s (${replace_main_duration ? 'cutaway' : 'additive'}) → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_set_bitrate ───────────────────────────────────────────────────
  registerTool<VideoSetBitrateParams>(
    server,
    'video_set_bitrate',
    'Re-encode with a target video and/or audio bitrate. Use two_pass=true for more accurate bitrate targeting on longer clips.',
    videoSetBitrateSchema.shape,
    async ({ input, output, video_bitrate, audio_bitrate, two_pass }) => {
      if (!video_bitrate && !audio_bitrate) {
        throw new Error('Specify at least one of video_bitrate or audio_bitrate');
      }
      await mkdir(dirname(output), { recursive: true });

      const baseArgs: string[] = ['-y', '-i', input, '-c:v', 'libx264'];
      if (video_bitrate) baseArgs.push('-b:v', video_bitrate);
      if (audio_bitrate) baseArgs.push('-c:a', 'aac', '-b:a', audio_bitrate);
      else baseArgs.push('-c:a', 'copy');

      if (two_pass && video_bitrate) {
        const passLog = tempPath('.log');
        try {
          // Pass 1: write null output, just collect stats.
          await ffmpegBatch([
            ...baseArgs,
            '-pass',
            '1',
            '-passlogfile',
            passLog,
            '-f',
            'mp4',
            '/dev/null',
          ]);
          // Pass 2: encode with stats.
          await ffmpegBatch([...baseArgs, '-pass', '2', '-passlogfile', passLog, output]);
        } finally {
          await rm(`${passLog}-0.log`, { force: true }).catch(() => {});
          await rm(`${passLog}-0.log.mbtree`, { force: true }).catch(() => {});
        }
      } else {
        await ffmpegBatch([...baseArgs, output]);
      }

      const parts: string[] = [];
      if (video_bitrate) parts.push(`video=${video_bitrate}`);
      if (audio_bitrate) parts.push(`audio=${audio_bitrate}`);
      return {
        content: [
          {
            type: 'text',
            text: `Set bitrate (${parts.join(', ')}${two_pass ? ', 2-pass' : ''}) → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_set_codec ─────────────────────────────────────────────────────
  registerTool<VideoSetCodecParams>(
    server,
    'video_set_codec',
    'Re-encode with specific video and/or audio codecs. Supports quality (CRF) and speed (preset) tuning for x264/x265/AV1.',
    videoSetCodecSchema.shape,
    async ({ input, output, video_codec, audio_codec, crf, preset }) => {
      if (!video_codec && !audio_codec) {
        throw new Error('Specify at least one of video_codec or audio_codec');
      }
      await mkdir(dirname(output), { recursive: true });

      const args: string[] = ['-y', '-i', input];
      if (video_codec) args.push('-c:v', video_codec);
      else args.push('-c:v', 'copy');
      if (audio_codec) args.push('-c:a', audio_codec);
      else args.push('-c:a', 'copy');
      if (crf !== undefined) args.push('-crf', String(crf));
      if (preset) args.push('-preset', preset);
      args.push(output);

      await ffmpegBatch(args);

      const parts: string[] = [];
      if (video_codec) parts.push(`v=${video_codec}`);
      if (audio_codec) parts.push(`a=${audio_codec}`);
      if (crf !== undefined) parts.push(`crf=${crf}`);
      if (preset) parts.push(`preset=${preset}`);
      return {
        content: [
          {
            type: 'text',
            text: `Set codec (${parts.join(', ')}) → ${output}`,
          },
        ],
      };
    },
  );

  // ── video_set_frame_rate ────────────────────────────────────────────────
  registerTool<VideoSetFrameRateParams>(
    server,
    'video_set_frame_rate',
    'Change video frame rate. drop_duplicate_frames=true uses the fps filter (preserves duration by dropping/duplicating frames); false uses -r (simpler but may stretch timing).',
    videoSetFrameRateSchema.shape,
    async ({ input, output, frame_rate, drop_duplicate_frames }) => {
      await mkdir(dirname(output), { recursive: true });

      const args: string[] = ['-y', '-i', input];
      if (drop_duplicate_frames) {
        args.push('-vf', `fps=${frame_rate}`);
      } else {
        args.push('-r', String(frame_rate));
      }
      args.push('-c:v', 'libx264', '-c:a', 'copy', output);

      await ffmpegBatch(args);

      return {
        content: [
          {
            type: 'text',
            text: `Set frame rate to ${frame_rate} fps → ${output}`,
          },
        ],
      };
    },
  );
}

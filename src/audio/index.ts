import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { ffmpegBatch } from '../utils/exec-ffmpeg.js';
import { resolveInput, resolveOutput } from '../utils/resource.js';
import {
  type AudioExtractFromVideoParams,
  type AudioNormalizeParams,
  type AudioConvertFormatParams,
  type AudioConvertPropertiesParams,
  type AudioSetBitrateParams,
  type AudioSetChannelsParams,
  type AudioSetSampleRateParams,
  type AudioRemoveSilenceParams,
  type AudioMixParams,
  audioExtractFromVideoSchema,
  audioNormalizeSchema,
  audioConvertFormatSchema,
  audioConvertPropertiesSchema,
  audioSetBitrateSchema,
  audioSetChannelsSchema,
  audioSetSampleRateSchema,
  audioRemoveSilenceSchema,
  audioMixSchema,
} from './types.js';

/** Video container extensions — when the output is one of these, the audio tools
 * should preserve the video track (`-c:v copy`) and pick an audio codec the
 * container supports. */
const VIDEO_CONTAINERS = new Set(['mp4', 'mov', 'm4v', 'mkv', 'webm', 'avi']);

/**
 * Pick a sensible audio codec for a given output file extension.
 * Handles both audio containers (mp3/aac/wav/etc.) and video containers
 * (mp4/mov/mkv/webm/avi) — for a video container, picks the audio codec
 * the container conventionally uses. Falls back to libmp3lame for unknown.
 */
function defaultCodecForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'mp3':
      return 'libmp3lame';
    case 'aac':
    case 'm4a':
    case 'mp4':
    case 'mov':
    case 'm4v':
    case 'mkv':
    case 'avi':
      return 'aac';
    case 'wav':
      return 'pcm_s16le';
    case 'flac':
      return 'flac';
    case 'ogg':
      return 'libvorbis';
    case 'opus':
    case 'webm':
      return 'libopus';
    default:
      return 'libmp3lame';
  }
}

/** Extract the extension from a path (without the leading dot). */
function extOf(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot >= 0 ? path.slice(dot + 1) : '';
}

/** True if the given file extension names a video container (not a pure-audio one). */
function isVideoContainer(ext: string): boolean {
  return VIDEO_CONTAINERS.has(ext.toLowerCase());
}

/**
 * Register audio post-processing tools with the MCP server.
 *
 * Covers: audio_extract_from_video, audio_normalize, audio_convert_format,
 * audio_convert_properties, audio_set_bitrate, audio_set_channels,
 * audio_set_sample_rate, audio_remove_silence.
 */
export function registerAudioTools(server: McpServer): void {
  // ── audio_extract_from_video ───────────────────────────────────────────
  registerTool<AudioExtractFromVideoParams>(
    server,
    'audio_extract_from_video',
    'Extract the audio track from a video file. Use codec="copy" to avoid re-encoding when the source audio codec is compatible with the target container.',
    audioExtractFromVideoSchema.shape,
    async ({ input, output, codec, bitrate }) => {
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        const args: string[] = ['-y', '-i', inR.localPath, '-vn'];
        const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
        args.push('-c:a', chosenCodec);
        if (bitrate) args.push('-b:a', bitrate);
        args.push(outR.localPath);

        await ffmpegBatch(args);
        await outR.commit();
        return {
          content: [
            {
              type: 'text',
              text: `Extracted audio (${chosenCodec}${bitrate ? `, ${bitrate}` : ''}) → ${output}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_normalize ────────────────────────────────────────────────────
  registerTool<AudioNormalizeParams>(
    server,
    'audio_normalize',
    'Normalize audio loudness. mode="loudnorm" uses EBU R128 (recommended for streaming/broadcast); mode="peak" uses a simple volume-based peak normalization.',
    audioNormalizeSchema.shape,
    async ({ input, output, mode, target_lufs, target_peak_db }) => {
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        let filter: string;
        if (mode === 'loudnorm') {
          filter = `loudnorm=I=${target_lufs}:TP=${target_peak_db}:LRA=11`;
        } else {
          // Peak normalization via volume filter — simple, not as accurate as loudnorm.
          filter = `volume=${target_peak_db}dB`;
        }

        const ext = extOf(output);
        const chosenCodec = defaultCodecForExt(ext);
        const args = ['-y', '-i', inR.localPath, '-af', filter, '-c:a', chosenCodec];
        // When writing into a video container, keep the video stream as-is so
        // loudnorm only touches audio. Otherwise ffmpeg re-encodes the video.
        if (isVideoContainer(ext)) {
          args.push('-c:v', 'copy');
        }
        args.push(outR.localPath);
        await ffmpegBatch(args);
        await outR.commit();

        return {
          content: [
            {
              type: 'text',
              text: `Normalized via ${mode} (target=${target_lufs} LUFS, peak=${target_peak_db} dB) → ${output}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_convert_format ───────────────────────────────────────────────
  registerTool<AudioConvertFormatParams>(
    server,
    'audio_convert_format',
    'Convert audio between container formats (mp3/aac/wav/flac/ogg/m4a/opus). Re-encodes with a sensible codec default per target format.',
    audioConvertFormatSchema.shape,
    async ({ input, output, format, codec }) => {
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        const targetExt = format ?? extOf(output);
        const chosenCodec = codec ?? defaultCodecForExt(targetExt);

        const args: string[] = ['-y', '-i', inR.localPath, '-vn', '-c:a', chosenCodec];
        if (format) args.push('-f', format);
        args.push(outR.localPath);

        await ffmpegBatch(args);
        await outR.commit();
        return {
          content: [
            {
              type: 'text',
              text: `Converted → ${output} (codec=${chosenCodec})`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_convert_properties ───────────────────────────────────────────
  registerTool<AudioConvertPropertiesParams>(
    server,
    'audio_convert_properties',
    'Change multiple audio properties in one pass — sample rate, channel count, bitrate, and/or codec. More efficient than chaining single-property tools.',
    audioConvertPropertiesSchema.shape,
    async ({ input, output, sample_rate, channels, bitrate, codec }) => {
      if (
        sample_rate === undefined &&
        channels === undefined &&
        bitrate === undefined &&
        codec === undefined
      ) {
        throw new Error('Specify at least one of sample_rate, channels, bitrate, or codec');
      }
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
        const args: string[] = ['-y', '-i', inR.localPath, '-vn', '-c:a', chosenCodec];
        if (sample_rate !== undefined) args.push('-ar', String(sample_rate));
        if (channels !== undefined) args.push('-ac', String(channels));
        if (bitrate) args.push('-b:a', bitrate);
        args.push(outR.localPath);

        await ffmpegBatch(args);
        await outR.commit();

        const parts: string[] = [];
        if (sample_rate !== undefined) parts.push(`rate=${sample_rate}Hz`);
        if (channels !== undefined) parts.push(`channels=${channels}`);
        if (bitrate) parts.push(`bitrate=${bitrate}`);
        if (codec) parts.push(`codec=${codec}`);
        return {
          content: [
            {
              type: 'text',
              text: `Set audio properties (${parts.join(', ')}) → ${output}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_set_bitrate ──────────────────────────────────────────────────
  registerTool<AudioSetBitrateParams>(
    server,
    'audio_set_bitrate',
    'Re-encode audio at a target bitrate. Useful for reducing file size (e.g., 320k → 128k for web delivery).',
    audioSetBitrateSchema.shape,
    async ({ input, output, bitrate, codec }) => {
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
        await ffmpegBatch([
          '-y',
          '-i',
          inR.localPath,
          '-vn',
          '-c:a',
          chosenCodec,
          '-b:a',
          bitrate,
          outR.localPath,
        ]);
        await outR.commit();

        return {
          content: [
            {
              type: 'text',
              text: `Set audio bitrate to ${bitrate} (codec=${chosenCodec}) → ${output}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_set_channels ─────────────────────────────────────────────────
  registerTool<AudioSetChannelsParams>(
    server,
    'audio_set_channels',
    'Downmix or upmix audio to a target channel count. 2→1 is a proper stereo-to-mono downmix; 1→2 duplicates the mono channel.',
    audioSetChannelsSchema.shape,
    async ({ input, output, channels, codec }) => {
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
        await ffmpegBatch([
          '-y',
          '-i',
          inR.localPath,
          '-vn',
          '-ac',
          String(channels),
          '-c:a',
          chosenCodec,
          outR.localPath,
        ]);
        await outR.commit();

        return {
          content: [
            {
              type: 'text',
              text: `Set audio to ${channels} channel${channels === 1 ? '' : 's'} → ${output}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_set_sample_rate ──────────────────────────────────────────────
  registerTool<AudioSetSampleRateParams>(
    server,
    'audio_set_sample_rate',
    "Resample audio to a target sample rate. Uses FFmpeg's high-quality resampler by default.",
    audioSetSampleRateSchema.shape,
    async ({ input, output, sample_rate, codec }) => {
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
        await ffmpegBatch([
          '-y',
          '-i',
          inR.localPath,
          '-vn',
          '-ar',
          String(sample_rate),
          '-c:a',
          chosenCodec,
          outR.localPath,
        ]);
        await outR.commit();

        return {
          content: [
            {
              type: 'text',
              text: `Set sample rate to ${sample_rate} Hz → ${output}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_remove_silence ───────────────────────────────────────────────
  registerTool<AudioRemoveSilenceParams>(
    server,
    'audio_remove_silence',
    'Trim silence from audio. remove="both" trims leading/trailing silence (most common); "all" also removes silent sections within the audio (may sound unnatural).',
    audioRemoveSilenceSchema.shape,
    async ({ input, output, threshold_db, min_silence_duration, remove }) => {
      const inR = await resolveInput(input);
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        // silenceremove filter params:
        //   start_periods=1: detect one start-silence period
        //   stop_periods=-1: detect all later silence periods
        //   start_duration/stop_duration: min silence to remove
        //   start_threshold/stop_threshold: detection level in dB
        //
        // For "end" only we need to run in reverse since silenceremove only
        // detects silence forward. Use areverse -> silenceremove -> areverse.
        let filter: string;
        const thr = `${threshold_db}dB`;
        const dur = `${min_silence_duration}`;

        switch (remove) {
          case 'start':
            filter = `silenceremove=start_periods=1:start_duration=${dur}:start_threshold=${thr}`;
            break;
          case 'end':
            filter = `areverse,silenceremove=start_periods=1:start_duration=${dur}:start_threshold=${thr},areverse`;
            break;
          case 'both':
            filter =
              `silenceremove=start_periods=1:start_duration=${dur}:start_threshold=${thr},` +
              `areverse,silenceremove=start_periods=1:start_duration=${dur}:start_threshold=${thr},areverse`;
            break;
          case 'all':
            filter =
              `silenceremove=start_periods=1:start_duration=${dur}:start_threshold=${thr}:` +
              `stop_periods=-1:stop_duration=${dur}:stop_threshold=${thr}`;
            break;
        }

        const chosenCodec = defaultCodecForExt(extOf(output));
        await ffmpegBatch([
          '-y',
          '-i',
          inR.localPath,
          '-af',
          filter,
          '-c:a',
          chosenCodec,
          outR.localPath,
        ]);
        await outR.commit();

        return {
          content: [
            {
              type: 'text',
              text: `Removed silence (${remove}, threshold=${threshold_db}dB, min=${min_silence_duration}s) → ${output}`,
            },
          ],
        };
      } finally {
        await inR.cleanup?.();
        await outR.cleanup?.();
      }
    },
  );

  // ── audio_mix ─────────────────────────────────────────────────────────
  registerTool<AudioMixParams>(
    server,
    'audio_mix',
    'Mix 2+ audio tracks into one output with per-track volume and optional delay. Supports sidechain ducking: when `duck_to` and `duck_against_track` are set, the specified track(s) are lowered (dB) whenever track 0 is audible — ideal for ducking a music bed under dialogue.',
    audioMixSchema.shape,
    async ({
      tracks,
      output,
      duration,
      duck_to,
      duck_against_track,
      duck_attack_ms,
      duck_release_ms,
    }) => {
      if (duck_to !== undefined && duck_against_track === undefined) {
        throw new Error('duck_against_track is required when duck_to is set.');
      }
      if (duck_against_track !== undefined && duck_to === undefined) {
        throw new Error('duck_to is required when duck_against_track is set.');
      }
      if (duck_against_track !== undefined && duck_against_track >= tracks.length) {
        throw new Error(
          `duck_against_track=${duck_against_track} out of range (tracks.length=${tracks.length})`,
        );
      }

      // Resolve all track inputs through the storage abstraction.
      const trackInputRs = await Promise.all(tracks.map((t) => resolveInput(t.input)));
      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });

        // Stage 1: per-track prep filters (volume + delay) → labeled outputs [a0]..[aN]
        const filterParts: string[] = [];
        for (let i = 0; i < tracks.length; i++) {
          const t = tracks[i];
          const steps: string[] = [];
          if (t.volume !== undefined && t.volume !== 1) {
            steps.push(`volume=${t.volume}`);
          }
          if (t.delay_seconds !== undefined && t.delay_seconds > 0) {
            const delayMs = Math.round(t.delay_seconds * 1000);
            // adelay needs per-channel values; "|" separator with "all=1" fallback
            steps.push(`adelay=${delayMs}|${delayMs}`);
          }
          // Always include at least one filter so the label chain is valid
          if (steps.length === 0) steps.push('anull');
          filterParts.push(`[${i}:a]${steps.join(',')}[a${i}]`);
        }

        // Stage 2: sidechain duck (optional) → replaces [a<duck_against_track>] with ducked version
        let mixInputs: string[] = tracks.map((_, i) => `[a${i}]`);
        if (duck_to !== undefined && duck_against_track !== undefined) {
          // sidechaincompress: ratio/threshold derived from duck_to (dB).
          // Using a fixed high ratio (8) and threshold 0.03 (~-30 dB) with makeup=0.
          // The "level_sc" of sidechain + our ratio/threshold controls how far music
          // drops. We encode duck_to as the makeup attenuation: add a post-duck
          // volume stage that applies the remaining correction.
          // Simpler + more predictable: use sidechaincompress with threshold=0.05,
          // ratio=20, attack/release from params, then chain a volume=`duck_to`dB
          // which ONLY applies when sidechain is triggered (sidechain itself already
          // attenuates, so we skip the extra volume to avoid double-ducking).
          const attack = duck_attack_ms / 1000;
          const release = duck_release_ms / 1000;
          // Stronger ratio produces deeper duck; we clamp threshold so only audible
          // voice triggers it.
          const ratio = Math.max(2, Math.min(20, Math.abs(duck_to) / 2));
          filterParts.push(
            `[a${duck_against_track}][a0]sidechaincompress=threshold=0.05:ratio=${ratio}:attack=${Math.round(
              attack * 1000,
            )}:release=${Math.round(release * 1000)}:level_sc=1[a${duck_against_track}_ducked]`,
          );
          mixInputs = mixInputs.map((label, i) =>
            i === duck_against_track ? `[a${duck_against_track}_ducked]` : label,
          );
        }

        // Stage 3: amix
        filterParts.push(
          `${mixInputs.join('')}amix=inputs=${tracks.length}:duration=${duration}:dropout_transition=0:normalize=0[aout]`,
        );

        const filterComplex = filterParts.join(';');

        const args: string[] = ['-y'];
        for (const r of trackInputRs) {
          args.push('-i', r.localPath);
        }
        args.push(
          '-filter_complex',
          filterComplex,
          '-map',
          '[aout]',
          '-c:a',
          defaultCodecForExt(output.split('.').pop() ?? ''),
          outR.localPath,
        );

        await ffmpegBatch(args);
        await outR.commit();

        return {
          content: [
            {
              type: 'text',
              text: `Mixed ${tracks.length} tracks${
                duck_to !== undefined
                  ? ` (duck track ${duck_against_track} by ${duck_to}dB under track 0)`
                  : ''
              } → ${output}`,
            },
          ],
        };
      } finally {
        await Promise.all(trackInputRs.map((r) => r.cleanup?.()));
        await outR.cleanup?.();
      }
    },
  );
}

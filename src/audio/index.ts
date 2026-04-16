import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { ffmpegBatch } from '../utils/exec-ffmpeg.js';
import {
  type AudioExtractFromVideoParams,
  type AudioNormalizeParams,
  type AudioConvertFormatParams,
  type AudioConvertPropertiesParams,
  type AudioSetBitrateParams,
  type AudioSetChannelsParams,
  type AudioSetSampleRateParams,
  type AudioRemoveSilenceParams,
  audioExtractFromVideoSchema,
  audioNormalizeSchema,
  audioConvertFormatSchema,
  audioConvertPropertiesSchema,
  audioSetBitrateSchema,
  audioSetChannelsSchema,
  audioSetSampleRateSchema,
  audioRemoveSilenceSchema,
} from './types.js';

/**
 * Pick a sensible audio codec for a given output file extension.
 * Falls back to libmp3lame for unknown extensions.
 */
function defaultCodecForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'mp3':
      return 'libmp3lame';
    case 'aac':
    case 'm4a':
      return 'aac';
    case 'wav':
      return 'pcm_s16le';
    case 'flac':
      return 'flac';
    case 'ogg':
      return 'libvorbis';
    case 'opus':
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
      await mkdir(dirname(output), { recursive: true });

      const args: string[] = ['-y', '-i', input, '-vn'];
      const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
      args.push('-c:a', chosenCodec);
      if (bitrate) args.push('-b:a', bitrate);
      args.push(output);

      await ffmpegBatch(args);
      return {
        content: [
          {
            type: 'text',
            text: `Extracted audio (${chosenCodec}${bitrate ? `, ${bitrate}` : ''}) → ${output}`,
          },
        ],
      };
    },
  );

  // ── audio_normalize ────────────────────────────────────────────────────
  registerTool<AudioNormalizeParams>(
    server,
    'audio_normalize',
    'Normalize audio loudness. mode="loudnorm" uses EBU R128 (recommended for streaming/broadcast); mode="peak" uses a simple volume-based peak normalization.',
    audioNormalizeSchema.shape,
    async ({ input, output, mode, target_lufs, target_peak_db }) => {
      await mkdir(dirname(output), { recursive: true });

      let filter: string;
      if (mode === 'loudnorm') {
        filter = `loudnorm=I=${target_lufs}:TP=${target_peak_db}:LRA=11`;
      } else {
        // Peak normalization via volume filter — simple, not as accurate as loudnorm.
        filter = `volume=${target_peak_db}dB`;
      }

      const chosenCodec = defaultCodecForExt(extOf(output));
      await ffmpegBatch(['-y', '-i', input, '-af', filter, '-c:a', chosenCodec, output]);

      return {
        content: [
          {
            type: 'text',
            text: `Normalized via ${mode} (target=${target_lufs} LUFS, peak=${target_peak_db} dB) → ${output}`,
          },
        ],
      };
    },
  );

  // ── audio_convert_format ───────────────────────────────────────────────
  registerTool<AudioConvertFormatParams>(
    server,
    'audio_convert_format',
    'Convert audio between container formats (mp3/aac/wav/flac/ogg/m4a/opus). Re-encodes with a sensible codec default per target format.',
    audioConvertFormatSchema.shape,
    async ({ input, output, format, codec }) => {
      await mkdir(dirname(output), { recursive: true });

      const targetExt = format ?? extOf(output);
      const chosenCodec = codec ?? defaultCodecForExt(targetExt);

      const args: string[] = ['-y', '-i', input, '-vn', '-c:a', chosenCodec];
      if (format) args.push('-f', format);
      args.push(output);

      await ffmpegBatch(args);
      return {
        content: [
          {
            type: 'text',
            text: `Converted → ${output} (codec=${chosenCodec})`,
          },
        ],
      };
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
      await mkdir(dirname(output), { recursive: true });

      const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
      const args: string[] = ['-y', '-i', input, '-vn', '-c:a', chosenCodec];
      if (sample_rate !== undefined) args.push('-ar', String(sample_rate));
      if (channels !== undefined) args.push('-ac', String(channels));
      if (bitrate) args.push('-b:a', bitrate);
      args.push(output);

      await ffmpegBatch(args);

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
    },
  );

  // ── audio_set_bitrate ──────────────────────────────────────────────────
  registerTool<AudioSetBitrateParams>(
    server,
    'audio_set_bitrate',
    'Re-encode audio at a target bitrate. Useful for reducing file size (e.g., 320k → 128k for web delivery).',
    audioSetBitrateSchema.shape,
    async ({ input, output, bitrate, codec }) => {
      await mkdir(dirname(output), { recursive: true });

      const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
      await ffmpegBatch(['-y', '-i', input, '-vn', '-c:a', chosenCodec, '-b:a', bitrate, output]);

      return {
        content: [
          {
            type: 'text',
            text: `Set audio bitrate to ${bitrate} (codec=${chosenCodec}) → ${output}`,
          },
        ],
      };
    },
  );

  // ── audio_set_channels ─────────────────────────────────────────────────
  registerTool<AudioSetChannelsParams>(
    server,
    'audio_set_channels',
    'Downmix or upmix audio to a target channel count. 2→1 is a proper stereo-to-mono downmix; 1→2 duplicates the mono channel.',
    audioSetChannelsSchema.shape,
    async ({ input, output, channels, codec }) => {
      await mkdir(dirname(output), { recursive: true });

      const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
      await ffmpegBatch([
        '-y',
        '-i',
        input,
        '-vn',
        '-ac',
        String(channels),
        '-c:a',
        chosenCodec,
        output,
      ]);

      return {
        content: [
          {
            type: 'text',
            text: `Set audio to ${channels} channel${channels === 1 ? '' : 's'} → ${output}`,
          },
        ],
      };
    },
  );

  // ── audio_set_sample_rate ──────────────────────────────────────────────
  registerTool<AudioSetSampleRateParams>(
    server,
    'audio_set_sample_rate',
    "Resample audio to a target sample rate. Uses FFmpeg's high-quality resampler by default.",
    audioSetSampleRateSchema.shape,
    async ({ input, output, sample_rate, codec }) => {
      await mkdir(dirname(output), { recursive: true });

      const chosenCodec = codec ?? defaultCodecForExt(extOf(output));
      await ffmpegBatch([
        '-y',
        '-i',
        input,
        '-vn',
        '-ar',
        String(sample_rate),
        '-c:a',
        chosenCodec,
        output,
      ]);

      return {
        content: [
          {
            type: 'text',
            text: `Set sample rate to ${sample_rate} Hz → ${output}`,
          },
        ],
      };
    },
  );

  // ── audio_remove_silence ───────────────────────────────────────────────
  registerTool<AudioRemoveSilenceParams>(
    server,
    'audio_remove_silence',
    'Trim silence from audio. remove="both" trims leading/trailing silence (most common); "all" also removes silent sections within the audio (may sound unnatural).',
    audioRemoveSilenceSchema.shape,
    async ({ input, output, threshold_db, min_silence_duration, remove }) => {
      await mkdir(dirname(output), { recursive: true });

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
      await ffmpegBatch(['-y', '-i', input, '-af', filter, '-c:a', chosenCodec, output]);

      return {
        content: [
          {
            type: 'text',
            text: `Removed silence (${remove}, threshold=${threshold_db}dB, min=${min_silence_duration}s) → ${output}`,
          },
        ],
      };
    },
  );
}

import { z } from 'zod';

/** Parameters for the audio_extract_from_video tool */
export interface AudioExtractFromVideoParams {
  input: string;
  output: string;
  codec?: string;
  bitrate?: string;
}

export const audioExtractFromVideoSchema = z.object({
  input: z.string().describe('Path to the source video file'),
  output: z.string().describe('Path for the extracted audio (format inferred from extension)'),
  codec: z
    .string()
    .optional()
    .describe(
      'Audio codec override (e.g., "libmp3lame", "aac", "libopus", "copy"). If omitted, picks a sensible default per output extension.',
    ),
  bitrate: z
    .string()
    .optional()
    .describe('Target audio bitrate — e.g., "192k", "320k". If omitted, uses encoder default.'),
});

/** Parameters for the audio_normalize tool */
export interface AudioNormalizeParams {
  input: string;
  output: string;
  mode: 'loudnorm' | 'peak';
  target_lufs: number;
  target_peak_db: number;
}

export const audioNormalizeSchema = z.object({
  input: z.string().describe('Path to the source audio (or video with audio)'),
  output: z.string().describe('Path for the normalized output'),
  mode: z
    .enum(['loudnorm', 'peak'])
    .default('loudnorm')
    .describe(
      '"loudnorm" = EBU R128 loudness normalization (broadcast/streaming standard). "peak" = simple peak normalization via volume filter (legacy; less accurate).',
    ),
  target_lufs: z
    .number()
    .default(-14)
    .describe(
      'Target integrated loudness in LUFS for loudnorm mode. Common targets: -14 (Spotify/YouTube), -16 (Apple Music), -23 (EBU broadcast).',
    ),
  target_peak_db: z
    .number()
    .default(-1)
    .describe(
      'Target true peak in dBTP for loudnorm mode or peak target for peak mode. Typical: -1.0 or -2.0.',
    ),
});

/** Parameters for the audio_convert_format tool */
export interface AudioConvertFormatParams {
  input: string;
  output: string;
  format?: string;
  codec?: string;
}

export const audioConvertFormatSchema = z.object({
  input: z.string().describe('Path to the source audio'),
  output: z.string().describe('Path for the converted output (format inferred from extension)'),
  format: z
    .string()
    .optional()
    .describe(
      'Container format override (mp3, aac, wav, flac, ogg, m4a, opus). If omitted, inferred from output extension.',
    ),
  codec: z
    .string()
    .optional()
    .describe(
      'Codec override. If omitted, picks a sensible default for the target format (e.g., libmp3lame for mp3, libopus for opus).',
    ),
});

/** Parameters for the audio_convert_properties tool */
export interface AudioConvertPropertiesParams {
  input: string;
  output: string;
  sample_rate?: number;
  channels?: number;
  bitrate?: string;
  codec?: string;
}

export const audioConvertPropertiesSchema = z.object({
  input: z.string().describe('Path to the source audio'),
  output: z.string().describe('Path for the output audio'),
  sample_rate: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Target sample rate in Hz — typical values: 22050, 44100, 48000, 96000.'),
  channels: z
    .number()
    .int()
    .min(1)
    .max(8)
    .optional()
    .describe('Target channel count — 1 (mono), 2 (stereo), 6 (5.1), 8 (7.1).'),
  bitrate: z.string().optional().describe('Target bitrate — e.g., "128k", "192k", "320k".'),
  codec: z
    .string()
    .optional()
    .describe('Codec override. If omitted, picks a default for the output extension.'),
});

/** Parameters for the audio_set_bitrate tool */
export interface AudioSetBitrateParams {
  input: string;
  output: string;
  bitrate: string;
  codec?: string;
}

export const audioSetBitrateSchema = z.object({
  input: z.string().describe('Path to the source audio'),
  output: z.string().describe('Path for the output'),
  bitrate: z.string().describe('Target bitrate — e.g., "128k", "192k", "320k", "64k" for speech.'),
  codec: z
    .string()
    .optional()
    .describe('Codec override. If omitted, picks a default for the output extension.'),
});

/** Parameters for the audio_set_channels tool */
export interface AudioSetChannelsParams {
  input: string;
  output: string;
  channels: number;
  codec?: string;
}

export const audioSetChannelsSchema = z.object({
  input: z.string().describe('Path to the source audio'),
  output: z.string().describe('Path for the output'),
  channels: z
    .number()
    .int()
    .min(1)
    .max(8)
    .describe('Target channel count — 1 (mono), 2 (stereo), 6 (5.1), 8 (7.1).'),
  codec: z
    .string()
    .optional()
    .describe('Codec override. If omitted, picks a default for the output extension.'),
});

/** Parameters for the audio_set_sample_rate tool */
export interface AudioSetSampleRateParams {
  input: string;
  output: string;
  sample_rate: number;
  codec?: string;
}

export const audioSetSampleRateSchema = z.object({
  input: z.string().describe('Path to the source audio'),
  output: z.string().describe('Path for the output'),
  sample_rate: z
    .number()
    .int()
    .positive()
    .describe('Target sample rate in Hz — typical values: 22050, 44100, 48000, 96000.'),
  codec: z
    .string()
    .optional()
    .describe('Codec override. If omitted, picks a default for the output extension.'),
});

/** Parameters for the audio_remove_silence tool */
export interface AudioRemoveSilenceParams {
  input: string;
  output: string;
  threshold_db: number;
  min_silence_duration: number;
  remove: 'start' | 'end' | 'both' | 'all';
}

export const audioRemoveSilenceSchema = z.object({
  input: z.string().describe('Path to the source audio'),
  output: z.string().describe('Path for the trimmed output'),
  threshold_db: z
    .number()
    .max(0)
    .default(-50)
    .describe(
      'Silence threshold in dB (negative; closer to 0 = more aggressive). Typical: -40 (loose), -50 (balanced), -60 (strict).',
    ),
  min_silence_duration: z
    .number()
    .positive()
    .default(0.5)
    .describe(
      'Minimum silence duration in seconds to trim (avoids cutting natural speech pauses).',
    ),
  remove: z
    .enum(['start', 'end', 'both', 'all'])
    .default('both')
    .describe(
      '"start" = leading silence only. "end" = trailing only. "both" = start + end. "all" = also removes silence within the audio (may sound unnatural).',
    ),
});

/** Parameters for the audio_pad tool */
export interface AudioPadParams {
  input: string;
  output: string;
  pad_start_seconds?: number;
  pad_end_seconds?: number;
  codec?: string;
}

export const audioPadSchema = z.object({
  input: z.string().describe('Path to the source audio (or video with audio).'),
  output: z.string().describe('Path for the padded output (format inferred from extension).'),
  pad_start_seconds: z
    .number()
    .nonnegative()
    .optional()
    .describe(
      'Seconds of silence to prepend to the audio. Float OK (e.g., 0.25). Specify pad_start_seconds and/or pad_end_seconds — at least one is required.',
    ),
  pad_end_seconds: z
    .number()
    .nonnegative()
    .optional()
    .describe(
      'Seconds of silence to append to the audio. Float OK (e.g., 1.5). Specify pad_start_seconds and/or pad_end_seconds — at least one is required.',
    ),
  codec: z
    .string()
    .optional()
    .describe('Codec override. If omitted, picks a default for the output extension.'),
});

/** Parameters for the audio_mix tool */
export interface AudioMixTrack {
  input: string;
  volume?: number;
  delay_seconds?: number;
}

export interface AudioMixParams {
  tracks: AudioMixTrack[];
  output: string;
  duration: 'longest' | 'shortest' | 'first';
  duck_to?: number;
  duck_against_track?: number;
  duck_attack_ms: number;
  duck_release_ms: number;
}

export const audioMixSchema = z.object({
  tracks: z
    .array(
      z.object({
        input: z.string().describe('Path to an audio track (or any file with audio).'),
        volume: z
          .number()
          .nonnegative()
          .optional()
          .describe(
            'Linear volume multiplier applied before mixing — 1.0 = unchanged, 0.3 = 30%, 0 = silent. Default 1.0.',
          ),
        delay_seconds: z
          .number()
          .nonnegative()
          .optional()
          .describe('Delay this track by N seconds before it enters the mix (default 0).'),
      }),
    )
    .min(2)
    .describe('Ordered list of tracks to mix (2+). Track 0 is the reference for ducking.'),
  output: z.string().describe('Path for the mixed output audio.'),
  duration: z
    .enum(['longest', 'shortest', 'first'])
    .default('longest')
    .describe(
      '"longest" = output length = longest input (pads shorter with silence). "shortest" = stops at shortest. "first" = matches track 0.',
    ),
  duck_to: z
    .number()
    .max(0)
    .optional()
    .describe(
      'If set, activates sidechain ducking: lowers `duck_against_track` by this many dB whenever track 0 (voice) is audible. Typical: -10 to -18. Omit for no ducking.',
    ),
  duck_against_track: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      'Index of the track to duck (1-based, referring to tracks[1] and later). Required when duck_to is set. Usually the music-bed track.',
    ),
  duck_attack_ms: z
    .number()
    .positive()
    .default(20)
    .describe('Sidechain attack time in ms — how fast the duck engages when voice starts.'),
  duck_release_ms: z
    .number()
    .positive()
    .default(250)
    .describe('Sidechain release time in ms — how fast volume recovers after voice ends.'),
});

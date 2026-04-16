import { z } from 'zod';

/** Parameters for the video_concatenate tool */
export interface VideoConcatenateParams {
  inputs: string[];
  output: string;
  reencode: boolean;
}

export const videoConcatenateSchema = z.object({
  inputs: z.array(z.string()).min(2).describe('Paths to video files to concatenate, in order'),
  output: z.string().describe('Path for the concatenated output video'),
  reencode: z
    .boolean()
    .default(false)
    .describe(
      'If true, re-encode via concat filter (safe for mixed codecs/formats; slower). If false, use concat demuxer (fast; requires identical codecs/resolutions).',
    ),
});

/** Parameters for the video_trim tool */
export interface VideoTrimParams {
  input: string;
  output: string;
  start_seconds: number;
  duration_seconds?: number;
  end_seconds?: number;
  reencode: boolean;
}

export const videoTrimSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the trimmed output'),
  start_seconds: z.number().min(0).default(0).describe('Start time in seconds from the beginning'),
  duration_seconds: z
    .number()
    .positive()
    .optional()
    .describe('Duration to keep, in seconds. If omitted, uses end_seconds or trims to end.'),
  end_seconds: z
    .number()
    .positive()
    .optional()
    .describe('Alternative to duration_seconds — absolute end time in seconds'),
  reencode: z
    .boolean()
    .default(false)
    .describe(
      'If true, re-encode (frame-accurate but slower). If false, copy streams (faster but may snap to keyframe boundaries).',
    ),
});

/** Parameters for the video_change_aspect_ratio tool */
export interface VideoChangeAspectRatioParams {
  input: string;
  output: string;
  aspect_ratio: string;
  mode: 'crop' | 'pad';
  pad_color: string;
}

export const videoChangeAspectRatioSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the output'),
  aspect_ratio: z
    .string()
    .describe(
      'Target aspect ratio — known values: "1:1", "4:5", "9:16", "16:9", "3:2", "21:9". Also accepts any "W:H" where W and H are positive integers.',
    ),
  mode: z
    .enum(['crop', 'pad'])
    .default('crop')
    .describe('"crop" removes edges to fit; "pad" adds bars of pad_color to fit'),
  pad_color: z
    .string()
    .default('black')
    .describe('Color for padding bars when mode="pad" (e.g., "black", "#RRGGBB")'),
});

/** Parameters for the video_convert_format tool */
export interface VideoConvertFormatParams {
  input: string;
  output: string;
  format?: string;
}

export const videoConvertFormatSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the converted output (format inferred from extension)'),
  format: z
    .string()
    .optional()
    .describe(
      'Container format override (mp4, webm, mov, mkv, avi, flv). If omitted, inferred from output extension.',
    ),
});

/** Parameters for the video_change_speed tool */
export interface VideoChangeSpeedParams {
  input: string;
  output: string;
  speed: number;
  preserve_audio: boolean;
}

export const videoChangeSpeedSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the speed-changed output'),
  speed: z
    .number()
    .positive()
    .describe(
      'Speed multiplier. >1 = faster (e.g., 2.0 is 2× speed). <1 = slower (e.g., 0.5 is half-speed).',
    ),
  preserve_audio: z
    .boolean()
    .default(true)
    .describe(
      'If true, pitch-preserving audio scaling (only supports 0.5-2.0 in a single pass). If false, drops audio.',
    ),
});

/** Parameters for the video_set_resolution tool */
export interface VideoSetResolutionParams {
  input: string;
  output: string;
  width?: number;
  height?: number;
  preset?: string;
  preserve_aspect_ratio: boolean;
}

export const videoSetResolutionSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the resized output'),
  width: z.number().int().positive().optional().describe('Target width in pixels'),
  height: z.number().int().positive().optional().describe('Target height in pixels'),
  preset: z
    .string()
    .optional()
    .describe(
      'Resolution preset — one of: "480p", "720p", "1080p", "1440p", "4k". Overrides width/height when set.',
    ),
  preserve_aspect_ratio: z
    .boolean()
    .default(true)
    .describe(
      'If true, scales to fit within the target box (aspect preserved). If false, stretches exactly to target (may distort).',
    ),
});

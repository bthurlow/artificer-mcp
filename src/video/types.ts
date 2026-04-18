import { z } from 'zod';

/** Parameters for the video_concatenate tool */
export interface VideoConcatenateParams {
  inputs: string[];
  output: string;
  reencode: boolean;
  transition?: string;
  transition_duration: number;
}

export const videoConcatenateSchema = z.object({
  inputs: z.array(z.string()).min(2).describe('Paths to video files to concatenate, in order'),
  output: z.string().describe('Path for the concatenated output video'),
  reencode: z
    .boolean()
    .default(false)
    .describe(
      'If true, re-encode via concat filter (safe for mixed codecs/formats; slower). If false, use concat demuxer (fast; requires identical codecs/resolutions). Ignored when `transition` is set — transitions always re-encode.',
    ),
  transition: z
    .string()
    .optional()
    .describe(
      `Optional FFmpeg xfade transition name to blend each pair of clips — e.g., "fade", "wipeleft", "slideup", "circleopen", "dissolve". When set, clips are joined with smooth crossfades instead of hard cuts (implicitly re-encodes). Omit for hard cuts. Inputs must share resolution/frame rate when using transitions; use video_set_resolution first if they don't. See https://ffmpeg.org/ffmpeg-filters.html#xfade for the full list.`,
    ),
  transition_duration: z
    .number()
    .positive()
    .default(0.5)
    .describe(
      'Duration of each transition in seconds when `transition` is set (typically 0.3–1.5).',
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

// ── Phase 3b — video effects ───────────────────────────────────────────────

/** Xfade transition type — a subset of FFmpeg's xfade presets. */
export const XFADE_TRANSITIONS = [
  'fade',
  'wipeleft',
  'wiperight',
  'wipeup',
  'wipedown',
  'slideleft',
  'slideright',
  'slideup',
  'slidedown',
  'circlecrop',
  'rectcrop',
  'distance',
  'fadeblack',
  'fadewhite',
  'radial',
  'smoothleft',
  'smoothright',
  'smoothup',
  'smoothdown',
  'circleopen',
  'circleclose',
  'dissolve',
  'pixelize',
  'diagtl',
  'diagtr',
  'diagbl',
  'diagbr',
  'hlslice',
  'hrslice',
  'vuslice',
  'vdslice',
  'hblur',
  'fadegrays',
  'wipetl',
  'wipetr',
  'wipebl',
  'wipebr',
  'squeezeh',
  'squeezev',
  'zoomin',
] as const;

/** Parameters for the video_add_transitions tool */
export interface VideoAddTransitionsParams {
  inputs: string[];
  output: string;
  transition: string;
  duration: number;
}

export const videoAddTransitionsSchema = z.object({
  inputs: z
    .array(z.string())
    .min(2)
    .describe(
      'Paths to video files to join with transitions, in order (min 2). Inputs must have identical resolution/frame rate.',
    ),
  output: z.string().describe('Path for the output video'),
  transition: z
    .string()
    .default('fade')
    .describe(
      `FFmpeg xfade transition name — e.g., "fade", "wipeleft", "slideup", "circleopen", "dissolve". See https://ffmpeg.org/ffmpeg-filters.html#xfade for the full list.`,
    ),
  duration: z
    .number()
    .positive()
    .default(1)
    .describe('Duration of each transition in seconds (typically 0.5–2).'),
});

/** Parameters for the video_add_image_overlay tool */
export interface VideoAddImageOverlayParams {
  input: string;
  overlay: string;
  output: string;
  x: number | string;
  y: number | string;
  opacity: number;
  start_seconds?: number;
  end_seconds?: number;
}

export const videoAddImageOverlaySchema = z.object({
  input: z.string().describe('Path to the source video'),
  overlay: z.string().describe('Path to the overlay image (e.g., logo, watermark)'),
  output: z.string().describe('Path for the output video'),
  x: z
    .union([z.number(), z.string()])
    .default(10)
    .describe(
      'Overlay X position. Accepts pixels (10) or FFmpeg expressions ("main_w-overlay_w-10" for right-10).',
    ),
  y: z
    .union([z.number(), z.string()])
    .default(10)
    .describe('Overlay Y position (pixels or FFmpeg expression).'),
  opacity: z
    .number()
    .min(0)
    .max(1)
    .default(1)
    .describe('Overlay opacity from 0 (transparent) to 1 (fully opaque).'),
  start_seconds: z
    .number()
    .min(0)
    .optional()
    .describe('Show overlay starting at this time. If omitted, shows from start.'),
  end_seconds: z
    .number()
    .positive()
    .optional()
    .describe('Hide overlay after this time. If omitted, shows to end.'),
});

/** Parameters for the video_add_text_overlay tool */
export interface VideoAddTextOverlayParams {
  input: string;
  output: string;
  text: string;
  font_file?: string;
  font_size: number;
  color: string;
  x: number | string;
  y: number | string;
  box: boolean;
  box_color: string;
  box_border_width: number;
  start_seconds?: number;
  end_seconds?: number;
}

export const videoAddTextOverlaySchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the output video'),
  text: z.string().describe('Text to draw on the video'),
  font_file: z
    .string()
    .optional()
    .describe(
      'Absolute path to a .ttf/.otf font file. If omitted, uses FFmpeg drawtext default (fontconfig-based; system-default font). For portable/hermetic results, pass an explicit font file path.',
    ),
  font_size: z.number().int().positive().default(48).describe('Font size in pixels.'),
  color: z.string().default('white').describe('Text color (name or #RRGGBB[AA]).'),
  x: z
    .union([z.number(), z.string()])
    .default('(w-text_w)/2')
    .describe(
      'Text X position. Accepts pixels or FFmpeg expressions. Default centers horizontally.',
    ),
  y: z
    .union([z.number(), z.string()])
    .default('h-th-40')
    .describe(
      'Text Y position. Accepts pixels or FFmpeg expressions. Default is 40px from bottom.',
    ),
  box: z.boolean().default(false).describe('Draw a background box behind the text.'),
  box_color: z
    .string()
    .default('black@0.5')
    .describe('Box color with optional alpha (e.g., "black@0.5").'),
  box_border_width: z
    .number()
    .int()
    .min(0)
    .default(10)
    .describe('Padding between text and box edge.'),
  start_seconds: z
    .number()
    .min(0)
    .optional()
    .describe('Show text starting at this time. If omitted, shows from start.'),
  end_seconds: z
    .number()
    .positive()
    .optional()
    .describe('Hide text after this time. If omitted, shows to end.'),
});

/** Parameters for the video_add_subtitles tool */
export interface VideoAddSubtitlesParams {
  input: string;
  output: string;
  subtitle_file: string;
  burn_in: boolean;
  force_style?: string;
}

export const videoAddSubtitlesSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the output video'),
  subtitle_file: z.string().describe('Path to an SRT, VTT, or ASS subtitle file.'),
  burn_in: z
    .boolean()
    .default(true)
    .describe(
      'If true, renders subtitles into the pixels (always visible). If false, muxes as a soft subtitle track (toggleable in player; only for containers that support it).',
    ),
  force_style: z
    .string()
    .optional()
    .describe(
      `ASS style override for burn-in, e.g., "FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&". Only used when burn_in=true.`,
    ),
});

/** Parameters for the video_add_b_roll tool */
export interface VideoAddBRollParams {
  main: string;
  b_roll: string;
  output: string;
  insert_at_seconds: number;
  b_roll_duration_seconds: number;
  replace_main_duration: boolean;
}

export const videoAddBRollSchema = z.object({
  main: z.string().describe('Path to the main video (e.g., talking head)'),
  b_roll: z.string().describe('Path to the b-roll clip to insert'),
  output: z.string().describe('Path for the output video'),
  insert_at_seconds: z
    .number()
    .min(0)
    .describe('Time in the main video where the b-roll is inserted.'),
  b_roll_duration_seconds: z
    .number()
    .positive()
    .describe('How many seconds of the b-roll clip to use (trimmed from b_roll start).'),
  replace_main_duration: z
    .boolean()
    .default(true)
    .describe(
      `If true, the b-roll replaces the same duration in the main (keeps main's audio; b-roll becomes a "cutaway"). If false, the b-roll is inserted — extending total length by b_roll_duration.`,
    ),
});

/** Parameters for the video_set_bitrate tool */
export interface VideoSetBitrateParams {
  input: string;
  output: string;
  video_bitrate?: string;
  audio_bitrate?: string;
  two_pass: boolean;
}

export const videoSetBitrateSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the output video'),
  video_bitrate: z
    .string()
    .optional()
    .describe('Target video bitrate — e.g., "2M", "500k", "8000k".'),
  audio_bitrate: z.string().optional().describe('Target audio bitrate — e.g., "128k", "192k".'),
  two_pass: z
    .boolean()
    .default(false)
    .describe(
      'If true, uses two-pass encoding for more accurate bitrate targeting (slower; requires a temp log file).',
    ),
});

/** Parameters for the video_set_codec tool */
export interface VideoSetCodecParams {
  input: string;
  output: string;
  video_codec?: string;
  audio_codec?: string;
  crf?: number;
  preset?: string;
}

export const videoSetCodecSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the output video'),
  video_codec: z
    .string()
    .optional()
    .describe(
      'Video codec — e.g., "libx264", "libx265", "libvpx-vp9", "libaom-av1", "copy" to stream-copy.',
    ),
  audio_codec: z
    .string()
    .optional()
    .describe('Audio codec — e.g., "aac", "libopus", "libmp3lame", "copy".'),
  crf: z
    .number()
    .min(0)
    .max(63)
    .optional()
    .describe(
      'Constant Rate Factor (quality). For libx264/libx265: 0 (lossless)–51, typical 18–28. For libvpx-vp9/libaom-av1: 0–63.',
    ),
  preset: z
    .string()
    .optional()
    .describe(
      'x264/x265 speed preset — "ultrafast","superfast","veryfast","faster","fast","medium","slow","slower","veryslow".',
    ),
});

/** Parameters for the video_from_image tool */
export interface VideoFromImageParams {
  input: string;
  output: string;
  duration_seconds: number;
  frame_rate: number;
  width?: number;
  height?: number;
  audio?: string;
}

export const videoFromImageSchema = z.object({
  input: z.string().describe('Path to the source still image (PNG/JPG).'),
  output: z.string().describe('Path for the output video clip.'),
  duration_seconds: z
    .number()
    .positive()
    .describe('Clip duration in seconds — e.g., 2 for a title card, 3 for an end card.'),
  frame_rate: z.number().positive().default(30).describe('Output frame rate (fps).'),
  width: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Resize output to this width. If omitted, uses source width.'),
  height: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Resize output to this height. If omitted, uses source height.'),
  audio: z
    .string()
    .optional()
    .describe(
      'Optional audio track to pair with the image. If omitted, output has no audio (silent clip).',
    ),
});

/** Parameters for the video_set_audio tool */
export interface VideoSetAudioParams {
  input: string;
  output: string;
  audio: string;
  audio_codec: string;
  shortest: boolean;
}

export const videoSetAudioSchema = z.object({
  input: z.string().describe('Path to the source video.'),
  output: z.string().describe('Path for the output video.'),
  audio: z.string().describe('Path to the audio track to mux in. Replaces any existing audio.'),
  audio_codec: z
    .string()
    .default('aac')
    .describe('Audio codec for the output — "aac" (mp4/mov), "libopus" (webm), or "copy".'),
  shortest: z
    .boolean()
    .default(false)
    .describe(
      'If true, output ends when the shorter of video/audio ends. Otherwise, output matches the video length (audio may be padded or truncated).',
    ),
});

/** Parameters for the video_set_frame_rate tool */
export interface VideoSetFrameRateParams {
  input: string;
  output: string;
  frame_rate: number;
  drop_duplicate_frames: boolean;
}

export const videoSetFrameRateSchema = z.object({
  input: z.string().describe('Path to the source video'),
  output: z.string().describe('Path for the output video'),
  frame_rate: z.number().positive().describe('Target frame rate in fps — e.g., 24, 29.97, 30, 60.'),
  drop_duplicate_frames: z
    .boolean()
    .default(true)
    .describe(
      'If true, uses the fps filter (frame-accurate; drops/duplicates frames to hit target). If false, uses -r (simpler but may stretch/shrink duration).',
    ),
});

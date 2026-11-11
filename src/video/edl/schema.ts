import { z } from 'zod';

/**
 * Edit decision list for `video_assemble_edl` (TODO #33). Ported from the
 * btmusic prototype `scripts/assemble-edl.py`, keeping its model:
 *
 * - Everything is in SONG time: a segment is a range [a, b] of the master
 *   audio, and the output audio is those ranges joined in order.
 * - Each segment holds shots. A shot plays its clip from `start` until the
 *   next shot's start (or the segment end). The first shot starts at the
 *   segment start.
 * - A lip-synced clip stays in sync because its source in-point comes from
 *   `clip_song_start`, the song time its audio began at:
 *   src_in = start − clip_song_start.
 */

export const edlShotSchema = z.object({
  clip: z.string().min(1).describe('Video clip for this shot (path or URI).'),
  clip_song_start: z
    .number()
    .default(0)
    .describe(
      "Song time at which this clip's own timeline starts (for a lip-synced clip, where its audio began in the song). The shot plays the clip from start − clip_song_start.",
    ),
  start: z
    .number()
    .optional()
    .describe(
      'Song time this shot starts. Ignored for the first shot of a segment, which starts at the segment start; required for the others.',
    ),
  snap: z
    .union([z.boolean(), z.enum(['beat', 'kick', 'half'])])
    .optional()
    .describe(
      'Snap `start` to the beat grid: true / "beat" = nearest beat, "kick" = nearest downbeat (the bar position carrying the kick), "half" = nearest downbeat or mid-bar beat. Needs `beat_grid` (or `beats`, plus `kick_ref` for kick/half).',
    ),
  punch: z
    .number()
    .min(1)
    .default(1)
    .describe('Static punch-in zoom: 1 = full frame, 1.2 = 20% closer.'),
  fx: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe('Punch-in centre, as a fraction of the width.'),
  fy: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe('Punch-in centre, as a fraction of the height.'),
  in: z
    .string()
    .default('cut')
    .describe('Transition INTO this shot: "cut" or "flash" (a white flash decaying from the cut).'),
});

export const edlSegmentSchema = z.object({
  song: z
    .tuple([z.number().min(0), z.number().positive()])
    .describe('[start, end] of this segment in song seconds.'),
  shots: z.array(edlShotSchema).min(1),
});

export const edlSchema = z.object({
  audio: z.string().min(1).describe('The master audio (song). Output audio is cut from it.'),
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  fps: z.number().positive().default(24),
  beat_grid: z
    .string()
    .optional()
    .describe(
      'JSON written by audio_beat_grid. Supplies beats, kick_ref, beat_offset (its offset_s) and beats_per_bar; any of those set here overrides it.',
    ),
  beats: z
    .union([z.array(z.number()), z.string()])
    .optional()
    .describe('Beat times in song seconds, or a JSON file holding that array.'),
  kick_ref: z
    .number()
    .optional()
    .describe(
      'A song time on a downbeat (a beat carrying the kick). Needed for "kick" and "half" snaps.',
    ),
  beat_offset: z
    .number()
    .optional()
    .describe(
      'Seconds added to every beat before snapping, to move the grid onto the felt hit (audio_beat_grid offset_s, usually a few hundredths negative).',
    ),
  beats_per_bar: z.number().int().min(2).max(12).optional(),
  flash: z
    .object({
      strength: z.number().positive().max(1).default(0.75),
      duration: z.number().positive().default(0.25),
    })
    .default({})
    .describe('The "flash" transition: peak brightness added and decay time in seconds.'),
  crf: z.number().int().min(0).max(51).default(18),
  preset: z.string().default('medium'),
  segments: z.array(edlSegmentSchema).min(1),
});

export type Edl = z.infer<typeof edlSchema>;
export type EdlShot = z.infer<typeof edlShotSchema>;
export type EdlInput = z.input<typeof edlSchema>;

/** Parameters for the video_assemble_edl tool */
export interface VideoAssembleEdlParams {
  edl?: Record<string, unknown>;
  edl_path?: string;
  output: string;
}

export const videoAssembleEdlSchema = z.object({
  edl: z
    .record(z.unknown())
    .optional()
    .describe(
      'The edit decision list, inline. Shape: {audio, width?, height?, fps?, beat_grid?, beats?, kick_ref?, beat_offset?, beats_per_bar?, flash?, crf?, preset?, segments: [{song: [a, b], shots: [{clip, clip_song_start?, start?, snap?, punch?, fx?, fy?, in?}]}]}. Relative paths resolve against the working directory.',
    ),
  edl_path: z
    .string()
    .optional()
    .describe(
      "A JSON file holding the edit decision list, instead of `edl`. Relative paths inside it resolve against the file's folder.",
    ),
  output: z.string().describe('Path for the rendered video (H.264 + AAC MP4).'),
});

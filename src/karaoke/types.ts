import { z } from 'zod';

/**
 * Input schema for `build_ass_karaoke`.
 *
 * One of `transcript_file` or `words` must be supplied (not both, not
 * neither). All style options default to a 9:16 phone-reel preset
 * matching the pipeline-side V1 that shipped 2026-04-27.
 *
 * Two exports: `buildAssKaraokeSchemaShape` is the bare object shape used
 * by `registerTool` for MCP introspection; `buildAssKaraokeSchema` adds
 * the cross-field refinement and is what runtime validation uses.
 */
const buildAssKaraokeBaseSchema = z.object({
  transcript_file: z
    .string()
    .optional()
    .describe(
      'Path or URI to a JSON transcript with word-level timing — `fal_transcribe` output works directly. Reads top-level `words[]` or nested `data.words[]`. Each word entry must have `text`, `start`, `end`. Scribe v2 `type: "spacing"` and `type: "audio_event"` entries are filtered out automatically. Mutually exclusive with `words`.',
    ),
  words: z
    .array(
      z.object({
        text: z.string(),
        start: z.number().nonnegative(),
        end: z.number().nonnegative(),
      }),
    )
    .optional()
    .describe(
      'Inline word-level timestamps when the caller already has them in memory. Each word: `{text, start, end}` in seconds. Mutually exclusive with `transcript_file`. Caller is responsible for filtering non-spoken tokens.',
    ),
  output: z
    .string()
    .describe(
      'Output URI for the ASS file (e.g., "./subs.ass", "gs://bucket/subs.ass"). The .ass extension is conventional but not enforced.',
    ),
  max_words_per_phrase: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      'Maximum words shown on screen at once. Default 3 (reads cleanly on 9:16). 4–5 works on 16:9. Punctuation always forces a phrase break regardless.',
    ),
  font_name: z
    .string()
    .optional()
    .describe(
      'Font family. Default "DM Sans". Must be installed on the rendering host (artificer / ffmpeg).',
    ),
  font_size: z
    .number()
    .positive()
    .optional()
    .describe(
      'Font size in ASS units (relative to PlayResY). Default 96 (~9% of a 1080-wide phone frame).',
    ),
  unhighlighted_color: z
    .string()
    .optional()
    .describe(
      'ASS color (`&HAABBGGRR`) for words not yet highlighted (`SecondaryColour`). Default "&H00FFFFFF" (opaque white). Alpha 00 = opaque, FF = transparent — note the inversion.',
    ),
  highlighted_color: z
    .string()
    .optional()
    .describe(
      'ASS color for words once their karaoke time arrives (`PrimaryColour`). Default "&H005B44B0" (brand accent #b0445b).',
    ),
  outline_color: z
    .string()
    .optional()
    .describe('Outline color (`OutlineColour`). Default "&H00000000" (opaque black).'),
  outline_thickness: z
    .number()
    .nonnegative()
    .optional()
    .describe(
      'Outline thickness in pixels. Default 6 — heavy enough to stay legible on busy backgrounds.',
    ),
  margin_v: z
    .number()
    .nonnegative()
    .optional()
    .describe(
      "Vertical margin from frame bottom (Alignment=2). Default 240 — lifts captions out of TikTok's bottom-UI overlap zone.",
    ),
  play_res_x: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('PlayResX (script reference width). Default 1080 (9:16 phone-reel).'),
  play_res_y: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('PlayResY (script reference height). Default 1920.'),
});

export const buildAssKaraokeSchemaShape = buildAssKaraokeBaseSchema.shape;

export const buildAssKaraokeSchema = buildAssKaraokeBaseSchema.refine(
  (d) => (d.transcript_file === undefined) !== (d.words === undefined),
  {
    message: 'Provide exactly one of `transcript_file` or `words` (not both, not neither).',
  },
);

export interface BuildAssKaraokeParams {
  transcript_file?: string;
  words?: Array<{ text: string; start: number; end: number }>;
  output: string;
  max_words_per_phrase?: number;
  font_name?: string;
  font_size?: number;
  unhighlighted_color?: string;
  highlighted_color?: string;
  outline_color?: string;
  outline_thickness?: number;
  margin_v?: number;
  play_res_x?: number;
  play_res_y?: number;
}

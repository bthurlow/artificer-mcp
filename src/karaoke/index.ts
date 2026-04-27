import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { registerTool } from '../utils/register.js';
import { resolveInput, resolveOutput } from '../utils/resource.js';
import { buildAssFromWords, type TranscribedWord, type AssKaraokeOptions } from './ass.js';
import {
  type BuildAssKaraokeParams,
  buildAssKaraokeSchema,
  buildAssKaraokeSchemaShape,
} from './types.js';

interface RawWordEntry {
  text?: unknown;
  start?: unknown;
  end?: unknown;
  type?: unknown;
}

/**
 * Project a raw transcript word entry into the writer's `TranscribedWord`
 * shape. Returns null when required fields are missing or non-numeric, or
 * when the entry is a Scribe v2 spacing / audio_event token (filtered out
 * because karaoke wants only spoken words to highlight).
 *
 * Exported for unit testing.
 */
export function projectWord(raw: RawWordEntry): TranscribedWord | null {
  const text = typeof raw.text === 'string' ? raw.text : null;
  const start = typeof raw.start === 'number' ? raw.start : null;
  const end = typeof raw.end === 'number' ? raw.end : null;
  if (text === null || start === null || end === null) return null;
  // Scribe v2 type discriminator: keep only "word" (or undefined for callers
  // who already projected). spacing + audio_event are filtered.
  if (typeof raw.type === 'string' && raw.type !== 'word') return null;
  return { text, start, end };
}

/**
 * Extract the words array from a transcript file's parsed JSON payload.
 * Accepts either:
 *   - top-level `{words: [...]}` (artificer's `fal_transcribe` output)
 *   - nested `{data: {words: [...]}}` (raw fal-client subscribe response)
 *
 * Exported for unit testing.
 */
export function extractWordsFromTranscript(parsed: unknown): TranscribedWord[] {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(
      'build_ass_karaoke: transcript_file did not parse to an object — expected JSON with a `words[]` array.',
    );
  }
  const obj = parsed as { words?: unknown; data?: { words?: unknown } };
  const rawWords =
    obj.words ??
    (obj.data && typeof obj.data === 'object'
      ? (obj.data as { words?: unknown }).words
      : undefined);
  if (!Array.isArray(rawWords)) {
    throw new Error(
      'build_ass_karaoke: transcript_file is missing a `words[]` array (looked at top-level and `data.words`).',
    );
  }
  const projected: TranscribedWord[] = [];
  for (const entry of rawWords as RawWordEntry[]) {
    const word = projectWord(entry);
    if (word !== null) projected.push(word);
  }
  if (projected.length === 0) {
    throw new Error(
      'build_ass_karaoke: transcript_file contained no usable word entries after filtering. Scribe v2 spacing / audio_event tokens are skipped — make sure ASR returned at least one `type: "word"` token.',
    );
  }
  return projected;
}

/**
 * Register karaoke caption tools.
 *
 * Covers: build_ass_karaoke.
 *
 * Pure transformer — composes with `fal_transcribe` (input) and
 * `video_add_subtitles` (downstream burn-in). The writer logic itself
 * has zero ffmpeg / fal dependencies.
 */
export function registerKaraokeTools(server: McpServer): void {
  registerTool<BuildAssKaraokeParams>(
    server,
    'build_ass_karaoke',
    'Build an ASS karaoke caption file from word-level timestamps. Pure transformer — accepts a `transcript_file` (e.g. `fal_transcribe` JSON output) OR an inline `words[]` array, plus optional style overrides. Each phrase gets one Dialogue event with per-word `\\k<cs>` highlight timing summing to the event duration. Composes with `video_add_subtitles` for burn-in. See `ass_karaoke_prompt_guide` for color literal format and styling guidance.',
    buildAssKaraokeSchemaShape,
    async (params) => {
      const parsed = buildAssKaraokeSchema.parse(params);
      const {
        transcript_file,
        words: inlineWords,
        output,
        max_words_per_phrase,
        font_name,
        font_size,
        unhighlighted_color,
        highlighted_color,
        outline_color,
        outline_thickness,
        margin_v,
        play_res_x,
        play_res_y,
      } = parsed;

      let words: TranscribedWord[];
      let inputCleanup: (() => Promise<void>) | undefined;

      if (transcript_file !== undefined) {
        const inR = await resolveInput(transcript_file);
        inputCleanup = inR.cleanup;
        const text = await readFile(inR.localPath, 'utf8');
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(text);
        } catch (err) {
          throw new Error(
            `build_ass_karaoke: transcript_file ${transcript_file} is not valid JSON: ${
              err instanceof Error ? err.message : String(err)
            }`,
            { cause: err },
          );
        }
        words = extractWordsFromTranscript(parsedJson);
      } else if (inlineWords !== undefined) {
        words = inlineWords;
      } else {
        // Schema refine should have caught this, but belt-and-suspenders.
        throw new Error('build_ass_karaoke: provide exactly one of `transcript_file` or `words`.');
      }

      const options: AssKaraokeOptions = {};
      if (max_words_per_phrase !== undefined) options.max_words_per_phrase = max_words_per_phrase;
      if (font_name !== undefined) options.font_name = font_name;
      if (font_size !== undefined) options.font_size = font_size;
      if (unhighlighted_color !== undefined) options.unhighlighted_color = unhighlighted_color;
      if (highlighted_color !== undefined) options.highlighted_color = highlighted_color;
      if (outline_color !== undefined) options.outline_color = outline_color;
      if (outline_thickness !== undefined) options.outline_thickness = outline_thickness;
      if (margin_v !== undefined) options.margin_v = margin_v;
      if (play_res_x !== undefined) options.play_res_x = play_res_x;
      if (play_res_y !== undefined) options.play_res_y = play_res_y;

      const ass = buildAssFromWords(words, options);

      const outR = await resolveOutput(output);
      try {
        await mkdir(dirname(outR.localPath), { recursive: true });
        await writeFile(outR.localPath, ass, 'utf8');
        await outR.commit();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  output,
                  bytes: Buffer.byteLength(ass, 'utf8'),
                  word_count: words.length,
                },
                null,
                2,
              ),
            },
          ],
        };
      } finally {
        await outR.cleanup?.();
        await inputCleanup?.();
      }
    },
  );
}

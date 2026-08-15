/**
 * ASS karaoke caption writer.
 *
 * Pure transformer — takes word-level timestamps from a forced-alignment-grade
 * ASR (default: Scribe v2) and emits a complete ASS file as a UTF-8 string.
 * No I/O, no async, no external dependencies.
 *
 * Each phrase becomes one Dialogue event spanning `first.start → last.end`.
 * Per-word `\k<cs>` durations bridge each word to the start of the next
 * (last word's `\k` covers its own duration only). Total `\k` sum equals
 * event duration, so libass advances the highlight in sync with the audio.
 *
 * Highlight semantics (libass `\k`): word starts in `SecondaryColour`
 * (`unhighlighted_color`); at the karaoke offset, it flips to
 * `PrimaryColour` (`highlighted_color`) and stays through the event end.
 * Trailing-highlight effect: words "fill in" with the accent as the
 * speaker says them.
 *
 * Ported 2026-04-27 from social-content-pipeline/src/stages/subtitles.ts
 * (V1 shipped 2026-04-27, validated end-to-end against Kling lip movement
 * on the toothpick reel).
 */

/**
 * Word-level timestamp from a forced-alignment-grade ASR (Scribe v2).
 * Matches the artificer `fal_transcribe` normalized `words[]` shape —
 * extra fields like `type` / `speaker_id` are accepted and ignored.
 */
export interface TranscribedWord {
  text: string;
  /** Start time in seconds from the beginning of the transcribed audio. */
  start: number;
  /** End time in seconds. May exceed start by ≥1 frame; gaps to next word are real. */
  end: number;
}

/** Style knobs for the ASS karaoke writer. All fields optional; defaults give a 9:16 phone-reel look. */
export interface AssKaraokeOptions {
  /**
   * Maximum words shown on screen at once. 3 reads cleanly on 9:16; 4-5
   * works on 16:9. Punctuation always forces a phrase break regardless
   * of count.
   */
  max_words_per_phrase?: number;
  /** Font family. Must be installed on the rendering host (artificer / ffmpeg). */
  font_name?: string;
  /** Font size in ASS units (relative to PlayResY). 96 ≈ ~9% of a 1080-wide phone frame. */
  font_size?: number;
  /** ASS color for words that have NOT yet been highlighted (`SecondaryColour`). Default: white. */
  unhighlighted_color?: string;
  /** ASS color for words once their karaoke time arrives (`PrimaryColour`). Default: brand accent #b0445b. */
  highlighted_color?: string;
  /** Outline color (`OutlineColour`). Default: black. */
  outline_color?: string;
  /** Outline thickness in pixels. Default 6 — heavy enough to stay legible on busy backgrounds. */
  outline_thickness?: number;
  /** Vertical margin from the bottom of the frame (Alignment=2). Default 240 lifts captions out of TikTok's bottom UI overlap zone. */
  margin_v?: number;
  /** PlayResX (script reference width). Default 1080 (9:16 phone). */
  play_res_x?: number;
  /** PlayResY (script reference height). Default 1920. */
  play_res_y?: number;
}

interface ResolvedAssOptions {
  max_words_per_phrase: number;
  font_name: string;
  font_size: number;
  unhighlighted_color: string;
  highlighted_color: string;
  outline_color: string;
  outline_thickness: number;
  margin_v: number;
  play_res_x: number;
  play_res_y: number;
}

const DEFAULT_ASS_OPTIONS: ResolvedAssOptions = {
  max_words_per_phrase: 3,
  font_name: 'DM Sans',
  font_size: 96,
  // ASS color literals are &HAABBGGRR (alpha-BGR, alpha 00 = opaque).
  unhighlighted_color: '&H00FFFFFF', // white
  highlighted_color: '&H005B44B0', // #b0445b → BGR 5B,44,B0
  outline_color: '&H00000000', // black
  outline_thickness: 6,
  margin_v: 240,
  play_res_x: 1080,
  play_res_y: 1920,
};

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Group consecutive words into short phrases for karaoke display. */
function groupWordsIntoPhrases(
  words: TranscribedWord[],
  max_per_phrase: number,
): TranscribedWord[][] {
  if (max_per_phrase < 1) {
    throw new Error(`groupWordsIntoPhrases: max_per_phrase must be ≥ 1 (got ${max_per_phrase}).`);
  }
  const phrases: TranscribedWord[][] = [];
  let current: TranscribedWord[] = [];
  for (const word of words) {
    current.push(word);
    const ends_in_terminal = /[.!?]$/.test(word.text.trim());
    const ends_in_clause = /[,;:]$/.test(word.text.trim());
    const at_max = current.length >= max_per_phrase;
    if (ends_in_terminal || at_max || ends_in_clause) {
      phrases.push(current);
      current = [];
    }
  }
  if (current.length > 0) phrases.push(current);
  return phrases;
}

/** Format seconds as ASS time `H:MM:SS.cs`. */
function formatAssTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error(
      `formatAssTime: seconds must be a non-negative finite number (got ${seconds}).`,
    );
  }
  const total_cs = Math.round(seconds * 100);
  const cs = total_cs % 100;
  const total_s = Math.floor(total_cs / 100);
  const ss = total_s % 60;
  const total_m = Math.floor(total_s / 60);
  const mm = total_m % 60;
  const hh = Math.floor(total_m / 60);
  return `${hh}:${pad2(mm)}:${pad2(ss)}.${pad2(cs)}`;
}

/** Escape ASS reserved characters in word text. */
function escapeAssText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

/**
 * Build an ASS karaoke caption file from word-level timestamps.
 *
 * @throws if `words` is empty.
 */
export function buildAssFromWords(
  words: TranscribedWord[],
  options: AssKaraokeOptions = {},
): string {
  if (words.length === 0) {
    throw new Error('buildAssFromWords: words array is empty.');
  }
  const opts: ResolvedAssOptions = { ...DEFAULT_ASS_OPTIONS, ...options };
  const phrases = groupWordsIntoPhrases(words, opts.max_words_per_phrase);

  const events: string[] = [];
  for (const phrase of phrases) {
    const first = phrase[0];
    const last = phrase[phrase.length - 1];
    if (!first || !last) continue;
    const phrase_end = Math.max(last.end, first.start + 0.05);
    const start_cs = Math.round(first.start * 100);
    const end_cs = Math.round(phrase_end * 100);
    let allocated_cs = 0;
    const text_parts: string[] = [];
    for (let i = 0; i < phrase.length; i++) {
      const word = phrase[i];
      if (!word) continue;
      const next = phrase[i + 1];
      const is_last = i === phrase.length - 1;
      let word_cs: number;
      if (is_last || !next) {
        // Last word: cover from its own start to the phrase end.
        word_cs = end_cs - start_cs - allocated_cs;
      } else {
        // Bridge to the next word's start so libass holds the highlight
        // through the inter-word gap.
        const this_start_cs = Math.round(word.start * 100);
        const next_start_cs = Math.round(next.start * 100);
        word_cs = next_start_cs - this_start_cs;
      }
      // ASS rejects \k0 (no-op timing); libass clamps but be safe.
      if (word_cs < 1) word_cs = 1;
      allocated_cs += word_cs;
      const trailing_space = is_last ? '' : ' ';
      text_parts.push(`{\\k${word_cs}}${escapeAssText(word.text)}${trailing_space}`);
    }
    const start_str = formatAssTime(start_cs / 100);
    const end_str = formatAssTime(end_cs / 100);
    events.push(`Dialogue: 0,${start_str},${end_str},Default,,0,0,0,,${text_parts.join('')}`);
  }

  const style_line = [
    'Style: Default',
    opts.font_name,
    String(opts.font_size),
    opts.highlighted_color, // PrimaryColour
    opts.unhighlighted_color, // SecondaryColour
    opts.outline_color, // OutlineColour
    '&H80000000', // BackColour (semi-transparent black, unused at BorderStyle=1)
    '1', // Bold
    '0', // Italic
    '0', // Underline
    '0', // StrikeOut
    '100', // ScaleX
    '100', // ScaleY
    '0', // Spacing
    '0', // Angle
    '1', // BorderStyle (1 = outline + drop shadow, 3 = opaque box)
    String(opts.outline_thickness), // Outline
    '2', // Shadow
    '2', // Alignment (2 = bottom-center)
    '60', // MarginL
    '60', // MarginR
    String(opts.margin_v), // MarginV
    '1', // Encoding
  ].join(',');

  const header = [
    '[Script Info]',
    'Title: Karaoke captions',
    'ScriptType: v4.00+',
    `PlayResX: ${opts.play_res_x}`,
    `PlayResY: ${opts.play_res_y}`,
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    style_line,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    ...events,
    '',
  ].join('\n');

  return header;
}

// Exported for unit-test access without re-exporting the whole module surface.
export const __test__ = { groupWordsIntoPhrases, formatAssTime, escapeAssText };

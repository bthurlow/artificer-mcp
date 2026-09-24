/**
 * Pure helpers for `align_text_to_audio` (TODO #7): map a forced aligner's
 * word timings back onto the caller's own script, and format the result.
 *
 * The aligner already knows the exact text, so its words come back in
 * script order. The matching here only absorbs tokenization differences
 * (punctuation tokens, contractions, hyphenation), so it is a greedy
 * in-order match with a small lookahead, not a full sequence alignment.
 */

export interface AlignedWord {
  text: string;
  start: number;
  end: number;
  /** Aligner's per-word loss; higher means a weaker acoustic match. */
  loss?: number;
}

export interface AlignedLine {
  text: string;
  start: number;
  end: number;
  /** Words of this line the aligner timed; 0 means the timing was interpolated. */
  matched_words: number;
  total_words: number;
  interpolated: boolean;
}

/** Lowercased letters and digits only, so "Don't," and "dont" compare equal. */
export function normalizeToken(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

/** Script lines: non-empty lines of the input, trimmed. */
export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Parse the aligner's `words[]` defensively; drop entries without numeric times. */
export function parseAlignerWords(data: unknown): { words: AlignedWord[]; loss?: number } {
  if (typeof data !== 'object' || data === null) {
    throw new Error(`aligner returned a non-object result (got ${typeof data})`);
  }
  const record = data as { words?: unknown; loss?: unknown };
  if (!Array.isArray(record.words)) throw new Error('aligner response has no `words` array');
  const words: AlignedWord[] = [];
  for (const w of record.words) {
    if (typeof w !== 'object' || w === null) continue;
    const { text, start, end, loss } = w as Record<string, unknown>;
    if (typeof text !== 'string' || typeof start !== 'number' || typeof end !== 'number') continue;
    words.push({ text, start, end, ...(typeof loss === 'number' ? { loss } : {}) });
  }
  return { words, ...(typeof record.loss === 'number' ? { loss: record.loss } : {}) };
}

const LOOKAHEAD = 4;

/**
 * Assign aligner words to script lines and compute each line's span.
 *
 * Walks the script tokens in order, matching each exactly (after
 * normalization) against the next few aligner words, dropping
 * punctuation-only tokens first. A token with no
 * match within the lookahead is left untimed rather than guessed. A line
 * with no timed word at all gets its span interpolated between its
 * neighbours and is marked `interpolated`.
 */
export function alignLines(scriptText: string, alignerWords: AlignedWord[]): AlignedLine[] {
  const lines = splitLines(scriptText);
  const words = alignerWords.filter((w) => normalizeToken(w.text).length > 0);
  let cursor = 0;

  const raw = lines.map((line) => {
    const tokens = line.split(/\s+/).map(normalizeToken).filter(Boolean);
    let start: number | undefined;
    let end: number | undefined;
    let matched = 0;
    for (const token of tokens) {
      for (let k = cursor; k < Math.min(words.length, cursor + LOOKAHEAD); k++) {
        // Exact match, possibly spanning consecutive aligner tokens so a split
        // contraction ("don" + "t") joins back into the script's "dont".
        // Never a bare prefix match: "a" must not claim the script's "and".
        let joined = normalizeToken(words[k].text);
        let last = k;
        while (joined !== token && token.startsWith(joined) && last + 1 < words.length) {
          last++;
          joined += normalizeToken(words[last].text);
        }
        if (joined === token) {
          start ??= words[k].start;
          end = words[last].end;
          matched++;
          cursor = last + 1;
          break;
        }
      }
    }
    return { text: line, start, end, matched, total: tokens.length };
  });

  // Interpolate lines with no timed word from the nearest timed neighbours.
  return raw.map((l, i) => {
    if (l.start !== undefined && l.end !== undefined) {
      return {
        text: l.text,
        start: l.start,
        end: l.end,
        matched_words: l.matched,
        total_words: l.total,
        interpolated: false,
      };
    }
    const prevEnd = [...raw.slice(0, i)].reverse().find((x) => x.end !== undefined)?.end ?? 0;
    const next = raw.slice(i + 1).find((x) => x.start !== undefined)?.start;
    const nextStart = next ?? prevEnd;
    return {
      text: l.text,
      start: prevEnd,
      end: Math.max(prevEnd, nextStart),
      matched_words: 0,
      total_words: l.total,
      interpolated: true,
    };
  });
}

/**
 * Words whose loss stands out from this clip's own distribution
 * (above mean + 2 standard deviations). Loss has no documented absolute
 * scale, so a fixed threshold would be a guess.
 */
export function lowConfidenceWords(words: AlignedWord[]): AlignedWord[] {
  const losses = words.map((w) => w.loss).filter((l): l is number => typeof l === 'number');
  if (losses.length < 5) return [];
  const mean = losses.reduce((a, b) => a + b, 0) / losses.length;
  const sd = Math.sqrt(losses.reduce((a, b) => a + (b - mean) ** 2, 0) / losses.length);
  if (sd === 0) return [];
  return words.filter((w) => typeof w.loss === 'number' && w.loss > mean + 2 * sd);
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/** LRC timestamp [mm:ss.xx]. */
export function lrcTime(seconds: number): string {
  const cs = Math.round(Math.max(0, seconds) * 100);
  return `[${pad(Math.floor(cs / 6000), 2)}:${pad(Math.floor(cs / 100) % 60, 2)}.${pad(cs % 100, 2)}]`;
}

/** SRT timestamp hh:mm:ss,mmm. */
export function srtTime(seconds: number): string {
  const ms = Math.round(Math.max(0, seconds) * 1000);
  return `${pad(Math.floor(ms / 3_600_000), 2)}:${pad(Math.floor(ms / 60_000) % 60, 2)}:${pad(
    Math.floor(ms / 1000) % 60,
    2,
  )},${pad(ms % 1000, 3)}`;
}

export function toLrc(lines: AlignedLine[]): string {
  return lines.map((l) => `${lrcTime(l.start)}${l.text}`).join('\n') + '\n';
}

export function toSrt(lines: AlignedLine[]): string {
  return lines
    .map((l, i) => `${i + 1}\n${srtTime(l.start)} --> ${srtTime(l.end)}\n${l.text}\n`)
    .join('\n');
}

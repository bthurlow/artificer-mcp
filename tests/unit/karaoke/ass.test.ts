/**
 * Pure-function tests for the ASS karaoke writer.
 *
 * Ported verbatim from social-content-pipeline/tests/unit/subtitles.test.ts
 * (the `groupWordsIntoPhrases`, `formatAssTime`, `escapeAssText`, and
 * `buildAssFromWords` describe blocks). Fixtures preserve the same
 * timestamps so any divergence here would be a real semantic regression
 * vs. the V1 that shipped 2026-04-27.
 */
import { describe, expect, test } from 'vitest';
import {
  __test__ as assInternals,
  buildAssFromWords,
  type TranscribedWord,
} from '../../../src/karaoke/ass.js';

describe('groupWordsIntoPhrases', () => {
  const W = (text: string, start = 0, end = 0): TranscribedWord => ({ text, start, end });

  test('respects max_per_phrase cap when no punctuation', () => {
    const words = [W('a'), W('b'), W('c'), W('d'), W('e')];
    const phrases = assInternals.groupWordsIntoPhrases(words, 3);
    expect(phrases.map((p) => p.map((w) => w.text))).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e'],
    ]);
  });

  test('terminal punctuation forces a break before max', () => {
    const words = [W('Hello'), W('world.'), W('Next'), W('phrase')];
    const phrases = assInternals.groupWordsIntoPhrases(words, 5);
    expect(phrases.map((p) => p.map((w) => w.text))).toEqual([
      ['Hello', 'world.'],
      ['Next', 'phrase'],
    ]);
  });

  test('comma also forces a break (clause-level)', () => {
    const words = [W('First,'), W('then'), W('second'), W('end.')];
    const phrases = assInternals.groupWordsIntoPhrases(words, 5);
    expect(phrases.map((p) => p.map((w) => w.text))).toEqual([
      ['First,'],
      ['then', 'second', 'end.'],
    ]);
  });

  test('throws on max_per_phrase < 1', () => {
    expect(() => assInternals.groupWordsIntoPhrases([W('a')], 0)).toThrow(/max_per_phrase/);
  });

  test('empty input returns empty array', () => {
    expect(assInternals.groupWordsIntoPhrases([], 3)).toEqual([]);
  });
});

describe('formatAssTime', () => {
  test('formats sub-second values with centisecond precision', () => {
    expect(assInternals.formatAssTime(0)).toBe('0:00:00.00');
    expect(assInternals.formatAssTime(0.14)).toBe('0:00:00.14');
    expect(assInternals.formatAssTime(1.059)).toBe('0:00:01.06');
  });

  test('rolls minutes and hours', () => {
    expect(assInternals.formatAssTime(65.5)).toBe('0:01:05.50');
    expect(assInternals.formatAssTime(3725.99)).toBe('1:02:05.99');
  });

  test('throws on negative or non-finite seconds', () => {
    expect(() => assInternals.formatAssTime(-0.1)).toThrow();
    expect(() => assInternals.formatAssTime(NaN)).toThrow();
  });
});

describe('escapeAssText', () => {
  test('escapes backslash and braces (rare in transcripts but possible)', () => {
    expect(assInternals.escapeAssText('a\\b')).toBe('a\\\\b');
    expect(assInternals.escapeAssText('hi {there}')).toBe('hi \\{there\\}');
  });

  test('passes ordinary words through unchanged', () => {
    expect(assInternals.escapeAssText('toothpick')).toBe('toothpick');
    expect(assInternals.escapeAssText("doesn't")).toBe("doesn't");
  });
});

describe('buildAssFromWords', () => {
  const W = (text: string, start: number, end: number): TranscribedWord => ({
    text,
    start,
    end,
  });

  test('throws on empty words', () => {
    expect(() => buildAssFromWords([])).toThrow(/empty/);
  });

  test('emits a Script Info / Styles / Events block with one Dialogue per phrase', () => {
    const words = [W('The', 0.14, 0.219), W('toothpick', 0.319, 0.659), W('test', 0.759, 1.059)];
    const ass = buildAssFromWords(words);
    expect(ass).toContain('[Script Info]');
    expect(ass).toContain('[V4+ Styles]');
    expect(ass).toContain('[Events]');
    expect(ass).toContain('Style: Default');
    const events = ass.split('\n').filter((l) => l.startsWith('Dialogue:'));
    expect(events).toHaveLength(1);
    expect(events[0]).toContain('{\\k18}The');
    expect(events[0]).toContain('{\\k44}toothpick');
    expect(events[0]).toContain('{\\k30}test');
  });

  test('per-word \\k centiseconds sum to phrase duration', () => {
    const words = [W('one', 0.0, 0.4), W('two', 0.5, 0.9), W('three', 1.1, 1.5)];
    const ass = buildAssFromWords(words, { max_words_per_phrase: 5 });
    const event = ass.split('\n').find((l) => l.startsWith('Dialogue:'))!;
    // Parse all \k<int> tokens.
    const ks = [...event.matchAll(/\\k(\d+)/g)].map((m) => Number(m[1]));
    const sum = ks.reduce((a, b) => a + b, 0);
    // Phrase span = 1.5 - 0.0 = 1.50s = 150cs
    expect(sum).toBe(150);
  });

  test('punctuation closes a phrase even under the max', () => {
    const words = [
      W('Hello', 0, 0.3),
      W('world.', 0.4, 0.8),
      W('Next', 1.0, 1.3),
      W('one', 1.4, 1.7),
    ];
    const ass = buildAssFromWords(words, { max_words_per_phrase: 5 });
    const events = ass.split('\n').filter((l) => l.startsWith('Dialogue:'));
    expect(events).toHaveLength(2);
    expect(events[0]).toContain('Hello');
    expect(events[0]).toContain('world.');
    expect(events[1]).toContain('Next');
    expect(events[1]).toContain('one');
  });

  test('respects custom style options', () => {
    const words = [W('hi', 0, 0.5)];
    const ass = buildAssFromWords(words, {
      font_name: 'Inter',
      font_size: 120,
      highlighted_color: '&H0000FFFF', // yellow in BGR
      margin_v: 320,
    });
    expect(ass).toContain('Inter');
    expect(ass).toContain(',120,');
    expect(ass).toContain('&H0000FFFF');
    expect(ass).toContain(',320,');
  });

  test('clamps tiny inter-word gaps to k=1 (no \\k0)', () => {
    // Two words with identical starts (degenerate input from a hiccup
    // in the upstream ASR) — bridge would compute as 0.
    const words = [W('a', 1.0, 1.05), W('b', 1.0, 1.10)];
    const ass = buildAssFromWords(words, { max_words_per_phrase: 5 });
    const event = ass.split('\n').find((l) => l.startsWith('Dialogue:'))!;
    const ks = [...event.matchAll(/\\k(\d+)/g)].map((m) => Number(m[1]));
    expect(ks.every((k) => k >= 1)).toBe(true);
  });

  test('escapes ASS reserved chars in word text', () => {
    const words = [W('weird{word}', 0, 0.5)];
    const ass = buildAssFromWords(words);
    expect(ass).toContain('weird\\{word\\}');
  });

  test('PlayRes header reflects custom dimensions', () => {
    const words = [W('hi', 0, 0.5)];
    const ass = buildAssFromWords(words, { play_res_x: 1920, play_res_y: 1080 });
    expect(ass).toContain('PlayResX: 1920');
    expect(ass).toContain('PlayResY: 1080');
  });
});

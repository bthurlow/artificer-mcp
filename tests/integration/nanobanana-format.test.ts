/**
 * Integration — the nano-banana output-format fix (TODO #25) against real
 * ImageMagick. No Gemini call: the model's JPEG-for-a-.png behavior is
 * reproduced with a real JPEG, which is exactly what the API returns.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { matchRequestedFormat } from '../../src/generation/nanobanana.js';
import { imageDimensions, sniffImageFormat } from '../../src/generation/image-bytes.js';

const execFileAsync = promisify(execFile);

function hasMagickSync(): boolean {
  try {
    execFileSync('magick', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const hasMagick = hasMagickSync();
if (!hasMagick) {
  // eslint-disable-next-line no-console
  console.warn('[integration/nanobanana-format] magick not found on PATH — tests skipped.');
}

let dir: string;
let jpegBytes: Buffer;

beforeAll(async () => {
  if (!hasMagick) return;
  dir = join(tmpdir(), `artificer-nb-format-${randomUUID()}`);
  await mkdir(dir, { recursive: true });
  const jpg = join(dir, 'model-output.jpg');
  // 896×1200 is what the 1K default produced at 3:4 in the btmusic report.
  await execFileAsync('magick', ['-size', '896x1200', 'gradient:red-blue', `JPEG:${jpg}`]);
  jpegBytes = await readFile(jpg);
}, 30_000);

afterAll(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
});

describe('Integration: nano-banana output format', () => {
  it.skipIf(!hasMagick)('converts JPEG bytes into a real PNG for a .png output', async () => {
    expect(sniffImageFormat(jpegBytes)?.mime).toBe('image/jpeg');
    const out = await matchRequestedFormat(jpegBytes, join(dir, 'bust.png'), 'image/jpeg');

    expect(out.mime).toBe('image/png');
    expect(out.note).toBe('converted from JPEG to PNG');
    expect(sniffImageFormat(out.bytes)?.mime).toBe('image/png');
    // Conversion must not resize.
    expect(imageDimensions(out.bytes)).toEqual({ width: 896, height: 1200 });
  }, 30_000);

  it.skipIf(!hasMagick)('writes matching bytes untouched', async () => {
    const out = await matchRequestedFormat(jpegBytes, join(dir, 'bust.jpg'), 'image/jpeg');
    expect(out.bytes).toBe(jpegBytes);
    expect(out.note).toBeUndefined();
  });

  it.skipIf(!hasMagick)('converts to WebP when the extension asks for it', async () => {
    const out = await matchRequestedFormat(jpegBytes, join(dir, 'bust.webp'), 'image/jpeg');
    expect(sniffImageFormat(out.bytes)?.mime).toBe('image/webp');
  }, 30_000);
});

import { describe, it, expect, afterAll } from 'vitest';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  ensureOutputDir,
  getExtension,
  resolveOutputPath,
  tempPath,
  SUPPORTED_FORMATS,
  IAB_BANNER_SIZES,
  SOCIAL_SIZES,
  RESPONSIVE_WIDTHS,
  IOS_ICON_SIZES,
  ANDROID_ICON_SIZES,
  ASPECT_RATIOS,
  validateInputFile,
} from '../../../src/utils/exec.js';

// Scratch dir for fs-touching assertions.
const SCRATCH = join(tmpdir(), `artificer-exec-test-${randomUUID()}`);

afterAll(async () => {
  await rm(SCRATCH, { recursive: true, force: true });
});

describe('resolveOutputPath', () => {
  it('returns the explicit outputPath when provided', () => {
    expect(
      resolveOutputPath('/in/foo.png', { outputPath: '/out/bar.jpg' }),
    ).toBe('/out/bar.jpg');
  });

  it('appends default _output suffix and preserves extension when no options', () => {
    const out = resolveOutputPath('/some/dir/picture.png');
    expect(out.endsWith('picture_output.png')).toBe(true);
  });

  it('uses a custom suffix', () => {
    const out = resolveOutputPath('/some/dir/picture.png', { suffix: '_thumb' });
    expect(out.endsWith('picture_thumb.png')).toBe(true);
  });

  it('uses a custom format (prefixes the dot)', () => {
    const out = resolveOutputPath('/some/dir/picture.png', { format: 'webp' });
    expect(out.endsWith('picture_output.webp')).toBe(true);
  });

  it('combines custom suffix and format', () => {
    const out = resolveOutputPath('/some/dir/picture.png', {
      suffix: '-sm',
      format: 'avif',
    });
    expect(out.endsWith('picture-sm.avif')).toBe(true);
  });

  it('falls through input extension when format omitted', () => {
    const out = resolveOutputPath('/a/b/c.tiff', { suffix: '' });
    expect(out.endsWith('c.tiff')).toBe(true);
  });
});

describe('tempPath', () => {
  it('returns a path inside the OS temp dir', () => {
    const p = tempPath('.png');
    expect(p.startsWith(tmpdir())).toBe(true);
  });

  it('includes the provided extension', () => {
    expect(tempPath('.webp').endsWith('.webp')).toBe(true);
    expect(tempPath('.mp4').endsWith('.mp4')).toBe(true);
  });

  it('produces unique paths on repeated calls', () => {
    const a = tempPath('.png');
    const b = tempPath('.png');
    expect(a).not.toBe(b);
  });
});

describe('getExtension', () => {
  it('returns lowercased extension without the leading dot', () => {
    expect(getExtension('photo.PNG')).toBe('png');
    expect(getExtension('/a/b/clip.MP4')).toBe('mp4');
  });

  it('returns empty string for no extension', () => {
    expect(getExtension('readme')).toBe('');
    expect(getExtension('/path/to/dir.with.dots/file')).toBe('');
  });

  it('handles double extensions by returning only the final one', () => {
    expect(getExtension('archive.tar.gz')).toBe('gz');
  });
});

describe('ensureOutputDir', () => {
  it('creates nested parent directories for the file path', async () => {
    const filePath = join(SCRATCH, 'deep', 'nested', 'dir', 'file.txt');
    await ensureOutputDir(filePath);
    const dirStat = await stat(join(SCRATCH, 'deep', 'nested', 'dir'));
    expect(dirStat.isDirectory()).toBe(true);
  });

  it('is idempotent — no error if the directory already exists', async () => {
    const filePath = join(SCRATCH, 'dup', 'file.txt');
    await ensureOutputDir(filePath);
    await ensureOutputDir(filePath);
    const dirStat = await stat(join(SCRATCH, 'dup'));
    expect(dirStat.isDirectory()).toBe(true);
  });
});

describe('validateInputFile', () => {
  it('resolves silently when the file exists and is a regular file', async () => {
    const filePath = join(SCRATCH, 'valid', 'file.txt');
    await mkdir(join(SCRATCH, 'valid'), { recursive: true });
    await writeFile(filePath, 'hello');
    await expect(validateInputFile(filePath)).resolves.toBeUndefined();
  });

  it('throws a descriptive error when the file is missing', async () => {
    const missing = join(SCRATCH, 'no-such-file.txt');
    await expect(validateInputFile(missing)).rejects.toThrow(/not found/);
  });

  it('throws when the path exists but is a directory', async () => {
    const dirPath = join(SCRATCH, 'im-a-dir');
    await mkdir(dirPath, { recursive: true });
    await expect(validateInputFile(dirPath)).rejects.toThrow(/Not a file/);
  });
});

describe('constants sanity', () => {
  it('SUPPORTED_FORMATS includes common image formats', () => {
    expect(SUPPORTED_FORMATS).toContain('png');
    expect(SUPPORTED_FORMATS).toContain('jpg');
    expect(SUPPORTED_FORMATS).toContain('webp');
  });

  it('IAB_BANNER_SIZES has the standard leaderboard 728×90', () => {
    expect(IAB_BANNER_SIZES.leaderboard).toEqual({ width: 728, height: 90 });
  });

  it('SOCIAL_SIZES has og 1200×630', () => {
    expect(SOCIAL_SIZES.og).toEqual({ width: 1200, height: 630 });
  });

  it('RESPONSIVE_WIDTHS is monotonically increasing', () => {
    for (let i = 1; i < RESPONSIVE_WIDTHS.length; i++) {
      expect(RESPONSIVE_WIDTHS[i]).toBeGreaterThan(RESPONSIVE_WIDTHS[i - 1]);
    }
  });

  it('IOS_ICON_SIZES entries all have scales arrays', () => {
    for (const entry of IOS_ICON_SIZES) {
      expect(Array.isArray(entry.scales)).toBe(true);
      expect(entry.scales.length).toBeGreaterThan(0);
    }
  });

  it('ANDROID_ICON_SIZES has mdpi through xxxhdpi', () => {
    expect(ANDROID_ICON_SIZES.mdpi).toBe(48);
    expect(ANDROID_ICON_SIZES.xxxhdpi).toBe(192);
  });

  it('ASPECT_RATIOS 16:9 and 9:16 are mutual inverses', () => {
    expect(ASPECT_RATIOS['16:9']).toEqual({ w: 16, h: 9 });
    expect(ASPECT_RATIOS['9:16']).toEqual({ w: 9, h: 16 });
  });
});

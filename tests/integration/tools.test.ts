/**
 * Integration tests — run real ImageMagick commands against real images.
 * One test per category to verify actual image processing works.
 *
 * Requires ImageMagick 7+ installed.
 * Skipped automatically if ImageMagick is not available.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServerClient } from '../helpers/server.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rm, stat, access } from 'node:fs/promises';
import { readdirSync, accessSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

const execFileAsync = promisify(execFile);

// Bundled test font — avoids any OS/CI font-resolution fragility.
// See tests/fixtures/fonts/README.md for rationale.
const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_FONT = join(__dirname, '..', 'fixtures', 'fonts', 'Roboto-Regular.ttf');

/**
 * Synchronously find ImageMagick. Checks PATH first, then common install locations.
 * Must be sync so the result is available at test-definition time for skipIf/runIf.
 */
function findImageMagickSync(): boolean {
  // Try PATH first
  try {
    execFileSync('magick', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    // Not on PATH
  }

  const candidates: string[] = [];

  if (process.platform === 'win32') {
    const programFiles = process.env['ProgramFiles'] ?? 'C:\\Program Files';
    try {
      const entries = readdirSync(programFiles);
      for (const entry of entries) {
        if (entry.startsWith('ImageMagick')) {
          candidates.push(join(programFiles, entry));
        }
      }
    } catch {
      // Can't read Program Files
    }
  } else if (process.platform === 'darwin') {
    candidates.push('/opt/homebrew/bin', '/usr/local/bin');
  } else {
    candidates.push('/usr/bin', '/usr/local/bin');
  }

  for (const dir of candidates) {
    const magickPath = process.platform === 'win32' ? join(dir, 'magick.exe') : join(dir, 'magick');
    try {
      accessSync(magickPath);
      // Found — add to PATH for child processes
      const sep = process.platform === 'win32' ? ';' : ':';
      process.env['PATH'] = `${dir}${sep}${process.env['PATH'] ?? ''}`;
      // Verify it actually runs
      execFileSync('magick', ['--version'], { stdio: 'ignore' });
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

const hasImageMagick = findImageMagickSync();

let testDir: string;
let fixtureImage: string;
let client: Client;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  if (!hasImageMagick) return;

  // Create temp directory for test outputs
  testDir = join(tmpdir(), `artificer-mcp-test-${randomUUID()}`);
  await mkdir(testDir, { recursive: true });

  // Create a simple test fixture image (100x100 red square)
  fixtureImage = join(testDir, 'fixture.png');
  await execFileAsync('magick', ['-size', '100x100', 'xc:red', fixtureImage]);

  // Set up MCP server + client
  const setup = await createTestServerClient();
  client = setup.client;
  cleanup = setup.cleanup;
});

afterAll(async () => {
  if (cleanup) await cleanup();
  if (testDir) {
    await rm(testDir, { recursive: true, force: true }).catch(() => {});
  }
});

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fileSize(path: string): Promise<number> {
  const s = await stat(path);
  return s.size;
}

describe('Integration: Core', () => {
  it.skipIf(!hasImageMagick)('resize produces correct dimensions', async () => {
    const output = join(testDir, 'resized.png');
    const result = await client.callTool({
      name: 'resize',
      arguments: { input: fixtureImage, output, width: 50, height: 50 },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);

    const { stdout } = await execFileAsync('magick', ['identify', '-format', '%wx%h', output]);
    expect(stdout.trim()).toBe('50x50');

    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain('Resized');
  });
});

describe('Integration: Text', () => {
  it.skipIf(!hasImageMagick)('text-overlay adds text to image', async () => {
    const output = join(testDir, 'text_overlay.png');
    const result = await client.callTool({
      name: 'text-overlay',
      arguments: {
        input: fixtureImage,
        output,
        text: 'Hello',
        font: TEST_FONT,
        size: 16,
        color: 'white',
        x: 10,
        y: 10,
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);

    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain('Text overlay added');
  });
});

describe('Integration: Compositing', () => {
  it.skipIf(!hasImageMagick)('border adds border to image', async () => {
    const output = join(testDir, 'bordered.png');
    const result = await client.callTool({
      name: 'border',
      arguments: { input: fixtureImage, output, width: 5, color: 'blue' },
    });

    expect(await fileExists(output)).toBe(true);

    const { stdout } = await execFileAsync('magick', ['identify', '-format', '%wx%h', output]);
    expect(stdout.trim()).toBe('110x110');

    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain('Border added');
  });

  /**
   * Regression: a colored layer composited onto a grayscale base used to come
   * back gray — a gold overlay on black rendered silver, on every blend mode.
   * ImageMagick adopts the FIRST image's colorspace, and a solid dark
   * background is routinely stored as a grayscale PNG.
   *
   * These assert real pixel color, not the generated argv, so they fail if the
   * colorspace promotion is ever dropped.
   */
  describe('colored layer on a grayscale base preserves color', () => {
    const GOLD = '#D4AF37';
    /** Read a single pixel as an `srgb(r,g,b)` / `gray(v)` string. */
    async function pixelAt(file: string, x: number, y: number): Promise<string> {
      const { stdout } = await execFileAsync('magick', [
        file,
        '-format',
        `%[pixel:p{${x},${y}}]`,
        'info:',
      ]);
      return stdout.trim();
    }

    /** Build a solid black base. ImageMagick stores this as grayscale. */
    async function grayscaleBlackBase(name: string): Promise<string> {
      const path = join(testDir, name);
      await execFileAsync('magick', ['-size', '200x200', 'xc:#0A0A0A', path]);
      // Guard the premise: if this ever stops being grayscale, these tests
      // would pass for the wrong reason.
      const { stdout } = await execFileAsync('magick', [
        'identify',
        '-format',
        '%[colorspace]',
        path,
      ]);
      expect(stdout.trim()).toBe('Gray');
      return path;
    }

    it.skipIf(!hasImageMagick)('composite keeps the overlay gold (Over)', async () => {
      const base = await grayscaleBlackBase('c-base-over.png');
      const overlay = join(testDir, 'c-gold.png');
      const output = join(testDir, 'c-out-over.png');
      await execFileAsync('magick', ['-size', '80x80', `xc:${GOLD}`, overlay]);

      await client.callTool({
        name: 'composite',
        arguments: { base, overlay, output, blend: 'Over' },
      });

      expect(await pixelAt(output, 100, 100)).toBe('srgb(212,175,55)');
      // Base region must be untouched — the promotion is not allowed to
      // shift tone.
      expect(await pixelAt(output, 5, 5)).toBe('srgb(10,10,10)');
    });

    it.skipIf(!hasImageMagick)('composite keeps the overlay gold (Lighten)', async () => {
      const base = await grayscaleBlackBase('c-base-lighten.png');
      const overlay = join(testDir, 'c-gold2.png');
      const output = join(testDir, 'c-out-lighten.png');
      await execFileAsync('magick', ['-size', '80x80', `xc:${GOLD}`, overlay]);

      await client.callTool({
        name: 'composite',
        arguments: { base, overlay, output, blend: 'Lighten' },
      });

      expect(await pixelAt(output, 100, 100)).toBe('srgb(212,175,55)');
    });

    it.skipIf(!hasImageMagick)('watermark keeps its color', async () => {
      const base = await grayscaleBlackBase('w-base.png');
      const mark = join(testDir, 'w-gold.png');
      const output = join(testDir, 'w-out.png');
      await execFileAsync('magick', ['-size', '80x80', `xc:${GOLD}`, mark]);

      await client.callTool({
        name: 'watermark',
        arguments: {
          input: base,
          watermark: mark,
          output,
          mode: 'position',
          gravity: 'Center',
          opacity: 100,
        },
      });

      expect(await pixelAt(output, 100, 100)).toBe('srgb(212,175,55)');
    });

    it.skipIf(!hasImageMagick)('gradient-overlay stays colored', async () => {
      const base = await grayscaleBlackBase('g-base.png');
      const output = join(testDir, 'g-out.png');

      await client.callTool({
        name: 'gradient-overlay',
        arguments: {
          input: base,
          output,
          type: 'linear',
          direction: 'top-bottom',
          color_start: GOLD,
          color_end: '#8B0000',
        },
      });

      // Not asserting exact stops — only that the result carries chroma at all.
      const top = await pixelAt(output, 100, 3);
      expect(top).toMatch(/^srgb\(/);
      const [r, , b] = top
        .replace(/[^\d,]/g, '')
        .split(',')
        .map(Number);
      expect(r).toBeGreaterThan(b + 20);
    });

    it.skipIf(!hasImageMagick)('an all-grayscale composite still writes grayscale', async () => {
      const base = await grayscaleBlackBase('n-base.png');
      const overlay = join(testDir, 'n-gray.png');
      const output = join(testDir, 'n-out.png');
      await execFileAsync('magick', ['-size', '80x80', 'xc:gray(180)', overlay]);

      await client.callTool({ name: 'composite', arguments: { base, overlay, output } });

      // Promotion must not bloat genuinely colorless output to full RGB.
      const { stdout } = await execFileAsync('magick', [
        'identify',
        '-format',
        '%[colorspace]',
        output,
      ]);
      expect(stdout.trim()).toBe('Gray');
      expect(await pixelAt(output, 100, 100)).toBe('gray(180)');
    });
  });

  describe('extend-canvas', () => {
    /** Read a pixel as an `srgb(...)` / `gray(...)` string. */
    async function px(file: string, x: number, y: number): Promise<string> {
      const { stdout } = await execFileAsync('magick', [
        file,
        '-format',
        `%[pixel:p{${x},${y}}]`,
        'info:',
      ]);
      return stdout.trim();
    }
    async function size(file: string): Promise<string> {
      const { stdout } = await execFileAsync('magick', ['identify', '-format', '%wx%h', file]);
      return stdout.trim();
    }
    /** 200x200 gold square — stands in for a logo. */
    async function goldLogo(name: string): Promise<string> {
      const path = join(testDir, name);
      await execFileAsync('magick', ['-size', '200x200', 'xc:#D4AF37', path]);
      return path;
    }

    it.skipIf(!hasImageMagick)('canvas mode centers a logo on a banner', async () => {
      const input = await goldLogo('ec-logo.png');
      const output = join(testDir, 'ec-banner.png');

      await client.callTool({
        name: 'extend-canvas',
        arguments: { input, output, width: 1200, height: 400, background: '#0A0A0A' },
      });

      expect(await size(output)).toBe('1200x400');
      // Logo intact at center, background filling the sides — not stretched.
      expect(await px(output, 600, 200)).toBe('srgb(212,175,55)');
      expect(await px(output, 20, 200)).toBe('srgb(10,10,10)');
    });

    it.skipIf(!hasImageMagick)('padding mode adds asymmetric padding', async () => {
      const input = await goldLogo('ec-pad-src.png');
      const output = join(testDir, 'ec-pad.png');

      await client.callTool({
        name: 'extend-canvas',
        arguments: {
          input,
          output,
          left: 50,
          top: 10,
          right: 150,
          bottom: 90,
          background: '#0A0A0A',
        },
      });

      // 200+50+150 x 200+10+90
      expect(await size(output)).toBe('400x300');
      // Image origin lands at (left, top), proving the sides differ.
      expect(await px(output, 55, 15)).toBe('srgb(212,175,55)');
      expect(await px(output, 5, 150)).toBe('srgb(10,10,10)');
      expect(await px(output, 395, 150)).toBe('srgb(10,10,10)');
    });

    it.skipIf(!hasImageMagick)('defaults to a transparent fill', async () => {
      const input = await goldLogo('ec-clear-src.png');
      const output = join(testDir, 'ec-clear.png');

      await client.callTool({
        name: 'extend-canvas',
        arguments: { input, output, width: 600, height: 300 },
      });

      expect(await px(output, 5, 5)).toBe('srgba(0,0,0,0)');
    });

    it.skipIf(!hasImageMagick)('rejects ambiguous and empty requests', async () => {
      const input = await goldLogo('ec-bad.png');

      const both = await client.callTool({
        name: 'extend-canvas',
        arguments: {
          input,
          output: join(testDir, 'ec-both.png'),
          width: 400,
          height: 400,
          top: 10,
        },
      });
      expect(both.isError).toBe(true);

      const neither = await client.callTool({
        name: 'extend-canvas',
        arguments: { input, output: join(testDir, 'ec-none.png') },
      });
      expect(neither.isError).toBe(true);
    });
  });

  describe('background-remove flood-fill', () => {
    /**
     * White ring on a white background, with a WHITE INTERIOR. Color-keying
     * punches the interior out along with the background — the "swiss cheese"
     * failure. Flood-fill should reach only the background.
     */
    async function ringOnWhite(name: string): Promise<string> {
      const path = join(testDir, name);
      await execFileAsync('magick', [
        '-size',
        '200x200',
        'xc:white',
        '-fill',
        'black',
        '-draw',
        'circle 100,100 100,40',
        '-fill',
        'white',
        '-draw',
        'circle 100,100 100,70',
        path,
      ]);
      return path;
    }
    /** True when the pixel is fully transparent. */
    async function isClear(file: string, x: number, y: number): Promise<boolean> {
      const { stdout } = await execFileAsync('magick', [
        file,
        '-format',
        `%[pixel:p{${x},${y}}]`,
        'info:',
      ]);
      return /,0\)$/.test(stdout.trim());
    }

    it.skipIf(!hasImageMagick)('color-key punches out interior matches', async () => {
      const input = await ringOnWhite('bg-key-src.png');
      const output = join(testDir, 'bg-key.png');

      await client.callTool({
        name: 'background-remove',
        arguments: { input, output, mode: 'color-key', target_color: 'white', fuzz: 10 },
      });

      // Documents the existing behavior that flood-fill exists to avoid.
      expect(await isClear(output, 2, 2)).toBe(true);
      expect(await isClear(output, 100, 100)).toBe(true);
    });

    it.skipIf(!hasImageMagick)('flood-fill preserves the interior', async () => {
      const input = await ringOnWhite('bg-flood-src.png');
      const output = join(testDir, 'bg-flood.png');

      await client.callTool({
        name: 'background-remove',
        arguments: { input, output, mode: 'flood-fill', fuzz: 10 },
      });

      expect(await isClear(output, 2, 2)).toBe(true);
      // The whole point: same color, but enclosed by the subject.
      expect(await isClear(output, 100, 100)).toBe(false);
    });

    it.skipIf(!hasImageMagick)('flood-fill honors replace_color', async () => {
      const input = await ringOnWhite('bg-replace-src.png');
      const output = join(testDir, 'bg-replace.png');

      await client.callTool({
        name: 'background-remove',
        arguments: { input, output, mode: 'flood-fill', fuzz: 10, replace_color: '#FF0000' },
      });

      const { stdout } = await execFileAsync('magick', [
        output,
        '-format',
        '%[pixel:p{2,2}]',
        'info:',
      ]);
      expect(stdout.trim()).toBe('srgb(255,0,0)');
    });
  });
});

describe('Integration: Color', () => {
  it.skipIf(!hasImageMagick)('adjust modifies image brightness', async () => {
    const output = join(testDir, 'adjusted.png');
    const result = await client.callTool({
      name: 'adjust',
      arguments: { input: fixtureImage, output, brightness: 50 },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);

    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain('Adjusted');
  });
});

describe('Integration: Content', () => {
  it.skipIf(!hasImageMagick)('before-after creates comparison image', async () => {
    const fixture2 = join(testDir, 'fixture_blue.png');
    await execFileAsync('magick', ['-size', '100x100', 'xc:blue', fixture2]);

    const output = join(testDir, 'before_after.png');
    const result = await client.callTool({
      name: 'before-after',
      arguments: {
        before: fixtureImage,
        after: fixture2,
        output,
        width: 200,
        height: 100,
        font: TEST_FONT,
      },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);

    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain('Before/after comparison');
  });
});

describe('Integration: Ads', () => {
  it.skipIf(!hasImageMagick)('cta-button generates button image', async () => {
    const output = join(testDir, 'cta_button.png');
    const result = await client.callTool({
      name: 'cta-button',
      arguments: { output, text: 'Click Me', font: TEST_FONT, width: 200, height: 50 },
    });

    expect(await fileExists(output)).toBe(true);
    expect(await fileSize(output)).toBeGreaterThan(0);

    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain('CTA button created');
  });
});

describe('Integration: Assets', () => {
  it.skipIf(!hasImageMagick)('favicon-set generates multiple sizes', async () => {
    const outputDir = join(testDir, 'favicons');
    await mkdir(outputDir, { recursive: true });

    const result = await client.callTool({
      name: 'favicon-set',
      arguments: {
        input: fixtureImage,
        output_dir: outputDir,
        sizes: [16, 32],
        generate_ico: false,
      },
    });

    expect(await fileExists(join(outputDir, 'favicon-16x16.png'))).toBe(true);
    expect(await fileExists(join(outputDir, 'favicon-32x32.png'))).toBe(true);

    const { stdout } = await execFileAsync('magick', [
      'identify',
      '-format',
      '%wx%h',
      join(outputDir, 'favicon-16x16.png'),
    ]);
    expect(stdout.trim()).toBe('16x16');

    const text = (result.content as { type: string; text: string }[])[0].text;
    expect(text).toContain('Generated');
  });
});

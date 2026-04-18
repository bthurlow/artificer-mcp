import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  resolveInput,
  resolveOutput,
  guessMime,
  deriveOutputUri,
  resolveIO,
} from '../../../src/utils/resource.js';

describe('resolveInput', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'artificer-resolve-input-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('passes bare local paths through unchanged with no cleanup', async () => {
    const path = join(testDir, 'input.jpg');
    await writeFile(path, 'payload');
    const result = await resolveInput(path);
    expect(result.localPath).toBe(path);
    expect(result.cleanup).toBeUndefined();
  });

  it('converts file:// URIs to local paths with no cleanup', async () => {
    const path = join(testDir, 'input.jpg');
    await writeFile(path, 'payload');
    const uri = pathToFileURL(path).toString();
    const result = await resolveInput(uri);
    expect(result.localPath).toBe(path);
    expect(result.cleanup).toBeUndefined();
  });

  it('downloads https:// URIs to a temp file with cleanup', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      arrayBuffer: async () => new TextEncoder().encode('downloaded-bytes').buffer,
    }) as unknown as typeof fetch;

    try {
      const result = await resolveInput('https://example.com/foo.jpg');
      expect(result.localPath).toMatch(/artificer-mcp-/);
      expect(result.localPath.endsWith('.jpg')).toBe(true);
      const bytes = await readFile(result.localPath);
      expect(bytes.toString()).toBe('downloaded-bytes');

      // Cleanup removes the temp file
      await result.cleanup?.();
      await expect(stat(result.localPath)).rejects.toThrow();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('resolveOutput', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'artificer-resolve-output-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('passes local paths through with no-op commit', async () => {
    const path = join(testDir, 'out.jpg');
    const result = await resolveOutput(path);
    expect(result.localPath).toBe(path);
    // Writing and committing is fine — commit is a no-op for local paths
    await writeFile(path, 'local-output');
    await result.commit();
    expect((await readFile(path)).toString()).toBe('local-output');
  });

  it('converts file:// URIs to local paths with no-op commit', async () => {
    const path = join(testDir, 'out.jpg');
    const uri = pathToFileURL(path).toString();
    const result = await resolveOutput(uri);
    expect(result.localPath).toBe(path);
    await writeFile(path, 'file-url-output');
    await result.commit();
    expect((await readFile(path)).toString()).toBe('file-url-output');
  });

  it('throws on commit for https:// URIs (read-only provider)', async () => {
    const result = await resolveOutput('https://example.com/out.jpg');
    // Write bytes to the temp file so commit has something to read
    await writeFile(result.localPath, 'bytes');
    await expect(result.commit()).rejects.toThrow();
  });
});

describe('guessMime', () => {
  it('returns correct MIME for common extensions', () => {
    expect(guessMime('foo.png')).toBe('image/png');
    expect(guessMime('bar.jpg')).toBe('image/jpeg');
    expect(guessMime('bar.JPEG')).toBe('image/jpeg');
    expect(guessMime('clip.mp4')).toBe('video/mp4');
    expect(guessMime('audio.mp3')).toBe('audio/mpeg');
    expect(guessMime('page.pdf')).toBe('application/pdf');
  });

  it('returns undefined for unknown extensions', () => {
    expect(guessMime('file.xyz')).toBeUndefined();
    expect(guessMime('no-extension')).toBeUndefined();
  });

  it('handles URIs with paths', () => {
    expect(guessMime('gs://bucket/folder/foo.webp')).toBe('image/webp');
    expect(guessMime('https://example.com/nested/path/clip.mov')).toBe('video/quicktime');
  });
});

describe('deriveOutputUri', () => {
  it('preserves gs:// scheme and bucket, appends suffix before extension', () => {
    expect(deriveOutputUri('gs://b/path/hero.jpg', { suffix: '_resized' })).toBe(
      'gs://b/path/hero_resized.jpg',
    );
  });

  it('preserves s3:// scheme', () => {
    expect(deriveOutputUri('s3://bucket/key.png', { suffix: '_x' })).toBe(
      's3://bucket/key_x.png',
    );
  });

  it('swaps extension when format given', () => {
    expect(deriveOutputUri('gs://b/x/y.png', { suffix: '_out', format: 'webp' })).toBe(
      'gs://b/x/y_out.webp',
    );
  });

  it('handles gs:// root (no subpath)', () => {
    expect(deriveOutputUri('gs://b/hero.jpg', { suffix: '_r' })).toBe(
      'gs://b/hero_r.jpg',
    );
  });

  it('handles gs:// with no extension', () => {
    expect(deriveOutputUri('gs://b/path/name', { suffix: '_x' })).toBe(
      'gs://b/path/name_x',
    );
  });

  it('handles bare local path', () => {
    const result = deriveOutputUri('/tmp/foo.png', { suffix: '_r' });
    // join() on POSIX returns /tmp/foo_r.png; on Windows uses backslash but tmp is not Windows here
    expect(result).toMatch(/foo_r\.png$/);
    expect(result).toContain('tmp');
  });

  it('defaults suffix to _output', () => {
    expect(deriveOutputUri('gs://b/a.jpg', {})).toBe('gs://b/a_output.jpg');
  });

  it('throws when remote URI has no path segment', () => {
    expect(() => deriveOutputUri('gs://bucket', { suffix: '_x' })).toThrow(/no path/);
  });
});

describe('resolveIO', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'artificer-resolve-io-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('resolves local input + explicit local output; finalize is no-op', async () => {
    const input = join(testDir, 'in.png');
    const output = join(testDir, 'out.png');
    await writeFile(input, 'payload');

    const io = await resolveIO({ input, output });
    expect(io.inputLocal).toBe(input);
    expect(io.outputLocal).toBe(output);
    expect(io.outputUri).toBe(output);

    await writeFile(io.outputLocal, 'result-bytes');
    await io.finalize();
    expect((await readFile(output)).toString()).toBe('result-bytes');
  });

  it('derives output from input when output not given', async () => {
    const input = join(testDir, 'in.png');
    await writeFile(input, 'payload');

    const io = await resolveIO({ input, suffix: '_resized' });
    expect(io.outputUri).toMatch(/in_resized\.png$/);
    expect(io.outputLocal).toBe(io.outputUri); // local path for local input
  });

  it('cleanup on error path does not require commit', async () => {
    const input = join(testDir, 'in.png');
    await writeFile(input, 'payload');

    const io = await resolveIO({ input, suffix: '_x' });
    // Simulate a failure before finalize
    await io.cleanup();
    // No throw expected
  });
});

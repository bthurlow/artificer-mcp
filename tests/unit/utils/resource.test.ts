import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveInput, resolveOutput, guessMime } from '../../../src/utils/resource.js';

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

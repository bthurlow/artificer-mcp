import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LocalProvider } from '../../../src/storage/providers/local.js';
import { HttpsProvider } from '../../../src/storage/providers/https.js';
import { parseScheme, getProvider } from '../../../src/storage/providers/registry.js';
import { NotImplementedError } from '../../../src/storage/types.js';

describe('parseScheme', () => {
  it('returns lowercased scheme for proper URIs', () => {
    expect(parseScheme('gs://bucket/key')).toBe('gs');
    expect(parseScheme('https://example.com/foo.jpg')).toBe('https');
    expect(parseScheme('HTTPS://example.com')).toBe('https');
    expect(parseScheme('s3://bucket/key')).toBe('s3');
  });

  it('returns null for bare paths', () => {
    expect(parseScheme('./foo.jpg')).toBeNull();
    expect(parseScheme('foo.jpg')).toBeNull();
    expect(parseScheme('/abs/path.jpg')).toBeNull();
  });

  it('returns null for Windows drive paths (no ://)', () => {
    expect(parseScheme('C:\\foo\\bar.jpg')).toBeNull();
    expect(parseScheme('D:/projects/foo.jpg')).toBeNull();
  });

  it('returns "file" for file:// URIs', () => {
    expect(parseScheme('file:///tmp/foo.jpg')).toBe('file');
  });
});

describe('LocalProvider', () => {
  const provider = new LocalProvider();
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'artificer-local-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('reads and writes bytes to bare local paths', async () => {
    const path = join(testDir, 'hello.txt');
    await provider.write(path, Buffer.from('hi there'));
    const bytes = await provider.read(path);
    expect(bytes.toString()).toBe('hi there');
  });

  it('reads file:// URIs', async () => {
    const path = join(testDir, 'hello.txt');
    await writeFile(path, 'hello');
    const uri = pathToFileURL(path).toString();
    const bytes = await provider.read(uri);
    expect(bytes.toString()).toBe('hello');
  });

  it('creates parent directories on write', async () => {
    const path = join(testDir, 'nested', 'deep', 'file.txt');
    await provider.write(path, Buffer.from('x'));
    expect((await readFile(path)).toString()).toBe('x');
  });

  it('reports exists correctly', async () => {
    const path = join(testDir, 'exists.txt');
    expect(await provider.exists(path)).toBe(false);
    await writeFile(path, 'present');
    expect(await provider.exists(path)).toBe(true);
  });

  it('deletes files idempotently', async () => {
    const path = join(testDir, 'to-delete.txt');
    await writeFile(path, 'bye');
    await provider.delete(path);
    expect(await provider.exists(path)).toBe(false);
    // Second delete is a no-op — must not throw
    await expect(provider.delete(path)).resolves.toBeUndefined();
  });

  it('lists directory contents as file:// URIs', async () => {
    await writeFile(join(testDir, 'a.txt'), 'a');
    await writeFile(join(testDir, 'b.txt'), 'b');
    const uris = await provider.list(testDir);
    expect(uris).toHaveLength(2);
    expect(uris.every((u) => u.startsWith('file://'))).toBe(true);
  });

  it('returns empty list for missing directories', async () => {
    const uris = await provider.list(join(testDir, 'missing'));
    expect(uris).toEqual([]);
  });

  it('throws NotImplementedError for getPublicUrl', async () => {
    await expect(provider.getPublicUrl('/x')).rejects.toThrow(NotImplementedError);
  });

  it('throws NotImplementedError for getSignedUrl', async () => {
    await expect(provider.getSignedUrl('/x', 3600)).rejects.toThrow(NotImplementedError);
  });
});

describe('HttpsProvider', () => {
  const provider = new HttpsProvider('https');
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('downloads via fetch on read', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      arrayBuffer: async () => new TextEncoder().encode('hello').buffer,
    }) as unknown as typeof fetch;

    const bytes = await provider.read('https://example.com/foo.jpg');
    expect(bytes.toString()).toBe('hello');
  });

  it('throws on non-OK response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      arrayBuffer: async () => new ArrayBuffer(0),
    }) as unknown as typeof fetch;

    await expect(provider.read('https://example.com/404')).rejects.toThrow(/HTTP 404/);
  });

  it('throws NotImplementedError on write', async () => {
    await expect(provider.write('https://x', Buffer.from(''))).rejects.toThrow(NotImplementedError);
  });

  it('throws NotImplementedError on list/delete/getSignedUrl', async () => {
    await expect(provider.list('https://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.delete('https://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.getSignedUrl('https://x', 60)).rejects.toThrow(NotImplementedError);
  });

  it('getPublicUrl returns the URI unchanged', async () => {
    const url = 'https://example.com/foo.jpg';
    expect(await provider.getPublicUrl(url)).toBe(url);
  });

  it('exists returns true for 2xx HEAD, false for errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    expect(await provider.exists('https://example.com/foo')).toBe(true);

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    expect(await provider.exists('https://example.com/broken')).toBe(false);
  });
});

describe('registry', () => {
  it('routes bare paths and file:// to local', () => {
    expect(getProvider('./foo.jpg').scheme).toBe('file');
    expect(getProvider('/abs/path').scheme).toBe('file');
    expect(getProvider('C:\\windows\\path').scheme).toBe('file');
    expect(getProvider('file:///tmp/x').scheme).toBe('file');
  });

  it('routes https:// to https provider', () => {
    expect(getProvider('https://example.com/foo').scheme).toBe('https');
  });

  it('routes http:// to http provider', () => {
    expect(getProvider('http://example.com/foo').scheme).toBe('http');
  });

  it('routes gs:// to GCS provider', () => {
    expect(getProvider('gs://bucket/key').scheme).toBe('gs');
  });

  it('routes s3:// to S3 stub', () => {
    expect(getProvider('s3://bucket/key').scheme).toBe('s3');
  });

  it('routes onedrive:// to OneDrive stub', () => {
    expect(getProvider('onedrive://path').scheme).toBe('onedrive');
  });

  it('throws for truly unregistered schemes', () => {
    expect(() => getProvider('ftp://example.com/key')).toThrow(/No storage provider registered/);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { GCSProvider, parseGcsUri } from '../../../src/storage/providers/gcs.js';
import type { Storage } from '@google-cloud/storage';

describe('parseGcsUri', () => {
  it('splits bucket and path', () => {
    expect(parseGcsUri('gs://my-bucket/path/to/file.jpg')).toEqual({
      bucket: 'my-bucket',
      path: 'path/to/file.jpg',
    });
  });

  it('handles single-segment paths', () => {
    expect(parseGcsUri('gs://bucket/file.jpg')).toEqual({
      bucket: 'bucket',
      path: 'file.jpg',
    });
  });

  it('handles bucket-only URIs (no path)', () => {
    expect(parseGcsUri('gs://my-bucket')).toEqual({
      bucket: 'my-bucket',
      path: '',
    });
  });

  it('handles bucket with trailing slash (empty path)', () => {
    expect(parseGcsUri('gs://my-bucket/')).toEqual({
      bucket: 'my-bucket',
      path: '',
    });
  });

  it('throws on non-gs URIs', () => {
    expect(() => parseGcsUri('s3://bucket/key')).toThrow(/Not a GCS URI/);
    expect(() => parseGcsUri('/local/path')).toThrow(/Not a GCS URI/);
  });

  it('throws on missing bucket', () => {
    expect(() => parseGcsUri('gs:///key')).toThrow(/missing bucket/);
  });
});

/**
 * Build a mock Storage client with spies on bucket(name).file(path) methods.
 * Test authors configure individual method return values per test.
 */
function mockStorage(): {
  storage: Storage;
  fileMethods: {
    download: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    publicUrl: ReturnType<typeof vi.fn>;
    getSignedUrl: ReturnType<typeof vi.fn>;
  };
  bucketMethods: {
    getFiles: ReturnType<typeof vi.fn>;
  };
  bucketSpy: ReturnType<typeof vi.fn>;
  fileSpy: ReturnType<typeof vi.fn>;
} {
  const fileMethods = {
    download: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    publicUrl: vi.fn(),
    getSignedUrl: vi.fn(),
  };
  const fileSpy = vi.fn().mockReturnValue(fileMethods);

  const bucketMethods = {
    getFiles: vi.fn(),
  };
  const bucketSpy = vi.fn().mockImplementation((name: string) => ({
    name,
    file: fileSpy,
    ...bucketMethods,
  }));

  const storage = { bucket: bucketSpy } as unknown as Storage;
  return { storage, fileMethods, bucketMethods, bucketSpy, fileSpy };
}

describe('GCSProvider', () => {
  it('scheme is "gs"', () => {
    const provider = new GCSProvider(mockStorage().storage);
    expect(provider.scheme).toBe('gs');
  });

  it('read: downloads bytes and returns Buffer', async () => {
    const { storage, fileMethods, bucketSpy, fileSpy } = mockStorage();
    fileMethods.download.mockResolvedValue([Buffer.from('hello world')]);
    const provider = new GCSProvider(storage);

    const bytes = await provider.read('gs://bucket/path/file.jpg');

    expect(bucketSpy).toHaveBeenCalledWith('bucket');
    expect(fileSpy).toHaveBeenCalledWith('path/file.jpg');
    expect(fileMethods.download).toHaveBeenCalled();
    expect(bytes.toString()).toBe('hello world');
  });

  it('write: saves bytes with contentType and non-resumable', async () => {
    const { storage, fileMethods } = mockStorage();
    fileMethods.save.mockResolvedValue(undefined);
    const provider = new GCSProvider(storage);

    await provider.write('gs://bucket/out.jpg', Buffer.from('payload'), 'image/jpeg');

    expect(fileMethods.save).toHaveBeenCalledWith(
      Buffer.from('payload'),
      expect.objectContaining({ contentType: 'image/jpeg', resumable: false }),
    );
  });

  it('list: returns gs:// URIs for all files under prefix', async () => {
    const { storage, bucketMethods } = mockStorage();
    bucketMethods.getFiles.mockResolvedValue([
      [{ name: 'folder/a.jpg' }, { name: 'folder/b.jpg' }],
    ]);
    const provider = new GCSProvider(storage);

    const uris = await provider.list('gs://my-bucket/folder/');

    expect(bucketMethods.getFiles).toHaveBeenCalledWith({ prefix: 'folder/' });
    expect(uris).toEqual(['gs://my-bucket/folder/a.jpg', 'gs://my-bucket/folder/b.jpg']);
  });

  it('delete: calls file.delete with ignoreNotFound', async () => {
    const { storage, fileMethods } = mockStorage();
    fileMethods.delete.mockResolvedValue(undefined);
    const provider = new GCSProvider(storage);

    await provider.delete('gs://bucket/file.jpg');

    expect(fileMethods.delete).toHaveBeenCalledWith(expect.objectContaining({ ignoreNotFound: true }));
  });

  it('delete: swallows 404 errors', async () => {
    const { storage, fileMethods } = mockStorage();
    fileMethods.delete.mockRejectedValue(Object.assign(new Error('not found'), { code: 404 }));
    const provider = new GCSProvider(storage);

    // Should not throw
    await expect(provider.delete('gs://bucket/missing.jpg')).resolves.toBeUndefined();
  });

  it('delete: rethrows non-404 errors', async () => {
    const { storage, fileMethods } = mockStorage();
    fileMethods.delete.mockRejectedValue(Object.assign(new Error('forbidden'), { code: 403 }));
    const provider = new GCSProvider(storage);

    await expect(provider.delete('gs://bucket/x.jpg')).rejects.toThrow(/forbidden/);
  });

  it('exists: unwraps tuple return from SDK', async () => {
    const { storage, fileMethods } = mockStorage();
    fileMethods.exists.mockResolvedValue([true]);
    const provider = new GCSProvider(storage);

    expect(await provider.exists('gs://bucket/file.jpg')).toBe(true);

    fileMethods.exists.mockResolvedValue([false]);
    expect(await provider.exists('gs://bucket/missing.jpg')).toBe(false);
  });

  it('getPublicUrl: delegates to file.publicUrl()', async () => {
    const { storage, fileMethods } = mockStorage();
    fileMethods.publicUrl.mockReturnValue('https://storage.googleapis.com/bucket/file.jpg');
    const provider = new GCSProvider(storage);

    const url = await provider.getPublicUrl('gs://bucket/file.jpg');

    expect(url).toBe('https://storage.googleapis.com/bucket/file.jpg');
  });

  it('getSignedUrl: requests v4 read signed URL with TTL', async () => {
    const { storage, fileMethods } = mockStorage();
    fileMethods.getSignedUrl.mockResolvedValue(['https://signed.example.com/url']);
    const provider = new GCSProvider(storage);

    const url = await provider.getSignedUrl('gs://bucket/file.jpg', 3600);

    expect(url).toBe('https://signed.example.com/url');
    expect(fileMethods.getSignedUrl).toHaveBeenCalledWith(
      expect.objectContaining({ version: 'v4', action: 'read' }),
    );
    // Expires should be ~1 hour from now
    const call = fileMethods.getSignedUrl.mock.calls[0][0] as { expires: number };
    expect(call.expires).toBeGreaterThan(Date.now() + 3500_000);
    expect(call.expires).toBeLessThan(Date.now() + 3700_000);
  });
});

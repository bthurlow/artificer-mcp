import { describe, it, expect } from 'vitest';
import { S3Provider } from '../../../src/storage/providers/s3.js';
import { OneDriveProvider } from '../../../src/storage/providers/onedrive.js';
import { NotImplementedError } from '../../../src/storage/types.js';

describe('S3Provider (stub)', () => {
  const provider = new S3Provider();

  it('scheme is "s3"', () => {
    expect(provider.scheme).toBe('s3');
  });

  it('read throws NotImplementedError with contribution link', async () => {
    await expect(provider.read('s3://bucket/key')).rejects.toThrow(NotImplementedError);
    await expect(provider.read('s3://bucket/key')).rejects.toThrow(
      /Contributions welcome.*github\.com\/bthurlow\/artificer-mcp/,
    );
  });

  it('all operations throw NotImplementedError', async () => {
    await expect(provider.write('s3://x', Buffer.from(''))).rejects.toThrow(NotImplementedError);
    await expect(provider.list('s3://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.delete('s3://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.exists('s3://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.getPublicUrl('s3://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.getSignedUrl('s3://x', 60)).rejects.toThrow(NotImplementedError);
  });
});

describe('OneDriveProvider (stub)', () => {
  const provider = new OneDriveProvider();

  it('scheme is "onedrive"', () => {
    expect(provider.scheme).toBe('onedrive');
  });

  it('read throws NotImplementedError with contribution link', async () => {
    await expect(provider.read('onedrive://path/file.jpg')).rejects.toThrow(NotImplementedError);
    await expect(provider.read('onedrive://path')).rejects.toThrow(
      /Contributions welcome.*github\.com\/bthurlow\/artificer-mcp/,
    );
  });

  it('all operations throw NotImplementedError', async () => {
    await expect(provider.write('onedrive://x', Buffer.from(''))).rejects.toThrow(NotImplementedError);
    await expect(provider.list('onedrive://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.delete('onedrive://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.exists('onedrive://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.getPublicUrl('onedrive://x')).rejects.toThrow(NotImplementedError);
    await expect(provider.getSignedUrl('onedrive://x', 60)).rejects.toThrow(NotImplementedError);
  });
});

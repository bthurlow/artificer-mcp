import { readFile, writeFile, mkdir, rm, stat, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { NotImplementedError, type StorageProvider } from '../types.js';

/**
 * Storage provider for local filesystem access.
 *
 * Handles both bare paths (`./foo.jpg`, `D:\foo\bar.jpg`) and `file://` URIs.
 * Bare paths without a scheme are resolved relative to the current working
 * directory — this matches how ImageMagick itself treats CLI arguments.
 *
 * Public and signed URLs are not supported — throws NotImplementedError.
 */
export class LocalProvider implements StorageProvider {
  readonly scheme = 'file';

  async read(uri: string): Promise<Buffer> {
    return readFile(this.toPath(uri));
  }

  async write(uri: string, bytes: Buffer): Promise<void> {
    const path = this.toPath(uri);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
  }

  async list(prefix: string): Promise<string[]> {
    const path = this.toPath(prefix);
    try {
      const entries = await readdir(path, { withFileTypes: true });
      return entries
        .filter((e) => e.isFile())
        .map((e) => pathToFileURL(join(path, e.name)).toString());
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT' || code === 'ENOTDIR') return [];
      throw err;
    }
  }

  async delete(uri: string): Promise<void> {
    await rm(this.toPath(uri), { force: true });
  }

  async exists(uri: string): Promise<boolean> {
    try {
      await stat(this.toPath(uri));
      return true;
    } catch {
      return false;
    }
  }

  async getPublicUrl(uri: string): Promise<string> {
    void uri;
    throw new NotImplementedError(
      this.scheme,
      'getPublicUrl',
      'Local filesystem cannot expose public URLs. Upload to a cloud storage provider first.',
    );
  }

  async getSignedUrl(uri: string, ttlSeconds: number): Promise<string> {
    void uri;
    void ttlSeconds;
    throw new NotImplementedError(
      this.scheme,
      'getSignedUrl',
      'Local filesystem does not support signed URLs.',
    );
  }

  /**
   * Convert a URI or bare path to a local filesystem path.
   *
   * - `file:///abs/path` → absolute path (platform-appropriate)
   * - `./relative/path` → as-is
   * - `D:\foo\bar` → as-is
   */
  private toPath(uri: string): string {
    if (uri.startsWith('file://')) return fileURLToPath(uri);
    return uri;
  }
}

import { NotImplementedError, type StorageProvider } from '../types.js';

/**
 * Read-only storage provider for HTTPS URLs.
 *
 * Useful for downloading remote assets into the pipeline. Write, list, delete,
 * and signed URLs are not supported — there's no generic HTTP PUT target for
 * a MCP. For uploadable HTTPS (e.g., S3 signed PUT URLs), use the native S3
 * provider instead.
 *
 * Also handles `http://` via a second instance registered for that scheme.
 */
export class HttpsProvider implements StorageProvider {
  constructor(readonly scheme: 'https' | 'http' = 'https') {}

  async read(uri: string): Promise<Buffer> {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${uri}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async write(uri: string, bytes: Buffer, mime?: string): Promise<void> {
    void uri;
    void bytes;
    void mime;
    throw new NotImplementedError(
      this.scheme,
      'write',
      'HTTPS is read-only. Use a native cloud storage provider (gs://, s3://) to write.',
    );
  }

  async list(prefix: string): Promise<string[]> {
    void prefix;
    throw new NotImplementedError(this.scheme, 'list');
  }

  async delete(uri: string): Promise<void> {
    void uri;
    throw new NotImplementedError(this.scheme, 'delete');
  }

  async exists(uri: string): Promise<boolean> {
    try {
      const response = await fetch(uri, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getPublicUrl(uri: string): Promise<string> {
    // HTTPS URIs are already public URLs.
    return uri;
  }

  async getSignedUrl(uri: string, ttlSeconds: number): Promise<string> {
    void uri;
    void ttlSeconds;
    throw new NotImplementedError(
      this.scheme,
      'getSignedUrl',
      'HTTPS provider does not generate signed URLs. Use the native cloud provider for the underlying bucket.',
    );
  }
}

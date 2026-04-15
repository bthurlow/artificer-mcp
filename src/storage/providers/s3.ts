import { NotImplementedError, type StorageProvider } from '../types.js';

/**
 * Stub provider for AWS S3 — all methods throw NotImplementedError.
 *
 * Exists so `s3://bucket/key` URIs route somewhere meaningful (a
 * structured error with a contribution link) instead of the generic
 * "no provider registered" error.
 *
 * To implement: add `@aws-sdk/client-s3` as a dependency, flesh out the
 * methods below, and register this provider with a configured client.
 * Pattern parallels GCSProvider exactly.
 *
 * Contributions welcome — see https://github.com/bthurlow/artificer-mcp
 */
export class S3Provider implements StorageProvider {
  readonly scheme = 's3';

  async read(uri: string): Promise<Buffer> {
    void uri;
    throw this.err('read');
  }

  async write(uri: string, bytes: Buffer, mime?: string): Promise<void> {
    void uri;
    void bytes;
    void mime;
    throw this.err('write');
  }

  async list(prefix: string): Promise<string[]> {
    void prefix;
    throw this.err('list');
  }

  async delete(uri: string): Promise<void> {
    void uri;
    throw this.err('delete');
  }

  async exists(uri: string): Promise<boolean> {
    void uri;
    throw this.err('exists');
  }

  async getPublicUrl(uri: string): Promise<string> {
    void uri;
    throw this.err('getPublicUrl');
  }

  async getSignedUrl(uri: string, ttlSeconds: number): Promise<string> {
    void uri;
    void ttlSeconds;
    throw this.err('getSignedUrl');
  }

  private err(operation: string): NotImplementedError {
    return new NotImplementedError(
      this.scheme,
      operation,
      `AWS S3 provider is not yet implemented. ` +
        `Contributions welcome: https://github.com/bthurlow/artificer-mcp ` +
        `(see src/storage/providers/gcs.ts for the pattern).`,
    );
  }
}

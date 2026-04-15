import { NotImplementedError, type StorageProvider } from '../types.js';

/**
 * Stub provider for Microsoft OneDrive — all methods throw NotImplementedError.
 *
 * Exists so `onedrive://path` URIs route somewhere meaningful (a
 * structured error with a contribution link) instead of the generic
 * "no provider registered" error.
 *
 * To implement: add a Microsoft Graph SDK dependency, handle OAuth/MSAL
 * auth, and flesh out the methods below. Note that OneDrive's path
 * semantics differ from bucket-style storage — paths are typically
 * relative to a user's drive root or a shared drive ID.
 *
 * Contributions welcome — see https://github.com/bthurlow/artificer-mcp
 */
export class OneDriveProvider implements StorageProvider {
  readonly scheme = 'onedrive';

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
      `OneDrive provider is not yet implemented. ` +
        `Contributions welcome: https://github.com/bthurlow/artificer-mcp ` +
        `(see src/storage/providers/gcs.ts for the pattern).`,
    );
  }
}

import { Storage, type Bucket, type File } from '@google-cloud/storage';
import { NotImplementedError, type StorageProvider } from '../types.js';

/**
 * Storage provider for Google Cloud Storage.
 *
 * URI format: `gs://bucket-name/path/to/key`
 *
 * Authentication follows Google's standard discovery chain:
 * 1. `GOOGLE_APPLICATION_CREDENTIALS` env var (path to service account JSON)
 * 2. Application Default Credentials (gcloud / workload identity)
 * 3. Explicit credentials passed via constructor (for testing)
 *
 * The SDK is lazily instantiated so environments without GCS credentials
 * (or users not using GCS) don't pay the import/auth cost.
 */
export class GCSProvider implements StorageProvider {
  readonly scheme = 'gs';
  private storage: Storage | undefined;

  /**
   * @param storage - Optional pre-configured Storage instance (useful for tests).
   *   If omitted, one is lazily created via Application Default Credentials.
   */
  constructor(storage?: Storage) {
    this.storage = storage;
  }

  private getStorage(): Storage {
    if (!this.storage) {
      this.storage = new Storage();
    }
    return this.storage;
  }

  private getFile(uri: string): File {
    const { bucket, path } = parseGcsUri(uri);
    return this.getStorage().bucket(bucket).file(path);
  }

  private getBucket(uri: string): { bucket: Bucket; prefix: string } {
    const { bucket, path } = parseGcsUri(uri);
    return { bucket: this.getStorage().bucket(bucket), prefix: path };
  }

  async read(uri: string): Promise<Buffer> {
    const [bytes] = await this.getFile(uri).download();
    return bytes;
  }

  async write(uri: string, bytes: Buffer, mime?: string): Promise<void> {
    await this.getFile(uri).save(bytes, {
      contentType: mime,
      resumable: false,
    });
  }

  async list(prefix: string): Promise<string[]> {
    const { bucket, prefix: pathPrefix } = this.getBucket(prefix);
    const [files] = await bucket.getFiles({ prefix: pathPrefix });
    return files.map((f) => `gs://${bucket.name}/${f.name}`);
  }

  async delete(uri: string): Promise<void> {
    try {
      await this.getFile(uri).delete({ ignoreNotFound: true });
    } catch (err) {
      // Some SDK versions ignore ignoreNotFound; swallow 404s explicitly
      const code = (err as { code?: number }).code;
      if (code !== 404) throw err;
    }
  }

  async exists(uri: string): Promise<boolean> {
    const [exists] = await this.getFile(uri).exists();
    return exists;
  }

  async getPublicUrl(uri: string): Promise<string> {
    return this.getFile(uri).publicUrl();
  }

  async getSignedUrl(uri: string, ttlSeconds: number): Promise<string> {
    const [url] = await this.getFile(uri).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + ttlSeconds * 1000,
    });
    return url;
  }
}

/**
 * Parse a `gs://bucket/path/to/key` URI into its components.
 * Throws if the URI isn't a valid GCS URI.
 */
export function parseGcsUri(uri: string): { bucket: string; path: string } {
  if (!uri.startsWith('gs://')) {
    throw new Error(`Not a GCS URI: ${uri}`);
  }
  const rest = uri.slice('gs://'.length);
  const slash = rest.indexOf('/');
  if (slash === -1) {
    // gs://bucket (no path) — rare but valid for list operations
    return { bucket: rest, path: '' };
  }
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  if (!bucket) {
    throw new Error(`GCS URI missing bucket name: ${uri}`);
  }
  return { bucket, path };
}

// Re-export for dependency injection in callers / tests
export { NotImplementedError };

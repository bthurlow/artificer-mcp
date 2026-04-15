/**
 * Storage layer types for artificer-mcp.
 *
 * A `Resource` is any media addressable by a URI. Tools accept resource URIs
 * (local paths, `file://`, `https://`, `gs://`, `s3://`, etc.) and the storage
 * layer routes reads/writes to the appropriate provider based on scheme.
 *
 * Local paths without a scheme are treated as `file://` and resolved by the
 * LocalProvider.
 */

/**
 * A loaded or referenced media resource.
 *
 * `uri` is always present. `bytes` and `mime` are populated when the resource
 * has been read into memory; otherwise consumers should use the registry to
 * fetch bytes on demand via the appropriate provider.
 */
export interface Resource {
  uri: string;
  bytes?: Buffer;
  mime?: string;
}

/**
 * Contract implemented by every storage backend (local filesystem, GCS,
 * S3, OneDrive, etc.). Each provider registers for a single URI scheme
 * via the registry.
 *
 * Providers MAY throw `NotImplementedError` (exported from `../errors.js`
 * once added) for methods that don't apply — e.g., the HTTPS provider is
 * read-only and cannot write, list, or delete.
 */
export interface StorageProvider {
  /** The URI scheme this provider handles (e.g., "file", "gs", "s3", "https"). */
  readonly scheme: string;

  /** Read the full contents of a resource as raw bytes. */
  read(uri: string): Promise<Buffer>;

  /** Write bytes to a resource. Overwrites if it exists. */
  write(uri: string, bytes: Buffer, mime?: string): Promise<void>;

  /** List URIs with the given prefix. */
  list(prefix: string): Promise<string[]>;

  /** Delete a resource. Idempotent — no error if it doesn't exist. */
  delete(uri: string): Promise<void>;

  /** Check whether a resource exists at the given URI. */
  exists(uri: string): Promise<boolean>;

  /**
   * Get a public URL for the resource if the provider supports it.
   *
   * Throws if the provider cannot expose public URLs (e.g., local
   * filesystem, or a private bucket without public access).
   */
  getPublicUrl(uri: string): Promise<string>;

  /**
   * Get a time-limited signed URL for the resource.
   *
   * `ttlSeconds` specifies the validity window. Throws if the provider
   * doesn't support signed URLs.
   */
  getSignedUrl(uri: string, ttlSeconds: number): Promise<string>;
}

/**
 * Error thrown by providers when a requested operation isn't supported.
 * Catchable by consumers who want to fall back to an alternative path.
 */
export class NotImplementedError extends Error {
  constructor(
    public readonly scheme: string,
    public readonly operation: string,
    message?: string,
  ) {
    super(message ?? `Provider "${scheme}" does not implement "${operation}"`);
    this.name = 'NotImplementedError';
  }
}

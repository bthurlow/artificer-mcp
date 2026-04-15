import type { StorageProvider } from '../types.js';
import { LocalProvider } from './local.js';
import { HttpsProvider } from './https.js';
import { GCSProvider } from './gcs.js';
import { S3Provider } from './s3.js';
import { OneDriveProvider } from './onedrive.js';

/**
 * Registry of storage providers, keyed by URI scheme.
 *
 * Adding a new provider = instantiating it here and registering it.
 * Phase 2 adds gs://, and future work can add s3://, onedrive://, etc.
 *
 * Parsing rules:
 * - A URI is `scheme://rest` where `scheme` is alphanumeric+dots/dashes, 2+ chars
 * - Bare paths (no scheme) route to the LocalProvider
 * - Windows drive letters (`C:\foo`) have no `://` and correctly route to local
 */
class ProviderRegistry {
  private providers = new Map<string, StorageProvider>();

  register(provider: StorageProvider): void {
    this.providers.set(provider.scheme.toLowerCase(), provider);
  }

  /**
   * Resolve a URI to the provider that handles its scheme.
   * Bare paths (no scheme) route to the local filesystem provider.
   */
  getProvider(uri: string): StorageProvider {
    const scheme = parseScheme(uri);
    const key = scheme ?? 'file';
    const provider = this.providers.get(key);
    if (!provider) {
      throw new Error(
        `No storage provider registered for scheme "${key}" (uri: ${uri}). ` +
          `Registered schemes: ${[...this.providers.keys()].join(', ')}`,
      );
    }
    return provider;
  }

  /** List of schemes currently registered (for diagnostics). */
  get registeredSchemes(): string[] {
    return [...this.providers.keys()];
  }
}

/**
 * Parse the scheme from a URI string.
 *
 * Returns the lowercased scheme (without `://`) if the URI has one, otherwise `null`.
 * Requires `://` to avoid matching Windows drive letters like `C:\foo`.
 */
export function parseScheme(uri: string): string | null {
  const match = /^([a-z][a-z0-9+\-.]+):\/\//i.exec(uri);
  return match ? match[1].toLowerCase() : null;
}

/** The default global registry, pre-populated with built-in providers. */
export const registry = new ProviderRegistry();
registry.register(new LocalProvider());
registry.register(new HttpsProvider('https'));
registry.register(new HttpsProvider('http'));
registry.register(new GCSProvider());
registry.register(new S3Provider());
registry.register(new OneDriveProvider());

/**
 * Get the storage provider that handles the given URI's scheme.
 * Bare paths route to the local filesystem.
 */
export function getProvider(uri: string): StorageProvider {
  return registry.getProvider(uri);
}

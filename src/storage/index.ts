import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { getProvider } from './providers/registry.js';
import { guessMime } from '../utils/resource.js';
import {
  type StorageUploadParams,
  type StorageDownloadParams,
  type StorageListParams,
  type StorageDeleteParams,
  type StorageExistsParams,
  type StorageGetPublicUrlParams,
  type StorageGetSignedUrlParams,
  storageUploadSchema,
  storageDownloadSchema,
  storageListSchema,
  storageDeleteSchema,
  storageExistsSchema,
  storageGetPublicUrlSchema,
  storageGetSignedUrlSchema,
} from './tool-types.js';

/**
 * Copy bytes from any source URI to any destination URI via the registered
 * storage providers. Used by both `storage_upload` and `storage_download`
 * (semantic naming sugar for the same operation).
 */
async function copyResource(source: string, destination: string, mime?: string): Promise<number> {
  const srcProvider = getProvider(source);
  const bytes = await srcProvider.read(source);
  const dstProvider = getProvider(destination);
  await dstProvider.write(destination, bytes, mime ?? guessMime(destination));
  return bytes.byteLength;
}

/**
 * Register the storage MCP tools with the server.
 *
 * Covers:
 * - storage_upload, storage_download (copy bytes between URIs)
 * - storage_list, storage_delete, storage_exists (inspect + manage)
 * - storage_get_public_url, storage_get_signed_url (share access)
 */
export function registerStorageTools(server: McpServer): void {
  // ── storage_upload ──────────────────────────────────────────────────────
  registerTool<StorageUploadParams>(
    server,
    'storage_upload',
    'Copy bytes from a source to a destination URI. Works with any registered scheme (file://, gs://, https://, bare local paths). Typical use: upload a local/generated file to cloud storage.',
    storageUploadSchema.shape,
    async ({ source, destination, mime_type }) => {
      const size = await copyResource(source, destination, mime_type);
      return {
        content: [{ type: 'text', text: `Uploaded ${size} bytes: ${source} → ${destination}` }],
      };
    },
  );

  // ── storage_download ────────────────────────────────────────────────────
  registerTool<StorageDownloadParams>(
    server,
    'storage_download',
    'Copy bytes from a source URI to a destination URI (typically local). Use this to fetch cloud assets for local processing.',
    storageDownloadSchema.shape,
    async ({ source, destination }) => {
      const size = await copyResource(source, destination);
      return {
        content: [{ type: 'text', text: `Downloaded ${size} bytes: ${source} → ${destination}` }],
      };
    },
  );

  // ── storage_list ────────────────────────────────────────────────────────
  registerTool<StorageListParams>(
    server,
    'storage_list',
    'List files at a given URI prefix. For bare paths and file://, lists a directory. For gs:// etc., lists files with that prefix.',
    storageListSchema.shape,
    async ({ prefix }) => {
      const provider = getProvider(prefix);
      const uris = await provider.list(prefix);
      return {
        content: [
          {
            type: 'text',
            text:
              uris.length === 0
                ? `No files found under: ${prefix}`
                : `Found ${uris.length} file(s):\n${uris.join('\n')}`,
          },
        ],
      };
    },
  );

  // ── storage_delete ──────────────────────────────────────────────────────
  registerTool<StorageDeleteParams>(
    server,
    'storage_delete',
    'Delete a resource at the given URI. Idempotent — does not error if the resource does not exist.',
    storageDeleteSchema.shape,
    async ({ uri }) => {
      const provider = getProvider(uri);
      await provider.delete(uri);
      return { content: [{ type: 'text', text: `Deleted: ${uri}` }] };
    },
  );

  // ── storage_exists ──────────────────────────────────────────────────────
  registerTool<StorageExistsParams>(
    server,
    'storage_exists',
    'Check whether a resource exists at the given URI. Returns "yes" or "no".',
    storageExistsSchema.shape,
    async ({ uri }) => {
      const provider = getProvider(uri);
      const exists = await provider.exists(uri);
      return {
        content: [
          { type: 'text', text: exists ? `yes: ${uri} exists` : `no: ${uri} does not exist` },
        ],
      };
    },
  );

  // ── storage_get_public_url ──────────────────────────────────────────────
  registerTool<StorageGetPublicUrlParams>(
    server,
    'storage_get_public_url',
    'Get a public URL for a resource. Works for https:// (returns unchanged) and for cloud providers where the resource is publicly readable. Throws for providers that cannot expose public URLs (e.g., local filesystem).',
    storageGetPublicUrlSchema.shape,
    async ({ uri }) => {
      const provider = getProvider(uri);
      const url = await provider.getPublicUrl(uri);
      return { content: [{ type: 'text', text: url }] };
    },
  );

  // ── storage_get_signed_url ──────────────────────────────────────────────
  registerTool<StorageGetSignedUrlParams>(
    server,
    'storage_get_signed_url',
    'Generate a time-limited signed URL for a resource. Useful for sharing private cloud assets temporarily. Throws for providers that do not support signed URLs.',
    storageGetSignedUrlSchema.shape,
    async ({ uri, ttl_seconds }) => {
      const provider = getProvider(uri);
      const url = await provider.getSignedUrl(uri, ttl_seconds);
      return {
        content: [{ type: 'text', text: `Signed URL (valid for ${ttl_seconds}s): ${url}` }],
      };
    },
  );
}

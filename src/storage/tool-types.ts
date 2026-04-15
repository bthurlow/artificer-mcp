import { z } from 'zod';

/** Parameters for the storage_upload tool */
export interface StorageUploadParams {
  source: string;
  destination: string;
  mime_type?: string;
}

export const storageUploadSchema = z.object({
  source: z
    .string()
    .describe('Source URI or path (file://, gs://, https://, or a bare local path)'),
  destination: z
    .string()
    .describe(
      'Destination URI (must support write — e.g., gs://bucket/key, file:///abs/path, or a bare local path)',
    ),
  mime_type: z
    .string()
    .optional()
    .describe(
      'Content-Type for cloud destinations (inferred from the destination extension if omitted)',
    ),
});

/** Parameters for the storage_download tool */
export interface StorageDownloadParams {
  source: string;
  destination: string;
}

export const storageDownloadSchema = z.object({
  source: z.string().describe('Source URI (file://, gs://, https://, or a bare local path)'),
  destination: z
    .string()
    .describe('Destination URI (must support write — typically a local path or file:// URI)'),
});

/** Parameters for the storage_list tool */
export interface StorageListParams {
  prefix: string;
}

export const storageListSchema = z.object({
  prefix: z
    .string()
    .describe(
      'URI or path prefix to list. For bare paths and file://, lists a directory. For gs:// etc., lists files with that prefix.',
    ),
});

/** Parameters for the storage_delete tool */
export interface StorageDeleteParams {
  uri: string;
}

export const storageDeleteSchema = z.object({
  uri: z.string().describe('URI or path to delete. Idempotent — no error if it does not exist.'),
});

/** Parameters for the storage_exists tool */
export interface StorageExistsParams {
  uri: string;
}

export const storageExistsSchema = z.object({
  uri: z.string().describe('URI or path to check for existence.'),
});

/** Parameters for the storage_get_public_url tool */
export interface StorageGetPublicUrlParams {
  uri: string;
}

export const storageGetPublicUrlSchema = z.object({
  uri: z
    .string()
    .describe(
      'URI to get a public URL for. Works for https:// (returns unchanged) and for cloud providers where the resource is publicly readable. Throws for providers that cannot expose public URLs.',
    ),
});

/** Parameters for the storage_get_signed_url tool */
export interface StorageGetSignedUrlParams {
  uri: string;
  ttl_seconds: number;
}

export const storageGetSignedUrlSchema = z.object({
  uri: z.string().describe('URI to generate a signed URL for.'),
  ttl_seconds: z
    .number()
    .int()
    .positive()
    .default(3600)
    .describe('Validity window in seconds (default 1 hour).'),
});

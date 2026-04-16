# Storage

artificer-mcp includes a pluggable storage layer that lets every tool accept URIs instead of just local paths. Files flow between providers transparently — upload a local file to GCS, download an HTTPS asset for processing, list cloud bucket contents, generate signed URLs for sharing.

## URI routing

The storage registry resolves URIs to providers by scheme:

| Scheme | Provider | Status |
|--------|----------|--------|
| Bare path / `file://` | Local filesystem | Implemented |
| `https://` / `http://` | HTTPS (read-only) | Implemented |
| `gs://` | Google Cloud Storage | Implemented |
| `s3://` | AWS S3 | Stubbed (contribution welcome) |
| `onedrive://` | OneDrive | Stubbed (contribution welcome) |

Bare paths (no scheme) and Windows drive-letter paths (`C:\foo`) automatically route to the local filesystem provider. The scheme parser requires `://` to distinguish from drive letters.

## Tools

### storage_upload

Copy bytes from a source to a destination URI.

| Param | Type | Description |
|-------|------|-------------|
| `source` | string | Source URI or path (`file://`, `gs://`, `https://`, or bare local path) |
| `destination` | string | Destination URI (must support write) |
| `mime_type` | string? | Content-Type for cloud destinations (inferred from extension if omitted) |

```
storage_upload source=./output.png destination=gs://my-bucket/images/output.png
```

### storage_download

Copy bytes from a source URI to a local destination.

| Param | Type | Description |
|-------|------|-------------|
| `source` | string | Source URI |
| `destination` | string | Destination path (typically local) |

### storage_list

List files at a URI prefix.

| Param | Type | Description |
|-------|------|-------------|
| `prefix` | string | Directory path or URI prefix |

For local paths, lists a directory. For `gs://`, lists objects with that prefix.

### storage_delete

Delete a resource at the given URI. Idempotent (no error if the resource doesn't exist).

| Param | Type | Description |
|-------|------|-------------|
| `uri` | string | URI or path to delete |

### storage_exists

Check whether a resource exists.

| Param | Type | Description |
|-------|------|-------------|
| `uri` | string | URI or path to check |

Returns "yes" or "no".

### storage_get_public_url

Get a permanent public URL for a resource.

| Param | Type | Description |
|-------|------|-------------|
| `uri` | string | URI to get a public URL for |

Works for `https://` (returns unchanged) and cloud providers with public-read resources. Throws for local filesystem.

### storage_get_signed_url

Generate a time-limited signed URL for sharing private resources.

| Param | Type | Description |
|-------|------|-------------|
| `uri` | string | URI to sign |
| `ttl_seconds` | number | Validity window in seconds (default 3600) |

## Extending with new providers

1. Create a class implementing the `StorageProvider` interface in `src/storage/providers/`:

```typescript
export interface StorageProvider {
  readonly scheme: string;
  read(uri: string): Promise<Buffer>;
  write(uri: string, data: Buffer, mimeType?: string): Promise<void>;
  delete(uri: string): Promise<void>;
  exists(uri: string): Promise<boolean>;
  list(prefix: string): Promise<string[]>;
  getPublicUrl(uri: string): Promise<string>;
  getSignedUrl(uri: string, ttlSeconds: number): Promise<string>;
}
```

2. Register it in `src/storage/providers/registry.ts`:

```typescript
import { MyProvider } from './my-provider.js';
registry.register(new MyProvider());
```

All 7 storage tools automatically support the new scheme — no tool changes needed.

## GCS setup

The GCS provider uses Application Default Credentials. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to a service account JSON file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

Or run on a GCE/Cloud Run instance with a service account attached.

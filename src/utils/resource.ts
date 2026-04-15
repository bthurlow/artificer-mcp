import { writeFile, readFile, rm } from 'node:fs/promises';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getProvider, parseScheme } from '../storage/providers/registry.js';
import { tempPath } from './exec.js';

/**
 * Resolved input handle — a local filesystem path ImageMagick/FFmpeg can read,
 * plus an optional cleanup function when the path is a temporary download.
 *
 * Callers should invoke `cleanup()` in a finally block when set.
 */
export interface ResolvedInput {
  /** Local filesystem path ready for CLI tools. */
  localPath: string;
  /** Cleanup function to remove any temp files. Undefined for non-downloaded resources. */
  cleanup?: () => Promise<void>;
}

/**
 * Resolved output handle — a local filesystem path to write to, plus a
 * `commit()` that uploads to the destination URI if needed.
 *
 * For local paths, `commit()` is a no-op. For cloud URIs, `commit()` reads
 * the local file and writes it via the matching storage provider, then
 * removes the temp file.
 *
 * Tools MUST call `commit()` after writing the local file.
 */
export interface ResolvedOutput {
  /** Local filesystem path to write output to. */
  localPath: string;
  /** Upload the local file to its destination URI (no-op for local paths). */
  commit: () => Promise<void>;
}

/**
 * Resolve a location (path or URI) to a local filesystem path that CLI tools
 * can read. Downloads remote URIs into a temp file; passes local paths through.
 *
 * ## Example
 * ```ts
 * const input = await resolveInput('gs://bucket/hero.jpg');
 * try {
 *   await magick([input.localPath, '-resize', '800x', '/tmp/out.jpg']);
 * } finally {
 *   await input.cleanup?.();
 * }
 * ```
 */
export async function resolveInput(location: string): Promise<ResolvedInput> {
  const scheme = parseScheme(location);

  // Bare paths and file:// URIs need no download
  if (scheme === null || scheme === 'file') {
    const localPath = scheme === 'file' ? fileURLToPath(location) : location;
    return { localPath };
  }

  // Remote URI — download to temp file
  const provider = getProvider(location);
  const bytes = await provider.read(location);
  const ext = extname(location) || '.bin';
  const localPath = tempPath(ext);
  await writeFile(localPath, bytes);

  return {
    localPath,
    cleanup: async () => {
      await rm(localPath, { force: true });
    },
  };
}

/**
 * Resolve an output location (path or URI) to a local filesystem path for
 * writing, plus a commit function that uploads the result if the destination
 * is a remote URI.
 *
 * ## Example
 * ```ts
 * const output = await resolveOutput('gs://bucket/out.jpg');
 * await magick(['/tmp/in.jpg', '-resize', '800x', output.localPath]);
 * await output.commit();
 * ```
 */
export async function resolveOutput(location: string): Promise<ResolvedOutput> {
  const scheme = parseScheme(location);

  // Bare paths and file:// URIs — write directly, no commit needed
  if (scheme === null || scheme === 'file') {
    const localPath = scheme === 'file' ? fileURLToPath(location) : location;
    return {
      localPath,
      commit: async () => {
        /* no-op */
      },
    };
  }

  // Remote URI — write to temp, upload on commit
  const provider = getProvider(location);
  const ext = extname(location) || '.bin';
  const localPath = tempPath(ext);

  return {
    localPath,
    commit: async () => {
      const bytes = await readFile(localPath);
      await provider.write(location, bytes, guessMime(location));
      await rm(localPath, { force: true });
    },
  };
}

/**
 * Best-effort MIME type guess from file extension.
 * Returns undefined if the extension isn't recognized — providers MAY infer
 * from bytes themselves.
 */
export function guessMime(location: string): string | undefined {
  const ext = extname(location).slice(1).toLowerCase();
  const MIME: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    pdf: 'application/pdf',
  };
  return MIME[ext];
}

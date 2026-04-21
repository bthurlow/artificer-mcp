import { writeFile, readFile, rm } from 'node:fs/promises';
import { extname, parse, join } from 'node:path';
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
 * Tools MUST call `commit()` after writing the local file, and
 * `cleanup?.()` in a finally block to remove temps on error paths.
 */
export interface ResolvedOutput {
  /** Local filesystem path to write output to. */
  localPath: string;
  /** Upload the local file to its destination URI (no-op for local paths). */
  commit: () => Promise<void>;
  /** Remove the temp file on error paths. Undefined for local outputs. Idempotent with commit(). */
  cleanup?: () => Promise<void>;
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
    cleanup: async () => {
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

/**
 * Extract the base filename (without directory) from a URI or local path.
 * Works for gs://, s3://, file://, http(s)://, and bare local paths.
 */
export function uriBasename(uri: string): string {
  const scheme = parseScheme(uri);
  if (scheme !== null && scheme !== 'file') {
    const rest = uri.slice(`${scheme}://`.length);
    const slash = rest.lastIndexOf('/');
    return slash === -1 ? rest : rest.slice(slash + 1);
  }
  const path = scheme === 'file' ? fileURLToPath(uri) : uri;
  return parse(path).base;
}

/**
 * Extract the base filename without extension from a URI or local path.
 */
export function uriStem(uri: string): string {
  const base = uriBasename(uri);
  const dot = base.lastIndexOf('.');
  return dot === -1 ? base : base.slice(0, dot);
}

/**
 * Join a URI or local path prefix with a filename, producing a valid URI
 * or path. Works for `gs://`, `s3://`, `file://`, `http(s)://`, and bare
 * local paths. Avoids `path.join`'s URI corruption on Windows (which turns
 * `gs://` into `gs:\`).
 *
 * ## Examples
 * - `joinUri('gs://b/path/', 'x.png')` → `gs://b/path/x.png`
 * - `joinUri('gs://b/path', 'x.png')` → `gs://b/path/x.png`
 * - `joinUri('/tmp', 'x.png')` → `/tmp/x.png` (POSIX) / `\tmp\x.png` (Windows)
 */
export function joinUri(prefix: string, filename: string): string {
  const scheme = parseScheme(prefix);
  if (scheme !== null && scheme !== 'file') {
    return prefix.endsWith('/') ? `${prefix}${filename}` : `${prefix}/${filename}`;
  }
  return join(prefix, filename);
}

/**
 * Derive an output URI from an input URI, preserving the scheme, bucket, and
 * parent "directory" portion. Appends a suffix to the filename and optionally
 * swaps the extension to a new format.
 *
 * Handles `gs://`, `s3://`, `file://`, and bare local paths.
 *
 * ## Examples
 * - `deriveOutputUri('gs://b/path/hero.jpg', { suffix: '_resized' })`
 *   → `gs://b/path/hero_resized.jpg`
 * - `deriveOutputUri('/tmp/x.png', { suffix: '_out', format: 'webp' })`
 *   → `/tmp/x_out.webp`
 * - `deriveOutputUri('D:\\a\\b.png', { suffix: '_c' })`
 *   → `D:\a\b_c.png`
 */
export function deriveOutputUri(
  inputUri: string,
  options: { suffix?: string; format?: string },
): string {
  const suffix = options.suffix ?? '_output';
  const scheme = parseScheme(inputUri);

  // Remote URI — split scheme://authority/path and rebuild
  if (scheme !== null && scheme !== 'file') {
    const prefix = `${scheme}://`;
    const rest = inputUri.slice(prefix.length);
    const slash = rest.indexOf('/');
    if (slash === -1) {
      // No path segment — can't derive a suffix'd filename
      throw new Error(
        `Cannot derive output URI from ${inputUri} (no path after authority). ` +
          `Provide an explicit output path.`,
      );
    }
    const authority = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    const lastSlash = path.lastIndexOf('/');
    const dir = lastSlash === -1 ? '' : path.slice(0, lastSlash + 1);
    const filename = lastSlash === -1 ? path : path.slice(lastSlash + 1);
    const dot = filename.lastIndexOf('.');
    const name = dot === -1 ? filename : filename.slice(0, dot);
    const ext = options.format ? `.${options.format}` : dot === -1 ? '' : filename.slice(dot);
    return `${prefix}${authority}/${dir}${name}${suffix}${ext}`;
  }

  // Local path (bare or file://) — use path.parse / join
  const localInput = scheme === 'file' ? fileURLToPath(inputUri) : inputUri;
  const parsed = parse(localInput);
  const ext = options.format ? `.${options.format}` : parsed.ext;
  return join(parsed.dir, `${parsed.name}${suffix}${ext}`);
}

/**
 * Composite helper that resolves an input URI (staging to local temp if
 * remote) and an output URI (either given, or derived from the input with a
 * suffix). Returns local paths for ImageMagick/FFmpeg to use directly, plus
 * a single `finalize()` that commits the output and cleans up the input.
 *
 * ## Example
 * ```ts
 * const io = await resolveIO({ input: 'gs://b/hero.jpg', suffix: '_resized' });
 * try {
 *   await magick([io.inputLocal, '-resize', '800x', io.outputLocal]);
 *   await io.finalize();
 *   return { outputUri: io.outputUri };
 * } catch (err) {
 *   await io.cleanup();
 *   throw err;
 * }
 * ```
 */
export interface ResolvedIO {
  /** Local filesystem path of the (possibly staged) input. */
  inputLocal: string;
  /** Local filesystem path to write output to. */
  outputLocal: string;
  /** The final output URI (scheme-preserving). */
  outputUri: string;
  /** Commit the output to its destination and clean up input temp (if any). */
  finalize: () => Promise<void>;
  /** Clean up input/output temps without committing (for error paths). */
  cleanup: () => Promise<void>;
}

export async function resolveIO(opts: {
  input: string;
  output?: string;
  suffix?: string;
  format?: string;
}): Promise<ResolvedIO> {
  const outputUri = opts.output ?? deriveOutputUri(opts.input, opts);
  const input = await resolveInput(opts.input);
  const output = await resolveOutput(outputUri);
  let committed = false;

  return {
    inputLocal: input.localPath,
    outputLocal: output.localPath,
    outputUri,
    finalize: async () => {
      await output.commit();
      committed = true;
      await input.cleanup?.();
    },
    cleanup: async () => {
      if (!committed) {
        // Best-effort: remove any local temp we may have staged for output
        await rm(output.localPath, { force: true }).catch(() => {});
      }
      await input.cleanup?.();
    },
  };
}

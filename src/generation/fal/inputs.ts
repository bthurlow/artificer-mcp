import { readFile } from 'node:fs/promises';
import { resolveInput, guessMime } from '../../utils/resource.js';

/**
 * Resolve an input location into a URL fal can fetch.
 *
 * Public HTTP(S) URLs pass straight through — Q2 bake-off confirmed
 * fal's runners fetch `storage.googleapis.com/...` objects (and the
 * equivalent CDN shapes) without re-upload. For anything else (gs://,
 * s3://, bare local paths) we stage the bytes locally, wrap them in a
 * Blob, and upload to fal's object store.
 *
 * Shared by `fal_generate_video`, `fal_generate_speech`, and
 * `fal_generate_music` transports — all of which accept input media
 * URLs with the same resolution rules.
 *
 * Returns `{ url, cleanup }`. The cleanup removes any temp download
 * from the resolveInput step. Safe to call `cleanup()` unconditionally
 * (it's a no-op when no temp was created).
 */
export async function resolveForFal(
  input: string,
  upload: (blob: Blob) => Promise<string>,
): Promise<{ url: string; cleanup: () => Promise<void> }> {
  if (isPublicHttpsUrl(input)) {
    return { url: input, cleanup: async () => {} };
  }
  const resolved = await resolveInput(input);
  const bytes = await readFile(resolved.localPath);
  const mime = guessMime(input) ?? 'application/octet-stream';
  const blob = new Blob([bytes], { type: mime });
  const url = await upload(blob);
  return {
    url,
    cleanup: async () => {
      await resolved.cleanup?.();
    },
  };
}

/** True when the string starts with `http://` or `https://`. */
export function isPublicHttpsUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

/**
 * Resolve every value in an `extra_files` map through `resolveForFal`.
 *
 * The `extra_files` convention lets callers mark which `extra_params`
 * keys carry file inputs (local paths, gs:// / s3:// / file:// URIs) that
 * need to be uploaded to fal storage before the API call. Values may be a
 * single string or an array of strings (for models that take multiple
 * references).
 *
 * Returns the same key shape with each value replaced by an HTTPS URL fal
 * can fetch, plus a single cleanup that runs every per-input cleanup.
 */
export async function resolveExtraFiles(
  extra_files: Record<string, string | string[]> | undefined,
  upload: (blob: Blob) => Promise<string>,
): Promise<{
  resolved: Record<string, string | string[]>;
  cleanup: () => Promise<void>;
}> {
  if (!extra_files) {
    return { resolved: {}, cleanup: async () => {} };
  }
  const resolvedEntries: Array<[string, string | string[]]> = [];
  const cleanups: Array<() => Promise<void>> = [];
  for (const [key, value] of Object.entries(extra_files)) {
    if (Array.isArray(value)) {
      const urls: string[] = [];
      for (const v of value) {
        const r = await resolveForFal(v, upload);
        urls.push(r.url);
        cleanups.push(r.cleanup);
      }
      resolvedEntries.push([key, urls]);
    } else {
      const r = await resolveForFal(value, upload);
      resolvedEntries.push([key, r.url]);
      cleanups.push(r.cleanup);
    }
  }
  return {
    resolved: Object.fromEntries(resolvedEntries),
    cleanup: async () => {
      for (const c of cleanups) await c();
    },
  };
}

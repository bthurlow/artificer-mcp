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

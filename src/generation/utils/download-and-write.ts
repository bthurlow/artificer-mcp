import { getProvider } from '../../storage/providers/registry.js';

export interface DownloadAndWriteOptions {
  /**
   * Extra headers to attach to the fetch request. Used by Veo to pass
   * `x-goog-api-key` when downloading from `generativelanguage.googleapis.com`
   * (the Gemini Files API).
   */
  headers?: Record<string, string>;
  /**
   * MIME type to fall back to when the response has no `Content-Type`
   * header. Matches what we hand to `StorageProvider.write` alongside
   * the bytes.
   */
  defaultMime?: string;
}

/**
 * Auth headers required to download a Google-hosted media URI.
 *
 * Google's Files API (`generativelanguage.googleapis.com`) serves
 * generated media behind the API key — an unauthenticated GET returns
 * **403**, not a redirect or an error body, so the failure looks like a
 * broken URL rather than a missing credential.
 *
 * This lives here, shared, because it is a property of *where the bytes
 * are* rather than of any one tool. It was originally inlined in the Veo
 * transport; `gemini_omni_generate_video` then shipped without it and
 * 403'd on every download. Any future Google-backed transport gets it by
 * calling this instead of remembering the rule.
 *
 * Returns `undefined` for non-Google hosts (fal CDN, GCS signed URLs)
 * where an API key is unnecessary and, on a signed URL, potentially
 * harmful.
 */
export function geminiDownloadHeaders(uri: string): Record<string, string> | undefined {
  if (!uri.includes('generativelanguage.googleapis.com')) return undefined;
  const key = process.env['GOOGLE_API_KEY'];
  if (!key) return undefined;
  return { 'x-goog-api-key': key };
}

/**
 * Download `url` and write the bytes to `output` via the registered
 * storage provider for the output URI's scheme.
 *
 * Shared between the Veo (`gemini_generate_video`) and fal
 * (`fal_generate_video`) transports — both get back a signed/public
 * URL from the provider and need the same "fetch + persist + pick MIME"
 * glue.
 *
 * Rejects `text/html` responses outright. Fal has surfaced HTML error
 * pages on its CDN when authorization or quota fails, and silently
 * writing that to `output.mp4` produces a broken file the caller won't
 * notice until playback. Failing loudly here turns it into an obvious
 * error at the tool boundary.
 *
 * NOTE: The StorageProvider.write contract takes a Buffer, so we fully
 * buffer the response in memory before handing it off. True streaming
 * would require extending the provider interface (writeStream) — out
 * of scope for Phase 1.
 */
export async function downloadAndWrite(
  url: string,
  output: string,
  options: DownloadAndWriteOptions = {},
): Promise<{ mime: string; bytes: number }> {
  const { headers, defaultMime = 'video/mp4' } = options;

  const response = await fetch(url, headers ? { headers } : undefined);
  if (!response.ok) {
    // A bare 403 from a Google media host almost always means the request
    // went out without `x-goog-api-key`, which reads as a dead URL rather
    // than a missing credential. Say so — this exact failure cost a live
    // debugging round on gemini_omni_generate_video.
    const looksLikeMissingAuth =
      response.status === 403 &&
      url.includes('generativelanguage.googleapis.com') &&
      !headers?.['x-goog-api-key'];
    const hint = looksLikeMissingAuth
      ? ' — this URL is on the Gemini Files API, which requires the `x-goog-api-key` header. ' +
        'The request was sent without it. Pass `geminiDownloadHeaders(uri)` as `headers`, ' +
        'and check GOOGLE_API_KEY is set.'
      : '';
    throw new Error(
      `Failed to download from ${url}: ${response.status} ${response.statusText}${hint}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  const mimeBase = contentType.split(';', 1)[0]?.trim() ?? '';

  if (mimeBase.toLowerCase().startsWith('text/html')) {
    throw new Error(
      `Refusing to write HTML content to ${output} — upstream returned ` +
        `text/html from ${url}. This usually means the URL is an error ` +
        `page (auth failure, rate limit, expired signed URL) rather than ` +
        `the expected media file.`,
    );
  }

  const mime = mimeBase.length > 0 ? mimeBase : defaultMime;
  const buffer = Buffer.from(await response.arrayBuffer());
  await getProvider(output).write(output, buffer, mime);

  return { mime, bytes: buffer.byteLength };
}

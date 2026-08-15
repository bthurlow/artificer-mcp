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
    throw new Error(`Failed to download from ${url}: ${response.status} ${response.statusText}`);
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

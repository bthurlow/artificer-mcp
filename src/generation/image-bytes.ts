/**
 * Byte-level image helpers: identify a format from its magic bytes, and
 * read pixel dimensions from PNG / JPEG headers.
 *
 * Why not trust the extension or the API's MIME type: nano-banana returns
 * JPEG bytes for a `.png` request, and the extension then lies to every
 * downstream tool (TODO #25). The bytes are the only honest signal.
 */

export interface ImageFormat {
  mime: string;
  /** ImageMagick format prefix for writing this format, e.g. `PNG:`. */
  magick: string;
  /** Canonical file extension, without the dot. */
  ext: string;
}

const PNG: ImageFormat = { mime: 'image/png', magick: 'PNG', ext: 'png' };
const JPEG: ImageFormat = { mime: 'image/jpeg', magick: 'JPEG', ext: 'jpg' };
const WEBP: ImageFormat = { mime: 'image/webp', magick: 'WEBP', ext: 'webp' };
const GIF: ImageFormat = { mime: 'image/gif', magick: 'GIF', ext: 'gif' };

/** Output extensions this tool can honor, by converting when needed. */
const FORMAT_BY_EXT: Record<string, ImageFormat> = {
  png: PNG,
  jpg: JPEG,
  jpeg: JPEG,
  webp: WEBP,
  gif: GIF,
};

/** Format implied by a file extension (with or without the dot), if supported. */
export function formatFromExtension(ext: string): ImageFormat | undefined {
  return FORMAT_BY_EXT[ext.replace(/^\./, '').toLowerCase()];
}

/** Identify an image format from its leading bytes. */
export function sniffImageFormat(bytes: Uint8Array): ImageFormat | undefined {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return PNG;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return JPEG;
  if (b.length >= 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') {
    return WEBP;
  }
  if (b.length >= 6 && (ascii(b, 0, 6) === 'GIF87a' || ascii(b, 0, 6) === 'GIF89a')) return GIF;
  return undefined;
}

/** MIME type for image bytes, recognizing HEIC/HEIF as well (reference inputs only). */
export function sniffImageMime(bytes: Uint8Array): string | undefined {
  const known = sniffImageFormat(bytes)?.mime;
  if (known) return known;
  // ISO-BMFF: size(4) 'ftyp' brand(4)
  if (bytes.length >= 12 && ascii(bytes, 4, 8) === 'ftyp') {
    const brand = ascii(bytes, 8, 12);
    if (['heic', 'heix', 'heim', 'heis'].includes(brand)) return 'image/heic';
    if (['mif1', 'msf1', 'heif'].includes(brand)) return 'image/heif';
  }
  return undefined;
}

/**
 * Pixel dimensions from a PNG IHDR or a JPEG SOF segment.
 * Returns undefined for other formats or malformed headers.
 */
export function imageDimensions(bytes: Uint8Array): { width: number; height: number } | undefined {
  const format = sniffImageFormat(bytes);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (format === PNG && bytes.length >= 24) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (format === JPEG) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) return undefined;
      const marker = bytes[i + 1];
      // Standalone markers carry no length.
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      const length = view.getUint16(i + 2);
      // SOF0-SOF15, except DHT (C4), JPG (C8) and DAC (CC).
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return { height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
      }
      i += 2 + length;
    }
  }
  return undefined;
}

function ascii(b: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...b.subarray(start, end));
}

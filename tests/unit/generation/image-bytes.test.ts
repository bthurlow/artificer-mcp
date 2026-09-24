import { describe, it, expect } from 'vitest';
import {
  formatFromExtension,
  imageDimensions,
  sniffImageFormat,
  sniffImageMime,
} from '../../../src/generation/image-bytes.js';

/** Minimal PNG: signature + IHDR carrying width/height. */
function pngHeader(width: number, height: number): Uint8Array {
  const b = new Uint8Array(33);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  const v = new DataView(b.buffer);
  v.setUint32(8, 13);
  b.set([0x49, 0x48, 0x44, 0x52], 12); // "IHDR"
  v.setUint32(16, width);
  v.setUint32(20, height);
  return b;
}

/** Minimal JPEG: SOI, an APP0 segment to skip, then SOF0 with height/width. */
function jpegHeader(width: number, height: number): Uint8Array {
  const app0 = [0xff, 0xe0, 0x00, 0x10, ...new Array(14).fill(0)];
  const sof0 = [0xff, 0xc0, 0x00, 0x11, 0x08, height >> 8, height & 0xff, width >> 8, width & 0xff, 0x03];
  return new Uint8Array([0xff, 0xd8, ...app0, ...sof0, ...new Array(9).fill(0)]);
}

const ascii = (s: string): number[] => [...s].map((c) => c.charCodeAt(0));

describe('sniffImageFormat', () => {
  it('identifies PNG, JPEG, WebP and GIF from magic bytes', () => {
    expect(sniffImageFormat(pngHeader(1, 1))?.mime).toBe('image/png');
    expect(sniffImageFormat(jpegHeader(1, 1))?.mime).toBe('image/jpeg');
    expect(
      sniffImageFormat(new Uint8Array([...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')]))?.mime,
    ).toBe('image/webp');
    expect(sniffImageFormat(new Uint8Array(ascii('GIF89a')))?.mime).toBe('image/gif');
  });

  it('returns undefined for unknown or truncated bytes', () => {
    expect(sniffImageFormat(new Uint8Array(ascii('not an image')))).toBeUndefined();
    expect(sniffImageFormat(new Uint8Array([0xff, 0xd8]))).toBeUndefined();
  });
});

describe('sniffImageMime', () => {
  it('also recognizes HEIC and HEIF brands', () => {
    const box = (brand: string): Uint8Array =>
      new Uint8Array([0, 0, 0, 0x18, ...ascii('ftyp'), ...ascii(brand)]);
    expect(sniffImageMime(box('heic'))).toBe('image/heic');
    expect(sniffImageMime(box('mif1'))).toBe('image/heif');
    expect(sniffImageMime(box('isom'))).toBeUndefined();
  });
});

describe('formatFromExtension', () => {
  it('maps extensions with or without the dot, case-insensitively', () => {
    expect(formatFromExtension('.PNG')?.magick).toBe('PNG');
    expect(formatFromExtension('jpeg')).toBe(formatFromExtension('jpg'));
    expect(formatFromExtension('tiff')).toBeUndefined();
    expect(formatFromExtension('')).toBeUndefined();
  });
});

describe('imageDimensions', () => {
  it('reads PNG dimensions from IHDR', () => {
    expect(imageDimensions(pngHeader(896, 1200))).toEqual({ width: 896, height: 1200 });
  });

  it('reads JPEG dimensions from SOF0 after skipping other segments', () => {
    expect(imageDimensions(jpegHeader(1792, 2400))).toEqual({ width: 1792, height: 2400 });
  });

  it('returns undefined for formats it does not parse', () => {
    expect(imageDimensions(new Uint8Array(ascii('GIF89a')))).toBeUndefined();
  });
});

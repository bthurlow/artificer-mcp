import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  loadBrandSpec,
  resetBrandSpecCache,
  resolveColor,
  resolveFont,
  resolveLogoSource,
  resolveWatermark,
  stageFontForMagick,
} from '../../../src/brand.js';

const ENV_KEY = 'ARTIFICER_BRAND_SPEC';

function setSpec(value: object | string | undefined): void {
  if (value === undefined) {
    delete process.env[ENV_KEY];
  } else {
    process.env[ENV_KEY] = typeof value === 'string' ? value : JSON.stringify(value);
  }
  resetBrandSpecCache();
}

describe('brand spec', () => {
  beforeEach(() => {
    setSpec(undefined);
  });

  afterEach(() => {
    setSpec(undefined);
  });

  describe('loadBrandSpec', () => {
    it('returns null when env var is unset', () => {
      expect(loadBrandSpec()).toBeNull();
    });

    it('returns null for empty / whitespace-only env var', () => {
      setSpec('   ');
      expect(loadBrandSpec()).toBeNull();
    });

    it('parses a valid spec and caches the result', () => {
      setSpec({ name: 'Acme', colors: { primary: '#ff0000' } });
      const first = loadBrandSpec();
      expect(first?.name).toBe('Acme');
      expect(first?.colors?.primary).toBe('#ff0000');
      // Mutating the env after the first read should not leak — cache wins.
      process.env[ENV_KEY] = JSON.stringify({ name: 'Beta' });
      expect(loadBrandSpec()?.name).toBe('Acme');
    });

    it('throws a descriptive error on malformed JSON and caches the error', () => {
      setSpec('{not json');
      expect(() => loadBrandSpec()).toThrow(/not valid JSON/);
      // Second call also throws from cache without re-parsing.
      expect(() => loadBrandSpec()).toThrow(/not valid JSON/);
    });

    it('throws a schema error for invalid shape', () => {
      setSpec({ colors: { primary: 123 as unknown as string } });
      expect(() => loadBrandSpec()).toThrow(/schema validation/);
    });
  });

  describe('resolveColor', () => {
    it('returns explicit when provided', () => {
      setSpec({ colors: { primary: '#111111' } });
      expect(resolveColor('#abcdef')).toBe('#abcdef');
    });

    it('falls back to brand primary when explicit is undefined', () => {
      setSpec({ colors: { primary: '#222222', secondary: '#333333' } });
      expect(resolveColor(undefined)).toBe('#222222');
      expect(resolveColor(undefined, 'secondary')).toBe('#333333');
    });

    it('returns undefined when neither explicit nor brand provides a value', () => {
      expect(resolveColor(undefined)).toBeUndefined();
      setSpec({ name: 'Acme' });
      expect(resolveColor(undefined)).toBeUndefined();
    });

    it('treats empty string as "not provided"', () => {
      setSpec({ colors: { primary: '#444444' } });
      expect(resolveColor('')).toBe('#444444');
    });
  });

  describe('resolveFont', () => {
    it('returns explicit value first', () => {
      setSpec({ fonts: { regular: '/spec/font.ttf' } });
      expect(resolveFont('/explicit/font.ttf')).toBe('/explicit/font.ttf');
    });

    it('falls back to brand font by weight', () => {
      setSpec({
        fonts: {
          regular: '/r.ttf',
          medium: '/m.ttf',
          semibold: '/sb.ttf',
          bold: '/b.ttf',
        },
      });
      expect(resolveFont(undefined, 'regular')).toBe('/r.ttf');
      expect(resolveFont(undefined, 'medium')).toBe('/m.ttf');
      expect(resolveFont(undefined, 'semibold')).toBe('/sb.ttf');
      expect(resolveFont(undefined, 'bold')).toBe('/b.ttf');
    });

    it('falls back from requested weight to regular', () => {
      setSpec({ fonts: { regular: '/r.ttf' } });
      expect(resolveFont(undefined, 'bold')).toBe('/r.ttf');
    });

    it('returns undefined when no spec and no explicit', () => {
      expect(resolveFont(undefined)).toBeUndefined();
    });
  });

  describe('resolveWatermark', () => {
    it('walks the logo fallback chain', () => {
      setSpec({ logo: { icon: '/icon.svg' } });
      expect(resolveWatermark(undefined)).toBe('/icon.svg');

      setSpec({ logo: { wordmark: '/w.svg', icon: '/icon.svg' } });
      expect(resolveWatermark(undefined)).toBe('/w.svg');

      setSpec({ logo: { watermark: '/wm.png', wordmark: '/w.svg', icon: '/icon.svg' } });
      expect(resolveWatermark(undefined)).toBe('/wm.png');
    });

    it('prefers explicit over the brand chain', () => {
      setSpec({ logo: { watermark: '/wm.png' } });
      expect(resolveWatermark('/explicit.png')).toBe('/explicit.png');
    });

    it('returns undefined when logo is unset', () => {
      expect(resolveWatermark(undefined)).toBeUndefined();
    });
  });

  describe('resolveLogoSource', () => {
    it('prefers full over icon', () => {
      setSpec({ logo: { full: '/full.svg', icon: '/icon.svg' } });
      expect(resolveLogoSource(undefined)).toBe('/full.svg');
    });

    it('falls back to icon when full is absent', () => {
      setSpec({ logo: { icon: '/icon.svg' } });
      expect(resolveLogoSource(undefined)).toBe('/icon.svg');
    });

    it('returns explicit when provided', () => {
      setSpec({ logo: { full: '/full.svg' } });
      expect(resolveLogoSource('/x.svg')).toBe('/x.svg');
    });
  });

  describe('stageFontForMagick', () => {
    it('returns undefined for undefined input', async () => {
      const r = await stageFontForMagick(undefined);
      expect(r.localFont).toBeUndefined();
      expect(r.cleanup).toBeUndefined();
    });

    it('passes through font-family names unchanged (no file resolution)', async () => {
      const r = await stageFontForMagick('DejaVu-Sans');
      expect(r.localFont).toBe('DejaVu-Sans');
      expect(r.cleanup).toBeUndefined();
    });

    it('treats Windows absolute path as a file to resolve', async () => {
      // stageFontForMagick will call resolveInput which for a local path just
      // returns it as-is; the point of this test is exercising the file-path
      // detection branch (pattern `^[A-Za-z]:[\\/]`).
      const r = await stageFontForMagick('C:/Windows/Fonts/arial.ttf');
      expect(r.localFont).toBe('C:/Windows/Fonts/arial.ttf');
      // resolveInput returns a cleanup fn (possibly a no-op) for file: URIs.
      expect(typeof r.cleanup === 'function' || r.cleanup === undefined).toBe(true);
    });
  });
});

// The Cathode Saint brand spec from btmusic — the case that exposed this
// bug on 2026-06-07. A caller wrote 4 colors and 6 fonts, got back 2 and
// 4, with no error explaining where the rest went.
const CATHODE_SAINT = {
  name: 'Cathode Saint',
  colors: {
    primary: '#39FF14',
    primary_name: 'phosphor green',
    secondary: '#D4AF37',
    secondary_name: 'sacred gold',
    background: '#0A0A0A',
    background_name: 'deep black',
    highlight: '#F4ECD8',
    highlight_name: 'bone white',
  },
  fonts: {
    regular: 'Cinzel-Regular.ttf',
    medium: 'Cinzel-Medium.ttf',
    semibold: 'Cinzel-SemiBold.ttf',
    bold: 'Cinzel-Bold.ttf',
    mono: 'IBMPlexMono-Regular.ttf',
    sans: 'IBMPlexSans-Regular.ttf',
  },
};

describe('brand spec — nested schema', () => {
  beforeEach(() => setSpec(undefined));
  afterEach(() => setSpec(undefined));

  describe('multi-mode palettes and multi-family typography survive the round trip', () => {
    it('keeps every color and font slot Cathode Saint declares', () => {
      setSpec(CATHODE_SAINT);
      const spec = loadBrandSpec();

      expect(Object.keys(spec!.colors!).sort()).toEqual(
        Object.keys(CATHODE_SAINT.colors).sort(),
      );
      expect(Object.keys(spec!.fonts!).sort()).toEqual(Object.keys(CATHODE_SAINT.fonts).sort());
    });

    it('resolves the surface colors that used to be dropped', () => {
      setSpec(CATHODE_SAINT);
      expect(resolveColor(undefined, 'background')).toBe('#0A0A0A');
      expect(resolveColor(undefined, 'highlight')).toBe('#F4ECD8');
    });

    it('resolves the extra font families that used to be dropped', () => {
      setSpec(CATHODE_SAINT);
      expect(resolveFont(undefined, 'mono')).toBe('IBMPlexMono-Regular.ttf');
      expect(resolveFont(undefined, 'sans')).toBe('IBMPlexSans-Regular.ttf');
    });

    it('accepts arbitrary named colors under extras', () => {
      setSpec({ colors: { primary: '#39FF14', extras: { crt_glow: '#7CFF6B' } } });
      expect(loadBrandSpec()!.colors!.extras).toEqual({ crt_glow: '#7CFF6B' });
    });
  });

  describe('unknown keys fail loudly instead of vanishing', () => {
    it('rejects an unknown key inside colors', () => {
      setSpec({ colors: { primary: '#fff', backgroundColor: '#000' } });
      expect(() => loadBrandSpec()).toThrow(/backgroundColor/);
    });

    it('names the accepted slots so the caller does not have to guess', () => {
      setSpec({ colors: { backgroundColor: '#000' } });
      expect(() => loadBrandSpec()).toThrow(/accepted here:.*background\b/);
    });

    it('points at extras as the escape hatch', () => {
      setSpec({ fonts: { monospace: 'x.ttf' } });
      expect(() => loadBrandSpec()).toThrow(/fonts\.extras/);
    });

    it('rejects unknown keys in tts, music, and logo too', () => {
      setSpec({ tts: { voice: 'Kore', speed: 1.2 } });
      expect(() => loadBrandSpec()).toThrow(/speed.*accepted here:.*language_code/);

      setSpec({ music: { prompt: 'x' } });
      expect(() => loadBrandSpec()).toThrow(/accepted here: default_prompt/);

      setSpec({ logo: { full: 'a.svg', svg: 'b.svg' } });
      expect(() => loadBrandSpec()).toThrow(/accepted here:.*watermark/);
    });

    it('still reports non-key issues in the plain path: message form', () => {
      setSpec({ name: 42 });
      expect(() => loadBrandSpec()).toThrow(/name: /);
    });
  });

  describe('fallback policy', () => {
    it('falls back from a missing weight to regular — same typeface', () => {
      setSpec({ fonts: { regular: 'Cinzel-Regular.ttf' } });
      expect(resolveFont(undefined, 'bold')).toBe('Cinzel-Regular.ttf');
    });

    it('does NOT fall back from a missing family to regular', () => {
      // Substituting a display serif for mono defeats the reason mono was
      // asked for (column alignment), so returning undefined and letting
      // the consumer choose its own default is the safer answer.
      setSpec({ fonts: { regular: 'Cinzel-Regular.ttf' } });
      expect(resolveFont(undefined, 'mono')).toBeUndefined();
      expect(resolveFont(undefined, 'sans')).toBeUndefined();
      expect(resolveFont(undefined, 'display')).toBeUndefined();
    });

    it('does NOT fall back across color roles', () => {
      // background returning the brand accent would paint a surface in
      // entirely the wrong color.
      setSpec({ colors: { primary: '#39FF14' } });
      expect(resolveColor(undefined, 'background')).toBeUndefined();
      expect(resolveColor(undefined, 'highlight')).toBeUndefined();
    });

    it('still lets an explicit value win for every role and family', () => {
      setSpec(CATHODE_SAINT);
      expect(resolveColor('#ff0000', 'background')).toBe('#ff0000');
      expect(resolveFont('Custom.ttf', 'mono')).toBe('Custom.ttf');
    });
  });
});

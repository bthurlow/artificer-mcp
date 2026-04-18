import { z } from 'zod';
import { resolveInput } from './utils/resource.js';
import { magick, tempPath } from './utils/exec.js';
import { rm } from 'node:fs/promises';

/**
 * Optional brand/content defaults shared across tools in a project.
 *
 * Consumed at runtime from `ARTIFICER_BRAND_SPEC` — a single JSON string
 * env var. Parsed once and cached. All fields are optional so a partial
 * spec is valid.
 *
 * Use cases:
 * - Agents call `brand_spec_get` to load defaults once per session and
 *   compose text-overlay / image-gen / TTS / music prompts with the
 *   project's palette, fonts, voice, and scene description.
 * - Individual tools may soft-default from this spec when a user omits
 *   a parameter (e.g., `gemini_generate_speech` falls back to
 *   `brandSpec.tts.voice`).
 */
export const brandSpecSchema = z
  .object({
    name: z.string().optional().describe('Brand/project display name.'),
    colors: z
      .object({
        primary: z.string().optional().describe('Hex color string, e.g. "#e11d48".'),
        primary_name: z
          .string()
          .optional()
          .describe('Semantic name for the primary color, e.g. "rose-600".'),
        secondary: z.string().optional(),
        secondary_name: z.string().optional(),
      })
      .optional(),
    fonts: z
      .object({
        regular: z.string().optional().describe('Path/URI to the regular-weight font.'),
        medium: z.string().optional(),
        semibold: z.string().optional(),
        bold: z.string().optional(),
      })
      .optional(),
    scene_description: z
      .string()
      .optional()
      .describe(
        'Canonical scene / setting description to inject into image-gen prompts for consistency (e.g., "Log cabin kitchen with gold mixers, warm natural light...").',
      ),
    tts: z
      .object({
        voice: z
          .string()
          .optional()
          .describe(
            'Default Gemini TTS prebuilt voice name (e.g., "Kore"). See gemini_tts_prompt_guide for the full list.',
          ),
        accent: z
          .string()
          .optional()
          .describe(
            'Natural-language accent/region guidance composed into the style directive (e.g., "spoken with a gentle North Mississippi / Southeastern US drawl — soft consonants, unhurried cadence").',
          ),
        style: z
          .string()
          .optional()
          .describe(
            'Default natural-language delivery style (tone/pace/emotion). Combined with `accent` when set. Only used when the caller does not pass their own `style`.',
          ),
        language_code: z
          .string()
          .optional()
          .describe('Optional ISO language code (e.g., "en-US"). Passed through when set.'),
      })
      .optional(),
    music: z
      .object({
        default_prompt: z
          .string()
          .optional()
          .describe('Default Lyria prompt for music beds (genre, tempo, mood, instruments).'),
      })
      .optional(),
    logo: z
      .object({
        full: z
          .string()
          .optional()
          .describe(
            'Full logo lockup (icon + wordmark). Used for email headers, social cards, hero branding. Accepts .svg or raster (.png/.jpg/.webp).',
          ),
        wordmark: z
          .string()
          .optional()
          .describe(
            'Text-only logo variant. Used for horizontal lower-thirds, narrow bars. Accepts .svg or raster.',
          ),
        icon: z
          .string()
          .optional()
          .describe(
            'Icon/symbol-only (square). Used for app icons, favicons, profile avatars, tight watermarks. Accepts .svg or raster.',
          ),
        watermark: z
          .string()
          .optional()
          .describe(
            'Overlay-optimized logo variant (semi-transparent or tone-adjusted for video overlay). Falls back to `wordmark`, then `icon` when unset. Accepts .svg or raster.',
          ),
      })
      .optional()
      .describe(
        'Brand logo variants. All fields accept both SVG (rasterized on demand) and raster images.',
      ),
  })
  .strict();

export type BrandSpec = z.infer<typeof brandSpecSchema>;

type CacheState =
  | { kind: 'unloaded' }
  | { kind: 'loaded'; spec: BrandSpec | null }
  | { kind: 'error'; message: string };

let cache: CacheState = { kind: 'unloaded' };

/**
 * Reset the cache. Intended for tests — production code should not call this.
 */
export function resetBrandSpecCache(): void {
  cache = { kind: 'unloaded' };
}

/**
 * Load the brand spec from `ARTIFICER_BRAND_SPEC`.
 *
 * Returns `null` when the env var is unset or empty. Throws a descriptive
 * error on malformed JSON or schema violations — callers should let this
 * propagate so users see the misconfiguration loudly rather than silently
 * getting default behavior.
 */
export function loadBrandSpec(): BrandSpec | null {
  if (cache.kind === 'loaded') return cache.spec;
  if (cache.kind === 'error') throw new Error(cache.message);

  const raw = process.env['ARTIFICER_BRAND_SPEC'];
  if (!raw || raw.trim() === '') {
    cache = { kind: 'loaded', spec: null };
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const msg = `ARTIFICER_BRAND_SPEC is not valid JSON: ${e instanceof Error ? e.message : String(e)}`;
    cache = { kind: 'error', message: msg };
    throw new Error(msg, { cause: e });
  }

  const result = brandSpecSchema.safeParse(parsed);
  if (!result.success) {
    const msg = `ARTIFICER_BRAND_SPEC failed schema validation: ${result.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')}`;
    cache = { kind: 'error', message: msg };
    throw new Error(msg);
  }

  cache = { kind: 'loaded', spec: result.data };
  return result.data;
}

/**
 * Font weight keys for `resolveFont` — maps to `brandSpec.fonts.*`.
 */
export type BrandFontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Resolve a font path/URI. Returns the explicit value when provided, else
 * the brand spec font for the requested weight (falling back through
 * weight → regular), else `undefined`. Tool handlers should pass the
 * caller's font param as `explicit` so explicit values always win.
 */
export function resolveFont(
  explicit: string | undefined,
  weight: BrandFontWeight = 'regular',
): string | undefined {
  if (explicit !== undefined && explicit !== '') return explicit;
  const fonts = loadBrandSpec()?.fonts;
  if (!fonts) return undefined;
  return fonts[weight] ?? fonts.regular;
}

/**
 * Resolve a color value. Returns explicit when provided, else the brand
 * spec primary/secondary color, else `undefined`. Accepts a hex string
 * directly or the semantic name "primary"/"secondary" to look up in the
 * brand spec.
 */
export function resolveColor(
  explicit: string | undefined,
  which: 'primary' | 'secondary' = 'primary',
): string | undefined {
  if (explicit !== undefined && explicit !== '') return explicit;
  const colors = loadBrandSpec()?.colors;
  if (!colors) return undefined;
  return which === 'secondary' ? colors.secondary : colors.primary;
}

/**
 * Stage a font string for ImageMagick's `-font` flag. If the value looks
 * like a font FILE (ends in .ttf/.otf/.woff, contains `://`, or is an
 * absolute filesystem path), resolves it via the storage layer and
 * returns a local path + cleanup handle. Otherwise treats it as a font
 * family NAME and returns it unchanged with no cleanup needed.
 *
 * Handler pattern:
 *   const { localFont, cleanup } = await stageFontForMagick(resolveFont(font));
 *   try { // use localFont } finally { await cleanup?.(); }
 */
export async function stageFontForMagick(
  font: string | undefined,
): Promise<{ localFont: string | undefined; cleanup?: () => Promise<void> }> {
  if (!font) return { localFont: undefined };
  const looksLikeFile =
    /\.(ttf|otf|woff2?)$/i.test(font) ||
    /:\/\//.test(font) ||
    font.startsWith('/') ||
    /^[A-Za-z]:[\\/]/.test(font);
  if (!looksLikeFile) return { localFont: font };
  const r = await resolveInput(font);
  return { localFont: r.localPath, cleanup: r.cleanup };
}

/**
 * Resolve a logo URI for video watermark use. Returns the explicit value
 * when provided, else walks the brand spec fallback chain
 * `logo.watermark → logo.wordmark → logo.icon`, else `undefined`.
 */
export function resolveWatermark(explicit: string | undefined): string | undefined {
  if (explicit !== undefined && explicit !== '') return explicit;
  const logo = loadBrandSpec()?.logo;
  if (!logo) return undefined;
  return logo.watermark ?? logo.wordmark ?? logo.icon;
}

/**
 * Resolve a logo URI suitable as a source for raster operations (favicon
 * generation, social card composition). Returns explicit when provided,
 * else walks `logo.full → logo.icon`, else `undefined`.
 */
export function resolveLogoSource(explicit: string | undefined): string | undefined {
  if (explicit !== undefined && explicit !== '') return explicit;
  const logo = loadBrandSpec()?.logo;
  if (!logo) return undefined;
  return logo.full ?? logo.icon;
}

/**
 * Stage a logo asset for a consumer that needs a raster file on disk
 * (ffmpeg overlay, magick composite). Accepts SVG or raster. If the source
 * is SVG, it is rasterized via ImageMagick at a generous density so the
 * downstream consumer can resize freely without quality loss.
 *
 * Returns the local path + a cleanup fn. The cleanup removes any temp
 * files created for rasterization but leaves underlying input handles to
 * be cleaned by the caller of `resolveInput`.
 *
 * Handler pattern:
 *   const { localPath, cleanup } = await stageLogoForRaster(resolveWatermark(explicit));
 *   try { // hand localPath to ffmpeg } finally { await cleanup(); }
 */
/* v8 ignore start — SVG rasterization path requires ImageMagick; covered by integration tests */
export async function stageLogoForRaster(
  uri: string | undefined,
  opts: { rasterWidth?: number } = {},
): Promise<{ localPath: string | undefined; cleanup: () => Promise<void> }> {
  if (!uri) return { localPath: undefined, cleanup: async () => {} };
  const input = await resolveInput(uri);
  const isSvg = /\.svgz?$/i.test(uri) || /\.svgz?$/i.test(input.localPath);
  if (!isSvg) {
    return { localPath: input.localPath, cleanup: async () => input.cleanup?.() };
  }
  const targetWidth = opts.rasterWidth ?? 1024;
  const rasterPath = tempPath('.png');
  await magick([
    '-background',
    'none',
    '-density',
    '300',
    input.localPath,
    '-resize',
    `${targetWidth}x`,
    rasterPath,
  ]);
  return {
    localPath: rasterPath,
    cleanup: async () => {
      await rm(rasterPath, { force: true }).catch(() => {});
      await input.cleanup?.();
    },
  };
}
/* v8 ignore stop */

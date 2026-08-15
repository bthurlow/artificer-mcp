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
/**
 * Brand palette.
 *
 * The four named slots are ordered by canonical role: `primary` is *the*
 * brand color, `secondary` the main accent, and `background` / `highlight`
 * are surface colors — a brand-mandated ground and the tone that sits on
 * it. Reach for `primary` when you just need "the brand color".
 *
 * Anything outside those roles goes in `extras`, keyed by whatever name
 * the brand system uses. That escape hatch is what makes `.strict()` here
 * safe: unknown keys fail loudly instead of vanishing, and there is still
 * somewhere legitimate to put a fifth color.
 */
const colorsSchema = z
  .object({
    primary: z.string().optional().describe('Hex color string, e.g. "#e11d48". The brand color.'),
    primary_name: z
      .string()
      .optional()
      .describe('Semantic name for the primary color, e.g. "rose-600".'),
    secondary: z.string().optional().describe('Accent color. Hex string.'),
    secondary_name: z.string().optional(),
    background: z
      .string()
      .optional()
      .describe('Brand-mandated ground/surface color, e.g. "#0A0A0A". Hex string.'),
    background_name: z.string().optional(),
    highlight: z
      .string()
      .optional()
      .describe('Highlight/contrast tone that sits on the background, e.g. "#F4ECD8". Hex string.'),
    highlight_name: z.string().optional(),
    extras: z
      .record(z.string())
      .optional()
      .describe(
        'Any additional named colors, e.g. {"phosphor_green": "#39FF14"}. Use this for multi-mode palettes rather than inventing top-level keys — unknown top-level keys are rejected.',
      ),
  })
  .strict();

/**
 * Brand typography.
 *
 * Two independent axes share this object, which is worth stating plainly:
 * `regular` / `medium` / `semibold` / `bold` are **weights of the primary
 * family**, while `mono` / `sans` / `display` are **separate families**.
 * A brand with display + body + mono is routine, so both axes are needed.
 *
 * The distinction matters at resolve time — see `resolveFont`. A missing
 * weight falls back to `regular`; a missing family does not, because
 * silently substituting a display serif where mono was asked for defeats
 * the reason mono was requested.
 */
const fontsSchema = z
  .object({
    regular: z.string().optional().describe('Path/URI to the regular-weight font.'),
    medium: z.string().optional(),
    semibold: z.string().optional(),
    bold: z.string().optional(),
    mono: z
      .string()
      .optional()
      .describe(
        'Monospace family, for technical text / credits / lyric sheets where column alignment matters.',
      ),
    sans: z.string().optional().describe('Sans-serif family, typically for body and press copy.'),
    display: z
      .string()
      .optional()
      .describe('Display/wordmark family, for titles and headline treatments.'),
    extras: z
      .record(z.string())
      .optional()
      .describe(
        'Any additional named font families or weights. Use this rather than inventing top-level keys — unknown top-level keys are rejected.',
      ),
  })
  .strict();

export const brandSpecSchema = z
  .object({
    name: z.string().optional().describe('Brand/project display name.'),
    colors: colorsSchema.optional(),
    fonts: fontsSchema.optional(),
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
      .strict()
      .optional(),
    music: z
      .object({
        default_prompt: z
          .string()
          .optional()
          .describe('Default Lyria prompt for music beds (genre, tempo, mood, instruments).'),
      })
      .strict()
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
      .strict()
      .optional()
      .describe(
        'Brand logo variants. All fields accept both SVG (rasterized on demand) and raster images.',
      ),
  })
  .strict();

export type BrandSpec = z.infer<typeof brandSpecSchema>;

/**
 * The accepted key set for each object in the spec, used to make an
 * unknown-key error actionable.
 *
 * Every nested object is `.strict()`, so a stray key now throws instead of
 * being silently dropped. That is only an improvement if the error tells
 * the caller what they *can* write — otherwise they are back to
 * round-tripping `brand_spec_get` to reverse-engineer the shape, which is
 * the exact frustration this replaces.
 */
const ACCEPTED_KEYS: Record<string, readonly string[]> = (() => {
  // Derived from the schema rather than hand-listed, so adding a slot
  // cannot leave the error message describing a shape that no longer
  // exists — the failure mode this whole change is meant to end.
  const map: Record<string, readonly string[]> = {
    '(root)': Object.keys(brandSpecSchema.shape),
  };
  for (const [key, node] of Object.entries(brandSpecSchema.shape)) {
    let inner: z.ZodTypeAny = node;
    while (inner instanceof z.ZodOptional || inner instanceof z.ZodDefault) {
      inner = inner._def.innerType as z.ZodTypeAny;
    }
    if (inner instanceof z.ZodObject) {
      map[key] = Object.keys(inner.shape as Record<string, unknown>);
    }
  }
  return map;
})();

/** Objects that offer an `extras` bag for anything outside the named slots. */
const HAS_EXTRAS = new Set(['colors', 'fonts']);

/**
 * Render one Zod issue as a line the caller can act on.
 *
 * Unknown-key issues get the accepted slots appended (and a pointer at
 * `extras` where one exists). Everything else keeps the plain
 * `path: message` form.
 */
function formatIssue(issue: z.ZodIssue): string {
  const path = issue.path.join('.') || '(root)';
  if (issue.code !== 'unrecognized_keys') return `${path}: ${issue.message}`;

  const accepted = ACCEPTED_KEYS[path];
  const unknown = issue.keys.map((k) => `"${k}"`).join(', ');
  let line = `${path}: unknown key(s) ${unknown}`;
  if (accepted) line += ` — accepted here: ${accepted.join(', ')}`;
  if (HAS_EXTRAS.has(path)) {
    line += `. Put anything else under ${path}.extras (an object of name → value)`;
  }
  return line;
}

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
      .map(formatIssue)
      .join('; ')}`;
    cache = { kind: 'error', message: msg };
    throw new Error(msg);
  }

  cache = { kind: 'loaded', spec: result.data };
  return result.data;
}

/**
 * Weights of the primary family — `brandSpec.fonts.{regular,…,bold}`.
 */
export type BrandFontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Distinct families — `brandSpec.fonts.{mono,sans,display}`.
 */
export type BrandFontFamily = 'mono' | 'sans' | 'display';

/** Anything `resolveFont` can be asked for. */
export type BrandFontKey = BrandFontWeight | BrandFontFamily;

const FONT_FAMILIES: ReadonlySet<string> = new Set<BrandFontFamily>(['mono', 'sans', 'display']);

/**
 * Resolve a font path/URI. Explicit value always wins; otherwise read the
 * brand spec.
 *
 * **Weights fall back to `regular`. Families do not.** Asking for `bold`
 * and getting the regular cut is a reasonable degradation — it is the same
 * typeface. Asking for `mono` and getting a display serif is not: mono is
 * requested precisely when column alignment matters (credits, lyric
 * sheets, technical text), so a proportional substitute silently breaks
 * the thing the caller was trying to achieve. Better to return `undefined`
 * and let the consumer fall back to its own default explicitly.
 */
export function resolveFont(
  explicit: string | undefined,
  key: BrandFontKey = 'regular',
): string | undefined {
  if (explicit !== undefined && explicit !== '') return explicit;
  const fonts = loadBrandSpec()?.fonts;
  if (!fonts) return undefined;
  if (FONT_FAMILIES.has(key)) return fonts[key as BrandFontFamily];
  return fonts[key as BrandFontWeight] ?? fonts.regular;
}

/**
 * Color roles `resolveColor` can look up.
 */
export type BrandColorRole = 'primary' | 'secondary' | 'background' | 'highlight';

/**
 * Resolve a color value. Returns explicit when provided, else the brand
 * spec color for the requested role, else `undefined`.
 *
 * No cross-role fallback: `background` returning `primary` when unset
 * would paint a surface in the brand's accent color, which is worse than
 * letting the consumer apply its own default. Roles outside these four
 * live in `colors.extras` and are read from the spec directly rather than
 * through this helper.
 */
export function resolveColor(
  explicit: string | undefined,
  which: BrandColorRole = 'primary',
): string | undefined {
  if (explicit !== undefined && explicit !== '') return explicit;
  const colors = loadBrandSpec()?.colors;
  if (!colors) return undefined;
  return colors[which];
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

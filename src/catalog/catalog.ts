import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerTool } from '../utils/register.js';
import { isToolRegistered } from './tool-registry.js';

const CAPABILITIES = ['video', 'image', 'music', 'speech', 'safety', 'transcription'] as const;
type Capability = (typeof CAPABILITIES)[number];

interface AccessRoute {
  provider: string;
  tool: string;
  model: string;
  cost: string;
  key_env_var: string;
  stub: boolean;
}

interface CatalogEntry {
  slug: string;
  prompt_guide: string | null;
  access_routes: AccessRoute[];
}

type CatalogData = {
  $schema_version?: string;
  notes?: string;
} & Partial<Record<Capability, Record<string, CatalogEntry[]>>>;

type CatalogLoad = { ok: true; data: CatalogData } | { ok: false; error: string };

let cachedLoad: CatalogLoad | null = null;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MODELS_PATH = resolve(__dirname, 'models.json');

/**
 * Read `models.json` exactly once per process and cache the result (parsed
 * or error). Env-filter and tool-registration-filter are re-run per call
 * against the cached data — they depend on `process.env` and the
 * registry, both of which can change, but the static JSON does not.
 *
 * Exported for tests so they can pin a fixture path and reset the cache.
 */
export async function loadCatalog(path: string = DEFAULT_MODELS_PATH): Promise<CatalogLoad> {
  if (cachedLoad) return cachedLoad;
  try {
    const text = await readFile(path, 'utf8');
    const data = JSON.parse(text) as CatalogData;
    cachedLoad = { ok: true, data };
  } catch (err) {
    cachedLoad = {
      ok: false,
      error: `Failed to load models.json from ${path}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  return cachedLoad;
}

/** Test-only cache reset. Not exported from src/catalog/index.ts. */
export function __resetCatalogCacheForTests(): void {
  cachedLoad = null;
}

interface FilterOptions {
  capability?: Capability;
  includeUnavailable: boolean;
  /** Override for tests. Real runtime uses the module-level registry. */
  isToolRegisteredFn?: (name: string) => boolean;
  /** Override for tests. Real runtime reads `process.env`. */
  env?: NodeJS.ProcessEnv;
}

interface FilteredCatalog {
  [cap: string]: Record<
    string,
    Array<CatalogEntry & { access_routes: Array<AccessRoute & { available: boolean }> }>
  >;
}

type CatalogResponse = FilteredCatalog;

/**
 * Apply env-key and runtime-tool-registration filters to the static catalog.
 *
 * Rules:
 *  - A route is `available` iff its `key_env_var` is set in env AND its
 *    `tool` is present in the tool registry AND `stub` is false.
 *  - By default (include_unavailable=false), routes that fail any check
 *    are dropped from the response AND entries with zero remaining
 *    routes are dropped with them.
 *  - With include_unavailable=true, every route is returned, each with
 *    a boolean `available` flag so the caller can see what's missing.
 *  - If capability is set, only that capability is returned.
 */
export function filterCatalog(
  data: CatalogData,
  opts: FilterOptions,
): { catalog: CatalogResponse; warnings: string[] } {
  const env = opts.env ?? process.env;
  const isRegistered = opts.isToolRegisteredFn ?? isToolRegistered;
  const warnings: string[] = [];
  const result: CatalogResponse = {};

  const capsToInclude = opts.capability ? [opts.capability] : CAPABILITIES;

  for (const cap of capsToInclude) {
    const capData = data[cap];
    if (!capData) continue;

    const filteredCap: Record<
      string,
      Array<CatalogEntry & { access_routes: Array<AccessRoute & { available: boolean }> }>
    > = {};

    for (const [subClass, entries] of Object.entries(capData)) {
      const filteredEntries: Array<
        CatalogEntry & { access_routes: Array<AccessRoute & { available: boolean }> }
      > = [];

      for (const entry of entries) {
        const routesWithAvailability = entry.access_routes.map((route) => {
          const keyValue = env[route.key_env_var];
          const hasKey = typeof keyValue === 'string' && keyValue.length > 0;
          const toolExists = isRegistered(route.tool);
          const available = hasKey && toolExists && !route.stub;
          if (!toolExists && !route.stub) {
            warnings.push(
              `Catalog entry ${entry.slug} route points at unregistered tool "${route.tool}" ` +
                `but is not marked stub. Check registration order.`,
            );
          }
          return { ...route, available };
        });

        const visibleRoutes = opts.includeUnavailable
          ? routesWithAvailability
          : routesWithAvailability.filter((r) => r.available);

        if (visibleRoutes.length === 0) continue;

        filteredEntries.push({
          slug: entry.slug,
          prompt_guide: entry.prompt_guide,
          access_routes: visibleRoutes,
        });
      }

      if (filteredEntries.length > 0) {
        filteredCap[subClass] = filteredEntries;
      }
    }

    if (Object.keys(filteredCap).length > 0) {
      result[cap] = filteredCap;
    }
  }

  return { catalog: result, warnings };
}

const catalogSchema = z.object({
  capability: z
    .enum(CAPABILITIES)
    .optional()
    .describe(
      'Optional filter — restrict the response to a single capability (video, image, music, speech, safety, transcription).',
    ),
  include_unavailable: z
    .boolean()
    .default(false)
    .describe(
      'If true, include routes whose API keys are not configured, whose transport tool is not yet registered (Phase 4+ image, Phase 5+ music/speech, Phase 3 safety), or that are marked stub. Each route carries an `available` boolean so callers can see what is missing. Default false.',
    ),
});

export interface ModelCatalogParams {
  capability?: Capability;
  include_unavailable: boolean;
}

export function registerCatalogTools(server: McpServer): void {
  registerTool<ModelCatalogParams>(
    server,
    'model_catalog',
    "List available media-generation models grouped by capability and sub-class. Returns logical model slugs, prompt guide tool names, and access routes (provider + transport tool + wire-level model id + cost). Call this first when you need to pick a model for a task; then call the relevant prompt_guide, then the access route's transport tool. Use `include_unavailable: true` to see models whose API keys aren't configured.",
    catalogSchema.shape,
    async ({ capability, include_unavailable }) => {
      const load = await loadCatalog();
      if (!load.ok) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'catalog_unavailable', detail: load.error }, null, 2),
            },
          ],
        };
      }

      const { catalog, warnings } = filterCatalog(load.data, {
        capability,
        includeUnavailable: include_unavailable,
      });

      const hasAnyKey = ['FAL_KEY', 'GOOGLE_API_KEY'].some((k) => {
        const v = process.env[k];
        return typeof v === 'string' && v.length > 0;
      });
      const finalWarnings = [...warnings];
      if (!hasAnyKey && !include_unavailable) {
        finalWarnings.push(
          'No API keys configured. Set FAL_KEY and/or GOOGLE_API_KEY to unlock models, or call with include_unavailable:true to see the full catalog.',
        );
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              finalWarnings.length > 0 ? { ...catalog, warnings: finalWarnings } : catalog,
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}

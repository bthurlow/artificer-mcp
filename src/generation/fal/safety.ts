import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { registerTool } from '../../utils/register.js';
import { getFalClient } from './client.js';
import { parseFalError } from './errors.js';
import { loadCatalog } from '../../catalog/catalog.js';

/**
 * Input schema for `fal_classify_text`.
 *
 * Non-transport tool — unlike `fal_generate_video`, this one MAY carry a
 * server-side default, but only when the deterministic "exactly one
 * non-stub safety.text entry" rule picks unambiguously. See
 * `resolveDefaultSafetyModel` below.
 */
export const falClassifyTextSchema = z.object({
  text: z.string().min(1).describe('The text to classify. Required.'),
  model: z
    .string()
    .optional()
    .describe(
      'Fal safety model id (e.g. "fal-ai/qwen-3-guard"). Optional when exactly one non-stub safety.text entry is in the catalog — that entry auto-defaults. Required when multiple are available. Call `model_catalog` with capability:"safety" to see options.',
    ),
});

export interface FalClassifyTextParams {
  text: string;
  model?: string;
}

/**
 * Resolve the auto-default safety model from the catalog.
 *
 * Rule (from the design doc): exactly one non-stub safety.text entry in
 * the catalog with a fal-provider route → use its `model` as the default.
 * Zero or more than one → return null, forcing the caller to pass `model`
 * explicitly. "Obvious choice" is not a factor — the test is strict
 * cardinality on non-stub entries.
 *
 * Exported for unit testing. Real runtime flows through the registered
 * tool handler below.
 */
export async function resolveDefaultSafetyModel(): Promise<string | null> {
  const load = await loadCatalog();
  if (!load.ok) return null;

  const entries = load.data.safety?.text ?? [];
  const nonStubFalModels: string[] = [];
  for (const entry of entries) {
    for (const route of entry.access_routes) {
      if (route.provider === 'fal' && !route.stub) {
        nonStubFalModels.push(route.model);
      }
    }
  }
  return nonStubFalModels.length === 1 ? nonStubFalModels[0] : null;
}

/**
 * Normalize fal's raw response into a stable artificer shape.
 *
 * Fal's Qwen-3-Guard returns `{ label: "Safe" | "Unsafe" | "Controversial",
 * categories: string[] }`. We derive `safe: boolean` on top (label === "Safe"),
 * preserve label + categories as-is, and pass the raw fal body for callers
 * who want the untouched response.
 *
 * Exported for unit testing.
 */
export function normalizeSafetyResponse(raw: unknown): {
  safe: boolean;
  label: string;
  categories: string[];
  raw: unknown;
} {
  const data = (raw && typeof raw === 'object' ? raw : {}) as {
    label?: unknown;
    categories?: unknown;
  };
  const label = typeof data.label === 'string' ? data.label : 'Unknown';
  const categories = Array.isArray(data.categories)
    ? data.categories.filter((c): c is string => typeof c === 'string')
    : [];
  const safe = label === 'Safe';
  return { safe, label, categories, raw };
}

export function registerFalSafetyTools(server: McpServer): void {
  registerTool<FalClassifyTextParams>(
    server,
    'fal_classify_text',
    'Classify text for safety via fal-hosted safety models (e.g. Qwen 3 Guard). Returns {safe, label, categories, raw}. When exactly one non-stub safety.text entry exists in the catalog, `model` auto-defaults to it — otherwise `model` is required. Uses FAL_KEY env var.',
    falClassifyTextSchema.shape,
    async ({ text, model }) => {
      const client = getFalClient();

      let resolvedModel: string;
      if (model) {
        resolvedModel = model;
      } else {
        const fromCatalog = await resolveDefaultSafetyModel();
        if (!fromCatalog) {
          throw new Error(
            'fal_classify_text: `model` is required because the catalog has zero or more than one non-stub safety.text entry. ' +
              'Pass `model` explicitly, or call `model_catalog` with capability:"safety" to see available options.',
          );
        }
        resolvedModel = fromCatalog;
      }

      let result;
      try {
        result = await client.subscribe(resolvedModel, {
          input: { prompt: text },
          logs: false,
        });
      } catch (err) {
        const falErr = parseFalError(err);
        throw new Error(
          `fal_classify_text failed (${falErr.constructor.name}: ${falErr.errorType}, ` +
            `status=${falErr.status}, retryable=${falErr.retryable}, ` +
            `requestId=${falErr.requestId ?? 'unknown'}): ${falErr.message}`,
          { cause: err },
        );
      }

      const normalized = normalizeSafetyResponse(result.data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(normalized, null, 2),
          },
        ],
      };
    },
  );
}

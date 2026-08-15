import { loadFalInputKeys, type FalInputKeys } from '../../catalog/fal-input-keys.js';

/** Most suggestions we will offer for one unknown key before it reads as noise. */
const MAX_SUGGESTIONS = 3;

/**
 * Find nested paths a mistyped top-level key was probably reaching for.
 *
 * Two matches count: the leaf name equals the key outright (`format` →
 * `audio_setting.format`), or the key's last underscore-token equals the
 * leaf (`audio_format` → `audio_setting.format`). That second rule is the
 * one that catches the case this whole check exists for — a caller
 * flattening a nested knob into a plausible-sounding top-level name.
 *
 * Exported for unit testing.
 */
export function suggestNestedPaths(unknownKey: string, nested: readonly string[]): string[] {
  const lastToken = unknownKey.split('_').pop();
  const hits = nested.filter((path) => {
    const leaf = path.split('.').pop();
    return leaf === unknownKey || (lastToken !== undefined && leaf === lastToken);
  });
  return hits.slice(0, MAX_SUGGESTIONS);
}

/**
 * Describe every `extra_params` key the model's spec does not accept.
 *
 * Pure — takes the already-loaded key set so it can be tested without
 * touching the filesystem. Returns one human-readable line per unknown
 * key; an empty array means nothing to say.
 *
 * This is **diagnostic only**. It never rewrites, drops, or relocates a
 * key. The transports pass `extra_params` through verbatim by design, and
 * silently "fixing" a caller's payload would put model-shape knowledge
 * into the request path — exactly the hidden behavior this server avoids.
 * Warning is the honest middle: fal drops the key either way, so at least
 * say so.
 */
export function describeUnknownExtraParams(
  toolName: string,
  model: string,
  extraKeys: readonly string[],
  keys: FalInputKeys,
): string[] {
  const accepted = new Set(keys.top);
  const lines: string[] = [];

  for (const key of extraKeys) {
    if (accepted.has(key)) continue;

    const suggestions = suggestNestedPaths(key, keys.nested);
    let line =
      `${toolName}: extra_params key "${key}" is not an input on ${model} — ` +
      `fal will silently ignore it.`;

    if (suggestions.length > 0) {
      line +=
        ` Did you mean ${suggestions.map((s) => `"${s}"`).join(' or ')}? ` +
        `Nest it, e.g. {"${suggestions[0].split('.')[0]}": {"${suggestions[0]
          .split('.')
          .slice(1)
          .join('.')}": ...}}.`;
    } else {
      line += ` Accepted top-level keys: ${keys.top.join(', ')}.`;
    }
    lines.push(line);
  }

  return lines;
}

/**
 * Look up a model and describe any unrecognized `extra_params` keys.
 *
 * Returns `[]` — silently — when the model is not in the distilled map or
 * the map could not be loaded. A caller reaching a brand-new fal route,
 * or running a build without the data file, must not be told their valid
 * keys are wrong. A missed warning costs a surprise; a false warning
 * costs trust in every warning after it.
 */
export async function checkExtraParams(
  toolName: string,
  model: string,
  extra: Record<string, unknown> | undefined,
): Promise<string[]> {
  const extraKeys = Object.keys(extra ?? {});
  if (extraKeys.length === 0) return [];

  const map = await loadFalInputKeys();
  const keys = map?.[model];
  if (!keys || keys.top.length === 0) return [];

  return describeUnknownExtraParams(toolName, model, extraKeys, keys);
}

# Contributing to artificer-mcp

Thanks for looking at the code. Quick notes below for the bits that aren't obvious from reading the source.

## Development

```bash
yarn install
yarn dev      # stdio MCP server against src/
yarn ci       # lint + format + typecheck + build + unit tests (runs in CI)
```

## Generation tool providers

Artificer wraps multiple generative-media providers behind MCP tools. Each provider has its own SDK pin and bake-off expectations.

### Google (`@google/genai`)

Default range-pinned (`^`). Bumping within the semver range is fine without special testing beyond `yarn ci`.

### fal.ai (`@fal-ai/client`)

**Pinned to an exact version.** See `package.json`.

Upgrading `@fal-ai/client` is not a routine dependency bump. The SDK is on the critical path for the talking-head video pipeline, and SDK-level changes (queue polling semantics, storage upload shape, error body parsing) can regress the transport in ways the unit tests don't catch. Before merging an upgrade:

1. Read the upstream changelog. Flag any queue, storage, or error-handling changes.
2. Re-run the talking-head bake-off against the current default model (Wan 2.7). The script is `scripts/fal-bakeoff.mjs`; expected spend is ~$2–3.
3. Update `docs/plans/fal-bakeoff-2026-04-23.md` with the new SDK version and re-confirm the Wan / Kling / veed rubric scores.
4. If schemas drifted, re-run `node scripts/sync-fal-specs.mjs` and commit any changes under `src/catalog/fal-specs/` alongside the SDK bump.

### Fal spec drift

`scripts/sync-fal-specs.mjs` is the canonical way to refresh `src/catalog/fal-specs/{slug}/openapi.json` and `llms.md`. Run it on demand:

```bash
node scripts/sync-fal-specs.mjs              # refresh every fal route in models.json
node scripts/sync-fal-specs.mjs --model wan-2.7
node scripts/sync-fal-specs.mjs --dry-run    # preview, no writes
```

The script also refreshes each route's `cost` string in `src/catalog/models.json` from the llms.txt Pricing block. Commit all diffs together.

## Tests

- `yarn test:unit` — fast, no external calls. Runs on every `yarn ci`.
- `yarn test:integration` — requires `INTEGRATION=1` plus the provider API keys (`GOOGLE_API_KEY`, `FAL_KEY`) set in the environment. Exercises live APIs and costs real money; gate on intentional triggers.

Tests live under `tests/unit/{domain}/` and `tests/integration/`.

# Convention: Prompt Guide Tools

Each generation model in the catalog has exactly one prompt-guide tool that
describes how to prompt it. This doc specifies the shape those guides must
take so callers (LLMs invoking artificer) get a consistent surface regardless
of model or provider.

Derived from the design at `docs/plans/fal-multi-provider-design-2026-04-23.md`.

## Tool naming

`{model_slug}_{capability}_prompt_guide`

Examples:
- `veo_video_prompt_guide`
- `kling_avatar_prompt_guide` (the "avatar" here is the logical model slug —
  the capability is still video; shorter name keeps the tool usable)
- `veed_fabric_prompt_guide`
- `flux_image_prompt_guide` (hypothetical Phase 4)
- `elevenlabs_speech_prompt_guide` (hypothetical Phase 5)

One guide per logical model. If the same logical model is reachable through
multiple providers (Veo via Google or fal), there is still exactly one
guide — prompt *language* is keyed by model, not access route.

## Return value

The guide tool's return value is prose in markdown with these sections in
this order. Absent sections are allowed when the content genuinely does not
apply (explicit "N/A" lines are not required for absent sections).

### 1. `# {Model Display Name} Prompt Guide`

Top-level heading with the human-friendly model name, not the slug.

### 2. `## What this model is best for`

One to three sentences naming the use cases this model is the right pick
for. Terse. Resist the urge to list every capability — that dilutes the signal.

### 3. `## Known strengths`

Bullet list of the specific things this model is unusually good at. Prefer
concrete properties over marketing language ("preserves character identity
across edits" over "high fidelity").

### 4. `## Known weaknesses / quirks`

Bullet list of real limitations and gotchas. This is the section callers
read before they waste money — err toward completeness over brevity here.
Include anything observed in bake-offs, common failure modes, and
parameter-specific landmines.

### 5. `## Input requirements`

What the caller must supply. Formats, size limits, URL constraints
(public vs signed), duration bounds. When the model's llms.txt or OpenAPI
publishes these, source them from there rather than restating by hand.

### 6. `## Prompt structure`

Prose guidance on how to structure the `prompt` string for this model:
shot descriptors, camera directions, style keywords, what NOT to include,
ordering conventions. Written in imperative voice ("Describe subject
first", not "It is recommended that users describe subject first").

### 7. `## Example prompts`

Two to three concrete examples with short captions explaining why each
example is structured the way it is. Real prompts the caller can copy, not
placeholders.

### 8. `## Access routes`

Markdown table of routes through which this model can be invoked. This
section is machine-parseable and catalog-readable — keep the columns
stable:

```markdown
| Provider | Tool                   | Model ID                    | Cost          | Notes |
|----------|------------------------|-----------------------------|---------------|-------|
| google   | gemini_generate_video  | veo-3.1-generate-001        | see Google... | Exposes `generate_audio`, `person_generation`, `seed` |
| fal      | fal_generate_video     | fal-ai/veo3.1/image-to-video | $0.50 / sec   | No `seed`; uses fal's queue polling |
```

Per-route notes cover request-shape differences (which config knobs each
provider exposes, default resolution, auto-vs-manual audio matching).
Prompt-language differences do NOT belong here — if the prompt language
really diverges between routes, that is a bake-off finding that changes
the `## Prompt structure` section itself.

### 9. `## Last verified`

Stamp line with an ISO date and what was verified. Example:

> Last verified: 2026-04-23 against artificer-mcp v0.9.0 — prompt
> structure pulled from the Q2 talking-head bake-off, cost confirmed
> from fal's llms.txt on the same date.

### 10. `## Official references`

Links back to upstream docs. Optional but strongly preferred when the
model has a canonical reference page.

## What the guide is NOT

- **Not a model catalog.** `model_catalog` returns machine-readable JSON
  for discovery across the whole surface. Guide tools return prose for one
  model.
- **Not a prompt generator.** The guide teaches the caller how to prompt;
  it does not accept a "goal" argument and return a crafted prompt. That
  is a separate concern tracked in future planning.
- **Not a parameter validator.** Per-model OpenAPI and Zod schemas (when
  generated) handle that. The guide reads parameter constraints from
  those sources when relevant, but does not re-implement validation.

## File layout

Each guide lives in its own file under `src/guides/`:

- `src/guides/veo.ts` → registers `veo_video_prompt_guide`
- `src/guides/imagen.ts` → registers `gemini_image_prompt_guide`
- `src/guides/nanobanana.ts` → registers `gemini_nanobanana_prompt_guide`
- `src/guides/gemini-tts.ts` → registers `gemini_tts_prompt_guide`
- `src/guides/lyria.ts` → registers `gemini_lyria_prompt_guide`
- `src/guides/wan.ts` → registers `wan_video_prompt_guide`
- `src/guides/kling-avatar.ts` → registers `kling_avatar_prompt_guide`
- `src/guides/veed-fabric.ts` → registers `veed_fabric_prompt_guide`

`src/guides/index.ts` composes these — it imports each `register*` helper
and calls them all from `registerGuideTools(server)`. No guide content
lives in `index.ts`.

## Fal-hosted specifics

For fal-hosted models, the "Input requirements" and (sometimes) "Known
weaknesses" sections derive from:

- `src/catalog/fal-specs/{slug}/llms.md` — fetched by
  `scripts/sync-fal-specs.mjs`, human-readable
- `src/catalog/fal-specs/{slug}/openapi.json` — same script, full schema

When either file updates (from a sync run), the corresponding guide
should be re-reviewed. There is no automatic propagation — the sync
script commits the raw specs, and the guide author decides which
changes rise to the guide's level of detail.

## Adding a new guide

1. Pick the logical model slug. Put it in `src/catalog/models.json` with
   a `prompt_guide` field pointing at the tool name you intend to
   register.
2. For fal-hosted models, run `node scripts/sync-fal-specs.mjs --model <slug>`
   to pull the specs.
3. Create `src/guides/{slug}.ts` with an exported `register*PromptGuide`
   function following the format above.
4. Import and call it from `src/guides/index.ts`.
5. Update `tests/protocol/server.test.ts` to include the new tool name in
   the `guides` category and bump the tool count.
6. If the guide covers a new catalog entry, the catalog-integrity test
   (Phase 2) will assert the `prompt_guide` name resolves to a registered
   tool — no extra work required on that side.

# Plan — fal.ai Provider Integration

**Status:** Proposed
**Date:** 2026-04-23
**Owner:** artificer-mcp
**Upstream context:** `bakers-assistant/docs/plans/agentic-content-production.md` — tracks the content-pipeline experiments that motivated this plan (Veo silence-directive failures, audio-split crossfade ceiling, need for audio-driven lip-sync).
**Sibling workstream:** `bakers-assistant/docs/plans/` will need a companion entry for the pipeline-side handler wiring once this artificer plan ships. Not in scope here.

## Context

artificer-mcp today generates video exclusively via Google Veo 3.1 (Lite / Fast / Full) through `gemini_generate_video`. Empirical testing (2026-04-23) across 9 prompt variants + 2 clip durations established:

- Veo 3.1 does not respect silence directives (audio-text, action-text, timestamp, or plain language — all ineffective).
- The 0.25s audio-split crossfade ceiling downstream in `social-content-pipeline` is driven by Veo's speech-fill behavior, not prompt phrasing.
- Veo conflates video generation with audio synthesis, so the pipeline has no independent control over voice, cadence, or silence.

**The audio-driven mode on Wan 2.7 (Alibaba, released April 2026) decouples audio from video generation:** TTS or recorded audio is passed as a URL parameter; the model lip-syncs the avatar to it. This removes the silence problem entirely because the pipeline authors the audio track with whatever cadence and end-silence it wants.

Longer clip lengths (up to 15s on Wan 2.7 vs Veo's 8s max) also reduce chunk-seam count — a 30s talking-head reel could ship as 2 Wan clips vs 5 Veo clips, with a single crossfade instead of 4.

**fal.ai** is the most viable hosting provider for Wan 2.7 + Kling + other generative models, because:

1. **Unified JSON schema across every model.** Adding a new model is a string change, not a new SDK integration.
2. **44% market share for video APIs** (largest player), well-funded, transparent per-second pricing.
3. **Ecosystem beyond video:** native Qwen 3 Guard 8B safety classifier; OpenRouter passthrough for general LLMs (Claude, GPT-5, Gemini, DeepSeek, Qwen, Llama — 200+).
4. **Pricing competitive:** Wan 2.7 at $0.10/sec, Kling at $0.224/sec, frontier LLMs pay-as-you-go via OpenRouter. No monthly minimums.

## Goal

Give artificer-mcp a thin, durable fal.ai provider layer so `social-content-pipeline` can dispatch video / image / LLM / safety calls through fal.ai as an alternative to (or eventually a replacement for) per-provider integrations. The design must hold up through model version bumps (Wan 2.7 → 2.8 → 3.x, Kling 3 → 4, etc.) without per-version code changes in artificer.

## Non-goals (explicit)

- Do NOT retire the existing `gemini_generate_video` tool. Veo stays wired so we can A/B compare and so the pipeline can fall back when fal.ai has an outage.
- Do NOT route OpenRouter-proxied LLM calls through artificer. The content-pipeline already has a Vercel AI SDK integration for Gemini / Claude; that stays direct-to-provider for lower latency. Artificer wraps fal.ai's *media* + *safety classifier* surface only.
- Do NOT build a universal "one prompt, all models" abstraction. Per-model prompt builders live in `social-content-pipeline`, not artificer. Artificer is a transport layer.
- Do NOT wire every model fal.ai offers. Start with Wan 2.7 (audio-driven I2V) and Qwen 3 Guard 8B. Kling, Flux, Seedream, etc. added only when a concrete pipeline use case needs them.

## Architectural approach

### One generation module per fal.ai capability

New directory: `src/generation/fal/`

Mirror the existing split in `src/generation/` (image.ts, music.ts, speech.ts, video.ts). Each file registers one or more MCP tools and wraps the fal.ai client for a specific modality.

Proposed layout:

```
src/generation/fal/
  client.ts           # shared fal.ai client factory (auth, retry, polling)
  video.ts            # fal_generate_video — covers Wan, Kling, Veo-on-fal, etc.
  image.ts            # fal_generate_image — covers Flux, Seedream, SDXL, etc.
  safety.ts           # fal_classify_text — Qwen 3 Guard 8B
  types.ts            # shared fal.ai types + Zod schemas
  index.ts            # registerFalTools(server) composition
```

### Unified video tool: `fal_generate_video`

ONE tool, model selected by string parameter. This mirrors how `gemini_generate_video` accepts any Veo model id via `model`.

```typescript
fal_generate_video({
  model: string,              // fal model id, e.g., "fal-ai/wan/v2.7/image-to-video"
  prompt: string,
  output: string,             // gs://, file://, or local path
  image?: string,             // optional input image for I2V — resolved via resolveInput()
  audio?: string,             // optional driving audio URL for audio-driven lip-sync (Wan 2.7+)
  duration_seconds?: number,  // model-dependent
  aspect_ratio?: string,      // "9:16" | "16:9" | "1:1" | etc.
  resolution?: string,        // "720p" | "1080p"
  negative_prompt?: string,   // model-dependent
  extra_params?: Record<string, unknown>,  // passthrough for model-specific knobs
  poll_interval_seconds?: number,
  poll_timeout_seconds?: number,
})
```

Key design notes:

- **`model` accepts any fal.ai model id string.** No enum — new Wan / Kling / Sora versions work the moment fal.ai lists them. Consistent with the `ARTIFICER_VEO_MODEL` pattern in `src/generation/video.ts`.
- **`extra_params` is a typed `Record<string, unknown>` passthrough.** Each model has a few idiosyncratic knobs (Wan 2.7 exposes `num_frames`, `shift`, `multi_shots`; Kling exposes `camera_direction`, `negative_motion`). Surfacing every one of them as first-class params would bloat the tool schema. Let the caller pass them through. Zod accepts-any on this field.
- **`audio` param is first-class** because it's the killer feature for our talking-head use case. Even though only Wan 2.7+ uses it today, it's stable enough to bake into the schema — other audio-driven models will follow the same pattern.
- **`image` resolves through `resolveInput()`** so gs://, s3://, https:// all work (same pattern as `gemini_generate_video`).
- **Output upload via storage provider registry** — fal.ai returns a `video_url` (their CDN); the tool downloads that and writes to `output` via `getProvider(output).write()`. Same pattern as Veo.

### Unified image tool: `fal_generate_image`

Same pattern, different verb:

```typescript
fal_generate_image({
  model: string,              // "fal-ai/flux/dev", "fal-ai/seedream-4", etc.
  prompt: string,
  output: string,
  image?: string,             // optional reference image for image-to-image
  aspect_ratio?: string,
  num_images?: number,        // some models return N images
  extra_params?: Record<string, unknown>,
})
```

### Safety classifier tool: `fal_classify_text`

Narrow purpose, narrow tool. Qwen 3 Guard 8B returns a structured classification; we surface it as-is.

```typescript
fal_classify_text({
  text: string,
  model?: string,             // defaults to "fal-ai/qwen-3-guard"
  categories?: string[],      // optional — restrict to subset of Guard categories
})
// Returns: { safe: boolean, categories: Array<{name, confidence}>, raw: unknown }
```

This is consumed pipeline-side by `content_vet` — the pipeline replaces (or pre-filters) its current LLM-driven classification with a call to this.

### Prompt-guide tools (optional, later)

Artificer already ships `veo_video_prompt_guide` as a tool that returns prose documentation the caller can include in its own prompt. If we want the same for Wan / Kling on fal.ai, add:

```
src/guides/wan.ts      → wan_video_prompt_guide
src/guides/kling.ts    → kling_video_prompt_guide
```

Not required for v1 — the pipeline-side prompt builders can inline the guidance. Add only if external callers (not `social-content-pipeline`) start hitting the fal tool surface.

## Auth & configuration

Environment variables (new):

- `FAL_KEY` — fal.ai API key. Required for all `fal_*` tools. Tool calls return a clear error when unset (same pattern as `GOOGLE_API_KEY` for Veo).
- `ARTIFICER_FAL_VIDEO_MODEL` — optional default model for `fal_generate_video`. Useful for setting a project-wide default (e.g., `fal-ai/wan/v2.7/image-to-video`) so the pipeline can omit the `model` param in common cases.
- `ARTIFICER_FAL_IMAGE_MODEL` — same, for `fal_generate_image`.

No secret-manager integration needed for v1 — the existing Veo integration reads plaintext env vars too.

## Client implementation

Use the official `@fal-ai/client` npm package (JavaScript SDK). Reasons:

1. Handles fal.ai's queue-based long-running API (subscribe polling) out of the box.
2. Supports both sync `fal.run` and async `fal.subscribe` patterns.
3. Well-maintained, typed, already used by most production deployments.
4. Works in Node.js and edge runtimes.

Alternative: direct REST with our own polling loop. Rejected — the SDK is small (~30KB) and saves us implementing polling + retry semantics that already exist in the Veo integration.

Client factory: `src/generation/fal/client.ts`

```typescript
import { fal } from '@fal-ai/client';

let configured = false;
export function getFalClient() {
  if (!configured) {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error('FAL_KEY env var is not set.');
    fal.config({ credentials: key });
    configured = true;
  }
  return fal;
}
```

Polling: use `fal.subscribe()` which handles the queue internally. For long-running video generations, surface progress via MCP's status logs (same pattern as `gemini_generate_video`'s poll loop).

## Implementation steps (ordered)

### Phase 1 — Wan 2.7 video-only proof of concept

1. Add `@fal-ai/client` to `package.json`.
2. Create `src/generation/fal/client.ts` with the factory above.
3. Create `src/generation/fal/types.ts` with Zod schemas for `fal_generate_video` input.
4. Create `src/generation/fal/video.ts` with the tool implementation:
   - Resolve `image` via `resolveInput()`.
   - Build fal.ai payload (model-agnostic keys: prompt, image_url, audio_url, duration, aspect_ratio + merge `extra_params`).
   - Call `fal.subscribe(model, { input, logs: true })`.
   - Download returned `video_url` to `output` via storage provider.
   - Return `{ uri: output }`.
5. Wire registration in `src/generation/fal/index.ts` → `src/generation/index.ts` → `src/index.ts`.
6. Unit test: mock the fal client, assert payload shape + output write.
7. Integration smoke test (manual, burns ~$0.60): run one 6s Wan 2.7 I2V with Jenn's avatar against `gs://doughmetrics-content/experiments/fal-smoke/` bucket. Confirm output file exists + plays + has lip-sync.

### Phase 2 — Safety classifier

1. Create `src/generation/fal/safety.ts` with `fal_classify_text`.
2. Unit test against a canned harmful-vs-safe input pair with the client mocked.
3. Integration smoke: classify 3 hand-chosen phrases and verify the classification.

### Phase 3 — Image generation

1. Create `src/generation/fal/image.ts` with `fal_generate_image`.
2. Unit + integration smoke against Flux or Seedream.

### Phase 4 — Audio-driven lip-sync validation (optional, gated on pipeline-side readiness)

Real-world A/B test: generate Jenn's hook chunk via:

- Current Veo 3.1 Lite (baseline at `gs://doughmetrics-content/pieces/recYuEvCmaikjErbS/chunks/hook.mp4`)
- Wan 2.7 audio-driven, with TTS audio authored to include 1s tail silence

Compare: lip-sync accuracy, character consistency against reference, and whether tail silence is preserved in the output (which would close the silence experiment as "solved by architecture").

Pipeline-side changes for this phase happen in `social-content-pipeline` — out of scope here.

## Budget / cost controls

- **Smoke-test budget**: ~$5 total across phases 1-3. Each phase's integration smoke is a single generation (<$1).
- **Runaway protection**: the tool accepts `poll_timeout_seconds` with a default of 300s (5min). Matches `gemini_generate_video`. Prevents indefinite billing during a fal.ai outage.
- **No retry-on-failure at the tool level.** Let the caller decide retry policy. Retrying a $3 Wan generation silently because of a transient network blip is bad. Same design choice as `gemini_generate_video`.

## Testing approach

- **Unit tests** (Vitest): mock `@fal-ai/client` at the module boundary. Assert payload shape, output path, error handling on missing env, error handling on fal 4xx/5xx.
- **Integration tests** (gated by `INTEGRATION=1` env, like existing ffmpeg tests): one smoke test per phase that actually hits fal.ai. CI runs these on a weekly schedule against a dedicated `FAL_KEY` with spend caps set.
- **No need for a mock server.** fal.ai's SDK is thin enough that direct module-level mocks give the same confidence.

## Rollout plan

1. Land phase 1 (video-only), tag release, update `docs/video-gen.md` to mention the dual-provider split.
2. Pipeline-side session: add `PIPELINE_VIDEO_PROVIDER=veo|fal` env flag + handler-level dispatch. Default stays `veo` to avoid regression. Ship as an opt-in.
3. Run one real talking-head piece end-to-end via `fal` provider. Review output against the Veo equivalent (`recYuEvCmaikjErbS`).
4. If quality holds: flip the default to `fal` for new `artificer_talking_head` pieces. Leave `full_veo` on Veo until separately validated.
5. Land phase 2 (safety) + integrate into `content_vet`.
6. Land phase 3 (image) if/when a use case emerges (e.g., blog cover images, carousel slide backgrounds).

## Open questions (to resolve during implementation)

1. **Does fal.ai's queue API handle concurrency well for parallel chunks?** The pipeline dispatches 2-5 Veo calls per talking-head piece, sometimes in parallel. Verify `fal.subscribe` doesn't serialize them and that fal's per-key rate limits are reasonable at 5-10 concurrent generations.
2. **What's the audio URL format for Wan 2.7?** Public HTTPS, signed GCS, or upload-to-fal? Check during phase 1 smoke. If only public HTTPS, we'll need pipeline-side logic to produce a signed / public URL for each TTS output.
3. **Do fal-hosted models return consistent output URLs (signed, short TTL) or permanent CDN URLs?** Affects download timing — if signed with a short TTL, we must download before handing off to subsequent steps.
4. **How does fal.ai bill partial failures?** If a 30s Wan clip fails at 80%, do we pay for 24s or 0s? Worth knowing before we spike.
5. **Is `fal-ai/qwen-3-guard` the production-stable id, or is there a versioned path?** Some fal models use `fal-ai/<name>/<version>` while others use bare names — verify during phase 2.

## Decisions log

**2026-04-23 — Pick fal.ai over Replicate, Atlas Cloud, WaveSpeed.** Rationale: unified JSON schema across all models (vs Replicate's per-container custom schemas), market leader stability (44% video API share, well-funded, no acquisition noise), transparent per-second pricing, and Qwen 3 Guard 8B as a first-class safety classifier that's a good fit for `content_vet`. Replicate (now joining Cloudflare) is viable long-term but each model has bespoke params → ongoing integration overhead we want to avoid. Atlas Cloud has competitive pricing but smaller catalog and survival risk.

**2026-04-23 — Keep per-model prompt builders in the pipeline, not in artificer.** Rationale: prompt engineering is a pipeline concern (content-aware), not a transport concern. Artificer stays a thin, provider-agnostic layer. Pipeline-side prompt builders are ~20-40 lines each, added per model only when a use case needs them.

**2026-04-23 — Do NOT proxy OpenRouter LLM calls through artificer.** Rationale: `social-content-pipeline` already has a Vercel AI SDK integration for direct-to-provider LLM calls (Gemini, Claude). Routing those through artificer → fal.ai → OpenRouter → model adds 2 hops of latency for zero benefit. Artificer's fal surface is media + safety classifier only.

---

*When phases 1-3 land and the pattern stabilizes, move the relevant sections into `docs/adr/005-fal-provider-integration.md` as a proper architecture decision record and delete this plan file. Follow the convention in `docs/adr/001-*.md`.*

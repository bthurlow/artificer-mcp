# fal.ai Q1 Research — Architectural Screen

**Date:** 2026-04-23
**Purpose:** Phase 0 Q1 of `docs/plans/fal-ai-integration.md` — docs-only screen of fal.ai's video model catalog to identify which models truly decouple audio (accept `audio_url` input, do not synthesize audio). Gates the Phase 0 Q2 bake-off and the Phase 1 build.
**Status:** Complete. Q2 bake-off candidates identified.

## Key finding

Kling Pro's flagship image-to-video models (`v2.6/pro`, `v3/pro`, `v3/standard`) **synthesize audio natively** — same architectural class as Veo 3.1 — and therefore fail the architectural test. Their longer output duration (up to 15s+) and competitive per-second pricing are not relevant to the silence problem.

Kling does, however, expose a separate **avatar-specific** endpoint (`fal-ai/kling-video/ai-avatar/v2/pro`) that accepts `audio_url` and drives lip-sync from supplied audio. That model, not Kling Pro I2V, is the correct Kling-family candidate for this use case.

Three models pass the architectural test and go to Q2.

## Shortlist — passes architectural test (audio decoupled + image-to-video)

| Model | $/sec | Max video duration | Audio input | Notes | Source |
|-------|-------|---------------------|-------------|-------|--------|
| `fal-ai/wan/v2.7/image-to-video` | $0.10 | 2–15s | 2–30s, ≤15 MB, WAV/MP3 | Plan's primary candidate, confirmed | https://fal.ai/models/fal-ai/wan/v2.7/image-to-video |
| `fal-ai/kling-video/ai-avatar/v2/pro` | $0.115 | scales to audio length (no numeric cap documented) | MP3/OGG/WAV/M4A/AAC | Purpose-built avatar lip-sync | https://fal.ai/models/fal-ai/kling-video/ai-avatar/v2/pro |
| `veed/fabric-1.0` | $0.08 (480p) / $0.15 (720p) | TBD | MP3/OGG/WAV/M4A/AAC | Dual-input image+audio, waveform-driven | https://fal.ai/models/veed/fabric-1.0 |

## Fails the architectural test — synthesizes audio or wrong input shape

| Model | Why it fails | Source |
|-------|--------------|--------|
| `fal-ai/kling-video/v2.6/pro/image-to-video` | Synthesizes audio via `generate_audio`, `voice_ids`, in-prompt dialogue. No `audio_url`. | https://fal.ai/models/fal-ai/kling-video/v2.6/pro/image-to-video |
| `fal-ai/kling-video/v3/pro/image-to-video` | Native audio synthesis. No `audio_url`. | https://fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video |
| `fal-ai/kling-video/v3/standard/image-to-video` | Same synthesis family as v3/pro. | https://fal.ai/models/fal-ai/kling-video/v3/standard/image-to-video |
| `fal-ai/veo3.1/image-to-video` | Native audio synthesis (dialogue + lip-sync generated, not supplied). Same silence problem as direct-Google Veo. | https://fal.ai/models/fal-ai/veo3.1 |
| `fal-ai/kling-video/lipsync/audio-to-video` | Audio-decoupled, but video-to-video (requires an existing video clip, not an image). Potential post-processing chain, not an I2V candidate. | https://fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video |

## Models requiring direct API test before inclusion or exclusion

| Model | Unknown | Source |
|-------|---------|--------|
| `fal-ai/minimax/hailuo-2.3/pro/image-to-video` | Landing page lists flat $0.49/video but does not document audio capability. Schema pull needed. | https://fal.ai/models/fal-ai/minimax/hailuo-2.3/pro/image-to-video |
| `fal-ai/minimax/video-01/image-to-video` | Has `audio_url` per search snippet, but purpose (voice cloning vs driving lip-sync) unclear. | https://fal.ai/models/fal-ai/minimax/video-01/image-to-video/api |
| `fal-ai/kling-video/v2.1/standard/image-to-video` | Likely synth-only, unconfirmed. | https://fal.ai/models/fal-ai/kling-video/v2.1/standard/image-to-video/api |

## Post-processing lipsync options (V2V, not I2V — for future chaining)

`fal-ai/sync-lipsync/v2`, `fal-ai/sync-lipsync/v3`, `fal-ai/sync-lipsync/v2/pro`, `fal-ai/latentsync`, `fal-ai/musetalk`, `veed/lipsync`. All take `video_url` + `audio_url`. Worth knowing about for a "good motion, bad lip-sync" fallback chain; not in scope for Phase 1.

## Load-bearing infra findings

### Concurrency

- `fal.subscribe` from a single `FAL_KEY` dispatches **in parallel**, not serialized. SDK does not queue locally; fal's server-side queue does.
- New-account default: **2 concurrent**. Auto-scales with paid invoices over last 4 weeks. Self-serve ceiling: **40 concurrent**. Higher via sales.
- Queued requests (`IN_QUEUE`) do not count against the concurrency ceiling. Slots dispatch as others complete.
- Pipeline's 2–5 parallel dispatch fits comfortably within defaults; no local throttling required.
- Source: https://fal.ai/docs/documentation/model-apis/concurrency-limits

### Output URL TTL

- Outputs land on public fal CDN (e.g. `v3b.fal.media/files/...`).
- Default retention: **at least 7 days**.
- Per-request override via `X-Fal-Object-Lifecycle-Preference` header; account-level default also configurable.
- URLs are public, no signature, no auth — any code with the URL can fetch for the retention window.
- Does not vary by model by default.
- **Implication:** download-to-output timing is not time-critical inside the tool. We can safely return the fal URL as an intermediate if ever useful, but for storage-provider compatibility the design still downloads and rewrites via `getProvider(output).write()`.
- Source: https://fal.ai/docs/faq , https://fal.ai/docs/documentation/model-apis/fal-cdn

### `fal.storage.upload` (JS client)

- Signature: `upload(file: Blob, options?: UploadOptions): Promise<string>`.
- Accepts `Blob` (File extends Blob). Node.js callers must wrap `Buffer` in a `Blob` (`new Blob([buffer])`). Raw Buffer, stream, and file path are **not documented** as accepted inputs.
- Returns the uploaded file's URL as a string.
- `UploadOptions.lifecycle.expiresIn` lets callers set custom TTL; enumerated values not documented. Default TTL for uploads is **not documented**; open issue (fal-js #134) was not answered.
- **Implication:** the resolve-then-upload path in Phase 1 converts `Buffer` → `Blob` before calling `upload`. No stream support means large images buffer fully in memory (a few MB is fine; multi-hundred-MB would be a problem but is unrealistic for I2V inputs).
- Source: https://fal.ai/docs/reference/client-libraries/javascript/storage , https://github.com/fal-ai/fal-js/issues/134

### `fal.subscribe` timeout

- Native `timeout` parameter (JS, milliseconds). Python equivalent: `client_timeout` (seconds).
- Covers the total deadline: queue wait + processing.
- Raises on exceed. Server may continue processing after client timeout.
- Separate `start_timeout` limits pre-processing queue wait; SDK mirrors `client_timeout` → `start_timeout` when unset.
- **Implication:** `poll_timeout_seconds` tool param maps directly to `timeout` (after unit conversion). No `Promise.race` wrapper needed.
- Source: https://docs.fal.ai/model-apis/model-endpoints/queue , https://fal-ai.github.io/fal-js/reference

### Qwen 3 Guard model ID

- Stable ID: **`fal-ai/qwen-3-guard`**. No version suffix or `-8b` qualifier on the endpoint — the "[8B]" in the model title is a size label, not part of the ID.
- Input: `prompt` (string).
- Output: `{ label: string (e.g. "Unsafe"), categories: string[] (e.g. ["Violent"]) }`.
- Pricing: $0.002 per 1K tokens.
- Source: https://fal.ai/models/fal-ai/qwen-3-guard

### Partial-failure billing

- Server errors (HTTP 5xx / runner infra failure): **not billed**.
- Client errors (HTTP 4xx, e.g. 422 invalid input): **may still be billed** if a runner spent GPU time before the error was detected.
- Docs do not explicitly describe mid-run runtime failure (e.g. a 30s video render failing at 80%). Classification is unclear.
- Credits are non-refundable per ToS.
- **Unresolved — needs direct API test.** A deliberate-failure smoke (e.g. pass an invalid audio URL mid-payload, or force a model-capability mismatch) during Phase 1 would resolve the worst-case cost question before production dispatch.
- Source: https://fal.ai/docs/faq , https://fal.ai/terms

## Q2 bake-off plan (next)

Three candidate models against Jenn's reference avatar and a 10s TTS track with 1s tail silence baked in.

Budget estimate (10s generations):
- `fal-ai/wan/v2.7/image-to-video`: ~$1.00
- `fal-ai/kling-video/ai-avatar/v2/pro`: ~$1.15
- `veed/fabric-1.0` (480p): ~$0.80
- **Total: ~$2.95** — well under the $5 cap.

Rubric (unchanged from design doc): lip-sync accuracy, character consistency, tail-silence preservation (the killer test), cost-per-finished-second.

Exit artifact: `docs/plans/fal-bakeoff-2026-04-23.md` with per-model outputs, rubric scores, default-model decision, and fallback order.

## Unresolved from Q1 — flagged for Phase 1 direct tests

1. Does Wan 2.7's `audio_url` accept arbitrary signed HTTPS URLs (signed GCS/S3) directly, or must the audio be uploaded via `fal.storage.upload` first? Design defaults to upload-if-not-HTTPS-public until proven otherwise.
2. Mid-run failure billing classification — server error (free) or client error (charged for partial GPU time)? A deliberate-failure smoke in Phase 1 resolves this.
3. Default TTL for files uploaded via `fal.storage.upload` — documented for outputs (≥7d CDN), not documented for user uploads. Open GH issue #134 unanswered.
4. Max duration for `fal-ai/kling-video/ai-avatar/v2/pro` — "scales to audio length" per docs but no numeric cap stated. Q2 bake-off can probe with a longer track.
5. `fal.storage.upload` behavior on Node `Buffer` / `ReadableStream` / file-path inputs — only `Blob` is documented. Verify the Blob-wrapping path works for multi-MB images before committing to it in Phase 1.

## Sources

- https://fal.ai/models/fal-ai/wan/v2.7/image-to-video
- https://fal.ai/models/fal-ai/wan/v2.7/image-to-video/api
- https://fal.ai/models/fal-ai/kling-video/ai-avatar/v2/pro
- https://fal.ai/models/fal-ai/kling-video/v2.6/pro/image-to-video
- https://fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video
- https://fal.ai/models/fal-ai/kling-video/v3/standard/image-to-video
- https://fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video
- https://fal.ai/models/fal-ai/veo3.1
- https://fal.ai/models/veed/fabric-1.0
- https://fal.ai/models/fal-ai/qwen-3-guard
- https://fal.ai/docs/documentation/model-apis/concurrency-limits
- https://fal.ai/docs/documentation/model-apis/fal-cdn
- https://fal.ai/docs/reference/client-libraries/javascript/storage
- https://fal.ai/docs/faq
- https://fal.ai/terms
- https://docs.fal.ai/model-apis/model-endpoints/queue
- https://fal-ai.github.io/fal-js/reference
- https://github.com/fal-ai/fal-js/issues/134

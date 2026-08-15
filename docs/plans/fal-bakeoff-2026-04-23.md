# fal.ai Q2 Bake-off — Talking-Head Class

**Date:** 2026-04-23 (final update 2026-04-24 after Wan 2.7 successful runs)
**Purpose:** Phase 0 Q2 of the artificer multi-provider media generation plan. Architecture screen (Q1) completed in `fal-q1-research-2026-04-23.md`; this doc captures the empirical quality + cost comparison across the three architecturally-valid talking-head candidates and records the Phase 1 default.
**Scope:** Talking-head sub-class (avatar image + TTS audio → lip-synced video) only. Cinematic-video class requires its own separate bake-off when a pipeline use case surfaces.
**Status:** COMPLETE — all three candidates tested. Wan 2.7 initially misdiagnosed as a "dispatch issue" before root-causing to a runner-timeout at default 1080p; subsequent runs at explicit 720p succeeded. Final default revised on 2026-04-24 after the successful full-audio Wan run.

## Test conditions

| Input | Value |
|-------|-------|
| Avatar image | `https://storage.googleapis.com/doughmetrics-content/references/jenn-avatar/jenn-talking-head.jpg` (9:16) |
| Audio track | `https://storage.googleapis.com/doughmetrics-content/experiments/fal-bakeoff/bakeoff-input.mp3` |
| Audio construction | Full `recYuEvCmaikjErbS/_build/audio_0.m4a` (5.76s of real TTS) + 1s silence tail appended via `ffmpeg apad=pad_dur=1`, exported MP3 44.1kHz stereo 128kbps |
| Audio total duration | 6.76s |
| Prompt | "A woman speaking directly to camera, natural lighting, head and shoulders, steady frame." |
| Target duration | 7s (enough to cover full audio + minor margin) |

Audio built purposefully to test the **silence-preservation rubric item** — 1s of tail silence should render as 1s of closed-mouth video, not model-synthesized speech.

## Results — all candidates

| Model | Status | Wall time | Cost | Resolution | Output duration | Output file |
|-------|--------|-----------|------|------------|------------------|-------------|
| `fal-ai/kling-video/ai-avatar/v2/pro` | OK | 191s | $0.805 | 1072×1920 (1080p-class) @ 30fps | 7.20s (+0.44s over audio) | `out/bakeoff-20260423-183713/kling-avatar/output.mp4` |
| `veed/fabric-1.0` | OK | 51s | $0.560 | 480×864 (480p) @ 25fps | 6.76s (exact audio match) | `out/bakeoff-20260423-183713/veed-fabric/output.mp4` |
| `fal-ai/wan/v2.7/image-to-video` (720p, duration=5) | OK — but TRUNCATED | 63s | $0.500 | 716×1284 (720p tier) @ 30fps | 5.04s (cuts audio short) | `out/bakeoff-20260423-183713/wan-2.7-final/output.mp4` |
| `fal-ai/wan/v2.7/image-to-video` (720p, duration=7) | **OK — full audio** | ~8s (warm runner) | $0.700 | 716×1284 (720p tier) @ 30fps | 7.04s (covers full audio) | `out/bakeoff-20260423-183713/wan-2.7-full-audio/output.mp4` |

**Total spend:** $2.57 (well under the $5 budget cap). Failed runs — 504 generation_timeout and 422 invalid input — not meaningfully billed (server-side 504 is fal's "not billed" policy; 422 was 80ms of inference).

## Rubric scores

Reviewed manually against the four completed clips (two Wan runs + Kling + veed):

| Criterion | Kling AI Avatar v2 Pro | veed/fabric-1.0 | Wan 2.7 (duration=7, 720p) |
|-----------|------------------------|------------------|-------------------------------|
| Lip-sync accuracy (mouth tracks phonemes >90%) | ✅ | ✅ | ✅ |
| Character consistency (no drift frame 0 → last) | ✅ | ✅ | ✅ |
| Tail silence preservation (killer test) | ✅ | ✅ | ✅ (full audio covered by duration=7) |
| Duration fidelity | Padded +0.44s (auto-match) | Exact match (auto-match) | Capped by `duration` param (manual) |
| Cost-per-finished-second | $0.112/s actual | $0.083/s actual | $0.099/s actual |

**Reviewer verdict (user, 2026-04-23):** Kling and veed visually indistinguishable on the talking-head use case.
**Reviewer verdict (user, 2026-04-24):** Wan 2.7 at duration=7 / 720p is "solid, very good" — quality parity with Kling on this input.

## Decision (revised 2026-04-24)

**Default talking-head model:** `fal-ai/wan/v2.7/image-to-video` at `resolution: "720p"` with caller-supplied integer `duration`.
**Fallback (high-resolution path):** `fal-ai/kling-video/ai-avatar/v2/pro` — when native 1080p output is required or when auto-match-audio ergonomics matter more than speed/cost.
**Third option (fast-preview / disaster-recovery):** `veed/fabric-1.0` at 480p.

**Note:** artificer does not carry a server-side default env var for this choice per the current design direction (transport is agnostic; caller passes `model` explicitly). The "default" in this doc is a *documentation* default — what the prompt guide and catalog recommend for the talking-head use case when the caller has no stronger opinion.

### Rationale for revision

The initial 2026-04-23 decision (Kling default) was made on only two completed runs because Wan 2.7 hit `generation_timeout` at default 1080p. After root-causing and retrying with the correct parameter shape (`resolution: "720p"`, integer `duration`), Wan produced output that passed the rubric at quality parity with Kling.

Wan then dominates on operational factors:

| Factor | Wan 2.7 (720p) | Kling AI Avatar v2 Pro | Advantage |
|--------|-----------------|--------------------------|-----------|
| Wall time (warm) | ~8s | ~191s | Wan ~25× |
| Wall time (cold) | ~63s | ~191s | Wan ~3× |
| Cost per second | $0.10 | $0.115 | Wan 13% cheaper |
| Resolution | 716×1284 | 1072×1920 | Kling ~1.5× pixels |
| Audio-length handling | Caller passes `Math.ceil(audio_seconds)` as `duration` | Auto-matches | Kling ergonomic |
| Vendor stability | Alibaba (Wan) | Kuaishou (Kling) | Parity |
| Delivery-spec fit (9:16 reels) | 720p acceptable for most Instagram/TikTok consumption | 1080p ideal but compression on upload often matches delivered quality | Close |

Wall-time dominates for batch workloads. A 5-clip reel at 7s/clip:
- Wan default: ~40s total (warm, parallel) / ~60s (cold, parallel)
- Kling fallback: ~200s (parallel) / ~950s (serial)

Cost compounds the other way — Wan saves ~13% per clip of rendered second.

### Why Kling stays in the catalog

- Native 1080p output. When the delivery target *specifically* demands 1080p with no upscale, Kling is the clean path.
- Auto-match-audio is ergonomic. For ad-hoc callers who don't want to probe audio length, Kling has zero coordination burden.
- Vendor independence. Wan had a documented failure mode (1080p generation_timeout) today; Kling's record is clean. Keeping Kling as the documented fallback protects against Wan-specific runner issues.

### Why veed/fabric stays in the catalog

- Fast-preview path. 51s wall, 480p, $0.560 for 7s. Useful for iterative render checks before committing the production run.
- Exact duration match (6.76s in → 6.76s out) — if downstream processing assumes exact-length outputs, veed is the cleanest.
- Independent vendor (veed != Kling != Alibaba) — disaster-recovery if fal's Kling or Wan routes go down simultaneously.

## Wan 2.7 runner characteristics

### Resolved behavior (after full investigation)

1. **Must use `resolution: "720p"` explicitly.** Default `"1080p"` audio-driven mode exceeds fal's generation budget (documented 2723s of inference before `generation_timeout`). Schema allows 1080p as a value, but the fal-hosted runner can't complete within its own timeout window on this account tier.
2. **`duration` is integer-only, caps output length.** Wan does NOT auto-match to audio_url duration. Caller must pass `duration: Math.ceil(audio_seconds)` or the output will truncate. Observed with `duration: 5` against 6.76s audio — last ~1.76s of audio (including the silence tail) was never animated.
3. **Wall-time variance is real.** First successful run at 63s, second at ~8s. Warm runner (GPU pool recently used) is dramatically faster than cold. Production pipelines should expect the 63s ballpark as the pessimistic case.
4. **Server-side failures unbilled.** 504 generation_timeout after 2723s of GPU time was not billed per fal's stated policy. Client-side 422 (invalid `duration` as string) was 80ms of validation time, negligible regardless.

### Historical investigation timeline

| Attempt | Parameters | Outcome |
|---------|-----------|---------|
| `019dbc7d-*` (parallel, first bake-off) | `duration: 7`, `resolution: 1080p` (defaulted) | 504 `generation_timeout` after 2723s of inference |
| `019dbca2-*` (retry) | `duration: 7`, `resolution: 1080p` (defaulted) | Cancelled manually before dispatch |
| `019dbcac-*` (third test) | `duration: "5"` (string!), `resolution: 720p` | 422 `literal_error` — `duration` must be integer |
| `019dbfc5-*` (corrected) | `duration: 5` (int), `resolution: 720p` | **OK** in 63s — but truncated audio at 5s |
| `019dbfd0-*` (final) | `duration: 7` (int), `resolution: 720p` | **OK** in ~8s (warm runner) — full audio preserved |

Initial framing of the Wan failures as a "fal dispatch issue" turned out to be wrong. Dispatch worked fine. The runner was actively processing (2723s of inference time on the 504). The fix was parameter shape + resolution, not fal-side intervention. No support ticket needed.

## Q1 load-bearing questions — status after Q2

| Question | Answer |
|----------|---------|
| Does public GCS HTTPS work as an input URL format? | **Yes.** All three models fetched `storage.googleapis.com/...` URLs without upload-to-fal. Confirmed for Kling, veed, and Wan. Skip the upload step in Phase 1 whenever inputs are public HTTPS. |
| Does queue concurrency hold for parallel submissions on a single key? | **Yes.** Three parallel submissions in the initial bake-off all got accepted simultaneously. Kling + veed dispatched and completed concurrently. |
| Does MP3 audio with tail silence preserve as silence in lip-sync output? | **Yes.** All three models rendered the silent tail as closed-mouth video (when duration covered the tail). Architectural premise confirmed: audio-decoupled models solve the silence problem by construction. |
| Partial-failure billing | **Server errors (5xx) unbilled; client errors (4xx) billed only for inference time spent.** Observed: 504 after 2723s of GPU = not billed; 422 after 80ms = negligible. Fal's stated policy holds empirically. No need for an additional deliberate-failure probe in Phase 1. |

## Carry-forward to Phase 1

1. **Default talking-head model recommendation** documented here. Catalog seed in Phase 2 lists Wan first, Kling second, veed third for `video.talking_head`.
2. **Wan 2.7 prompt guide** (Phase 2 deliverable) must include two prominent quirks:
   - `resolution: "720p"` is mandatory for audio-driven mode (1080p will generation_timeout)
   - `duration` must be integer, and should be `Math.ceil(audio_seconds)` to cover the full audio without truncation
3. **Kling AI Avatar v2 Pro prompt guide** (Phase 2 deliverable) documents the auto-match-audio behavior and the 1080p default — clear trade-off articulation so callers pick correctly.
4. **HTTPS passthrough confirmed for GCS public objects.** Phase 1's `resolve-then-upload` flow only needs to activate for non-public inputs. Real win over the worst-case default.
5. **Audio-probe helper (optional Phase 1 enhancement, not blocking):** if the `fal_generate_video` caller passes `audio` but omits `duration_seconds`, the tool *could* ffprobe the audio and derive a safe duration for Wan-class models. Ruled OUT for Phase 1 MVP per the design doc's "no hidden behavior" stance — the pipeline already knows its audio lengths. Revisit only if Wan truncations show up in production caller logs.

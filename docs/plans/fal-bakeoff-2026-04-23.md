# fal.ai Q2 Bake-off — Talking-Head Class

**Date:** 2026-04-23
**Purpose:** Phase 0 Q2 of the artificer multi-provider media generation plan. Architecture screen (Q1) completed in `fal-q1-research-2026-04-23.md`; this doc captures the empirical quality + cost comparison across the three architecturally-valid talking-head candidates and records the Phase 1 default.
**Scope:** Class 1 (talking-head: avatar image + TTS audio → lip-synced video) only. Class 2 (full generation / cinematic) requires its own separate bake-off when a pipeline use case surfaces.
**Status:** Partial — 2 of 3 candidates completed. Wan 2.7 submission accepted by fal but did not dispatch to our account (see "Wan 2.7 dispatch issue" below). Decision reached on the two completed runs; Wan left queued for later.

## Test conditions

| Input | Value |
|-------|-------|
| Avatar image | `https://storage.googleapis.com/doughmetrics-content/references/jenn-avatar/jenn-talking-head.jpg` (9:16) |
| Audio track | `https://storage.googleapis.com/doughmetrics-content/experiments/fal-bakeoff/bakeoff-input.mp3` |
| Audio construction | Full `recYuEvCmaikjErbS/_build/audio_0.m4a` (5.76s of real TTS) + 1s silence tail appended via `ffmpeg apad=pad_dur=1`, exported MP3 44.1kHz stereo 128kbps |
| Audio total duration | 6.76s |
| Prompt | "A woman speaking directly to camera, natural lighting, head and shoulders, steady frame." |
| Duration requested | 7s |

Audio built purposefully to test the **silence-preservation rubric item** — 1s of tail silence should render as 1s of closed-mouth video, not model-synthesized speech.

## Results

| Model | Status | Wall time | Cost | Resolution | Output duration | Output |
|-------|--------|-----------|------|------------|------------------|--------|
| `fal-ai/kling-video/ai-avatar/v2/pro` | OK | 191s | $0.805 | 1072×1920 (9:16, 1080p-class) @ 30fps | 7.20s | `out/bakeoff-20260423-183713/kling-avatar/output.mp4` |
| `veed/fabric-1.0` | OK | 51s | $0.560 | 480×864 (9:16, 480p) @ 25fps | 6.76s (exact input match) | `out/bakeoff-20260423-183713/veed-fabric/output.mp4` |
| `fal-ai/wan/v2.7/image-to-video` | PENDING (fal dispatch issue) | — | $0 so far | — | — | — |

**Total confirmed spend:** $1.37 (well under the $5 budget cap).

## Rubric scores

Reviewed manually against the two completed clips:

| Criterion | Kling AI Avatar v2 Pro | veed/fabric-1.0 | Notes |
|-----------|------------------------|------------------|-------|
| Lip-sync accuracy (mouth tracks phonemes >90%) | ✅ | ✅ | Indistinguishable on this avatar + prompt |
| Character consistency (no drift frame 0 → last) | ✅ | ✅ | Both held the reference |
| Tail silence preservation (killer test) | ✅ | ✅ | Both preserved — 1s closed-mouth tail, no invented speech |
| Cost-per-finished-second | $0.112/s actual | $0.083/s actual | veed ~26% cheaper at tested resolution |

**Reviewer verdict (user, 2026-04-23):** outputs visually indistinguishable for the talking-head use case.

## Decision

**Default talking-head model (Phase 1):** `fal-ai/kling-video/ai-avatar/v2/pro`
**Fallback talking-head model:** `veed/fabric-1.0`

**Note:** artificer does not carry a server-side default env var for this choice per the current design direction (transport is agnostic; caller passes `model` explicitly). The "default" in this doc is a *documentation* default — what the prompt guide and catalog recommend for the talking-head use case when the caller has no stronger opinion.

### Rationale

Rubric functional criteria pass for both candidates with indistinguishable visual results. Decision collapses to non-visual factors:

1. **Resolution headroom.** Kling Avatar outputs 1072×1920 natively. veed/fabric would need to run at 720p ($0.15/s) to approach the same resolution tier, which is *more expensive* than Kling Avatar ($0.115/s) for the comparable output. At 480p veed is cheaper, but 480p is likely below production delivery spec for Instagram/TikTok reels.
2. **Vendor stability.** Kuaishou (Kling) is a large, well-capitalized vendor with a durable multi-model video ecosystem. VEED is a smaller player; `veed/fabric-1.0` carries higher deprecation / pricing-change risk.
3. **Purpose fit.** `kling-video/ai-avatar/v2/pro` is purpose-built for avatar lip-sync as its primary use case. veed/fabric is a more general audio-driven I2V model — works for this use case but isn't specifically optimized for it.
4. **Speed vs quality trade.** veed/fabric finished in 51s vs Kling's 191s — 4× faster. Useful for draft/preview renders or high-volume batches. Keep as the explicit fallback/fast-preview path.

### Fallback / alternate-path usage

veed/fabric-1.0 stays in the catalog because:
- 4× faster wall time — valuable for iterative preview renders before committing to production output
- 30% cheaper at 480p for low-priority content
- Independent vendor provides disaster-recovery if Kling Avatar has an outage or dispatch issue (exactly the kind of problem Wan 2.7 just exhibited)
- Exact duration match (6.76s in → 6.76s out) vs Kling's +0.44s padding — relevant if downstream pipeline assumes exact-length outputs

The pipeline / caller may route to veed/fabric explicitly by passing `model: "veed/fabric-1.0"` to `fal_generate_video`. Prompt guide (`veed_fabric_prompt_guide`) documents when this is appropriate.

## Wan 2.7 dispatch issue — root cause: generation timeout at default 1080p

Initial framing assumed an account-routing or dispatch-queue issue on fal's side. **Later inspection resolved this as a `generation_timeout` error on fal's Wan 2.7 runner when invoked at default resolution (1080p) with audio-driven mode.**

### Timeline

| Attempt | Queue position | Observation | Final state |
|---------|-----------------|-------------|-------------|
| Submission 1 (`019dbc7d-*`, parallel with Kling + veed, resolution defaulted to 1080p, duration 7s) | 0 → 0 for 40+ min | Dashboard eventually showed HTTP 504 | **COMPLETED with error** — `generation_timeout` after 2723.9s of inference time |
| Submission 2 (`019dbca2-*`, retry, duration=7 int, resolution defaulted to 1080p) | 163 → 163 for 5+ min | Cancelled before dispatch | Clean cancel, no data |
| Submission 3 (`019dbcac-*`, duration="5" string, **resolution="720p" explicit**) | 213 → 0 | **Pending** at time of writing; 720p path may actually complete | Unknown |

### Root cause (confirmed 2026-04-23 post-bake-off)

Querying `GET queue.fal.run/fal-ai/wan/requests/019dbc7d-.../` after the dashboard showed 504 returned the full error detail:

```
{
  "detail": [{
    "loc": ["body"],
    "msg": "Generation timeout",
    "type": "generation_timeout",
    "url": "https://docs.fal.ai/errors#generation_timeout",
    "input": {
      "prompt": "...",
      "image_url": "...",
      "audio_url": "...",
      "resolution": "1080p",
      "duration": 7,
      ...
    }
  }]
}
```

`metrics.inference_time: 2723.9` confirms the runner spent ~45 minutes of compute before fal's internal generation timeout killed it. Fal's Wan 2.7 runner cannot complete a 7-second audio-driven 1080p generation within its timeout budget on this account tier.

**Kling AI Avatar v2 Pro** (default 1080p-class output) and **veed/fabric-1.0** (explicit 480p in our call) did not hit this issue — their runners complete within fal's generation budget for similar inputs.

### Actionable findings

1. **Any artificer code that calls `fal-ai/wan/v2.7/image-to-video` in audio-driven mode MUST set `resolution: "720p"` explicitly.** The model schema's default of 1080p is not viable on fal's current runner. This is a Phase 1 implementation note (Wan's transport defaults) and a prompt-guide note (when Wan's guide lands).
2. **Partial-failure billing (Q1 unresolved item) has a partial answer:** fal's `generation_timeout` returns HTTP 504 (server error). Per fal's billing docs, server errors are not billed. A $272-worth-of-inference-time failure appears unbilled on this account. Confirm on dashboard.
3. **Submission 3 (`019dbcac-*`)** remains queued with explicit `resolution: "720p"`, `duration: 5`. If it completes, it's the first real Wan 2.7 data point. Compare against Kling Avatar and update the default-model decision only if Wan's output is dramatically better (unlikely to override the 191s vs probable 1000s+ wall-time gap).
4. **Not a Phase 1 blocker.** Talking-head default is Kling AI Avatar v2 Pro. Wan 2.7 stays as a catalog entry but with explicit notes in its future prompt guide about the 720p requirement and the extended wall-time expectation.

### Amended likely-cause ranking (superseded by the root cause above)

1. ~~Fal-specific Wan 2.7 capacity / dispatch routing issue on this account tier~~ — REJECTED
2. ~~Wan 2.7 model-family capacity outage~~ — REJECTED
3. ~~Account-scoped queue wedge~~ — REJECTED
4. **Confirmed:** fal Wan 2.7 runner generation timeout on default-1080p audio-driven inputs. Not an account issue. Not a dispatch issue. A per-request timeout on the model's own runner.

## Q1 load-bearing questions — status after Q2

| Question | Answer from Q2 data |
|----------|----------------------|
| Does public GCS HTTPS work as an input URL format? | Yes. Kling Avatar + veed/fabric both fetched the `storage.googleapis.com/...` URLs without upload-to-fal. One real data point, confirms the HTTPS passthrough path for Phase 1. |
| Does `fal.subscribe`-equivalent queue concurrency hold for 3 parallel submissions on a single key? | Yes — all 3 models accepted simultaneously, 2 dispatched and processed. The account's concurrency ceiling is >= 2. |
| Does MP3 audio with tail silence preserve as silence in lip-sync output? | **Yes** — this is the critical finding. Both Kling Avatar and veed/fabric rendered the silent tail as closed-mouth video. Confirms the architectural premise of the entire plan: audio-decoupled models solve the silence problem by construction. |
| Partial-failure billing on dispatch timeout / cancel | Partial data. Cancellations of queued jobs appear clean (`{"status":"OK"}` on PUT cancel). The "CANCELLATION_REQUESTED" response on submission 1 (at queue_position=0) suggests fal may have started some work before the cancel landed — check fal dashboard for any partial charge. Still worth a deliberate-failure probe in Phase 1. |

## Carry-forward to Phase 1

1. **Default talking-head recommendation documented here and in `kling_avatar_prompt_guide` when it lands.**
2. **Wan 2.7 dispatch issue** — monitor submission 3, file support ticket, retry from scratch in a future Phase 1 smoke if/when fal resolves.
3. **Deliberate-failure billing probe** still needed — remains as a Phase 1 task for the Wan retry.
4. **HTTPS passthrough confirmed for GCS public objects** — the design's "resolve-then-upload" flow only needs to kick in for non-public inputs. This is a real win vs the worst-case default assumption.

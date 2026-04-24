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

## Wan 2.7 dispatch issue (unresolved)

Wan 2.7 submissions were accepted by fal (HTTP 200/202, valid `request_id`, `IN_QUEUE` status) but did not dispatch to our account. Three data points:

| Attempt | Queue position | Observation |
|---------|-----------------|-------------|
| Submission 1 (parallel with Kling + veed) | 0 → 0 for 40+ min | Stuck at "next up" indefinitely, never dispatched |
| Submission 2 (retry, solo, duration=7 int) | 163 → 163 | Zero movement in 5+ min polling |
| Submission 3 (test, duration=5 string, 720p) | 213 → 213 | Zero movement in 60s polling; **left queued** for future completion |

Other fal models on the same account key (`kling-video/ai-avatar/v2/pro`, `veed/fabric-1.0`) dispatched and completed normally during this window. Not a key-level issue — specifically Wan 2.7 did not drain for us. User reported the fal dashboard does not show our Wan requests even though they were submitted successfully.

**Diagnosis:** fal-side issue, not a parameter problem. Params verified against the live schema at `https://fal.ai/models/fal-ai/wan/v2.7/image-to-video/api`; all required fields present, all types match. Submissions accepted.

**Likely causes (rank-ordered):**
1. Fal-specific Wan 2.7 capacity / dispatch routing issue on this account tier
2. Wan 2.7 model-family capacity outage at submission time (not reflected on status page)
3. Some account-scoped queue wedge — dashboard-invisibility supports this

**Action:**
- Submission 3 (request_id `019dbcac-80df-77a3-b94f-de167e38a8c2`) left queued. Check status at `https://queue.fal.run/fal-ai/wan/requests/019dbcac-80df-77a3-b94f-de167e38a8c2/status` periodically. If it eventually completes, compare against the other two and update this doc.
- File fal support ticket referencing the three stuck `019dbc7d-*`, `019dbca2-*`, `019dbcac-*` request IDs.
- Not a Phase 1 blocker. Talking-head default is Kling Avatar regardless of Wan's eventual result, unless Wan produces dramatically better output that changes the decision.

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

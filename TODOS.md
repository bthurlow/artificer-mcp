# Artificer TODOs

Deferred work with enough context that someone picking it up in 3 months knows what to do. Not a task tracker — a place to capture "we decided to not do this now, and here's why."

---

## 1. Evaluation harness generalization

**What:** Generalize `scripts/fal-bakeoff.mjs` (talking-head-specific today) into a reusable capability-agnostic harness.

**Why:** Today's script runs three candidate video models against a fixed avatar + audio fixture, produces a markdown summary, and scores against a talking-head-specific rubric. The pattern is reusable. Every time a new capability's bake-off is needed (image portrait vs landscape, music vs SFX, TTS vs ASR), we'd re-author ~300 lines of near-identical script.

**Pros:**
- Each new bake-off becomes a config file + run command, not a script-rewrite.
- Cross-capability rubrics (lip-sync accuracy, character consistency) can be reused.
- Output format stabilizes into something `/qa` and downstream tools can consume.

**Cons:**
- Abstraction tax up front. Script is small enough that rewriting takes ~1h; generalizing takes longer.
- Abstraction risk: over-generalizing before the second use case reveals what's actually variable.

**Context:**
- Current script location: `scripts/fal-bakeoff.mjs` (landed 2026-04-23 in commit 7beac7f).
- Shape: submit N models in parallel to fal's queue API, poll, download outputs, write summary markdown.
- Rubric today is talking-head-specific (lip-sync, character consistency, tail silence preservation). Any generalization needs to make rubrics pluggable.
- Design doc explicitly lists this as OUT of scope: `docs/plans/fal-multi-provider-design-2026-04-23.md` → "EXPLICITLY OUT" → "General-purpose evaluation harness. Today's `scripts/fal-bakeoff.mjs` is the MVP. Generalizing into a reusable capability-agnostic harness is a separate plan, not blocked by this one."

**Trigger to pick this up:** First time a non-talking-head bake-off is needed. Probably the cinematic-video class-2 bake-off (see Phase 4 trigger in the design doc).

**Depends on / blocked by:** Nothing. Can land independently of the multi-provider Phase 1-5 work.

---

## 2. Automated fal spec drift detection — DONE 2026-08-15

**Shipped:** `.github/workflows/fal-spec-drift.yml` — Mondays 06:17 UTC plus `workflow_dispatch`.

**The design problem was signal-to-noise, not scheduling.** "The diff is non-empty" is useless as an alert when fal rewrites docs boilerplate across all 263 routes on a whim. The job keys off the two findings that actually change what a caller gets back:

| Finding | Produces a diff? | How it surfaces |
|---------|------------------|-----------------|
| Deprecated route (still 200, serves a different model) | yes — `deprecated` field | rides the PR, called out at the top of the body |
| Fetch failure / 404 | **no** | script exits non-zero → **job goes red** |
| Price change | yes — `cost` field | PR body, with both sides shown |
| Recovery (flag cleared) | yes | PR body |

The 404 case is why the job can fail rather than just PR: a dead route writes *nothing*, so without a red job it would leave no trace at all and the cron would close green with a broken route still in the catalog.

**Supporting changes:**
- `sync-fal-specs.mjs` — `syncOne` now returns a structured outcome instead of a boolean; new pure `buildReport()` (unit-tested) summarizes into `{deprecated, failures, costChanges, undeprecated, blocking}`; new `--report <file>` writes it as JSON.
- **New `scripts/format-drift-report.mjs`** renders the PR body. Deliberately a script, not inline `jq`: the body *is* the product of this cron — if it drops a finding, the finding is lost, because nobody re-reads a 500-file spec diff to double-check. A script gets unit tests; a YAML `run:` block does not.
- **`process.exit()` → `process.exitCode`.** Calling `exit()` while undici's sockets are closing raced and aborted the process with a libuv assertion (`!(handle->flags & UV_HANDLE_CLOSING)`, exit 127) instead of a clean 1. Non-deterministic — it exited cleanly earlier the same day. Since the whole cron keys off this exit code, a crash-vs-clean coin flip was not acceptable.

**Answers to the original Cons:**
- ~~"Requires the sync script to be stable first"~~ — it is, and #18b proved the diffs will *never* be non-noisy, so waiting was the wrong plan.
- ~~"Auto-PRs can be ignored; drift accumulates"~~ — one rolling branch (`chore/fal-spec-drift`), force-pushed weekly, so it is always a single current PR rather than twelve stale ones.
- ~~"Adds a CI credential requirement (FAL_KEY)"~~ — **not needed.** The script reads `fal.ai/api/openapi` and `llms.txt`, both public. Verified unauthenticated.

**Known limitation — description corrected 2026-08-15.** CI on a bot-opened PR *does* trigger, contrary to what this note first said. The run lands at **`action_required`**, GitHub's approval gate for bot-initiated workflow runs, and runs in that state publish **no check contexts** — which is why `gh pr checks` reports "no checks reported" and the PR sits `BLOCKED`. Proven on the release PR: every run triggered by `github-actions[bot]` sat at `action_required`, while the one triggered by `bthurlow` completed successfully on the same workflow.

**Decision (Brian, 2026-08-15): manual approval stays.** Bot-initiated runs will keep requiring a human to click **Approve and run** in the Actions tab (or `POST /actions/runs/{id}/approve`). Do **not** "fix" this by relaxing the repo setting or giving a bot a PAT — a human looking at what a bot is about to run on `main` is the point.

That makes the in-job checks **load-bearing rather than a nicety**: nobody watches a weekly cron the way they watch a release, so the drift PR's gated run may sit unapproved indefinitely. Running `yarn typecheck && yarn test:unit` *inside* the drift job, and stamping a loud "❌ Catalog guards failed" section into the PR body when they fail, is what guarantees the result is visible at all.

~~**Not verified:** the workflow has never run on GitHub.~~ It has now, and the first real runs exposed a bug the local verification could not see:

**Fixed 2026-09-24 (#46): the cron only ever opened one PR.** The "open or update" step checked `gh pr view chore/fal-spec-drift`, which also matches a **merged** PR on that branch. After the first drift PR (#41) merged, every later run took the "update" path, edited the closed #41, and never opened a new one. The job went red every Monday from 2026-08-31 (three routes had started 404ing), but its findings reached no reviewer for five weeks. The lookup now matches open PRs only (`gh pr list --state open`). The first run after the fix opened #49, as expected.

**Also hardened (same PR):** both `wget` calls in `ci.yml` now retry (`--tries=3 --timeout=30 --retry-connrefused`). That fetch failed twice on 2026-08-15 — once a genuine URL rot, once a transient blip — and the integration job is the *only* place ffmpeg- and ImageMagick-backed code is ever actually exercised, so a flaky red there trains everyone to ignore a signal that matters.

### Original filing (kept for history)

**What:** Add a scheduled CI job (weekly cron) that runs `scripts/sync-fal-specs.mjs` and opens a PR if any spec has changed.

**Why:** The hybrid spec integration (OpenAPI + llms.txt fetched and committed at build time) means spec drift is visible in PR diff — but only when a contributor re-runs the sync script. If fal silently updates a model's schema (adds a param, changes a default, adjusts pricing), we won't notice until someone happens to run sync. A periodic auto-sync + auto-PR catches it without manual action.

**Pros:**
- Schema drift surfaces automatically, not when a user hits a bug.
- Pricing changes appear in PR review (important for cost budgeting).
- Zero ongoing cost — runs once a week in CI.

**Cons:**
- Requires the sync script to be stable first (can't auto-PR noise while we're still tuning the ingest).
- Auto-PRs can be ignored; drift accumulates until someone reviews.
- Adds a CI credential requirement (FAL_KEY available to the cron job) if the script needs auth.

**Context:**
- Depends on the `scripts/sync-fal-specs.mjs` script landing as part of Phase 1 (see `docs/plans/fal-multi-provider-design-2026-04-23.md` → Phase 1 updated scope).
- Suggested implementation: GitHub Actions workflow on cron, runs sync, commits changes to a branch, opens PR with changed spec files + diff summary.
- Naming convention: PRs titled `chore: sync fal-ai specs ({date})`.

**Trigger to pick this up:** ~~After sync script has been running manually for a month or two and the diffs are stable / non-noisy.~~ Fired 2026-08-15 by #18b; implemented the same day.

**Depends on / blocked by:** ~~`scripts/sync-fal-specs.mjs` shipping in Phase 1.~~ Shipped.

---

## 3. Cost observability / structured logging for generation tools

**What:** Each `fal_generate_video` (and later `fal_generate_image`, etc.) call emits a structured log event capturing: model, duration/resolution/image/audio dimensions, elapsed wall time, estimated cost based on the catalog, request_id, success/failure.

**Why:** The downstream pipeline produces many clips per piece. Real-world questions: "how much did we spend on reels this week?", "is Wan or Kling cheaper per finished second in practice?", "which model has the highest failure rate on our inputs?". None of these are answerable today — callers would have to wrap every tool call themselves.

**Pros:**
- Enables spend tracking across the pipeline without each caller building its own logging.
- Catalog's `cost` strings become the source of truth for cost estimates (already derived from llms.txt).
- Failure-rate observability comes for free.

**Cons:**
- Logging surface needs a policy: where do logs go? stdout? a file? a sink the caller configures?
- Adds weight to the tools. The design's "thin transport" stance partially conflicts — logging is not routing, but it IS an opinion.
- Cost estimation is approximate (720p vs 1080p tiered, etc.) — log says "estimated $0.70" but actual bill could differ.

**Context:**
- Design doc today has tools return `{uri: output}` and that's it. No logging surface defined.
- If built: probably a `ToolLogger` interface injected via the MCP server's init, with a no-op default. Avoids forcing a logging library choice.
- Structured event shape suggestion: `{tool, model, input_summary, elapsed_ms, estimated_cost_usd, status, request_id}` as JSONL.

**Trigger to pick this up:** First time someone asks "how much are we spending on media gen?" or "why did that batch take so long?" and nobody can answer.

**Depends on / blocked by:** Phase 1 `fal_generate_video` shipping first (so there's something to log).

---

## 4. fal speech-to-text (transcription) capability — DONE (shipped 2026-04-28)

**Shipped:** `fal_transcribe` landed in commit `fd8f3fa` — transport at `src/generation/fal/transcription.ts`, schema at `types-transcription.ts`, guide at `src/guides/transcription.ts`, 7 ASR routes seeded under the `transcription` capability in `models.json`. This entry was left un-marked at ship time and was still reading "Trigger: Now" as of 2026-08-15; corrected then.

**Original scope below kept for history.**

### Original scope — SCOPE LOCKED 2026-04-25

**What:** New top-level `transcription` capability with sub-class `transcription.asr`. One transport tool: `fal_transcribe`. Covers 7 fal ASR models. Forced alignment is NOT in scope on fal (no FA models hosted) — see TODO #7 for the deferred wrapper-FA approach.

**Why:** Concrete pipeline use case — drive ASS subtitle generation in FFmpeg for karaoke-style per-syllable highlighting. The flow:
1. **ASR** transcribes generated TTS or live audio → text + word-level timing.
2. A downstream renderer (separate TODO — likely a `video_add_karaoke` tool or extension to `video_add_subtitles`) consumes those word timings to emit ASS with `\k` karaoke tags.
3. v1 ships ASR-only; word-level timing from scribe-v2 is good enough for karaoke at word granularity. If ASR errors on known TTS prove unacceptable, escalate to TODO #7.

Also unlocks the simpler cases — generic transcription for content moderation, transcript-based highlight extraction, and a "what did the model actually say?" QA loop on TTS output.

**Decisions locked (2026-04-25):**
- **Capability:** new top-level `transcription` (existing `speech.*` is all audio-out; transcription is audio-in / text-out).
- **Sub-classes:** only `transcription.asr` seeded. Don't seed `transcription.alignment` until a real FA provider lands.
- **Transports:** one tool — `fal_transcribe`. No `fal_align` (fal hosts no FA models — see TODO #7).
- **Default-model rule:** `model` is required (no auto-default). Matches the existing transport pattern (`fal_generate_video`, `fal_generate_speech`, etc.) — no new precedent.
- **Bake-off winner:** `fal-ai/elevenlabs/speech-to-text/scribe-v2` is the recommended default for karaoke per user testing. Surfaced via prompt guide, not hard-coded as a server default.
- **Diarization:** knob on the transport (`diarize: boolean`, default true) since scribe-v2 supports natively. Other models ignore.
- **Response shape:** standardized as `{text, language, words: [{text, type: "word"|"spacing"|"audio_event", start, end, speaker_id?}], raw}`. Lossy normalization for non-scribe models (default `type: "word"`, synthesize `"spacing"` from gaps). `raw` carries model-specific extras.

**Models in scope (7):**
- `fal-ai/elevenlabs/speech-to-text/scribe-v2` — default per bake-off, $0.008/min (+30% with `keyterms`)
- `fal-ai/elevenlabs/speech-to-text` (Scribe v1) — same price tier
- `fal-ai/whisper` — generic Whisper
- `fal-ai/wizper` — Whisper v3 Large fal-optimized (~2x speed, same WER)
- `fal-ai/speech-to-text` — generic alias
- `fal-ai/speech-to-text/turbo` — turbo variant
- `fal-ai/cohere-transcribe` — Cohere business-audio

**Excluded:** `fal-ai/smart-turn` (turn detection, not transcription), `*/stream` endpoints x2 (MCP doesn't stream).

**Implementation notes:**
- Output format: JSON, not a file. Skip `downloadAndWrite`.
- Audio input: route through `resolveForFal` (HTTPS passthrough vs upload) like the other fal transports.
- Same playbook as Phase 5 — scaffolding → transport → prompt guides → wiring → smokes. Existing fal client factory, error taxonomy, sync-specs script, tool-registry, and `model_catalog` env-filter all already work.

**Trigger to pick this up:** Now. URL provided 2026-04-25; real pipeline test case is karaoke caption generation for a TTS-narrated clip.

**Depends on / blocked by:** Nothing.

---

## 5. fal image-to-image transport (`fal_edit_image`) — DONE 2026-09-24 (as `fal_generate_image`)

**Shipped** as one transport, `fal_generate_image`, covering text-to-image and image-to-image (edit, upscale, cutout), the way `fal_generate_video` covers every video mode, rather than separate `fal_edit_image` / `fal_upscale_image` tools. The input-shape variance this item worried about is handled by three structural file args (`image` → `image_url`, `images` → `image_urls`, `mask` → `mask_url`) plus `extra_files` for model-specific keys (try-on person/garment, reference images). Outputs are read from `images[]` or `image`; other file outputs (masks, layers) are reported by URL. Images are saved exactly as returned (no format conversion, by decision 2026-09-24; conversion stays on the Google nano-banana path only). Catalog: 106 entries across `image.general`, `image.edit`, `image.upscale` and `image.background_removal`, with four grouped guides. The "fal image-model list" trigger was met by the 2026-09-24 index survey.

### Original filing (kept for history)

**What:** Add a `fal_edit_image` transport that covers any fal image→image model — img2img variation, ControlNet conditioning, inpainting, outpainting, style transfer, restoration, upscaling. Mirrors `gemini_edit_image` on the fal side. Seeded catalog entries land under `image.edit` (and possibly `image.upscale` if upscalers warrant separation).

**Why:** Phase 4 was originally scoped as the text-to-image side (Imagen, Nanobanana already shipped via Google). The fal image surface is much wider and includes capabilities Google's models don't expose well — FLUX-Pro img2img, Recraft v3 style transfer, Topaz upscaling, controllable inpainting via FLUX Fill. Skipping these means the pipeline can't reach for the right tool when nano-banana isn't a fit.

**Pros:**
- Unblocks "polish this thumbnail" / "remove this object" / "upres for print" pipeline steps that have no current home.
- Same thin-transport pattern as the other fal transports — model-specific knobs flow through `extra_params`, so a wide model surface lands at low maintenance cost.
- ControlNet-flavored models in particular are hard to reach without going direct to fal — exposing them via artificer means workflows compose naturally.

**Cons:**
- Image-input shape varies more than audio-input. Some models take 1 image, some take a reference + a mask, some take 3 conditioning images. The `extra_params` escape hatch covers it but the prompt guide quality has to be high or callers will stumble.
- Upscaling is arguably a separate transport — it has no prompt, no negative prompt, and the structural args differ enough that one schema covering both edits and upscales gets ugly. Possible split into `fal_edit_image` + `fal_upscale_image`.
- Mask handling. Inpainting/outpainting masks are PNGs that need `resolveForFal` exactly like reference audio. Not hard, just needs the prompt guide to be concrete about what makes a valid mask.

**Context:**
- Fal model search: `https://fal.ai/explore/search?categories=image-to-image`.
- Existing reference: `gemini_edit_image` in `src/generation/gemini-image.ts` — output shape and ergonomics live there.
- This may merge with the parked Phase 4 work. Phase 4 today is "fal image-model list pending"; that list almost certainly contains both t2i (FLUX, Recraft, Imagen-via-fal) AND i2i (FLUX-Fill, ControlNet). When the list arrives, scope Phase 4 as both transports together rather than splitting.
- Catalog placement: `image.general` already exists for t2i (imagen-4, gemini-nanobanana). New sub-classes: `image.edit` for img2img, `image.upscale` for restoration/upres if it warrants.

**Trigger to pick this up:** User provides the fal image-model list (same trigger as Phase 4 — see prior checkpoints).

**Depends on / blocked by:** Same as Phase 4 — just needs the model list to start.

---

## 6. fal video-to-video transport (`fal_edit_video`) — DONE 2026-09-24 (without a new transport)

**Shipped** by giving `fal_generate_video` a structural `video` input (→ `video_url`) rather than building a separate `fal_edit_video`. Every v2v endpoint picked in the 2026-09-24 refresh returns the same `{ video: { url } }` shape, so the existing transport and downloader handle them unchanged, and the open question in the addendum below is answered. New catalog groups: `video.upscale` (Topaz upscale / interpolate / denoise / deblur / SDR→HDR / colorize, SeedVR2, FlashVSR, ByteDance, Crystal, Bria, FLUX video upscale), `video.edit` (Luma Ray 3.2 v2v and reframe, Kling O3 4K v2v, LTX 2.3 extend / inpaint, Lucy edit / restyle, Wan VACE, Bria erase, video background removal) and `video.lipsync` (#20). Guides: `fal_video_upscale_prompt_guide`, `fal_video_edit_prompt_guide`. The video-sync scope question below was settled by #20 going ahead.

### Original filing (kept for history)

**What:** Add a `fal_edit_video` transport for any fal video→video model — upscaling (Topaz, ESRGAN-video), frame interpolation (RIFE, FILM), style transfer, denoising, video extend, video-to-anime. Seeded catalog entries land under `video.edit` (with sub-classes `video.upscale` / `video.interpolate` / `video.style` if the model surface argues for it).

**Why:** Today's video transports are all generative (text→video, image→video). The "improve a video we already have" lane is empty. Real cases: upres a 720p Wan output to 1080p before publish, frame-interpolate a 12fps Kling output to 24fps for smoother motion, style-shift a stock clip to match a brand look. Without v2v in the toolset, the pipeline either ships the lower-quality original or punts to a separate service.

**Pros:**
- Closes the post-production loop. Generate via `fal_generate_video`, polish via `fal_edit_video`, all under one MCP roof.
- Topaz Video AI hosting on fal is genuinely useful — that model is otherwise behind a desktop app license.
- Lots of these tools are "set and forget" — single video in, single video out, minimal prompt — which means the schema can stay thin.

**Cons:**
- These models are slow. A 30s video upscale can take 5+ minutes — the existing fal subscribe pattern handles long polls fine, but timeouts and progress UX need a closer look.
- Fal's queue cost for video editing is higher per minute of output than for generation. Worth surfacing in the prompt guide so callers don't accidentally upscale a 10-min clip.
- Same input-shape variance issue as i2i — some models take video + mask, some take video + style image, some take video + audio (video-sync, which was explicitly out of scope in P5 — confirm whether v2v scope re-includes it).

**Context:**
- Fal model search: `https://fal.ai/explore/search?categories=video-to-video`.
- Video-sync (lip-sync to existing video) was explicitly excluded from Phase 5 by user direction. Whether it re-enters under v2v scope is a user decision — flag during scoping.
- Capability placement: `video.edit` is the natural home. Sub-classes `video.upscale` / `video.interpolate` / `video.style` only if the model list shows enough entries per bucket to make discovery useful. Otherwise one flat sub-class is fine.
- Same scaffolding as v1: client factory, error taxonomy, `downloadAndWrite`, `resolveForFal` for video inputs (need to confirm fal upload accepts mp4 blobs — almost certainly yes given video transports already work).

**Trigger to pick this up:** User provides the fal v2v model list. Probably best bundled with the image list arrival since the playbook is identical and both touch Phase 4-adjacent territory.

**Depends on / blocked by:** Nothing technical. Phase 1 fal scaffolding already covers it.

### Addendum 2026-09-24: video UPSCALE is the first concrete v2v need (btmusic)

**Real caller:** btmusic motion-art / Canvas exports. Apple Music album motion art requires a **3840×3840** square (plus 2048×2732 tall); no generation model we use outputs that natively. (Apple motion is deferred on the btmusic side because DistroKid can't deliver it, but the need recurs for any 4K / print-adjacent video surface.)

**fal upscalers verified live 2026-09-24** (fal model search, "video upscale"):
- `fal-ai/topaz/upscale/video`: **$0.01/s** (≤720p out), **$0.02/s** (720p-1080p), **$0.08/s** (>1080p); 2x at 60fps; half price on the Gaia 2 model. Also `topaz/upscale/video/{precision,creative,generative}` variants (no `fal-ai/` prefix).
- `fal-ai/seedvr/upscale/video`: **$0.001 per megapixel of video data** (w×h×frames; 1080p × 121 frames ≈ $0.25). `target` vs `factor` mode.
- Others listed: `fal-ai/flashvsr/upscale/video`, `fal-ai/bytedance-upscaler/upscale/video`, `clarityai/crystal-video-upscaler`, `blackforestlabs/flux-video-upscale`, `fal-ai/video-upscaler`.
- Alternative to upscaling: `kling-o3-4k-i2v` / `-ref` already in the catalog generate native 4K at $0.42/s.

**Suggested scope cut:** ship `video.upscale` first (single video in, single video out, no prompt; the thinnest slice of this TODO), Topaz + SeedVR as the two seeded routes. Interpolation / style can follow. **Open question to settle at build:** whether this can ride `fal_generate_video` + `extra_files` (`video_url`) like the #20 lip-sync routes, or whether it warrants the dedicated `fal_edit_video` transport this entry proposes.

---

## 7. Forced alignment (`align_text_to_audio`) — DONE 2026-09-24

**Shipped:** `align_text_to_audio({ audio, text, model?, output?, format? })`, seeding `transcription.alignment` (slug `elevenlabs-forced-alignment`). It defaults to fal's ElevenLabs forced aligner, the only one fal hosts, so unlike the fal transports it has a default model; the default is overridable for a future aligner with the same `words[]` shape. On top of the aligner it adds:
- **line timings** from the script's own line breaks, via an in-order exact match with a small lookahead. It drops punctuation tokens and rejoins split contractions ("don" + "t"), but never prefix-matches, so "a" can't claim "and". Lines with no timed word are interpolated and marked.
- **low-confidence words**, flagged when their `loss` sits above the clip's mean + 2σ. The loss has no documented absolute scale, so the flag is relative, like `video_make_loop`'s seam check.
- **LRC / SRT / JSON output**, chosen by `format` or the extension.

**Not verified live** (no `FAL_KEY` in the dev shell). In particular, how the aligner tokenizes punctuation and contractions is inferred from the spec, and the matcher is written to tolerate either behavior. The first real call should confirm lines come back fully matched rather than interpolated.

### Plan-change note (kept for history)

**The premise below is out of date: fal now hosts a real forced aligner.** `fal-ai/elevenlabs/forced-alignment` (listed 2026-09-08) takes `audio_url` + `text` and returns `words[]` and `characters[]`, each with `start` / `end` seconds, plus a per-word and overall alignment `loss`. That is true acoustic alignment against the known script, so the ASR-wrapper and Needleman-Wunsch plan below is no longer needed. Price: $0.22 per hour of input, **rounded up to a whole hour**, so every call costs at least $0.22.

New plan: `align_text_to_audio` wraps that model and adds what the karaoke/lyric pipelines need on top: line-level timings from the known script's own line breaks, low-confidence words flagged from `loss`, and optional LRC / SRT output. It seeds `transcription.alignment`. It was kept out of the audio catalog PR on purpose: `fal_transcribe` would parse its `words[]` but joins word texts with no separator (right for Scribe's spacing tokens, wrong here), so it needs its own tool.

### Original filing (kept for history)

**What:** A non-fal alignment tool that takes an audio file plus a known transcript and returns precise word-level (and possibly syllable-level) timestamps. Implementation v1: wrap `fal_transcribe` (scribe-v2), then string-match the ASR output against the known transcript and redistribute the timing onto the canonical text. Bypasses ASR errors when the transcript is authoritative (e.g., TTS source script, song lyrics, a known voiceover script).

**Why:** TODO #4 (scoped 2026-04-25) ships ASR-only because fal hosts no forced-alignment models. For karaoke v1, scribe-v2's word timing is good enough — but fails when ASR mishears proper nouns, technical terms, or music lyrics where the transcript is known to be exactly right. A wrapper-FA tool gives true FA semantics (input includes the canonical text) without waiting for fal to add a real FA endpoint.

**Pros:**
- Closes the gap where ASR-error-rate matters more than transcript discovery.
- Reuses `fal_transcribe` — no new provider integration.
- Keeps `transcription.alignment` sub-class meaningful (would be the home for this and any future real FA model).
- Cheap to implement — string alignment (Needleman-Wunsch or simpler tokenizer + greedy match) is a well-trodden algorithm.

**Cons:**
- Word boundary timing is only as good as the underlying ASR. If scribe-v2 misses or duplicates a word, the alignment slot for that word is fabricated by interpolation. Not the same as proper acoustic FA (MFA, WhisperX).
- Punctuation, capitalization, and number formatting (e.g., "30%" vs "thirty percent") force a normalizer in the matcher. Edge cases around contractions, hyphenation, hesitation markers.
- Adds a tool that callers could mistake for "real" FA — naming and prompt guide need to be honest about the wrapper limits.
- Syllable-level timing is still out of reach. v1 stays word-level. Phoneme/syllable-level FA needs a real acoustic aligner.

**Context:**
- Triggered when ASR-only timing causes karaoke caption errors on known TTS scripts. Today's plan (TODO #4) ships ASR-only and validates against the karaoke pipeline first.
- Implementation sketch:
  1. Tokenize known transcript (whitespace + Unicode word-boundary).
  2. Tokenize ASR `words[]` output (already tokenized by scribe-v2).
  3. Run alignment (Needleman-Wunsch) with a phonetic-similarity scoring function (Soundex / metaphone on tokens, not character-level).
  4. For matched tokens: copy ASR `start`/`end` to the canonical token.
  5. For inserted/skipped tokens: interpolate timing from neighbors.
  6. Return `{words: [{text, start, end}], language, source: "asr_aligned", quality: <match_ratio>}`.
- Catalog placement: when this lands, seed `transcription.alignment` with a single non-fal route pointing at this tool. The route's `provider` is `artificer` (in-process), `key_env_var` is whatever `fal_transcribe` already requires (since it wraps that).
- Lives outside the fal namespace — the tool name is `align_text_to_audio`, not `fal_align`. The wrapper IS using fal under the hood, but the value-add is in the alignment step, not the transcription.

**Trigger to pick this up:** First time the karaoke pipeline produces visibly-wrong captions because ASR misheard a known-good script. Or first time a non-karaoke caller asks for "lyric alignment" / "voiceover sync."

**Depends on / blocked by:** TODO #4 (`fal_transcribe`) shipping first.

---

## 8. fal text-to-video (t2v) catalog + guides — DONE 2026-04-28

**Shipped:** Full coverage seeded — 244 video routes across 4 sub-classes (53 cinematic, 182 general, 2 stylized, 7 talking-head) plus 25 prompt guide families covering every fal-hosted t2v / i2v / multi-ref / FLF model. See `src/catalog/models.json` and `src/guides/` (commits 412da8a, 8f2c03e, a81476c). Bake-off intentionally deferred — see TODO #1 trigger.

**Original scope below kept for history.**

**What:** Seed `models.json` with fal-hosted text-to-video models — Luma Dream Machine, Runway Gen-3 / Gen-4, MiniMax Hailuo-02, Kling text-to-video variants, Wan text-to-video, fal-ai/veo3.1 (the t2v sibling of the existing veo3.1/image-to-video stub), etc. Add prompt guides per model family. Run a bake-off to pick a recommended default for each meaningful sub-class (cinematic, motion-graphic, abstract, etc.).

**Why:** Phase 1 shipped `fal_generate_video` as a generic transport, but the catalog only seeded image-driven and audio-driven models (Wan 2.7, Kling Avatar, VEED Fabric — all need an image or audio input). Pure t2v on fal — "make a 5-second establishing shot of X" — has zero catalog coverage today. The transport itself is t2v-capable (the schema makes `image` optional, `prompt` is structural), but a caller asking `model_catalog` for video options sees only i2v and talking-head. The capability is half-shipped.

**Pros:**
- **No new transport code.** `fal_generate_video` already handles t2v — pass any t2v model id with just a prompt, no `image`. Closing the gap is purely catalog + guides + bake-off.
- Unblocks "establishing shot" / "B-roll" / "stock-style cinematic" pipeline use cases that today have no fal home (Google Veo via `gemini_generate_video` is the only path).
- Same playbook every other phase has used — sync specs, seed routes, write guides, bake-off, flip recommended-default in the matching guide.

**Cons:**
- T2V model surface is wide and quality varies enormously. A meaningful bake-off needs a fixed prompt set + scoring rubric (cinematic coherence, motion realism, prompt adherence, cost-per-second). The talking-head bake-off rubric doesn't transfer — TODO #1 (eval harness generalization) becomes load-bearing here.
- Sub-class taxonomy is unobvious. `video.cinematic` already exists for Veo; do we add `video.t2v_general` and `video.t2v_motion_graphic`, or push everything under `video.cinematic`? Probably needs the model list before deciding.
- T2V is expensive per second (Runway / Veo / Luma all in the $0.20-$0.60/sec range). A bake-off of 5 models × 5 prompts × 5s clips = ~$30-$50 in fal credits, more if 1080p.

**Context:**
- Transport schema reference: `src/generation/fal/types.ts` — `image` and `audio` are both optional, `prompt` is the structural arg.
- Existing fal-Veo route in `video.cinematic` is already wired (currently `stub: true` — flipping is one line). That covers fal's Veo3.1 i2v path. The t2v sibling (`fal-ai/veo3.1`, no `/image-to-video` suffix) is a separate route.
- Candidate model IDs to enumerate (verify availability via fal explore): `fal-ai/luma-dream-machine`, `fal-ai/runway-gen3`, `fal-ai/runway-gen4`, `fal-ai/minimax-hailuo-02/standard/text-to-video`, `fal-ai/kling-video/v2.5/master/text-to-video`, `fal-ai/wan/v2.7/text-to-video`, `fal-ai/veo3.1`, `fal-ai/veo3.1/fast`, `fal-ai/pika/v2.2/text-to-video`.
- Bake-off needs: fixed prompt set (probably 5 prompts spanning cinematic / abstract / character-action / B-roll / motion-graphic), 5-second clip target, 1080p where supported, scored against a pluggable rubric (which is exactly what TODO #1 unblocks).
- Prompt guide pattern: per-model file under `src/guides/`, registered in `src/guides/index.ts`, following the 10-section format spec at `docs/conventions/prompt-guides.md`. Or a single combined `fal_t2v_prompt_guide` if model count is small enough — call it after the model list is confirmed.

**Trigger to pick this up:** User-provided fal t2v model URL (e.g. `https://fal.ai/explore/search?categories=text-to-video`) plus a real pipeline use case (e.g. "make B-roll for the narrated explainer workflow"). Best bundled with TODO #1 (eval harness generalization) since the bake-off is the bottleneck, not the catalog edits.

**Depends on / blocked by:** Nothing technical. Ideally do TODO #1 first so the bake-off scoring is reusable for future v2v / cinematic-class additions.

---

## 9. Brand spec — broaden nested schema OR tighten nested validation — DONE 2026-08-15

**Shipped: both (a) and (b)**, which the filing itself called ideal. Broadening alone would have left the next unknown key silently dropped; tightening alone would have rejected the fields callers legitimately need.

**Broadened.** `colors` gains `background` / `background_name` / `highlight` / `highlight_name`; `fonts` gains `mono` / `sans` / `display`. Both gain an `extras: Record<string, string>` bag.

**Tightened.** Every nested object — `colors`, `fonts`, `tts`, `music`, `logo` — is now `.strict()`. Unknown keys throw instead of vanishing.

**`extras` is what makes strict safe.** Sealing the nested objects without an escape hatch would just move the problem: a brand with a fifth color would have nowhere legitimate to put it and no option but to give up on the spec. `extras` means strict rejects *typos* rather than rejecting *needs*.

**The error message is the actual deliverable.** The old failure wasted the caller's time twice: once writing fields that disappeared, then again round-tripping `brand_spec_get` to reverse-engineer what the schema really took. So an unknown key now reports the accepted slots and points at `extras`:

> `ARTIFICER_BRAND_SPEC failed schema validation: colors: unknown key(s) "backgroundColor" — accepted here: primary, primary_name, secondary, secondary_name, background, background_name, highlight, highlight_name, extras. Put anything else under colors.extras (an object of name → value)`

That map is **derived from the schema at module load**, not hand-listed, so adding a slot can't leave the error describing a shape that no longer exists — which would be this same bug wearing a different hat. `brand_spec_get` also returns the accepted shape when nothing is configured.

**Resolver policy — the deliberate asymmetry.** `resolveColor` gained `background` / `highlight`; `resolveFont` gained `mono` / `sans` / `display`. A **missing weight still falls back to `regular`** (same typeface, reasonable degradation), but a **missing family does not**, and **no color role falls back to another**. Substituting a display serif where `mono` was asked for defeats the exact reason mono was requested — column alignment in credits and lyric sheets, which is btmusic's use case — and `background` silently returning the brand accent would paint a surface in entirely the wrong color. Returning `undefined` lets the consumer apply its own default knowingly.

**⚠️ Breaking for any spec with stray nested keys.** That is the intent — loud beats silent — but a project whose `ARTIFICER_BRAND_SPEC` carries an unused or typo'd nested key will now fail at load rather than starting up and quietly ignoring it. The error names the offending key and the fix.

**Verified:** the Cathode Saint spec from the original 2026-06-07 report now round-trips all 8 color keys and all 6 font keys. Both halves of the fix were proven to bite by reverting them (dropping nested `.strict()` fails 3 tests; deleting the new color slots fails 4). +13 tests, 877 passing.

**Left undone deliberately:** the filing's third Con — "does `gemini_generate_image` know to inject `colors.background` into prompts?" — is still open. The resolvers now expose the slots, so a consuming tool can opt in, but actually injecting new fields into generation prompts would change output for existing callers and is its own decision, not a schema fix. Filed below as **#9b**.

Also note the live caller doc `D:\projects\btmusic\instructions\artificer-prompts.md` records the *old* accepted shape in its 2026-06-07 learnings entry; it is in another repo and was not updated here.

## 9b. Teach generation tools to consume the new brand slots (NEW, filed 2026-08-15)

**What:** `colors.background`, `colors.highlight`, `fonts.mono` / `sans` / `display` are now first-class in the spec and resolvable, but no tool reads them automatically. Decide which should: e.g. should `gemini_generate_image` compose `colors.background` into prompts, should text-overlay tools pick `fonts.mono` for technical text, should social-card workflows use `highlight` for contrast text?

**Why:** #9 fixed the schema; this is the half that makes the new slots do anything on their own. Until then callers pass them per-call, which works but is what the spec abstraction was supposed to remove.

**Caution:** any tool that starts auto-injecting a brand slot changes output for existing callers who never asked for it. Prefer opt-in parameters or an explicit precedence rule over silent injection.

**Trigger:** when a caller asks why setting `colors.background` didn't change anything, or when the btmusic pipeline wants it wired.

## 9c. Original #9 filing (kept for history)

**What:** `brandSpecSchema` in `src/brand.ts` is `.strict()` at the root but unsealed at every nested level (`colors`, `fonts`, `tts`, `music`, `logo`). Unknown keys inside those nested objects are silently dropped by Zod's default behavior with no warning. Two acceptable fixes:
- **(a) Broaden the schema** — add optional slots for the fields callers naturally reach for: `colors.background`, `colors.background_name`, `colors.highlight`, `colors.highlight_name`, `fonts.mono`, `fonts.sans`, and probably leave room for an arbitrary `colors.extras: Record<string, string>` and `fonts.extras: Record<string, string>` so future projects with multi-family or multi-mode palettes don't keep hitting this.
- **(b) Tighten the nested `.strict()`** — every nested object becomes `.strict()` too, so any unknown key throws with the same loud-misconfiguration message style as the existing root-level validation. Caller learns immediately that `colors.background` isn't a slot, can decide whether to refile (a) or restructure their spec.

Both are real fixes. (a) makes the schema match how multi-mode brand systems actually look in 2026; (b) makes the existing schema honest about what it accepts. Doing **both** (broaden the obvious slots + tighten nested .strict() so anything still unknown throws) is probably ideal.

**Why:** The current behavior is the worst of both worlds. The Zod schema looks rich because users can write whatever they want, but only documented fields survive — and there's no error or warning that the rest disappeared. Caller wastes effort crafting spec fields that get silently dropped, then re-derives the actual accepted shape via `brand_spec_get` round-trip. Confirmed 2026-06-07 against `btmusic`'s Cathode Saint brand spec: wrote 4 color slots (primary / secondary / background / highlight) and 6 font slots (regular + medium + semibold + bold + mono + sans), got back 2 color slots and 4 font slots with no error.

The Cathode Saint case is representative of a real class of brand system, not a one-off:
- **Multi-mode palettes.** Cathode Saint has two co-equal visual modes — "vivid CRT" (phosphor green dominant) and "warm sacred" (gold dominant), plus a brand-mandated background (`#0A0A0A` deep black) and highlight (`#F4ECD8` bone white). The current 2-slot palette only captures the dominant color of one mode.
- **Multi-family typography.** Cathode Saint uses three families on the same surface set — Cinzel (display / wordmark), IBM Plex Mono (technical / credits / lyric sheets), IBM Plex Sans (body / press). The current 1-family × 4-weight shape only fits one of them. (Brand systems with display + body + mono are routine — DoughMetrics is the rare project where one family covers everything.)

**Pros:**
- Either fix makes the schema match real-world brand systems OR fail loudly. No more silent-drop confusion.
- (a) variant: zero migration for existing callers — additive optional fields are backward-compatible.
- (b) variant: zero new schema surface — just changes nested `.strict()` posture, error message is self-explanatory.
- Pairs naturally with new `resolveColor` / `resolveFont` overloads: `resolveColor(explicit, 'background')`, `resolveFont(explicit, 'mono')` — same pattern as the existing `'primary'`/`'secondary'` and `'regular'`/`'medium'`/`'semibold'`/`'bold'` lookups.

**Cons:**
- (a) bloats the schema surface; harder to discover the canonical "primary brand color" if everything is a slot. Mitigate with field ordering + JSDoc that explicitly calls out which slots are the canonical brand color vs. accent vs. surface.
- (b) breaks anyone who currently has unused/typo'd nested keys lurking in their `ARTIFICER_BRAND_SPEC` env var. Loud failure is the point, but it's still a breaking change.
- Either expansion needs a downstream propagation: does `gemini_generate_image` know to inject `colors.background` into prompts? Probably not today. The schema fix is half the work; tools that consume the new slots are the other half.

**Context:**
- Schema definition: `src/brand.ts` lines 21-115. Note `.strict()` at line 115 is on the outer `z.object(...)`, not on the nested objects.
- Round-trip discovery path: `mcp__artificer__brand_spec_get` returns the **parsed** spec (with stripped fields), not the **raw** env var. That's how the silent drop surfaces.
- Live caller doc for btmusic: `D:\projects\btmusic\instructions\artificer-prompts.md` — learnings log entry 2026-06-07 records the live accepted shape so the project doesn't keep relearning it.
- Btmusic's working assignment of the dropped fields: deep-black `#0A0A0A` background and bone-white `#F4ECD8` highlight are now narrated in `scene_description` prose; IBM Plex Mono and Plex Sans are passed per-call to consumers that need them. Workable, but not what the spec abstraction promised.

**Trigger to pick this up:** Next time a second project lands a brand spec with multi-mode palette or multi-family typography (likely — most non-trivial brand systems have this shape), OR when a downstream tool author needs `colors.background` / `fonts.mono` and discovers it isn't in the schema.

**Depends on / blocked by:** Nothing. Pure schema + (optional) helper overloads. If pursuing the broaden+tighten combo, do the broaden first so existing callers' valid-but-not-yet-validated fields land in the new slots before the tighten breaks them out.

---

> **Items #10-#18 filed 2026-08-15** from the btmusic (Cathode Saint) project, which had been accumulating these as in-project learnings. They are now owned here; the btmusic-side notes were reduced to workflow-workarounds + pointers to these numbers.

## 10. Image-model wiring refresh — Imagen retirement + nano-banana default + negative_prompt — DONE 2026-08-15

**Shipped, all three parts:**
- (a) **Imagen fully retired** (Brian's call, 2026-08-15 — no replacement, nano-banana takes over). Deprecation independently confirmed against ai.google.dev: `imagen-4.0-generate` sits under "Previous models" with a "will be shut down soon" notice. The `imagen-4` route is deleted from `models.json`; `gemini_image_prompt_guide` is now a retirement notice + capability-migration table; `gemini_generate_image` / `gemini_edit_image` stay registered as thin transports but **lost their baked defaults** — `model` is required unless an operator pins `ARTIFICER_IMAGEN_MODEL` / `ARTIFICER_IMAGEN_EDIT_MODEL` (new `retiredDefault` helper in `src/generation/types.ts`).
- (b) Nano-banana promoted to **`gemini-3.1-flash-image`** — note this is the *stable GA* ID, not the `-preview` variant btmusic's `.mcp.json` pins; ai.google.dev lists no `gemini-3.1-flash-image-preview`. **btmusic should drop its `ARTIFICER_NANOBANANA_MODEL` override or repoint it.** Real per-resolution pricing seeded ($0.045 / $0.067 / $0.101 / $0.151 for 0.5K / 1K / 2K / 4K). Guide documents the siblings (`gemini-3.1-flash-lite-image`, `gemini-3-pro-image`).
- (c) `negative_prompt` now **fails fast** on `gemini_generate_image` and `gemini_edit_image` with a message that names the fix (fold exclusions into the positive prompt), instead of surfacing an opaque SDK 400. The guard is skipped when `GOOGLE_CLOUD_PROJECT` is set, since Vertex does accept the parameter.

**Not done here — possible follow-up:** `gemini-3.1-flash-lite-image` and `gemini-3-pro-image` are documented in the guide but not seeded as their own catalog routes.

Note: **`gemini-omni-flash-preview`** is NOT an image model — it is an omni/video model. Tracked as **#19**.

Source: btmusic Album 2 cover session (`decisions.md` 2026-08-07, `instructions/artificer-prompts.md` Learnings 2026-08-07, `.mcp.json`).

## 11. gemini_upscale_image — Vertex-AI requirement — DONE 2026-08-15

**Shipped:** new `getGenAIClientForVertex(toolName)` in `src/generation/client.ts` builds a real Vertex-backed client from `GOOGLE_CLOUD_PROJECT` + `GOOGLE_CLOUD_LOCATION` (default `us-central1`). `gemini_upscale_image` uses it and now throws up front with a message naming the env vars and the ADC login command, rather than surfacing "This method is only supported by the Vertex AI" from inside the SDK. Tool description and `upscaleImageSchema` both state the requirement.

**⚠️ The Vertex success path is untested** — this environment has no Vertex credentials, so only the failure path has live coverage. First user with a real project should confirm the upscale actually completes. (The generic fal upscale transport remains separately covered by TODO #5.)

Source: btmusic upscale bake-off blocked 2026-05-26 (`instructions/artificer-prompts.md` Learnings 2026-05-26).

## 12. Image composite/canvas fixes — DONE 2026-08-15

**(a) Composite desaturation — root-caused and fixed.** ImageMagick adopts the **first** image's colorspace for a composite. A solid dark background is routinely stored as a *grayscale* PNG — ImageMagick writes one that way itself whenever an image carries no color — so the colored overlay was converted to gray on the way in. That is why the source and the resize both checked out gold: the color died at the composite, in the base image nobody inspected. Reproduced exactly as reported: `srgb(212,175,55)` → `gray(212)`, identical on `Over` and `Lighten`.

**Scope was wider than filed.** The same defect hit every tool landing a colored layer on a caller-supplied base: `composite`, `watermark`, AND `gradient-overlay` (gold→darkred gradient collapsed to `gray(211)`→`gray(140)`). So every branded banner, watermark, and gradient built on a dark background has been silently desaturating. Fixed via a shared `FORCE_SRGB` promotion of the base. `rounded_corners` / `mask_apply` composite a grayscale *mask* onto a color base, so the base colorspace already wins — verified unaffected, left alone.

Two risks checked before adopting the approach: Gray→sRGB is **value-preserving** across the tonal range (0/10/64/128/192/255 all round-trip exactly, so no brightness shift), and ImageMagick still writes a genuinely colorless result back as grayscale (so no file bloat).

**(b) `extend-canvas` shipped.** Canvas mode (`width`+`height`+`gravity`) or padding mode (`top`/`right`/`bottom`/`left`). Replaces the resize-fit + border + stretch workaround. Transparent fill by default; both-modes or neither-mode is a loud error.

Commits `1a1a4f1`, `e122be7`. 9 integration tests assert real pixel color and geometry; verified they fail with the fixes reverted.

## 13. background-remove — flood-fill toggle + ML-segmentation mode — (a) DONE 2026-08-15, (b) OPEN

**(a) Flood-fill shipped.** `mode: "color-key" | "flood-fill"`, default `color-key` so existing callers are unaffected. The description had advertised flood fill since day one while only keying was implemented. Keying removes every matching pixel, so a white background punches holes through white *inside* the subject — the swiss-cheese failure. Flood-fill seeds from **all four corners** (one seed is not enough: a subject touching an edge, or a background split by the subject, leaves unreachable regions) and honors `replace_color`. `target_color` is ignored in this mode — each seed samples the color already at that corner.

**(b) ML-segmentation mode — still open.** Wrapping rembg / U²-Net for soft-glow and photographic backgrounds remains the real fix for cutouts that color-keying and flood-fill both can't handle; flood-fill only helps when the background is flat and edge-connected. This still carries a new binary/model dependency, which is the reason it was deferred and remains so. Brand glow-on-dark assets continue to need the luminance-as-alpha ffmpeg workaround. Source: btmusic `instructions/bg-removal-recipes.md`.

**Trigger for (b):** next asset needing a soft or photographic BG cutout.

**Update 2026-09-24: a remote alternative now exists.** ML cutouts are available through `fal_generate_image` with the `image.background_removal` routes (BiRefNet 2, Pixelcut, FeynoBG, Bria extract-object, SAM 3.1; see `fal_background_removal_prompt_guide`), with no new local dependency. That covers the soft-edge and photographic cases when a network call is acceptable. (b) stays open only for an **offline / local** ML mode inside `background-remove` itself; revisit only if the fal route proves insufficient for glow-on-dark brand assets.

## 14. audio_info probe primitive — DONE 2026-08-15

**Shipped:** `audio_info` registered in `src/audio/index.ts` (schema in `src/audio/types.ts`), built on the existing `ffprobe` helper. Returns codec (short + long name), container, duration (`H:MM:SS.mmm` + raw seconds), sample rate, channels + layout, bitrate, and file size. Falls back to container-level duration/bitrate when the stream omits them (MP3 does), renders unknown fields as `—` rather than `NaN`, and reports a clear message when a file has no audio stream. Went with a separate tool rather than MIME-dispatching `info`, so the image path stays untouched. Tool count 163 → 164.

**Coverage note:** 5 unit tests cover the parsing/formatting logic against realistic ffprobe JSON. No live ffprobe run — ffmpeg is not on PATH in the dev environment used, so the ffmpeg integration suite auto-skipped.

Source: btmusic memory `artificer_mcp.md`.

## 15. MiniMax music prompt-guide corrections — DONE 2026-08-15

**Shipped:** `src/guides/minimax-music.ts` rewritten against btmusic's primary sources (`lyric-length-tactics.md`, `minimax-cover-findings.md`, `artificer-prompts.md`) rather than MiniMax's docs. All six items landed, plus `[Tag, Specifier]` narrow support, the write-every-chorus-out rule, positive-descriptors-only, and the nested `audio_setting.format` WAV knob. The guide now opens with an explicit "documents observed behavior, not published claims" banner.

**⚠️ One source conflict, resolved in the guide — worth a second look:** `lyric-length-tactics.md` (2026-05-24, Album 1 vocal tracks) locks **lyric line count as the duration lever** with a projection table. `minimax-cover-findings.md` (2026-06-11, Album 2 instrumentals, n=10) **falsifies** section count / `[Inst]` density / lyric-field volume as levers and concludes duration is a prompt-independent draw (~2:30–4:40) where the only method is batch-and-select. The guide documents both and scopes them — line count is a real lever on **vocal** tracks; on instrumental/skeleton-only generations length collapses to a random draw. If that reconciliation is wrong, the Duration section is the thing to fix.

**Still open:** the paren-singing divergence is worth reporting upstream to MiniMax — not done.

## 16. fal_generate_music — WAV output knob — DONE 2026-08-15

**Remaining work shipped: `extra_params` keys the model does not accept now produce a stderr warning.**

```
fal_generate_music: extra_params key "audio_format" is not an input on
fal-ai/minimax-music/v2.6 — fal will silently ignore it. Did you mean
"audio_setting.format"? Nest it, e.g. {"audio_setting": {"format": ...}}.
```

**Built generically off the committed specs, not a hand-written table of known-bad keys.** A table would cover MiniMax and nothing else, and would rot the moment fal changed a schema. Instead `scripts/build-fal-input-keys.mjs` distils every committed `openapi.json` into `src/catalog/fal-input-keys.json` — accepted top-level keys plus dotted nested paths, for **262 models**. The check therefore covers the whole catalog and self-updates: the sync script regenerates the map, so the weekly drift cron (#2) keeps it current with no separate step.

The input schema is located via the POST operation's `requestBody.$ref`, not by matching schema names — fal's naming varies per model (`LynxInput`, `SoundEffectsGeneratorInput`, …) and a name heuristic would silently yield nothing for the ones that don't match.

**Why a distilled map rather than reading specs at runtime:** the specs are 6.2MB across 263 directories and are **not shipped** — `package.json` `files` publishes only `dist/`, where tsup copies `models.json`. The distilled map is 75KB and is now copied alongside it.

**Suggestion heuristic:** for an unknown top-level key, match nested leaves either exactly (`format` → `audio_setting.format`) or on the key's last underscore-token (`audio_format` → `audio_setting.format`). That second rule is what catches the reported bug — a caller flattening a nested knob into a plausible-sounding top-level name. Capped at 3 suggestions; falls back to listing accepted keys when nothing resembles the input.

**Still diagnostic only — the thin-transport stance is intact.** The warning never rewrites, relocates, or drops a key; the request is sent exactly as the caller built it. A test asserts the payload reaches fal unmodified, precisely so a future change can't quietly turn this into normalization.

**False warnings are treated as worse than missed ones.** An unknown model, or an unreadable map, returns zero warnings silently — a caller on a brand-new fal route must not be told their valid keys are wrong, because one false warning discredits every later one.

**Staleness guard:** `yarn catalog:keys:check` fails if the map no longer matches the specs, wired into the Typecheck CI job and the `ci` script. Without it the warning could start describing a schema that no longer exists — the same class of lie it was built to prevent.

**Verified:** +17 tests (895 passing). The end-to-end path is tested against the *real committed map* in `music-warning.test.ts`, deliberately a separate file from `music.test.ts` because that one mocks `node:fs/promises` wholesale and would mask the load. Wiring proven to bite by deleting it (1 test fails). Guide updated with the warning text.

**Scope note:** wired to `fal_generate_music` only, which is what this item filed. `fal_generate_video` / `_speech` / `_transcribe` have the identical silent-drop exposure and the checker is model-agnostic — adopting it there is a one-line change per transport, deliberately not taken here to keep the blast radius to the filed scope. Filed as **#16b**.

## 16b. Extend the extra_params warning to the other fal transports — DONE 2026-09-24

**Shipped** across the 2026-09-24 catalog PRs: `fal_generate_speech`, `fal_transcribe` and the new `fal_separate_audio` (audio PR), `fal_generate_video` (video PR) and the new `fal_generate_image` (image PR) all call `checkExtraParams`, as `fal_generate_music` already did. The stderr-noise concern stands as written below, but it only fires for keys fal is already dropping silently, which is exactly what the new catalog's per-model knob differences make likely (e.g. Mirelo's `text_prompt`, Seed Audio's `prompt`).

### Original filing (kept for history)

**What:** `checkExtraParams` is generic and covers all 262 catalogued models, but only `fal_generate_music` calls it. Add the same three-line block to `fal_generate_video`, `fal_generate_speech`, and `fal_transcribe`.

**Why:** the silent-drop failure mode is not music-specific — any caller passing a plausible-but-wrong top-level key to any fal model gets it dropped with no error. Video is the likeliest next victim given how many models have nested `*_setting` style knobs.

**Caution:** this adds stderr output to pipelines that currently produce none. Warnings only fire for keys fal is already discarding, so nothing that works today would start failing, but a noisy pipeline log is a real cost worth a deliberate decision.

**Trigger:** next time someone is surprised by an ignored parameter on a non-music fal tool.

## 16c. Original #16 filing (kept for history) — PARTIALLY DONE 2026-08-15

**Documented, not normalized.** The MiniMax guide (#15) now carries an explicit warning section: there is **no top-level `audio_format` parameter** on `fal-ai/minimax-music/v2.6` — confirmed against the committed spec at `src/catalog/fal-specs/minimax-music-2.6/openapi.json`, which exposes only nested `audio_setting` (`format` mp3|wav|pcm, `sample_rate`, `bitrate`). fal drops the unknown key silently, hence the MP3 surprise. The guide gives the canonical `extra_params` shape and tells WAV-pipeline callers to check the returned `mime`.

**Deliberately NOT normalized at the transport.** Mapping a top-level `audio_format` onto per-model wire keys would put model-shape knowledge in the server, which conflicts with the thin-transport stance (`fal_generate_music` merges `extra_params` straight through by design). If we revisit: the cheaper move is a stderr warning for known-ignored top-level keys, reusing the collision-warning pattern at `src/generation/fal/music.ts:95` — that's the remaining work on this item.

Source: btmusic `instructions/artificer-prompts.md` 2026-06-05.

## 17. Music-model guide + catalog accuracy (ElevenLabs / Lyria 3) — DONE 2026-08-15

**Shipped, all three parts:**
- (a) ElevenLabs Music guide corrected. It **does** support vocals and authored lyrics — via `composition_plan` sections carrying a `lines` array (max 30 lines/section, 200 chars/line), verified against the ElevenLabs Music API reference. The old "no native lyrics support / primarily instrumental" reasoning is replaced with the accurate constraint: no lyrics field in *prompt mode*, and no vocalist-level control (per-section multi-vocalist is partial/unreliable). Routing conclusion unchanged.
- (b) **Lyria 3 vocal capability confirmed — Brian was right.** Google's music-generation docs state it delivers "structural coherence, including vocals, timed lyrics, and full instrumental arrangements." The guide's "Lyria 3 is mostly instrumental; avoid vocal requests" line was wrong — it had carried Lyria 2's instrumental-only constraint across. Replaced with a "Lyria 3 sings" section that contrasts it against fal-hosted Lyria 2.
- (c) New optional `vocals` field on catalog entries (`"vocal_capable"` | `"instrumental_only"`), typed in `src/catalog/catalog.ts` and passed through `filterCatalog` — note the filter reconstructs entries field-by-field, so any future entry-level field must be added there too or it is silently dropped. Applied to lyria-3, eleven-music, minimax-music-2.6 (vocal_capable) and lyria-2, stable-audio-2.5 (instrumental_only). Lyria 3's cost normalized to real figures from Google's pricing page ($0.04/song clip, $0.08/song Pro); Lyria RealTime has no published per-unit price and now says so explicitly instead of implying one exists.

Source: btmusic memory `artificer_mcp.md`, `instructions/artificer-prompts.md` catalog caveat.

## 18. MiniMax video generation v2 (MiniMax-H3) support — DONE 2026-08-15

**Shipped as catalog + guide only — no new transport.** fal began hosting H3 on 2026-08-01, so `fal_generate_video` already reaches it. The direct MiniMax v2 API (task-create + poll against `platform.minimax.io`) was **not** needed and was not built.

**Three routes seeded** in `video.general`, specs synced to `src/catalog/fal-specs/minimax-h3-*`:
- `minimax-h3-t2v` → `minimax/h3/text-to-video`
- `minimax-h3-i2v` → `minimax/h3/image-to-video` — **supports first-to-last keyframe** via `end_image_url` (Brian, 2026-08-15)
- `minimax-h3-r2v` → `minimax/h3/reference-to-video` — up to 12 reference files across image/video/audio lists

**Endpoint ids carry no `fal-ai/` prefix** — they are `minimax/h3/...`. A `fal-ai/minimax/hailuo-03/...` alias also resolves but exposes a reduced schema (no `seed`, no `enable_prompt_expansion`); the catalog uses the `minimax/h3/` form.

**Corrections to the original filing**, all verified against the synced specs:
- Duration is **5–15s**, not 4–15s.
- Resolutions are **480P / 768P / 2K / 4K**, not just 768P/2K. Only 480P and 768P are native — **2K and 4K upscale a 768P base**, so they cost more without adding real detail.
- Pricing is **$0.05 / $0.08 / $0.13 / $0.16 per second** by tier — not the $0.26/s at 2K that secondary sources reported.
- **Output is silent on fal.** MiniMax marketing describes native stereo audio; fal's output schema returns a bare `video` File. Good for a fixed-master music video — nothing to strip.

**Still true:** no native chaining (concatenate downstream), native 9:16, no camera-motion params.

## 18b. Fal spec drift — DONE 2026-08-15

**Shipped:** full re-sync of all fal specs plus the catalog surgery the drift demanded. 519 spec files updated, 9 `cost` strings corrected, 3 routes flagged deprecated, 6 dead routes retired.

### The mechanism change: `deprecated` is now a first-class field

The original filing called the deprecations a data problem. They were a **schema** problem. fal does not publish retirements in a section of their own — they replace the body of `## Pricing` with a one-line notice, so `extractPricing` returned it and the script wrote *"This model has been deprecated…"* straight into `cost`. That destroyed the last known price and left prose that isn't a price in the field callers read as one.

Fixed at three levels:
- **`scripts/sync-fal-specs.mjs`** — new `extractDeprecation()` routes the notice to `route.deprecated` and leaves `cost` alone. It also clears a stale flag if a route recovers, and prints a dedicated "N DEPRECATED route(s)" block so retirements aren't buried under several hundred lines of "wrote" chatter.
- **`src/catalog/catalog.ts`** — `deprecated?: string` on `AccessRoute`. A deprecated route is **not `available`** and is hidden from `model_catalog` by default; `include_unavailable: true` shows it with the notice attached.
- **`tests/unit/catalog/integrity.test.ts`** — a guard that fails the build if a deprecation notice ever appears in a `cost` field again. Verified to bite by re-poisoning the catalog.

**Why hide rather than merely label:** a deprecated fal route still returns **200**. It just serves a different model than the slug named. That is precisely the hidden routing this server exists to avoid, so the catalog must not offer it as a normal choice. `cost` on a deprecated route is retained as the last observed price and is explicitly **not authoritative** — billing follows whatever model fal redirects to.

### Deprecated (still answer, serve something else)
| Slug | Actually serves |
|------|-----------------|
| `seedance-1-lite-t2v` | Seedance 1.0 Pro Fast |
| `seedance-1-lite-i2v` | Seedance 1.0 Pro Fast |
| `seedance-1-lite-ref` | **Grok Imagine Video** — a different vendor entirely |

The `-ref` redirect is the nasty one: it leaves the Seedance family, so multi-reference and audio behavior are Grok's, not what `seedance_prompt_guide` documented. Guide now carries a migration table pointing at `seedance-1-pro-fast-*` and `seedance-2-*-ref`.

### Retired (404 on both openapi and llms.txt — verified, no renamed successor)
`wan-2.6-t2v` · `ltx-video-lora-i2v` · `hunyuan-video-img2vid-lora-i2v` · `transpixar-t2v` · `animatediff-sparsectrl-lcm-t2v` · `qwen-3-guard`

Entries and their spec dirs deleted; every referencing guide updated. **Two of these cost real capability, not just a route:**
- **TransPixar was the catalog's only alpha-channel video model.** There is now *no* route producing video with a real alpha channel. The fallback (generate on flat color → `background_remove` color-key → `composite`) is materially worse on soft edges, motion blur, and particles/smoke — which is exactly what the model was for. Recorded in `specialized_video_prompt_guide`.
- **`qwen-3-guard` was the only `safety` entry, so the whole capability is now empty.** fal's model index returns nothing for guard/moderation/safety, so there is no replacement to point at. `fal_classify_text` still works but now *requires* an explicit `model` — the existing "exactly one non-stub entry" auto-default rule already handles zero by throwing an actionable error, so no code change was needed, only honest tool descriptions.

Also lost: SparseCtrl conditioning (only AnimateDiff variant offering it) and LoRA-capable Hunyuan **i2v** (t2v LoRA survives).

**Second round, 2026-09-24 (#46):** `hunyuan-video-lora-t2v` · `sana-video-t2v` · `lyra-2-zoom-i2v` also 404 on both surfaces with no successor in fal's index, and were retired the same way. Hunyuan now has **no** LoRA route at all (the guide points LoRA work at the LTX LoRA variants), `sana_prompt_guide` was removed with its only model, and Lyra-2 was the only pseudo-3D zoom route. This was the first `!` commit, and it shipped as 0.11.0; UPGRADING.md has the migration. Note that fal's model index still listed the already-dead `hunyuan-video-img2vid-lora`, so the index lags behind reality: a 404 on both surfaces is the signal to trust.

### Price changes worth knowing
- **`ltx-video-13b-distilled-i2v` switched from per-video to per-second billing** — $0.04/video → $0.04/s, or $0.08/s with the detail pass. A 10s clip went from a flat $0.04 to $0.40–$0.80, a **10–20× jump** for anyone budgeting against the old flat rate. Its sibling `-t2v` did *not* change, so the pair no longer behaves alike. Flagged loudly in `ltx_video_prompt_guide`.
- LTX-2.3 closed tier rose: Fast $0.04→$0.06/s, Pro i2v $0.06→$0.08/s at 1080p. Pro and Fast have each converged to one rate across t2v and i2v.
- Seedance 2.x pricing now documents 1080p at $0.682/s and a cheaper $0.008/1k-token 4k rate; the 720p rate ticked $0.3024→$0.3034.

**Guides re-verified:** `seedance`, `ltx-video`, `wan`, `hunyuan-video`, `legacy-video`, `specialized-video`. Each got an honest "Last verified" note distinguishing what was actually re-checked in this pass from what still dates to the 2026-04-28 seed.

**Not verified:** no generation call was made against any re-priced or re-pointed route. Pricing and deprecation status are read from fal's published specs, not observed on an invoice.

**Follow-on filed:** the empty `safety` capability. If a fal-hosted classifier reappears, re-seed `safety.text`; until then `fal_classify_text` needs an explicit model id and nothing in the catalog advertises one.

## 18c. Original #18 scope (kept for history)

**What:** Add / update MiniMax video-gen support to the **v2** API (`https://platform.minimax.io/docs/api-reference/video-generation-v2-create`). Model **MiniMax-H3**. Modes: text-to-video, image-to-video (first frame), first/last-frame, and reference-to-video (subject/style consistency; accepts reference images/video/audio). Constraints to encode in the guide: **4-15s per clip, no native chaining**; resolutions 768P / 2K; aspect ratios incl. **9:16 native** + 16:9 / 21:9 / 4:3 / 1:1 / 3:4 / adaptive; **silent output** (audio only as a style reference); **no camera-motion params**; async task-create + poll; pay-as-you-go. Verify whether Artificer's existing `minimax_video` guide/route is on an older version and bump it.
**Why:** Brian flagged it 2026-08-15 as a candidate engine for the Cathode Saint cinematic-music-video pilot (btmusic task #177), to A/B against Veo. Pay-per-gen + native 9:16 + FLF + reference-consistency make it attractive vs subscription-gated Google Flow. Source: MiniMax docs (URL above); btmusic #177.
**Trigger:** when the btmusic music-video pilot is scoped, or sooner if other callers want vertical short-form video.

---

## 19. Wire `gemini-omni-flash-preview` — DONE 2026-08-15

**Shipped:** `gemini_omni_generate_video` (`src/generation/gemini-omni.ts`), guide `gemini_omni_video_prompt_guide`, catalog route `gemini-omni-flash` under `video.cinematic`. A **separate tool from Veo**, not a model id on it — Omni uses the Interactions API, so the request shape, poll contract, and output shape all differ. Veo is untouched and still not deprecated by Google.

**Required a major SDK upgrade** (`@google/genai` 1.50.1 → 2.17.1, commit `da72868`). 1.50.x had no `video_config` on its interactions `GenerationConfig`. The bump was clean — 0 type errors, no source changes across the eight Google-backed tools — but the suite mocks the SDK, so **live API behavior across the Google tools is unverified**; smoke them before the next release.

**⚠️ AUDIO — corrected 2026-08-15 (second pass). Omni Flash DOES generate native audio.**

The original research said native audio, based on two Google blogs. A later pass in this same session "corrected" that to silent — **and the correction was itself wrong.** It came from reading `ai.google.dev/gemini-api/docs/video`, which is the **Veo** page, rather than `/docs/omni`, which is the page for this model. Brian caught it against the Vertex model card.

Authoritative now:
- `ai.google.dev/gemini-api/docs/omni`: *"The model generates a video with audio based on your text description"* and *"By default the model will try to generate an appropriate audio track for a video."*
- Vertex model card: *Capabilities → Sound generation: Speech, music, sound effects — **Supported***.

**The model card looks self-contradictory and is not.** Its *Modalities* row says *Audio: Not supported* — that governs the **message interface** (no audio input, no audio-only response). *Sound generation* governs the track **inside the generated video**. The technical-specs row confirms it by listing *"Maximum video length (with audio)"* separately from *"(without audio)"*. The one real consequence of the Modalities row: **no audio reference conditioning** — you cannot condition a generation on a supplied audio clip.

**There is no way to disable the audio.** No `generate_audio` flag, no silent mode. Levers are prompt-steering (describe the audio; `"No dialogue"` suppresses speech) or stripping downstream.

**Consequence for the music-video pilot — reverses the earlier note.** Every Omni clip arrives with a synthetic soundtrack that **must be stripped** before the Cathode Saint master goes under it, so the "strip/replace the baked audio" step the *original* plan called for is back. That makes **MiniMax H3 the lower-friction pick** for fixed-master B-roll: fal returns a bare video file with no audio track and no strip step. Omni's advantages remain conversational editing and native audio where you actually want diegetic sound.

**Process note worth keeping:** the failure was overriding a correct finding with a worse source and stating it confidently across the guide, tool description, catalog, and PR text. When a doc page contradicts prior research, check that it is the page for the model in question before treating it as authoritative.

**Also captured from the Vertex model card** (not previously recorded): system instructions, structured output, context caching, function calling, grounding, code execution, tuning, and batch inference are all **unsupported**; thinking and token counting are supported; up to 10 input images at 720p; SynthID plus Content Credentials (C2PA).

**Confirmed at build time:** 3–10s clips, 720p, 24fps, 16:9 and 9:16, ~$0.10/s output, stateful editing via `previous_interaction_id`. Every call returns `interaction_id` so callers can chain edits.

**VERIFIED LIVE 2026-08-17 (Brian).** A real generation completed and downloaded on 0.10.1. The request shape built from SDK types plus docs was correct; the Interactions API create/poll contract works as implemented.

**It took two bugs to get there, and the test suite caught neither:**
1. The audio claim was wrong — documentation error, corrected in #37 after Brian checked the Vertex model card. No test can verify a prose claim.
2. The download 403'd on the very first real call — Omni serves results from `generativelanguage.googleapis.com` behind the API key and the transport sent no `x-goog-api-key`. Invisible because the tests mocked `downloadAndWrite` wholesale and never inspected its arguments. Fixed in #39 / 0.10.1, with the rule extracted to a shared `geminiDownloadHeaders()` so Veo and Omni cannot diverge again.

**The durable lesson** (also in memory as `project-live-api-verification`): a green unit suite on a generation transport means "the argument shapes are plausible", not "it works". Assert on the arguments passed to a mocked boundary, keep shared helpers real via `importActual`, and get one live call before calling a transport done. Both of 0.10.0's Omni bugs were structurally outside what mocks can see.

**Still unverified:** the `@google/genai` 2.17 upgrade is now exercised live on the **Interactions path only**. Veo `generateVideos`, TTS, Lyria, and image generation have never been called against the live API on 2.17 — the suite mocks the SDK. Worth one call each before relying on them.

## 19b. Original #19 research notes (kept for history)

**What:** `gemini-omni-flash-preview` is a new Google omni/video model that Brian reports is slated to **replace Veo** going forward. Research (a) **capabilities** — video generation, native audio, multimodal in/out (text/image/audio → video), max duration + chaining, resolutions, aspect ratios incl. **9:16** for short-form; (b) **cost/pricing**; (c) **access + implementation** — gemini-language API vs Vertex AI, endpoint + request/poll shape, params. Then plan how it slots into Artificer's video capability as the **successor to the Veo route** (`gemini_generate_video` / `video.cinematic` catalog) — repoint or add alongside.

**Why:** Veo is Artificer's current premium video route; the btmusic cinematic-music-video pilot (#18 + btmusic task #177) was set to A/B Veo vs MiniMax-H3. If omni-flash supersedes Veo, wire it in so the pipeline rides the successor rather than a deprecating model. Source: Brian 2026-08-15.

**Findings (researched 2026-08-15; official Google sources):** CONFIRMED real — public preview **2026-06-30**. A Gemini-family conversational **video model with native audio** (omni-*input*: text/image/video references -> video+audio OUT; image generation is a SEPARATE model, "Nano Banana 2 Lite" — check whether Artificer's `gemini_nanobanana_generate_image` should target v2 Lite).
- **Capabilities:** text/image/reference-to-video + conversational video editing; **720p** today ("higher soon"); **3-10s clips, NO extend/interpolation yet** (concatenate downstream); 24 fps; aspect ratios **9:16 + 16:9** both confirmed.
- **Access + API:** works on **both** the Gemini Dev API (`GOOGLE_API_KEY`) and Vertex — no Vertex-only lock. **NEW surface: the Interactions API** (`POST https://generativelanguage.googleapis.com/v1beta/interactions`), NOT the Veo `google-genai` `generate_videos` call. Async: poll `GET /v1beta/files/{id}` until `state == ACTIVE`. Key params: `generation_config.video_config.task` in {`text_to_video`,`image_to_video`,`reference_to_video`,`edit`}, `response_format.type:"video"` (+`delivery:"uri"`), `previous_interaction_id` for stateful multi-turn edits, aspect ratio in config. (Audio-reference input + scene-extension = "coming soon.")
- **Cost:** **$0.10/sec** of output = same as Veo 3.1 Fast (~$1.00 per 10s clip, audio included).
- **Veo relationship:** go-forward/complement; the consumer Gemini app already routes to it. **Veo is NOT formally deprecated and has no published sunset date** — keep the Veo route alive; "replaces Veo" is strategic direction, not an API removal. (This part is community/soft; the capability/pricing/endpoint facts are official.)
- **Doc conflict flagged:** one ai.google.dev doc-fetch said "video only, no audio"; two Google blogs state native audio (and $0.10/s parity with audio-carrying Veo 3.1 Fast). Verify against the live doc before coding the audio path.

**Implementation plan for Artificer:** add as a **NEW Google video route**, NOT a rename of the Veo route (different endpoint + call shape). Same `GOOGLE_API_KEY` auth. Either a new `google-genai` SDK method if the installed version exposes `interactions`, or a direct REST call. Async+poll mirrors the MiniMax task+poll Artificer already implements (poll contract differs: Files-API `state` vs MiniMax `task_id` status). Gotchas: (a) `previous_interaction_id` chaining is a stateful concept Veo lacked; (b) no native extend -> stitch 10s clips via existing `video_concatenate`; (c) 720p ceiling today; (d) **audio is baked in** -> for a fixed-master music-video pipeline, strip/replace it (`audio_extract_from_video` / `video_set_audio`) so Omni's synthetic audio doesn't sit over the Cathode Saint master.

**Music-video pilot implication (#18 / btmusic #177):** for TikTok B-roll under a fixed Suno master, **MiniMax-H3 (silent, up to 2K)** may actually fit better than Omni (720p + baked audio to strip), since we lay our own master under anyway. Omni wins where synchronized diegetic audio + fast conversational "swap character / relight" editing matter, and once it ships >720p + scene-extension. A/B both on the actual brand look; MiniMax is the safer 9:16/2K incumbent for now. Relates to #10, #18.

**Trigger:** implementation when the music-video pilot is scoped (or sooner if another caller wants short-form vertical video). Re-verify the 720p/duration roadmap + `google-genai` `interactions` support at build time.

---

## 20. Lip-sync / singing-performance video routes (catalog + guides) — DONE 2026-09-24

**Shipped:** 13 routes under `video.lipsync`, covering every candidate below plus Heygen v3 lipsync (precision / speed) and InfiniteTalk v2v: OmniHuman 1.5, MiniMax H3 Max lip-sync, Sync-3 (v2v and avatar), Sync React-1, Kling lipsync, VEED lipsync v2, InfiniteTalk, AI Avatar Multi, Wan 2.2 speech-to-video. All go through `fal_generate_video` with its new `video` input, and each endpoint was checked to return `{ video }`. The singing guidance below (isolated vocal stem via `fal_separate_audio`, phrase chunking, duets, 720p ceilings) is in `fal_lipsync_prompt_guide`. **Still open:** the singing test run in "Not verified" below, and a live call per route (no `FAL_KEY` in the dev shell).

### Original filing (kept for history)

**What:** Seed catalog routes + a prompt guide for fal's audio-driven performance models, so a music video can put a character on camera *singing the real vocal*. Two families:

| Family | Slug candidates (all verified 200 on fal openapi 2026-09-24) | Live fal price | Notes |
|---|---|---|---|
| **image + audio → video** (generate a singing shot from a still keyframe) | `fal-ai/bytedance/omnihuman/v1.5` | $0.16/s | 30s/call at 1080p (60s at 720p); prompt + mask inputs; strongest singing claims (breath, high-note expression, body motion) |
| | `minimax/h3-max/lip-sync/image-to-video` | $0.05 (480p) / $0.08 (768p) / $0.16 (1080p) / $0.32 (2K) per s | 5-15s/call (longer audio trimmed); set `enable_transcription:false` for singing |
| | `fal-ai/ai-avatar/multi` (MultiTalk) | $0.20/s (2x at 720p) | **only live fal option for two people in one shot** (one image + one audio per person); 720p max; turn-taking, may not hold simultaneous singing |
| | `fal-ai/infinitalk`, `fal-ai/wan/v2.2-14b/speech-to-video` | ~$0.10-0.20/s | 720p max; lower priority |
| **video + audio → video** (re-lip-sync an existing Kling/Veo clip) | `fal-ai/sync-lipsync/v3` (sync-3) | $8/min (~$0.133/s) | Handles tight close-ups, profiles, occluders (mics, hands); `sync_mode` for duration mismatch (default `cut_off`); one face per pass |
| | `fal-ai/sync-lipsync/react-1` | $10/min | Also re-drives expression/head motion (`emotion` enum); for when the source clip's acting is flat |
| | `fal-ai/kling-video/lipsync/audio-to-video` | $0.014 per input-video second, **rounded up to 5s increments** | Very cheap first-pass tool; 2-10s input clips (fits Kling/Veo clip lengths) |

Skip: `fal-ai/bytedance/omnihuman` (1.0, $0.14/s, superseded by 1.5), `fal-ai/sync-lipsync/v2/pro` (superseded by sync-3), `fal-ai/hunyuan-avatar` (~$0.28/s, poor value), LongCat Multi-Avatar (deprecated on fal).

**Why:** btmusic (Cathode Saint) cinematic-music-video pilot. The current catalog has only `kling-ai-avatar-v2-pro` ($0.115/s, 60s audio cap on fal) and `veed-fabric-1.0` (720p ceiling, talking-head tuned). Neither is the right pick for photoreal 1080p *singing*, and there is no video+audio re-lip-sync route at all. The third-party music-video platforms evaluated 2026-09-24 (Flova, ACE Studio, MusVideo, SunoMV, Neural Frames, Freebeat, etc.) were mostly resellers of the same fal models; **on-camera lip-sync was the one capability they had that Artificer lacked.**

**Likely no new transport needed.** `fal_generate_video` already maps `image_url` + `audio_url`, and `video_url` can ride `extra_params` + `extra_files` (upload via `resolveForFal`). **Confirm at build:** each output schema returns a single `video` File that the existing downloader handles; per #19's lesson, make one live call per route before calling it done (mocks can't see output-shape surprises).

**Scope decision to re-open:** #6 records that video-sync (lip-sync to existing video) was *explicitly excluded from Phase 5 by user direction*. This filing asks to reverse that for the vid+audio family. It does not require building #6's general `fal_edit_video` transport.

**Guide content (singing-specific, the part the vendor docs don't cover):**
- Feed the **isolated vocal stem**, not the full mix (drums/guitars read as mouth motion; reverb tails smear word endings). Lay the full master back over the finished edit. Relates to #21.
- Chunk long passages at **phrase boundaries** to fit per-call caps (OmniHuman 30s at 1080p, H3 Max 15s); start each chunk slightly before the vocal entrance so the first consonant has room.
- **Duets:** no fal model reliably renders two faces singing at once. Default to single-singer shots; for a two-shot, run sync-3 twice (one face + that singer's audio per pass). Demucs does not split two vocalists, so duet vocals must be split by timestamp (mute the other voice's lines) before per-singer passes.
- Resolution ceilings: MultiTalk / InfiniteTalk / Wan S2V / Fabric are 720p max, which rules them out for 1080p hero shots.

**Not verified:** singing quality beyond vendor claims (no independent belting / sustained-vowel / fast-lyric tests found); sync-3 max duration; Kling Avatar output resolution on fal. A small bake-off (one sustained-note phrase + one fast-lyric phrase through OmniHuman 1.5, H3 Max, sync-3) would settle ranking for ~$5-10. Candidate first use of #1's generalized harness (a lip-sync rubric already exists there).

**Not on fal (out of scope here):** Hedra Character-3 ($0.0625/s at 1080p, 10-min clips) is only on Hedra's own API. If the bake-off shows the fal options losing on singing, that becomes a separate non-fal provider decision.

**Trigger:** btmusic music-video pilot needs an on-camera singing shot (the Beneath the Masks pilot shot list has none; the next video with a singing character would).

---

## 21. Audio stem separation transport (`fal_separate_audio`) — DONE 2026-09-24

**Shipped:** `fal_separate_audio({ model, audio, output_dir, basename?, stems?, extra_params? })`, with a new `audio` catalog capability, sub-class `separation`, seeded with `fal-ai/demucs` (slug `demucs-stem-separation`, $0.0007/s of input). It writes each stem the model returns as `<basename>-<stem>.<ext>` (extension taken from the returned file, never forced) and returns the stem → path map. Demucs's own `model` input (network choice, e.g. `htdemucs_6s` for guitar/piano) goes in `extra_params`, since the top-level `model` is the fal endpoint. Guide: `fal_stem_separation_prompt_guide`, including the duet limitation below. `fal-ai/sam-audio/*` was considered and left out: its output is `{target, residual}` (one prompted source), not per-stem files, so it would need its own shape.

### Original filing (kept for history)

**What:** A transport for `fal-ai/demucs` (verified live 2026-09-24): **$0.0007/s** of input audio (a 5-min song ≈ $0.21). Inputs: `audio_url`, `model` enum (`htdemucs_6s` default; also `htdemucs`, `htdemucs_ft`, `hdemucs_mmi`, `mdx`, `mdx_extra`, `mdx_q`, `mdx_extra_q`), `stems` list (vocals / drums / bass / guitar / piano / other). Seed a new `audio.separation` catalog sub-class.

**Why:** Prerequisite for #20 (lip-sync wants the isolated vocal stem). Also useful on its own: instrumental / karaoke versions, TikTok stems, cleaner Scribe v2 transcription for karaoke timing (vocals-only input should cut ASR misses on dense mixes; relates to #7).

**Why a new transport, not `extra_params` on an existing one:** output is **multiple files** (one per stem), and no current fal transport downloads a multi-file result. Output handling = write each stem as `{basename}-{stem}.{ext}` next to the input (or into an `output_dir`) and return the path map.

**Context:** Suno-generated tracks can export stems natively, so Cathode Saint mostly needs this for non-Suno sources (MiniMax-era Album 1 tracks are single mixed files) and as a fallback. **Limitation to document:** all models output one combined `vocals` stem; they do not separate two singers (duets).

**Trigger:** the first #20 lip-sync route used on a mixed master, or the first request for an instrumental/karaoke version.

---

## 22. Luma Ray 3.2 routes (multi-keyframe i2v, v2v modify, reframe) — DONE 2026-09-24

**Shipped:** `luma-ray-3.2-t2v`, `-i2v` (under `video.cinematic`, rows added to `luma_ray_prompt_guide`), plus `luma-ray-3.2-v2v` and `-reframe` (under `video.edit`, in `fal_video_edit_prompt_guide`). Multi-keyframe input goes through `extra_files: { keyframes: [...] }` and `extra_params: { keyframe_indexes: [...] }`. **Not yet written up:** the keyframe-index math (frame positions at 24 fps, not seconds) that this item says the guide must spell out. The `luma_ray_prompt_guide` body still describes Ray 2, so extending it properly is a follow-up.

### Original filing (kept for history)

**What:** Seed `luma/agent/ray/v3.2/*` (note: **no `fal-ai/` prefix**, like H3), verified live 2026-09-24:
- `.../image-to-video`: first/last frame (`image_url` + `end_image_url`) **or** `keyframes` (1-64 image URLs) + `keyframe_indexes` (output-frame positions at 24fps: 5s → 0-120, 10s → 0-240). The two modes are mutually exclusive. **10s and HDR only unlock with multi-keyframe input.** Price per 5s: $0.15 (540p) / $0.30 (720p) / **$1.20 (1080p) ≈ $0.24/s**; HDR 1080p $2.40/5s.
- `.../video-to-video` (modify an existing clip): 1080p $2.16/5s ≈ **$0.43/s**.
- `.../reframe` and `.../text-to-video`.

**Why:** Two capabilities the current pipeline lacks. (a) **Choreographed motion inside one clip**: pin several keyframes, not just start and end. Our FLF chains (Kling O3 Pro) anchor only two frames per clip, so mid-clip beats drift (the FLF beat-sync limitation logged in btmusic's lyric-video workflow). (b) **Fix a take instead of re-rolling it** via v2v modify, which protects continuity across a long chain. Runway Aleph was the other candidate for (b) but is **not on fal**.

**Context:** Check whether the existing `luma_ray_prompt_guide` covers only Ray 2; extend it rather than forking. The keyframe-index math (frame positions, not seconds) is the gotcha the guide must spell out. Cost is ~2x Kling O3 Pro per second at 1080p, so the guide should frame it as a hero-shot / repair tool, not the default chain model. `keyframes` is a URL list, so it needs `extra_files` array support (already exists in `resolveExtraFiles`).

**Trigger:** a music-video shot that needs mid-clip choreography, or a chained clip worth repairing rather than regenerating.

---

## 23. Sora 2 routes: verify status — CLOSED 2026-09-24 (covered by the drift cron)

Closed without separate work: the weekly drift job (#2) catches both failure modes this item worried about. A dead route 404s and turns the job red; a silent redirect shows up as a `deprecated` notice. Its first run after the #46 fix (2026-09-24) reported neither for `sora-2-*`. If a Monday run flags them, retire them per the #18b pattern.

### Original filing (kept for history)

**What:** Secondary research on 2026-09-24 reported that OpenAI shut down the Sora app on 2026-04-26 and **sunsets the Sora API on 2026-09-24** (citing an OpenAI Help Center article). As of the same day, fal still answers 200 on `fal-ai/sora-2/text-to-video` and `fal-ai/sora-2/image-to-video/pro`, still lists $0.10/s, and shows **no deprecation notice**.

**Why:** If upstream is gone, the fal routes will 404, or worse, get silently re-pointed. The weekly drift cron (#2) catches both 404s and deprecation notices, so this mainly guards the window before the next Monday run.

**Action:** On the next drift PR (or with one cheap live call), confirm. If dead, retire the `sora-2-*` routes and update `sora_video_prompt_guide` per the #18b retirement pattern. Not verified from a primary OpenAI source.

---

## 24. Seamless-loop helper (`video_make_loop`) (local ffmpeg) — DONE 2026-09-24

**Shipped** as `video_make_loop` with `mode: rebound | crossfade | check`. What changed from the filing below, and why:

- **`target_duration` became `max_duration` + `min_duration`.** Clamping a *finished* loop to a target cuts it mid-cycle and puts the seam back. So `max_duration` trims the **source** before the loop is built, and `min_duration` repeats **whole cycles**. If both can't hold, the seamless length wins and the result carries a warning.
- **Everything is frame-exact.** Rebound is `2n − 2` frames: the turn-around frame and the wrap frame are each dropped from the reversed half, since otherwise each shows twice and stalls. Crossfade output is `n − k` frames.
- **The crossfade uses `blend` with a timestamp ramp, not `xfade`.** Measured: both `xfade` and a frame-counter (`N`) ramp leave a faint ghost of the tail on the last frame, so the seam scored below the clip's own frame steps. With a `T` ramp the last frame is the clean head frame, and the seam scores the same as the source's natural step (0.909 vs 0.910).
- **The `check` verdict is relative, not a fixed threshold.** It compares the last→first SSIM against the clip's own frame-to-frame SSIMs (below the 10th percentile counts as a seam). Fast footage has low adjacent SSIM everywhere, so an absolute cutoff would fail good action loops and pass bad static ones. Every built loop is also checked, and the result reports it.
- **Memory guard for `rebound`.** FFmpeg's `reverse` buffers the whole clip, so the tool refuses more than about 1.5 GB of decoded frames (~16s at 1080p) and names `max_duration` as the fix.
- **Always silent H.264 yuv420p**, as filed.

### Original filing (kept for history)

**What:** A local (non-fal) video tool in the existing `video_*` family that turns a clip into a seamless loop for platform loop surfaces. Modes:
- `rebound`: play forward then reversed (`reverse` + concat), dropping the duplicated turn-around frames so there is no stutter at either end. Matches Spotify Canvas's own "rebound" loop style.
- `crossfade`: blend the tail into the head (`xfade` of the last N ms over the first N ms, output shortened by N) so a clip whose first and last frames differ still loops without a visible jump.
- `check`: report the seam delta (e.g. SSIM/PSNR of last frame vs first frame) so a caller can tell whether a first=last-frame generation actually closed the loop before shipping it.
Plus: `target_duration` (clamp or pad to a platform window, e.g. Canvas 3-8s), and always output **silent** (loop surfaces play over the track).

**Why:** btmusic Spotify Canvas pipeline (per-track 9:16 loops, 3-8s). Canvas is harvested from music-video "loop shots" or generated standalone; generated clips rarely close the loop exactly, even with first=last-frame anchoring. Today this is hand-rolled ffmpeg every time. Also applies to Apple motion art (seamless loop is a hard rejection criterion, if that path ever opens) and to TikTok/IG ambient loops.

**Context:** Building blocks already exist in `src/video/index.ts` (the `xfade` chain in `video_concatenate`, the forced `yuv420p` libx264 path) and `src/content/index.ts` (a `-reverse` use). Reverse loads the whole clip into memory, which is fine for ≤10s loops; document the length guard. Out of scope for the fal-only filings (#20-23) by design: this is local processing.

**Trigger:** first btmusic Canvas export.

## 25. nano-banana: output format mismatch + no resolution knob — DONE 2026-09-24

**Shipped**, with all three fix options:
- **Format follows the extension.** The returned bytes are sniffed (magic bytes, not the API's MIME type), and when they disagree with a `.png` / `.jpg` / `.webp` / `.gif` output they are converted with ImageMagick. Matching bytes are written untouched. An extension the tool cannot convert to (e.g. `.tiff`) is written as-is, and the result says what the bytes actually are, instead of mislabeling silently. The result line now reports pixel size and any conversion: `saved to bust.png (896×1200, converted from JPEG to PNG)`. Requesting PNG from the API is not possible: `outputMimeType` / `imageOutputOptions` are Vertex-only per the SDK types.
- **`image_size`: `1K | 2K | 4K`**, sent only when set, so existing calls keep the 1K default. Values come from the pinned SDK's `ImageConfig` type. **Not yet confirmed live** (no `GOOGLE_API_KEY` in the dev shell). The first real 2K call should confirm that the result reports the larger dimensions.
- **Reference images** are sent with the MIME type of their bytes, falling back to the extension.

**Alternative noted, not taken:** fal hosts the same model (`fal-ai/nano-banana-2`) with native `output_format` and `resolution` knobs, at about 6–20% more per image ($0.08 at 1K vs $0.067 direct). Relevant to #5.

### Original filing (kept for history)

**Observed (btmusic vocalist busts, 2026-09-24):** every `gemini_nanobanana_generate_image` call with `output: "*.png"` (models `gemini-3-pro-image` and `gemini-3.1-flash-image`) wrote **JPEG bytes into a `.png` file** (`magick identify` → `JPEG 896x1200`). All outputs were **896×1200** at 3:4 (≈1K), although the catalog prices 2K and 4K tiers for this model.

**Cause (read in `src/generation/nanobanana.ts`):**
1. Line ~98-108: `ext = extname(output) || '.png'`, then the returned `inlineData` bytes are written verbatim with `inline.mimeType ?? 'image/png'`. The model returns `image/jpeg`; nothing converts or renames, so the extension lies.
2. No image-size parameter is sent (Gemini image config `imageSize` e.g. `"1K" | "2K" | "4K"` on the models that support it), so every call gets the default ~1K. There is no way to buy the 2K/4K tier the catalog advertises.
3. Latent: `mimeFromPath(reference_images[i])` trusts the extension, so these same mislabeled files get sent back as `image/png` when reused as references. It worked in practice, but it is the wrong MIME type on the wire.

**Why it matters:** downstream tools that key off the extension break silently. btmusic's brand-metadata pipeline writes **PNG tEXt** chunks, which do not exist in a JPEG, so assets would ship untagged. Canonical brand masters also need ≥2K. (btmusic worked around it by re-encoding with `magick ... PNG:out.png`.)

**Fix options:**
- Honor the requested extension: if `output` ends in `.png` and the model returned JPEG, transcode (sharp/ImageMagick is already a dependency of the image tools), or write the true extension and return the real path. At minimum return the actual MIME type/extension in the tool result and warn.
- Add `image_size` (`1K`/`2K`/`4K`) to the tool schema, pass it through to the Gemini image config, and document the per-tier price from `model_catalog` in `gemini_nanobanana_prompt_guide`.
- Sniff reference-image MIME from magic bytes, not the extension.

**Trigger:** now. It affects every brand asset produced through this route.

---

## 26. Video-to-audio (foley / SFX for silent clips) (NEW, filed 2026-09-24, follow-up)

**What:** Generate sound effects and ambience synchronized to what is on screen, from a silent video: footsteps on the frames they land, impacts, weather. fal hosts several current models (from its `video-to-audio` category, 2026-09-24): Mirelo SFX 1.6 / 1.5 video-to-audio, HunyuanVideo-Foley, MMAudio v2, Kling video-to-audio, ThinkSound, Sonilo.

**Why:** Many video models return silent clips (Wan, most LTX, Hunyuan, many i2v models). Social b-roll, ads and product shots need believable sound, and a controllable SFX layer can replace a model's baked-in audio (Veo 3, Kling 3, Seedance 2, Omni), which cannot be adjusted.

**Why not now:** btmusic's audio is the song, and Spotify Canvas loops are silent by design. Newer flagship video models increasingly generate their own audio. Deferred on 2026-09-24 by user direction.

**Likely shape:** a `video` input on `fal_generate_music` (→ `video_url`, same as the video transport got in the catalog-expansion PR), plus catalog entries under `music.sfx` and a grouped guide. Check each model's output: some return a muxed video rather than audio.

**Trigger:** first pipeline that needs synchronized SFX on silent generated footage.

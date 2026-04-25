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

## 2. Automated fal spec drift detection

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

**Trigger to pick this up:** After sync script has been running manually for a month or two and the diffs are stable / non-noisy.

**Depends on / blocked by:** `scripts/sync-fal-specs.mjs` shipping in Phase 1.

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

## 4. fal speech-to-text (transcription) capability — SCOPE LOCKED 2026-04-25

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

## 5. fal image-to-image transport (`fal_edit_image`)

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

## 6. fal video-to-video transport (`fal_edit_video`)

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

---

## 7. Forced-alignment via ASR-wrapper (`align_text_to_audio`)

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

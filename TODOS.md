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

## 9. Brand spec — broaden nested schema OR tighten nested validation

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

## 12. Image composite/canvas fixes

**What:** (a) Fix `composite` **color desaturation** — a gold overlay composited onto black came back silver on both `Over` and `Lighten` blends; source + resize verified gold, so the op is at fault. (b) Add an **asymmetric-pad / extend-canvas** tool so "logo centered on a banner" doesn't need the resize-fit + border + stretch workaround.
**Why:** hit while building YouTube/Bandcamp banners 2026-05-27. Source: btmusic `instructions/artificer-prompts.md` Learnings 2026-05-27.
**Trigger:** next brand-asset/banner pass.

## 13. background-remove — flood-fill toggle + ML-segmentation mode

**What:** (a) The tool description advertises "color keying or flood fill" but the schema only exposes `target_color`/`fuzz`/`replace_color` — add the **flood-fill** (BG-connected pixels only) path; fixes the white-BG swiss-cheese case. (b) Add an **ML-segmentation mode** (wrap rembg / U²-Net) for soft-glow and photographic backgrounds that color-keying can't handle.
**Why:** brand glow-on-dark assets currently require a luminance-as-alpha ffmpeg workaround. Source: btmusic `instructions/bg-removal-recipes.md` "Artificer upstream gaps".
**Trigger:** next asset needing a soft/photographic BG cutout.

## 14. audio_info probe primitive — DONE 2026-08-15

**Shipped:** `audio_info` registered in `src/audio/index.ts` (schema in `src/audio/types.ts`), built on the existing `ffprobe` helper. Returns codec (short + long name), container, duration (`H:MM:SS.mmm` + raw seconds), sample rate, channels + layout, bitrate, and file size. Falls back to container-level duration/bitrate when the stream omits them (MP3 does), renders unknown fields as `—` rather than `NaN`, and reports a clear message when a file has no audio stream. Went with a separate tool rather than MIME-dispatching `info`, so the image path stays untouched. Tool count 163 → 164.

**Coverage note:** 5 unit tests cover the parsing/formatting logic against realistic ffprobe JSON. No live ffprobe run — ffmpeg is not on PATH in the dev environment used, so the ffmpeg integration suite auto-skipped.

Source: btmusic memory `artificer_mcp.md`.

## 15. MiniMax music prompt-guide corrections — DONE 2026-08-15

**Shipped:** `src/guides/minimax-music.ts` rewritten against btmusic's primary sources (`lyric-length-tactics.md`, `minimax-cover-findings.md`, `artificer-prompts.md`) rather than MiniMax's docs. All six items landed, plus `[Tag, Specifier]` narrow support, the write-every-chorus-out rule, positive-descriptors-only, and the nested `audio_setting.format` WAV knob. The guide now opens with an explicit "documents observed behavior, not published claims" banner.

**⚠️ One source conflict, resolved in the guide — worth a second look:** `lyric-length-tactics.md` (2026-05-24, Album 1 vocal tracks) locks **lyric line count as the duration lever** with a projection table. `minimax-cover-findings.md` (2026-06-11, Album 2 instrumentals, n=10) **falsifies** section count / `[Inst]` density / lyric-field volume as levers and concludes duration is a prompt-independent draw (~2:30–4:40) where the only method is batch-and-select. The guide documents both and scopes them — line count is a real lever on **vocal** tracks; on instrumental/skeleton-only generations length collapses to a random draw. If that reconciliation is wrong, the Duration section is the thing to fix.

**Still open:** the paren-singing divergence is worth reporting upstream to MiniMax — not done.

## 16. fal_generate_music — WAV output knob — PARTIALLY DONE 2026-08-15

**Documented, not normalized.** The MiniMax guide (#15) now carries an explicit warning section: there is **no top-level `audio_format` parameter** on `fal-ai/minimax-music/v2.6` — confirmed against the committed spec at `src/catalog/fal-specs/minimax-music-2.6/openapi.json`, which exposes only nested `audio_setting` (`format` mp3|wav|pcm, `sample_rate`, `bitrate`). fal drops the unknown key silently, hence the MP3 surprise. The guide gives the canonical `extra_params` shape and tells WAV-pipeline callers to check the returned `mime`.

**Deliberately NOT normalized at the transport.** Mapping a top-level `audio_format` onto per-model wire keys would put model-shape knowledge in the server, which conflicts with the thin-transport stance (`fal_generate_music` merges `extra_params` straight through by design). If we revisit: the cheaper move is a stderr warning for known-ignored top-level keys, reusing the collision-warning pattern at `src/generation/fal/music.ts:95` — that's the remaining work on this item.

Source: btmusic `instructions/artificer-prompts.md` 2026-06-05.

## 17. Music-model guide + catalog accuracy (ElevenLabs / Lyria 3) — DONE 2026-08-15

**Shipped, all three parts:**
- (a) ElevenLabs Music guide corrected. It **does** support vocals and authored lyrics — via `composition_plan` sections carrying a `lines` array (max 30 lines/section, 200 chars/line), verified against the ElevenLabs Music API reference. The old "no native lyrics support / primarily instrumental" reasoning is replaced with the accurate constraint: no lyrics field in *prompt mode*, and no vocalist-level control (per-section multi-vocalist is partial/unreliable). Routing conclusion unchanged.
- (b) **Lyria 3 vocal capability confirmed — Brian was right.** Google's music-generation docs state it delivers "structural coherence, including vocals, timed lyrics, and full instrumental arrangements." The guide's "Lyria 3 is mostly instrumental; avoid vocal requests" line was wrong — it had carried Lyria 2's instrumental-only constraint across. Replaced with a "Lyria 3 sings" section that contrasts it against fal-hosted Lyria 2.
- (c) New optional `vocals` field on catalog entries (`"vocal_capable"` | `"instrumental_only"`), typed in `src/catalog/catalog.ts` and passed through `filterCatalog` — note the filter reconstructs entries field-by-field, so any future entry-level field must be added there too or it is silently dropped. Applied to lyria-3, eleven-music, minimax-music-2.6 (vocal_capable) and lyria-2, stable-audio-2.5 (instrumental_only). Lyria 3's cost normalized to real figures from Google's pricing page ($0.04/song clip, $0.08/song Pro); Lyria RealTime has no published per-unit price and now says so explicitly instead of implying one exists.

Source: btmusic memory `artificer_mcp.md`, `instructions/artificer-prompts.md` catalog caveat.

## 18. MiniMax video generation v2 (MiniMax-H3) support

**What:** Add / update MiniMax video-gen support to the **v2** API (`https://platform.minimax.io/docs/api-reference/video-generation-v2-create`). Model **MiniMax-H3**. Modes: text-to-video, image-to-video (first frame), first/last-frame, and reference-to-video (subject/style consistency; accepts reference images/video/audio). Constraints to encode in the guide: **4-15s per clip, no native chaining**; resolutions 768P / 2K; aspect ratios incl. **9:16 native** + 16:9 / 21:9 / 4:3 / 1:1 / 3:4 / adaptive; **silent output** (audio only as a style reference); **no camera-motion params**; async task-create + poll; pay-as-you-go. Verify whether Artificer's existing `minimax_video` guide/route is on an older version and bump it.
**Why:** Brian flagged it 2026-08-15 as a candidate engine for the Cathode Saint cinematic-music-video pilot (btmusic task #177), to A/B against Veo. Pay-per-gen + native 9:16 + FLF + reference-consistency make it attractive vs subscription-gated Google Flow. Source: MiniMax docs (URL above); btmusic #177.
**Trigger:** when the btmusic music-video pilot is scoped, or sooner if other callers want vertical short-form video.

---

## 19. Research + wire `gemini-omni-flash-preview` (forthcoming Veo successor)

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

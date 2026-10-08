# Artificer TODOs

Deferred work with enough context that someone picking it up in 3 months knows what to do. Not a task tracker — a place to capture "we decided to not do this now, and here's why."

Completed items move to [docs/history/completed-todos.md](docs/history/completed-todos.md). Numbers are never reused.

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

## 9b. Teach generation tools to consume the new brand slots (NEW, filed 2026-08-15)

**What:** `colors.background`, `colors.highlight`, `fonts.mono` / `sans` / `display` are now first-class in the spec and resolvable, but no tool reads them automatically. Decide which should: e.g. should `gemini_generate_image` compose `colors.background` into prompts, should text-overlay tools pick `fonts.mono` for technical text, should social-card workflows use `highlight` for contrast text?

**Why:** #9 fixed the schema; this is the half that makes the new slots do anything on their own. Until then callers pass them per-call, which works but is what the spec abstraction was supposed to remove.

**Caution:** any tool that starts auto-injecting a brand slot changes output for existing callers who never asked for it. Prefer opt-in parameters or an explicit precedence rule over silent injection.

**Trigger:** when a caller asks why setting `colors.background` didn't change anything, or when the btmusic pipeline wants it wired.

---

## 13b. background-remove: offline ML-segmentation mode

**What:** A local ML mode (rembg / U²-Net) inside `background-remove`, for soft-glow and photographic backgrounds that neither `color-key` nor `flood-fill` can cut. Part (a), flood-fill, shipped 2026-08-15 (see #13 in [the history](docs/history/completed-todos.md)).

**Why it's deferred:** it adds a new binary/model dependency. Since 2026-09-24, ML cutouts are also available remotely through `fal_generate_image` with the `image.background_removal` routes (see `fal_background_removal_prompt_guide`). So this item covers only the **offline / local** case. Brand glow-on-dark assets still use the luminance-as-alpha ffmpeg workaround.

**Trigger:** the fal route proves insufficient for glow-on-dark brand assets, or an offline cutout is needed.

---

## 20. Lip-sync singing comparison (remaining from #20)

**What:** The catalog and guide shipped 2026-09-24 (see #20 in [the history](docs/history/completed-todos.md)). What remains is the small bake-off: run one sustained-note phrase and one fast-lyric phrase through OmniHuman 1.5, H3 Max and sync-3 (about $5–10) to rank them for singing, plus a live call on each route not yet exercised.

**Already confirmed live (#27):** OmniHuman 1.5 and the sync-3 avatar. H3 Max ran, but with the problems recorded in #27.

**Candidate** first use of #1's generalized harness, since a lip-sync rubric already exists there.

**Trigger:** the next btmusic video with a singing character.

---

## 22. Luma Ray 3.2 keyframe guide write-up (remaining from #22)

**What:** The routes shipped 2026-09-24 (see #22 in [the history](docs/history/completed-todos.md)), but `luma_ray_prompt_guide` still describes Ray 2. Extend it rather than forking it, and spell out:
- The keyframe-index math: `keyframe_indexes` are output-frame positions at 24 fps, not seconds (5s → 0–120, 10s → 0–240).
- `keyframes` (1–64) and first/last frame are mutually exclusive. 10s and HDR unlock only with multi-keyframe input.
- Cost framing: about 2× Kling O3 Pro per second at 1080p, so present it as a hero-shot and repair tool, not the default chain model.

**Trigger:** a music-video shot that needs mid-clip choreography, or the next edit to the Luma guide.

---

## 26. Video-to-audio (foley / SFX for silent clips) (NEW, filed 2026-09-24, follow-up)

**What:** Generate sound effects and ambience synchronized to what is on screen, from a silent video: footsteps on the frames they land, impacts, weather. fal hosts several current models (from its `video-to-audio` category, 2026-09-24): Mirelo SFX 1.6 / 1.5 video-to-audio, HunyuanVideo-Foley, MMAudio v2, Kling video-to-audio, ThinkSound, Sonilo.

**Why:** Many video models return silent clips (Wan, most LTX, Hunyuan, many i2v models). Social b-roll, ads and product shots need believable sound, and a controllable SFX layer can replace a model's baked-in audio (Veo 3, Kling 3, Seedance 2, Omni), which cannot be adjusted.

**Why not now:** btmusic's audio is the song, and Spotify Canvas loops are silent by design. Newer flagship video models increasingly generate their own audio. Deferred on 2026-09-24 by user direction.

**Likely shape:** a `video` input on `fal_generate_music` (→ `video_url`, same as the video transport got in the catalog-expansion PR), plus catalog entries under `music.sfx` and a grouped guide. Check each model's output: some return a muxed video rather than audio.

**Trigger:** first pipeline that needs synchronized SFX on silent generated footage.

---

## 27. Lip-sync guide: H3 Max gotchas from the first live singing test (NEW, filed 2026-09-24)

From btmusic's first live run of `video.lipsync` routes (marble-statue bust + isolated vocal stem, 10-12s phrases):
- **`minimax/h3-max/lip-sync/image-to-video` rejects lowercase resolution.** `resolution: "1080p"` → 422 `literal_error: Input should be '480P', '768P', '1080P' or '2K'`. The `fal_generate_video` schema text says "e.g. 480p, 720p, 1080p" and the lip-sync guide doesn't mention casing. Add the enum to `fal_lipsync_prompt_guide` (and consider case-normalizing the pass-through where a route's enum is known).
- **H3 Max hallucinates scene content and camera moves on stylized subjects:** it added a museum placard with text into every frame, zoomed the camera from bust to close-up unprompted, and drifted the face. Note: H3 Max lip-sync has **no prompt input**, so these behaviors can't be prompted away. The only knobs are `resolution` (native `768P` default; `1080P` is a refinement pass over a 768P base, a plausible source of the zoom/drift), `enable_transcription`, and `seed`. The guide should say this and warn that it's untested for locked-framing / identity-critical shots.
- **Confirmed working live:** OmniHuman 1.5 (`fal-ai/bytedance/omnihuman/v1.5`, `resolution: "1080p"` → 1248×1664 for a 3:4 input), sync-3 avatar (`fal-ai/sync-lipsync/v3/image-to-video`, returns native input resolution), `fal_separate_audio` (Demucs `htdemucs_ft`), and `align_text_to_audio` (33/33 lines matched; note the first word's start can stretch back across a long instrumental intro).

---

## 28. Google preview video models deprecated on 2026-10-22 (NEW, filed 2026-10-08)

**Notice (Google, received 2026-10-08):** these Gemini API models are deprecated effective **October 22, 2026**:
- `gemini-omni-flash-preview`
- `veo-3.1-generate-preview`
- `veo-3.1-fast-generate-preview`
- `veo-3.1-lite-generate-preview`

**Omni: done 2026-10-08.** Google's migration target is `gemini-omni-1.1-flash`. The default, the `gemini-omni-flash` catalog route, the guide, the README and UPGRADING.md all use it now. Still to do: one live call in the consuming project. Also, the 1.1 API adds `response_format.resolution` (`360p` / `720p` / `1080p` / `4k` upscaled) and an `extend` task (up to 40s total). The tool sends neither yet, and the guide says so. Expose them if a caller needs above-720p or longer Omni clips.

**Veo: open.** The notice names no Veo replacement IDs. Find the successors on Google's deprecations and models pages (ai.google.dev) before changing anything. Do not guess an ID.

**What still references them here:**
- **`veo-3.1-lite-generate-preview`:** the google route on `veo-3.1-lite-t2v` (`models.json`), two lines in `src/guides/veo.ts`, `scripts/seed-video-catalog.mjs` and the `tests/unit/catalog/catalog.test.ts` fixture (a fixture string, so it can stay or move).
- **`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`:** not referenced. Callers may still pass them by hand, so the Veo guide should name the successors.
- **Not affected:** the fal routes (`fal-ai/veo3.1*`, `google/gemini-omni-flash/v1.1/*`), which fal versions separately. The `gemini_generate_video` default is `veo-2.0-generate-001`, which isn't on this list. Check while you're there whether it's on a separate notice.

**Fix shape:** repoint the Lite route to its successor ID, or retire it the #18b way if there is none (the fal `fal-ai/veo3.1/lite` route stays). Name the successors in `veo_video_prompt_guide`. Make one live call per repointed ID in the consuming project; nothing here has a key.

**Trigger:** now. The deadline is 2026-10-22.

---

## Loose ends from completed items

These are small follow-ups left by items in [the history](docs/history/completed-todos.md). None of them is worth its own number until a trigger fires.

- **#10:** `gemini-3.1-flash-lite-image` and `gemini-3-pro-image` are documented in the nano-banana guide but not seeded as Google catalog routes. The fal equivalents are seeded.
- **#11:** the Vertex success path of `gemini_upscale_image` has never run live. Only the failure path has been exercised.
- **#15:** the MiniMax paren-singing divergence was never reported upstream.
- **#18b:** the `safety` capability is empty. Re-seed `safety.text` if a fal-hosted classifier reappears. Until then, `fal_classify_text` needs an explicit model.
- **#19:** on `@google/genai` 2.17, only the Interactions path (Omni) and nano-banana (#25, 2026-09-24) have run live. Veo `generateVideos`, TTS and Lyria have not.

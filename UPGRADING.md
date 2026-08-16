# Upgrading artificer-mcp

Breaking changes and the migration for each, newest first.

`CHANGELOG.md` is generated from commit subjects and lists _what_ shipped. This
file exists for the smaller set of changes that need a caller to **do
something** — and for the ones the generated changelog does not surface at all,
because they landed under a commit type it hides.

---

## 0.9.1 → 0.10.0

Three changes require action. Each fails loudly rather than silently, so the
symptom is an error message you can match against the sections below.

### 1. Imagen is retired — `gemini_generate_image` and `gemini_edit_image` no longer default `model`

**Symptom.** A call that used to work with no `model` argument now fails schema
validation with a missing-required-field error on `model`.

**Why.** Google issued a shutdown notice on `imagen-4.0-generate-001`. Rather
than keep a default pointing at a model that will stop answering, both tools now
require `model` explicitly. Nothing was repointed automatically: silently
swapping in a different model would change what your images look like without
telling you.

**Migration — preferred.** Move to Nano Banana, which is the successor for this
work:

```diff
- gemini_generate_image({ prompt: "...", output: "./out.png" })
+ gemini_nanobanana_generate_image({ prompt: "...", output: "./out.png" })
```

For edits, `gemini_nanobanana_generate_image` takes `reference_images` instead of
a separate edit tool.

Some Imagen knobs have no Nano Banana equivalent and are simply gone:
`negative_prompt`, `seed`, `number_of_images`, per-category safety levels, and
`enhance_prompt`. Fold a `negative_prompt` into the positive prompt — instead of
`negative_prompt: "blurry, watermark"`, write `"...sharp focus throughout, clean
composition with no text or watermarks"`. Call `gemini_image_prompt_guide` for
the full capability map.

**Migration — if you must stay on Imagen.** The transports are still registered;
only the default is gone. Pass `model` per call, or restore a default with an env
var:

```bash
ARTIFICER_IMAGEN_MODEL=<the model id you were using>
ARTIFICER_IMAGEN_EDIT_MODEL=<the edit model id you were using>
```

This is a deliberate escape hatch, not a recommendation — the underlying model
still has a shutdown notice against it.

**Also new in the same area:** `negative_prompt` now throws on the Gemini
Developer API instead of being rejected confusingly by the endpoint. The error
names the fix, and Vertex AI deployments still accept it — set
`GOOGLE_CLOUD_PROJECT` to use that path. `gemini_upscale_image` is Vertex-only
and now says so up front, naming `GOOGLE_CLOUD_PROJECT`,
`GOOGLE_CLOUD_LOCATION`, and `gcloud auth application-default login`, rather
than failing deep inside the SDK.

### 2. `ARTIFICER_BRAND_SPEC` now rejects unknown nested keys

**Symptom.** The server fails at startup:

```
ARTIFICER_BRAND_SPEC failed schema validation: colors: unknown key(s)
"backgroundColor" — accepted here: primary, primary_name, secondary,
secondary_name, background, background_name, highlight, highlight_name,
extras. Put anything else under colors.extras (an object of name → value)
```

**Why.** The schema was sealed at the root but open at every nested level, so
unknown keys inside `colors`, `fonts`, `tts`, `music`, and `logo` were silently
dropped. Callers wrote fields that vanished with no error and then had to
round-trip `brand_spec_get` to work out what the schema really accepted. Those
objects are now sealed too.

**This is strictly a config change — no code changes.** The error names the
offending key and lists every accepted slot, so the fix is usually visible in the
message itself.

**Migration.** Most keys that used to disappear now have a real home, because the
schema was broadened in the same change:

| Was silently dropped                                         | Now                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| `colors.background`, `colors.highlight` (+ `_name` variants) | first-class slots                                         |
| `fonts.mono`, `fonts.sans`, `fonts.display`                  | first-class slots                                         |
| anything else                                                | `colors.extras` / `fonts.extras`, objects of name → value |

```diff
  "colors": {
    "primary": "#39FF14",
-   "backgroundColor": "#0A0A0A"
+   "background": "#0A0A0A",
+   "extras": { "phosphor_glow": "#7CFF6B" }
  }
```

**Resolver behavior worth knowing.** `resolveColor` gained `background` and
`highlight`; `resolveFont` gained `mono`, `sans`, and `display`. A missing
_weight_ still falls back to `regular` — same typeface, fair degradation — but a
missing _family_ returns `undefined`, and no color role falls back to another.
Substituting a display serif where `mono` was requested would defeat the reason
mono was requested, and `background` quietly returning the brand accent would
paint a surface entirely the wrong color. Consumers should apply their own
default when they get `undefined`.

### 3. Catalog routes retired and deprecated

Not in `CHANGELOG.md` — this landed as `chore(catalog):`, which release-please
hides. It is the change most likely to surprise you, because it removes models
you may be naming today.

**Removed — these 404 upstream with no successor.** Each was verified dead on
both fal's OpenAPI and `llms.txt` surfaces, with alternate id spellings probed
before removal:

`wan-2.6-t2v` · `ltx-video-lora-i2v` · `hunyuan-video-img2vid-lora-i2v` ·
`transpixar-t2v` · `animatediff-sparsectrl-lcm-t2v` · `qwen-3-guard`

Two of those cost a capability, not just a route:

- **TransPixar was the only alpha-channel video model in the catalog.** Nothing
  produces video with a real alpha channel now. The fallback — generate on a
  flat, saturated background, then `background-remove` in color-key mode plus
  `composite` — is materially worse on soft edges, motion blur, and
  semi-transparent elements like particles or smoke, which is exactly what that
  model was good at.
- **`qwen-3-guard` was the only `safety` entry, so that capability is now
  empty.** fal hosts no replacement classifier. `fal_classify_text` still works
  but now **requires an explicit `model`** — its auto-default rule needs exactly
  one catalogued entry and there are zero. Pass a fal-hosted classifier id
  directly.

Also gone: SparseCtrl conditioning, and LoRA-capable Hunyuan **i2v** (the t2v
LoRA route survives).

**Deprecated — these still return HTTP 200 while serving a different model:**

| Slug                  | Actually serves                                      |
| --------------------- | ---------------------------------------------------- |
| `seedance-1-lite-t2v` | Seedance 1.0 Pro Fast                                |
| `seedance-1-lite-i2v` | Seedance 1.0 Pro Fast                                |
| `seedance-1-lite-ref` | **Grok Imagine Video** — a different vendor entirely |

They are **hidden from `model_catalog` by default** (pass
`include_unavailable: true` to see them with their notice) because advertising a
route that silently redirects is precisely the hidden routing this server exists
to avoid. Migrate to `seedance-1-pro-fast-t2v` / `-i2v` explicitly so you are
choosing the model rather than inheriting a redirect; for multi-reference work,
move up to `seedance-2-ref-to-video` or `seedance-2-fast-ref`.

Note the `-ref` redirect leaves the Seedance family altogether, so its
multi-reference and audio behavior are Grok's, not what `seedance_prompt_guide`
documents.

**Billing change worth auditing.** `ltx-video-13b-distilled-i2v` switched from
**per-video to per-second**: $0.04/video became $0.04/s, or $0.08/s with the
detail pass. A 10-second clip went from a flat $0.04 to $0.40–$0.80 — a 10–20×
jump if you budgeted against the old rate. Its sibling `-t2v` did **not** change,
so the pair no longer bills alike.

### Not breaking, but new behavior you may notice

- **`fal_generate_music` now writes warnings to stderr** when `extra_params`
  contains a key the model's spec does not accept — fal drops those silently, so
  the warning is the only signal. It is diagnostic only: your payload is sent
  exactly as you built it, never rewritten. If you parse stderr, expect new
  lines.
- **Nano Banana's default model moved to `gemini-3.1-flash-image`.** Override
  with `ARTIFICER_NANOBANANA_MODEL`.
- **New tools:** `audio_info`, `extend-canvas`, `gemini_omni_generate_video`,
  plus prompt guides. `background-remove` gained a flood-fill mode for
  interior-safe removal.
- **`gemini_omni_generate_video` bakes in a soundtrack, and there is no way to
  turn it off.** Omni Flash writes picture and audio (speech, music, sound
  effects) in the same pass — no `generate_audio` flag, no silent mode. If you
  are laying your own music under the clip, you **must strip the track first**
  (`audio_extract_from_video` / `video_set_audio`), or you will end up with two
  audio beds in the master. Steer it in the prompt where you do want sound;
  `"No dialogue"` suppresses speech specifically. For silent B-roll under a
  fixed master, MiniMax H3 on fal returns a bare video file and needs no strip
  step. Omni also accepts **no audio input**, so audio reference conditioning is
  unavailable. See `gemini_omni_video_prompt_guide`.
- **Fixed:** `composite`, `watermark`, and `gradient-overlay` no longer
  desaturate color output when the base image is grayscale. If you were working
  around that, you can stop.

---

## Verification status for 0.10.0

Stated plainly so nobody assumes more coverage than exists:

- `gemini_omni_generate_video` is **unit-tested against a mocked client only**.
  No live call has been made; its request shape is inferred from SDK types plus
  documentation. Treat first real use as a smoke test — and note this tool's
  documented audio behavior was **wrong until late in this release** (it claimed
  silent output; corrected in #37 after being caught against Google's model
  card, not by any test). Inference from docs has already failed once here, so
  weight the first live call accordingly.
- The `@google/genai` **1.50 → 2.17 major upgrade** is verified for types and
  build. The test suite mocks that SDK, so live API behavior across all eight
  Google-backed tools is unverified.
- fal pricing and deprecation status are read from fal's published specs, not
  observed on an invoice.

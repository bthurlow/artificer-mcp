import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const MINIMAX_MUSIC_GUIDE = `# MiniMax Music 2.6 (Song Generation) Prompt Guide

## What this model is best for
**Full songs with vocals and lyrics.** MiniMax Music 2.6 is the catalog's \`music.song\` sub-class default — it creates complete tracks with singing, backing music, and song-structured arrangements (verse / chorus / bridge) from a style description plus optional lyrics.

Use this when you need actual vocals in the output. For instrumental music beds, use \`elevenlabs_music_prompt_guide\` or \`lyria2_prompt_guide\` instead.

> **This guide documents observed behavior, not MiniMax's published claims.** Several sections below contradict MiniMax's official docs. Where they conflict, the observed behavior is what shipped through a multi-album production run (30+ bake-off takes with listening verdicts). Divergences are called out explicitly so you know which claims are ours.

## Known strengths
- **Vocals + lyrics synthesis** — one of the few fal-hosted models that does this as a single-call generation.
- **Structure tags** parsed in lyrics: \`[Intro]\`, \`[Verse]\`, \`[Pre Chorus]\`, \`[Chorus]\`, \`[Post Chorus]\`, \`[Hook]\`, \`[Bridge]\`, \`[Interlude]\`, \`[Transition]\`, \`[Build Up]\`, \`[Break]\`, \`[Inst]\`, \`[Solo]\`, \`[Outro]\`. These are the model's section-boundary and energy map — and the **only** reliable arrangement surface (see below).
- **\`lyrics_optimizer\`** auto-generates lyrics from the prompt if you don't supply your own.
- **\`is_instrumental: true\`** switches off vocals when you want a song-structured but vocal-free track. It fully suppresses vocals even when the \`lyrics\` field is populated — so you can use lyric content purely for phrasing/structure control without vocal leak.

## ⚠️ Parentheses are SUNG as text — do not use them for arrangement

**MiniMax's official docs claim parentheses carry "inline performance notes" for "micro-level arrangement control."** In practice, on 2.6, **every parenthetical gets sung as lyric text** — regardless of length, position, or content.

Observed across a controlled six-variant bake-off (same prompt, same seed, only cue syntax varied):
- Long multi-clause: \`(full choir enters, fortissimo)\` — sung.
- Short single-clause at section end: \`(quiet build)\`, \`(orchestral swell)\`, \`(war drums)\`, \`(held silence)\`, \`(violin sustain)\`, \`(fade)\` — all sung.
- Short single-clause at section start: \`(whispered)\`, \`(intimate)\` — both sung.

**Rule: never use parens for arrangement directives.** Use bracket tags. The only legitimate use is an intentional sung ad-lib you actually want in the vocal (e.g. a backing-vocal \`(Ooh, yeah)\`) — and even then, sparingly.

This is worth reporting upstream; MiniMax's published behavior for parens does not match the model.

## ⚠️ One reliable voice per generation — duet routing is prompt-side, not lyric-side

MiniMax 2.6 does not expose per-line vocal assignment. Four inline routing syntaxes were tested; all fail in production-incompatible ways:

| Syntax | Routes voices? | Text suppressed? | Verdict |
|---|---|---|---|
| \`[F]\` / \`[M]\` / \`[F & M]\` markers | ❌ ignored | — | Model ignores the assignment entirely. |
| \`Female Lead:\` / \`Male Lead:\` / \`Both:\` colon labels | ✅ correctly | ❌ **the words are sung** | Functional routing, unusable output. |
| \`[Female Lead]\` / \`[Male Lead]\` / \`[Both]\` brackets | ⚠️ partial | ✅ | Better, but routing is not honored consistently. |
| \`[Female vocals]\` / \`[Male vocals]\` / \`[Duet]\` brackets, no prompt anchor | ❌ collapses to one voice | ✅ | Model falls back to its default single voice. |

**Never put colon-prefix labels in the lyric body** (\`Female Lead:\`, \`Male Lead:\`, \`Both:\`, \`Choir:\`). They are always sung as text.

### Path A (prose-duet) — canonical for duets
Describe the **two-voice architecture in the prompt prose**, not with lyric markers. Then block the lyrics by speaker and let the *content* cue who is singing.

1. Prompt body describes the duet: the two voices, their registers, and the handoff.
2. Lyrics are section-blocked — each section belongs to one speaker.
3. The words themselves signal the speaker (his making vs. her waking), so the model has clean structure to interpret without line-level markers.

Voice-split is interpretive, not marker-driven. This is the lowest-variance path and the one that shipped.

### Inline-bracket alignment principle
When you do reach for inline vocal brackets, **their terms must be enumerated in the prompt body's vocal-style section to be honored.** Without a prompt-side anchor, the prompt-level default vocal style overrides the inline tag entirely.

Mechanism: MiniMax 2.6 uses prompt-body vocal vocabulary to establish the *set* of available vocal styles; inline tags then reference that set. A tag naming a style the prompt never introduced has nothing to bind to.

\`\`\`
[Verse]
[Female vocals] line 1
[Male vocals] line 2

[Chorus]
[Duet] line 1
[Female vocals] line 2
\`\`\`
…paired with a prompt containing an explicit \`Female vocals (mezzo) and Male vocals (baritone) as duet vocal stack\` enumeration.

This is a **complementary tool, not a Path A replacement** — it produces more dynamic interleaved duet character, but voice mapping stays imperfect. Use it when interesting interplay matters more than exact assignment. The same principle generalizes to choir routing (\`[Choir]\` brackets + a prompt that enumerates "cathedral choir as co-equal voices") and to any inline vocal-style routing.

## Duration — a distribution, not a parameter

**There is no duration parameter.** The API ceiling is ~6 minutes; the model's *behavioral* single-generation ceiling is **~4:40**. Across dozens of generations the single longest take was 4:42, and 5:00 has never occurred in one call.

**Measured distribution** (n=10, held prompt, no skeleton, instrumental):
\`\`\`
2:28  2:59  2:59  3:08  3:18  3:43  3:46  4:15  4:15  4:18
min 2:28 · median 3:44 · mean 3:32 · max 4:18
≥4:00: 3/10 (30%)   ≥4:30: 0/10   ≥5:00: 0/10
\`\`\`

**Numeric framing backfires.** \`"5-minute symphonic epic"\` in the prompt produced *shorter* output than the baseline (2:49 vs 2:58–2:59). Explicit minute counts, \`"long-form song"\`, and \`"ten-line bridge"\` are all no-ops or worse. Don't use them.

### What moves duration and what doesn't

- ✅ **Lyric line count, on vocal tracks.** Counting every line in the lyric block — section markers, blank lines, and cue lines included — projects onto duration. Adding 9 inline cue lines to an otherwise unchanged block took a take from ~2:59 to 3:43.

  | Lines in lyric block | Expected duration |
  |---|---|
  | 30–35 | 2:30–2:55 |
  | 36–45 | 3:00–3:30 |
  | **46–55** | **3:30–4:00 — standard-song target** |
  | 56–65 | 4:00–4:30 |
  | **66–80** | **4:30–5:30 — centerpiece target** |
  | 81+ | 5:30+, with rushing / dropped-content risk |

- ❌ **Section count, \`[Inst]\` / \`[Solo]\` density, and skeleton shape do NOT move duration.** A controlled 4-arm isolation found between-arm mean gaps (~41s) *smaller* than within-arm spread (60–127s) — no detectable effect. An earlier "more sections = longer" claim was small-sample noise and is falsified.
- ❌ **BPM is not a length lever.** 80 BPM produced no longer output than 140. BPM is character, not clock.

**Reconcile these two carefully:** line count is a real lever on **vocal** tracks where the lyric block carries sung content. On instrumental generations (and on skeleton-only lyric blocks) length collapses back to a prompt-independent draw from roughly the 2:30–4:40 range.

### Production method
Because variance dominates, **length is a selection problem.** Batch 6–8 generations to reliably land a 4:00+ take (~30% yield); ≥4:30 is roughly 1 in 15. True 5–6 minute pieces require stitching two generations downstream (\`audio_concat\` / \`video_concatenate\` territory), not a single call.

## Seed — undocumented on fal, and only a partial lock

\`seed\` is **not in fal's published schema** for \`fal-ai/minimax-music/v2.6\` (see \`src/catalog/fal-specs/minimax-music-2.6/openapi.json\`). MiniMax's own API documents an integer seed in the range **0–1,000,000**, and passing it through \`extra_params\` does affect generation.

**The lock is partial.** Same seed + a meaningfully changed lyric block effectively re-seeds the generation — one A/B at a fixed seed produced entirely different melody, character, and duration once the lyric structure changed. Hold the lyric block constant if you want a clean A/B on a prompt change.

For batch-and-curate workflows, treat output as non-reproducible: a loved take generally cannot be regenerated identically.

## \`## ... ##\` accompaniment wrapper

Wrapping the lyrics in \`## ... ##\` instructs the model to generate accompaniment — for cases where you have lyrics but want to guarantee instrumentation rather than an a cappella result. Most callers always want full instrumentation and never need this; it matters when a generation comes back unexpectedly bare.

## \`<Key>, <BPM>,\` prompt prefix — validated tempo/key control

Prefix the prompt with key and tempo. A controlled bake-off found the no-prefix arm drifted 143–152 BPM across three keys, while the prefixed arm hit the target key and BPM consistently.

**Canonical prompt order:**
\`\`\`
<Key>, <BPM>, <genre>, <vocals>, <instruments>, <references>, <mood>
\`\`\`

e.g. \`E minor, 90 BPM, symphonic hard rock, powerful male baritone, distorted guitars and lead violin, Nightwish and Within Temptation, defiant\`

Use it for key/tempo *consistency* between takes. It is not a duration lever.

## \`[Tag, Specifier]\` syntax — narrow support

The model honors a specifier on tags where solo/feature instrumentation is structurally conventional, and overrides it elsewhere.

- ✅ Honored: \`[Solo, Violin]\`, \`[Solo, Electric Guitar]\`, \`[Bridge, Piano]\`
- ❌ Not honored: \`[Verse, X]\`, \`[Build Up, X]\`, \`[Intro, X]\`, \`[Outro, X]\`, and non-instrument specifiers like \`[Outro, Fade]\`

**Specifier control and content are mutually exclusive.** \`[Solo, Violin]\` with an empty body honors the specifier but adds no duration; the same tag with content lines under it extends duration but drops the specifier. Pick one per section.

**Avoid adjacent same-tag empty brackets.** \`[Solo, Violin][Solo, Electric Guitar]\` back-to-back collapses to roughly half the duration of the separated version. Either separate them with an intervening section (preserves the specifier) or populate both with content (loses it).

High model variance applies to all of the above — treat them as defaults, not guarantees, and verify by ear.

## Structural repetition — write every section out in full

\`[Chorus]\` is **not** a "repeat the previous chorus" instruction. Marker-only repeats get abbreviated, skipped, or rendered instrumental. Write each chorus instance out in full every time, even when the lyrics are identical. Same for repeated \`[Pre Chorus]\` and outro phrases.

## Input requirements
- **prompt** (required) — style + mood + instrumentation + scenario, 10-2000 chars. Passed via the tool's structural \`prompt\` arg. Lead with the \`<Key>, <BPM>,\` prefix.
- **lyrics** (optional) — song lyrics with structure tags. Passed via the tool's structural \`lyrics\` arg. Max 3500 characters. Required when \`is_instrumental\` is false AND \`lyrics_optimizer\` is false.
- **lyrics_optimizer** (optional, boolean) — auto-generate lyrics from prompt. Only applies when \`lyrics\` is empty; setting it alongside explicit lyrics is a no-op. Via \`extra_params\`.
- **is_instrumental** (optional, boolean) — no vocals. Via \`extra_params\`.
- **audio_setting** (optional) — \`{sample_rate, bitrate, format}\`. Via \`extra_params\`. **See the output-format warning below.**
- **seed** (optional, integer) — not in fal's schema; see the Seed section. Via \`extra_params\`.

Source: \`src/catalog/fal-specs/minimax-music-2.6/llms.md\` + \`openapi.json\`.

## ⚠️ WAV output is \`audio_setting.format\`, not \`audio_format\`

There is **no top-level \`audio_format\` parameter** on this model. Passing one is silently ignored — fal drops the unknown key and you get the MP3 default back with no error. The real knob is nested:

\`\`\`json
"extra_params": {
  "audio_setting": { "sample_rate": 44100, "bitrate": 256000, "format": "wav" }
}
\`\`\`

\`format\` accepts \`mp3\` (default) / \`wav\` / \`pcm\`; \`sample_rate\` accepts 16000 / 24000 / 32000 / 44100 (default 44100); \`bitrate\` accepts 32000 / 64000 / 128000 / 256000 (default 256000).

If you are running a WAV-throughout pipeline, check the returned \`mime\` — a silent MP3 will otherwise propagate all the way to master.

## Prompt structure
**Prompt field** — stack these in order:

1. **Key + BPM prefix** (\`E minor, 90 BPM,\`) — see above
2. **Genre** (\`city pop\`, \`indie folk\`, \`trap\`, \`synthwave\`)
3. **Era / style descriptors** (\`80s retro\`, \`vintage\`, \`modern lo-fi\`)
4. **Vocal character** (\`warm female vocal\`, \`breathy male voice\`) — also the anchor set for any inline vocal brackets
5. **Instrumentation** (\`groovy synth bass\`, \`warm acoustic guitar\`, \`808 drums\`)
6. **Comp references** (\`Nightwish, Within Temptation\`) — genre-anchoring references measurably suppress style drift
7. **Scenario / mood** (\`nostalgic urban night\`, \`rainy afternoon\`, \`triumphant finale\`)

**Use positive descriptors only.** Negative framing ("not cinematic", "no choir") relaxes the output rather than redirecting it — and is frequently ignored outright.

**Lyrics field** — use structure tags on their own lines:

\`\`\`
[Verse]
Streetlights flicker, the night breeze sighs
Shadows stretch as I walk alone
[Chorus]
Wandering, longing, where should I go
\`\`\`

Default to **pure brackets with no cue content underneath**. In a listening bake-off, pure brackets (~50 lines, 3:19) beat brackets-with-content (~65 lines, 3:24) — the extra content added duration but also added material the listener had to process. Reach for content under brackets only when a centerpiece-length target won't come out of pure brackets, and when it does, draw the content from the song's established vocabulary rather than introducing fresh imagery.

## Example prompts

**Full song with structured lyrics:**
\`\`\`json
{
  "model": "fal-ai/minimax-music/v2.6",
  "prompt": "A minor, 104 BPM, City Pop, 80s retro, warm female vocal, groovy synth bass, nostalgic urban night",
  "lyrics": "[Verse]\\nStreetlights flicker, the night breeze sighs\\nShadows stretch as I walk alone\\n[Chorus]\\nWandering, longing, where should I go\\n[Verse]\\nMemories drift like smoke in the rain\\n[Chorus]\\nWandering, longing, where should I go",
  "output": "./song.mp3"
}
\`\`\`

**WAV output for a lossless pipeline:**
\`\`\`json
{
  "model": "fal-ai/minimax-music/v2.6",
  "prompt": "E minor, 90 BPM, symphonic hard rock, powerful male baritone, distorted guitars and lead violin, Nightwish and Within Temptation, defiant",
  "lyrics": "[Intro]\\n[Verse]\\n...",
  "output": "./song.wav",
  "extra_params": { "audio_setting": { "sample_rate": 44100, "format": "wav" } }
}
\`\`\`

**Let the model write the lyrics:**
\`\`\`json
{
  "model": "fal-ai/minimax-music/v2.6",
  "prompt": "G major, 90 BPM, mellow acoustic indie folk, warm male vocal, fingerpicked guitar, subtle hand claps, cozy kitchen morning",
  "output": "./auto-lyrics.mp3",
  "extra_params": { "lyrics_optimizer": true }
}
\`\`\`

**Instrumental track with song structure (no vocals):**
\`\`\`json
{
  "model": "fal-ai/minimax-music/v2.6",
  "prompt": "D minor, 120 BPM, uplifting cinematic orchestral, strings build to triumphant brass, hopeful ending",
  "output": "./instrumental.mp3",
  "extra_params": { "is_instrumental": true }
}
\`\`\`

## Known weaknesses / quirks
- **Prompt is 10-2000 characters, required.** MiniMax expects genre + mood + instrumentation + scenario, not a bare style word.
- **Vocals are synthetic** — recognizable as AI-generated. Expect "demo-quality track with plausible vocals", not chart-ready.
- **Style blending is prompt-driven only** — no reference-audio support on this route. Stacking genres ("indie folk meets 80s synthwave") sometimes produces incoherent mixes.
- **Non-deterministic.** No stable seed lock (see above); plan on bake-many-and-curate.

## Access routes

| Provider | Tool                   | Model ID                      | Cost                   | Notes |
|----------|------------------------|-------------------------------|------------------------|-------|
| fal      | \`fal_generate_music\` | \`fal-ai/minimax-music/v2.6\` | $0.15 per generation   | Full songs with vocals. Use \`is_instrumental: true\` to disable vocals. |

Earlier versions (2.5, V2, V1) are also on fal under the minimax-music family with similar prompt language.

MiniMax's direct API additionally exposes a \`music-cover\` model (re-sings an existing **vocal** recording in a prompted style) that fal does not host on this route. It requires a vocal source — instrumental references are rejected.

## Last verified
2026-08-15 against artificer-mcp — schema from \`src/catalog/fal-specs/minimax-music-2.6/\`. Behavioral findings (paren-singing, vocal routing, duration distribution, key/BPM prefix, tag specifiers) derived from a production run of 30+ scored bake-off takes across two albums, 2026-05-24 through 2026-06-11. Several contradict MiniMax's published documentation — see the callouts above.

## Official references
- Model page: https://fal.ai/models/fal-ai/minimax-music/v2.6
- MiniMax upstream docs: https://www.minimax.io/platform/document
`;

export function registerMinimaxMusicPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'minimax_music_prompt_guide',
    'Prompt guidance for MiniMax Music 2.6 on fal. Full songs with synthetic vocals and structured lyrics. Covers prompt anatomy (Key/BPM prefix + genre + vocals + instrumentation + references + mood), the 14 bracket structure tags, why parentheses get sung, duet/vocal routing limits and the Path A prose-duet pattern, duration as a distribution (batch-and-select), seed caveats, the ## ## accompaniment wrapper, and the nested audio_setting.format knob for WAV. Documents observed behavior that diverges from MiniMax official docs. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: MINIMAX_MUSIC_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';
import { loadBrandSpec } from '../brand.js';

const IMAGE_GUIDE = `# Gemini Image Generation — Prompt Guide

## Overview
Google Imagen generates high-quality images from text prompts. It excels at photorealistic scenes, artistic styles, and product visualization. It can struggle with precise text rendering, complex spatial relationships, and counting specific numbers of objects.

## Prompt Template
\`[Subject] [doing action] in [setting/environment], [style/aesthetic], [lighting], [camera angle/composition], [mood/atmosphere]\`

## Good Examples

**Photorealistic product shot:**
> "A sleek matte black coffee mug on a marble countertop, morning sunlight streaming through a window, shallow depth of field, warm tones, product photography"

**Artistic illustration:**
> "A cozy bookshop interior with floor-to-ceiling shelves, a cat sleeping on a stack of books, warm golden lamp light, watercolor illustration style, whimsical atmosphere"

**Social media content:**
> "Flat lay of fresh baking ingredients on a rustic wooden table — flour, eggs, butter, vanilla, chocolate chips — overhead shot, bright natural lighting, food photography style"

## Bad Examples

> "A nice picture" — Too vague. Specify subject, style, lighting, composition.

> "Generate me 5 red cars and 3 blue trucks" — Imagen struggles with precise counting. Keep object counts simple.

> "Text that says SALE 50% OFF" — Text rendering is unreliable. Use ImageMagick text-overlay tools for precise text.

## Model-Specific Notes

- **imagen-4.0-generate-001** — Latest model. Best quality. Supports \`enhancePrompt\` for automatic prompt improvement.
- **Aspect ratios**: 1:1, 3:4, 4:3, 9:16, 16:9. Choose based on platform (1:1 for Instagram, 9:16 for Stories/Reels, 16:9 for YouTube thumbnails).
- **Negative prompts**: Use to exclude unwanted elements ("blurry, low quality, text, watermark").
- **Safety filters**: Default is BLOCK_MEDIUM_AND_ABOVE. Lower to BLOCK_ONLY_HIGH for creative freedom; raise for child-safe content.
- **Seed**: Set for reproducibility. Same seed + same prompt = same image.

## When to use nano-banana instead
For **edits, composites, style transfer, text rendering, or reference-guided generation**, prefer \`gemini_nanobanana_generate_image\` and its dedicated \`gemini_nanobanana_prompt_guide\`. Imagen is stronger for clean one-shot photorealism and multi-variation batches; nano-banana is stronger when you need to work _with_ existing imagery.

## Official References
- Imagen API: https://ai.google.dev/gemini-api/docs/imagen
- Model cards: https://ai.google.dev/gemini-api/docs/models/imagen
`;

const NANOBANANA_GUIDE = `# Gemini Nano-Banana (gemini-2.5-flash-image) — Prompt Guide

## Overview
Nano-banana is a multimodal image model accessed via \`generateContent\` with IMAGE response modality. Unlike Imagen (text-only input), nano-banana accepts **text + reference images** as multimodal parts — enabling edits, composites, style transfer, and reference-guided generation from a single tool.

**Strengths:**
- Edits (add/remove/replace elements in an existing image)
- Composites across multiple references (subject from A, scene from B)
- Style transfer from a reference
- **Text rendering** inside images (usually more reliable than Imagen)
- Character consistency across iterations

**Weaknesses:**
- Lower max fidelity than Imagen 4 for pristine photorealism
- No native batch variations (one image per call; loop for multiples)
- No explicit safety-level knob (server-side defaults only)

## When to use nano-banana vs Imagen
| Task | Pick |
|---|---|
| Generate a brand-new image from text only, photoreal quality matters | Imagen |
| Edit an existing image (remove/add/change something) | Nano-banana |
| Composite multiple images | Nano-banana |
| Apply the style of reference A to image B | Nano-banana |
| Render specific text inside the image | Nano-banana |
| 4 variations of the same prompt | Imagen (\`number_of_images\`) |
| Maintain a character across edits | Nano-banana |

## Prompt Templates

**Generation (no references):**
\`[Subject] [action] in [setting], [style], [lighting], [composition]\`

**Edit (1 reference):**
\`In this image, [change description]. Keep [things to preserve].\`

**Composite (2+ references):**
\`Place the [subject from image 1] into the [scene from image 2]. Match the [lighting/style/perspective] of image 2.\`

**Style transfer:**
\`Redraw the subject of image 1 in the style of image 2.\`

## Good Examples

**Edit:**
> "In this image, remove the coffee cup from the table and replace it with a small vase of wildflowers. Keep the lighting and table texture identical." (+ reference image of a table)

**Composite:**
> "Place the sourdough loaf from image 1 onto the marble countertop in image 2. Match the warm morning lighting of image 2 and cast a soft shadow from the loaf." (+ 2 reference images)

**Style transfer:**
> "Redraw this photograph in the style of a loose watercolor illustration with visible brush strokes and bleeding edges, preserving the composition." (+ 1 reference image)

**Text-in-image:**
> "A minimalist product poster that reads 'Sourdough Sunday' in elegant serif lettering, centered, cream background, subtle paper texture, no other elements."

## Bad Examples

> "Make it better" — Too vague. Specify what to change and what to preserve.

> "Remove the background" (no reference image passed) — Nano-banana needs the source image as a reference to edit. Pass it in \`reference_images\`.

> "Generate 4 variations of this prompt" — One image per call. Loop on the client side instead.

## Reference-Image Tips
- The text prompt is the first \`part\`; reference images follow as \`inlineData\` parts.
- 1–3 references is the sweet spot. More than 3 and the model starts blending them unpredictably.
- When referencing multiple images, name them in the prompt ("image 1", "image 2") so the model disambiguates.
- Higher-resolution references preserve more detail.

## Aspect ratio — generate for the platform you'll use

The \`aspect_ratio\` you pass must match the aspect ratio of the downstream destination. Nano-banana composes the scene natively at the requested aspect — it does not re-crop a square generation into a portrait intelligently, so generating at the wrong aspect and hoping to crop later produces bad framing (subjects centered for 1:1 end up cut off at 9:16).

**Critical interop rule — image-to-video:** If the generated image will be fed into Veo as an image-to-video source (\`gemini_generate_video\` with \`image=\` set), the image aspect **must match** the target video aspect. Veo honors the container size you request but composes based on the source image's aspect, so a 1:1 source going into a 9:16 video renders like a "zoomed wide shot cropped vertically" — it does not generate a true portrait composition. Always pre-generate the reference at the target aspect before calling Veo.

**Standard social aspects — pick by destination:**

| Aspect | Dimensions (1080 long edge) | Primary use |
|---|---|---|
| 9:16 | 1080 × 1920 | TikTok, Instagram Reels, Stories, YouTube Shorts, Facebook Reels |
| 1:1 | 1080 × 1080 | Instagram carousel, Facebook feed, LinkedIn feed |
| 4:5 | 1080 × 1350 | Instagram feed preferred — Meta's recommended aspect; more screen real estate on mobile |
| 16:9 | 1920 × 1080 | YouTube thumbnails, blog hero images, LinkedIn native video, web embeds |
| 2:3 | 1080 × 1620 | Pinterest standard pin — taller pins get more organic distribution |
| 1.91:1 | 1200 × 628 | Facebook/Instagram link cards, Open Graph images for blog shares |
| 3:4 | 1080 × 1440 | Older Instagram portrait, some Pinterest content |

**Pre-generation workflow for campaign assets:** if one reference asset will be used across multiple destinations (e.g., a character, a product shot), generate it once per target aspect up front. Don't generate at 1:1 and try to reuse for 9:16 video or 2:3 Pinterest — quality degrades from cropping, and image-to-video breaks.

## Model-Specific Notes
- **gemini-2.5-flash-image** — Production model. Fast (seconds, not minutes). Override via \`ARTIFICER_NANOBANANA_MODEL\` env var.
- **aspect_ratio**: Optional hint but strongly recommended when composition matters. Common values: 1:1, 3:4, 4:3, 9:16, 16:9, 4:5, 2:3, 1.91:1. See "Aspect ratio" section above for the interop rule with Veo image-to-video.
- **include_text**: If true, the model can emit a text commentary alongside the image — useful when you want the model to _explain_ what it changed.
- **No negative prompts / seed / enhance_prompt / safety knobs** — these are Imagen-only. Use explicit preservation language in the prompt instead ("keep the lighting", "do not change the pose").

## Official References
- Gemini image-generation docs: https://ai.google.dev/gemini-api/docs/image-generation
- Model card (gemini-2.5-flash-image): https://ai.google.dev/gemini-api/docs/models
`;

const VIDEO_GUIDE = `# Veo Video Generation — Prompt Guide

## Overview
Google Veo generates short videos (4-8 seconds) from text prompts or text + image. Veo 3.x generates **native audio** including ambient sound, Foley, and **lip-synced dialogue** — so talking-head content is fully achievable without external TTS. Best for: establishing shots, product demos, ambient scenes, short-form social content, and talking heads when combined with image-to-video for character consistency.

## Prompt Template
\`[Camera movement] of [subject] [doing action] in [setting], [visual style], [lighting], [mood]\`

## Good Examples

**Establishing shot:**
> "Slow aerial drone shot of a coastal town at golden hour, Mediterranean architecture with white buildings and blue roofs, warm cinematic lighting, 4K film quality"

**Product demo:**
> "Smooth tracking shot of a pour-over coffee brewing process, steam rising from the cup, close-up macro detail, warm morning light, minimalist kitchen background"

**Social content (image-to-video):**
> "Gentle zoom in with subtle parallax movement, soft natural lighting, cozy atmosphere" (with an input image of a bakery scene)

## Bad Examples

> "A person says a lot of stuff about pricing and then laughs and then says more stuff" — Too long and unquoted. Quote the exact line and keep it to one sentence per clip. See "Native Audio + Dialogue" below.

> "Fast action sequence with explosions" — Complex physics and rapid motion tend to produce artifacts.

> "A 30-second commercial" — Veo generates 4 or 8-second clips. Plan your story in short segments and use video_concatenate or video_add_transitions to join them.

## Image-to-Video Tips

Providing an input image dramatically improves consistency:
1. Generate or prepare a high-quality still frame
2. Pass it as the \`image\` parameter
3. Keep the prompt focused on MOTION and CAMERA, not scene description (the image provides that)
4. Works best with: zoom, pan, parallax, gentle camera movements

**Critical: source image aspect ratio MUST match target video aspect ratio.**

Veo honors the \`aspect_ratio\` you request for the output container, but it composes the scene based on the source image's aspect. If you pass a 1:1 source with \`aspect_ratio: "9:16"\`, the result looks like a landscape-composed shot awkwardly cropped vertically — subjects centered, framing wrong. This is the #1 pitfall in image-to-video workflows.

**Rule:** pre-generate the source image at the exact target aspect with nano-banana before calling Veo.

| Target video aspect | Pre-generate source image at |
|---|---|
| 9:16 (TikTok/Reels/Stories) | 9:16 |
| 16:9 (YouTube/LinkedIn) | 16:9 |
| 1:1 (IG feed legacy) | 1:1 |
| 4:5 (IG feed preferred) | 4:5 |

If you need the same character/scene in multiple aspects, generate the reference multiple times — once per aspect — rather than cropping.

## Native Audio + Dialogue (Veo 3.x)

Veo 3 generates audio automatically — ambient sound, Foley, music, AND lip-synced dialogue. You do NOT need a separate TTS pipeline for talking-head content.

**Dialogue pattern** — quote the exact line the character should speak in the prompt:
\`\`\`
A woman says, "If one more person tells you to just double your ingredient cost..."
\`\`\`

Other working patterns:
- \`The baker looks at the camera and says, "That's not a pricing method."\`
- \`She says in a frustrated tone, "This is why you're broke."\`
- \`He whispers, "They don't tell you this part."\`

**Rules for reliable lip-sync:**
1. Put the speaker + speech verb (\`says\`, \`exclaims\`, \`whispers\`) **before** the quoted dialogue.
2. Keep each line short — ~1 sentence per 8-sec clip. Rushed delivery breaks lip-sync.
3. Describe tone/emotion in the same clause ("says in a frustrated tone", "says warmly").
4. No multi-character conversations in a single clip.
5. Combine with image-to-video for character identity consistency.

**Do NOT pass \`generate_audio: true\`** — Gemini Developer API rejects this field. Audio generates automatically on Veo 3.x; the flag is Vertex-only.

## Workflow: Talking-Head Video (100% AI with synced dialogue)

Veo 3 + nano-banana closes the loop — no real footage required:

1. Generate the speaker as a still with nano-banana using locked character references (consistent face/outfit).
2. Feed the still into \`gemini_generate_video\` as the \`image\` param (image-to-video) with a prompt using the dialogue pattern above. The still anchors the first frame so the face stays consistent.
3. Repeat per dialogue beat — 4s or 8s clips.
4. Stitch with \`video_concatenate\` or \`video_add_transitions\`.
5. Optionally layer \`video_add_subtitles\` for sound-off accessibility.
6. \`audio_normalize\` at the end for consistent loudness across clips.

## Gemini Developer API quirks (empirically validated)

- **\`generate_audio\`**: rejected. Omit — audio generates by default on Veo 3.x.
- **\`negative_prompt\`**: not supported on Veo 3.x Lite. Drop it if using Lite.
- **\`duration_seconds\`**: only \`4\` and \`8\` are accepted with image-to-video on most 3.x models. Other values may 400.
- **\`reference_images\` config** (multi-reference): Veo 3.1 **Standard only**. Lite and Fast return 400 — use single \`image\` param (image-to-video) instead.
- **Files API download URIs** (\`generativelanguage.googleapis.com/v1beta/files/...\`): require \`x-goog-api-key\` header. \`gemini_generate_video\` handles this automatically.

## Model tier guidance

| Tier | Model ID | Cost | When to use |
|---|---|---|---|
| Lite | \`veo-3.1-lite-generate-preview\` | ~$0.05/sec | Default. Indistinguishable from Standard for most social content. |
| Fast | \`veo-3.1-fast-generate-preview\` | ~$0.10/sec | Faster iteration during drafting. |
| Standard | \`veo-3.1-generate-preview\` | ~$0.40/sec | Multi-reference composition; critical hero shots. |

Override the default via \`ARTIFICER_VEO_MODEL\` env var.

## Misc

- **Aspect ratios**: 16:9 (landscape) or 9:16 (portrait). Choose based on platform.
- **Polling**: Video generation typically takes 60-180 seconds. Default poll timeout is 5 minutes.

## Official References
- Veo API: https://ai.google.dev/gemini-api/docs/veo
- Model cards: https://ai.google.dev/gemini-api/docs/models/veo
- Audio + dialogue: https://ai.google.dev/gemini-api/docs/video#audio-generation
`;

const TTS_GUIDE = `# Gemini TTS prompt guide

Generate natural-sounding speech from text via \`gemini_generate_speech\`. Based on [ai.google.dev/gemini-api/docs/speech-generation](https://ai.google.dev/gemini-api/docs/speech-generation) and [Gemini TTS models page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-preview-tts).

## Models

| Model ID | Use when |
|---|---|
| \`gemini-3.1-flash-tts-preview\` | Newest (2026). Expressive, multilingual. Recommended default. |
| \`gemini-2.5-flash-preview-tts\` | Fast, cheap. Conversational use cases, high-volume narration. |
| \`gemini-2.5-pro-preview-tts\` | Long-form content, professional narration, highest clarity. |

Override via \`ARTIFICER_TTS_MODEL\` env var.

## Voices (30 prebuilt)

Each has a character. Match voice to content tone:

| Voice | Character | Voice | Character |
|---|---|---|---|
| Zephyr | Bright | Puck | Upbeat |
| Charon | Informative | **Kore** | **Firm, calm** (default) |
| Fenrir | Excitable | Leda | Youthful |
| Orus | Firm | Aoede | Breezy |
| Callirrhoe | Easy-going | Autonoe | Bright |
| Enceladus | Breathy | Iapetus | Clear |
| Umbriel | Easy-going | Algieba | Smooth |
| Despina | Smooth | Erinome | Clear |
| Algenib | Gravelly | Rasalgethi | Informative |
| Laomedeia | Upbeat | Achernar | Soft |
| Alnilam | Firm | Schedar | Even |
| Gacrux | Mature | Pulcherrima | Forward |
| Achird | Friendly | Zubenelgenubi | Casual |
| Vindemiatrix | Gentle | Sadachbia | Lively |
| Sadaltager | Knowledgeable | Sulafat | Warm |

Sample voices in AI Studio before picking.

## Three ways to control delivery

### 1. Voice choice (baseline character)
### 2. \`style\` parameter (prepended as a natural-language directive)
\`\`\`
style: "In a warm, conversational baker-to-baker tone"
text: "Ingredients are only about 30% of your real cost..."
\`\`\`

### 3. Inline audio tags (fine-grained control within the text)
\`\`\`
"[whispers] Here's the secret baker math [normal voice] most people miss..."
\`\`\`

Supported tags include: \`[whispers]\`, \`[laughs]\`, \`[excited]\`, \`[sarcastic]\`, \`[shouting]\`, \`[pause]\`. Full list in the official docs.

## Prompt recipe (single speaker)

1. Pick voice matching the tone (e.g., \`Sulafat\` for warmth, \`Charon\` for authority)
2. Add a \`style\` directive describing delivery: tempo, mood, accent, emotional register
3. Write the text with sparse audio tags at key emphasis points
4. Keep each call under ~1000 characters; split longer narration into multiple calls

## Examples

### Warm narration
\`\`\`json
{
  "voice": "Sulafat",
  "style": "In a warm, encouraging baker-to-baker tone, slightly slower than conversational pace",
  "text": "You might think doubling your ingredient cost sets a fair price. [pause] It doesn't. [pause] Ingredients are only about thirty percent of what a dozen cookies really costs you."
}
\`\`\`

### Upbeat social CTA
\`\`\`json
{
  "voice": "Puck",
  "style": "Energetic and punchy, like a good ad read",
  "text": "[excited] Real baker math, automatically! Try DoughMetrics free today."
}
\`\`\`

## Multi-speaker (dialogue)

Use \`multiSpeakerVoiceConfig\` in the API directly (not yet exposed in this tool's schema). Assign voice names per speaker, prefix lines with \`Speaker:\` in the text:
\`\`\`
Jenn: Hey, have you seen your real cost per batch?
Baker: I just use twice the ingredients...
\`\`\`

## Tips

- **Model picks matter more than voice for quality.** Flash is great for short clips; Pro handles long-form better.
- **Style beats voice for emotion.** "Kore" + style directive "excited" outperforms switching to Puck for mild enthusiasm.
- **Audio tags should be sparse.** Overusing them breaks flow.
- **Keep punctuation natural.** Periods add short pauses; em-dashes work for mid-sentence pauses.
- **For ingestion into video workflows**, .wav is preferred — no transcode cost.

## Reference
- [Speech generation docs](https://ai.google.dev/gemini-api/docs/speech-generation)
- [Gemini 2.5 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-preview-tts)
- [Gemini 2.5 Pro TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro-preview-tts)
`;

const LYRIA_GUIDE = `# Lyria music generation prompt guide

Artificer exposes two Lyria tools with different tradeoffs:

| Tool | When to use | Duration | Latency |
|---|---|---|---|
| \`gemini_generate_music\` (**batch**, Lyria 3) | Music beds, title-card stingers, one-shot clips | 30s (Clip) or up to ~2min (Pro) | Synchronous, one API call |
| \`gemini_generate_music_live\` (Lyria RealTime) | Interactive apps, streaming, live steering | Unbounded wall-clock (capped 120s by artificer) | Streaming WebSocket |

**For static music beds in videos, use the batch tool.** Realtime is for interactive use cases.

## Model IDs

| Env var | Default | Notes |
|---|---|---|
| \`ARTIFICER_LYRIA_MODEL\` | \`lyria-3-clip-preview\` | Fixed 30s, MP3 output |
| \`ARTIFICER_LYRIA_MODEL\` | \`lyria-3-pro-preview\` | Up to ~2min, duration prompt-controllable, WAV output |
| \`ARTIFICER_LYRIA_LIVE_MODEL\` | \`models/lyria-realtime-exp\` | Realtime streaming |

## Prompt anatomy

Based on the [Vertex AI Lyria prompt guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/music/music-gen-prompt-guide). Identify your core idea, then stack these descriptors:

| Element | Keywords |
|---|---|
| **Genre / style** | \`indie folk\`, \`cinematic orchestral\`, \`lo-fi hip-hop\`, \`ambient electronic\`, \`80s synthwave\` |
| **Mood / emotion** | \`warm\`, \`uplifting\`, \`contemplative\`, \`tense\`, \`bittersweet\`, \`playful\` |
| **Instrumentation** | \`acoustic guitar\`, \`analog synths\`, \`fingerpicked ukulele\`, \`soft piano\`, \`brushed drums\` |
| **Tempo / rhythm** | \`110 bpm\`, \`slow\`, \`driving beat\`, \`syncopated\`, \`swung eighths\` |
| **Arrangement** (optional) | \`starts solo piano, builds with strings\`, \`drop at 0:20\` |
| **Soundscape** (optional) | \`spacious reverb\`, \`warm room tone\`, \`vinyl crackle\`, \`city ambience\` |
| **Production** (optional) | \`clean modern mix\`, \`vintage lo-fi\`, \`raw demo\` |

## Lyria 3 Pro: structured timestamps

Pro supports timeline prompts using \`[mm:ss - mm:ss]\` markers plus intensity scales 1/10 to 10/10:

\`\`\`
[0:00 - 0:15] solo fingerpicked acoustic guitar, intensity 3/10, warm and intimate.
[0:15 - 0:45] add light hand claps and upright bass, intensity 6/10, lift the mood.
[0:45 - 1:00] bring in brushed drums and a short strings swell, intensity 8/10, hopeful ending.
\`\`\`

Also controllable: \`song key\` (e.g., "A major"), \`BPM\` (e.g., "132 BPM").

## Negative prompts

- **Lyria 2** (Vertex) supports \`negative_prompt\` field directly.
- **Lyria 3** (Gemini API) does **not** have a dedicated field — artificer's batch tool accepts a \`negative_prompt\` param and appends it to the prompt as \`\\nAvoid: ...\`. This is prompt-engineered guidance, not a guarantee.

## Example prompts

### Bakery / cozy kitchen vibe (music bed under dialogue)
\`\`\`
upbeat indie folk with acoustic guitar, light hand claps, warm kitchen vibe, 110 bpm, no vocals, positive mood, clean modern mix
\`\`\`

### Educational / content explainer background
\`\`\`
calm lo-fi hip-hop, mellow electric piano, soft brushed drums, subtle vinyl crackle, 85 bpm, thoughtful mood, spacious reverb
\`\`\`

### Social media reel intro sting
\`\`\`
short punchy synthwave intro, analog lead, driving 4-on-the-floor kick, 120 bpm, confident mood, modern mix, 10 seconds
\`\`\`

## Realtime (\`gemini_generate_music_live\`) tips

Realtime uses \`weightedPrompts\` — a single prompt with weight 1.0 is the default, but the underlying SDK supports multi-prompt blending. This tool currently sends one prompt at weight 1.0.

**Session lifecycle** (internally managed by artificer):
1. Connect → wait for \`setupComplete\` (≤10s)
2. \`setWeightedPrompts\` with the text prompt
3. Optional: \`setMusicGenerationConfig\` (temperature/seed/guidance)
4. \`play()\` → audio chunks stream in
5. Wall-clock wait for \`duration_seconds\`
6. \`stop()\` + \`close()\` (force-closed after hard deadline)

Output: 16-bit PCM 48kHz stereo, wrapped in WAV by artificer.

**Known gotchas** (from [ai.google.dev/gemini-api/docs/realtime-music-generation](https://ai.google.dev/gemini-api/docs/realtime-music-generation)):
- Call \`resetContext()\` when drastically changing prompts (not yet exposed in this tool)
- Sessions can stall silently — artificer enforces \`duration_seconds + 15s\` hard deadline
- Cap \`duration_seconds\` at 120; for longer beds, use the batch tool (Pro supports ~2min) or concatenate multiple generations

## Safety / content filters

Lyria applies safety filters. Common triggers:
- Copyrighted artist names ("in the style of Taylor Swift") — blocked
- Explicit lyrics — Lyria 3 is mostly instrumental; avoid vocal requests
- Specific commercial brand sounds

Describe style via attributes, not by referencing named artists.

## Reference
- [Music generation (Lyria 3 batch) docs](https://ai.google.dev/gemini-api/docs/music-generation)
- [Realtime music generation (Lyria RealTime) docs](https://ai.google.dev/gemini-api/docs/realtime-music-generation)
- [Vertex AI Lyria 2 API reference](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/lyria-music-generation)
- [Lyria prompt guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/music/music-gen-prompt-guide)
`;

/**
 * Register prompt guide tools with the MCP server.
 *
 * Covers: gemini_image_prompt_guide, gemini_nanobanana_prompt_guide,
 * veo_video_prompt_guide, gemini_tts_prompt_guide, gemini_lyria_prompt_guide.
 *
 * These are pure reference tools — no side effects, no API calls.
 * They return structured markdown to help compose effective prompts.
 */
export function registerGuideTools(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'gemini_image_prompt_guide',
    'Get structured prompt guidance for Gemini/Imagen image generation. Returns best practices, templates, good/bad examples, and model-specific notes. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: IMAGE_GUIDE }],
    }),
  );

  registerTool<Record<string, never>>(
    server,
    'gemini_nanobanana_prompt_guide',
    'Get structured prompt guidance for Gemini nano-banana (gemini-2.5-flash-image). Covers when to use it over Imagen, templates for generation/edit/composite/style transfer, reference-image tips, and model-specific notes. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: NANOBANANA_GUIDE }],
    }),
  );

  registerTool<Record<string, never>>(
    server,
    'veo_video_prompt_guide',
    'Get structured prompt guidance for Veo video generation. Returns best practices, templates, good/bad examples, image-to-video tips, and workflow patterns. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: VIDEO_GUIDE }],
    }),
  );

  registerTool<Record<string, never>>(
    server,
    'gemini_tts_prompt_guide',
    'Get structured prompt guidance for Gemini TTS (gemini_generate_speech). Covers 30 prebuilt voices, model tiers, style directives, inline audio tags, and multi-speaker patterns with official doc links. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: TTS_GUIDE }],
    }),
  );

  registerTool<Record<string, never>>(
    server,
    'gemini_lyria_prompt_guide',
    'Get structured prompt guidance for Lyria music generation (batch via gemini_generate_music + realtime via gemini_generate_music_live). Covers prompt anatomy, Lyria 3 Pro timestamps, negative prompts, realtime session lifecycle, and safety filter notes with official doc links. No API call — pure reference.',
    z.object({}).shape,
    async () => ({
      content: [{ type: 'text', text: LYRIA_GUIDE }],
    }),
  );

  registerTool<Record<string, never>>(
    server,
    'brand_spec_get',
    'Return the project brand spec (colors, fonts, scene description, default TTS voice, default Lyria prompt, watermark) parsed from the ARTIFICER_BRAND_SPEC env var. Returns a `configured: false` result when the env var is unset. Agents should call this once per session and reuse the values when composing text-overlay / image-gen / TTS / music prompts so projects stay visually consistent without the caller having to memorize specifics. No API call — pure env read.',
    z.object({}).shape,
    async () => {
      const spec = loadBrandSpec();
      if (!spec) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  configured: false,
                  hint: 'Set ARTIFICER_BRAND_SPEC in your MCP server env to a JSON object matching the brandSpecSchema (name, colors, fonts, scene_description, tts.voice, music.default_prompt, watermark_uri). All fields optional.',
                },
                null,
                2,
              ),
            },
          ],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({ configured: true, spec }, null, 2) }],
      };
    },
  );
}

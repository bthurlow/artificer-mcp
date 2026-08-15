import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const DIA_DIALOGUE_GUIDE = `# Dia TTS (Text-to-Dialogue) Prompt Guide

## What this model is best for
Realistic multi-speaker dialogue with natural nonverbals (laughter, throat clearing, sighs) — generated from a single text string using inline speaker tags. Open-weights model, cheaper per call than ElevenLabs Dialogue v3 when you want lightweight conversation rendering without ElevenLabs' voice library.

## Known strengths
- **Speaker tags embedded in a single text field** (\`[S1]\`, \`[S2]\`, ...). Simpler caller experience than Eleven Dialogue's structured \`inputs[]\` array — just write the script.
- **Nonverbal sounds**: \`(laughs)\`, \`(coughs)\`, \`(sighs)\`, other parenthetical cues render as real nonverbal audio.
- **Audio conditioning enables emotion control** (per fal's description) — reference audio can shape the emotional register of the output (check upstream docs for the exact mechanism).
- **Open weights** — the model is inspectable and the prompt language is documented rather than proprietary.

## Known weaknesses / quirks
- **No voice library.** Unlike Eleven Dialogue, Dia doesn't ship named voices you can select. Speaker identity is determined by the model based on context + tags. If you need specific voice identities (e.g. "use Charlotte"), use \`elevenlabs_dialogue_prompt_guide\` instead.
- **Minimal schema**: the tool accepts only \`text\`. Advanced controls (audio conditioning, etc.) live entirely in the model — check the upstream Dia documentation for how to invoke them.
- Less battle-tested in production pipelines vs ElevenLabs. Expect occasional mis-attribution of lines between speakers on long dialogues.

## Input requirements
- **text** (required) — the full dialogue with \`[S1]\` / \`[S2]\` / etc. speaker tags inline. Passed via the tool's structural \`text\` arg.

That's the entire schema. Everything else is inferred from the text.

Source: \`src/catalog/fal-specs/dia/llms.md\`.

## Prompt structure
1. **Open each turn with a speaker tag**: \`[S1] line one. [S2] line two.\`
2. **Tag numbering is arbitrary** — the model treats \`[S1]\` as speaker 1, \`[S2]\` as speaker 2, etc. Two speakers is the safe default; more than four gets unreliable.
3. **Nonverbals go in parentheses inside a turn**: \`[S1] That's hilarious. (laughs)\`
4. **Keep turns short** — ~1-2 sentences each for clean turn-taking.
5. **Punctuation drives pacing** — periods for end-of-turn, commas for mid-sentence breaths.

## Example prompts

**Two-person exchange with nonverbals:**
\`\`\`json
{
  "model": "fal-ai/dia-tts",
  "text": "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal.",
  "output": "./dia-intro.mp3"
}
\`\`\`

**Three-speaker scene:**
\`\`\`json
{
  "model": "fal-ai/dia-tts",
  "text": "[S1] Welcome to the show. Today we're talking about pricing. [S2] Thanks for having me. [S3] And thanks for the invite! [S1] Let's dive in. (pauses) What's the biggest mistake you see bakers make? [S2] Doubling ingredient cost and calling it a day.",
  "output": "./three-speakers.mp3"
}
\`\`\`

**Short comedic beat:**
\`\`\`json
{
  "model": "fal-ai/dia-tts",
  "text": "[S1] Is this thing on? (coughs) [S2] It's been on for five minutes. [S1] (sighs) Great.",
  "output": "./bit.mp3"
}
\`\`\`

## Access routes

| Provider | Tool                    | Model ID           | Cost                       | Notes |
|----------|-------------------------|--------------------|----------------------------|-------|
| fal      | \`fal_generate_speech\` | \`fal-ai/dia-tts\` | $0.04 per 1000 characters  | Single \`text\` field with \`[S1]\` / \`[S2]\` tags. Cheapest dialogue option on the Phase 5 catalog. |

## Last verified
2026-04-24 against artificer-mcp v0.9.0 — schema from \`src/catalog/fal-specs/dia/llms.md\`. Example tag structure validated against fal's published payload example.

## Official references
- Model page: https://fal.ai/models/fal-ai/dia-tts
- Dia upstream (open weights): check fal's linked GitHub from the model page
`;

export function registerDiaDialoguePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'dia_dialogue_prompt_guide',
    'Prompt guidance for Dia TTS on fal. Multi-speaker dialogue with [S1]/[S2] inline tags and nonverbal cues (laughs, sighs). Open-weights model. Cheapest dialogue option at $0.04/1K chars. No voice library — speaker identity is inferred. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: DIA_DIALOGUE_GUIDE }] }),
  );
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerImagenPromptGuide } from './imagen.js';
import { registerNanobananaPromptGuide } from './nanobanana.js';
import { registerVeoPromptGuide } from './veo.js';
import { registerGeminiTtsPromptGuide } from './gemini-tts.js';
import { registerLyriaPromptGuide } from './lyria.js';
import { registerWanPromptGuide } from './wan.js';
import { registerKlingAvatarPromptGuide } from './kling-avatar.js';
import { registerVeedFabricPromptGuide } from './veed-fabric.js';
import { registerElevenlabsSpeechPromptGuide } from './elevenlabs-speech.js';
import { registerElevenlabsDialoguePromptGuide } from './elevenlabs-dialogue.js';
import { registerElevenlabsMusicPromptGuide } from './elevenlabs-music.js';
import { registerElevenlabsSfxPromptGuide } from './elevenlabs-sfx.js';
import { registerMinimaxSpeechPromptGuide } from './minimax-speech.js';
import { registerMinimaxVoiceClonePromptGuide } from './minimax-voice-clone.js';
import { registerMinimaxMusicPromptGuide } from './minimax-music.js';
import { registerDiaDialoguePromptGuide } from './dia-dialogue.js';
import { registerLyria2PromptGuide } from './lyria2.js';
import { registerStableAudioPromptGuide } from './stable-audio.js';
import { registerCassetteSfxPromptGuide } from './cassette-sfx.js';
import { registerTranscriptionPromptGuide } from './transcription.js';
import { registerBrandSpecTool } from './brand-spec.js';

/**
 * Register prompt guide tools with the MCP server.
 *
 * Covers: gemini_image_prompt_guide, gemini_nanobanana_prompt_guide,
 * veo_video_prompt_guide, gemini_tts_prompt_guide, gemini_lyria_prompt_guide,
 * wan_video_prompt_guide, kling_avatar_prompt_guide, veed_fabric_prompt_guide,
 * elevenlabs_speech_prompt_guide, elevenlabs_dialogue_prompt_guide,
 * elevenlabs_music_prompt_guide, elevenlabs_sfx_prompt_guide,
 * minimax_speech_prompt_guide, minimax_voice_clone_prompt_guide,
 * minimax_music_prompt_guide, dia_dialogue_prompt_guide, lyria2_prompt_guide,
 * stable_audio_prompt_guide, cassette_sfx_prompt_guide,
 * transcription_prompt_guide, brand_spec_get.
 *
 * Per-model content lives in its own file under `src/guides/{slug}.ts` —
 * this module is the composition registry only. New guides land by adding
 * a file here and one import/register call below. See
 * `docs/conventions/prompt-guides.md` for the guide format spec.
 *
 * These are pure reference tools — no side effects, no API calls.
 * They return structured markdown to help compose effective prompts.
 */
export function registerGuideTools(server: McpServer): void {
  registerImagenPromptGuide(server);
  registerNanobananaPromptGuide(server);
  registerVeoPromptGuide(server);
  registerGeminiTtsPromptGuide(server);
  registerLyriaPromptGuide(server);
  registerWanPromptGuide(server);
  registerKlingAvatarPromptGuide(server);
  registerVeedFabricPromptGuide(server);
  registerElevenlabsSpeechPromptGuide(server);
  registerElevenlabsDialoguePromptGuide(server);
  registerElevenlabsMusicPromptGuide(server);
  registerElevenlabsSfxPromptGuide(server);
  registerMinimaxSpeechPromptGuide(server);
  registerMinimaxVoiceClonePromptGuide(server);
  registerMinimaxMusicPromptGuide(server);
  registerDiaDialoguePromptGuide(server);
  registerLyria2PromptGuide(server);
  registerStableAudioPromptGuide(server);
  registerCassetteSfxPromptGuide(server);
  registerTranscriptionPromptGuide(server);
  registerBrandSpecTool(server);
}

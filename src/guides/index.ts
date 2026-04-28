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
import { registerAssKaraokePromptGuide } from './ass-karaoke.js';
import { registerSoraPromptGuide } from './sora-video.js';
import { registerLumaRayPromptGuide } from './luma-ray.js';
import { registerKlingVideoPromptGuide } from './kling-video.js';
import { registerSeedancePromptGuide } from './seedance.js';
import { registerMareyPromptGuide } from './marey.js';
import { registerHailuoPromptGuide } from './hailuo.js';
import { registerMinimaxVideoPromptGuide } from './minimax-video.js';
import { registerPikaPromptGuide } from './pika.js';
import { registerPixversePromptGuide } from './pixverse.js';
import { registerLtxVideoPromptGuide } from './ltx-video.js';
import { registerHunyuanVideoPromptGuide } from './hunyuan-video.js';
import { registerViduPromptGuide } from './vidu.js';
import { registerKandinskyVideoPromptGuide } from './kandinsky-video.js';
import { registerGrokImaginePromptGuide } from './grok-imagine.js';
import { registerDecartLucyPromptGuide } from './decart-lucy.js';
import { registerCogVideoxPromptGuide } from './cogvideox.js';
import { registerMochiPromptGuide } from './mochi.js';
import { registerNvidiaCosmosPromptGuide } from './nvidia-cosmos.js';
import { registerLongcatPromptGuide } from './longcat-video.js';
import { registerMagiPromptGuide } from './magi.js';
import { registerSanaPromptGuide } from './sana-video.js';
import { registerSpecializedVideoPromptGuide } from './specialized-video.js';
import { registerLegacyVideoPromptGuide } from './legacy-video.js';
import { registerHappyHorsePromptGuide } from './happy-horse.js';
import { registerBytedanceLynxPromptGuide } from './bytedance-lynx.js';
import { registerBrandSpecTool } from './brand-spec.js';

/**
 * Register prompt guide tools with the MCP server.
 *
 * Existing guides cover the original audio / image / video model surface
 * plus transcription and ASS karaoke. The 2026-04-28 video catalog seed
 * added 23 new prompt guide families covering every fal-hosted t2v / i2v /
 * multi-ref / FLF model — see `src/catalog/models.json` for the full route
 * list grouped by sub-class (cinematic / general / stylized / talking_head).
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
  // Image
  registerImagenPromptGuide(server);
  registerNanobananaPromptGuide(server);

  // Existing video (Veo, Wan, Kling Avatar, VEED Fabric)
  registerVeoPromptGuide(server);
  registerWanPromptGuide(server);
  registerKlingAvatarPromptGuide(server);
  registerVeedFabricPromptGuide(server);

  // Audio (TTS / dialogue / music / sfx / transcription / karaoke)
  registerGeminiTtsPromptGuide(server);
  registerLyriaPromptGuide(server);
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
  registerAssKaraokePromptGuide(server);

  // Video — cinematic (premium tier)
  registerSoraPromptGuide(server);
  registerLumaRayPromptGuide(server);
  registerKlingVideoPromptGuide(server);
  registerSeedancePromptGuide(server);
  registerMareyPromptGuide(server);

  // Video — general (mid-tier + niche)
  registerHailuoPromptGuide(server);
  registerMinimaxVideoPromptGuide(server);
  registerPikaPromptGuide(server);
  registerPixversePromptGuide(server);
  registerLtxVideoPromptGuide(server);
  registerHunyuanVideoPromptGuide(server);
  registerViduPromptGuide(server);
  registerKandinskyVideoPromptGuide(server);
  registerGrokImaginePromptGuide(server);
  registerDecartLucyPromptGuide(server);
  registerCogVideoxPromptGuide(server);
  registerMochiPromptGuide(server);
  registerNvidiaCosmosPromptGuide(server);
  registerLongcatPromptGuide(server);
  registerMagiPromptGuide(server);
  registerSanaPromptGuide(server);
  registerSpecializedVideoPromptGuide(server);
  registerLegacyVideoPromptGuide(server);

  // Video — talking-head (audio-driven / lip-sync / character-id)
  registerHappyHorsePromptGuide(server);
  registerBytedanceLynxPromptGuide(server);

  // Branding
  registerBrandSpecTool(server);
}

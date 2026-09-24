import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_LIPSYNC_GUIDE = `# fal Lip-Sync & Audio-Driven Performance (grouped) — Prompt Guide

## What's in this guide
Putting a real vocal or voice line onto a face, through \`fal_generate_video\`. Two kinds of model:

- **Still + audio → video**: generate a singing or talking shot from one keyframe (OmniHuman 1.5, MiniMax H3 Max lip-sync, Sync-3 avatar, InfiniteTalk, AI Avatar Multi, Wan 2.2 speech-to-video).
- **Video + audio → video**: re-lip-sync an existing clip to new audio (Sync-3, Sync React-1, Kling lipsync, VEED, Heygen, InfiniteTalk v2v).

For audio-driven video that isn't specifically a lip-sync tool, see the LTX audio-to-video routes in \`ltx_video_prompt_guide\`, and the talking-head models in \`kling_avatar_prompt_guide\` / \`veed_fabric_prompt_guide\`.

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`omnihuman-1.5-lipsync\` | Omnihuman v1.5 is a new and improved version of Omnihuman. It generates video using an image of a human figure paired with an audio file. It produces vivid,… | **\`audio_url\`**, **\`image_url\`**, \`mask_url\`, \`resolution\`, \`prompt\` (+1 more) |
| \`minimax-h3-max-lipsync\` | H3 Max Lip Sync generates a video from an image and supplied audio, synchronizing mouth movements to the soundtrack. It supports optional transcription guida… | **\`audio_url\`**, **\`image_url\`**, \`resolution\` (+3 more) |
| \`sync-3-lipsync\` | sync-3 most powerful lipsync model yet, featuring native visual intelligence for professional-quality video. | **\`audio_url\`**, **\`video_url\`**, \`sync_mode\` (+1 more) |
| \`sync-3-avatar-lipsync\` | sync-3 image to video turns a single still into a talking character, and works with any illustration or animated frame paired with a voice track | **\`audio_url\`**, **\`image_url\`** |
| \`sync-react-1-lipsync\` | Use React-1 from SyncLabs to refine human emotions and do realistic lip-sync without losing details! | **\`audio_url\`**, **\`emotion\`**, **\`video_url\`** (+3 more) |
| \`kling-lipsync\` | Kling LipSync is an audio-to-video model that generates realistic lip movements from audio input. | **\`video_url\`**, **\`audio_url\`** |
| \`veed-lipsync-2\` | Generate production-quality lipsync from any audio using VEED's most advanced model yet. | **\`audio_url\`**, **\`video_url\`** |
| \`heygen-lipsync-precision\` | Replace or dub audio on an existing video with high-accuracy avatar-inference lip-sync. | **\`video_url\`**, **\`audio_url\`** (+7 more) |
| \`heygen-lipsync-speed\` | Replace or dub audio on an existing video with fast audio-only lip-sync. | **\`video_url\`**, **\`audio_url\`** (+7 more) |
| \`infinitalk-lipsync\` | Infinitalk model generates a talking avatar video from an image and audio file. The avatar lip-syncs to the provided audio with natural facial expressions. | **\`prompt\`**, **\`image_url\`**, **\`audio_url\`**, \`resolution\` (+3 more) |
| \`infinitalk-v2v-lipsync\` | Infinitalk model generates a talking avatar video from an image and audio file. The avatar lip-syncs to the provided audio with natural facial expressions. | **\`video_url\`**, **\`prompt\`**, **\`audio_url\`**, \`resolution\` (+3 more) |
| \`ai-avatar-multi-lipsync\` | MultiTalk model generates a multi-person conversation video from an image and audio files. Creates a realistic scene where multiple people speak in sequence. | **\`first_audio_url\`**, **\`prompt\`**, **\`image_url\`**, \`resolution\` (+5 more) |
| \`wan-2.2-speech-to-video-lipsync\` | Wan-S2V is a video model that generates high-quality videos from static images and audio, with realistic facial expressions, body movements, and professional… | **\`image_url\`**, **\`prompt\`**, **\`audio_url\`**, \`resolution\` (+11 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week. Billing units differ a lot between these models: some charge per second of output, some per second of **input** video (Kling's lipsync rounds up to 5-second increments), and some per minute.

## Inputs
- \`image\` → \`image_url\`: the still for image + audio models.
- \`video\` → \`video_url\`: the clip to re-sync, for video + audio models.
- \`audio\` → \`audio_url\`: the vocal or voice line.
- Everything else goes in \`extra_params\` (e.g. Sync-3's \`sync_mode\`, React-1's \`emotion\`, H3 Max's \`enable_transcription\`), or in \`extra_files\` for extra file inputs such as a second person's image and audio on AI Avatar Multi. Check each model's exact keys in its spec: \`src/catalog/fal-specs/<slug>/openapi.json\`.

## Singing: what the vendor docs don't cover
- **Feed the isolated vocal stem, not the full mix.** Drums and guitars read as mouth motion, and reverb tails smear word endings. Make the stem with \`fal_separate_audio({ model: "fal-ai/demucs", audio: "./song.wav", output_dir: "./stems", stems: ["vocals"] })\`, then lay the full master back over the finished edit.
- **Chunk long passages at phrase boundaries** to fit per-call caps (from the #20 research: OmniHuman 1.5 about 30s per call at 1080p, MiniMax H3 Max 5–15s). Start each chunk slightly before the vocal entrance so the first consonant has room.
- **Duets:** no fal model reliably renders two faces singing at once. Default to single-singer shots. For a two-shot, re-sync one face per pass (Sync-3 handles one face per pass). Demucs puts both singers in one \`vocals\` stem, so split a duet by timestamp (mute the other singer's lines) before each pass.
- **Resolution ceilings:** InfiniteTalk, AI Avatar Multi (MultiTalk) and Wan 2.2 speech-to-video are 720p at most, which rules them out for 1080p hero shots.
- **MiniMax H3 Max lip-sync:** per #20, set \`enable_transcription: false\` for singing.

## Example calls
\`\`\`
fal_generate_video({
  model: "fal-ai/bytedance/omnihuman/v1.5",
  image: "./keyframe.png",
  audio: "./stems/verse1-vocals.wav",
  output: "./verse1.mp4"
})

fal_generate_video({
  model: "fal-ai/sync-lipsync/v3",
  video: "./take-07.mp4",
  audio: "./stems/chorus-vocals.wav",
  output: "./take-07-synced.mp4",
  extra_params: { sync_mode: "cut_off" }
})

fal_generate_video({
  model: "fal-ai/kling-video/lipsync/audio-to-video",
  video: "./clip.mp4",
  audio: "./line.wav",
  output: "./clip-synced.mp4"
})
\`\`\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`omnihuman-1.5-lipsync\` | \`fal-ai/bytedance/omnihuman/v1.5\` |
| \`minimax-h3-max-lipsync\` | \`minimax/h3-max/lip-sync/image-to-video\` |
| \`sync-3-lipsync\` | \`fal-ai/sync-lipsync/v3\` |
| \`sync-3-avatar-lipsync\` | \`fal-ai/sync-lipsync/v3/image-to-video\` |
| \`sync-react-1-lipsync\` | \`fal-ai/sync-lipsync/react-1\` |
| \`kling-lipsync\` | \`fal-ai/kling-video/lipsync/audio-to-video\` |
| \`veed-lipsync-2\` | \`veed/lipsync/v2\` |
| \`heygen-lipsync-precision\` | \`fal-ai/heygen/v3/lipsync/precision\` |
| \`heygen-lipsync-speed\` | \`fal-ai/heygen/v3/lipsync/speed\` |
| \`infinitalk-lipsync\` | \`fal-ai/infinitalk\` |
| \`infinitalk-v2v-lipsync\` | \`fal-ai/infinitalk/video-to-video\` |
| \`ai-avatar-multi-lipsync\` | \`fal-ai/ai-avatar/multi\` |
| \`wan-2.2-speech-to-video-lipsync\` | \`fal-ai/wan/v2.2-14b/speech-to-video\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt (inputs, descriptions, pricing via the catalog). Singing guidance comes from the TODO #20 research. Singing quality has not been compared side by side; a short test with one sustained-note phrase and one fast-lyric phrase through OmniHuman 1.5, H3 Max and Sync-3 would settle the ranking.
`;

export function registerFalLipsyncPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_lipsync_prompt_guide',
    'Grouped guide for fal lip-sync and audio-driven performance models: still + audio → video (OmniHuman 1.5, MiniMax H3 Max lip-sync, Sync-3 avatar, InfiniteTalk, AI Avatar Multi, Wan 2.2 S2V) and video + audio re-sync (Sync-3, Sync React-1, Kling, VEED, Heygen). Includes singing advice: isolated vocal stem, phrase chunking, duets. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_LIPSYNC_GUIDE }] }),
  );
}

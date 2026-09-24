import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_VIDEO_EDIT_GUIDE = `# fal Video Edit (grouped) — Prompt Guide

## What's in this guide
Changing a clip you already have, through \`fal_generate_video\` with the \`video\` input: prompt-driven modify and restyle, reference-guided edits, extend, inpaint and outpaint, reframe, and removing objects or the background.

Reach for it to **fix a take instead of re-rolling it**, which protects continuity across a chain of clips (TODO #22), to change a clip's aspect ratio, or to cut a subject out.

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`luma-ray-3.2-v2v\` | Luma Ray 3.2 re-renders an existing video into new cinematic motion guided by a text prompt, preserving the source's look and movement while controlling reso… | **\`video_url\`**, **\`prompt\`**, \`resolution\`, \`keyframes\`, \`duration\`, \`start_image_url\`, \`keyframe_indexes\` (+6 more) |
| \`luma-ray-3.2-reframe\` | Luma Ray 3.2 reframes an existing video into a new aspect ratio guided by a text prompt, preserving the original footage frame-for-frame while controlling re… | **\`prompt\`**, **\`aspect_ratio\`**, **\`video_url\`**, \`resolution\`, \`duration\` (+1 more) |
| \`kling-o3-4k-v2v-edit\` | Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling | **\`video_url\`**, **\`prompt\`**, \`image_urls\` (+3 more) |
| \`kling-o3-4k-v2v-ref\` | Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling | **\`video_url\`**, **\`prompt\`**, \`aspect_ratio\`, \`duration\`, \`image_urls\` (+3 more) |
| \`ltx-2.3-quality-extend\` | Extend high-quality video with audio from input video using LTX-2.3 | **\`video_url\`**, **\`prompt\`**, \`sync_mode\`, \`end_image_url\`, \`resolution\` (+16 more) |
| \`ltx-2.3-quality-inpaint\` | Inpaint high-quality video using LTX-2.3 | **\`mask_video_url\`**, **\`video_url\`**, **\`prompt\`**, \`sync_mode\` (+12 more) |
| \`lucy-edit-pro\` | Edit outfits, objects, faces, or restyle your video - all with maximum detail retention. | **\`video_url\`**, **\`prompt\`**, \`resolution\`, \`sync_mode\` (+2 more) |
| \`lucy-restyle\` | Restyle videos up to 30 min long - maintaining maximum detail quality. | **\`video_url\`**, **\`prompt\`**, \`resolution\`, \`sync_mode\` (+2 more) |
| \`wan-vace-video-edit\` | Edit videos using plain language and Wan VACE | **\`video_url\`**, **\`prompt\`**, \`aspect_ratio\`, \`resolution\`, \`image_urls\` (+6 more) |
| \`wan-2.2-vace-inpaint\` | VACE Fun for Wan 2.2 A14B from Alibaba-PAI | **\`video_url\`**, **\`prompt\`**, \`resolution\`, \`aspect_ratio\`, \`sync_mode\` (+28 more) |
| \`wan-2.2-vace-outpaint\` | VACE Fun for Wan 2.2 A14B from Alibaba-PAI | **\`video_url\`**, **\`prompt\`**, \`resolution\`, \`aspect_ratio\`, \`sync_mode\` (+30 more) |
| \`bria-video-erase-prompt\` | Erase unwanted objects, people, or elements from video with a text prompt. High-fidelity output with strong temporal consistency, trained on licensed data fo… | **\`video_url\`**, **\`prompt\`** (+3 more) |
| \`bria-video-erase-mask\` | High-fidelity mask-based video object removal with strong temporal consistency. Erase unwanted objects, people, or elements while preserving aesthetic qualit… | **\`video_url\`**, **\`mask_video_url\`** (+3 more) |
| \`bria-video-background-removal-3\` | Remove backgrounds from any video with Bria's VRMBG 3.0. Fast, accurate background removal across talking heads, podcasts, product videos, commercials, and c… | **\`video_url\`** (+4 more) |
| \`veed-video-background-removal\` | Remove background from any video with people and objects. No green screen needed. | **\`video_url\`** (+3 more) |
| \`pixelcut-video-background-removal\` | Pixelcut's Video Background Remover is an AI segmentation model that erases backgrounds frame by frame, with seamless temporal consistency. | **\`video_url\`**, \`output_format\` (+2 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week. Many edit models bill per second of **input** video, some with a minimum.

## Inputs
- \`video\` → \`video_url\`: the clip to edit.
- \`prompt\`: the change you want, on prompt-driven models (modify, restyle, erase-by-prompt, VACE edit).
- Masks and references go in \`extra_files\` under the model's own key, e.g. a mask video or reference images. Check \`src/catalog/fal-specs/<slug>/openapi.json\` for the exact name, since it varies per model.
- Other knobs (aspect ratio for reframe, strength, seed) go in \`extra_params\`.

## Example calls
\`\`\`
fal_generate_video({
  model: "luma/agent/ray/v3.2/video-to-video",
  video: "./take.mp4",
  prompt: "same shot, golden-hour light, light rain on the windows",
  output: "./take-golden.mp4"
})

fal_generate_video({
  model: "luma/agent/ray/v3.2/reframe",
  video: "./landscape.mp4",
  aspect_ratio: "9:16",
  output: "./vertical.mp4"
})

fal_generate_video({
  model: "bria/video/erase/prompt",
  video: "./street.mp4",
  prompt: "the parked red car",
  output: "./street-clean.mp4"
})
\`\`\`

## Gotchas
- **Prompt-driven edits can drift** away from the source (identity, framing). Keep the prompt about the change and restate what must stay the same.
- **Background removal output** is a video; check the model's spec for whether it returns alpha or a matte/green screen before compositing.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`luma-ray-3.2-v2v\` | \`luma/agent/ray/v3.2/video-to-video\` |
| \`luma-ray-3.2-reframe\` | \`luma/agent/ray/v3.2/reframe\` |
| \`kling-o3-4k-v2v-edit\` | \`fal-ai/kling-video/o3/4k/video-to-video/edit\` |
| \`kling-o3-4k-v2v-ref\` | \`fal-ai/kling-video/o3/4k/video-to-video/reference\` |
| \`ltx-2.3-quality-extend\` | \`fal-ai/ltx-2.3-quality/extend-video\` |
| \`ltx-2.3-quality-inpaint\` | \`fal-ai/ltx-2.3-quality/inpaint\` |
| \`lucy-edit-pro\` | \`decart/lucy-edit/pro\` |
| \`lucy-restyle\` | \`decart/lucy-restyle\` |
| \`wan-vace-video-edit\` | \`fal-ai/wan-vace-apps/video-edit\` |
| \`wan-2.2-vace-inpaint\` | \`fal-ai/wan-22-vace-fun-a14b/inpainting\` |
| \`wan-2.2-vace-outpaint\` | \`fal-ai/wan-22-vace-fun-a14b/outpainting\` |
| \`bria-video-erase-prompt\` | \`bria/video/erase/prompt\` |
| \`bria-video-erase-mask\` | \`bria/video/erase/mask\` |
| \`bria-video-background-removal-3\` | \`bria/video/background-removal/v3\` |
| \`veed-video-background-removal\` | \`veed/video-background-removal\` |
| \`pixelcut-video-background-removal\` | \`pixelcut/video-background-removal\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Edit quality has not been compared side by side.
`;

export function registerFalVideoEditPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_video_edit_prompt_guide',
    "Grouped guide for fal video edit models: modify and restyle (Luma Ray 3.2, Lucy, Kling O3 4K v2v), extend and inpaint (LTX 2.3), VACE edit/in/outpaint, reframe, object erase and background removal, via fal_generate_video's video input. No API call — pure reference.",
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_VIDEO_EDIT_GUIDE }] }),
  );
}

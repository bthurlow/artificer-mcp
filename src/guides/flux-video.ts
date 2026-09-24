import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FLUX_VIDEO_GUIDE = `# FLUX.3 Video (Black Forest Labs) — Prompt Guide

## What's in this guide
Black Forest Labs' FLUX.3 video models on fal: text-to-video and image-to-video, through \`fal_generate_video\`.

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`flux-3-video-t2v\` | FLUX 3 is Black Forest Labs' frontier video model. This endpoint generates video directly from a text prompt, translating a written description into motion,… | **\`prompt\`**, \`duration\`, \`resolution\`, \`aspect_ratio\` (+2 more) |
| \`flux-3-video-i2v\` | FLUX 3 is Black Forest Labs' frontier video model. This endpoint animates a single still image into video, extending one frame into coherent, natural motion. | **\`prompt\`**, **\`image_url\`**, \`duration\`, \`resolution\`, \`aspect_ratio\` (+2 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week.

## Inputs
- \`prompt\`: the shot description.
- \`image\` → \`image_url\`: the start frame, for image-to-video.
- \`duration_seconds\` → \`duration\`, \`aspect_ratio\` and \`resolution\` are structural args; other knobs go in \`extra_params\`. Check the accepted values in \`src/catalog/fal-specs/<slug>/openapi.json\`.

## Example calls
\`\`\`
fal_generate_video({
  model: "blackforestlabs/flux-3/text-to-video",
  prompt: "slow dolly-in on a neon diner at night, rain on the window, steam from a coffee cup",
  output: "./diner.mp4"
})

fal_generate_video({
  model: "blackforestlabs/flux-3/image-to-video",
  prompt: "the camera pushes in slowly as the subject turns toward the window",
  image: "./keyframe.png",
  output: "./shot.mp4"
})
\`\`\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`flux-3-video-t2v\` | \`blackforestlabs/flux-3/text-to-video\` |
| \`flux-3-video-i2v\` | \`blackforestlabs/flux-3/image-to-video\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Not compared side by side with other video models.
`;

export function registerFluxVideoPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'flux_video_prompt_guide',
    'Reference guide for Black Forest Labs FLUX.3 video on fal (text-to-video and image-to-video). No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FLUX_VIDEO_GUIDE }] }),
  );
}

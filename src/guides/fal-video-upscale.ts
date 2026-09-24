import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_VIDEO_UPSCALE_GUIDE = `# fal Video Upscale & Restore (grouped) — Prompt Guide

## What's in this guide
Improving a clip you already have, through \`fal_generate_video\` with the \`video\` input: upscaling, frame interpolation, denoise, deblur, SDR→HDR, colorize.

Use it to take a 720p generation to 1080p or 4K before publishing, to smooth a low-fps clip, or to clean up noisy footage. For native 4K generation instead of upscaling, see the Kling O3 4K routes in \`kling_video_prompt_guide\`.

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`topaz-video-upscale-precision\` | Professional video upscaling powered by Topaz Labs. Precision models (Proteus, Artemis, Iris, Dione, Theia, Gaia, Rhea) enhance footage up to 4x while stayin… | **\`video_url\`**, \`target_fps\`, \`upscale_factor\` (+7 more) |
| \`topaz-video-upscale-creative\` | Professional creative video upscaling powered by Topaz Labs. Astra 2 reimagines fine detail and typically delivers 4K output. Best for cinematic shots that n… | **\`video_url\`**, \`target_fps\`, \`upscale_factor\`, \`prompt\` (+4 more) |
| \`topaz-video-upscale-generative\` | Professional generative video upscaling powered by Topaz Labs. Starlight models rebuild detail that is not in the source, with Fast variants at half the pric… | **\`video_url\`**, \`upscale_factor\`, \`target_fps\` (+3 more) |
| \`topaz-video-interpolate\` | Professional frame interpolation powered by Topaz Labs. Apollo, Chronos and Aion retime footage up to 120 fps, from smooth motion to extreme slow motion. Bes… | **\`video_url\`**, \`target_fps\` (+3 more) |
| \`topaz-video-denoise\` | Professional video denoising powered by Topaz Labs. Nyx models remove noise at source resolution, with Nyx Fast as a lighter, cheaper pass. Best for low-ligh… | **\`video_url\`**, \`upscale_factor\` (+5 more) |
| \`topaz-video-deblur\` | Professional motion deblur powered by Topaz Labs. Themis 2 restores clarity to fast-moving, motion-blurred footage at source resolution. Best for sports and… | **\`video_url\`** (+1 more) |
| \`topaz-video-sdr-to-hdr\` | Professional SDR-to-HDR conversion powered by Topaz Labs. Hyperion 2.5 redistributes luminance and color while preserving detail in text, faces and motion. B… | **\`video_url\`**, \`output_format\` |
| \`topaz-video-colorize\` | Professional video colorization powered by Topaz Labs. Brings natural color to black-and-white footage, upscaled to at least 1080p. Best for archival and his… | **\`video_url\`** (+1 more) |
| \`flux-video-upscale\` | Upscale videos to 1080p, 2K, or 4K via API. FLUX 3 powered super-resolution with a precise mode and a creative detail-enhancement mode. | **\`video_url\`**, \`prompt\`, \`upscale_factor\` (+2 more) |
| \`seedvr-2-video-upscale\` | Upscale your videos using SeedVR2 with temporal consistency! | **\`video_url\`**, \`upscale_factor\`, \`sync_mode\`, \`target_resolution\`, \`output_format\` (+5 more) |
| \`flashvsr-video-upscale\` | Upscale your videos using FlashVSR with the fastest speeds! | **\`video_url\`**, \`output_format\`, \`upscale_factor\`, \`sync_mode\` (+7 more) |
| \`bytedance-video-upscale\` | Upscale videos with Bytedance's video upscaler. | **\`video_url\`**, \`target_resolution\`, \`target_fps\` (+5 more) |
| \`crystal-video-upscale\` | Do high precision video upscaling that respects the original video perfectly using Crystal Upscaler's new video upscaling method! | **\`video_url\`** (+1 more) |
| \`bria-video-increase-resolution\` | Professional-grade video upscaler with strong temporal consistency, enhancing videos up to 8K resolution. Trained on fully licensed and commercially safe dat… | **\`video_url\`** (+3 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week. **Check the billing unit before running a long clip.** These models bill per second of input, per second of output, per megapixel of video data, or by output resolution tier, and an upscale or interpolation pass multiplies output size.

## Inputs
- \`video\` → \`video_url\`: the source clip (required by every model here). Local paths are uploaded for you.
- Model knobs go in \`extra_params\`: e.g. \`upscale_factor\`, \`target_fps\` (Topaz), \`target_resolution\` (some upscalers), and a \`prompt\` on the creative/generative Topaz tiers. Exact names and ranges are in \`src/catalog/fal-specs/<slug>/openapi.json\`.
- \`prompt\` is optional or absent on most of these; they are task models.

## Example calls
\`\`\`
fal_generate_video({
  model: "topaz/upscale/video/precision",
  video: "./shot-720p.mp4",
  output: "./shot-4k.mp4",
  extra_params: { upscale_factor: 2 }
})

fal_generate_video({
  model: "topaz/interpolate/video",
  video: "./clip-24fps.mp4",
  output: "./clip-60fps.mp4",
  extra_params: { target_fps: 60 }
})

fal_generate_video({
  model: "fal-ai/seedvr/upscale/video",
  video: "./clip.mp4",
  output: "./clip-up.mp4"
})
\`\`\`

## Gotchas
- **Generative upscalers invent detail** (Topaz creative / generative tiers, FLUX video upscale). Use the precision tier when the result must stay faithful to the source, e.g. faces or text.
- **These runs can be slow**; raise \`poll_timeout_seconds\` for long clips.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`topaz-video-upscale-precision\` | \`topaz/upscale/video/precision\` |
| \`topaz-video-upscale-creative\` | \`topaz/upscale/video/creative\` |
| \`topaz-video-upscale-generative\` | \`topaz/upscale/video/generative\` |
| \`topaz-video-interpolate\` | \`topaz/interpolate/video\` |
| \`topaz-video-denoise\` | \`topaz/denoise/video\` |
| \`topaz-video-deblur\` | \`topaz/deblur/video\` |
| \`topaz-video-sdr-to-hdr\` | \`topaz/sdr-to-hdr/video\` |
| \`topaz-video-colorize\` | \`topaz/colorize/video\` |
| \`flux-video-upscale\` | \`blackforestlabs/flux-video-upscale\` |
| \`seedvr-2-video-upscale\` | \`fal-ai/seedvr/upscale/video\` |
| \`flashvsr-video-upscale\` | \`fal-ai/flashvsr/upscale/video\` |
| \`bytedance-video-upscale\` | \`fal-ai/bytedance-upscaler/upscale/video\` |
| \`crystal-video-upscale\` | \`clarityai/crystal-video-upscaler\` |
| \`bria-video-increase-resolution\` | \`bria/video/increase-resolution\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Output quality has not been compared side by side.
`;

export function registerFalVideoUpscalePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_video_upscale_prompt_guide',
    "Grouped guide for fal video upscale and restore models (Topaz upscale/interpolate/denoise/deblur/SDR-to-HDR/colorize, SeedVR2, FlashVSR, ByteDance, Crystal, Bria, FLUX video upscale), via fal_generate_video's video input. No API call — pure reference.",
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_VIDEO_UPSCALE_GUIDE }] }),
  );
}

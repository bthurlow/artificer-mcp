import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_IMAGE_UPSCALE_GUIDE = `# fal Image Upscale & Restore (grouped) — Prompt Guide

## What's in this guide
Improving an existing image on fal, through \`fal_generate_image\`: upscaling, restoration, denoise, sharpen, face restoration (CodeFormer) and colorization (DDColor).

For print masters or brand assets above what a generator produces natively. The local \`resize\` ImageMagick tool is a free, non-AI alternative for modest enlargements.

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`topaz-upscale-precision\` | Professional photo upscaling powered by Topaz Labs. Gigapixel precision models (Standard V2, High Fidelity, Low Resolution, CGI, Text Refine) enlarge images… | **\`image_url\`**, \`upscale_factor\`, \`output_format\` (+10 more) |
| \`topaz-upscale-creative\` | Professional creative image upscaling powered by Topaz Labs. Bloom 2 reinvents detail with adjustable creativity and color preservation. Best for AI-generate… | **\`image_url\`**, \`upscale_factor\`, \`output_format\` (+5 more) |
| \`topaz-upscale-generative\` | Professional generative image upscaling powered by Topaz Labs. Wonder 3.5 leads the range, with Redefine for prompt-guided detail and Recovery for extreme lo… | **\`image_url\`**, \`upscale_factor\`, \`output_format\`, \`prompt\` (+13 more) |
| \`topaz-upscale-transparent\` | Professional transparent-image upscaling powered by Topaz Labs. Preserves the alpha channel end to end with PNG output. Best for logos, stickers and assets w… | **\`image_url\`**, \`output_format\` |
| \`topaz-restore\` | Professional image restoration powered by Topaz Labs. Recover 3 generatively rebuilds natural detail; Dust-Scratch V2 cleans film dust and scratches. Best fo… | **\`image_url\`**, \`output_format\` (+1 more) |
| \`topaz-denoise\` | Professional photo denoising powered by Topaz Labs. Normal, Strong and Extreme presets clean noise at source resolution; Denoise Max adds generative detail r… | **\`image_url\`**, \`output_format\` (+1 more) |
| \`topaz-sharpen\` | Professional photo sharpening powered by Topaz Labs. Models tuned per blur type (lens, motion, portrait, wildlife), plus Super Focus for generative recovery… | **\`image_url\`**, \`output_format\` (+1 more) |
| \`seedvr-2-upscale\` | Use SeedVR2 to upscale your images | **\`image_url\`**, \`upscale_factor\`, \`sync_mode\`, \`output_format\`, \`target_resolution\` (+3 more) |
| \`crystal-upscaler\` | An advanced image enhancement tool designed specifically for facial details and portrait photography, utilizing Clarity AI's upscaling technology. | **\`image_url\`**, \`output_format\` (+2 more) |
| \`bria-increase-resolution\` | Upscale any image 2x or 4x, up to 8192×8192, with Bria Increase Resolution. Preserves the original content — no regeneration, no altered details. Commercial-… | **\`image_url\`**, \`sync_mode\` (+4 more) |
| \`bria-upscale-creative\` | Professional-grade creative upscaler that doubles resolution up to 10MP, regenerating sharper textures, refined details, and cleaner faces. Trained exclusive… | \`sync_mode\`, \`image_url\` (+2 more) |
| \`codeformer\` | Fix distorted or blurred photos of people with CodeFormer. | **\`image_url\`**, \`upscale_factor\` (+5 more) |
| \`ddcolor\` | Bring colors into old or new black and white photos with DDColor. | **\`image_url\`** (+1 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week. Upscale pricing often scales with **output** size.

## Inputs
- \`image\` → \`image_url\`: required by every model here.
- \`prompt\`: only on the generative / creative tiers that accept one (see the table); the rest are prompt-less.
- Knobs go in \`extra_params\`: \`upscale_factor\` (Topaz, SeedVR2, CodeFormer), \`target_resolution\` (SeedVR2), \`output_format\`. Exact ranges are in \`src/catalog/fal-specs/<slug>/openapi.json\`.

## Output format
Saved **exactly as the model returns it**. Set \`output_format\` where supported. Enum values differ: Topaz uses \`jpeg\`/\`png\`, while SeedVR2 and Crystal use \`jpg\`. Use a matching extension.

## Example calls
\`\`\`
fal_generate_image({
  model: "topaz/upscale/image/precision",
  image: "./logo-1024.png",
  output: "./logo-4096.png",
  extra_params: { upscale_factor: 4, output_format: "png" }
})

fal_generate_image({
  model: "fal-ai/codeformer",
  image: "./old-portrait.jpg",
  output: "./portrait-restored.png"
})
\`\`\`

## Gotchas
- **Generative upscalers invent detail** (Topaz creative / generative, Bria creative upscale). Use a precision tier when the result must stay faithful to the source, e.g. logos, text or faces.
- **Transparency**: \`topaz-upscale-transparent\` is the tier for images with an alpha channel; the others may flatten it.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`topaz-upscale-precision\` | \`topaz/upscale/image/precision\` |
| \`topaz-upscale-creative\` | \`topaz/upscale/image/creative\` |
| \`topaz-upscale-generative\` | \`topaz/upscale/image/generative\` |
| \`topaz-upscale-transparent\` | \`topaz/upscale/image/transparent\` |
| \`topaz-restore\` | \`topaz/restore/image\` |
| \`topaz-denoise\` | \`topaz/denoise/image\` |
| \`topaz-sharpen\` | \`topaz/sharpen/image\` |
| \`seedvr-2-upscale\` | \`fal-ai/seedvr/upscale/image\` |
| \`crystal-upscaler\` | \`clarityai/crystal-upscaler\` |
| \`bria-increase-resolution\` | \`bria/increase-resolution\` |
| \`bria-upscale-creative\` | \`bria/upscale/creative\` |
| \`codeformer\` | \`fal-ai/codeformer\` |
| \`ddcolor\` | \`fal-ai/ddcolor\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Output quality has not been compared side by side.
`;

export function registerFalImageUpscalePromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_image_upscale_prompt_guide',
    'Grouped guide for fal image upscale and restore models (Topaz upscale/restore/denoise/sharpen, SeedVR2, Crystal, Bria, CodeFormer faces, DDColor colorize). No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_IMAGE_UPSCALE_GUIDE }] }),
  );
}

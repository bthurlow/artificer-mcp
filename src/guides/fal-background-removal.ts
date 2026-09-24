import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_BACKGROUND_REMOVAL_GUIDE = `# fal Background Removal & Segmentation (grouped) — Prompt Guide

## What's in this guide
ML cutouts, matting and segmentation on fal, through \`fal_generate_image\`. Use them for soft edges, hair and photographic backgrounds that the local \`background-remove\` tool's color-key and flood-fill modes can't handle (TODO #13b).

Covered elsewhere: removing an *object* or replacing the background (\`fal_image_edit_prompt_guide\`).

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`birefnet-2\` | bilateral reference framework (BiRefNet) for high-resolution dichotomous image segmentation (DIS) | **\`image_url\`**, \`output_format\`, \`sync_mode\` (+5 more) |
| \`pixelcut-background-removal\` | Pixelcut’s Background Remover enables fast, ultra high-quality removal of backgrounds from images. Perfect for e-commerce and image editing workflows. Powere… | **\`image_url\`**, \`output_format\`, \`sync_mode\` |
| \`feynobg\` | FeyNobg is a state of the art AI model for background removal from feyninc | **\`image_url\`**, \`sync_mode\` (+1 more) |
| \`bria-extract-object\` | Bria Extract Object uses text prompts to isolate a selected object from an image and return it as an RGBA PNG with a transparent background. Ideal for produc… | \`sync_mode\`, \`prompt\`, \`image_url\` (+2 more) |
| \`sam-3.1\` | SAM 3.1 builds comes with Object Multiplex, a shared-memory approach for joint multi-object tracking that delivers faster speeds with larger number of object… | **\`image_url\`**, \`prompt\`, \`output_format\`, \`sync_mode\` (+7 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week.

## Inputs
- \`image\` → \`image_url\`: required by every model here.
- \`prompt\`: on the prompted models (Bria extract-object, SAM 3.1), to name what to keep or segment.
- \`output_format\` in \`extra_params\`, where supported. Values differ: BiRefNet takes \`webp\`/\`png\`/\`gif\`, and Pixelcut takes \`rgba\`/\`alpha\`/\`zip\`.

## Output
Saved **exactly as the model returns it**; use \`.png\` or \`.webp\` output paths for cutouts that keep transparency. Several models return extra files (BiRefNet a \`mask_image\`, Bria extract-object a \`mask\`, SAM 3.1 \`masks\`). The result lists their URLs; only the main image is saved to \`output\`.

## Example calls
\`\`\`
fal_generate_image({
  model: "fal-ai/birefnet/v2",
  image: "./portrait.jpg",
  output: "./portrait-cutout.png",
  extra_params: { output_format: "png" }
})

fal_generate_image({
  model: "bria/extract-object",
  image: "./product-scene.jpg",
  prompt: "the sneaker",
  output: "./sneaker.png"
})
\`\`\`

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`birefnet-2\` | \`fal-ai/birefnet/v2\` |
| \`pixelcut-background-removal\` | \`pixelcut/background-removal\` |
| \`feynobg\` | \`fal-ai/feynobg\` |
| \`bria-extract-object\` | \`bria/extract-object\` |
| \`sam-3.1\` | \`fal-ai/sam-3-1/image\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Cutout quality has not been compared side by side.
`;

export function registerFalBackgroundRemovalPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_background_removal_prompt_guide',
    'Grouped guide for fal background removal, matting and segmentation models (BiRefNet 2, Pixelcut, FeynoBG, Bria extract-object, SAM 3.1): the ML alternative to the local background-remove tool for soft or photographic edges. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_BACKGROUND_REMOVAL_GUIDE }] }),
  );
}

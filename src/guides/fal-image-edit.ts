import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_IMAGE_EDIT_GUIDE = `# fal Image Edit (grouped) — Prompt Guide

## What's in this guide
Changing or combining existing images on fal, through \`fal_generate_image\`: instruction edits, multi-reference composition, layer splitting, outpaint and reframe, background replacement, object removal, inpainting, and virtual try-on.

Covered elsewhere: Nano Banana edits (\`gemini_nanobanana_prompt_guide\`), upscaling and restoration (\`fal_image_upscale_prompt_guide\`), cutouts and segmentation (\`fal_background_removal_prompt_guide\`).

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`seedream-5-pro-edit\` | Seedream 5.0 Pro is grounded, region-precise image editing model that changes one element while keeping the rest of the frame intact with layer separation, s… | **\`image_urls\`**, **\`prompt\`**, \`image_size\`, \`output_format\`, \`sync_mode\`, \`num_images\` (+1 more) |
| \`seedream-5-lite-edit\` | Image editing endpoint for the fast Lite version of Seedream 5.0, supporting high quality intelligent image editing with multiple inputs. | **\`image_urls\`**, **\`prompt\`**, \`image_size\`, \`sync_mode\`, \`num_images\` (+2 more) |
| \`seedream-5-flash-edit\` | Seedream 5.0 Flash is a fast image generation and editing model, built for workflows where speed and budget matter. | **\`image_urls\`**, **\`prompt\`**, \`image_size\`, \`output_format\`, \`sync_mode\`, \`num_images\` (+1 more) |
| \`seedream-5-pro-layerize\` | Splits a finished image into independent, editable transparent-PNG layers — background plus separate elements, from a text description, returning 2 to 17 lay… | **\`image_url\`**, \`image_size\`, \`sync_mode\`, \`prompt\` (+2 more) |
| \`gpt-image-2-edit\` | GPT Image 2, OpenAI's latest image model, is capable of making fine-grained, detailed edits to images. | **\`image_urls\`**, **\`prompt\`**, \`num_images\`, \`sync_mode\`, \`mask_url\`, \`image_size\`, \`output_format\` (+2 more) |
| \`gpt-image-2.5-flare-edit\` | Precise image editing that changes only what's asked, keeping subject, composition, and background intact, with reference subjects staying recognizable acros… | **\`prompt\`**, **\`image_urls\`**, \`num_images\`, \`image_size\`, \`output_format\`, \`mask_url\`, \`sync_mode\` (+3 more) |
| \`gpt-image-2.5-sunburst-edit\` | Editing built for the tightest control, edits scoped precisely to the instruction, with subject and composition preserved across many rounds of revision. | **\`prompt\`**, **\`image_urls\`**, \`num_images\`, \`image_size\`, \`output_format\`, \`mask_url\`, \`sync_mode\` (+3 more) |
| \`flux-2-max-edit\` | FLUX.2 [max] delivers state-of-the-art image generation and advanced image editing with exceptional realism, precision, and consistency. | **\`prompt\`**, **\`image_urls\`**, \`image_size\`, \`output_format\`, \`sync_mode\` (+3 more) |
| \`flux-2-pro-edit\` | Text-to-image generation with FLUX.2 [pro] from Black Forest Labs. Optimized for maximum quality, exceptional photorealism and artistic images. | **\`image_urls\`**, **\`prompt\`**, \`image_size\`, \`sync_mode\`, \`output_format\` (+3 more) |
| \`flux-2-flex-edit\` | Image editing with FLUX.2 [flex] from Black Forest Labs. Supports multi-reference editing with customizable inference steps and enhanced text rendering. | **\`prompt\`**, **\`image_urls\`**, \`output_format\`, \`image_size\`, \`sync_mode\` (+5 more) |
| \`flux-2-dev-edit\` | Image-to-image editing with FLUX.2 [dev] from Black Forest Labs. Precise modifications using natural language descriptions and hex color control. | **\`image_urls\`**, **\`prompt\`**, \`num_images\`, \`sync_mode\`, \`image_size\`, \`output_format\` (+6 more) |
| \`flux-2-flash-edit\` | Image-to-image editing with FLUX.2 [dev] from Black Forest Labs. Precise modifications using natural language descriptions and hex color control—in a flash. | **\`prompt\`**, **\`image_urls\`**, \`output_format\`, \`num_images\`, \`image_size\`, \`sync_mode\` (+4 more) |
| \`flux-2-klein-9b-edit\` | Image-to-image editing with FLUX.2 [klein] 9B from Black Forest Labs. Precise modifications using natural language descriptions and hex color control. | **\`prompt\`**, **\`image_urls\`**, \`output_format\`, \`image_size\`, \`num_images\`, \`sync_mode\` (+3 more) |
| \`flux-2-pro-outpaint\` | Outpainting generation with FLUX.2 [pro] from Black Forest Labs. Optimized for maximum quality, exceptional photorealism and artistic images. | **\`image_url\`**, \`sync_mode\`, \`output_format\` (+7 more) |
| \`ideogram-4-i2i\` | Ideogram V4.0q Image-to-Image transforms an input image with a text prompt, restyling and reworking the composition while preserving its core structure for p… | **\`image_url\`**, **\`prompt\`**, \`image_size\`, \`num_images\`, \`sync_mode\`, \`output_format\` (+6 more) |
| \`ideogram-3-replace-background\` | Replace backgrounds existing images with Ideogram V3's replace background feature. Create variations and adaptations while preserving core elements and addin… | **\`prompt\`**, **\`image_url\`**, \`image_urls\`, \`num_images\`, \`sync_mode\` (+7 more) |
| \`ideogram-3-reframe\` | Extend existing images with Ideogram V3's reframe feature. Create expanded versions and adaptations while preserving main image and adding new creative direc… | **\`image_size\`**, **\`image_url\`**, \`image_urls\`, \`num_images\`, \`sync_mode\` (+6 more) |
| \`ideogram-object-removal\` | Prompt-free object removal from an image and mask, erasing objects with their shadows and reflections and reconstructing the scene cleanly. | **\`image_url\`**, **\`mask_url\`**, \`sync_mode\` |
| \`qwen-image-3-edit\` | Edits images from one to three reference images and a natural-language instruction, preserving key details such as facial features and identity while applyin… | **\`prompt\`**, **\`image_urls\`**, \`image_size\`, \`output_format\`, \`sync_mode\`, \`num_images\` (+4 more) |
| \`qwen-image-max-edit\` | Image editing endpoint for Qwen-Image-Max. Qwen Image Max improves upon the Qwen Image Plus series by enhancing the realism and naturalness of images. | **\`image_urls\`**, **\`prompt\`**, \`image_size\`, \`sync_mode\`, \`output_format\`, \`num_images\` (+4 more) |
| \`qwen-image-edit-multiple-angles\` | Generates same scene from different angles (azimuth/elevation) with Qwen image Edit 2511 and the Lora Multiple Angles | **\`image_urls\`**, \`num_images\`, \`image_size\`, \`output_format\`, \`sync_mode\` (+11 more) |
| \`mai-image-2.5-edit\` | MAI-Image-2.5 is Microsoft's photorealistic image generation and editing model that turns text prompts or uploaded images into high-quality, design-ready vis… | **\`image_urls\`**, **\`prompt\`**, \`output_format\`, \`sync_mode\`, \`aspect_ratio\`, \`num_images\` |
| \`mai-image-2.5-pro-edit\` | Apply precise, controllable edits to a reference image while preserving composition, typography, identity, and fine visual detail. | **\`prompt\`**, \`num_images\`, \`aspect_ratio\`, \`output_format\`, \`image_url\`, \`sync_mode\` |
| \`grok-imagine-image-2-edit\` | Edit images with xAi's Grok Imagine 2.0 model. | **\`prompt\`**, \`aspect_ratio\`, \`resolution\`, \`image_urls\`, \`output_format\`, \`sync_mode\`, \`num_images\` (+1 more) |
| \`muse-image-edit\` | Meta's Muse Image model does precise edits that change only what you ask, stay coherent across turns, and compose from multiple reference images. | **\`image_urls\`**, **\`prompt\`**, \`sync_mode\`, \`aspect_ratio\`, \`num_images\`, \`output_format\` |
| \`luma-uni-1-edit\` | Luma Uni-1 Edit reworks a source image from a text instruction, preserving the original composition while applying style changes and following optional refer… | **\`image_url\`**, **\`prompt\`**, \`reference_image_urls\`, \`output_format\` (+1 more) |
| \`luma-uni-1-max-edit\` | Luma Uni-1 Max Edit applies text-guided edits to a source image at maximum fidelity, holding the original structure while honoring reference images for preci… | **\`image_url\`**, **\`prompt\`**, \`reference_image_urls\`, \`output_format\` (+1 more) |
| \`hunyuan-image-3-instruct-edit\` | Image editing endpoint for Hunyuan Image 3.0 Instruct. | **\`prompt\`**, **\`image_urls\`**, \`output_format\`, \`image_size\`, \`num_images\`, \`sync_mode\` (+4 more) |
| \`kling-image-o3-edit\` | Kling Omni 3: Top-tier image-to-image with flawless consistency. | **\`image_urls\`**, **\`prompt\`**, \`output_format\`, \`resolution\`, \`sync_mode\`, \`num_images\`, \`aspect_ratio\` (+3 more) |
| \`hidream-o1-edit\` | Unified image generation with HiDream-O1-Image. Create, edit, and personalize high-resolution images up to 2K—single native model handles text-to-image, edit… | **\`prompt\`**, **\`reference_image_urls\`**, \`image_size\`, \`num_images\`, \`sync_mode\`, \`output_format\` (+5 more) |
| \`wan-2.6-edit\` | Wan 2.6 image-to-image model. | **\`prompt\`**, **\`image_urls\`**, \`num_images\`, \`image_size\` (+4 more) |
| \`bria-fibo-edit-1.5\` | Commercially safe, multi-reference image editing model. Follows natural language instructions alone or with up to 4 reference images, purpose-built for compl… | \`sync_mode\`, \`image_urls\`, \`mask_url\`, \`aspect_ratio\` (+3 more) |
| \`bria-fibo-try-on\` | Bria Virtual Try-On edits a person photo to show the subject wearing garments or accessories from one to three reference images, guided by optional text inst… | **\`person_image_url\`**, **\`garment_image_urls\`**, \`sync_mode\`, \`aspect_ratio\` (+2 more) |
| \`bria-fibo-product-holding\` | Bria Product Holding edits a person photo to show the subject holding or carrying a product, using one to three product reference images and optional text in… | **\`person_image_url\`**, **\`product_image_urls\`**, \`sync_mode\`, \`aspect_ratio\` (+2 more) |
| \`bria-genfill-2\` | The GenFill Route enables the generation of objects by prompt in a specific region of an image. | **\`mask_url\`**, **\`instruction\`**, **\`image_url\`**, \`sync_mode\` (+2 more) |
| \`bria-replace-background\` | Generate professional, eCommerce-ready product shots by replacing backgrounds with realistic lighting and accurate perspective from a simple text prompt. Tra… | \`sync_mode\`, \`image_url\`, \`prompt\` (+3 more) |
| \`google-virtual-try-on\` | Generate realistic virtual try-on images from a person image and a clothing product image. | **\`product_image_url\`**, **\`person_image_url\`**, \`num_images\` |
| \`fashn-try-on-1.6\` | FASHN v1.6 delivers precise virtual try-on capabilities, accurately rendering garment details like text and patterns at 864x1296 resolution from both on-mode… | **\`garment_image\`**, **\`model_image\`**, \`sync_mode\`, \`output_format\` (+7 more) |
| \`finegrain-eraser\` | Finegrain Eraser removes objects—along with their shadows, reflections, and lighting artifacts—using only natural language, seamlessly filling the scene with… | **\`image_url\`**, **\`prompt\`** (+2 more) |
| \`object-removal\` | Removes objects and their visual effects using natural language, replacing them with contextually appropriate content | **\`prompt\`**, **\`image_url\`** (+2 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week.

## Inputs
Edit models name their image inputs differently. Use the structural arg that matches the model's key, as shown in the table:

- **\`images\` → \`image_urls\`**: most instruction and multi-reference editors (Seedream, GPT Image, FLUX.2, Qwen, MAI, Grok, Muse, Hunyuan, Kling, Wan, Bria FIBO edit).
- **\`image\` → \`image_url\`**: single-image models (Ideogram 4 i2i, reframe and replace-background, Luma Uni-1 edit, MAI 2.5 Pro edit, FLUX.2 Pro outpaint, Seedream layerize, Bria replace-background, the erasers).
- **\`mask\` → \`mask_url\`**: inpainting and masked erase (GPT Image edits, Ideogram object removal, Bria GenFill).
- **Everything else goes in \`extra_files\`** under the model's own key:
  - HiDream O1 edit: \`reference_image_urls\`
  - Luma Uni-1: \`reference_image_urls\` (optional)
  - Bria FIBO try-on: \`person_image_url\` + \`garment_image_urls\`
  - Bria product holding: \`person_image_url\` + \`product_image_urls\`
  - Google virtual try-on: \`person_image_url\` + \`product_image_url\`
  - FASHN: \`model_image\` + \`garment_image\`

**Bria GenFill takes \`instruction\`, not \`prompt\`**: pass \`extra_params: { instruction: "…" }\`.

## Output format
Saved **exactly as the model returns it**. Choose a format with \`extra_params: { output_format: … }\` where the model accepts one (enum values differ per model: see its spec), and use a matching extension.

## Example calls
\`\`\`
fal_generate_image({
  model: "fal-ai/flux-2-pro/edit",
  prompt: "same room, but at night with warm lamp light",
  images: ["./room.png"],
  output: "./room-night.png",
  extra_params: { output_format: "png" }
})

fal_generate_image({
  model: "openai/gpt-image-2/edit",
  prompt: "replace the mug with a glass of iced coffee",
  images: ["./desk.png"],
  mask: "./mug-mask.png",
  output: "./desk-iced.png"
})

fal_generate_image({
  model: "google/virtual-try-on",
  output: "./tryon.png",
  extra_files: { person_image_url: "./model.jpg", product_image_url: "./jacket.jpg" }
})

fal_generate_image({
  model: "bria/genfill/v2",
  image: "./shelf.png",
  mask: "./gap-mask.png",
  output: "./shelf-filled.png",
  extra_params: { instruction: "a small potted succulent" }
})
\`\`\`

## Gotchas
- **Layerize** (\`seedream-5-pro-layerize\`) also returns its layers as separate files. The result lists their URLs; only the main image is saved to \`output\`.
- **Try-on models are prompt-less** or prompt-optional; they read the person and garment images.
- **Multi-reference limits** vary by model; check \`image_urls\`'s \`maxItems\` in the spec.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`seedream-5-pro-edit\` | \`bytedance/seedream/v5/pro/edit\` |
| \`seedream-5-lite-edit\` | \`bytedance/seedream/v5/lite/edit\` |
| \`seedream-5-flash-edit\` | \`bytedance/seedream/v5/flash/edit\` |
| \`seedream-5-pro-layerize\` | \`bytedance/seedream/v5/pro/layerize\` |
| \`gpt-image-2-edit\` | \`openai/gpt-image-2/edit\` |
| \`gpt-image-2.5-flare-edit\` | \`openai/gpt-image-2.5/flare/edit\` |
| \`gpt-image-2.5-sunburst-edit\` | \`openai/gpt-image-2.5/sunburst/edit\` |
| \`flux-2-max-edit\` | \`fal-ai/flux-2-max/edit\` |
| \`flux-2-pro-edit\` | \`fal-ai/flux-2-pro/edit\` |
| \`flux-2-flex-edit\` | \`fal-ai/flux-2-flex/edit\` |
| \`flux-2-dev-edit\` | \`fal-ai/flux-2/edit\` |
| \`flux-2-flash-edit\` | \`fal-ai/flux-2/flash/edit\` |
| \`flux-2-klein-9b-edit\` | \`fal-ai/flux-2/klein/9b/edit\` |
| \`flux-2-pro-outpaint\` | \`fal-ai/flux-2-pro/outpaint\` |
| \`ideogram-4-i2i\` | \`ideogram/v4/image-to-image\` |
| \`ideogram-3-replace-background\` | \`fal-ai/ideogram/v3/replace-background\` |
| \`ideogram-3-reframe\` | \`fal-ai/ideogram/v3/reframe\` |
| \`ideogram-object-removal\` | \`fal-ai/ideogram/object-removal\` |
| \`qwen-image-3-edit\` | \`alibaba/qwen-image-3/edit\` |
| \`qwen-image-max-edit\` | \`fal-ai/qwen-image-max/edit\` |
| \`qwen-image-edit-multiple-angles\` | \`fal-ai/qwen-image-edit-2511-multiple-angles\` |
| \`mai-image-2.5-edit\` | \`microsoft/mai-image-2.5/edit\` |
| \`mai-image-2.5-pro-edit\` | \`microsoft/mai-image-2.5-pro/edit\` |
| \`grok-imagine-image-2-edit\` | \`xai/grok-imagine-image/v2.0/edit\` |
| \`muse-image-edit\` | \`meta/muse-image/edit\` |
| \`luma-uni-1-edit\` | \`luma/agent/uni-1/v1/edit\` |
| \`luma-uni-1-max-edit\` | \`luma/agent/uni-1/v1/max/edit\` |
| \`hunyuan-image-3-instruct-edit\` | \`fal-ai/hunyuan-image/v3/instruct/edit\` |
| \`kling-image-o3-edit\` | \`fal-ai/kling-image/o3/image-to-image\` |
| \`hidream-o1-edit\` | \`fal-ai/hidream-o1-image/edit\` |
| \`wan-2.6-edit\` | \`wan/v2.6/image-to-image\` |
| \`bria-fibo-edit-1.5\` | \`bria/fibo-edit-1.5/edit\` |
| \`bria-fibo-try-on\` | \`bria/fibo-edit-1.5/virtual-try-on\` |
| \`bria-fibo-product-holding\` | \`bria/fibo-edit-1.5/product-holding\` |
| \`bria-genfill-2\` | \`bria/genfill/v2\` |
| \`bria-replace-background\` | \`bria/replace-background\` |
| \`google-virtual-try-on\` | \`google/virtual-try-on\` |
| \`fashn-try-on-1.6\` | \`fal-ai/fashn/tryon/v1.6\` |
| \`finegrain-eraser\` | \`fal-ai/finegrain-eraser\` |
| \`object-removal\` | \`fal-ai/object-removal\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Edit quality has not been compared side by side.
`;

export function registerFalImageEditPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_image_edit_prompt_guide',
    "Grouped guide for fal image edit models: instruction and multi-reference edits, layerize, outpaint/reframe, background replacement, object removal, inpainting and virtual try-on, with each model's image input key (image_urls vs image_url vs model-specific keys). No API call — pure reference.",
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_IMAGE_EDIT_GUIDE }] }),
  );
}

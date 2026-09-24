import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool } from '../utils/register.js';
import { z } from 'zod';

const FAL_IMAGE_GENERATION_GUIDE = `# fal Image Generation (grouped) — Prompt Guide

## What's in this guide
Text-to-image models on fal, through \`fal_generate_image\`: Seedream 5, GPT Image 2 / 2.5, FLUX.2, Recraft 4.1 (raster and vector), Ideogram 4 (plus v3 transparent), Qwen Image 3 / Max, MAI Image 2.5, Grok Imagine Image 2, Krea 2, Meta Muse, Luma Uni-1, Hunyuan Image 3, Kling Image, HiDream O1, Z-Image Turbo, Wan 2.6 and Bria FIBO.

Covered elsewhere: Nano Banana, on Google and on fal (\`gemini_nanobanana_prompt_guide\`); editing an existing image (\`fal_image_edit_prompt_guide\`).

## Picking a model
| Slug | Model (fal's description) | Inputs (**required**, then notable) |
|------|----------------------------|--------------------------------------|
| \`seedream-5-pro-t2i\` | ByteDance's Seedream 5.0 Pro is flagship text-to-image model, with deep-thinking prompt understanding, native text in 14 languages, and precise control over… | **\`prompt\`**, \`image_size\`, \`output_format\`, \`sync_mode\`, \`num_images\` (+1 more) |
| \`seedream-5-lite-t2i\` | Text to Image endpoint for the fast Lite version of Seedream 5.0, supporting high quality intelligent text-to-image generation. | **\`prompt\`**, \`image_size\`, \`num_images\`, \`sync_mode\` (+3 more) |
| \`seedream-5-flash-t2i\` | Seedream 5.0 Flash is a fast image generation and editing model, built for workflows where speed and budget matter. | **\`prompt\`**, \`image_size\`, \`output_format\`, \`sync_mode\`, \`num_images\` (+1 more) |
| \`gpt-image-2-t2i\` | GPT Image 2, OpenAI's latest image model, is capable of creating extremely detailed images with fine typography. | **\`prompt\`**, \`sync_mode\`, \`num_images\`, \`image_size\`, \`output_format\` (+2 more) |
| \`gpt-image-2.5-flare-t2i\` | OpenAI's default image model for most applications. Fast, high-quality generation with natural lighting, rich textures, and support for complex layouts inclu… | **\`prompt\`**, \`output_format\`, \`num_images\`, \`image_size\`, \`sync_mode\` (+3 more) |
| \`gpt-image-2.5-sunburst-t2i\` | OpenAI's precision-focused image model, built for premium visual work, extra fidelity on intricate detail, in exchange for longer generation times. | **\`prompt\`**, \`output_format\`, \`num_images\`, \`image_size\`, \`sync_mode\` (+3 more) |
| \`flux-2-max-t2i\` | FLUX.2 [max] delivers state-of-the-art image generation and advanced image editing with exceptional realism, precision, and consistency. | **\`prompt\`**, \`output_format\`, \`sync_mode\`, \`image_size\` (+3 more) |
| \`flux-2-pro-t2i\` | Image editing with FLUX.2 [pro] from Black Forest Labs. Ideal for high-quality image manipulation, style transfer, and sequential editing workflows | **\`prompt\`**, \`sync_mode\`, \`output_format\`, \`image_size\` (+3 more) |
| \`flux-2-flex-t2i\` | Text-to-image generation with FLUX.2 [flex] from Black Forest Labs. Features adjustable inference steps and guidance scale for fine-tuned control. Enhanced t… | **\`prompt\`**, \`output_format\`, \`image_size\`, \`sync_mode\` (+5 more) |
| \`flux-2-dev-t2i\` | Text-to-image generation with FLUX.2 [dev] from Black Forest Labs. Enhanced realism, crisper text generation, and native editing capabilities. | **\`prompt\`**, \`output_format\`, \`image_size\`, \`num_images\`, \`sync_mode\` (+6 more) |
| \`flux-2-flash-t2i\` | Text-to-image generation with FLUX.2 [dev] from Black Forest Labs. Enhanced realism, crisper text generation, and native editing capabilities— in a flash. | **\`prompt\`**, \`output_format\`, \`num_images\`, \`sync_mode\`, \`image_size\` (+4 more) |
| \`flux-2-klein-9b-t2i\` | Text-to-image generation with FLUX.2 [klein] 9B from Black Forest Labs. Enhanced realism, crisper text generation, and native editing capabilities. | **\`prompt\`**, \`output_format\`, \`image_size\`, \`num_images\`, \`sync_mode\` (+3 more) |
| \`recraft-4.1-t2i\` | Recraft V4.1 builds on the design-first foundation of V4 with sharper prompt control and cleaner composition. Tuned for brand systems and editorial work, it… | **\`prompt\`**, \`image_size\` (+3 more) |
| \`recraft-4.1-pro-t2i\` | Recraft V4.1 Pro pushes the V4.1 model into high-resolution territory — up to 2048×2048 and ultra-wide formats. Made for hero imagery, campaign work, and pri… | **\`prompt\`**, \`image_size\` (+3 more) |
| \`recraft-4.1-flash-t2i\` | Recraft V4.1 Flash generates raster images from text prompts, including photography, illustrations, and mixed-media compositions, with controls for image siz… | **\`prompt\`**, \`image_size\` (+3 more) |
| \`recraft-4.1-vector-t2i\` | Recraft V4.1 Vector turns prompts into fully editable SVGs with structured layers and clean geometry. Built for logos, icons, and illustration systems, it pr… | **\`prompt\`**, \`image_size\` (+3 more) |
| \`recraft-4.1-pro-vector-t2i\` | Recraft V4.1 Pro Vector generates large-format, fully editable SVGs with the structural clarity professional illustrators expect. Built for poster art, compl… | **\`prompt\`**, \`image_size\` (+3 more) |
| \`recraft-4-style-t2i\` | Generates raster images that hold a consistent style, from either a saved style ID or reference images attached directly. | **\`prompt\`**, \`image_size\`, \`image_urls\` (+5 more) |
| \`ideogram-4-t2i\` | Generate high-quality images, posters, and logos with Ideogram's latest V4.0q — producing crisp visuals with accurate text rendering, fine detail, and full c… | **\`prompt\`**, \`image_size\`, \`num_images\`, \`sync_mode\`, \`output_format\` (+5 more) |
| \`ideogram-4-fast-t2i\` | Generate high-quality images, posters, and logos with Ideogram's latest V4.0q — producing crisp visuals with accurate text rendering, fine detail, and full c… | **\`prompt\`**, \`image_size\`, \`num_images\`, \`sync_mode\`, \`output_format\` (+4 more) |
| \`ideogram-4-instant-t2i\` | Generate high-quality images, posters, and logos with Ideogram's latest V4.0q — producing crisp visuals with accurate text rendering, fine detail, and full c… | **\`prompt\`**, \`image_size\`, \`num_images\`, \`sync_mode\`, \`output_format\` (+3 more) |
| \`ideogram-4-tiling-t2i\` | Ideogram V4.0q Tiling generates seamless, edge-matching textures and patterns that repeat infinitely in any direction, ideal for backgrounds, surfaces, and w… | **\`prompt\`**, \`mask_url\`, \`image_url\`, \`output_format\`, \`image_size\`, \`num_images\`, \`sync_mode\` (+7 more) |
| \`ideogram-3-transparent-t2i\` | Generate images with transparent backgrounds using Ideogram Transparent model | **\`prompt\`**, \`aspect_ratio\`, \`num_images\`, \`sync_mode\` (+4 more) |
| \`qwen-image-3-t2i\` | Generates images from a text prompt at resolutions up to 2048×2048, with automatic prompt rewriting and prompt-guided resolution selection, building on Qwen'… | **\`prompt\`**, \`image_size\`, \`output_format\`, \`sync_mode\`, \`num_images\` (+4 more) |
| \`qwen-image-max-t2i\` | Text-to-Image endpoint for Qwen-Image-Max. Qwen Image Max improves upon the Qwen Image Plus series by enhancing the realism and naturalness of images. | **\`prompt\`**, \`image_size\`, \`sync_mode\`, \`output_format\`, \`num_images\` (+4 more) |
| \`mai-image-2.5-t2i\` | MAI-Image-2.5 is Microsoft's photorealistic image generation and editing model that turns text prompts or uploaded images into high-quality, design-ready vis… | **\`prompt\`**, \`output_format\`, \`sync_mode\`, \`aspect_ratio\`, \`num_images\` |
| \`mai-image-2.5-pro-t2i\` | Generate high-fidelity, design-ready images with precise typography, strong prompt alignment, and rich visual detail using Microsoft's flagship MAI Image 2.5… | **\`prompt\`**, \`num_images\`, \`aspect_ratio\`, \`output_format\`, \`sync_mode\` |
| \`grok-imagine-image-2-t2i\` | Generate images from text using xAi's Grok Imagine 2.0 model. | **\`prompt\`**, \`sync_mode\`, \`output_format\`, \`num_images\`, \`aspect_ratio\`, \`resolution\` (+1 more) |
| \`krea-2-large-t2i\` | Generate high-fidelity images from text with Krea 2 Large, supporting aspect ratio, creativity, seed controls, and optional style references. | **\`prompt\`**, \`aspect_ratio\` (+5 more) |
| \`krea-2-medium-t2i\` | Generate high-quality images from text with Krea 2 Medium, supporting aspect ratio, creativity controls, seeds, and optional style references. | **\`prompt\`**, \`aspect_ratio\` (+5 more) |
| \`krea-2-turbo-t2i\` | Generate high-fidelity images from text in seconds with Krea 2 Turbo, the speed-optimized open-source version of Krea 2, preserving its aesthetic range for r… | **\`prompt\`**, \`image_size\`, \`num_images\`, \`sync_mode\`, \`output_format\` (+4 more) |
| \`muse-image-t2i\` | Meta's Muse Image model has faithful instruction-following and exceptional visual fidelity, with fine details like text, plots, and QR codes rendered accurat… | **\`prompt\`**, \`sync_mode\`, \`aspect_ratio\`, \`num_images\`, \`output_format\` |
| \`luma-uni-1-t2i\` | Luma Uni-1 turns a text prompt into a single high-fidelity image, with control over aspect ratio and visual style, plus optional web-sourced and reference-im… | **\`prompt\`**, \`reference_image_urls\`, \`aspect_ratio\`, \`output_format\` (+2 more) |
| \`luma-uni-1-max-t2i\` | Luma Uni-1 Max generates a single image at the model's highest fidelity, delivering richer detail and stronger prompt adherence than the base tier for hero-q… | **\`prompt\`**, \`reference_image_urls\`, \`aspect_ratio\`, \`output_format\` (+2 more) |
| \`hunyuan-image-3-instruct-t2i\` | Instruct version of Hunyuan-Image 3.0, with internal reasoning capabilities. | **\`prompt\`**, \`output_format\`, \`image_size\`, \`num_images\`, \`sync_mode\` (+4 more) |
| \`kling-image-o3-t2i\` | Kling Omni 3: Top-tier text-to-image with flawless consistency. | **\`prompt\`**, \`output_format\`, \`resolution\`, \`sync_mode\`, \`num_images\`, \`aspect_ratio\` (+3 more) |
| \`kling-image-3-t2i\` | Kling V3: Latest Kling Image model | **\`prompt\`**, \`aspect_ratio\`, \`output_format\`, \`resolution\`, \`sync_mode\`, \`num_images\` (+2 more) |
| \`hidream-o1-t2i\` | Unified image generation with HiDream-O1-Image. Create, edit, and personalize high-resolution images up to 2K—single native model handles text-to-image, edit… | **\`prompt\`**, \`image_size\`, \`num_images\`, \`sync_mode\`, \`reference_image_urls\`, \`output_format\` (+5 more) |
| \`z-image-turbo-t2i\` | Z-Image Turbo is a super fast text-to-image model of 6B parameters developed by Tongyi-MAI. | **\`prompt\`**, \`sync_mode\`, \`num_images\`, \`image_size\`, \`output_format\` (+5 more) |
| \`z-image-turbo-tiling-t2i\` | Generate seamlessly tiling photorealistic images from text using Z-Image Turbo | **\`prompt\`**, \`sync_mode\`, \`num_images\`, \`image_size\`, \`image_url\`, \`output_format\` (+10 more) |
| \`wan-2.6-t2i\` | Wan 2.6 text-to-image model. | **\`prompt\`**, \`image_size\`, \`image_url\` (+4 more) |
| \`bria-fibo-gen-1.5-t2i\` | Text-to-image model with high-fidelity outputs, accurate typography, and style preset, strong in photorealism, textures, and beyond. JSON-structured prompts… | \`sync_mode\`, \`aspect_ratio\`, \`prompt\`, \`resolution\` (+2 more) |

Prices change often, so they are not repeated here: see each route's \`cost\` in \`model_catalog\`, which is synced from fal's published pricing every week. Some models price per image, others per megapixel or by resolution tier.

## Inputs
- \`prompt\`: required by every model here.
- **Size is set differently per model**: \`image_size\` (a preset such as \`"square_hd"\` / \`"landscape_16_9"\` / \`"auto_2K"\`, or \`{ width, height }\`), \`aspect_ratio\`, or \`resolution\`. The table shows which one each model takes; all three are structural args.
- \`num_images\`: on models that support it. Extra images are saved as \`<name>_2\`, \`<name>_3\`, ….
- Everything else goes in \`extra_params\` (e.g. \`seed\`, \`output_format\`), and extra file inputs (e.g. \`reference_image_urls\` on Luma Uni-1 and HiDream) go in \`extra_files\`.

## Output format
The file is saved **exactly as the model returns it**; the tool does not convert. To choose a format, pass \`extra_params: { output_format: … }\` on models that accept it, using that model's own value (\`"png"\`, \`"jpeg"\`, \`"webp"\`; check the enum in \`src/catalog/fal-specs/<slug>/openapi.json\`), and use a matching output extension. If the extension and the returned bytes disagree, the result says so.

## Example calls
\`\`\`
fal_generate_image({
  model: "bytedance/seedream/v5/pro/text-to-image",
  prompt: "product shot of a matte black espresso cup on travertine, soft window light",
  image_size: "auto_2K",
  output: "./cup.png",
  extra_params: { output_format: "png" }
})

fal_generate_image({
  model: "ideogram/v4",
  prompt: "poster: 'NIGHT MARKET' in bold condensed type over a neon street scene",
  image_size: "portrait_4_3",
  output: "./poster.png",
  extra_params: { output_format: "png" }
})

fal_generate_image({
  model: "fal-ai/recraft/v4.1/text-to-vector",
  prompt: "minimal line-art fox logo, single weight stroke",
  output: "./fox.svg"
})
\`\`\`

## Gotchas
- **Recraft vector routes return SVG**; use an \`.svg\` output path.
- **Transparent output**: \`ideogram-3-transparent-t2i\` is the transparent-background generator, so save it as PNG.
- **Seamless tiles**: \`ideogram-4-tiling-t2i\` and \`z-image-turbo-tiling-t2i\` are for repeating patterns.
- **NSFW flags**: some models report \`has_nsfw_concepts\`; the result says so when fal flags an image, which may come back blurred or blank.

## Access routes
| Slug | fal endpoint |
|------|--------------|
| \`seedream-5-pro-t2i\` | \`bytedance/seedream/v5/pro/text-to-image\` |
| \`seedream-5-lite-t2i\` | \`bytedance/seedream/v5/lite/text-to-image\` |
| \`seedream-5-flash-t2i\` | \`bytedance/seedream/v5/flash/text-to-image\` |
| \`gpt-image-2-t2i\` | \`openai/gpt-image-2\` |
| \`gpt-image-2.5-flare-t2i\` | \`openai/gpt-image-2.5/flare/text-to-image\` |
| \`gpt-image-2.5-sunburst-t2i\` | \`openai/gpt-image-2.5/sunburst/text-to-image\` |
| \`flux-2-max-t2i\` | \`fal-ai/flux-2-max\` |
| \`flux-2-pro-t2i\` | \`fal-ai/flux-2-pro\` |
| \`flux-2-flex-t2i\` | \`fal-ai/flux-2-flex\` |
| \`flux-2-dev-t2i\` | \`fal-ai/flux-2\` |
| \`flux-2-flash-t2i\` | \`fal-ai/flux-2/flash\` |
| \`flux-2-klein-9b-t2i\` | \`fal-ai/flux-2/klein/9b\` |
| \`recraft-4.1-t2i\` | \`fal-ai/recraft/v4.1/text-to-image\` |
| \`recraft-4.1-pro-t2i\` | \`fal-ai/recraft/v4.1/pro/text-to-image\` |
| \`recraft-4.1-flash-t2i\` | \`recraft/v4.1/flash/text-to-image\` |
| \`recraft-4.1-vector-t2i\` | \`fal-ai/recraft/v4.1/text-to-vector\` |
| \`recraft-4.1-pro-vector-t2i\` | \`fal-ai/recraft/v4.1/pro/text-to-vector\` |
| \`recraft-4-style-t2i\` | \`recraft/v4/style/text-to-image\` |
| \`ideogram-4-t2i\` | \`ideogram/v4\` |
| \`ideogram-4-fast-t2i\` | \`ideogram/v4/fast\` |
| \`ideogram-4-instant-t2i\` | \`ideogram/v4/instant\` |
| \`ideogram-4-tiling-t2i\` | \`ideogram/v4/tiling\` |
| \`ideogram-3-transparent-t2i\` | \`fal-ai/ideogram/v3/generate-transparent\` |
| \`qwen-image-3-t2i\` | \`alibaba/qwen-image-3/text-to-image\` |
| \`qwen-image-max-t2i\` | \`fal-ai/qwen-image-max/text-to-image\` |
| \`mai-image-2.5-t2i\` | \`microsoft/mai-image-2.5\` |
| \`mai-image-2.5-pro-t2i\` | \`microsoft/mai-image-2.5-pro\` |
| \`grok-imagine-image-2-t2i\` | \`xai/grok-imagine-image/v2.0/text-to-image\` |
| \`krea-2-large-t2i\` | \`krea/v2/large/text-to-image\` |
| \`krea-2-medium-t2i\` | \`krea/v2/medium/text-to-image\` |
| \`krea-2-turbo-t2i\` | \`fal-ai/krea-2/turbo\` |
| \`muse-image-t2i\` | \`meta/muse-image/text-to-image\` |
| \`luma-uni-1-t2i\` | \`luma/agent/uni-1/v1/text-to-image\` |
| \`luma-uni-1-max-t2i\` | \`luma/agent/uni-1/v1/max\` |
| \`hunyuan-image-3-instruct-t2i\` | \`fal-ai/hunyuan-image/v3/instruct/text-to-image\` |
| \`kling-image-o3-t2i\` | \`fal-ai/kling-image/o3/text-to-image\` |
| \`kling-image-3-t2i\` | \`fal-ai/kling-image/v3/text-to-image\` |
| \`hidream-o1-t2i\` | \`fal-ai/hidream-o1-image\` |
| \`z-image-turbo-t2i\` | \`fal-ai/z-image/turbo\` |
| \`z-image-turbo-tiling-t2i\` | \`fal-ai/z-image/turbo/tiling\` |
| \`wan-2.6-t2i\` | \`wan/v2.6/text-to-image\` |
| \`bria-fibo-gen-1.5-t2i\` | \`bria/fibo-gen-1.5/text-to-image\` |

## Last verified
2026-09-24 against fal's live OpenAPI specs and llms.txt. Image quality has not been compared side by side.
`;

export function registerFalImageGenerationPromptGuide(server: McpServer): void {
  registerTool<Record<string, never>>(
    server,
    'fal_image_generation_prompt_guide',
    'Grouped guide for fal text-to-image models (Seedream 5, GPT Image 2/2.5, FLUX.2, Recraft 4.1 raster + vector, Ideogram 4, Qwen Image 3/Max, MAI Image 2.5, Grok Imagine 2, Krea 2, Meta Muse, Luma Uni-1, Hunyuan Image 3, Kling Image, HiDream O1, Z-Image, Wan 2.6, Bria FIBO): which size knob each takes and how to choose an output format. No API call — pure reference.',
    z.object({}).shape,
    async () => ({ content: [{ type: 'text', text: FAL_IMAGE_GENERATION_GUIDE }] }),
  );
}

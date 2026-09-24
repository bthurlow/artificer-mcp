# Z-Image Turbo Seamless Tiling

> Generate seamlessly tiling photorealistic images from text using Z-Image Turbo


## Overview

- **Endpoint**: `https://fal.run/fal-ai/z-image/turbo/tiling`
- **Model ID**: `fal-ai/z-image/turbo/tiling`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: z-image, turbo, seamless, tiling



## Pricing

Your request will cost **$0.02** per megapixel.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate an image from.
  - Examples: "A hyper-realistic, high-resolution 4k texture of an ancient weathered brick wall heavily overgrown with lush green moss and soft lichens. The bricks are aged, featuring deep earthy tones, natural cracks, and gritty textures. Vibrant emerald moss fills the mortar lines and spills over the rough surfaces of the stones. Uniform, flat cinematic lighting ensures no harsh shadows, highlighting the intricate organic details and damp stone surfaces. The composition is a perfectly balanced overhead view, showcasing a rich tapestry of botanical growth and masonry craftsmanship with professional clarity and hyper-detailed grit."

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. Use 'auto' to match the input image size (or 1024x1024 if no image). Default value: `square_hd`
  - Default: `"square_hd"`
  - One of: ImageSize | Enum

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `8`
  - Default: `8`
  - Range: `1` to `8`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of the model
  will output the same image every time.

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked, and images flagged as unsafe are returned as black images. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`, `"high"`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. Note: this will increase the price by 0.0025 credits per request.
  - Default: `false`

- **`image_url`** (`string`, _optional_):
  URL of an image for image-to-image or inpainting. When provided without mask_image_url, performs image-to-image; with mask_image_url, performs inpainting.

- **`mask_image_url`** (`string`, _optional_):
  URL of a mask image for inpainting. White regions are regenerated, black regions are preserved. Requires image_url.

- **`strength`** (`float`, _optional_):
  How much to transform the input image. Only used when image_url is provided. Default value: `0.6`
  - Default: `0.6`

- **`tile_size`** (`integer`, _optional_):
  Tile size in latent space. Must be even (divisible by 2) for patchification. Automatically capped to the generated image dimensions on tiled axes. (64 = 512px, 128 = 1024px, 256 = 2048px). Default value: `128`
  - Default: `128`
  - Range: `32` to `256`, step: `2`

- **`tile_stride`** (`integer`, _optional_):
  Tile stride in latent space. Must be even (divisible by 2). Automatically capped to half the effective tile size. (32 = 256px, 64 = 512px, 128 = 1024px). Default value: `64`
  - Default: `64`
  - Range: `16` to `128`, step: `2`

- **`tiling_mode`** (`TilingModeEnum`, _optional_):
  Tiling direction: 'both' (omnidirectional), 'horizontal' (left-right only), 'vertical' (top-bottom only). Default value: `"both"`
  - Default: `"both"`
  - Options: `"both"`, `"horizontal"`, `"vertical"`



**Required Parameters Example**:

```json
{
  "prompt": "A hyper-realistic, high-resolution 4k texture of an ancient weathered brick wall heavily overgrown with lush green moss and soft lichens. The bricks are aged, featuring deep earthy tones, natural cracks, and gritty textures. Vibrant emerald moss fills the mortar lines and spills over the rough surfaces of the stones. Uniform, flat cinematic lighting ensures no harsh shadows, highlighting the intricate organic details and damp stone surfaces. The composition is a perfectly balanced overhead view, showcasing a rich tapestry of botanical growth and masonry craftsmanship with professional clarity and hyper-detailed grit."
}
```

**Full Example**:

```json
{
  "prompt": "A hyper-realistic, high-resolution 4k texture of an ancient weathered brick wall heavily overgrown with lush green moss and soft lichens. The bricks are aged, featuring deep earthy tones, natural cracks, and gritty textures. Vibrant emerald moss fills the mortar lines and spills over the rough surfaces of the stones. Uniform, flat cinematic lighting ensures no harsh shadows, highlighting the intricate organic details and damp stone surfaces. The composition is a perfectly balanced overhead view, showcasing a rich tapestry of botanical growth and masonry craftsmanship with professional clarity and hyper-detailed grit.",
  "image_size": "square_hd",
  "num_inference_steps": 8,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "png",
  "acceleration": "regular",
  "strength": 0.6,
  "tile_size": 128,
  "tile_stride": 64,
  "tiling_mode": "both"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated image files info.
  - Array of ImageFile
  - Examples: [{"content_type":"image/png","height":2048,"url":"https://v3b.fal.media/files/b/0a9276c3/6KxxMb0bPmfNLH3DqcuSf_qRUe8cIL.png","width":2048}]

- **`timings`** (`Timings`, _required_):
  The timings of the generation process.

- **`seed`** (`integer`, _required_):
  Seed of the generated Image. It will be the same value of the one passed in the input or the randomly generated that was used in case none was passed.

- **`has_nsfw_concepts`** (`list<boolean>`, _required_):
  Whether the generated images contain NSFW concepts.
  - Array of boolean

- **`prompt`** (`string`, _required_):
  The prompt used for generating the image.



**Example Response**:

```json
{
  "images": [
    {
      "content_type": "image/png",
      "height": 2048,
      "url": "https://v3b.fal.media/files/b/0a9276c3/6KxxMb0bPmfNLH3DqcuSf_qRUe8cIL.png",
      "width": 2048
    }
  ],
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/z-image/turbo/tiling \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A hyper-realistic, high-resolution 4k texture of an ancient weathered brick wall heavily overgrown with lush green moss and soft lichens. The bricks are aged, featuring deep earthy tones, natural cracks, and gritty textures. Vibrant emerald moss fills the mortar lines and spills over the rough surfaces of the stones. Uniform, flat cinematic lighting ensures no harsh shadows, highlighting the intricate organic details and damp stone surfaces. The composition is a perfectly balanced overhead view, showcasing a rich tapestry of botanical growth and masonry craftsmanship with professional clarity and hyper-detailed grit."
   }'
```

### Python

Ensure you have the Python client installed:

```bash
pip install fal-client
```

Then use the API client to make requests:

```python
import fal_client

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

result = fal_client.subscribe(
    "fal-ai/z-image/turbo/tiling",
    arguments={
        "prompt": "A hyper-realistic, high-resolution 4k texture of an ancient weathered brick wall heavily overgrown with lush green moss and soft lichens. The bricks are aged, featuring deep earthy tones, natural cracks, and gritty textures. Vibrant emerald moss fills the mortar lines and spills over the rough surfaces of the stones. Uniform, flat cinematic lighting ensures no harsh shadows, highlighting the intricate organic details and damp stone surfaces. The composition is a perfectly balanced overhead view, showcasing a rich tapestry of botanical growth and masonry craftsmanship with professional clarity and hyper-detailed grit."
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
```

### JavaScript

Ensure you have the JavaScript client installed:

```bash
npm install --save @fal-ai/client
```

Then use the API client to make requests:

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/z-image/turbo/tiling", {
  input: {
    prompt: "A hyper-realistic, high-resolution 4k texture of an ancient weathered brick wall heavily overgrown with lush green moss and soft lichens. The bricks are aged, featuring deep earthy tones, natural cracks, and gritty textures. Vibrant emerald moss fills the mortar lines and spills over the rough surfaces of the stones. Uniform, flat cinematic lighting ensures no harsh shadows, highlighting the intricate organic details and damp stone surfaces. The composition is a perfectly balanced overhead view, showcasing a rich tapestry of botanical growth and masonry craftsmanship with professional clarity and hyper-detailed grit."
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
```


## Additional Resources

### Documentation

- [Model Playground](https://fal.ai/models/fal-ai/z-image/turbo/tiling)
- [API Documentation](https://fal.ai/models/fal-ai/z-image/turbo/tiling/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/z-image/turbo/tiling)

### fal.ai Platform

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

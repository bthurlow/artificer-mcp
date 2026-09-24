# Ideogram V4.0 Text to Image

> Generate high-quality images, posters, and logos with Ideogram's latest V4.0q — producing crisp visuals with accurate text rendering, fine detail, and full creative control for polished, ready-to-use designs.


## Overview

- **Endpoint**: `https://fal.run/ideogram/v4`
- **Model ID**: `ideogram/v4`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: realism, typography, stylized



## Pricing

Your request will cost **$0.0075** per megapixel in **TURBO** mode, **$0.015** per megapixel in **BALANCED** mode, or **$0.025** per megapixel in **QUALITY** mode. For example, a 2048 x 2048 image will cost **$0.03**, **$0.06** or **$0.10** based on the mode.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate an image from.
  - Examples: "A red panda perched on a mossy branch in a misty forest at sunrise"

- **`expansion_model`** (`ExpansionModelEnum`, _optional_):
  Which model expands the prompt. 'None' disables prompt expansion and skips its fee; 'Medium' is fast; 'Large' uses Ideogram's Magic Prompt for the highest quality. Default value: `"Medium"`
  - Default: `"Medium"`
  - Options: `"None"`, `"Medium"`, `"Large"`
  - Examples: "Large"

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The resolution of the generated image. Default value: `square_hd`
  - Default: `"square_hd"`
  - One of: ImageSize | Enum

- **`rendering_speed`** (`RenderingSpeedEnum`, _optional_):
  The rendering speed to use. Faster speeds use fewer denoising steps. Default value: `"BALANCED"`
  - Default: `"BALANCED"`
  - Options: `"TURBO"`, `"BALANCED"`, `"QUALITY"`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use for the image generation. Default value: `"none"`
  - Default: `"none"`
  - Options: `"none"`, `"low"`, `"regular"`, `"high"`
  - Examples: "none"

- **`num_images`** (`integer`, _optional_):
  Number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`seed`** (`integer`, _optional_):
  The seed to use for generation. If not provided, a random seed will be used.

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the image is returned as a data URI and is not stored.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`



**Required Parameters Example**:

```json
{
  "prompt": "A red panda perched on a mossy branch in a misty forest at sunrise"
}
```

**Full Example**:

```json
{
  "prompt": "A red panda perched on a mossy branch in a misty forest at sunrise",
  "expansion_model": "Large",
  "image_size": "square_hd",
  "rendering_speed": "BALANCED",
  "acceleration": "none",
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images.
  - Array of ImageFile
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a9c92b2/JLDtkHeeec2BL7ZX3PyvI_KzumHcSa.jpg"}]

- **`timings`** (`Timings`, _required_)

- **`seed`** (`integer`, _required_):
  Seed of the generated Image. It will be the same value of the one passed in the
  input or the randomly generated that was used in case none was passed.

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
      "url": "https://v3b.fal.media/files/b/0a9c92b2/JLDtkHeeec2BL7ZX3PyvI_KzumHcSa.jpg"
    }
  ],
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/ideogram/v4 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A red panda perched on a mossy branch in a misty forest at sunrise"
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
    "ideogram/v4",
    arguments={
        "prompt": "A red panda perched on a mossy branch in a misty forest at sunrise"
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

const result = await fal.subscribe("ideogram/v4", {
  input: {
    prompt: "A red panda perched on a mossy branch in a misty forest at sunrise"
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

- [Model Playground](https://fal.ai/models/ideogram/v4)
- [API Documentation](https://fal.ai/models/ideogram/v4/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=ideogram/v4)

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

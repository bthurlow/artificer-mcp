# Kling Image

> Kling Omni 3: Top-tier image-to-image with flawless consistency.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-image/o3/image-to-image`
- **Model ID**: `fal-ai/kling-image/o3/image-to-image`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: image-to-image



## Pricing

Your request will cost **$0.028** per image for **1K/2K**, price will be double for **4K**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for image generation. Reference images using @Image1, @Image2, etc. (or @Image if only one image). Max 2500 characters.
  - Examples: "Transform into photorealistic 3D render, add proper lighting and shadows, realistic materials and textures, maintain exact proportions and design from sketch, product visualization quality"

- **`image_urls`** (`list<string>`, _required_):
  List of reference images. Reference images in prompt using @Image1, @Image2, etc. (1-indexed). Max 10 images.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png"]

- **`elements`** (`list<ElementInput>`, _optional_):
  Optional: Elements (characters/objects) for face control. Reference in prompt as @Element1, @Element2, etc.
  - Array of ElementInput

- **`resolution`** (`ResolutionEnum`, _optional_):
  Image generation resolution. 1K: standard, 2K: high-res, 4K: ultra high-res. Default value: `"1K"`
  - Default: `"1K"`
  - Options: `"1K"`, `"2K"`, `"4K"`

- **`result_type`** (`ResultTypeEnum`, _optional_):
  Result type. 'single' for one image, 'series' for a series of related images. Default value: `"single"`
  - Default: `"single"`
  - Options: `"single"`, `"series"`

- **`num_images`** (`integer`, _optional_):
  Number of images to generate (1-9). Only used when result_type is 'single'. Default value: `1`
  - Default: `1`
  - Range: `1` to `9`

- **`series_amount`** (`integer`, _optional_):
  Number of images in series (2-9). Only used when result_type is 'series'.
  - Range: `2` to `9`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of generated images. 'auto' intelligently determines based on input content. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"`, `"3:2"`, `"2:3"`, `"21:9"`, `"auto"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "Transform into photorealistic 3D render, add proper lighting and shadows, realistic materials and textures, maintain exact proportions and design from sketch, product visualization quality",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Transform into photorealistic 3D render, add proper lighting and shadows, realistic materials and textures, maintain exact proportions and design from sketch, product visualization quality",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png"
  ],
  "elements": [
    {}
  ],
  "resolution": "1K",
  "result_type": "single",
  "num_images": 1,
  "aspect_ratio": "auto",
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  Generated images
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png","file_name":"19db9852c5ed4a109d81c52d27c9e433.png","content_type":"image/png","file_size":793847}]



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png",
      "file_name": "19db9852c5ed4a109d81c52d27c9e433.png",
      "content_type": "image/png",
      "file_size": 793847
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-image/o3/image-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Transform into photorealistic 3D render, add proper lighting and shadows, realistic materials and textures, maintain exact proportions and design from sketch, product visualization quality",
     "image_urls": [
       "https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png"
     ]
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
    "fal-ai/kling-image/o3/image-to-image",
    arguments={
        "prompt": "Transform into photorealistic 3D render, add proper lighting and shadows, realistic materials and textures, maintain exact proportions and design from sketch, product visualization quality",
        "image_urls": ["https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png"]
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

const result = await fal.subscribe("fal-ai/kling-image/o3/image-to-image", {
  input: {
    prompt: "Transform into photorealistic 3D render, add proper lighting and shadows, realistic materials and textures, maintain exact proportions and design from sketch, product visualization quality",
    image_urls: ["https://v3b.fal.media/files/b/0a8d06d1/FTrwBsV9WI5twqMPkqvRh_19db9852c5ed4a109d81c52d27c9e433.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-image/o3/image-to-image)
- [API Documentation](https://fal.ai/models/fal-ai/kling-image/o3/image-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-image/o3/image-to-image)

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

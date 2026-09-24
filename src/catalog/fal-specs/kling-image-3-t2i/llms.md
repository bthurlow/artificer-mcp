# Kling Image

> Kling V3: Latest Kling Image model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-image/v3/text-to-image`
- **Model ID**: `fal-ai/kling-image/v3/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: text-to-image



## Pricing

- **Price**: $0.028 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for image generation. Max 2500 characters.
  - Examples: "Extremely realistic image of a hobbit's study filled with maps and curiosities, roaring fireplace, rain against round windows, stacks of handwritten journals, warm tungsten lighting, inviting atmosphere. Hobbit is sitting on the chair."

- **`negative_prompt`** (`string`, _optional_):
  Negative text prompt. It is recommended to supplement negative prompt information through negative sentences directly within positive prompts.

- **`elements`** (`list<ElementInput>`, _optional_):
  Optional: Elements (characters/objects) to include in the image for face control. Each element can have a frontal image and optionally reference images.
  - Array of ElementInput

- **`resolution`** (`ResolutionEnum`, _optional_):
  Image generation resolution. 1K: standard, 2K: high-res. Default value: `"1K"`
  - Default: `"1K"`
  - Options: `"1K"`, `"2K"`

- **`num_images`** (`integer`, _optional_):
  Number of images to generate (1-9). Default value: `1`
  - Default: `1`
  - Range: `1` to `9`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of generated images. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"`, `"3:2"`, `"2:3"`, `"21:9"`

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
  "prompt": "Extremely realistic image of a hobbit's study filled with maps and curiosities, roaring fireplace, rain against round windows, stacks of handwritten journals, warm tungsten lighting, inviting atmosphere. Hobbit is sitting on the chair."
}
```

**Full Example**:

```json
{
  "prompt": "Extremely realistic image of a hobbit's study filled with maps and curiosities, roaring fireplace, rain against round windows, stacks of handwritten journals, warm tungsten lighting, inviting atmosphere. Hobbit is sitting on the chair.",
  "elements": [
    {}
  ],
  "resolution": "1K",
  "num_images": 1,
  "aspect_ratio": "16:9",
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  Generated images
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8d0681/Qos5QbCS93YpsPzZ3i8zT_a889cacced76430d85d08c60ca3d023d.png","file_name":"a889cacced76430d85d08c60ca3d023d.png","content_type":"image/png","file_size":1637946}]



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8d0681/Qos5QbCS93YpsPzZ3i8zT_a889cacced76430d85d08c60ca3d023d.png",
      "file_name": "a889cacced76430d85d08c60ca3d023d.png",
      "content_type": "image/png",
      "file_size": 1637946
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-image/v3/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Extremely realistic image of a hobbit's study filled with maps and curiosities, roaring fireplace, rain against round windows, stacks of handwritten journals, warm tungsten lighting, inviting atmosphere. Hobbit is sitting on the chair."
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
    "fal-ai/kling-image/v3/text-to-image",
    arguments={
        "prompt": "Extremely realistic image of a hobbit's study filled with maps and curiosities, roaring fireplace, rain against round windows, stacks of handwritten journals, warm tungsten lighting, inviting atmosphere. Hobbit is sitting on the chair."
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

const result = await fal.subscribe("fal-ai/kling-image/v3/text-to-image", {
  input: {
    prompt: "Extremely realistic image of a hobbit's study filled with maps and curiosities, roaring fireplace, rain against round windows, stacks of handwritten journals, warm tungsten lighting, inviting atmosphere. Hobbit is sitting on the chair."
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-image/v3/text-to-image)
- [API Documentation](https://fal.ai/models/fal-ai/kling-image/v3/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-image/v3/text-to-image)

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

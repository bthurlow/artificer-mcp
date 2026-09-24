# Krea 2 Medium

> Generate high-quality images from text with Krea 2 Medium, supporting aspect ratio, creativity controls, seeds, and optional style references.


## Overview

- **Endpoint**: `https://fal.run/krea/v2/medium/text-to-image`
- **Model ID**: `krea/v2/medium/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: text-to-image, image-generation, style-reference, krea, krea-2



## Pricing

For every image you generate, you will be charged **$0.030** (text-to-image) or **$0.035** (using image_style_references).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text description of the image to generate.
  - Examples: "A Van Gogh-tinged Provençal farmhouse under starry nights."

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated image. Default value: `"1:1"`
  - Default: `"1:1"`
  - Options: `"1:1"`, `"4:3"`, `"3:2"`, `"16:9"`, `"2.35:1"`, `"4:5"`, `"2:3"`, `"9:16"`
  - Examples: "1:1"

- **`creativity`** (`CreativityEnum`, _optional_):
  Controls how loosely the model interprets the prompt. Higher values produce more creative results that may drift from the prompt; lower values stay closer to the prompt. Default value: `"medium"`
  - Default: `"medium"`
  - Options: `"raw"`, `"low"`, `"medium"`, `"high"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation.

- **`image_style_references`** (`list<ImageStyleReference>`, _optional_):
  Optional list of reference images that guide the style of the generated image. At most 10 entries.
  - Default: `[]`
  - Array of ImageStyleReference

- **`styles`** (`list<Style>`, _optional_):
  Optional list of Krea preset styles (LoRA-based) to apply. Each entry references a style by `id` from the Krea styles catalog. At most 10 entries.
  - Default: `[]`
  - Array of Style

- **`moodboards`** (`list<Moodboard>`, _optional_):
  Optional moodboard to apply to the generation. Krea currently accepts at most one moodboard per request. Each entry references a moodboard by `id` (UUID).
  - Default: `[]`
  - Array of Moodboard



**Required Parameters Example**:

```json
{
  "prompt": "A Van Gogh-tinged Provençal farmhouse under starry nights."
}
```

**Full Example**:

```json
{
  "prompt": "A Van Gogh-tinged Provençal farmhouse under starry nights.",
  "aspect_ratio": "1:1",
  "creativity": "medium",
  "image_style_references": [],
  "styles": [],
  "moodboards": []
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  The generated images.
  - Array of Image
  - Examples: [{"url":"https://v3.fal.media/files/panda/krea_v2_example.png"}]

- **`seed`** (`integer`, _required_):
  The seed used to generate the image.
  - Examples: 12345



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/panda/krea_v2_example.png"
    }
  ],
  "seed": 12345
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/krea/v2/medium/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A Van Gogh-tinged Provençal farmhouse under starry nights."
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
    "krea/v2/medium/text-to-image",
    arguments={
        "prompt": "A Van Gogh-tinged Provençal farmhouse under starry nights."
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

const result = await fal.subscribe("krea/v2/medium/text-to-image", {
  input: {
    prompt: "A Van Gogh-tinged Provençal farmhouse under starry nights."
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

- [Model Playground](https://fal.ai/models/krea/v2/medium/text-to-image)
- [API Documentation](https://fal.ai/models/krea/v2/medium/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=krea/v2/medium/text-to-image)

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

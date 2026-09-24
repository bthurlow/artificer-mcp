# Fibo Gen 1.5 Text to Image

> Text-to-image model with high-fidelity outputs, accurate typography, and style preset, strong in photorealism, textures, and beyond. JSON-structured prompts give enterprise and agentic workflows production-ready control. Trained on licensed data.


## Overview

- **Endpoint**: `https://fal.run/bria/fibo-gen-1.5/text-to-image`
- **Model ID**: `bria/fibo-gen-1.5/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: stylized, transform, realism



## Pricing

- **Price**: $0.04 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Prompt for image generation.
  - Examples: "A weathered brown leather armchair in a sunlit study, cracked grain texture, soft afternoon light raking across the surface."

- **`structured_prompt`** (`StructuredPrompt`, _optional_):
  The structured prompt to generate an image from.

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Default value: `5555`
  - Default: `5555`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio. Options: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9 Default value: `"1:1"`
  - Default: `"1:1"`
  - Options: `"1:1"`, `"2:3"`, `"3:2"`, `"3:4"`, `"4:3"`, `"4:5"`, `"5:4"`, `"9:16"`, `"16:9"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output image resolution Default value: `"1MP"`
  - Default: `"1MP"`
  - Options: `"1MP"`, `"4MP"`

- **`sync_mode`** (`boolean`, _optional_):
  If true, returns the image directly in the response (increases latency).
  - Default: `false`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "prompt": "A weathered brown leather armchair in a sunlit study, cracked grain texture, soft afternoon light raking across the surface.",
  "seed": 5555,
  "aspect_ratio": "1:1",
  "resolution": "1MP"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  Generated image.

- **`images`** (`list<object>`, _optional_):
  Generated images.
  - Default: `[]`
  - Array of object

- **`structured_prompt`** (`Structured Prompt`, _required_):
  Current prompt.



**Example Response**:

```json
{
  "image": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019,
    "width": 1024,
    "height": 1024
  },
  "images": []
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/fibo-gen-1.5/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
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
    "bria/fibo-gen-1.5/text-to-image",
    arguments={},
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

const result = await fal.subscribe("bria/fibo-gen-1.5/text-to-image", {
  input: {},
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

- [Model Playground](https://fal.ai/models/bria/fibo-gen-1.5/text-to-image)
- [API Documentation](https://fal.ai/models/bria/fibo-gen-1.5/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/fibo-gen-1.5/text-to-image)

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

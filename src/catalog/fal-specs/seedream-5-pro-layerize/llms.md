# Seedream 5.0 Pro Layerize

> Splits a finished image into independent, editable transparent-PNG layers — background plus separate elements, from a text description, returning 2 to 17 layers per call for non-destructive reuse in design tools.


## Overview

- **Endpoint**: `https://fal.run/bytedance/seedream/v5/pro/layerize`
- **Model ID**: `bytedance/seedream/v5/pro/layerize`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: utility, editing



## Pricing

Your request will cost **$0.03375 per generated layer** for total pixel area under 1536x1536. For total pixel area over 1536x1536, each request will cost **$0.0675 per generated layer** .  Please note that total pixel area is determined from the size of the generated base layer.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Optional instructions describing which elements to separate. When empty, the model automatically separates the major elements. Normalized `<bbox>left top right bottom</bbox>` tags may be used for precise coordinate targeting. Default value: `""`
  - Default: `""`
  - Examples: "Return name and description in english."

- **`image_url`** (`string`, _required_):
  URL of the image to decompose into a base image and independently editable layers. The image must contain between 512x512 and 6000x6000 total pixels, have an aspect ratio between 1/16 and 16, and be no larger than 30 MB.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"

- **`image_size`** (`ImageSizeEnum`, _optional_):
  Resolution tier for the output base image and layers. `auto` adapts to the input image while preserving each element's aspect ratio. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"auto_1K"`, `"auto_1.5K"`, `"auto_2K"`
  - Examples: "auto"

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`
  - Examples: true

- **`enhance_prompt_mode`** (`EnhancePromptModeEnum`, _optional_):
  Prompt optimization mode. `standard` prioritizes image quality; `fast` reduces generation time. Default value: `"standard"`
  - Default: `"standard"`
  - Options: `"standard"`, `"fast"`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"
}
```

**Full Example**:

```json
{
  "prompt": "Return name and description in english.",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp",
  "image_size": "auto",
  "enable_safety_checker": true,
  "enhance_prompt_mode": "standard"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  The same images as `layers`, in the same order, flattened for gallery rendering.
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0aa54c02/95ZvKubW63JnC9ubRbDo2_74290e95fb6d4bd4bac756f3e2667317.png"}]

- **`layers`** (`list<SeedDream50ProLayer>`, _required_):
  The base image followed by up to 16 separated layers, ordered by increasing z_index.
  - Array of SeedDream50ProLayer



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0aa54c02/95ZvKubW63JnC9ubRbDo2_74290e95fb6d4bd4bac756f3e2667317.png"
    }
  ],
  "layers": [
    {
      "image": {
        "url": "",
        "content_type": "image/png",
        "file_name": "z9RV14K95DvU.png",
        "file_size": 4404019,
        "width": 1024,
        "height": 1024
      }
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bytedance/seedream/v5/pro/layerize \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"
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
    "bytedance/seedream/v5/pro/layerize",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"
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

const result = await fal.subscribe("bytedance/seedream/v5/pro/layerize", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"
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

- [Model Playground](https://fal.ai/models/bytedance/seedream/v5/pro/layerize)
- [API Documentation](https://fal.ai/models/bytedance/seedream/v5/pro/layerize/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seedream/v5/pro/layerize)

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

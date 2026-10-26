# Seedream

> Text to Image endpoint for the fast Lite version of Seedream 5.0, supporting high quality intelligent text-to-image generation.


## Overview

- **Endpoint**: `https://fal.run/bytedance/seedream/v5/lite/text-to-image`
- **Model ID**: `bytedance/seedream/v5/lite/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: text-to-image, bytedance, seedream-5.0-lite



## Pricing

- **Price**: $0.035 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used to generate the image
  - Examples: "Realistic DSLR photograph of anthropomorphic Penkingese dog enjoying a bowl of ramen on the Great Wall of China with the words \"Seedream 5.0 Lite available on fal\" visible at the top."

- **`image_size`** (`SeedreamLiteImageSize | Enum`, _optional_):
  The size of the generated image. Custom dimensions within the provider's pixel and aspect limits are sent unchanged. Other sizes use compatible scaling. The provider's native pixel range is 2560x1440 to 4096x4096, with aspect ratio between 1/16 and 16. Default value: `auto_2K`
  - Default: `"auto_2K"`
  - One of: SeedreamLiteImageSize | Enum

- **`num_images`** (`integer`, _optional_):
  Number of separate model generations to be run with the prompt. Default value: `1`
  - Default: `1`
  - Range: `1` to `6`

- **`max_images`** (`integer`, _optional_):
  Maximum images per generation in sequential mode. Ignored when sequential generation is disabled. Combined input references and outputs per generation cannot exceed 15. Default value: `1`
  - Default: `1`
  - Range: `1` to `15`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`
  - Examples: true

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The file format of the generated images. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`

- **`watermark`** (`boolean`, _optional_):
  Whether to add the provider's visible watermark.
  - Default: `false`

- **`image_passthrough`** (`boolean`, _optional_):
  Preserve original reference and output image bytes, formats, and dimensions without resizing or re-encoding.
  - Default: `false`

- **`sequential_image_generation`** (`Enum`, _optional_):
  Generate related images with `auto`, or one image per generation with `disabled`. When omitted, values of `max_images` above one enable `auto`.
  - Options: `"auto"`, `"disabled"`

- **`return_byteplus_urls`** (`boolean`, _optional_):
  If set to true returns seedance-2 trusted URLs. Please note these urls expire in 24 hours.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "Realistic DSLR photograph of anthropomorphic Penkingese dog enjoying a bowl of ramen on the Great Wall of China with the words \"Seedream 5.0 Lite available on fal\" visible at the top."
}
```

**Full Example**:

```json
{
  "prompt": "Realistic DSLR photograph of anthropomorphic Penkingese dog enjoying a bowl of ramen on the Great Wall of China with the words \"Seedream 5.0 Lite available on fal\" visible at the top.",
  "image_size": "auto_2K",
  "num_images": 1,
  "max_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  Generated images
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8fbf48/fv693UaOADKqnujJRZN90_4518fc5e1fed4fb29963b22a8cc3d5a6.png"}]

- **`seed`** (`integer`, _required_):
  Seed used for generation.
  - Examples: 42



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8fbf48/fv693UaOADKqnujJRZN90_4518fc5e1fed4fb29963b22a8cc3d5a6.png"
    }
  ],
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bytedance/seedream/v5/lite/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Realistic DSLR photograph of anthropomorphic Penkingese dog enjoying a bowl of ramen on the Great Wall of China with the words \"Seedream 5.0 Lite available on fal\" visible at the top."
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
    "bytedance/seedream/v5/lite/text-to-image",
    arguments={
        "prompt": "Realistic DSLR photograph of anthropomorphic Penkingese dog enjoying a bowl of ramen on the Great Wall of China with the words \"Seedream 5.0 Lite available on fal\" visible at the top."
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

const result = await fal.subscribe("bytedance/seedream/v5/lite/text-to-image", {
  input: {
    prompt: "Realistic DSLR photograph of anthropomorphic Penkingese dog enjoying a bowl of ramen on the Great Wall of China with the words \"Seedream 5.0 Lite available on fal\" visible at the top."
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

- [Model Playground](https://fal.ai/models/bytedance/seedream/v5/lite/text-to-image)
- [API Documentation](https://fal.ai/models/bytedance/seedream/v5/lite/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seedream/v5/lite/text-to-image)

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

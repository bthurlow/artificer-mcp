# Seedream

> Image editing endpoint for the fast Lite version of Seedream 5.0, supporting high quality intelligent image editing with multiple inputs.


## Overview

- **Endpoint**: `https://fal.run/bytedance/seedream/v5/lite/edit`
- **Model ID**: `bytedance/seedream/v5/lite/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: bytedance, seedream-5.0-lite, edit



## Pricing

- **Price**: $0.035 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used to edit the image
  - Examples: "Replace the product in Figure 1 with that in Figure 2. Seamlessly render logo in Figure 3 into the product design, in frosted glass texture. Remove any extra text in Figure 1, and design a catchy tagline for the perfume."

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

- **`image_urls`** (`list<string>`, _required_):
  List of URLs of input images for editing. By default, when more than 10 references are provided, only the last 10 are used. With image_passthrough enabled, all references are preserved, supporting up to 14; combined references and outputs per generation cannot exceed 15.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8f9936/KOsb_qPB_W0ZJ0Ee2OsnU_586e2892841d46f09049ee7199b303d3.png","https://v3b.fal.media/files/b/0a8f994e/JroWTogO6jOTFk9b6B3XM_591ca38cef2f44bbba2843cbf80fb1b2.png","https://v3b.fal.media/files/b/0a8f9960/Q6pzwXAiFaFPOpSScoE-D_0eca5db19e5242739f127efe49b38922.png"]



**Required Parameters Example**:

```json
{
  "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render logo in Figure 3 into the product design, in frosted glass texture. Remove any extra text in Figure 1, and design a catchy tagline for the perfume.",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8f9936/KOsb_qPB_W0ZJ0Ee2OsnU_586e2892841d46f09049ee7199b303d3.png",
    "https://v3b.fal.media/files/b/0a8f994e/JroWTogO6jOTFk9b6B3XM_591ca38cef2f44bbba2843cbf80fb1b2.png",
    "https://v3b.fal.media/files/b/0a8f9960/Q6pzwXAiFaFPOpSScoE-D_0eca5db19e5242739f127efe49b38922.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render logo in Figure 3 into the product design, in frosted glass texture. Remove any extra text in Figure 1, and design a catchy tagline for the perfume.",
  "image_size": "auto_2K",
  "num_images": 1,
  "max_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8f9936/KOsb_qPB_W0ZJ0Ee2OsnU_586e2892841d46f09049ee7199b303d3.png",
    "https://v3b.fal.media/files/b/0a8f994e/JroWTogO6jOTFk9b6B3XM_591ca38cef2f44bbba2843cbf80fb1b2.png",
    "https://v3b.fal.media/files/b/0a8f9960/Q6pzwXAiFaFPOpSScoE-D_0eca5db19e5242739f127efe49b38922.png"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  Generated images
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8fbf56/wu9vcxO3xO6lkHv5zdiIs_7aa8564f6e4f4cc795ecb8e923deb2fb.png"}]

- **`seed`** (`integer`, _required_):
  Seed used for generation.
  - Examples: 42



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8fbf56/wu9vcxO3xO6lkHv5zdiIs_7aa8564f6e4f4cc795ecb8e923deb2fb.png"
    }
  ],
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bytedance/seedream/v5/lite/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render logo in Figure 3 into the product design, in frosted glass texture. Remove any extra text in Figure 1, and design a catchy tagline for the perfume.",
     "image_urls": [
       "https://v3b.fal.media/files/b/0a8f9936/KOsb_qPB_W0ZJ0Ee2OsnU_586e2892841d46f09049ee7199b303d3.png",
       "https://v3b.fal.media/files/b/0a8f994e/JroWTogO6jOTFk9b6B3XM_591ca38cef2f44bbba2843cbf80fb1b2.png",
       "https://v3b.fal.media/files/b/0a8f9960/Q6pzwXAiFaFPOpSScoE-D_0eca5db19e5242739f127efe49b38922.png"
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
    "bytedance/seedream/v5/lite/edit",
    arguments={
        "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render logo in Figure 3 into the product design, in frosted glass texture. Remove any extra text in Figure 1, and design a catchy tagline for the perfume.",
        "image_urls": ["https://v3b.fal.media/files/b/0a8f9936/KOsb_qPB_W0ZJ0Ee2OsnU_586e2892841d46f09049ee7199b303d3.png", "https://v3b.fal.media/files/b/0a8f994e/JroWTogO6jOTFk9b6B3XM_591ca38cef2f44bbba2843cbf80fb1b2.png", "https://v3b.fal.media/files/b/0a8f9960/Q6pzwXAiFaFPOpSScoE-D_0eca5db19e5242739f127efe49b38922.png"]
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

const result = await fal.subscribe("bytedance/seedream/v5/lite/edit", {
  input: {
    prompt: "Replace the product in Figure 1 with that in Figure 2. Seamlessly render logo in Figure 3 into the product design, in frosted glass texture. Remove any extra text in Figure 1, and design a catchy tagline for the perfume.",
    image_urls: ["https://v3b.fal.media/files/b/0a8f9936/KOsb_qPB_W0ZJ0Ee2OsnU_586e2892841d46f09049ee7199b303d3.png", "https://v3b.fal.media/files/b/0a8f994e/JroWTogO6jOTFk9b6B3XM_591ca38cef2f44bbba2843cbf80fb1b2.png", "https://v3b.fal.media/files/b/0a8f9960/Q6pzwXAiFaFPOpSScoE-D_0eca5db19e5242739f127efe49b38922.png"]
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

- [Model Playground](https://fal.ai/models/bytedance/seedream/v5/lite/edit)
- [API Documentation](https://fal.ai/models/bytedance/seedream/v5/lite/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seedream/v5/lite/edit)

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

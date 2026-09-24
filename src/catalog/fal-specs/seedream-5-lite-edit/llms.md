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

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. Total pixels must be between 2560x1440 and 4096x4096. In case the image size does not fall within these parameters, the image size will be adjusted to by scaling. Default value: `auto_2K`
  - Default: `"auto_2K"`
  - One of: ImageSize | Enum

- **`num_images`** (`integer`, _optional_):
  Number of separate model generations to be run with the prompt. Default value: `1`
  - Default: `1`
  - Range: `1` to `6`

- **`max_images`** (`integer`, _optional_):
  If set to a number greater than one, enables multi-image generation. The model will potentially return up to `max_images` images every generation, and in total, `num_images` generations will be carried out. In total, the number of images generated will be between `num_images` and `max_images*num_images`. Default value: `1`
  - Default: `1`
  - Range: `1` to `6`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`
  - Examples: true

- **`image_urls`** (`list<string>`, _required_):
  List of URLs of input images for editing. Presently, up to 10 image inputs are allowed. If over 10 images are sent, only the last 10 will be used.
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

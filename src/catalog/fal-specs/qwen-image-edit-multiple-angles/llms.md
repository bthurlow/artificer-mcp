# Qwen Image Edit 2511 Multiple Angles

> Generates same scene from different angles (azimuth/elevation) with Qwen image Edit 2511 and the Lora Multiple Angles


## Overview

- **Endpoint**: `https://fal.run/fal-ai/qwen-image-edit-2511-multiple-angles`
- **Model ID**: `fal-ai/qwen-image-edit-2511-multiple-angles`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: stylized, transform, lora, multi-angles, multiples, angles



## Pricing

- **Price**: $0.035 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_urls`** (`list<string>`, _required_):
  The URL of the image to adjust camera angle for.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8973cb/qUbVwDCcMlvX4drBGYB1H.png"]

- **`horizontal_angle`** (`float`, _optional_):
  Horizontal rotation angle around the object in degrees. 0°=front view, 90°=right side, 180°=back view, 270°=left side, 360°=front view again.
  - Default: `0`
  - Range: `0` to `360`

- **`vertical_angle`** (`float`, _optional_):
  Vertical camera angle in degrees. -30°=low-angle shot (looking up), 0°=eye-level, 30°=elevated, 60°=high-angle, 90°=bird's-eye view (looking down).
  - Default: `0`
  - Range: `-30` to `90`

- **`zoom`** (`float`, _optional_):
  Camera zoom/distance. 0=wide shot (far away), 5=medium shot (normal), 10=close-up (very close). Default value: `5`
  - Default: `5`
  - Range: `0` to `10`

- **`additional_prompt`** (`string`, _optional_):
  Additional text to append to the automatically generated prompt.

- **`lora_scale`** (`float`, _optional_):
  The scale factor for the LoRA model. Controls the strength of the camera control effect. Default value: `1`
  - Default: `1`
  - Range: `0` to `4`

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. If not provided, the size of the input image will be used.
  - One of: ImageSize | Enum

- **`guidance_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale. Default value: `4.5`
  - Default: `4.5`
  - Range: `1` to `20`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `28`
  - Default: `28`
  - Range: `1` to `50`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  Acceleration level for image generation. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt for the generation Default value: `""`
  - Default: `""`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility.

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the output image Default value: `"png"`
  - Default: `"png"`
  - Options: `"png"`, `"jpeg"`, `"webp"`

- **`num_images`** (`integer`, _optional_):
  Number of images to generate Default value: `1`
  - Default: `1`
  - Range: `1` to `4`



**Required Parameters Example**:

```json
{
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8973cb/qUbVwDCcMlvX4drBGYB1H.png"
  ]
}
```

**Full Example**:

```json
{
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8973cb/qUbVwDCcMlvX4drBGYB1H.png"
  ],
  "zoom": 5,
  "lora_scale": 1,
  "guidance_scale": 4.5,
  "num_inference_steps": 28,
  "acceleration": "regular",
  "enable_safety_checker": true,
  "output_format": "png",
  "num_images": 1
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  The generated/edited images
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8973d9/8Z0xxKdGnoJAWc2tKJ68f.png"}]

- **`seed`** (`integer`, _required_):
  The seed used for generation

- **`prompt`** (`string`, _required_):
  The constructed prompt used for generation



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8973d9/8Z0xxKdGnoJAWc2tKJ68f.png"
    }
  ],
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/qwen-image-edit-2511-multiple-angles \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_urls": [
       "https://v3b.fal.media/files/b/0a8973cb/qUbVwDCcMlvX4drBGYB1H.png"
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
    "fal-ai/qwen-image-edit-2511-multiple-angles",
    arguments={
        "image_urls": ["https://v3b.fal.media/files/b/0a8973cb/qUbVwDCcMlvX4drBGYB1H.png"]
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

const result = await fal.subscribe("fal-ai/qwen-image-edit-2511-multiple-angles", {
  input: {
    image_urls: ["https://v3b.fal.media/files/b/0a8973cb/qUbVwDCcMlvX4drBGYB1H.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/qwen-image-edit-2511-multiple-angles)
- [API Documentation](https://fal.ai/models/fal-ai/qwen-image-edit-2511-multiple-angles/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/qwen-image-edit-2511-multiple-angles)

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

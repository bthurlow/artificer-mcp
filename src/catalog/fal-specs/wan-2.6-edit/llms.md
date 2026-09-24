# Wan v2.6 Image to Image

> Wan 2.6 image-to-image model.


## Overview

- **Endpoint**: `https://fal.run/wan/v2.6/image-to-image`
- **Model ID**: `wan/v2.6/image-to-image`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: image-to-image



## Pricing

- **Price**: $0.03 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the desired image. Supports Chinese and English. Max 2000 characters. Example: 'Generate an image using the style of image 1 and background of image 2'.
  - Examples: "Place the wizard from image 2 in the ancient library from image 3, holding and studying the magical crystal orb from image 1. The orb's glow illuminates his face with purple and blue light. Floating candles around him, ancient books visible in the background. Mystical, dramatic lighting, fantasy art style, highly detailed."

- **`image_urls`** (`list<string>`, _required_):
  Reference images for editing (1-3 images required). Order matters: reference as 'image 1', 'image 2', 'image 3' in prompt. Resolution: 384-5000px each dimension. Max size: 10MB each. Formats: JPEG, JPG, PNG (no alpha), BMP, WEBP.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a86d6a7/6smIczyPbvAU3IJ1F5Ok3.png","https://v3b.fal.media/files/b/0a86d6a7/nTYVlOfKLD1FqHAGy7KS3.png","https://v3b.fal.media/files/b/0a86d6ae/6JA70jOe0-pbDtXLF2roV.png"]

- **`negative_prompt`** (`string`, _optional_):
  Content to avoid in the generated image. Max 500 characters. Default value: `""`
  - Default: `""`
  - Examples: "low resolution, error, worst quality, low quality, deformed, extra fingers"

- **`image_size`** (`ImageSize | Enum`, _optional_):
  Output image size. Use presets like 'square_hd', 'landscape_16_9', 'portrait_9_16', or specify exact dimensions with ImageSize(width=1280, height=720). Total pixels must be between 768*768 and 1280*1280. Default value: `square_hd`
  - Default: `"square_hd"`
  - One of: ImageSize | Enum
  - Examples: "square_hd", "landscape_16_9", "portrait_4_3"

- **`num_images`** (`integer`, _optional_):
  Number of images to generate (1-4). Directly affects billing cost. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Enable LLM prompt optimization. Significantly improves results for simple prompts but adds 3-4 seconds processing time. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility (0-2147483647). Same seed produces more consistent results.

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "Place the wizard from image 2 in the ancient library from image 3, holding and studying the magical crystal orb from image 1. The orb's glow illuminates his face with purple and blue light. Floating candles around him, ancient books visible in the background. Mystical, dramatic lighting, fantasy art style, highly detailed.",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a86d6a7/6smIczyPbvAU3IJ1F5Ok3.png",
    "https://v3b.fal.media/files/b/0a86d6a7/nTYVlOfKLD1FqHAGy7KS3.png",
    "https://v3b.fal.media/files/b/0a86d6ae/6JA70jOe0-pbDtXLF2roV.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Place the wizard from image 2 in the ancient library from image 3, holding and studying the magical crystal orb from image 1. The orb's glow illuminates his face with purple and blue light. Floating candles around him, ancient books visible in the background. Mystical, dramatic lighting, fantasy art style, highly detailed.",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a86d6a7/6smIczyPbvAU3IJ1F5Ok3.png",
    "https://v3b.fal.media/files/b/0a86d6a7/nTYVlOfKLD1FqHAGy7KS3.png",
    "https://v3b.fal.media/files/b/0a86d6ae/6JA70jOe0-pbDtXLF2roV.png"
  ],
  "negative_prompt": "low resolution, error, worst quality, low quality, deformed, extra fingers",
  "image_size": "square_hd",
  "num_images": 1,
  "enable_prompt_expansion": true,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_):
  Generated images in PNG format
  - Array of File
  - Examples: [{"content_type":"image/png","url":"https://v3b.fal.media/files/b/0a86d6bb/iSEuXzi3kDy1jnlMCwYuH_output_3.png","file_name":"output_1.png"}]

- **`seed`** (`integer`, _required_):
  The seed used for generation
  - Examples: 175932751



**Example Response**:

```json
{
  "images": [
    {
      "content_type": "image/png",
      "url": "https://v3b.fal.media/files/b/0a86d6bb/iSEuXzi3kDy1jnlMCwYuH_output_3.png",
      "file_name": "output_1.png"
    }
  ],
  "seed": 175932751
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/wan/v2.6/image-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Place the wizard from image 2 in the ancient library from image 3, holding and studying the magical crystal orb from image 1. The orb's glow illuminates his face with purple and blue light. Floating candles around him, ancient books visible in the background. Mystical, dramatic lighting, fantasy art style, highly detailed.",
     "image_urls": [
       "https://v3b.fal.media/files/b/0a86d6a7/6smIczyPbvAU3IJ1F5Ok3.png",
       "https://v3b.fal.media/files/b/0a86d6a7/nTYVlOfKLD1FqHAGy7KS3.png",
       "https://v3b.fal.media/files/b/0a86d6ae/6JA70jOe0-pbDtXLF2roV.png"
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
    "wan/v2.6/image-to-image",
    arguments={
        "prompt": "Place the wizard from image 2 in the ancient library from image 3, holding and studying the magical crystal orb from image 1. The orb's glow illuminates his face with purple and blue light. Floating candles around him, ancient books visible in the background. Mystical, dramatic lighting, fantasy art style, highly detailed.",
        "image_urls": ["https://v3b.fal.media/files/b/0a86d6a7/6smIczyPbvAU3IJ1F5Ok3.png", "https://v3b.fal.media/files/b/0a86d6a7/nTYVlOfKLD1FqHAGy7KS3.png", "https://v3b.fal.media/files/b/0a86d6ae/6JA70jOe0-pbDtXLF2roV.png"]
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

const result = await fal.subscribe("wan/v2.6/image-to-image", {
  input: {
    prompt: "Place the wizard from image 2 in the ancient library from image 3, holding and studying the magical crystal orb from image 1. The orb's glow illuminates his face with purple and blue light. Floating candles around him, ancient books visible in the background. Mystical, dramatic lighting, fantasy art style, highly detailed.",
    image_urls: ["https://v3b.fal.media/files/b/0a86d6a7/6smIczyPbvAU3IJ1F5Ok3.png", "https://v3b.fal.media/files/b/0a86d6a7/nTYVlOfKLD1FqHAGy7KS3.png", "https://v3b.fal.media/files/b/0a86d6ae/6JA70jOe0-pbDtXLF2roV.png"]
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

- [Model Playground](https://fal.ai/models/wan/v2.6/image-to-image)
- [API Documentation](https://fal.ai/models/wan/v2.6/image-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=wan/v2.6/image-to-image)

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

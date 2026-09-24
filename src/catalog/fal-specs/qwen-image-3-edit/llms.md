# Qwen Image 3 Image Editing

> Edits images from one to three reference images and a natural-language instruction, preserving key details such as facial features and identity while applying the requested changes


## Overview

- **Endpoint**: `https://fal.run/alibaba/qwen-image-3/edit`
- **Model ID**: `alibaba/qwen-image-3/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: stylized, transform, typography



## Pricing

Your request will cost $**0.04** per generated image at 1K resolution, and $**0.075** per generated image at 2K resolution.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the desired edit. Supports Chinese and English. Max 5000 characters.
  - Examples: "Change the wolves into extremely realistic small puppies of different colors."

- **`negative_prompt`** (`string`, _optional_):
  Content to avoid in the generated image. Max 500 characters. Default value: `""`
  - Default: `""`
  - Examples: "low resolution, error, worst quality, low quality, deformed"

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. If not provided, the model determines the resolution automatically. Total number of pixels must be between 512x512 and 2048x2048.
  - One of: ImageSize | Enum

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Enable automatic LLM prompt rewriting for better results. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility (0-2147483647).

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `6`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`image_urls`** (`list<string>`, _required_):
  Reference images for editing (1-3 images required). Order matters: reference as 'image 1', 'image 2', 'image 3' in prompt. Resolution: 384-2048px each dimension. Max size: 10MB each. Formats: JPEG, JPG, PNG (no alpha), WEBP.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8bf01f/TUehdcnBygWa1-SnEbp3K_image_123.png"]



**Required Parameters Example**:

```json
{
  "prompt": "Change the wolves into extremely realistic small puppies of different colors.",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8bf01f/TUehdcnBygWa1-SnEbp3K_image_123.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Change the wolves into extremely realistic small puppies of different colors.",
  "negative_prompt": "low resolution, error, worst quality, low quality, deformed",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "num_images": 1,
  "output_format": "png",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8bf01f/TUehdcnBygWa1-SnEbp3K_image_123.png"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_):
  Generated images.
  - Array of File
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8bf01f/5ZVeoOz6DtJUq6-f4SIsc_WawZPkPJ.png"}]

- **`seed`** (`integer`, _required_):
  The seed used for generation.
  - Examples: 42



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8bf01f/5ZVeoOz6DtJUq6-f4SIsc_WawZPkPJ.png"
    }
  ],
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/alibaba/qwen-image-3/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Change the wolves into extremely realistic small puppies of different colors.",
     "image_urls": [
       "https://v3b.fal.media/files/b/0a8bf01f/TUehdcnBygWa1-SnEbp3K_image_123.png"
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
    "alibaba/qwen-image-3/edit",
    arguments={
        "prompt": "Change the wolves into extremely realistic small puppies of different colors.",
        "image_urls": ["https://v3b.fal.media/files/b/0a8bf01f/TUehdcnBygWa1-SnEbp3K_image_123.png"]
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

const result = await fal.subscribe("alibaba/qwen-image-3/edit", {
  input: {
    prompt: "Change the wolves into extremely realistic small puppies of different colors.",
    image_urls: ["https://v3b.fal.media/files/b/0a8bf01f/TUehdcnBygWa1-SnEbp3K_image_123.png"]
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

- [Model Playground](https://fal.ai/models/alibaba/qwen-image-3/edit)
- [API Documentation](https://fal.ai/models/alibaba/qwen-image-3/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=alibaba/qwen-image-3/edit)

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

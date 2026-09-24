# Wan v2.6 Text to Image

> Wan 2.6 text-to-image model.


## Overview

- **Endpoint**: `https://fal.run/wan/v2.6/text-to-image`
- **Model ID**: `wan/v2.6/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: text-to-image



## Pricing

- **Price**: $0.03 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the desired image. Supports Chinese and English. Max 2000 characters.
  - Examples: "An ancient library floating among clouds, golden hour light streaming through massive windows, photorealistic"

- **`image_url`** (`string`, _optional_):
  Optional reference image (0 or 1). When provided, can be used for style guidance. Resolution: 384-5000px each dimension. Max size: 10MB. Formats: JPEG, JPG, PNG (no alpha), BMP, WEBP.

- **`negative_prompt`** (`string`, _optional_):
  Content to avoid in the generated image. Max 500 characters. Default value: `""`
  - Default: `""`
  - Examples: "low resolution, error, worst quality, low quality, deformed"

- **`image_size`** (`ImageSize | Enum`, _optional_):
  Output image size. If not set: matches input image size (up to 1280*1280). Use presets like 'square_hd', 'landscape_16_9', or specify exact dimensions.
  - One of: ImageSize | Enum
  - Examples: "square_hd", "landscape_16_9"

- **`max_images`** (`integer`, _optional_):
  Maximum number of images to generate (1-5). Actual count may be less depending on model inference. Default value: `1`
  - Default: `1`
  - Range: `1` to `5`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility (0-2147483647).

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "An ancient library floating among clouds, golden hour light streaming through massive windows, photorealistic"
}
```

**Full Example**:

```json
{
  "prompt": "An ancient library floating among clouds, golden hour light streaming through massive windows, photorealistic",
  "negative_prompt": "low resolution, error, worst quality, low quality, deformed",
  "image_size": "square_hd",
  "max_images": 1,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_):
  Generated images in PNG format
  - Array of File
  - Examples: [{"content_type":"image/png","url":"https://v3b.fal.media/files/b/0a86d6b0/cBXGSUEl3DkTcBnf9IEM0_output_1.png","file_name":"output_1.png"}]

- **`generated_text`** (`string`, _optional_):
  Generated text content (in mixed text-and-image mode). May be None if only images were generated.

- **`seed`** (`integer`, _required_):
  The seed used for generation
  - Examples: 175932751



**Example Response**:

```json
{
  "images": [
    {
      "content_type": "image/png",
      "url": "https://v3b.fal.media/files/b/0a86d6b0/cBXGSUEl3DkTcBnf9IEM0_output_1.png",
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
  --url https://fal.run/wan/v2.6/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "An ancient library floating among clouds, golden hour light streaming through massive windows, photorealistic"
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
    "wan/v2.6/text-to-image",
    arguments={
        "prompt": "An ancient library floating among clouds, golden hour light streaming through massive windows, photorealistic"
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

const result = await fal.subscribe("wan/v2.6/text-to-image", {
  input: {
    prompt: "An ancient library floating among clouds, golden hour light streaming through massive windows, photorealistic"
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

- [Model Playground](https://fal.ai/models/wan/v2.6/text-to-image)
- [API Documentation](https://fal.ai/models/wan/v2.6/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=wan/v2.6/text-to-image)

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

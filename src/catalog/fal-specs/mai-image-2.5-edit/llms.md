# Mai Image 2.5

> MAI-Image-2.5 is Microsoft's photorealistic image generation and editing model that turns text prompts or uploaded images into high-quality, design-ready visuals with fine-grained, pixel-level control.


## Overview

- **Endpoint**: `https://fal.run/microsoft/mai-image-2.5/edit`
- **Model ID**: `microsoft/mai-image-2.5/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: realism, typography, stylized



## Pricing

Image output: ~**$0.05** per generated image, billed as ~**1024** output image tokens. Each requested image is billed separately. Total token cost is rounded up to the nearest **$0.0001**. Text tokens: **$5.00** per **1M** input tokens. Image input tokens: **$8.00** per **1M** input tokens. Note: Pricing is subject to change.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The instruction describing how to edit the input image(s).
  - Examples: "Turn this into a clean, futuristic product shot with soft studio lighting."

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated image. Use "auto" to match the input or let the model decide. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"1:1"`, `"4:3"`, `"3:4"`, `"16:9"`, `"9:16"`, `"3:2"`, `"2:3"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`image_urls`** (`list<string>`, _required_):
  The URL of the image to edit. Provide one http(s) or data: URL.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"]



**Required Parameters Example**:

```json
{
  "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting.",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting.",
  "num_images": 1,
  "aspect_ratio": "auto",
  "output_format": "png",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The edited images.
  - Array of ImageFile

- **`description`** (`string`, _required_):
  The description of the generated images.



**Example Response**:

```json
{
  "images": [
    {
      "url": "",
      "content_type": "image/png",
      "file_name": "z9RV14K95DvU.png",
      "file_size": 4404019
    }
  ],
  "description": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/microsoft/mai-image-2.5/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting.",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"
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
    "microsoft/mai-image-2.5/edit",
    arguments={
        "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting.",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"]
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

const result = await fal.subscribe("microsoft/mai-image-2.5/edit", {
  input: {
    prompt: "Turn this into a clean, futuristic product shot with soft studio lighting.",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"]
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

- [Model Playground](https://fal.ai/models/microsoft/mai-image-2.5/edit)
- [API Documentation](https://fal.ai/models/microsoft/mai-image-2.5/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=microsoft/mai-image-2.5/edit)

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

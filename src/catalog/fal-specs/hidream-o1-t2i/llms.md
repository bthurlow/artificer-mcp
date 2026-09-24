# Hidream O1 Image

> Unified image generation with HiDream-O1-Image. Create, edit, and personalize high-resolution images up to 2K—single native model handles text-to-image, editing, and custom subjects without external components.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/hidream-o1-image`
- **Model ID**: `fal-ai/hidream-o1-image`
- **Category**: text-to-image
- **Kind**: inference


## Pricing

- **Price**: $0.01 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for image generation, editing, or subject-driven personalization.
  - Examples: "A cinematic product photo of a ceramic mug on a marble counter, soft window light, shallow depth of field."

- **`reference_image_urls`** (`list<string>`, _optional_):
  Optional reference images. Use none for text-to-image, one for image editing, or multiple for subject-driven personalization.
  - Default: `[]`
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png"]

- **`image_size`** (`ImageSize | Enum`, _optional_):
  Requested output image size. Dimensions are rounded down to a multiple of 32, up to about 2048x2048 pixels.
  - Default: `{"height":1024,"width":1024}`
  - One of: ImageSize | Enum

- **`num_inference_steps`** (`integer`, _optional_):
  Number of denoising steps. Default value: `50`
  - Default: `50`
  - Range: `1` to `50`

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. The full model uses 5.0 by default. Default value: `5`
  - Default: `5`
  - Range: `0` to `20`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation.

- **`num_images`** (`integer`, _optional_):
  Number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable the safety checker on generated images. Default value: `true`
  - Default: `true`

- **`keep_original_aspect`** (`boolean`, _optional_):
  When exactly one reference image is provided, preserve its aspect ratio for the output image.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A cinematic product photo of a ceramic mug on a marble counter, soft window light, shallow depth of field."
}
```

**Full Example**:

```json
{
  "prompt": "A cinematic product photo of a ceramic mug on a marble counter, soft window light, shallow depth of field.",
  "reference_image_urls": [
    "https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png"
  ],
  "image_size": {
    "height": 1024,
    "width": 1024
  },
  "num_inference_steps": 50,
  "guidance_scale": 5,
  "num_images": 1,
  "output_format": "png",
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  Generated images.
  - Array of ImageFile

- **`seed`** (`integer`, _required_):
  The seed used for generation.

- **`has_nsfw_concepts`** (`list<boolean>`, _required_):
  Whether each generated image was flagged by the safety checker.
  - Array of boolean

- **`prompt`** (`string`, _required_):
  The prompt used for generation.

- **`timings`** (`Timings`, _required_):
  Generation timings.



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
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/hidream-o1-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A cinematic product photo of a ceramic mug on a marble counter, soft window light, shallow depth of field."
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
    "fal-ai/hidream-o1-image",
    arguments={
        "prompt": "A cinematic product photo of a ceramic mug on a marble counter, soft window light, shallow depth of field."
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

const result = await fal.subscribe("fal-ai/hidream-o1-image", {
  input: {
    prompt: "A cinematic product photo of a ceramic mug on a marble counter, soft window light, shallow depth of field."
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

- [Model Playground](https://fal.ai/models/fal-ai/hidream-o1-image)
- [API Documentation](https://fal.ai/models/fal-ai/hidream-o1-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/hidream-o1-image)

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

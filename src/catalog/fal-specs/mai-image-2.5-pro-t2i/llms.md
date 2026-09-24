# MAI Image 2.5 Pro (Text to Image)

> Generate high-fidelity, design-ready images with precise typography, strong prompt alignment, and rich visual detail using Microsoft's flagship MAI Image 2.5 Pro.


## Overview

- **Endpoint**: `https://fal.run/microsoft/mai-image-2.5-pro`
- **Model ID**: `microsoft/mai-image-2.5-pro`
- **Category**: text-to-image
- **Kind**: inference
**Description**: MAI Image 2.5 Pro is Microsoft's highest-fidelity image model for production-grade text-to-image generation. It is designed for hero imagery, detailed compositions, precise text rendering, photorealism, stylized illustration, commercial design, and visually rich concept work. The endpoint supports flexible aspect ratios, multiple output formats, and multiple requested images per call.

**Tags**: photorealism, typography, illustration, commercial, text-to-image



## Pricing

Text input: **$7.50 / 1M tokens**. Image output: **$162 / 1M tokens**. Average text-to-image cost: **~$0.17 per image**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to generate an image from.
  - Examples: "A photorealistic concept-art poster of a university campus at sunset, cinematic lighting, a banner reading \"LOUISVILLE\" in bold serif type."

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated image. Use "auto" to let the model decide based on the prompt. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"1:1"`, `"4:3"`, `"3:4"`, `"16:9"`, `"9:16"`, `"3:2"`, `"2:3"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A photorealistic concept-art poster of a university campus at sunset, cinematic lighting, a banner reading \"LOUISVILLE\" in bold serif type."
}
```

**Full Example**:

```json
{
  "prompt": "A photorealistic concept-art poster of a university campus at sunset, cinematic lighting, a banner reading \"LOUISVILLE\" in bold serif type.",
  "num_images": 1,
  "aspect_ratio": "auto",
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images.
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
  --url https://fal.run/microsoft/mai-image-2.5-pro \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A photorealistic concept-art poster of a university campus at sunset, cinematic lighting, a banner reading \"LOUISVILLE\" in bold serif type."
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
    "microsoft/mai-image-2.5-pro",
    arguments={
        "prompt": "A photorealistic concept-art poster of a university campus at sunset, cinematic lighting, a banner reading \"LOUISVILLE\" in bold serif type."
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

const result = await fal.subscribe("microsoft/mai-image-2.5-pro", {
  input: {
    prompt: "A photorealistic concept-art poster of a university campus at sunset, cinematic lighting, a banner reading \"LOUISVILLE\" in bold serif type."
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

- [Model Playground](https://fal.ai/models/microsoft/mai-image-2.5-pro)
- [API Documentation](https://fal.ai/models/microsoft/mai-image-2.5-pro/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=microsoft/mai-image-2.5-pro)

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

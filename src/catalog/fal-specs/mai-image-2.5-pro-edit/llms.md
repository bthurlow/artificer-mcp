# MAI Image 2.5 Pro (Edit)

> Apply precise, controllable edits to a reference image while preserving composition, typography, identity, and fine visual detail.


## Overview

- **Endpoint**: `https://fal.run/microsoft/mai-image-2.5-pro/edit`
- **Model ID**: `microsoft/mai-image-2.5-pro/edit`
- **Category**: image-to-image
- **Kind**: inference
**Description**: MAI Image 2.5 Pro Edit performs instruction-guided image editing with Microsoft's highest-fidelity MAI model. Use one reference image to change objects, materials, lighting, backgrounds, layout, or text while preserving important visual structure. It is designed for hero assets, high-detail refinements, typography fixes, art direction, and production design.

**Tags**: image-editing, typography, photorealism, controllable-editing, multi-image



## Pricing

Text input: **$7.50 / 1M tokens**. Image input: **$162 / 1M tokens**. Image output: **$162 / 1M tokens**. Estimated cost with one input image: **~$0.18–$0.27 per output image**.

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

- **`image_url`** (`string`, _optional_):
  The URL of the image to edit. Provide one http(s) or data: URL. Default value: `""`
  - Default: `""`
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"



**Required Parameters Example**:

```json
{
  "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting."
}
```

**Full Example**:

```json
{
  "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting.",
  "num_images": 1,
  "aspect_ratio": "auto",
  "output_format": "png",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png"
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
  --url https://fal.run/microsoft/mai-image-2.5-pro/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting."
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
    "microsoft/mai-image-2.5-pro/edit",
    arguments={
        "prompt": "Turn this into a clean, futuristic product shot with soft studio lighting."
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

const result = await fal.subscribe("microsoft/mai-image-2.5-pro/edit", {
  input: {
    prompt: "Turn this into a clean, futuristic product shot with soft studio lighting."
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

- [Model Playground](https://fal.ai/models/microsoft/mai-image-2.5-pro/edit)
- [API Documentation](https://fal.ai/models/microsoft/mai-image-2.5-pro/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=microsoft/mai-image-2.5-pro/edit)

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

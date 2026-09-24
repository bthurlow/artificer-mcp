# Flux 2 Flex

> Image editing with FLUX.2 [flex] from Black Forest Labs. Supports multi-reference editing with customizable inference steps and enhanced text rendering.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/flux-2-flex/edit`
- **Model ID**: `fal-ai/flux-2-flex/edit`
- **Category**: image-to-image
- **Kind**: inference


## Pricing

Your request will cost **$0.05** per megapixel on both input and output side, rounded up to the nearest megapixel. For example, a **1024x1024** image will cost **$0.05**, and a **1920x1080** image will cost **$0.10** (**$0.05** × **2** megapixels). Similarly, a **512x512** output will cost **$0.06** (**$0.05** for **0.26** megapixels, rounded to **1** megapixel).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate an image from.
  - Examples: "Change colors of the vase. In a cozy living room setting, visualize a gradient vase placed on a table, flowing from rich #6a0dad to soft #ff69b4. Add an artistic carving text with a big font on vase says \"FLEX\" in the middle."

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. If `auto`, the size will be determined by the model. Default value: `auto`
  - Default: `"auto"`
  - One of: ImageSize | Enum

- **`seed`** (`integer`, _optional_):
  The seed to use for the generation.

- **`safety_tolerance`** (`SafetyToleranceEnum`, _optional_):
  The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive. Default value: `"2"`
  - Default: `"2"`
  - Options: `"1"`, `"2"`, `"3"`, `"4"`, `"5"`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`image_urls`** (`list<string>`, _required_):
  List of URLs of input images for editing
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/flux2_flex_edit_input.png"]

- **`guidance_scale`** (`float`, _optional_):
  The guidance scale to use for the generation. Default value: `3.5`
  - Default: `3.5`
  - Range: `1.5` to `10`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `28`
  - Default: `28`
  - Range: `2` to `50`



**Required Parameters Example**:

```json
{
  "prompt": "Change colors of the vase. In a cozy living room setting, visualize a gradient vase placed on a table, flowing from rich #6a0dad to soft #ff69b4. Add an artistic carving text with a big font on vase says \"FLEX\" in the middle.",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/flux2_flex_edit_input.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Change colors of the vase. In a cozy living room setting, visualize a gradient vase placed on a table, flowing from rich #6a0dad to soft #ff69b4. Add an artistic carving text with a big font on vase says \"FLEX\" in the middle.",
  "image_size": "auto",
  "safety_tolerance": "2",
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/flux2_flex_edit_input.png"
  ],
  "guidance_scale": 3.5,
  "num_inference_steps": 28
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images.
  - Array of ImageFile
  - Examples: [{"url":"https://storage.googleapis.com/falserverless/example_outputs/flux2_flex_edit_output.png"}]

- **`seed`** (`integer`, _required_):
  The seed used for the generation.



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/falserverless/example_outputs/flux2_flex_edit_output.png"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/flux-2-flex/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Change colors of the vase. In a cozy living room setting, visualize a gradient vase placed on a table, flowing from rich #6a0dad to soft #ff69b4. Add an artistic carving text with a big font on vase says \"FLEX\" in the middle.",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/flux2_flex_edit_input.png"
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
    "fal-ai/flux-2-flex/edit",
    arguments={
        "prompt": "Change colors of the vase. In a cozy living room setting, visualize a gradient vase placed on a table, flowing from rich #6a0dad to soft #ff69b4. Add an artistic carving text with a big font on vase says \"FLEX\" in the middle.",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/flux2_flex_edit_input.png"]
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

const result = await fal.subscribe("fal-ai/flux-2-flex/edit", {
  input: {
    prompt: "Change colors of the vase. In a cozy living room setting, visualize a gradient vase placed on a table, flowing from rich #6a0dad to soft #ff69b4. Add an artistic carving text with a big font on vase says \"FLEX\" in the middle.",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/flux2_flex_edit_input.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/flux-2-flex/edit)
- [API Documentation](https://fal.ai/models/fal-ai/flux-2-flex/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2-flex/edit)

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

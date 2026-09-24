# Seedream 5.0 Pro Image Editing

> Seedream 5.0 Pro is grounded, region-precise image editing model that changes one element while keeping the rest of the frame intact with layer separation, sketch completion, and up to 10 reference images.


## Overview

- **Endpoint**: `https://fal.run/bytedance/seedream/v5/pro/edit`
- **Model ID**: `bytedance/seedream/v5/pro/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: realism, typography, stylized



## Pricing

You will be charged for both input and output images. The first input image is not charged, and every additional input image will cost **$0.0045**.   Tentative pricing is **$0.0675+ $(0.0045 x number of additional input images)** per output image for images of total area less than or equal to **1536x1536** pixels. For output images with area in between **1536x1536** and **2048x2048** pixels, the price is **$0.135 + $(0.0045 x number of additional input images)** per image.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used to edit the image.
  - Examples: "Replace the product in Figure 1 with that in Figure 2. Seamlessly render the logo in Figure 3 into the product design, in a frosted glass texture."

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. Total pixels must be between 1024x1024 and 2048x2048, with aspect ratio between 1/16 and 16. Default value: `auto_2K`
  - Default: `"auto_2K"`
  - One of: ImageSize | Enum
  - Examples: "auto_2K"

- **`num_images`** (`integer`, _optional_):
  Number of separate model generations to run with the prompt. Default value: `1`
  - Default: `1`
  - Range: `1` to `6`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The file format of the generated image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`
  - Examples: "jpeg"

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`
  - Examples: true

- **`image_urls`** (`list<string>`, _required_):
  List of URLs of input reference images. Up to 10 images are supported; if more are sent, only the last 10 are used.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_1.png","https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_2.png","https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_3.png"]



**Required Parameters Example**:

```json
{
  "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render the logo in Figure 3 into the product design, in a frosted glass texture.",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_1.png",
    "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_2.png",
    "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_3.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render the logo in Figure 3 into the product design, in a frosted glass texture.",
  "image_size": "auto_2K",
  "num_images": 1,
  "output_format": "jpeg",
  "enable_safety_checker": true,
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_1.png",
    "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_2.png",
    "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_3.png"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  Generated images.
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0aa16df4/L8veDBOTxHhmpO5wQnioS_14c2d9c1736b4803a43796669c6d4fca.png"}]



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0aa16df4/L8veDBOTxHhmpO5wQnioS_14c2d9c1736b4803a43796669c6d4fca.png"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bytedance/seedream/v5/pro/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render the logo in Figure 3 into the product design, in a frosted glass texture.",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_1.png",
       "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_2.png",
       "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_3.png"
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
    "bytedance/seedream/v5/pro/edit",
    arguments={
        "prompt": "Replace the product in Figure 1 with that in Figure 2. Seamlessly render the logo in Figure 3 into the product design, in a frosted glass texture.",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_1.png", "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_2.png", "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_3.png"]
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

const result = await fal.subscribe("bytedance/seedream/v5/pro/edit", {
  input: {
    prompt: "Replace the product in Figure 1 with that in Figure 2. Seamlessly render the logo in Figure 3 into the product design, in a frosted glass texture.",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_1.png", "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_2.png", "https://storage.googleapis.com/falserverless/example_inputs/seedreamv45/seedream_v45_edit_input_3.png"]
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

- [Model Playground](https://fal.ai/models/bytedance/seedream/v5/pro/edit)
- [API Documentation](https://fal.ai/models/bytedance/seedream/v5/pro/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seedream/v5/pro/edit)

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

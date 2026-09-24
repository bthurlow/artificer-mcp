# Nano Banana Pro

> Nano Banana Pro is Google's new state-of-the-art image generation and editing model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/nano-banana-pro/edit`
- **Model ID**: `fal-ai/nano-banana-pro/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: realism, typography



## Pricing

Your request will cost **$0.15** per image. For **$1.00**, you can run this model **7** times. 4K outputs will be charged at double the standard rate. If web search is used, an additional $0.015 will be charged. Note: Pricing may change in the future.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt for image editing.
  - Examples: "make a photo of the man driving the car down the california coastline"

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator.

- **`aspect_ratio`** (`Enum`, _optional_):
  The aspect ratio of the generated image. Default value: `auto`
  - Default: `"auto"`
  - Options: `"auto"`, `"21:9"`, `"16:9"`, `"3:2"`, `"4:3"`, `"5:4"`, `"1:1"`, `"4:5"`, `"3:4"`, `"2:3"`, `"9:16"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`safety_tolerance`** (`SafetyToleranceEnum`, _optional_):
  The safety tolerance level for content moderation. 1 is the most strict (blocks most content), 6 is the least strict. Default value: `"4"`
  - Default: `"4"`
  - Options: `"1"`, `"2"`, `"3"`, `"4"`, `"5"`, `"6"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`image_urls`** (`list<string>`, _required_):
  The URLs of the images to use for image-to-image generation or image editing.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png","https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"]

- **`system_prompt`** (`string`, _optional_):
  Optional system instruction that steers the model's persona and output style across the request. Leave blank to omit; when provided, it is sent as the system instruction to Gemini (or as a system message on OpenAI-compatible providers). Default value: `""`
  - Default: `""`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the image to generate. Default value: `"1K"`
  - Default: `"1K"`
  - Options: `"1K"`, `"2K"`, `"4K"`

- **`limit_generations`** (`boolean`, _optional_):
  Experimental parameter to limit the number of generations from each round of prompting to 1. Set to `True` to to disregard any instructions in the prompt regarding the number of images to generate. Default value: `true`
  - Default: `true`

- **`enable_web_search`** (`boolean`, _optional_):
  Enable web search for the image generation task. This will allow the model to use the latest information from the web to generate the image.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "make a photo of the man driving the car down the california coastline",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png",
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "make a photo of the man driving the car down the california coastline",
  "num_images": 1,
  "aspect_ratio": "auto",
  "output_format": "png",
  "safety_tolerance": "4",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png",
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"
  ],
  "resolution": "1K",
  "limit_generations": true
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The edited images.
  - Array of ImageFile
  - Examples: [{"file_name":"nano-banana-pro-edit-output.png","url":"https://storage.googleapis.com/falserverless/example_outputs/nano-banana-pro-edit-output.png","content_type":"image/png"}]

- **`description`** (`string`, _required_):
  The description of the generated images.



**Example Response**:

```json
{
  "images": [
    {
      "file_name": "nano-banana-pro-edit-output.png",
      "url": "https://storage.googleapis.com/falserverless/example_outputs/nano-banana-pro-edit-output.png",
      "content_type": "image/png"
    }
  ],
  "description": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/nano-banana-pro/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "make a photo of the man driving the car down the california coastline",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png",
       "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"
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
    "fal-ai/nano-banana-pro/edit",
    arguments={
        "prompt": "make a photo of the man driving the car down the california coastline",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png", "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"]
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

const result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
  input: {
    prompt: "make a photo of the man driving the car down the california coastline",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png", "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/nano-banana-pro/edit)
- [API Documentation](https://fal.ai/models/fal-ai/nano-banana-pro/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/nano-banana-pro/edit)

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

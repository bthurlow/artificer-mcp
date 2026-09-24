# Hunyuan Image

> Image editing endpoint for Hunyuan Image 3.0 Instruct.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/hunyuan-image/v3/instruct/edit`
- **Model ID**: `fal-ai/hunyuan-image/v3/instruct/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: tencent, hunyuan-image, instruct, edit



## Pricing

- **Price**: $0.09 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to generate an image from.
  - Examples: "Turn this artwork into a realistic image"

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The desired size of the generated image. If auto, image size will be determined by the model. Default value: `auto`
  - Default: `"auto"`
  - One of: ImageSize | Enum

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`guidance_scale`** (`float`, _optional_):
  Controls how much the model adheres to the prompt. Higher values mean stricter adherence. Default value: `3.5`
  - Default: `3.5`
  - Range: `2` to `20`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  If set to true, the prompt will be expanded through the model's internal recaptioning step. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible results. If None, a random seed is used.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`

- **`image_urls`** (`list<string>`, _required_):
  The URLs of the images to use as a reference for the generation. A maximum of 3 images are supported.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8c3cf9/voXcX8hd5maRSrSvZalXh_jAMqrScj.png"]



**Required Parameters Example**:

```json
{
  "prompt": "Turn this artwork into a realistic image",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8c3cf9/voXcX8hd5maRSrSvZalXh_jAMqrScj.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Turn this artwork into a realistic image",
  "image_size": "auto",
  "num_images": 1,
  "guidance_scale": 3.5,
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "output_format": "png",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8c3cf9/voXcX8hd5maRSrSvZalXh_jAMqrScj.png"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  A list of the generated images.
  - Array of Image
  - Examples: [{"height":1024,"content_type":"image/png","url":"https://v3b.fal.media/files/b/0a8c3d5f/K7ecUzkFaxU-5hvzdhvG-_SOvArpR4.png","width":1024}]

- **`seed`** (`integer`, _required_):
  The base seed used for the generation process.



**Example Response**:

```json
{
  "images": [
    {
      "height": 1024,
      "content_type": "image/png",
      "url": "https://v3b.fal.media/files/b/0a8c3d5f/K7ecUzkFaxU-5hvzdhvG-_SOvArpR4.png",
      "width": 1024
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/hunyuan-image/v3/instruct/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Turn this artwork into a realistic image",
     "image_urls": [
       "https://v3b.fal.media/files/b/0a8c3cf9/voXcX8hd5maRSrSvZalXh_jAMqrScj.png"
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
    "fal-ai/hunyuan-image/v3/instruct/edit",
    arguments={
        "prompt": "Turn this artwork into a realistic image",
        "image_urls": ["https://v3b.fal.media/files/b/0a8c3cf9/voXcX8hd5maRSrSvZalXh_jAMqrScj.png"]
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

const result = await fal.subscribe("fal-ai/hunyuan-image/v3/instruct/edit", {
  input: {
    prompt: "Turn this artwork into a realistic image",
    image_urls: ["https://v3b.fal.media/files/b/0a8c3cf9/voXcX8hd5maRSrSvZalXh_jAMqrScj.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/hunyuan-image/v3/instruct/edit)
- [API Documentation](https://fal.ai/models/fal-ai/hunyuan-image/v3/instruct/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/hunyuan-image/v3/instruct/edit)

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

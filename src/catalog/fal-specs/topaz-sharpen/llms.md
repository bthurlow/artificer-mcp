# Topaz Sharpen Image

> Professional photo sharpening powered by Topaz Labs. Models tuned per blur type (lens, motion, portrait, wildlife), plus Super Focus for generative recovery of severely blurred shots. Best for out-of-focus and motion-blurred photos.


## Overview

- **Endpoint**: `https://fal.run/topaz/sharpen/image`
- **Model ID**: `topaz/sharpen/image`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: sharpen, image



## Pricing

Your request will cost **$0.08** for each started 24 megapixels with the classic sharpen models (Standard, Strong, Lens Blur V2, Motion Blur, Natural, Refocus, Wildlife, Portrait, Auto Sharpen), and **$0.08** for each started 20 megapixels with Super Focus V3 or V2 (generative deblur). Output keeps the source resolution. For example, a 12-megapixel image costs **$0.08** with either family; a 24-megapixel image costs **$0.08** with a classic model or **$0.16** with Super Focus.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Url of the image to process
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output format of the processed image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`

- **`model`** (`ModelEnum`, _optional_):
  Sharpen model tuned per blur type (defocus, motion, portrait, wildlife, …). Super Focus is Topaz's generative deblur for severely blurred images. Default value: `"Standard"`
  - Default: `"Standard"`
  - Options: `"Standard"`, `"Strong"`, `"Lens Blur V2"`, `"Motion Blur"`, `"Natural"`, `"Refocus"`, `"Wildlife"`, `"Portrait"`, `"Auto Sharpen"`, `"Super Focus V3"`, `"Super Focus V2"`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
}
```

**Full Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg",
  "output_format": "jpeg",
  "model": "Standard"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`File`, _required_):
  The upscaled image.



**Example Response**:

```json
{
  "image": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/topaz/sharpen/image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
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
    "topaz/sharpen/image",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
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

const result = await fal.subscribe("topaz/sharpen/image", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
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

- [Model Playground](https://fal.ai/models/topaz/sharpen/image)
- [API Documentation](https://fal.ai/models/topaz/sharpen/image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/sharpen/image)

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

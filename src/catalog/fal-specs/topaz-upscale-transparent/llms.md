# Topaz Upscale Image Transparent

> Professional transparent-image upscaling powered by Topaz Labs. Preserves the alpha channel end to end with PNG output. Best for logos, stickers and assets with transparency.


## Overview

- **Endpoint**: `https://fal.run/topaz/upscale/image/transparent`
- **Model ID**: `topaz/upscale/image/transparent`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: upscale, image



## Pricing

Transparent Upscale always produces a fixed 4× enlargement in width and height (16× the source pixel area) and preserves the alpha channel in PNG. Your request will cost **$0.08** per started 24 megapixels of output. For example, 1024×1024 becomes 4096×4096 and costs **$0.08**; 2000×2000 becomes 8000×8000 and costs **$0.24**; 3000×2000 becomes 12000×8000 and costs **$0.32**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Url of the image to process
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"

- **`output_format`** (`string`, _optional_):
  Transparent upscaling always outputs PNG to preserve the alpha channel. Default value: `"png"`
  - Default: `"png"`



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
  "output_format": "png"
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
  --url https://fal.run/topaz/upscale/image/transparent \
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
    "topaz/upscale/image/transparent",
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

const result = await fal.subscribe("topaz/upscale/image/transparent", {
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

- [Model Playground](https://fal.ai/models/topaz/upscale/image/transparent)
- [API Documentation](https://fal.ai/models/topaz/upscale/image/transparent/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/upscale/image/transparent)

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

# Bria Increase Resolution: Upscale Images up to 4x Without Losing Detail | fal

> Upscale any image 2x or 4x, up to 8192×8192, with Bria Increase Resolution. Preserves the original content — no regeneration, no altered details. Commercial-safe


## Overview

- **Endpoint**: `https://fal.run/bria/increase-resolution`
- **Model ID**: `bria/increase-resolution`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: utility, editing



## Pricing

Your request will cost **$0.04** per image.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the image to upscale.
  - Examples: "https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_input_1000x1250.png"

- **`desired_increase`** (`DesiredIncreaseEnum`, _optional_):
  Upscale factor. Each factor is its own SwinIR checkpoint. Default value: `"2"`
  - Default: `2`
  - Options: `2`, `4`

- **`preserve_alpha`** (`boolean`, _optional_):
  Reattach the source alpha channel to the result. Default value: `true`
  - Default: `true`

- **`preserve_color`** (`boolean`, _optional_):
  Correct the upscaled result's color cast against the source image.
  - Default: `false`

- **`output_type`** (`OutputTypeEnum`, _optional_):
  Image format. JPEG carries no alpha, so preserve_alpha does not apply. Default value: `"png"`
  - Default: `"png"`
  - Options: `"png"`, `"jpeg"`

- **`sync_mode`** (`boolean`, _optional_):
  Return the image inline instead of as a URL.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_input_1000x1250.png"
}
```

**Full Example**:

```json
{
  "image_url": "https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_input_1000x1250.png",
  "desired_increase": 2,
  "preserve_alpha": true,
  "output_type": "png"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  The upscaled image.
  - Examples: {"height":2500,"url":"https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_upscaled_2x_2000x2500.png","content_type":"image/png","width":2000}



**Example Response**:

```json
{
  "image": {
    "height": 2500,
    "url": "https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_upscaled_2x_2000x2500.png",
    "content_type": "image/png",
    "width": 2000
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/increase-resolution \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_input_1000x1250.png"
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
    "bria/increase-resolution",
    arguments={
        "image_url": "https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_input_1000x1250.png"
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

const result = await fal.subscribe("bria/increase-resolution", {
  input: {
    image_url: "https://bria-test-images.s3.amazonaws.com/increase_res/playground/sample_input_1000x1250.png"
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

- [Model Playground](https://fal.ai/models/bria/increase-resolution)
- [API Documentation](https://fal.ai/models/bria/increase-resolution/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/increase-resolution)

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

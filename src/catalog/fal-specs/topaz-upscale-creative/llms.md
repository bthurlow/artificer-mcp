# Topaz Upscale Image Creative

> Professional creative image upscaling powered by Topaz Labs. Bloom 2 reinvents detail with adjustable creativity and color preservation. Best for AI-generated images that need striking enhancement.


## Overview

- **Endpoint**: `https://fal.run/topaz/upscale/image/creative`
- **Model ID**: `topaz/upscale/image/creative`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: upscale, image



## Pricing

Your request will cost **$0.08** per started 2 megapixels of output with Bloom 2, Bloom, or Bloom Realism. For example, a 24 MP output costs **$0.96**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Url of the image to be upscaled
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"

- **`model`** (`ModelEnum`, _optional_):
  Creative (Bloom) upscaling model. Bloom 2 is the latest and most capable; Bloom creatively upscales and transforms AI-generated images; Bloom Realism biases the added detail toward photorealism. Default value: `"Bloom 2"`
  - Default: `"Bloom 2"`
  - Options: `"Bloom 2"`, `"Bloom"`, `"Bloom Realism"`

- **`upscale_factor`** (`float`, _optional_):
  Factor to upscale the image by (e.g. 2.0 doubles width and height) Default value: `2`
  - Default: `2`
  - Range: `1` to `4`

- **`autoprompt`** (`boolean`, _optional_):
  Enable automatic prompt generation. Applies to Bloom 2 only; Topaz defaults it to true when omitted.

- **`creativity`** (`integer`, _optional_):
  Creativity level (1-9). Higher values produce more creative/hallucinated details. Applies to Bloom 2 only.
  - Range: `1` to `9`

- **`color_preservation`** (`boolean`, _optional_):
  Preserve the source image's colors in the output. Applies to Bloom 2 only.

- **`crop_to_fill`** (`boolean`, _optional_)
  - Default: `false`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output format of the upscaled image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`



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
  "model": "Bloom 2",
  "upscale_factor": 2,
  "output_format": "jpeg"
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
  --url https://fal.run/topaz/upscale/image/creative \
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
    "topaz/upscale/image/creative",
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

const result = await fal.subscribe("topaz/upscale/image/creative", {
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

- [Model Playground](https://fal.ai/models/topaz/upscale/image/creative)
- [API Documentation](https://fal.ai/models/topaz/upscale/image/creative/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/upscale/image/creative)

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

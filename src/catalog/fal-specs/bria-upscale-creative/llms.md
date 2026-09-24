# Upscale

> Professional-grade creative upscaler that doubles resolution up to 10MP, regenerating sharper textures, refined details, and cleaner faces. Trained exclusively on licensed data for risk-free commercial use.


## Overview

- **Endpoint**: `https://fal.run/bria/upscale/creative`
- **Model ID**: `bria/upscale/creative`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: bria, aesthetics, upscaler



## Pricing

- **Price**: $0.04 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _optional_):
   Default value: `"https://bria-datasets.s3.us-east-1.amazonaws.com/upscale/wild-west.png"`
  - Default: `"https://bria-datasets.s3.us-east-1.amazonaws.com/upscale/wild-west.png"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Default value: `5555`
  - Default: `5555`

- **`preserve_alpha`** (`boolean`, _optional_):
  Preserve alpha channel from input image. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If true, returns the image directly in the response (increases latency).
  - Default: `false`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "image_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/upscale/wild-west.png",
  "seed": 5555,
  "preserve_alpha": true
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  Generated image.
  - Examples: {"height":1792,"content_type":"image/png","url":"https://bria-datasets.s3.us-east-1.amazonaws.com/upscale/wilder-west.png","width":2304}



**Example Response**:

```json
{
  "image": {
    "height": 1792,
    "content_type": "image/png",
    "url": "https://bria-datasets.s3.us-east-1.amazonaws.com/upscale/wilder-west.png",
    "width": 2304
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/upscale/creative \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
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
    "bria/upscale/creative",
    arguments={},
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

const result = await fal.subscribe("bria/upscale/creative", {
  input: {},
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

- [Model Playground](https://fal.ai/models/bria/upscale/creative)
- [API Documentation](https://fal.ai/models/bria/upscale/creative/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/upscale/creative)

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

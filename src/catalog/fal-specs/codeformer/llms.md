# CodeFormer

> Fix distorted or blurred photos of people with CodeFormer.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/codeformer`
- **Model ID**: `fal-ai/codeformer`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: image-restoration, faces, utility



## Pricing

- **Price**: $0.0021 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of image to be used for relighting
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"

- **`fidelity`** (`float`, _optional_):
  Weight of the fidelity factor. Default value: `0.5`
  - Default: `0.5`

- **`upscale_factor`** (`float`, _optional_):
  Upscaling factor Default value: `2`
  - Default: `2`

- **`aligned`** (`boolean`, _optional_):
  Should faces etc should be aligned.
  - Default: `false`

- **`only_center_face`** (`boolean`, _optional_):
  Should only center face be restored
  - Default: `false`

- **`face_upscale`** (`boolean`, _optional_):
  Should faces be upscaled Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation.



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
  "fidelity": 0.5,
  "upscale_factor": 2,
  "face_upscale": true
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  The generated image file info.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_restored_1.jpeg","height":512,"content_type":"image/png","file_size":423052,"file_name":"36d3ca4791a647678b2ff01a35c87f5a.png","width":512}

- **`seed`** (`integer`, _required_):
  Seed of the generated Image. It will be the same value of the one passed in the
  input or the randomly generated that was used in case none was passed.



**Example Response**:

```json
{
  "image": {
    "url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_restored_1.jpeg",
    "height": 512,
    "content_type": "image/png",
    "file_size": 423052,
    "file_name": "36d3ca4791a647678b2ff01a35c87f5a.png",
    "width": 512
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/codeformer \
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
    "fal-ai/codeformer",
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

const result = await fal.subscribe("fal-ai/codeformer", {
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

- [Model Playground](https://fal.ai/models/fal-ai/codeformer)
- [API Documentation](https://fal.ai/models/fal-ai/codeformer/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/codeformer)

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

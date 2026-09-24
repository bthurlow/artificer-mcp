# Luma Uni-1 Edit Max

> Luma Uni-1 Max Edit applies text-guided edits to a source image at maximum fidelity, holding the original structure while honoring reference images for precise, high-detail revisions.


## Overview

- **Endpoint**: `https://fal.run/luma/agent/uni-1/v1/max/edit`
- **Model ID**: `luma/agent/uni-1/v1/max/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: realism, typography, stylized



## Pricing

Each edit costs **$0.102** plus **$0.003** per reference/source image. A single-image edit runs **$0.105**. For **$1** you can run this model approximately **9** times.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the edit to apply.
  - Examples: "Replace the background with a sunset over the ocean."

- **`image_url`** (`string`, _required_):
  URL of the source image to edit.
  - Examples: "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png"

- **`style`** (`StyleEnum`, _optional_):
  Visual style of the edited image. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"manga"`

- **`output_format`** (`Enum`, _optional_):
  Encoding format of the edited image.
  - Options: `"png"`, `"jpeg"`

- **`reference_image_urls`** (`list<string>`, _optional_):
  Optional list of reference image URLs used to guide the edit.
  - Array of string



**Required Parameters Example**:

```json
{
  "prompt": "Replace the background with a sunset over the ocean.",
  "image_url": "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png"
}
```

**Full Example**:

```json
{
  "prompt": "Replace the background with a sunset over the ocean.",
  "image_url": "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png",
  "style": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_):
  The generated image(s).
  - Array of File



**Example Response**:

```json
{
  "images": [
    {
      "url": "",
      "content_type": "image/png",
      "file_name": "z9RV14K95DvU.png",
      "file_size": 4404019
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/luma/agent/uni-1/v1/max/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Replace the background with a sunset over the ocean.",
     "image_url": "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png"
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
    "luma/agent/uni-1/v1/max/edit",
    arguments={
        "prompt": "Replace the background with a sunset over the ocean.",
        "image_url": "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png"
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

const result = await fal.subscribe("luma/agent/uni-1/v1/max/edit", {
  input: {
    prompt: "Replace the background with a sunset over the ocean.",
    image_url: "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png"
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

- [Model Playground](https://fal.ai/models/luma/agent/uni-1/v1/max/edit)
- [API Documentation](https://fal.ai/models/luma/agent/uni-1/v1/max/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=luma/agent/uni-1/v1/max/edit)

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

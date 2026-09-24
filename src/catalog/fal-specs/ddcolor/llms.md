# DDColor

> Bring colors into old or new black and white photos with DDColor.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ddcolor`
- **Model ID**: `fal-ai/ddcolor`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: image-recolorization, faces, utility



## Pricing

- **Price**: $0.001 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of image to be used for relighting
  - Examples: "https://storage.googleapis.com/falserverless/gallery/Screenshot%202025-02-26%20154226.png"

- **`seed`** (`integer`, _optional_):
  seed to be used for generation



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/gallery/Screenshot%202025-02-26%20154226.png"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  The generated image file info.
  - Examples: {"content_type":"image/png","file_size":423052,"width":512,"file_name":"36d3ca4791a647678b2ff01a35c87f5a.png","height":512,"url":"https://storage.googleapis.com/falserverless/gallery/5fcaaac6d1344d998ebb9703102c6c63.png"}



**Example Response**:

```json
{
  "image": {
    "content_type": "image/png",
    "file_size": 423052,
    "width": 512,
    "file_name": "36d3ca4791a647678b2ff01a35c87f5a.png",
    "height": 512,
    "url": "https://storage.googleapis.com/falserverless/gallery/5fcaaac6d1344d998ebb9703102c6c63.png"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ddcolor \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/gallery/Screenshot%202025-02-26%20154226.png"
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
    "fal-ai/ddcolor",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/gallery/Screenshot%202025-02-26%20154226.png"
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

const result = await fal.subscribe("fal-ai/ddcolor", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/gallery/Screenshot%202025-02-26%20154226.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/ddcolor)
- [API Documentation](https://fal.ai/models/fal-ai/ddcolor/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ddcolor)

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

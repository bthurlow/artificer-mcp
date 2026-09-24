# Google Virtual Try On

> Generate realistic virtual try-on images from a person image and a clothing product image.


## Overview

- **Endpoint**: `https://fal.run/google/virtual-try-on`
- **Model ID**: `google/virtual-try-on`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: virtual, try, clothes



## Pricing

Your request will cost  **$0.075** per generated image.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`person_image_url`** (`string`, _required_):
  The URL of the image of the person trying on the product.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/leffa/person_image.jpg"

- **`product_image_url`** (`string`, _required_):
  The URL of the product image to try on.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/leffa/tshirt_image.jpg"

- **`num_images`** (`integer`, _optional_):
  The number of virtual try-on images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`



**Required Parameters Example**:

```json
{
  "person_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/person_image.jpg",
  "product_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/tshirt_image.jpg"
}
```

**Full Example**:

```json
{
  "person_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/person_image.jpg",
  "product_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/tshirt_image.jpg",
  "num_images": 1
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated virtual try-on images.
  - Array of ImageFile



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
  --url https://fal.run/google/virtual-try-on \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "person_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/person_image.jpg",
     "product_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/tshirt_image.jpg"
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
    "google/virtual-try-on",
    arguments={
        "person_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/person_image.jpg",
        "product_image_url": "https://storage.googleapis.com/falserverless/model_tests/leffa/tshirt_image.jpg"
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

const result = await fal.subscribe("google/virtual-try-on", {
  input: {
    person_image_url: "https://storage.googleapis.com/falserverless/model_tests/leffa/person_image.jpg",
    product_image_url: "https://storage.googleapis.com/falserverless/model_tests/leffa/tshirt_image.jpg"
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

- [Model Playground](https://fal.ai/models/google/virtual-try-on)
- [API Documentation](https://fal.ai/models/google/virtual-try-on/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=google/virtual-try-on)

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

# Feynobg Background Remover

> FeyNobg is a state of the art AI model for background removal from feyninc


## Overview

- **Endpoint**: `https://fal.run/fal-ai/feynobg`
- **Model ID**: `fal-ai/feynobg`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: utility, editing



## Pricing

- **Price**: $0.001 per generations

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the image to remove the background from.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"

- **`seed`** (`integer`, _optional_):
  Seed used for reproducible inference.

- **`sync_mode`** (`boolean`, _optional_):
  If true, the output is returned as a data URI and is not stored in request history.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  The background-removed image with a transparent alpha channel.

- **`seed`** (`integer`, _required_):
  Seed used for reproducible inference.



**Example Response**:

```json
{
  "image": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019,
    "width": 1024,
    "height": 1024
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/feynobg \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
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
    "fal-ai/feynobg",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
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

const result = await fal.subscribe("fal-ai/feynobg", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
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

- [Model Playground](https://fal.ai/models/fal-ai/feynobg)
- [API Documentation](https://fal.ai/models/fal-ai/feynobg/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/feynobg)

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

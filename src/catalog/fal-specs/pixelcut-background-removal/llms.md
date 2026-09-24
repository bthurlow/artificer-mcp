# Pixelcut Background Remover

> Pixelcut’s Background Remover enables fast, ultra high-quality removal of backgrounds from images. Perfect for e-commerce and image editing workflows. Powered by advanced AI for clean, perfect cutouts every time.


## Overview

- **Endpoint**: `https://fal.run/pixelcut/background-removal`
- **Model ID**: `pixelcut/background-removal`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: background removal, utility, remove background



## Pricing

- **Price**: $0.016 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Input image (JPEG or PNG)
  - Examples: "https://cdn3.pixelcut.app/fal/background-remover/jewelry.jpg", "https://cdn3.pixelcut.app/fal/background-remover/portrait.jpg"

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output format Default value: `"rgba"`
  - Default: `"rgba"`
  - Options: `"rgba"`, `"alpha"`, `"zip"`

- **`sync_mode`** (`boolean`, _optional_):
  When true, return result as a data URL instead of uploading to storage Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "image_url": "https://cdn3.pixelcut.app/fal/background-remover/jewelry.jpg"
}
```

**Full Example**:

```json
{
  "image_url": "https://cdn3.pixelcut.app/fal/background-remover/jewelry.jpg",
  "output_format": "rgba",
  "sync_mode": true
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _optional_):
  Result image (for rgba/alpha output formats)
  - Examples: {"url":"https://cdn3.pixelcut.app/fal/background-remover/jewelry_result.png"}, {"url":"https://cdn3.pixelcut.app/fal/background-remover/portrait_result.png"}

- **`file`** (`File`, _optional_):
  Result file (for zip output format)



**Example Response**:

```json
{
  "image": {
    "url": "https://cdn3.pixelcut.app/fal/background-remover/jewelry_result.png"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/pixelcut/background-removal \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://cdn3.pixelcut.app/fal/background-remover/jewelry.jpg"
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
    "pixelcut/background-removal",
    arguments={
        "image_url": "https://cdn3.pixelcut.app/fal/background-remover/jewelry.jpg"
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

const result = await fal.subscribe("pixelcut/background-removal", {
  input: {
    image_url: "https://cdn3.pixelcut.app/fal/background-remover/jewelry.jpg"
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

- [Model Playground](https://fal.ai/models/pixelcut/background-removal)
- [API Documentation](https://fal.ai/models/pixelcut/background-removal/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=pixelcut/background-removal)

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

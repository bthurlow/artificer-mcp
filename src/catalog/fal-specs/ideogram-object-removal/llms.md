# Ideogram Object Removal

> Prompt-free object removal from an image and mask, erasing objects with their shadows and reflections and reconstructing the scene cleanly.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ideogram/object-removal`
- **Model ID**: `fal-ai/ideogram/object-removal`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: utility, editing



## Pricing

Your request will cost **$0.03** per generation.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The source image containing the object to remove (maximum file size 10MB).
  - Examples: "https://v3.fal.media/files/panda/-LC_gNNV3wUHaGMQT3klE_output.png"

- **`mask_url`** (`string`, _required_):
  A black-and-white mask matching the source image dimensions. White pixels are removed and black pixels are preserved (maximum file size 10MB).
  - Examples: "https://v3.fal.media/files/kangaroo/1dd3zEL5MXQ3Kb4-mRi9d_indir%20(20).png"

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3.fal.media/files/panda/-LC_gNNV3wUHaGMQT3klE_output.png",
  "mask_url": "https://v3.fal.media/files/kangaroo/1dd3zEL5MXQ3Kb4-mRi9d_indir%20(20).png"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`File`, _required_):
  The image with the masked object removed.
  - Examples: {"url":"https://v3.fal.media/files/panda/xr7EI_0X5kM8fDOjjcMei_image.png"}



**Example Response**:

```json
{
  "image": {
    "url": "https://v3.fal.media/files/panda/xr7EI_0X5kM8fDOjjcMei_image.png"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ideogram/object-removal \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3.fal.media/files/panda/-LC_gNNV3wUHaGMQT3klE_output.png",
     "mask_url": "https://v3.fal.media/files/kangaroo/1dd3zEL5MXQ3Kb4-mRi9d_indir%20(20).png"
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
    "fal-ai/ideogram/object-removal",
    arguments={
        "image_url": "https://v3.fal.media/files/panda/-LC_gNNV3wUHaGMQT3klE_output.png",
        "mask_url": "https://v3.fal.media/files/kangaroo/1dd3zEL5MXQ3Kb4-mRi9d_indir%20(20).png"
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

const result = await fal.subscribe("fal-ai/ideogram/object-removal", {
  input: {
    image_url: "https://v3.fal.media/files/panda/-LC_gNNV3wUHaGMQT3klE_output.png",
    mask_url: "https://v3.fal.media/files/kangaroo/1dd3zEL5MXQ3Kb4-mRi9d_indir%20(20).png"
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

- [Model Playground](https://fal.ai/models/fal-ai/ideogram/object-removal)
- [API Documentation](https://fal.ai/models/fal-ai/ideogram/object-removal/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ideogram/object-removal)

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

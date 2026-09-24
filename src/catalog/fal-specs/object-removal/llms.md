# Object Removal

> Removes objects and their visual effects using natural language, replacing them with contextually appropriate content


## Overview

- **Endpoint**: `https://fal.run/fal-ai/object-removal`
- **Model ID**: `fal-ai/object-removal`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: utility, editing



## Pricing

Your request will cost **$0.006** with **Low Quality**, **$0.012** with **Medium Quality**, **$0.018** with **High Quality**, and **$0.024** with **Best Quality**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The URL of the image to remove objects from.
  - Examples: "https://v3.fal.media/files/zebra/o0DORfJawy-T9P_-NsvLY.png"

- **`prompt`** (`string`, _required_):
  Text description of the object to remove.
  - Examples: "Dog"

- **`model`** (`ModelEnum`, _optional_):
   Default value: `"best_quality"`
  - Default: `"best_quality"`
  - Options: `"low_quality"`, `"medium_quality"`, `"high_quality"`, `"best_quality"`

- **`mask_expansion`** (`integer`, _optional_):
  Amount of pixels to expand the mask by. Range: 0-50 Default value: `15`
  - Default: `15`
  - Range: `0` to `50`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3.fal.media/files/zebra/o0DORfJawy-T9P_-NsvLY.png",
  "prompt": "Dog"
}
```

**Full Example**:

```json
{
  "image_url": "https://v3.fal.media/files/zebra/o0DORfJawy-T9P_-NsvLY.png",
  "prompt": "Dog",
  "model": "best_quality",
  "mask_expansion": 15
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  The generated images with objects removed.
  - Array of Image
  - Examples: [{"file_name":"85a2309b2c954c85a75120e664adbe17.png","content_type":"image/png","url":"https://v3.fal.media/files/lion/arYSoJeqWjhbcA8o4budv_85a2309b2c954c85a75120e664adbe17.png","file_size":730703,"width":1024,"height":768}]



**Example Response**:

```json
{
  "images": [
    {
      "file_name": "85a2309b2c954c85a75120e664adbe17.png",
      "content_type": "image/png",
      "url": "https://v3.fal.media/files/lion/arYSoJeqWjhbcA8o4budv_85a2309b2c954c85a75120e664adbe17.png",
      "file_size": 730703,
      "width": 1024,
      "height": 768
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/object-removal \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3.fal.media/files/zebra/o0DORfJawy-T9P_-NsvLY.png",
     "prompt": "Dog"
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
    "fal-ai/object-removal",
    arguments={
        "image_url": "https://v3.fal.media/files/zebra/o0DORfJawy-T9P_-NsvLY.png",
        "prompt": "Dog"
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

const result = await fal.subscribe("fal-ai/object-removal", {
  input: {
    image_url: "https://v3.fal.media/files/zebra/o0DORfJawy-T9P_-NsvLY.png",
    prompt: "Dog"
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

- [Model Playground](https://fal.ai/models/fal-ai/object-removal)
- [API Documentation](https://fal.ai/models/fal-ai/object-removal/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/object-removal)

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

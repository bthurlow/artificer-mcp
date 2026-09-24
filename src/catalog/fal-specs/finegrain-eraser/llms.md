# Finegrain Eraser

> Finegrain Eraser removes objects—along with their shadows, reflections, and lighting artifacts—using only natural language, seamlessly filling the scene with contextually accurate content.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/finegrain-eraser`
- **Model ID**: `fal-ai/finegrain-eraser`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: utility, editing



## Pricing

Your request will cost **$0.18** with Express, **$0.27** with Standard, and **$0.36** with Premium.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the image to edit
  - Examples: "https://v3.fal.media/files/elephant/IKqKIxDfRDK8fzeETCveO_erase_example01.jpg"

- **`prompt`** (`string`, _required_):
  Text description of what to erase
  - Examples: "person on the right and snowboard"

- **`mode`** (`ModeEnum`, _optional_):
  Erase quality mode Default value: `"standard"`
  - Default: `"standard"`
  - Options: `"express"`, `"standard"`, `"premium"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation
  - Range: `0` to `999`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3.fal.media/files/elephant/IKqKIxDfRDK8fzeETCveO_erase_example01.jpg",
  "prompt": "person on the right and snowboard"
}
```

**Full Example**:

```json
{
  "image_url": "https://v3.fal.media/files/elephant/IKqKIxDfRDK8fzeETCveO_erase_example01.jpg",
  "prompt": "person on the right and snowboard",
  "mode": "standard"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`File`, _required_):
  The edited image with content erased
  - Examples: {"url":"https://v3.fal.media/files/penguin/PpROj5BGoWMj0H6wb11aG_output.jpg"}

- **`used_seed`** (`integer`, _required_):
  Seed used for generation



**Example Response**:

```json
{
  "image": {
    "url": "https://v3.fal.media/files/penguin/PpROj5BGoWMj0H6wb11aG_output.jpg"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/finegrain-eraser \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3.fal.media/files/elephant/IKqKIxDfRDK8fzeETCveO_erase_example01.jpg",
     "prompt": "person on the right and snowboard"
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
    "fal-ai/finegrain-eraser",
    arguments={
        "image_url": "https://v3.fal.media/files/elephant/IKqKIxDfRDK8fzeETCveO_erase_example01.jpg",
        "prompt": "person on the right and snowboard"
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

const result = await fal.subscribe("fal-ai/finegrain-eraser", {
  input: {
    image_url: "https://v3.fal.media/files/elephant/IKqKIxDfRDK8fzeETCveO_erase_example01.jpg",
    prompt: "person on the right and snowboard"
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

- [Model Playground](https://fal.ai/models/fal-ai/finegrain-eraser)
- [API Documentation](https://fal.ai/models/fal-ai/finegrain-eraser/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/finegrain-eraser)

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

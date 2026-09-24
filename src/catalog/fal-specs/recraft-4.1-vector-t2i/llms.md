# Recraft V4.1 Text to Vector

> Recraft V4.1 Vector turns prompts into fully editable SVGs with structured layers and clean geometry. Built for logos, icons, and illustration systems, it produces artwork that goes straight from generation into Figma or Illustrator.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/recraft/v4.1/text-to-vector`
- **Model ID**: `fal-ai/recraft/v4.1/text-to-vector`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: stylized, transform, typography



## Pricing

- **Price**: $0.08 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "a cute character fox with cool clothes, 3d flat color, design"

- **`image_size`** (`ImageSize | Enum`, _optional_):
   Default value: `square_hd`
  - Default: `"square_hd"`
  - One of: ImageSize | Enum
  - Examples: "landscape_16_9"

- **`colors`** (`list<RGBColor>`, _optional_):
  An array of preferable colors
  - Default: `[]`
  - Array of RGBColor

- **`background_color`** (`RGBColor`, _optional_):
  The preferable background color of the generated images.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "a cute character fox with cool clothes, 3d flat color, design"
}
```

**Full Example**:

```json
{
  "prompt": "a cute character fox with cool clothes, 3d flat color, design",
  "image_size": "landscape_16_9",
  "colors": [],
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_)
  - Array of File
  - Examples: [{"file_size":1722022,"content_type":"image/svg+xml","file_name":"image.svg","url":"https://v3b.fal.media/files/b/0a8ee4fd/sw8YD36iblpO64JeQZEDt_image.svg"}]



**Example Response**:

```json
{
  "images": [
    {
      "file_size": 1722022,
      "content_type": "image/svg+xml",
      "file_name": "image.svg",
      "url": "https://v3b.fal.media/files/b/0a8ee4fd/sw8YD36iblpO64JeQZEDt_image.svg"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/recraft/v4.1/text-to-vector \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "a cute character fox with cool clothes, 3d flat color, design"
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
    "fal-ai/recraft/v4.1/text-to-vector",
    arguments={
        "prompt": "a cute character fox with cool clothes, 3d flat color, design"
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

const result = await fal.subscribe("fal-ai/recraft/v4.1/text-to-vector", {
  input: {
    prompt: "a cute character fox with cool clothes, 3d flat color, design"
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

- [Model Playground](https://fal.ai/models/fal-ai/recraft/v4.1/text-to-vector)
- [API Documentation](https://fal.ai/models/fal-ai/recraft/v4.1/text-to-vector/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/recraft/v4.1/text-to-vector)

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

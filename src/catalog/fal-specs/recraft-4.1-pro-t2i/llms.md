# Recraft V4.1 Text to Image Pro

> Recraft V4.1 Pro pushes the V4.1 model into high-resolution territory — up to 2048×2048 and ultra-wide formats. Made for hero imagery, campaign work, and print, it preserves the same design taste at sizes ready for the final deliverable.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/recraft/v4.1/pro/text-to-image`
- **Model ID**: `fal-ai/recraft/v4.1/pro/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: stylized, transform, typography



## Pricing

- **Price**: $0.21 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "Crash zoom frozen at the moment of impact as a kingfisher breaks the surface of a pond, water crown splash forming a perfect circle, the bird's beak piercing the mirror-like surface, fish visible just below, frozen at 1/8000s, 400mm super telephoto with 2x extender, ring flash fill, pre-dawn blue light with single shaft of gold, BBC Frozen Planet production quality"

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
  "prompt": "Crash zoom frozen at the moment of impact as a kingfisher breaks the surface of a pond, water crown splash forming a perfect circle, the bird's beak piercing the mirror-like surface, fish visible just below, frozen at 1/8000s, 400mm super telephoto with 2x extender, ring flash fill, pre-dawn blue light with single shaft of gold, BBC Frozen Planet production quality"
}
```

**Full Example**:

```json
{
  "prompt": "Crash zoom frozen at the moment of impact as a kingfisher breaks the surface of a pond, water crown splash forming a perfect circle, the bird's beak piercing the mirror-like surface, fish visible just below, frozen at 1/8000s, 400mm super telephoto with 2x extender, ring flash fill, pre-dawn blue light with single shaft of gold, BBC Frozen Planet production quality",
  "image_size": "landscape_16_9",
  "colors": [],
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_)
  - Array of File
  - Examples: [{"file_size":1949504,"content_type":"image/webp","file_name":"image.webp","url":"https://storage.googleapis.com/falserverless/example_outputs/recraft-v4/pro-output.webp"}]



**Example Response**:

```json
{
  "images": [
    {
      "file_size": 1949504,
      "content_type": "image/webp",
      "file_name": "image.webp",
      "url": "https://storage.googleapis.com/falserverless/example_outputs/recraft-v4/pro-output.webp"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/recraft/v4.1/pro/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Crash zoom frozen at the moment of impact as a kingfisher breaks the surface of a pond, water crown splash forming a perfect circle, the bird's beak piercing the mirror-like surface, fish visible just below, frozen at 1/8000s, 400mm super telephoto with 2x extender, ring flash fill, pre-dawn blue light with single shaft of gold, BBC Frozen Planet production quality"
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
    "fal-ai/recraft/v4.1/pro/text-to-image",
    arguments={
        "prompt": "Crash zoom frozen at the moment of impact as a kingfisher breaks the surface of a pond, water crown splash forming a perfect circle, the bird's beak piercing the mirror-like surface, fish visible just below, frozen at 1/8000s, 400mm super telephoto with 2x extender, ring flash fill, pre-dawn blue light with single shaft of gold, BBC Frozen Planet production quality"
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

const result = await fal.subscribe("fal-ai/recraft/v4.1/pro/text-to-image", {
  input: {
    prompt: "Crash zoom frozen at the moment of impact as a kingfisher breaks the surface of a pond, water crown splash forming a perfect circle, the bird's beak piercing the mirror-like surface, fish visible just below, frozen at 1/8000s, 400mm super telephoto with 2x extender, ring flash fill, pre-dawn blue light with single shaft of gold, BBC Frozen Planet production quality"
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

- [Model Playground](https://fal.ai/models/fal-ai/recraft/v4.1/pro/text-to-image)
- [API Documentation](https://fal.ai/models/fal-ai/recraft/v4.1/pro/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/recraft/v4.1/pro/text-to-image)

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

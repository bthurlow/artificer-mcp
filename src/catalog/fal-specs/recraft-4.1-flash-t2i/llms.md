# Recraft V4.1 Flash Text to Image

> Recraft V4.1 Flash generates raster images from text prompts, including photography, illustrations, and mixed-media compositions, with controls for image size, color palette, and background color.


## Overview

- **Endpoint**: `https://fal.run/recraft/v4.1/flash/text-to-image`
- **Model ID**: `recraft/v4.1/flash/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: photography, editorial, illustration, mixed media



## Pricing

Billing is calculated per generated image at **$0.007 per image**. Generating **100 images** costs **$0.70**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "Tilt-shift miniature effect on a real Portuguese fishing village at golden hour, colorful boats in the harbor appearing toy-like, selective focus band across the middle, saturated primary colors of blue red and yellow boats against white buildings, 90mm tilt-shift lens, the familiar made fantastical, Wes Anderson color sensibility"

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
  "prompt": "Tilt-shift miniature effect on a real Portuguese fishing village at golden hour, colorful boats in the harbor appearing toy-like, selective focus band across the middle, saturated primary colors of blue red and yellow boats against white buildings, 90mm tilt-shift lens, the familiar made fantastical, Wes Anderson color sensibility"
}
```

**Full Example**:

```json
{
  "prompt": "Tilt-shift miniature effect on a real Portuguese fishing village at golden hour, colorful boats in the harbor appearing toy-like, selective focus band across the middle, saturated primary colors of blue red and yellow boats against white buildings, 90mm tilt-shift lens, the familiar made fantastical, Wes Anderson color sensibility",
  "image_size": "landscape_16_9",
  "colors": [],
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_)
  - Array of File
  - Examples: [{"file_size":272628,"content_type":"image/webp","file_name":"image.webp","url":"https://storage.googleapis.com/falserverless/example_outputs/recraft-v4/standard-output.webp"}]



**Example Response**:

```json
{
  "images": [
    {
      "file_size": 272628,
      "content_type": "image/webp",
      "file_name": "image.webp",
      "url": "https://storage.googleapis.com/falserverless/example_outputs/recraft-v4/standard-output.webp"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/recraft/v4.1/flash/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Tilt-shift miniature effect on a real Portuguese fishing village at golden hour, colorful boats in the harbor appearing toy-like, selective focus band across the middle, saturated primary colors of blue red and yellow boats against white buildings, 90mm tilt-shift lens, the familiar made fantastical, Wes Anderson color sensibility"
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
    "recraft/v4.1/flash/text-to-image",
    arguments={
        "prompt": "Tilt-shift miniature effect on a real Portuguese fishing village at golden hour, colorful boats in the harbor appearing toy-like, selective focus band across the middle, saturated primary colors of blue red and yellow boats against white buildings, 90mm tilt-shift lens, the familiar made fantastical, Wes Anderson color sensibility"
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

const result = await fal.subscribe("recraft/v4.1/flash/text-to-image", {
  input: {
    prompt: "Tilt-shift miniature effect on a real Portuguese fishing village at golden hour, colorful boats in the harbor appearing toy-like, selective focus band across the middle, saturated primary colors of blue red and yellow boats against white buildings, 90mm tilt-shift lens, the familiar made fantastical, Wes Anderson color sensibility"
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

- [Model Playground](https://fal.ai/models/recraft/v4.1/flash/text-to-image)
- [API Documentation](https://fal.ai/models/recraft/v4.1/flash/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=recraft/v4.1/flash/text-to-image)

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

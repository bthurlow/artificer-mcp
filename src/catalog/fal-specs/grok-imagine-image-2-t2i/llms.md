# Grok Imagine Image 2.0

> Generate images from text using xAi's Grok Imagine 2.0 model.


## Overview

- **Endpoint**: `https://fal.run/xai/grok-imagine-image/v2.0/text-to-image`
- **Model ID**: `xai/grok-imagine-image/v2.0/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: text-to-image, xai, grok



## Pricing

Your request will cost **$0.04** (low) or **$0.06** (medium) per image for 1K, and **$0.06** (low) or **$0.08** (medium) per image for 2K.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text description of the desired image.
  - Examples: "Abstract human silhouette, golden particles ready to burst outward representing joy, data visualization style, emotional expression through particles, artistic scientific"

- **`num_images`** (`integer`, _optional_):
  Number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated image. Default value: `"1:1"`
  - Default: `"1:1"`
  - Options: `"2:1"`, `"20:9"`, `"19.5:9"`, `"16:9"`, `"4:3"`, `"3:2"`, `"1:1"`, `"2:3"`, `"3:4"`, `"9:16"`, `"9:19.5"`, `"9:20"`, `"1:2"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated image. `1k` for standard resolution, `2k` for high resolution. Default value: `"1k"`
  - Default: `"1k"`
  - Options: `"1k"`, `"2k"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`quality`** (`QualityEnum`, _optional_):
  Quality level of the generated image. Default value: `"medium"`
  - Default: `"medium"`
  - Options: `"low"`, `"medium"`



**Required Parameters Example**:

```json
{
  "prompt": "Abstract human silhouette, golden particles ready to burst outward representing joy, data visualization style, emotional expression through particles, artistic scientific"
}
```

**Full Example**:

```json
{
  "prompt": "Abstract human silhouette, golden particles ready to burst outward representing joy, data visualization style, emotional expression through particles, artistic scientific",
  "num_images": 1,
  "aspect_ratio": "1:1",
  "resolution": "1k",
  "output_format": "jpeg",
  "quality": "medium"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The URL of the generated image.
  - Array of ImageFile
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8b90b7/9avg_nKJmcVinjQHJR_Ja.jpg"}]

- **`revised_prompt`** (`string`, _optional_):
  The enhanced prompt that was used to generate the image.



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8b90b7/9avg_nKJmcVinjQHJR_Ja.jpg"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/xai/grok-imagine-image/v2.0/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Abstract human silhouette, golden particles ready to burst outward representing joy, data visualization style, emotional expression through particles, artistic scientific"
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
    "xai/grok-imagine-image/v2.0/text-to-image",
    arguments={
        "prompt": "Abstract human silhouette, golden particles ready to burst outward representing joy, data visualization style, emotional expression through particles, artistic scientific"
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

const result = await fal.subscribe("xai/grok-imagine-image/v2.0/text-to-image", {
  input: {
    prompt: "Abstract human silhouette, golden particles ready to burst outward representing joy, data visualization style, emotional expression through particles, artistic scientific"
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

- [Model Playground](https://fal.ai/models/xai/grok-imagine-image/v2.0/text-to-image)
- [API Documentation](https://fal.ai/models/xai/grok-imagine-image/v2.0/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=xai/grok-imagine-image/v2.0/text-to-image)

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

# Kling Image

> Kling Omni 3: Top-tier text-to-image with flawless consistency.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-image/o3/text-to-image`
- **Model ID**: `fal-ai/kling-image/o3/text-to-image`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: text-to-image



## Pricing

Your request will cost **$0.028** per image for **1K/2K**, price will be double for **4K**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for image generation. Max 2500 characters.
  - Examples: "A poster design says 'Kling Omni 3 Image is available on fal' with a cool font in the background as several rows and big font size. Big gap between the rows. High fashion model wearing a dress made entirely of living moss and small white flowers, standing in an abandoned greenhouse, shafts of light, editorial photography."

- **`elements`** (`list<ElementInput>`, _optional_):
  Optional: Elements (characters/objects) for face control. Reference in prompt as @Element1, @Element2, etc.
  - Array of ElementInput

- **`resolution`** (`ResolutionEnum`, _optional_):
  Image generation resolution. 1K: standard, 2K: high-res, 4K: ultra high-res. Default value: `"1K"`
  - Default: `"1K"`
  - Options: `"1K"`, `"2K"`, `"4K"`

- **`result_type`** (`ResultTypeEnum`, _optional_):
  Result type. 'single' for one image, 'series' for a series of related images. Default value: `"single"`
  - Default: `"single"`
  - Options: `"single"`, `"series"`

- **`num_images`** (`integer`, _optional_):
  Number of images to generate (1-9). Only used when result_type is 'single'. Default value: `1`
  - Default: `1`
  - Range: `1` to `9`

- **`series_amount`** (`integer`, _optional_):
  Number of images in series (2-9). Only used when result_type is 'series'.
  - Range: `2` to `9`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of generated images. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"`, `"3:2"`, `"2:3"`, `"21:9"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A poster design says 'Kling Omni 3 Image is available on fal' with a cool font in the background as several rows and big font size. Big gap between the rows. High fashion model wearing a dress made entirely of living moss and small white flowers, standing in an abandoned greenhouse, shafts of light, editorial photography."
}
```

**Full Example**:

```json
{
  "prompt": "A poster design says 'Kling Omni 3 Image is available on fal' with a cool font in the background as several rows and big font size. Big gap between the rows. High fashion model wearing a dress made entirely of living moss and small white flowers, standing in an abandoned greenhouse, shafts of light, editorial photography.",
  "elements": [
    {}
  ],
  "resolution": "1K",
  "result_type": "single",
  "num_images": 1,
  "aspect_ratio": "16:9",
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  Generated images
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8d069f/8kVewB_BV3u0f8vORGZYy_4b654d5a07b64b498ebdb091a76611ad.png","file_name":"4b654d5a07b64b498ebdb091a76611ad.png","content_type":"image/png","file_size":1748857}]



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a8d069f/8kVewB_BV3u0f8vORGZYy_4b654d5a07b64b498ebdb091a76611ad.png",
      "file_name": "4b654d5a07b64b498ebdb091a76611ad.png",
      "content_type": "image/png",
      "file_size": 1748857
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-image/o3/text-to-image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A poster design says 'Kling Omni 3 Image is available on fal' with a cool font in the background as several rows and big font size. Big gap between the rows. High fashion model wearing a dress made entirely of living moss and small white flowers, standing in an abandoned greenhouse, shafts of light, editorial photography."
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
    "fal-ai/kling-image/o3/text-to-image",
    arguments={
        "prompt": "A poster design says 'Kling Omni 3 Image is available on fal' with a cool font in the background as several rows and big font size. Big gap between the rows. High fashion model wearing a dress made entirely of living moss and small white flowers, standing in an abandoned greenhouse, shafts of light, editorial photography."
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

const result = await fal.subscribe("fal-ai/kling-image/o3/text-to-image", {
  input: {
    prompt: "A poster design says 'Kling Omni 3 Image is available on fal' with a cool font in the background as several rows and big font size. Big gap between the rows. High fashion model wearing a dress made entirely of living moss and small white flowers, standing in an abandoned greenhouse, shafts of light, editorial photography."
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-image/o3/text-to-image)
- [API Documentation](https://fal.ai/models/fal-ai/kling-image/o3/text-to-image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-image/o3/text-to-image)

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

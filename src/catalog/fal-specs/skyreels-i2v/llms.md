# Skyreels V1 (Image-to-Video)

> SkyReels V1 is the first and most advanced open-source human-centric video foundation model. By fine-tuning HunyuanVideo on O(10M) high-quality film and television clips


## Overview

- **Endpoint**: `https://fal.run/fal-ai/skyreels-i2v`
- **Model ID**: `fal-ai/skyreels-i2v`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: motion



## Pricing

- **Price**: $0.3 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse."

- **`image_url`** (`string`, _required_):
  URL of the image input.
  - Examples: "https://fal.media/files/panda/TuXlMwArpQcdYNCLAEM8K.webp"

- **`seed`** (`integer`, _optional_):
  Random seed for generation. If not provided, a random seed will be used.

- **`guidance_scale`** (`float`, _optional_):
  Guidance scale for generation (between 1.0 and 20.0) Default value: `6`
  - Default: `6`
  - Range: `1` to `20`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of denoising steps (between 1 and 50). Higher values give better quality but take longer. Default value: `30`
  - Default: `30`
  - Range: `1` to `50`

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt to guide generation away from certain attributes.

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the output video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`



**Required Parameters Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
  "image_url": "https://fal.media/files/panda/TuXlMwArpQcdYNCLAEM8K.webp"
}
```

**Full Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
  "image_url": "https://fal.media/files/panda/TuXlMwArpQcdYNCLAEM8K.webp",
  "guidance_scale": 6,
  "num_inference_steps": 30,
  "aspect_ratio": "16:9"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_)
  - Examples: {"url":"https://fal.media/files/elephant/yOOdaiC5clkH9K_5TTD32_video.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation
  - Examples: 42



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/elephant/yOOdaiC5clkH9K_5TTD32_video.mp4"
  },
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/skyreels-i2v \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
     "image_url": "https://fal.media/files/panda/TuXlMwArpQcdYNCLAEM8K.webp"
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
    "fal-ai/skyreels-i2v",
    arguments={
        "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
        "image_url": "https://fal.media/files/panda/TuXlMwArpQcdYNCLAEM8K.webp"
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

const result = await fal.subscribe("fal-ai/skyreels-i2v", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
    image_url: "https://fal.media/files/panda/TuXlMwArpQcdYNCLAEM8K.webp"
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

- [Model Playground](https://fal.ai/models/fal-ai/skyreels-i2v)
- [API Documentation](https://fal.ai/models/fal-ai/skyreels-i2v/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/skyreels-i2v)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

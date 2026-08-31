# MiniMax H3 Image to Video

> MiniMax H3 is a frontier video model. This endpoint animates a supplied image into 2K video, using it as the opening frame or pairs a first and last frame to control a transition between two images with the aspect ratio following the input.


## Overview

- **Endpoint**: `https://fal.run/minimax/h3/image-to-video`
- **Model ID**: `minimax/h3/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Video costs **$0.05** per second at **480p**, **$0.06** per second at **768p**, **$0.13** per second at **2K** and **$0.16** per second at **4K**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation
  - Examples: "The camera slowly pulls back from the scene, revealing the full landscape as clouds drift overhead and light shifts across the terrain."

- **`duration`** (`integer`, _optional_):
  The duration of the video in seconds. Default value: `5`
  - Default: `5`
  - Range: `5` to `15`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. 480P and 768P are native generation modes; 2K and 4K upscale a 768P base result. Default value: `"2K"`
  - Default: `"2K"`
  - Options: `"480P"`, `"768P"`, `"2K"`, `"4K"`

- **`seed`** (`integer`, _optional_):
  Random seed. A random seed is selected when omitted.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  Return the generated video as base64 instead of a CDN URL.
  - Default: `false`

- **`prompt_expansion_mode`** (`string`, _optional_):
  How much effort to spend rewriting the prompt before generation. 'fast' returns in about a second. 'balanced' picks per request. 'quality' spends up to ~30s on a richer prompt. Default value: `"balanced"`
  - Default: `"balanced"`
  - Examples: "fast", "balanced", "quality"

- **`image_url`** (`string`, _optional_):
  Optional URL of the image to use as the first frame. When provided, the output aspect ratio follows this image. When omitted, the request is handled as text-to-video (16:9 by default).
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/hailuo23/pro_i2v_in.jpg"

- **`end_image_url`** (`string`, _optional_):
  Optional URL of the image to use as the last frame, for first-to-last keyframe generation.



**Required Parameters Example**:

```json
{
  "prompt": "The camera slowly pulls back from the scene, revealing the full landscape as clouds drift overhead and light shifts across the terrain."
}
```

**Full Example**:

```json
{
  "prompt": "The camera slowly pulls back from the scene, revealing the full landscape as clouds drift overhead and light shifts across the terrain.",
  "duration": 5,
  "resolution": "2K",
  "enable_safety_checker": true,
  "prompt_expansion_mode": "fast",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/hailuo23/pro_i2v_in.jpg"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video

- **`expanded_prompt`** (`string`, _optional_):
  The prompt after expansion, as sent to the model. Null when prompt expansion was disabled, left the prompt unchanged, or was performed internally by MiniMax's hosted API.



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/minimax/h3/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "The camera slowly pulls back from the scene, revealing the full landscape as clouds drift overhead and light shifts across the terrain."
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
    "minimax/h3/image-to-video",
    arguments={
        "prompt": "The camera slowly pulls back from the scene, revealing the full landscape as clouds drift overhead and light shifts across the terrain."
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

const result = await fal.subscribe("minimax/h3/image-to-video", {
  input: {
    prompt: "The camera slowly pulls back from the scene, revealing the full landscape as clouds drift overhead and light shifts across the terrain."
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

- [Model Playground](https://fal.ai/models/minimax/h3/image-to-video)
- [API Documentation](https://fal.ai/models/minimax/h3/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=minimax/h3/image-to-video)

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

# Luma Ray 3.2 Image to Video

> Luma Ray 3.2 animates a source image into cinematic motion guided by a text prompt, preserving the starting frame's look while controlling resolution, duration, and seamless looping.


## Overview

- **Endpoint**: `https://fal.run/luma/agent/ray/v3.2/image-to-video`
- **Model ID**: `luma/agent/ray/v3.2/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

For 5s video your request will cost **$0.15** for 540p, **$0.30** for 720p and **$1.20** for 1080p. 10s is not available for image-to-video (start-frame requirement). HDR (5s) costs **$0.60** at 720p and **$2.40** at 1080p; HDR + EXR (5s) costs **$0.90** at 720p and **$3.60** at 1080p (540p not available in HDR). For $1 you can run this model approximately **6 times** (540p/5s).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the motion/scene to generate.
  - Examples: "Low-angle shot of a majestic tiger prowling through a snowy landscape, leaving paw prints on the white blanket."

- **`image_url`** (`string`, _optional_):
  URL of the image used as the first frame of the video. Provide either image_url (optionally with end_image_url) or keyframes — the two anchoring modes are mutually exclusive.
  - Examples: "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png"

- **`end_image_url`** (`string`, _optional_):
  Optional URL of an image used as the last frame. When set, the model interpolates between image_url and end_image_url. Cannot be combined with keyframes.

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"3:4"`, `"4:3"`, `"1:1"`, `"9:16"`, `"16:9"`, `"21:9"`
  - Examples: "16:9"

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video. Higher resolutions cost more. Default value: `"540p"`
  - Default: `"540p"`
  - Options: `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the generated video. 10s requires multi-keyframe input (keyframes / keyframe_indexes); it is not supported with a single image_url / end_image_url anchor. Default value: `"5s"`
  - Default: `"5s"`
  - Options: `"5s"`, `"10s"`

- **`loop`** (`boolean`, _optional_):
  Generate a seamless loop. Only valid for standard-dynamic-range generations without an end frame or keyframes.
  - Default: `false`

- **`hdr`** (`boolean`, _optional_):
  Generate an HDR-encoded MP4. Requires HDR access on the account and a resolution of 720p or 1080p; not supported with loop.
  - Default: `false`

- **`exr_export`** (`boolean`, _optional_):
  Also export an EXR file alongside the MP4. Requires hdr=true and HDR access.
  - Default: `false`

- **`keyframes`** (`list<string>`, _optional_):
  Multi-keyframe image-to-video guide frames: 1-64 image URLs pinned at the positions given by keyframe_indexes. Mutually exclusive with image_url, end_image_url, and loop; unlocks 10s and HDR. Provide keyframes and keyframe_indexes together (same length).
  - Array of string

- **`keyframe_indexes`** (`list<integer>`, _optional_):
  Output-frame positions (duration x 24fps: 5s -> 0-120, 10s -> 0-240) where each keyframes[i] is anchored. Non-negative, unique, and the same length as keyframes.
  - Array of integer



**Required Parameters Example**:

```json
{
  "prompt": "Low-angle shot of a majestic tiger prowling through a snowy landscape, leaving paw prints on the white blanket."
}
```

**Full Example**:

```json
{
  "prompt": "Low-angle shot of a majestic tiger prowling through a snowy landscape, leaving paw prints on the white blanket.",
  "image_url": "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png",
  "aspect_ratio": "16:9",
  "resolution": "540p",
  "duration": "5s"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.

- **`exr_file`** (`File`, _optional_):
  The generated EXR sidecar when exr_export is true. This may be a single EXR file or a ZIP package depending on Luma's export shape.



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
  --url https://fal.run/luma/agent/ray/v3.2/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Low-angle shot of a majestic tiger prowling through a snowy landscape, leaving paw prints on the white blanket."
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
    "luma/agent/ray/v3.2/image-to-video",
    arguments={
        "prompt": "Low-angle shot of a majestic tiger prowling through a snowy landscape, leaving paw prints on the white blanket."
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

const result = await fal.subscribe("luma/agent/ray/v3.2/image-to-video", {
  input: {
    prompt: "Low-angle shot of a majestic tiger prowling through a snowy landscape, leaving paw prints on the white blanket."
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

- [Model Playground](https://fal.ai/models/luma/agent/ray/v3.2/image-to-video)
- [API Documentation](https://fal.ai/models/luma/agent/ray/v3.2/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=luma/agent/ray/v3.2/image-to-video)

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

# Luma Ray 3.2 Video to Video

> Luma Ray 3.2 re-renders an existing video into new cinematic motion guided by a text prompt, preserving the source's look and movement while controlling resolution, duration, and HDR.


## Overview

- **Endpoint**: `https://fal.run/luma/agent/ray/v3.2/video-to-video`
- **Model ID**: `luma/agent/ray/v3.2/video-to-video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

For 5s video your request will cost **$0.72** for 540p, **$1.08** for 720p and **$2.16** for 1080p. For 10s, **$1.44** at 540p, **$2.16** at 720p and **$4.32** at 1080p. HDR (720p/1080p only) costs **$2.16**/**$4.32** at 5s and **$4.32**/**$8.64** at 10s; HDR + EXR costs **$3.24**/**$6.48** at 5s and **$6.48**/**$12.96** at 10s (540p not available in HDR). For $1 you can run this model approximately **1 time** (540p/5s).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing how to edit the source video.
  - Examples: "Restyle the footage as a hand-painted watercolor animation with soft pastel colors."

- **`video_url`** (`string`, _required_):
  URL of the source video to edit.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4"

- **`user`** (`string`, _optional_):
  Optional opaque identifier for the end user making the request. Used only for abuse attribution; never interpreted by fal.

- **`start_image_url`** (`string`, _optional_):
  Optional URL of an image to use as the edited video's first frame — e.g. a restyled version of the source's opening frame to steer the look of the edit. Leave unset to let the model derive the first frame from the source video.
  - Examples: "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png"

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the edited video. Higher resolutions cost more. Default value: `"540p"`
  - Default: `"540p"`
  - Options: `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the edited video. Default value: `"5s"`
  - Default: `"5s"`
  - Options: `"5s"`, `"10s"`

- **`edit_strength`** (`Enum`, _optional_):
  How closely the edit preserves the source video. 'adhere_*' stays closest to the source, 'flex_*' is balanced, and 'reimagine_*' diverges most. Leave unset to use Luma's default. Cannot be combined with auto_controls.
  - Options: `"adhere_1"`, `"adhere_2"`, `"adhere_3"`, `"flex_1"`, `"flex_2"`, `"flex_3"`, `"reimagine_1"`, `"reimagine_2"`, `"reimagine_3"`

- **`auto_controls`** (`boolean`, _optional_):
  Let the model derive the edit conditioning schedule from the source video. Cannot be combined with edit_strength.
  - Default: `false`

- **`hdr`** (`boolean`, _optional_):
  Generate an HDR-encoded MP4. Requires HDR access on the account and a resolution of 720p or 1080p.
  - Default: `false`

- **`exr_export`** (`boolean`, _optional_):
  Also export an EXR file alongside the MP4. Requires hdr=true and HDR access.
  - Default: `false`

- **`controls`** (`RayEditControls`, _optional_):
  Per-signal conditioning controls (pose, depth, normals, trajectory, face) for finer control than edit_strength. Cannot be combined with auto_controls.

- **`keyframes`** (`list<string>`, _optional_):
  Multi-keyframe edit guide frames: up to 64 image URLs pinned at the source-frame positions given by keyframe_indexes. Mutually exclusive with start_image_url. Provide keyframes and keyframe_indexes together (same length).
  - Array of string

- **`keyframe_indexes`** (`list<integer>`, _optional_):
  Source-video frame positions where each keyframes[i] is anchored. Non-negative, unique, and the same length as keyframes.
  - Array of integer



**Required Parameters Example**:

```json
{
  "prompt": "Restyle the footage as a hand-painted watercolor animation with soft pastel colors.",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4"
}
```

**Full Example**:

```json
{
  "prompt": "Restyle the footage as a hand-painted watercolor animation with soft pastel colors.",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4",
  "start_image_url": "https://storage.googleapis.com/falserverless/gallery/example_inputs_liuyifei.png",
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
  --url https://fal.run/luma/agent/ray/v3.2/video-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Restyle the footage as a hand-painted watercolor animation with soft pastel colors.",
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4"
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
    "luma/agent/ray/v3.2/video-to-video",
    arguments={
        "prompt": "Restyle the footage as a hand-painted watercolor animation with soft pastel colors.",
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4"
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

const result = await fal.subscribe("luma/agent/ray/v3.2/video-to-video", {
  input: {
    prompt: "Restyle the footage as a hand-painted watercolor animation with soft pastel colors.",
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4"
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

- [Model Playground](https://fal.ai/models/luma/agent/ray/v3.2/video-to-video)
- [API Documentation](https://fal.ai/models/luma/agent/ray/v3.2/video-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=luma/agent/ray/v3.2/video-to-video)

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

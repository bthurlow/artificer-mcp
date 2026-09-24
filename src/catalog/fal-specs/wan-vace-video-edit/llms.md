# Wan VACE Video Edit

> Edit videos using plain language and Wan VACE


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan-vace-apps/video-edit`
- **Model ID**: `fal-ai/wan-vace-apps/video-edit`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: video-edit, wan-vace



## Pricing

Your request will cost $0.10 per video second for 720p, $0.075 per video second for 580p, $0.05 per video second for 480p. Video seconds are calculated at 16 frames per second after downsampling.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Prompt to edit the video.
  - Examples: "replace him with a large anthropomorphic polar bear"

- **`video_url`** (`string`, _required_):
  URL of the input video.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/vace-video-edit-input.mp4"

- **`video_type`** (`VideoTypeEnum`, _optional_):
  The type of video you're editing. Use 'general' for most videos, and 'human' for videos emphasizing human subjects and motions. The default value 'auto' means the model will guess based on the first frame of the video. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"general"`, `"human"`
  - Examples: "auto"

- **`image_urls`** (`list<string>`, _optional_):
  URLs of the input images to use as a reference for the generation.
  - Default: `[]`
  - Array of string

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the edited video. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"240p"`, `"360p"`, `"480p"`, `"580p"`, `"720p"`
  - Examples: "auto"

- **`acceleration`** (`Enum`, _optional_):
  Acceleration to use for inference. Options are 'none' or 'regular'. Accelerated inference will very slightly affect output, but will be significantly faster. Default value: `regular`
  - Default: `"regular"`
  - Options: `"none"`, `"low"`, `"regular"`
  - Examples: "regular"

- **`enable_auto_downsample`** (`boolean`, _optional_):
  Whether to enable automatic downsampling. If your video has a high frame rate or is long, enabling longer sequences to be generated. The video will be interpolated back to the original frame rate after generation. Default value: `true`
  - Default: `true`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the edited video. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"9:16"`, `"1:1"`
  - Examples: "auto"

- **`auto_downsample_min_fps`** (`float`, _optional_):
  The minimum frames per second to downsample the video to. Default value: `15`
  - Default: `15`
  - Range: `1` to `60`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Default value: `true`
  - Default: `true`

- **`return_frames_zip`** (`boolean`, _optional_):
  Whether to include a ZIP archive containing all generated frames.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "replace him with a large anthropomorphic polar bear",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/vace-video-edit-input.mp4"
}
```

**Full Example**:

```json
{
  "prompt": "replace him with a large anthropomorphic polar bear",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/vace-video-edit-input.mp4",
  "video_type": "auto",
  "image_urls": [],
  "resolution": "auto",
  "acceleration": "regular",
  "enable_auto_downsample": true,
  "aspect_ratio": "auto",
  "auto_downsample_min_fps": 15,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The edited video.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/vace-video-edit-output.mp4"}

- **`frames_zip`** (`File`, _optional_):
  ZIP archive of generated frames if requested.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/vace-video-edit-output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan-vace-apps/video-edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "replace him with a large anthropomorphic polar bear",
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/vace-video-edit-input.mp4"
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
    "fal-ai/wan-vace-apps/video-edit",
    arguments={
        "prompt": "replace him with a large anthropomorphic polar bear",
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/vace-video-edit-input.mp4"
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

const result = await fal.subscribe("fal-ai/wan-vace-apps/video-edit", {
  input: {
    prompt: "replace him with a large anthropomorphic polar bear",
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/vace-video-edit-input.mp4"
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

- [Model Playground](https://fal.ai/models/fal-ai/wan-vace-apps/video-edit)
- [API Documentation](https://fal.ai/models/fal-ai/wan-vace-apps/video-edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan-vace-apps/video-edit)

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

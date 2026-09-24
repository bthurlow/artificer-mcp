# Luma Ray 3.2 Reframe

> Luma Ray 3.2 reframes an existing video into a new aspect ratio guided by a text prompt, preserving the original footage frame-for-frame while controlling resolution and outpainting the surrounding canvas.


## Overview

- **Endpoint**: `https://fal.run/luma/agent/ray/v3.2/reframe`
- **Model ID**: `luma/agent/ray/v3.2/reframe`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Reframe is billed per started source second: **$0.06/s** at 540p, **$0.12/s** at 720p and **$0.36/s** at 1080p. A 5s source will cost **$0.30** for 540p, **$0.60** for 720p and **$1.80** for 1080p. A 10s source costs **$0.60** at 540p, **$1.20** at 720p and **$3.60** at 1080p. For $1 you can reframe approximately **3 five-second clips** (540p).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the content to paint into the newly exposed canvas area when reframing to the target aspect ratio.
  - Examples: "Extend the scene into cinematic widescreen with matching lighting and background detail."

- **`video_url`** (`string`, _required_):
  URL of the source video to reframe (must be 10 seconds or less).
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4"

- **`aspect_ratio`** (`AspectRatioEnum`, _required_):
  Target aspect ratio for the reframed video.
  - Options: `"3:4"`, `"4:3"`, `"1:1"`, `"9:16"`, `"16:9"`, `"21:9"`
  - Examples: "21:9"

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the reframed video. Higher resolutions cost more. Default value: `"540p"`
  - Default: `"540p"`
  - Options: `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`Enum`, _optional_):
  Duration of the reframed video. Defaults to matching the source video's duration; set explicitly to 5s or 10s to override.
  - Options: `"5s"`, `"10s"`

- **`source_position`** (`RayReframeSourcePosition`, _optional_):
  Optional normalized source rectangle controlling where the source video sits in the output canvas.



**Required Parameters Example**:

```json
{
  "prompt": "Extend the scene into cinematic widescreen with matching lighting and background detail.",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4",
  "aspect_ratio": "21:9"
}
```

**Full Example**:

```json
{
  "prompt": "Extend the scene into cinematic widescreen with matching lighting and background detail.",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4",
  "aspect_ratio": "21:9",
  "resolution": "540p"
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
  --url https://fal.run/luma/agent/ray/v3.2/reframe \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Extend the scene into cinematic widescreen with matching lighting and background detail.",
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4",
     "aspect_ratio": "21:9"
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
    "luma/agent/ray/v3.2/reframe",
    arguments={
        "prompt": "Extend the scene into cinematic widescreen with matching lighting and background detail.",
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4",
        "aspect_ratio": "21:9"
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

const result = await fal.subscribe("luma/agent/ray/v3.2/reframe", {
  input: {
    prompt: "Extend the scene into cinematic widescreen with matching lighting and background detail.",
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-video-input.mp4",
    aspect_ratio: "21:9"
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

- [Model Playground](https://fal.ai/models/luma/agent/ray/v3.2/reframe)
- [API Documentation](https://fal.ai/models/luma/agent/ray/v3.2/reframe/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=luma/agent/ray/v3.2/reframe)

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

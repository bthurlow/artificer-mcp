# Topaz Upscale Video Generative

> Professional generative video upscaling powered by Topaz Labs. Starlight models rebuild detail that is not in the source, with Fast variants at half the price. Best for low-quality, compressed or archive footage.


## Overview

- **Endpoint**: `https://fal.run/topaz/upscale/video/generative`
- **Model ID**: `topaz/upscale/video/generative`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: upscale, video



## Pricing

Pricing uses the selected model, output resolution, frame rate, and duration. At 30 fps, 10 seconds costs **$1.20** up to 1080p or **$2.60** at 4K with Starlight Precise 2.6, HQ, Mini, or Sharp; Starlight Fast 2 costs **$0.60** up to 1080p or **$1.30** at 4K. At 60 fps, the same 10-second examples cost **$2.40**/**$5.10** for the quality models or **$1.20**/**$2.60** for Fast 2.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the video to upscale
  - Examples: "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"

- **`model`** (`ModelEnum`, _optional_):
  Generative diffusion enhancement model. Starlight Precise 2.6 adds realism to AI-generated video; Starlight HQ maximizes quality on high-resolution sources; Starlight Mini restores archival footage; Starlight Sharp is fast restoration with sharper detail; Starlight Fast 2 is the fastest, cheapest diffusion upscaler. Default value: `"Starlight Precise 2.6"`
  - Default: `"Starlight Precise 2.6"`
  - Options: `"Starlight Precise 2.6"`, `"Starlight HQ"`, `"Starlight Mini"`, `"Starlight Sharp"`, `"Starlight Fast 2"`

- **`upscale_factor`** (`float`, _optional_):
  Factor to upscale the video by (e.g. 2.0 doubles width and height) Default value: `2`
  - Default: `2`
  - Range: `1` to `4`

- **`target_fps`** (`integer`, _optional_):
  Target FPS for the output. Frame interpolation is enabled only when this differs from the source FPS.
  - Range: `16` to `60`

- **`softness`** (`float`, _optional_):
  How much softening the model applies to the output, from 1 (sharpest) to 5 (softest). Starlight Precise 2.6 only; leave unset for Topaz's default.
  - Range: `1` to `5`

- **`H264_output`** (`boolean`, _optional_):
  Whether to use H264 codec for output video. Default is H265.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "video_url": "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"
}
```

**Full Example**:

```json
{
  "video_url": "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4",
  "model": "Starlight Precise 2.6",
  "upscale_factor": 2
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The upscaled video file
  - Examples: {"url":"https://v3.fal.media/files/penguin/ztj_LB4gQlW6HIfVs8zX4_upscaled.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/penguin/ztj_LB4gQlW6HIfVs8zX4_upscaled.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/topaz/upscale/video/generative \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"
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
    "topaz/upscale/video/generative",
    arguments={
        "video_url": "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"
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

const result = await fal.subscribe("topaz/upscale/video/generative", {
  input: {
    video_url: "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"
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

- [Model Playground](https://fal.ai/models/topaz/upscale/video/generative)
- [API Documentation](https://fal.ai/models/topaz/upscale/video/generative/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/upscale/video/generative)

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

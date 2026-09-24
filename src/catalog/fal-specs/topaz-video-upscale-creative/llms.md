# Topaz Upscale Video Creative

> Professional creative video upscaling powered by Topaz Labs. Astra 2 reimagines fine detail and typically delivers 4K output. Best for cinematic shots that need maximum visual impact.


## Overview

- **Endpoint**: `https://fal.run/topaz/upscale/video/creative`
- **Model ID**: `topaz/upscale/video/creative`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: upscale, video



## Pricing

Pricing uses the output resolution, frame rate, and duration. With Astra 2 at 30 fps, 10 seconds costs **$3.00** up to 1080p or **$5.00** at 4K. At 60 fps, the same job costs **$6.00** or **$10.00**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the video to upscale
  - Examples: "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"

- **`prompt`** (`string`, _optional_):
  Optional text prompt guiding the detail Astra 2 generates. When set, the input video is limited to 450 frames.

- **`creativity`** (`float`, _optional_):
  How much new detail and texture Astra 2 invents. 0.0 stays faithful to the source, 1.0 is maximally creative. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`

- **`realism`** (`float`, _optional_):
  Bias generated detail toward photorealism (0.0-1.0).
  - Range: `0` to `1`

- **`sharp`** (`float`, _optional_):
  Output sharpness. 0.0 softens, 0.5 is neutral passthrough, 1.0 applies strong sharpening. Defaults to Topaz's neutral 0.5.
  - Range: `0` to `1`

- **`upscale_factor`** (`float`, _optional_):
  Requested upscale factor (e.g. 2.0 doubles width and height). Note: Astra 2 snaps to its own supported output resolutions (typically 4K when upscaling) and may override the requested target. Billing is based on the delivered resolution. Default value: `2`
  - Default: `2`
  - Range: `1` to `4`

- **`target_fps`** (`integer`, _optional_):
  Target FPS for the output. Frame interpolation is enabled only when this differs from the source FPS.
  - Range: `16` to `60`

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
  "creativity": 0.5,
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
  --url https://fal.run/topaz/upscale/video/creative \
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
    "topaz/upscale/video/creative",
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

const result = await fal.subscribe("topaz/upscale/video/creative", {
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

- [Model Playground](https://fal.ai/models/topaz/upscale/video/creative)
- [API Documentation](https://fal.ai/models/topaz/upscale/video/creative/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/upscale/video/creative)

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

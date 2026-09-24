# Topaz Interpolate Video

> Professional frame interpolation powered by Topaz Labs. Apollo, Chronos and Aion retime footage up to 120 fps, from smooth motion to extreme slow motion. Best for fluid 60fps output and slow-motion effects.


## Overview

- **Endpoint**: `https://fal.run/topaz/interpolate/video`
- **Model ID**: `topaz/interpolate/video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: interpolate, video, slowmotion



## Pricing

For ordinary frame-rate conversion with Slowdown Factor set to 1, pricing is based on newly generated frames. For a 10-second 30→60 fps job, Apollo or Chronos costs **$0.30** at 1080p or **$0.60** at 4K; Aion costs **$0.50** or **$1.70**. Slow motion uses the current full-output-duration calculation, so higher slowdown factors cost more.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the video to retime / interpolate
  - Examples: "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"

- **`model`** (`ModelEnum`, _optional_):
  Frame interpolation model. Apollo is general-purpose; Chronos targets real-world motion; Aion handles extreme/complex motion. Default value: `"Apollo"`
  - Default: `"Apollo"`
  - Options: `"Apollo"`, `"Chronos"`, `"Aion"`

- **`target_fps`** (`integer`, _optional_):
  Target frames per second for the interpolated output. Default value: `60`
  - Default: `60`
  - Range: `16` to `120`

- **`slowdown_factor`** (`integer`, _optional_):
  Slow-motion factor: 2 makes the output twice as long at the target FPS (2x slow motion), up to 8x. 1 keeps the original speed. The extra generated frames are billed like interpolated frames. Default value: `1`
  - Default: `1`
  - Range: `1` to `8`

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
  "model": "Apollo",
  "target_fps": 60,
  "slowdown_factor": 1
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
  --url https://fal.run/topaz/interpolate/video \
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
    "topaz/interpolate/video",
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

const result = await fal.subscribe("topaz/interpolate/video", {
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

- [Model Playground](https://fal.ai/models/topaz/interpolate/video)
- [API Documentation](https://fal.ai/models/topaz/interpolate/video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/interpolate/video)

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

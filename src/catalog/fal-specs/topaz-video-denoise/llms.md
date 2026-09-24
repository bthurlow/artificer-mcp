# Topaz Denoise Video

> Professional video denoising powered by Topaz Labs. Nyx models remove noise at source resolution, with Nyx Fast as a lighter, cheaper pass. Best for low-light and high-ISO footage.


## Overview

- **Endpoint**: `https://fal.run/topaz/denoise/video`
- **Model ID**: `topaz/denoise/video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: denoise, video



## Pricing

Pricing uses the selected model, output resolution, frame rate, and duration. At 30 fps, a 10-second Nyx, Nyx XL, or Nyx HF job costs **$0.10** at 720p, **$0.20** at 1080p, or **$0.60** at 4K. Nyx Fast costs **$0.10** at 720p or 1080p and **$0.30** at 4K.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the video to denoise
  - Examples: "https://v3.fal.media/files/kangaroo/y5-1YTGpun17eSeggZMzX_video-1733468228.mp4"

- **`model`** (`ModelEnum`, _optional_):
  Denoise model. Nyx is high-quality denoising with texture preservation; Nyx Fast trades quality for speed on high-volume workloads; Nyx XL targets extreme noise; Nyx HF is precision denoising for pipeline-ready outputs (denoise only, no upscaling). Default value: `"Nyx"`
  - Default: `"Nyx"`
  - Options: `"Nyx"`, `"Nyx Fast"`, `"Nyx XL"`, `"Nyx HF"`

- **`upscale_factor`** (`float`, _optional_):
  Optional upscale applied on top of denoising. 1.0 keeps the source resolution. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`noise`** (`float`, _optional_):
  Noise reduction level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

- **`compression`** (`float`, _optional_):
  Compression artifact removal level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

- **`halo`** (`float`, _optional_):
  Halo reduction level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

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
  "model": "Nyx",
  "upscale_factor": 1
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
  --url https://fal.run/topaz/denoise/video \
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
    "topaz/denoise/video",
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

const result = await fal.subscribe("topaz/denoise/video", {
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

- [Model Playground](https://fal.ai/models/topaz/denoise/video)
- [API Documentation](https://fal.ai/models/topaz/denoise/video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/denoise/video)

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

# Topaz Upscale Video Precision

> Professional video upscaling powered by Topaz Labs. Precision models (Proteus, Artemis, Iris, Dione, Theia, Gaia, Rhea) enhance footage up to 4x while staying faithful to the source. Best for clean, natural upscales of real-world footage.


## Overview

- **Endpoint**: `https://fal.run/topaz/upscale/video/precision`
- **Model ID**: `topaz/upscale/video/precision`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: upscale, video



## Pricing

Your request will cost **$0.10** per 10 seconds of output at 720p, **$0.20** at 1080p, and **$0.60** at 4K with the precision models (Proteus, Artemis, Iris, Dione, Theia, Gaia HQ/CG, and Rhea). Proteus Natural (2x only) costs **$0.10** per 10 seconds at 720p, **$0.20** at 1080p, and **$0.50** at 4K. Gaia 2 (2x, animation) costs **$0.10** at 720p or 1080p and **$0.30** at 4K. Longer clips scale with duration, with credits rounded once per job: a 1-minute upscale with the standard precision models costs **$0.40** at 720p, **$0.80** at 1080p, and **$3.10** at 4K. These examples assume 30 fps. The final cost depends on output resolution, duration, and frame rate.

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
  Precision (non-generative) enhancement model. Proteus fits most real-world footage; Proteus Natural is a softer variant; Iris recovers faces; Dione deinterlaces legacy/interlaced sources; Artemis denoises and sharpens degraded footage; Gaia refines high-quality footage and CG (Gaia 2 upscales animation at 2x); Rhea maximizes fine detail via an internal 4x pass; Theia gives manual detail/fidelity control. Default value: `"Proteus"`
  - Default: `"Proteus"`
  - Options: `"Proteus"`, `"Proteus Natural"`, `"Iris"`, `"Iris Low Quality"`, `"Dione DV"`, `"Dione TV"`, `"Dione Robust"`, `"Dione Dehalo"`, `"Dione Robust Dehalo"`, `"Artemis High Quality"`, `"Artemis Medium Quality"`, `"Artemis Low Quality"`, `"Artemis Strong Halo"`, `"Artemis Medium Halo"`, `"Artemis Aliasing & Moire"`, `"Gaia HQ"`, `"Gaia CG"`, `"Gaia 2"`, `"Rhea"`, `"Theia Fine Tune Detail"`, `"Theia Fine Tune Fidelity"`

- **`upscale_factor`** (`float`, _optional_):
  Factor to upscale the video by (e.g. 2.0 doubles width and height) Default value: `2`
  - Default: `2`
  - Range: `1` to `4`

- **`target_fps`** (`integer`, _optional_):
  Target FPS for the output. Frame interpolation is enabled only when this differs from the source FPS.
  - Range: `16` to `60`

- **`compression`** (`float`, _optional_):
  Compression artifact removal level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

- **`noise`** (`float`, _optional_):
  Noise reduction level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

- **`halo`** (`float`, _optional_):
  Halo reduction level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

- **`grain`** (`float`, _optional_):
  Film grain amount (0.0-0.1). Default varies by model.
  - Range: `0` to `0.1`, step: `0.01`

- **`recover_detail`** (`float`, _optional_):
  Recover original detail level (0.0-1.0). Higher values preserve more original detail.
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
  "model": "Proteus",
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
  --url https://fal.run/topaz/upscale/video/precision \
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
    "topaz/upscale/video/precision",
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

const result = await fal.subscribe("topaz/upscale/video/precision", {
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

- [Model Playground](https://fal.ai/models/topaz/upscale/video/precision)
- [API Documentation](https://fal.ai/models/topaz/upscale/video/precision/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/upscale/video/precision)

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

# SeedVR2

> Upscale your videos using SeedVR2 with temporal consistency!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/seedvr/upscale/video`
- **Model ID**: `fal-ai/seedvr/upscale/video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: upscale, video-to-video



## Pricing

Your request will cost $0.001 per megapixel of video data (width × height × frames).
For example, if your upscaled video is 1920×1080 with 121 frames, the total cost will be $0.25.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  The input video to be processed
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/seedvr-input.mp4"

- **`upscale_mode`** (`UpscaleModeEnum`, _optional_):
  The mode to use for the upscale. If 'target', the upscale factor will be calculated based on the target resolution. If 'factor', the upscale factor will be used directly. Default value: `"factor"`
  - Default: `"factor"`
  - Options: `"target"`, `"factor"`

- **`upscale_factor`** (`float`, _optional_):
  Upscaling factor to be used. Will multiply the dimensions with this factor when `upscale_mode` is `factor`. Default value: `2`
  - Default: `2`
  - Range: `1` to `10`

- **`target_resolution`** (`TargetResolutionEnum`, _optional_):
  The target resolution to upscale to when `upscale_mode` is `target`. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`, `"1440p"`, `"2160p"`

- **`seed`** (`integer`, _optional_):
  The random seed used for the generation process.

- **`noise_scale`** (`float`, _optional_):
  The noise scale to use for the generation process. Default value: `0.1`
  - Default: `0.1`
  - Range: `0` to `1`, step: `0.001`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the output video. Default value: `"X264 (.mp4)"`
  - Default: `"X264 (.mp4)"`
  - Options: `"X264 (.mp4)"`, `"VP9 (.webm)"`, `"PRORES4444 (.mov)"`, `"GIF (.gif)"`

- **`output_quality`** (`OutputQualityEnum`, _optional_):
  The quality of the output video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`

- **`output_write_mode`** (`OutputWriteModeEnum`, _optional_):
  The write mode of the output video. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/seedvr-input.mp4"
}
```

**Full Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/seedvr-input.mp4",
  "upscale_mode": "factor",
  "upscale_factor": 2,
  "target_resolution": "1080p",
  "noise_scale": 0.1,
  "output_format": "X264 (.mp4)",
  "output_quality": "high",
  "output_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Upscaled video file after processing
  - Examples: {"content_type":"video/mp4","url":"https://storage.googleapis.com/falserverless/example_outputs/seedvr-output.mp4"}

- **`seed`** (`integer`, _required_):
  The random seed used for the generation process.



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "url": "https://storage.googleapis.com/falserverless/example_outputs/seedvr-output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/seedvr/upscale/video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/seedvr-input.mp4"
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
    "fal-ai/seedvr/upscale/video",
    arguments={
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/seedvr-input.mp4"
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

const result = await fal.subscribe("fal-ai/seedvr/upscale/video", {
  input: {
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/seedvr-input.mp4"
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

- [Model Playground](https://fal.ai/models/fal-ai/seedvr/upscale/video)
- [API Documentation](https://fal.ai/models/fal-ai/seedvr/upscale/video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/seedvr/upscale/video)

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

# Bytedance Upscaler Upscale Video

> Upscale videos with Bytedance's video upscaler.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/bytedance-upscaler/upscale/video`
- **Model ID**: `fal-ai/bytedance-upscaler/upscale/video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: upscaler, video, bytedance



## Pricing

Upscaling to 1080p costs $0.0072/s, 2K costs $0.0144/s, and 4K costs $0.0288/s, at a 30fps rate. Processing at 60fps doubles the cost for any resolution. Processing in `pro` mode makes the price 10 times of the normal price ($0.072/s, $0.144/s, $0.288/s for 1080p,2K, 4K at 30fps respectively, at 60fps these prices are further doubled.)

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  The URL of the video to upscale.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/bytedance_video_upscaler_input.mp4"

- **`target_resolution`** (`TargetResolutionEnum`, _optional_):
  The target resolution of the video to upscale. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"1080p"`, `"2k"`, `"4k"`, `"6k"`, `"8k"`

- **`target_fps`** (`float`, _optional_):
  The target frame rate of the enhanced video in frames per second. Default value: `30`
  - Default: `30`
  - Range: `24` to `120`

- **`enhancement_preset`** (`EnhancementPresetEnum`, _optional_):
  The enhancement preset optimized for specific video scenarios. 'general' is a general-purpose template, 'ugc' targets user-generated short videos, 'short_series' is for short dramas, 'aigc' is for AI-generated content, and 'old_film' is for classic film restoration. Default value: `"general"`
  - Default: `"general"`
  - Options: `"general"`, `"ugc"`, `"short_series"`, `"aigc"`, `"old_film"`

- **`enhancement_tier`** (`EnhancementTierEnum`, _optional_):
  The enhancement quality tier. 'fast' provides essential upscaling with good speed, 'standard' uses adaptive algorithms for better visual texture, 'pro' uses large-model restoration for cinematic quality (longer processing time), and 10 times the cost of `standard` and `fast`. Default value: `"standard"`
  - Default: `"standard"`
  - Options: `"fast"`, `"standard"`, `"pro"`

- **`scale_ratio`** (`float`, _optional_):
  The scaling ratio for the output video resolution. When set, overrides target_resolution and scales the input resolution by this factor (e.g., 2.0 doubles the resolution). Range: 1.1 to 10.0. Please note that this is valid only up to 4k resolution, and trying to scale beyond 4k will result in an error. (4k is defined as having atotal pixel count of 3840x2160).
  - Range: `1.1` to `10`

- **`fidelity`** (`FidelityEnum`, _optional_):
  The enhancement intensity. 'high' applies mild enhancement while keeping visual texture close to the source video. 'medium' provides a balanced image quality enhancement. Default value: `"high"`
  - Default: `"high"`
  - Options: `"high"`, `"medium"`

- **`bit_depth`** (`BitDepthEnum`, _optional_):
  The color bit depth of the output video. 10-bit and 12-bit output require the Pro enhancement tier. Default value: `"8"`
  - Default: `8`
  - Options: `8`, `10`, `12`



**Required Parameters Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/bytedance_video_upscaler_input.mp4"
}
```

**Full Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/bytedance_video_upscaler_input.mp4",
  "target_resolution": "1080p",
  "target_fps": 30,
  "enhancement_preset": "general",
  "enhancement_tier": "standard",
  "fidelity": "high",
  "bit_depth": 8
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/bytedance_video_upscaler_output.mp4"}

- **`duration`** (`float`, _required_):
  Duration of audio input/video output as used for billing.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/bytedance_video_upscaler_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/bytedance-upscaler/upscale/video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/bytedance_video_upscaler_input.mp4"
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
    "fal-ai/bytedance-upscaler/upscale/video",
    arguments={
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/bytedance_video_upscaler_input.mp4"
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

const result = await fal.subscribe("fal-ai/bytedance-upscaler/upscale/video", {
  input: {
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/bytedance_video_upscaler_input.mp4"
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

- [Model Playground](https://fal.ai/models/fal-ai/bytedance-upscaler/upscale/video)
- [API Documentation](https://fal.ai/models/fal-ai/bytedance-upscaler/upscale/video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/bytedance-upscaler/upscale/video)

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

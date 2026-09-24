# Flashvsr

> Upscale your videos using FlashVSR with the fastest speeds!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/flashvsr/upscale/video`
- **Model ID**: `fal-ai/flashvsr/upscale/video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: upscale, video-to-video



## Pricing

Your request will cost $0.0005 per megapixel of video data (width × height × frames).
For example, if your upscaled video is 1920×1080 with 121 frames, the total cost will be $0.125.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`upscale_factor`** (`float`, _optional_):
  Upscaling factor to be used. Default value: `2`
  - Default: `2`
  - Range: `1` to `4`

- **`seed`** (`integer`, _optional_):
  The random seed used for the generation process.

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned inline and not stored in history.
  - Default: `false`

- **`video_url`** (`string`, _required_):
  The input video to be upscaled
  - Examples: "https://v3b.fal.media/files/b/0a959993/ev11uf0rrsKkBafCw9QKe_video.mp4"

- **`acceleration`** (`AccelerationEnum`, _optional_):
  Acceleration mode for VAE decoding. Options: regular (best quality), high (balanced), full (fastest). More accerleation means longer duration videos can be processed too. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"regular"`, `"high"`, `"full"`

- **`color_fix`** (`boolean`, _optional_):
  Color correction enabled. Default value: `true`
  - Default: `true`

- **`quality`** (`integer`, _optional_):
  Quality level for tile blending (0-100). Controls overlap between tiles to prevent grid artifacts. Higher values provide better quality with more overlap. Recommended: 70-85 for high-res videos, 50-70 for faster processing. Default value: `70`
  - Default: `70`
  - Range: `0` to `100`

- **`preserve_audio`** (`boolean`, _optional_):
  Copy the original audio tracks into the upscaled video using FFmpeg when possible.
  - Default: `false`

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



**Required Parameters Example**:

```json
{
  "video_url": "https://v3b.fal.media/files/b/0a959993/ev11uf0rrsKkBafCw9QKe_video.mp4"
}
```

**Full Example**:

```json
{
  "upscale_factor": 2,
  "video_url": "https://v3b.fal.media/files/b/0a959993/ev11uf0rrsKkBafCw9QKe_video.mp4",
  "acceleration": "regular",
  "color_fix": true,
  "quality": 70,
  "output_format": "X264 (.mp4)",
  "output_quality": "high",
  "output_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Upscaled video file after processing

- **`seed`** (`integer`, _required_):
  The random seed used for the generation process.



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
  --url https://fal.run/fal-ai/flashvsr/upscale/video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://v3b.fal.media/files/b/0a959993/ev11uf0rrsKkBafCw9QKe_video.mp4"
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
    "fal-ai/flashvsr/upscale/video",
    arguments={
        "video_url": "https://v3b.fal.media/files/b/0a959993/ev11uf0rrsKkBafCw9QKe_video.mp4"
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

const result = await fal.subscribe("fal-ai/flashvsr/upscale/video", {
  input: {
    video_url: "https://v3b.fal.media/files/b/0a959993/ev11uf0rrsKkBafCw9QKe_video.mp4"
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

- [Model Playground](https://fal.ai/models/fal-ai/flashvsr/upscale/video)
- [API Documentation](https://fal.ai/models/fal-ai/flashvsr/upscale/video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flashvsr/upscale/video)

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

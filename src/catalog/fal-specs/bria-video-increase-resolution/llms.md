# Video

> Professional-grade video upscaler with strong temporal consistency, enhancing videos up to 8K resolution. Trained on fully licensed and commercially safe data - risk-free for production and enterprise use.


## Overview

- **Endpoint**: `https://fal.run/bria/video/increase-resolution`
- **Model ID**: `bria/video/increase-resolution`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: video-upscaling, upscale



## Pricing

- **Price**: $0.14 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`output_container_and_codec`** (`OutputContainerAndCodecEnum`, _optional_):
  Output container and codec. Options: mp4_h265, mp4_h264, webm_vp9, mov_h265, mov_proresks, mkv_h265, mkv_h264, mkv_vp9, gif. Default value: `"webm_vp9"`
  - Default: `"webm_vp9"`
  - Options: `"mp4_h265"`, `"mp4_h264"`, `"webm_vp9"`, `"mov_h265"`, `"mov_proresks"`, `"mkv_h265"`, `"mkv_h264"`, `"mkv_vp9"`, `"gif"`

- **`preserve_audio`** (`boolean`, _optional_):
  If true, audio will be preserved in the output video. Default value: `true`
  - Default: `true`

- **`video_url`** (`string`, _required_):
  Input video to increase resolution. Size should be less than 7680,4320 and duration less than 30s.
  - Examples: "https://bria-datasets.s3.us-east-1.amazonaws.com/video_increase_res/3446608-sd_426_240_25fps.mp4"

- **`desired_increase`** (`DesiredIncreaseEnum`, _optional_):
  desired_increase factor. Options: 2x, 4x. Default value: `"2"`
  - Default: `"2"`
  - Options: `"2"`, `"4"`



**Required Parameters Example**:

```json
{
  "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/video_increase_res/3446608-sd_426_240_25fps.mp4"
}
```

**Full Example**:

```json
{
  "output_container_and_codec": "webm_vp9",
  "preserve_audio": true,
  "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/video_increase_res/3446608-sd_426_240_25fps.mp4",
  "desired_increase": "2"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`Video | File`, _required_):
  Video with removed background and audio.
  - One of: Video | File



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
  --url https://fal.run/bria/video/increase-resolution \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/video_increase_res/3446608-sd_426_240_25fps.mp4"
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
    "bria/video/increase-resolution",
    arguments={
        "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/video_increase_res/3446608-sd_426_240_25fps.mp4"
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

const result = await fal.subscribe("bria/video/increase-resolution", {
  input: {
    video_url: "https://bria-datasets.s3.us-east-1.amazonaws.com/video_increase_res/3446608-sd_426_240_25fps.mp4"
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

- [Model Playground](https://fal.ai/models/bria/video/increase-resolution)
- [API Documentation](https://fal.ai/models/bria/video/increase-resolution/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/video/increase-resolution)

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

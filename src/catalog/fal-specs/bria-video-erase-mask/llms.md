# Video

> High-fidelity mask-based video object removal with strong temporal consistency. Erase unwanted objects, people, or elements while preserving aesthetic quality. Trained on licensed data for risk-free commercial use.


## Overview

- **Endpoint**: `https://fal.run/bria/video/erase/mask`
- **Model ID**: `bria/video/erase/mask`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: bria, video, erase



## Pricing

- **Price**: $0.14 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`output_container_and_codec`** (`OutputContainerAndCodecEnum`, _optional_):
  Output container and codec. Options: mp4_h265, mp4_h264, webm_vp9, gif, mov_h264, mov_h265, mov_proresks, mkv_h264, mkv_h265, mkv_vp9, mkv_mpeg4. Default value: `"mp4_h264"`
  - Default: `"mp4_h264"`
  - Options: `"mp4_h265"`, `"mp4_h264"`, `"webm_vp9"`, `"gif"`, `"mov_h264"`, `"mov_h265"`, `"mov_proresks"`, `"mkv_h264"`, `"mkv_h265"`, `"mkv_vp9"`, `"mkv_mpeg4"`

- **`auto_trim`** (`boolean`, _optional_):
  auto trim the video, to working duration ( 5s ) Default value: `true`
  - Default: `true`

- **`preserve_audio`** (`boolean`, _optional_):
  If true, audio will be preserved in the output video. Default value: `true`
  - Default: `true`

- **`video_url`** (`string`, _required_):
  Input video to erase object from. duration must be less than 5s.
  - Examples: "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_video.mp4"

- **`mask_video_url`** (`string`, _required_):
  Input video to mask erase object from. duration must be less than 5s.
  - Examples: "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_mask.mp4"



**Required Parameters Example**:

```json
{
  "video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_video.mp4",
  "mask_video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_mask.mp4"
}
```

**Full Example**:

```json
{
  "output_container_and_codec": "mp4_h264",
  "auto_trim": true,
  "preserve_audio": true,
  "video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_video.mp4",
  "mask_video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_mask.mp4"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`Video | File`, _required_):
  Final video.
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
  --url https://fal.run/bria/video/erase/mask \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_video.mp4",
     "mask_video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_mask.mp4"
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
    "bria/video/erase/mask",
    arguments={
        "video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_video.mp4",
        "mask_video_url": "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_mask.mp4"
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

const result = await fal.subscribe("bria/video/erase/mask", {
  input: {
    video_url: "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_video.mp4",
    mask_video_url: "https://bria-test-images.s3.us-east-1.amazonaws.com/videos/eraser/video1_mask.mp4"
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

- [Model Playground](https://fal.ai/models/bria/video/erase/mask)
- [API Documentation](https://fal.ai/models/bria/video/erase/mask/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/video/erase/mask)

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

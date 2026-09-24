# Crystal Upscaler [Video]

> Do high precision video upscaling that respects the original video perfectly using Crystal Upscaler's new video upscaling method!


## Overview

- **Endpoint**: `https://fal.run/clarityai/crystal-video-upscaler`
- **Model ID**: `clarityai/crystal-video-upscaler`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: upscale, video-to-video



## Pricing

Pricing is **$0.10 per megapixel per second**. The total cost is multiplied based on the video’s frame rate (FPS), using **30-FPS increments**:
- Up to **30 FPS** → **1× multiplier**
- Up to **60 FPS** → **2× multiplier**
- Up to **90 FPS** → **3× multiplier**


For instance, a video upscaled to a resolution of 2440 × 1440, with a frame rate of 30 FPS and a duration of 4 seconds, is priced as follows: 
3.5 (megapixels) × 4 (seconds) × 1 (FPS multiplier for 0–30 FPS) × $0.10 = $1.40

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL to the input video.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/crystal_upscaler/video_upscaling/video_in.mp4"

- **`scale_factor`** (`float`, _optional_):
  Scale factor. The scale factor must be chosen such that the upscaled video does not exceed 5K resolution. Default value: `2`
  - Default: `2`
  - Range: `1` to `200`
  - Examples: 2



**Required Parameters Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/crystal_upscaler/video_upscaling/video_in.mp4"
}
```

**Full Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/crystal_upscaler/video_upscaling/video_in.mp4",
  "scale_factor": 2
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  URL to the upscaled video
  - Examples: {"fps":23.130193905817176,"num_frames":302,"url":"https://storage.googleapis.com/falserverless/example_outputs/crystal_upscaler/video_upscaling/video_out.mp4","height":2160,"duration":13.056527,"width":4096,"content_type":"video/mp4","file_name":"w0VQQvPdwvV2GSCtRTMzh_hDH8SPrB.mp4"}



**Example Response**:

```json
{
  "video": {
    "fps": 23.130193905817176,
    "num_frames": 302,
    "url": "https://storage.googleapis.com/falserverless/example_outputs/crystal_upscaler/video_upscaling/video_out.mp4",
    "height": 2160,
    "duration": 13.056527,
    "width": 4096,
    "content_type": "video/mp4",
    "file_name": "w0VQQvPdwvV2GSCtRTMzh_hDH8SPrB.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/clarityai/crystal-video-upscaler \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/crystal_upscaler/video_upscaling/video_in.mp4"
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
    "clarityai/crystal-video-upscaler",
    arguments={
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/crystal_upscaler/video_upscaling/video_in.mp4"
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

const result = await fal.subscribe("clarityai/crystal-video-upscaler", {
  input: {
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/crystal_upscaler/video_upscaling/video_in.mp4"
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

- [Model Playground](https://fal.ai/models/clarityai/crystal-video-upscaler)
- [API Documentation](https://fal.ai/models/clarityai/crystal-video-upscaler/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=clarityai/crystal-video-upscaler)

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

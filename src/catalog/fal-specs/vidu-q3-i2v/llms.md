# Vidu

> Vidu's latest Q3 pro models.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/q3/image-to-video`
- **Model ID**: `fal-ai/vidu/q3/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: image-to-video



## Pricing

Your request will cost 0.07 $ per video second for 360p and 540 p, cost will be 2.2x for 720p and 1080p resolution.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Text prompt for video generation, max 2000 characters Default value: `""`
  - Default: `""`
  - Examples: "The astronaut waved and the camera moved up."

- **`image_url`** (`string`, _required_):
  URL or base64 image to use as the starting frame
  - Examples: "https://prod-ss-images.s3.cn-northwest-1.amazonaws.com.cn/vidu-maas/template/image2video.png"

- **`end_image_url`** (`string`, _optional_):
  URL of the image to use as the ending frame. When provided, generates a transition video between start and end frames.

- **`duration`** (`integer`, _optional_):
  Duration of the video in seconds (1-16 for Q3 models) Default value: `5`
  - Default: `5`
  - Range: `1` to `16`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output video resolution. Note: 360p is not available when end_image_url is provided. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"360p"`, `"540p"`, `"720p"`, `"1080p"`

- **`audio`** (`boolean`, _optional_):
  Whether to use direct audio-video generation. When true, outputs video with sound (including dialogue and sound effects). Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "image_url": "https://prod-ss-images.s3.cn-northwest-1.amazonaws.com.cn/vidu-maas/template/image2video.png"
}
```

**Full Example**:

```json
{
  "prompt": "The astronaut waved and the camera moved up.",
  "image_url": "https://prod-ss-images.s3.cn-northwest-1.amazonaws.com.cn/vidu-maas/template/image2video.png",
  "duration": 5,
  "resolution": "720p",
  "audio": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video from image using the Q3 model
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8c9189/n9z3uUDPqmU2msAtqr25-_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8c9189/n9z3uUDPqmU2msAtqr25-_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/q3/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://prod-ss-images.s3.cn-northwest-1.amazonaws.com.cn/vidu-maas/template/image2video.png"
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
    "fal-ai/vidu/q3/image-to-video",
    arguments={
        "image_url": "https://prod-ss-images.s3.cn-northwest-1.amazonaws.com.cn/vidu-maas/template/image2video.png"
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

const result = await fal.subscribe("fal-ai/vidu/q3/image-to-video", {
  input: {
    image_url: "https://prod-ss-images.s3.cn-northwest-1.amazonaws.com.cn/vidu-maas/template/image2video.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/q3/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/q3/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/q3/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

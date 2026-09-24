# Grok Imagine Video 1.5

> Generate videos from images with audio using xAI's Grok Imagine 1.5 Video model.



## Overview

- **Endpoint**: `https://fal.run/xai/grok-imagine-video/v1.5/image-to-video`
- **Model ID**: `xai/grok-imagine-video/v1.5/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Priced per second of output video, by resolution: 480p at $0.08/sec, 720p at $0.14/sec, 1080p at $0.25/sec. A 5-second clip costs $0.40 at 480p, $0.70 at 720p, and $1.25 at 1080p. Cost scales linearly with duration. Each reference image adds $0.01 (1–7 supported). A reference audio clip, if provided, is included at no extra cost.


For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text description of desired changes or motion in the video.
  - Examples: "Medieval knight in ornate armor walking through a mystical forest, bioluminescent plants pulsing with light, ancient stone ruins overgrown with glowing vines, over-the-shoulder camera, dark fantasy aesthetic, volumetric fog and Lumen lighting"

- **`duration`** (`integer`, _optional_):
  Video duration in seconds. Default value: `6`
  - Default: `6`
  - Range: `1` to `15`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the output video. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`, `"1080p"`

- **`image_url`** (`string`, _required_):
  URL of the input image for video generation.
  - Examples: "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"



**Required Parameters Example**:

```json
{
  "prompt": "Medieval knight in ornate armor walking through a mystical forest, bioluminescent plants pulsing with light, ancient stone ruins overgrown with glowing vines, over-the-shoulder camera, dark fantasy aesthetic, volumetric fog and Lumen lighting",
  "image_url": "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
}
```

**Full Example**:

```json
{
  "prompt": "Medieval knight in ornate armor walking through a mystical forest, bioluminescent plants pulsing with light, ancient stone ruins overgrown with glowing vines, over-the-shoulder camera, dark fantasy aesthetic, volumetric fog and Lumen lighting",
  "duration": 6,
  "resolution": "720p",
  "image_url": "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video.
  - Examples: {"fps":24,"num_frames":145,"file_name":"0Ci1dviuSnEyUZzBUq-_5_nu7MrAAa.mp4","width":1280,"duration":6.041667,"content_type":"video/mp4","height":720,"url":"https://v3b.fal.media/files/b/0a8b90e0/0Ci1dviuSnEyUZzBUq-_5_nu7MrAAa.mp4"}



**Example Response**:

```json
{
  "video": {
    "fps": 24,
    "num_frames": 145,
    "file_name": "0Ci1dviuSnEyUZzBUq-_5_nu7MrAAa.mp4",
    "width": 1280,
    "duration": 6.041667,
    "content_type": "video/mp4",
    "height": 720,
    "url": "https://v3b.fal.media/files/b/0a8b90e0/0Ci1dviuSnEyUZzBUq-_5_nu7MrAAa.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/xai/grok-imagine-video/v1.5/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Medieval knight in ornate armor walking through a mystical forest, bioluminescent plants pulsing with light, ancient stone ruins overgrown with glowing vines, over-the-shoulder camera, dark fantasy aesthetic, volumetric fog and Lumen lighting",
     "image_url": "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
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
    "xai/grok-imagine-video/v1.5/image-to-video",
    arguments={
        "prompt": "Medieval knight in ornate armor walking through a mystical forest, bioluminescent plants pulsing with light, ancient stone ruins overgrown with glowing vines, over-the-shoulder camera, dark fantasy aesthetic, volumetric fog and Lumen lighting",
        "image_url": "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
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

const result = await fal.subscribe("xai/grok-imagine-video/v1.5/image-to-video", {
  input: {
    prompt: "Medieval knight in ornate armor walking through a mystical forest, bioluminescent plants pulsing with light, ancient stone ruins overgrown with glowing vines, over-the-shoulder camera, dark fantasy aesthetic, volumetric fog and Lumen lighting",
    image_url: "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
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

- [Model Playground](https://fal.ai/models/xai/grok-imagine-video/v1.5/image-to-video)
- [API Documentation](https://fal.ai/models/xai/grok-imagine-video/v1.5/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=xai/grok-imagine-video/v1.5/image-to-video)

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

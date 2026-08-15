# Grok Imagine Reference to Video

> Generate videos using multiple reference images with xAI's Grok Imagine video model


## Overview

- **Endpoint**: `https://fal.run/xai/grok-imagine-video/reference-to-video`
- **Model ID**: `xai/grok-imagine-video/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: video-edit, v2v, grok, xai



## Pricing

A **6s** **480p** video will cost **$0.302** (**$0.05** per second of **480p** video + **$0.002** for image input). At an output resolution of **480p**, every second costs **$0.05**, and at **720p**, every second costs **$0.07**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the video to generate. Use @Image1, @Image2, etc. to reference specific images from reference_image_urls in order.
  - Examples: "A @Image1 running through a sunlit meadow, cinematic slow motion"

- **`reference_image_urls`** (`list<string>`, _required_):
  One or more reference image URLs to guide the video generation as style and content references. Reference in prompt as @Image1, @Image2, etc. Maximum 7 images.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"]

- **`duration`** (`integer`, _optional_):
  Video duration in seconds. Default value: `8`
  - Default: `8`
  - Range: `1` to `10`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"4:3"`, `"3:2"`, `"1:1"`, `"2:3"`, `"3:4"`, `"9:16"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the output video. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"720p"`



**Required Parameters Example**:

```json
{
  "prompt": "A @Image1 running through a sunlit meadow, cinematic slow motion",
  "reference_image_urls": [
    "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "A @Image1 running through a sunlit meadow, cinematic slow motion",
  "reference_image_urls": [
    "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
  ],
  "duration": 8,
  "aspect_ratio": "16:9",
  "resolution": "480p"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video.
  - Examples: {"height":720,"content_type":"video/mp4","width":1280,"url":"https://v3b.fal.media/files/b/0a8b90e4/r2v_output.mp4","fps":24,"num_frames":192,"duration":8,"file_name":"r2v_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "height": 720,
    "content_type": "video/mp4",
    "width": 1280,
    "url": "https://v3b.fal.media/files/b/0a8b90e4/r2v_output.mp4",
    "fps": 24,
    "num_frames": 192,
    "duration": 8,
    "file_name": "r2v_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/xai/grok-imagine-video/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A @Image1 running through a sunlit meadow, cinematic slow motion",
     "reference_image_urls": [
       "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"
     ]
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
    "xai/grok-imagine-video/reference-to-video",
    arguments={
        "prompt": "A @Image1 running through a sunlit meadow, cinematic slow motion",
        "reference_image_urls": ["https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"]
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

const result = await fal.subscribe("xai/grok-imagine-video/reference-to-video", {
  input: {
    prompt: "A @Image1 running through a sunlit meadow, cinematic slow motion",
    reference_image_urls: ["https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png"]
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

- [Model Playground](https://fal.ai/models/xai/grok-imagine-video/reference-to-video)
- [API Documentation](https://fal.ai/models/xai/grok-imagine-video/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=xai/grok-imagine-video/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

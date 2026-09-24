# Kling Video 4K Video to Video Edit

> Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/o3/4k/video-to-video/edit`
- **Model ID**: `fal-ai/kling-video/o3/4k/video-to-video/edit`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: utility, editing



## Pricing

For every second of video you generated, you will be charged **$0.42** regardless of whether audio is on or off. For example, a **5s** video will cost **$2.10**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation. Reference video as @Video1.
  - Examples: "Change environment to be fully snow as @Image1. Replace animal with @Element1"

- **`video_url`** (`string`, _required_):
  Reference video URL. Only .mp4/.mov formats, 3-15s duration, 720-3840px resolution, max 200MB.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/video_reference.mp4"

- **`image_urls`** (`list<string>`, _optional_):
  Reference images for style/appearance. Reference in prompt as @Image1, @Image2, etc. Maximum 4 total (elements + reference images) when using video.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/image_url1.jpg"]

- **`keep_audio`** (`boolean`, _optional_):
  Whether to keep the original audio from the reference video. Default value: `true`
  - Default: `true`

- **`elements`** (`list<KlingV3ImageElementInput>`, _optional_):
  Elements (characters/objects) to include. Reference in prompt as @Element1, @Element2.
  - Array of KlingV3ImageElementInput
  - Examples: [{"frontal_image_url":"https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/element1_front.png","reference_image_urls":["https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/element1_reference1.png"]}]

- **`shot_type`** (`string`, _optional_):
  The type of multi-shot video generation. Default value: `"customize"`
  - Default: `"customize"`



**Required Parameters Example**:

```json
{
  "prompt": "Change environment to be fully snow as @Image1. Replace animal with @Element1",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/video_reference.mp4"
}
```

**Full Example**:

```json
{
  "prompt": "Change environment to be fully snow as @Image1. Replace animal with @Element1",
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/video_reference.mp4",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/image_url1.jpg"
  ],
  "keep_audio": true,
  "elements": [
    {
      "frontal_image_url": "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/element1_front.png",
      "reference_image_urls": [
        "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/element1_reference1.png"
      ]
    }
  ],
  "shot_type": "customize"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.
  - Examples: {"file_size":4322769,"file_name":"output.mp4","content_type":"video/mp4","url":"https://storage.googleapis.com/falserverless/example_outputs/kling-o3/pro-v2v-edit/output.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_size": 4322769,
    "file_name": "output.mp4",
    "content_type": "video/mp4",
    "url": "https://storage.googleapis.com/falserverless/example_outputs/kling-o3/pro-v2v-edit/output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/o3/4k/video-to-video/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Change environment to be fully snow as @Image1. Replace animal with @Element1",
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/video_reference.mp4"
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
    "fal-ai/kling-video/o3/4k/video-to-video/edit",
    arguments={
        "prompt": "Change environment to be fully snow as @Image1. Replace animal with @Element1",
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/video_reference.mp4"
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

const result = await fal.subscribe("fal-ai/kling-video/o3/4k/video-to-video/edit", {
  input: {
    prompt: "Change environment to be fully snow as @Image1. Replace animal with @Element1",
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/kling-o3/pro-v2v-edit/video_reference.mp4"
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/o3/4k/video-to-video/edit)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/o3/4k/video-to-video/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/o3/4k/video-to-video/edit)

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

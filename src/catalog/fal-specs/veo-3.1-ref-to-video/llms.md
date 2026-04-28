# Veo 3.1

> Generate Videos from images using Google's Veo 3.1


## Overview

- **Endpoint**: `https://fal.run/fal-ai/veo3.1/reference-to-video`
- **Model ID**: `fal-ai/veo3.1/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

For every second of video you generate you will be charged $0.20 without audio or $0.40 with audio for 720p or 1080p. At 4k, you will be charged $0.40 per second without audio, or $0.60 with audio. For example, 8 second video at 1080p with audio on will cost $3.20

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the video you want to generate
  - Examples: "A chimpanzee wearing overalls frolics in the grassy field, gently playing with the butterflies. In the background, a circus tent and carousel beckon."

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`duration`** (`string`, _optional_):
  The duration of the generated video. Default value: `"8s"`
  - Default: `"8s"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"720p"`, `"1080p"`, `"4k"`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the video. Default value: `true`
  - Default: `true`

- **`auto_fix`** (`boolean`, _optional_):
  Whether to automatically attempt to fix prompts that fail content policy or other validation checks by rewriting them.
  - Default: `false`

- **`safety_tolerance`** (`SafetyToleranceEnum`, _optional_):
  The safety tolerance level for content moderation. 1 is the most strict (blocks most content), 6 is the least strict. Default value: `"4"`
  - Default: `"4"`
  - Options: `"1"`, `"2"`, `"3"`, `"4"`, `"5"`, `"6"`

- **`image_urls`** (`list<string>`, _required_):
  URLs of the reference images to use for consistent subject appearance
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-1.png","https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-2.png","https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-3.png"]



**Required Parameters Example**:

```json
{
  "prompt": "A chimpanzee wearing overalls frolics in the grassy field, gently playing with the butterflies. In the background, a circus tent and carousel beckon.",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-1.png",
    "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-2.png",
    "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-3.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "A chimpanzee wearing overalls frolics in the grassy field, gently playing with the butterflies. In the background, a circus tent and carousel beckon.",
  "aspect_ratio": "16:9",
  "duration": "8s",
  "resolution": "720p",
  "generate_audio": true,
  "safety_tolerance": "4",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-1.png",
    "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-2.png",
    "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-3.png"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/veo31-r2v-output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/veo31-r2v-output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/veo3.1/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A chimpanzee wearing overalls frolics in the grassy field, gently playing with the butterflies. In the background, a circus tent and carousel beckon.",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-1.png",
       "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-2.png",
       "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-3.png"
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
    "fal-ai/veo3.1/reference-to-video",
    arguments={
        "prompt": "A chimpanzee wearing overalls frolics in the grassy field, gently playing with the butterflies. In the background, a circus tent and carousel beckon.",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-1.png", "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-2.png", "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-3.png"]
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

const result = await fal.subscribe("fal-ai/veo3.1/reference-to-video", {
  input: {
    prompt: "A chimpanzee wearing overalls frolics in the grassy field, gently playing with the butterflies. In the background, a circus tent and carousel beckon.",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-1.png", "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-2.png", "https://storage.googleapis.com/falserverless/example_inputs/veo31-r2v-input-3.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/veo3.1/reference-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/veo3.1/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/veo3.1/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

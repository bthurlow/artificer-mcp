# Kling LipSync Audio-to-Video

> Kling LipSync is an audio-to-video model that generates realistic lip movements from audio input.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/lipsync/audio-to-video`
- **Model ID**: `fal-ai/kling-video/lipsync/audio-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: audio to video, lipsync



## Pricing

Your request will be priced **$0.014** per input **video seconds**, rolling up to closest **5 second increment**. For example, if your video's duration is 3 seconds, it will be billed as a 5 second video

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  The URL of the video to generate the lip sync for. Supports .mp4/.mov, ≤100MB, 2–10s, 720p/1080p only, width/height 720–1920px.
  - Examples: "https://fal.media/files/koala/8teUPbRRMtAUTORDvqy0l.mp4"

- **`audio_url`** (`string`, _required_):
  The URL of the audio to generate the lip sync for. Minimum duration is 2s and maximum duration is 60s. Maximum file size is 5MB.
  - Examples: "https://storage.googleapis.com/falserverless/kling/kling-audio.mp3"



**Required Parameters Example**:

```json
{
  "video_url": "https://fal.media/files/koala/8teUPbRRMtAUTORDvqy0l.mp4",
  "audio_url": "https://storage.googleapis.com/falserverless/kling/kling-audio.mp3"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://storage.googleapis.com/falserverless/kling/kling_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/kling/kling_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/lipsync/audio-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://fal.media/files/koala/8teUPbRRMtAUTORDvqy0l.mp4",
     "audio_url": "https://storage.googleapis.com/falserverless/kling/kling-audio.mp3"
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
    "fal-ai/kling-video/lipsync/audio-to-video",
    arguments={
        "video_url": "https://fal.media/files/koala/8teUPbRRMtAUTORDvqy0l.mp4",
        "audio_url": "https://storage.googleapis.com/falserverless/kling/kling-audio.mp3"
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

const result = await fal.subscribe("fal-ai/kling-video/lipsync/audio-to-video", {
  input: {
    video_url: "https://fal.media/files/koala/8teUPbRRMtAUTORDvqy0l.mp4",
    audio_url: "https://storage.googleapis.com/falserverless/kling/kling-audio.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/lipsync/audio-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/lipsync/audio-to-video)

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

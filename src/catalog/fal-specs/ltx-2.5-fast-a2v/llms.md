# Ltx 2.5 Audio to Video Fast

> LTX-2.5 is Lightricks' open-source audio-video model. This endpoint generates video timed to a supplied audio clip in a speed-optimized mode — useful for music-driven content, dialogue-led shorts, and ads keyed to a track.


## Overview

- **Endpoint**: `https://fal.run/lightricks/ltx-2.5/audio-to-video/fast`
- **Model ID**: `lightricks/ltx-2.5/audio-to-video/fast`
- **Category**: audio-to-video
- **Kind**: inference
**Tags**: stylized, transform, lip-sync



## Pricing

Billing is calculated per second of the input audio. At **1080p**, your request will cost **$0.13** per second. Native audio is included. For **$1** you can run this model for approximately **7 seconds** of input audio at **1080p**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to generate a video from. Duration must be between 2 and 20 seconds; pro models support a maximum of 10 seconds. Must be publicly accessible or base64 data URI.
  - Examples: "https://v3b.fal.media/files/b/0a90dfe7/3a-DUXzO79XWIYwUDfHZX_output.mp3"

- **`image_url`** (`string`, _optional_):
  URL of an image to use as the first frame of the video. If not provided, prompt is required.
  - Examples: "https://v3b.fal.media/files/b/0a90dfd2/G1zBOgd-17yqZ-2S5TN4j_M3nzt3Sp.png"

- **`prompt`** (`string`, _optional_):
  Text description of how the video should be generated. Required if image_url is not provided. When image_url is provided, this describes how the image should be animated.
  - Examples: "A woman whispering to the microphone"

- **`guidance_scale`** (`float`, _optional_):
  Guidance scale for video generation. Higher values make the output more closely follow the prompt. Defaults to 5 for text-to-video, or 9 when providing an image.
  - Range: `1` to `50`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image, or defaults to 16:9 if no image is provided. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"9:16"`



**Required Parameters Example**:

```json
{
  "audio_url": "https://v3b.fal.media/files/b/0a90dfe7/3a-DUXzO79XWIYwUDfHZX_output.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://v3b.fal.media/files/b/0a90dfe7/3a-DUXzO79XWIYwUDfHZX_output.mp3",
  "image_url": "https://v3b.fal.media/files/b/0a90dfd2/G1zBOgd-17yqZ-2S5TN4j_M3nzt3Sp.png",
  "prompt": "A woman whispering to the microphone",
  "aspect_ratio": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file
  - Examples: {"file_name":"qqP0ClY8E3d83X8y0zLse_shyIe9XU.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a90dfec/qqP0ClY8E3d83X8y0zLse_shyIe9XU.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "qqP0ClY8E3d83X8y0zLse_shyIe9XU.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a90dfec/qqP0ClY8E3d83X8y0zLse_shyIe9XU.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/lightricks/ltx-2.5/audio-to-video/fast \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://v3b.fal.media/files/b/0a90dfe7/3a-DUXzO79XWIYwUDfHZX_output.mp3"
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
    "lightricks/ltx-2.5/audio-to-video/fast",
    arguments={
        "audio_url": "https://v3b.fal.media/files/b/0a90dfe7/3a-DUXzO79XWIYwUDfHZX_output.mp3"
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

const result = await fal.subscribe("lightricks/ltx-2.5/audio-to-video/fast", {
  input: {
    audio_url: "https://v3b.fal.media/files/b/0a90dfe7/3a-DUXzO79XWIYwUDfHZX_output.mp3"
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

- [Model Playground](https://fal.ai/models/lightricks/ltx-2.5/audio-to-video/fast)
- [API Documentation](https://fal.ai/models/lightricks/ltx-2.5/audio-to-video/fast/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=lightricks/ltx-2.5/audio-to-video/fast)

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

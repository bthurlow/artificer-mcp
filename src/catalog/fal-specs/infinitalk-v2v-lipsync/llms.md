# Infinitalk

> Infinitalk model generates a talking avatar video from an image and audio file. The avatar lip-syncs to the provided audio with natural facial expressions.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/infinitalk/video-to-video`
- **Model ID**: `fal-ai/infinitalk/video-to-video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: video-to-video



## Pricing

- **Price**: $0.3 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the input video.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/video_models/ref_video.mp4"

- **`audio_url`** (`string`, _required_):
  The URL of the audio file.
  - Examples: "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3"

- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A woman with colorful hair talking on a podcast."

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 81 to 129 (inclusive). If the number of frames is greater than 81, the video will be generated with 1.25x more billing units. Default value: `145`
  - Default: `145`
  - Range: `41` to `241`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the video to generate. Must be either 480p or 720p. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"720p"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen. Default value: `42`
  - Default: `42`
  - Range: `0` to `4294967295`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use for generation. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`, `"high"`



**Required Parameters Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/model_tests/video_models/ref_video.mp4",
  "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
  "prompt": "A woman with colorful hair talking on a podcast."
}
```

**Full Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/model_tests/video_models/ref_video.mp4",
  "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
  "prompt": "A woman with colorful hair talking on a podcast.",
  "num_frames": 145,
  "resolution": "480p",
  "seed": 42,
  "acceleration": "regular"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/model_tests/video_models/mk7Ar5IvTtyNjWLRMb-re_dbe605004b664258b38528615afd7e0f.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/model_tests/video_models/mk7Ar5IvTtyNjWLRMb-re_dbe605004b664258b38528615afd7e0f.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/infinitalk/video-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://storage.googleapis.com/falserverless/model_tests/video_models/ref_video.mp4",
     "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
     "prompt": "A woman with colorful hair talking on a podcast."
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
    "fal-ai/infinitalk/video-to-video",
    arguments={
        "video_url": "https://storage.googleapis.com/falserverless/model_tests/video_models/ref_video.mp4",
        "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
        "prompt": "A woman with colorful hair talking on a podcast."
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

const result = await fal.subscribe("fal-ai/infinitalk/video-to-video", {
  input: {
    video_url: "https://storage.googleapis.com/falserverless/model_tests/video_models/ref_video.mp4",
    audio_url: "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
    prompt: "A woman with colorful hair talking on a podcast."
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

- [Model Playground](https://fal.ai/models/fal-ai/infinitalk/video-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/infinitalk/video-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/infinitalk/video-to-video)

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

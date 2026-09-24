# Bytedance Omnihuman V1.5

> Omnihuman v1.5 is a new and improved version of Omnihuman. It generates video using an image of a human figure paired with an audio file. It produces vivid, high-quality videos where the character’s emotions and movements maintain a strong correlation with the audio.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/bytedance/omnihuman/v1.5`
- **Model ID**: `fal-ai/bytedance/omnihuman/v1.5`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: image-to-video, lipsync, 



## Pricing

- **Price**: $0.16 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  The text prompt used to guide the video generation.

- **`image_url`** (`string`, _required_):
  The URL of the image used to generate the video
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_image.png"

- **`mask_url`** (`string`, _optional_):
  The URL of the mask image to apply to the image. Only the person in the white area of the mask will speak.

- **`audio_url`** (`string`, _required_):
  The URL of the audio file to generate the video. Audio must be under 30s long for 1080p generation and under 60s long for 720p generation.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_audio.mp3"

- **`turbo_mode`** (`boolean`, _optional_):
  Generate a video at a faster rate with a slight quality trade-off.
  - Default: `false`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. Defaults to 1080p. 720p generation is faster and higher in quality. 1080p generation is limited to 30s audio and 720p generation is limited to 60s audio. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_image.png",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_audio.mp3"
}
```

**Full Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_image.png",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_audio.mp3",
  "resolution": "1080p"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/omnihuman_v15_output.mp4"}

- **`duration`** (`float`, _required_):
  Duration of audio input/video output as used for billing.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/omnihuman_v15_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/bytedance/omnihuman/v1.5 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_image.png",
     "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_audio.mp3"
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
    "fal-ai/bytedance/omnihuman/v1.5",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_image.png",
        "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_audio.mp3"
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

const result = await fal.subscribe("fal-ai/bytedance/omnihuman/v1.5", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_image.png",
    audio_url: "https://storage.googleapis.com/falserverless/example_inputs/omnihuman_v15_input_audio.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/bytedance/omnihuman/v1.5)
- [API Documentation](https://fal.ai/models/fal-ai/bytedance/omnihuman/v1.5/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/bytedance/omnihuman/v1.5)

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

# AI Avatar Multi

> MultiTalk model generates a multi-person conversation video from an image and audio files. Creates a realistic scene where multiple people speak in sequence.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ai-avatar/multi`
- **Model ID**: `fal-ai/ai-avatar/multi`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform



## Pricing

- **Price**: $0.2 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped.
  - Examples: "https://v3.fal.media/files/elephant/Q2ZU6q-d-1boGXhpDgWs9_15a22f816fd34cad969b2329946267b3.png"

- **`first_audio_url`** (`string`, _required_):
  The URL of the Person 1 audio file.
  - Examples: "https://v3.fal.media/files/monkey/1XKPx3Xu-IhNLbuinVSwP_output.mp3"

- **`second_audio_url`** (`string`, _optional_):
  The URL of the Person 2 audio file.
  - Examples: "https://v3.fal.media/files/zebra/oVKyL8JZ1K2GreeIMxVzm_output.mp3"

- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast. They are engaged in conversation, looking at each other and the camera as they speak. The scene captures a lively and collaborative podcasting session."

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 81 to 129 (inclusive). If the number of frames is greater than 81, the video will be generated with 1.25x more billing units. Default value: `181`
  - Default: `181`
  - Range: `41` to `241`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the video to generate. Must be either 480p or 720p. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"720p"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen. Default value: `81`
  - Default: `81`
  - Range: `0` to `4294967295`

- **`use_only_first_audio`** (`boolean`, _optional_):
  Whether to use only the first audio file.
  - Default: `false`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use for generation. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`, `"high"`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3.fal.media/files/elephant/Q2ZU6q-d-1boGXhpDgWs9_15a22f816fd34cad969b2329946267b3.png",
  "first_audio_url": "https://v3.fal.media/files/monkey/1XKPx3Xu-IhNLbuinVSwP_output.mp3",
  "prompt": "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast. They are engaged in conversation, looking at each other and the camera as they speak. The scene captures a lively and collaborative podcasting session."
}
```

**Full Example**:

```json
{
  "image_url": "https://v3.fal.media/files/elephant/Q2ZU6q-d-1boGXhpDgWs9_15a22f816fd34cad969b2329946267b3.png",
  "first_audio_url": "https://v3.fal.media/files/monkey/1XKPx3Xu-IhNLbuinVSwP_output.mp3",
  "second_audio_url": "https://v3.fal.media/files/zebra/oVKyL8JZ1K2GreeIMxVzm_output.mp3",
  "prompt": "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast. They are engaged in conversation, looking at each other and the camera as they speak. The scene captures a lively and collaborative podcasting session.",
  "num_frames": 181,
  "resolution": "480p",
  "seed": 81,
  "acceleration": "regular"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"file_size":704757,"url":"https://v3.fal.media/files/kangaroo/uAF7N-Ow8WwuvbFw8J4Br_ab27ac57e9464dbea1ef78f7a25469d2.mp4","content_type":"application/octet-stream","file_name":"ab27ac57e9464dbea1ef78f7a25469d2.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "file_size": 704757,
    "url": "https://v3.fal.media/files/kangaroo/uAF7N-Ow8WwuvbFw8J4Br_ab27ac57e9464dbea1ef78f7a25469d2.mp4",
    "content_type": "application/octet-stream",
    "file_name": "ab27ac57e9464dbea1ef78f7a25469d2.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ai-avatar/multi \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3.fal.media/files/elephant/Q2ZU6q-d-1boGXhpDgWs9_15a22f816fd34cad969b2329946267b3.png",
     "first_audio_url": "https://v3.fal.media/files/monkey/1XKPx3Xu-IhNLbuinVSwP_output.mp3",
     "prompt": "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast. They are engaged in conversation, looking at each other and the camera as they speak. The scene captures a lively and collaborative podcasting session."
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
    "fal-ai/ai-avatar/multi",
    arguments={
        "image_url": "https://v3.fal.media/files/elephant/Q2ZU6q-d-1boGXhpDgWs9_15a22f816fd34cad969b2329946267b3.png",
        "first_audio_url": "https://v3.fal.media/files/monkey/1XKPx3Xu-IhNLbuinVSwP_output.mp3",
        "prompt": "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast. They are engaged in conversation, looking at each other and the camera as they speak. The scene captures a lively and collaborative podcasting session."
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

const result = await fal.subscribe("fal-ai/ai-avatar/multi", {
  input: {
    image_url: "https://v3.fal.media/files/elephant/Q2ZU6q-d-1boGXhpDgWs9_15a22f816fd34cad969b2329946267b3.png",
    first_audio_url: "https://v3.fal.media/files/monkey/1XKPx3Xu-IhNLbuinVSwP_output.mp3",
    prompt: "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast. They are engaged in conversation, looking at each other and the camera as they speak. The scene captures a lively and collaborative podcasting session."
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

- [Model Playground](https://fal.ai/models/fal-ai/ai-avatar/multi)
- [API Documentation](https://fal.ai/models/fal-ai/ai-avatar/multi/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ai-avatar/multi)

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

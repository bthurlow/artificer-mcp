# H3 Max Lip Sync Image to Video

> H3 Max Lip Sync generates a video from an image and supplied audio, synchronizing mouth movements to the soundtrack. It supports optional transcription guidance and output resolutions from 480p to 2K.


## Overview

- **Endpoint**: `https://fal.run/minimax/h3-max/lip-sync/image-to-video`
- **Model ID**: `minimax/h3-max/lip-sync/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: lipsync, animation, audio



## Pricing

Billing is calculated per second of generated video. Video costs **$0.05** per second at **480p**, **$0.08** per second at **768p**, **$0.16** per second at **1080p**, and **$0.32** per second at **2K**. A **5-second** video at **768p** costs **$0.40**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Image to animate. The aspect ratio must be between 0.4 and 2.5.

- **`audio_url`** (`string`, _required_):
  Audio to synchronize the mouth movements to, at least 5 seconds long. Audio over 14.8 seconds is automatically clipped to its first 14.8 seconds. The output video matches the clipped audio duration in a single generation.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output resolution. Uses the supported aspect ratio nearest the image. Default value: `"768P"`
  - Default: `"768P"`
  - Options: `"480P"`, `"768P"`, `"1080P"`, `"2K"`

- **`enable_transcription`** (`boolean`, _optional_):
  Transcribe the supplied audio to guide lip synchronization. When disabled, synchronize to the audio without a transcript.
  - Default: `false`

- **`seed`** (`integer`, _optional_):
  Random seed; selected randomly if omitted.
  - Range: `0` to `2147483647`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content safety checks. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "image_url": "",
  "audio_url": ""
}
```

**Full Example**:

```json
{
  "image_url": "",
  "audio_url": "",
  "resolution": "768P",
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Lip-synced video with the supplied soundtrack.

- **`seed`** (`integer`, _required_):
  Random seed used for generation.

- **`duration`** (`float`, _required_):
  Output duration in seconds.

- **`timings`** (`object`, _optional_):
  Timing breakdown in seconds. 'inference' is the DiT denoising time on the GPU backend, summed over every window this request generated. Null on routes that do not report backend timings.



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/minimax/h3-max/lip-sync/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "",
     "audio_url": ""
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
    "minimax/h3-max/lip-sync/image-to-video",
    arguments={
        "image_url": "",
        "audio_url": ""
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

const result = await fal.subscribe("minimax/h3-max/lip-sync/image-to-video", {
  input: {
    image_url: "",
    audio_url: ""
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

- [Model Playground](https://fal.ai/models/minimax/h3-max/lip-sync/image-to-video)
- [API Documentation](https://fal.ai/models/minimax/h3-max/lip-sync/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=minimax/h3-max/lip-sync/image-to-video)

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

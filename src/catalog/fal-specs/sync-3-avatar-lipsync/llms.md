# sync-3 Avatar Image to Video

> sync-3 image to video turns a single still into a talking character, and works with any illustration or animated frame paired with a voice track


## Overview

- **Endpoint**: `https://fal.run/fal-ai/sync-lipsync/v3/image-to-video`
- **Model ID**: `fal-ai/sync-lipsync/v3/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: animation, lip sync, text-to-speech



## Pricing

Your request will cost **$0.1333** per output second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the input image. sync-3 animates the face in the image so it lip-syncs to the provided audio (image-to-video). Supported image formats: JPEG, PNG and WebP.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/echo-mimic-input-image.png"

- **`audio_url`** (`string`, _required_):
  URL of the input audio. The output video matches its duration.
  - Examples: "https://fal.media/files/lion/vyFWygmZsIZlUO4s0nr2n.wav"



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/echo-mimic-input-image.png",
  "audio_url": "https://fal.media/files/lion/vyFWygmZsIZlUO4s0nr2n.wav"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://v3b.fal.media/files/b/0a93c312/TqKMiLtCcTKWSeAWXJRD0_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a93c312/TqKMiLtCcTKWSeAWXJRD0_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/sync-lipsync/v3/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/echo-mimic-input-image.png",
     "audio_url": "https://fal.media/files/lion/vyFWygmZsIZlUO4s0nr2n.wav"
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
    "fal-ai/sync-lipsync/v3/image-to-video",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/echo-mimic-input-image.png",
        "audio_url": "https://fal.media/files/lion/vyFWygmZsIZlUO4s0nr2n.wav"
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

const result = await fal.subscribe("fal-ai/sync-lipsync/v3/image-to-video", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/echo-mimic-input-image.png",
    audio_url: "https://fal.media/files/lion/vyFWygmZsIZlUO4s0nr2n.wav"
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

- [Model Playground](https://fal.ai/models/fal-ai/sync-lipsync/v3/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/sync-lipsync/v3/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/sync-lipsync/v3/image-to-video)

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

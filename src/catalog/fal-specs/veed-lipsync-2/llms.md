# VEED Lipsync

> Generate production-quality lipsync from any audio using VEED's most advanced model yet.


## Overview

- **Endpoint**: `https://fal.run/veed/lipsync/v2`
- **Model ID**: `veed/lipsync/v2`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: veed, lipsync, video-to-video, avatar



## Pricing

Your request will cost **$0.07** for every second of output video.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  Source video to lipsync
  - Examples: "https://v3.fal.media/files/monkey/q1fDPhrpfjfsaRmbhTed4_influencer.mp4"

- **`audio_url`** (`string`, _required_):
  New audio track to articulate
  - Examples: "https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3"



**Required Parameters Example**:

```json
{
  "video_url": "https://v3.fal.media/files/monkey/q1fDPhrpfjfsaRmbhTed4_influencer.mp4",
  "audio_url": "https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Lipsynced video



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
  --url https://fal.run/veed/lipsync/v2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://v3.fal.media/files/monkey/q1fDPhrpfjfsaRmbhTed4_influencer.mp4",
     "audio_url": "https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3"
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
    "veed/lipsync/v2",
    arguments={
        "video_url": "https://v3.fal.media/files/monkey/q1fDPhrpfjfsaRmbhTed4_influencer.mp4",
        "audio_url": "https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3"
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

const result = await fal.subscribe("veed/lipsync/v2", {
  input: {
    video_url: "https://v3.fal.media/files/monkey/q1fDPhrpfjfsaRmbhTed4_influencer.mp4",
    audio_url: "https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3"
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

- [Model Playground](https://fal.ai/models/veed/lipsync/v2)
- [API Documentation](https://fal.ai/models/veed/lipsync/v2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=veed/lipsync/v2)

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

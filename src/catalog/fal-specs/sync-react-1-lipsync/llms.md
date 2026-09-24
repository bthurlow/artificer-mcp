# Sync React-1

> Use React-1 from SyncLabs to refine human emotions and do realistic lip-sync without losing details!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/sync-lipsync/react-1`
- **Model ID**: `fal-ai/sync-lipsync/react-1`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: lipsync, video-to-video



## Pricing

- **Price**: $10 per minutes

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL to the input video. Must be **15 seconds or shorter**.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp4"

- **`audio_url`** (`string`, _required_):
  URL to the input audio. Must be **15 seconds or shorter**.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp3"

- **`emotion`** (`EmotionEnum`, _required_):
  Emotion prompt for the generation. Currently supports single-word emotions only.
  - Options: `"happy"`, `"sad"`, `"angry"`, `"disgusted"`, `"surprised"`, `"neutral"`
  - Examples: "neutral"

- **`model_mode`** (`ModelModeEnum`, _optional_):
  Controls the edit region and movement scope for the model. Available options:
  - `lips`: Only lipsync using react-1 (minimal facial changes).
  - `face`: Lipsync + facial expressions without head movements.
  - `head`: Lipsync + facial expressions + natural talking head movements. Default value: `"face"`
  - Default: `"face"`
  - Options: `"lips"`, `"face"`, `"head"`

- **`lipsync_mode`** (`LipsyncModeEnum`, _optional_):
  Lipsync mode when audio and video durations are out of sync. Default value: `"bounce"`
  - Default: `"bounce"`
  - Options: `"cut_off"`, `"loop"`, `"bounce"`, `"silence"`, `"remap"`

- **`temperature`** (`float`, _optional_):
  Controls the expresiveness of the lipsync. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`



**Required Parameters Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp4",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp3",
  "emotion": "neutral"
}
```

**Full Example**:

```json
{
  "video_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp4",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp3",
  "emotion": "neutral",
  "model_mode": "face",
  "lipsync_mode": "bounce",
  "temperature": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video with synchronized lip and facial movements.
  - Examples: {"content_type":"video/mp4","file_name":"output.mp4","width":1920,"num_frames":169,"fps":24,"duration":7.041667,"height":1088,"url":"https://storage.googleapis.com/falserverless/example_outputs/react_1/output.mp4"}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "file_name": "output.mp4",
    "width": 1920,
    "num_frames": 169,
    "fps": 24,
    "duration": 7.041667,
    "height": 1088,
    "url": "https://storage.googleapis.com/falserverless/example_outputs/react_1/output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/sync-lipsync/react-1 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp4",
     "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp3",
     "emotion": "neutral"
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
    "fal-ai/sync-lipsync/react-1",
    arguments={
        "video_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp4",
        "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp3",
        "emotion": "neutral"
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

const result = await fal.subscribe("fal-ai/sync-lipsync/react-1", {
  input: {
    video_url: "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp4",
    audio_url: "https://storage.googleapis.com/falserverless/example_inputs/react_1/input.mp3",
    emotion: "neutral"
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

- [Model Playground](https://fal.ai/models/fal-ai/sync-lipsync/react-1)
- [API Documentation](https://fal.ai/models/fal-ai/sync-lipsync/react-1/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/sync-lipsync/react-1)

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

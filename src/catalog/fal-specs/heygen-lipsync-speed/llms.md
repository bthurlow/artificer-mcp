# Heygen Lipsync - Speed

> Replace or dub audio on an existing video with fast audio-only lip-sync.



## Overview

- **Endpoint**: `https://fal.run/fal-ai/heygen/v3/lipsync/speed`
- **Model ID**: `fal-ai/heygen/v3/lipsync/speed`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

- **Price**: $0.05 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the source video to lip-sync.
  - Examples: "https://v3b.fal.media/files/b/0a9004c7/FM7Q5tK2b59x66Bl8HC0Z_vt-lang-en.mp4"

- **`audio_url`** (`string`, _required_):
  URL of the replacement audio file.
  - Examples: "https://v3b.fal.media/files/b/example/new_audio.mp3"

- **`title`** (`string`, _optional_):
  Optional title for the lipsync job.

- **`enable_caption`** (`boolean`, _optional_):
  Generate captions in the output video.
  - Default: `false`

- **`enable_dynamic_duration`** (`boolean`, _optional_):
  Allow duration adjustment to match the new audio. Default value: `true`
  - Default: `true`

- **`disable_music_track`** (`boolean`, _optional_):
  Remove background music from the source video.
  - Default: `false`

- **`enable_speech_enhancement`** (`boolean`, _optional_):
  Enhance the replacement audio quality.
  - Default: `false`

- **`start_time`** (`float`, _optional_):
  Start time in seconds for partial lipsync.

- **`end_time`** (`float`, _optional_):
  End time in seconds for partial lipsync.



**Required Parameters Example**:

```json
{
  "video_url": "https://v3b.fal.media/files/b/0a9004c7/FM7Q5tK2b59x66Bl8HC0Z_vt-lang-en.mp4",
  "audio_url": "https://v3b.fal.media/files/b/example/new_audio.mp3"
}
```

**Full Example**:

```json
{
  "video_url": "https://v3b.fal.media/files/b/0a9004c7/FM7Q5tK2b59x66Bl8HC0Z_vt-lang-en.mp4",
  "audio_url": "https://v3b.fal.media/files/b/example/new_audio.mp3",
  "enable_dynamic_duration": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The lip-synced video file with new audio synced.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8f61f5/SwAbhEQ0tNLthNkyTqCRn_overdubbed.mp4"}

- **`caption_file`** (`File`, _optional_):
  Generated caption file when enable_caption is enabled and HeyGen returns one.



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8f61f5/SwAbhEQ0tNLthNkyTqCRn_overdubbed.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/heygen/v3/lipsync/speed \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://v3b.fal.media/files/b/0a9004c7/FM7Q5tK2b59x66Bl8HC0Z_vt-lang-en.mp4",
     "audio_url": "https://v3b.fal.media/files/b/example/new_audio.mp3"
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
    "fal-ai/heygen/v3/lipsync/speed",
    arguments={
        "video_url": "https://v3b.fal.media/files/b/0a9004c7/FM7Q5tK2b59x66Bl8HC0Z_vt-lang-en.mp4",
        "audio_url": "https://v3b.fal.media/files/b/example/new_audio.mp3"
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

const result = await fal.subscribe("fal-ai/heygen/v3/lipsync/speed", {
  input: {
    video_url: "https://v3b.fal.media/files/b/0a9004c7/FM7Q5tK2b59x66Bl8HC0Z_vt-lang-en.mp4",
    audio_url: "https://v3b.fal.media/files/b/example/new_audio.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/heygen/v3/lipsync/speed)
- [API Documentation](https://fal.ai/models/fal-ai/heygen/v3/lipsync/speed/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/heygen/v3/lipsync/speed)

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

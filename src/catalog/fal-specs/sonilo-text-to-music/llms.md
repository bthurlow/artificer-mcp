# Sonilo V1.1 Text to Music

> Generates licensed, commercial-use-safe music from a single text prompt, with full control over style, mood, instrumentation, and exact duration.


## Overview

- **Endpoint**: `https://fal.run/sonilo/v1.1/text-to-music`
- **Model ID**: `sonilo/v1.1/text-to-music`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will cost **$0.0025** per second of output and per sample.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the music to generate.
  - Examples: "A blend of R&B warmth, soul depth, neo-soul texture, gospel spirit, pop clarity, and jazz sophistication."

- **`duration`** (`integer`, _optional_):
  Requested output duration in seconds (max 600). Also used for billing (one billable unit per second per sample, rounded up; each sample under 10s bills as 10s). Default value: `90`
  - Default: `90`
  - Range: `1` to `600`

- **`num_samples`** (`integer`, _optional_):
  How many distinct music tracks to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `3`



**Required Parameters Example**:

```json
{
  "prompt": "A blend of R&B warmth, soul depth, neo-soul texture, gospel spirit, pop clarity, and jazz sophistication."
}
```

**Full Example**:

```json
{
  "prompt": "A blend of R&B warmth, soul depth, neo-soul texture, gospel spirit, pop clarity, and jazz sophistication.",
  "duration": 90,
  "num_samples": 1
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`Audio`, _required_):
  The first generated music track, for quick preview/playback.
  - Examples: {"file_size":3363482,"url":"https://fal.media/files/lion/SI-MFSBz0WtUMW4dAhhQs_jazz1.m4a","content_type":"audio/mp4","file_name":"jazz1.m4a"}

- **`audios`** (`list<Audio>`, _required_):
  All generated music tracks (AAC/m4a), one per sample.
  - Array of Audio
  - Examples: [{"file_size":3363482,"url":"https://fal.media/files/lion/SI-MFSBz0WtUMW4dAhhQs_jazz1.m4a","content_type":"audio/mp4","file_name":"jazz1.m4a"}]



**Example Response**:

```json
{
  "audio": {
    "file_size": 3363482,
    "url": "https://fal.media/files/lion/SI-MFSBz0WtUMW4dAhhQs_jazz1.m4a",
    "content_type": "audio/mp4",
    "file_name": "jazz1.m4a"
  },
  "audios": [
    {
      "file_size": 3363482,
      "url": "https://fal.media/files/lion/SI-MFSBz0WtUMW4dAhhQs_jazz1.m4a",
      "content_type": "audio/mp4",
      "file_name": "jazz1.m4a"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/sonilo/v1.1/text-to-music \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A blend of R&B warmth, soul depth, neo-soul texture, gospel spirit, pop clarity, and jazz sophistication."
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
    "sonilo/v1.1/text-to-music",
    arguments={
        "prompt": "A blend of R&B warmth, soul depth, neo-soul texture, gospel spirit, pop clarity, and jazz sophistication."
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

const result = await fal.subscribe("sonilo/v1.1/text-to-music", {
  input: {
    prompt: "A blend of R&B warmth, soul depth, neo-soul texture, gospel spirit, pop clarity, and jazz sophistication."
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

- [Model Playground](https://fal.ai/models/sonilo/v1.1/text-to-music)
- [API Documentation](https://fal.ai/models/sonilo/v1.1/text-to-music/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=sonilo/v1.1/text-to-music)

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

# V1.1 Text to Sound Effects

> Generates high-quality, commercial-use-safe sound effects from a text prompt, with full control over type, texture, intensity, and exact duration.


## Overview

- **Endpoint**: `https://fal.run/sonilo/v1.1/text-to-sound-effects`
- **Model ID**: `sonilo/v1.1/text-to-sound-effects`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: sfx, audio, effects, 



## Pricing

Your request will cost **$0.0018** per second of output and per sample.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Describe the sound you want to create.
  - Examples: "Heavy rain on a tin roof with distant rolling thunder"

- **`duration`** (`float`, _optional_):
  How long the audio should be, in seconds (0.5 to 180). Default value: `8`
  - Default: `8`
  - Range: `0.5` to `180`

- **`audio_format`** (`AudioFormatEnum`, _optional_):
  Audio file format: aac (default), mp3, wav, or flac. Default value: `"aac"`
  - Default: `"aac"`
  - Options: `"wav"`, `"mp3"`, `"aac"`, `"flac"`



**Required Parameters Example**:

```json
{
  "prompt": "Heavy rain on a tin roof with distant rolling thunder"
}
```

**Full Example**:

```json
{
  "prompt": "Heavy rain on a tin roof with distant rolling thunder",
  "duration": 8,
  "audio_format": "aac"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`Audio`, _required_):
  The generated sound, in your chosen audio format.

- **`audios`** (`list<Audio>`, _required_):
  All generated sounds, one per sample.
  - Array of Audio

- **`watermark`** (`WatermarkInfo`, _optional_):
  Present when the audio carries the inaudible provenance watermark.



**Example Response**:

```json
{
  "audio": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  },
  "audios": [
    {
      "url": "",
      "content_type": "image/png",
      "file_name": "z9RV14K95DvU.png",
      "file_size": 4404019
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/sonilo/v1.1/text-to-sound-effects \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Heavy rain on a tin roof with distant rolling thunder"
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
    "sonilo/v1.1/text-to-sound-effects",
    arguments={
        "prompt": "Heavy rain on a tin roof with distant rolling thunder"
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

const result = await fal.subscribe("sonilo/v1.1/text-to-sound-effects", {
  input: {
    prompt: "Heavy rain on a tin roof with distant rolling thunder"
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

- [Model Playground](https://fal.ai/models/sonilo/v1.1/text-to-sound-effects)
- [API Documentation](https://fal.ai/models/sonilo/v1.1/text-to-sound-effects/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=sonilo/v1.1/text-to-sound-effects)

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

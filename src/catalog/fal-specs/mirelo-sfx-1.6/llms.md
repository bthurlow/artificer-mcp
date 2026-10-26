# Mirelo SFX1.6

> Generate ambient sounds for any text prompt. Now you can turn any SFX into a natural loop for ambient soundscapes.


## Overview

- **Endpoint**: `https://fal.run/mirelo-ai/sfx1.6/text-to-audio`
- **Model ID**: `mirelo-ai/sfx1.6/text-to-audio`
- **Category**: text-to-audio
- **Kind**: inference
**Description**: Generate ambient sounds for any text prompt. Now you can turn any SFX into a natural loop for ambient soundscapes.

**Tags**: text-to-audio, sfx



## Pricing

- **Price**: $0.01 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text_prompt`** (`string`, _required_):
  Text prompt for the generated audio.
  - Examples: "city ambience"

- **`duration`** (`float`, _optional_):
  Duration of the generated audio in seconds. The minimum is 0.1s for ordinary sound effects and 1s when ambience=true. Default value: `10`
  - Default: `10`
  - Range: `0.1` to `60`

- **`ambience`** (`boolean`, _optional_):
  When true, generate a seamlessly loopable ambience tile (room tone, rain, drones, etc.). When false, generate a generic text-conditioned SFX of `duration` seconds.
  - Default: `false`

- **`double_output`** (`boolean`, _optional_):
  Only used when ambience=true: concatenate the loop with itself for a 2x-length output.
  - Default: `false`

- **`num_samples`** (`integer`, _optional_):
  Number of variations to generate. Default value: `2`
  - Default: `2`
  - Range: `1` to `4`

- **`seed`** (`integer`, _optional_):
  Seed for generation. -1 or None for random.
  - Range: `-1` to `18446744073709552000`

- **`upload_audio_format`** (`UploadAudioFormatEnum`, _optional_):
  Audio format for the returned files. Default value: `"wav"`
  - Default: `"wav"`
  - Options: `"wav"`, `"mp3"`, `"aac"`, `"flac"`



**Required Parameters Example**:

```json
{
  "text_prompt": "city ambience"
}
```

**Full Example**:

```json
{
  "text_prompt": "city ambience",
  "duration": 10,
  "num_samples": 2,
  "upload_audio_format": "wav"
}
```


### Output Schema

The API returns the following output format:

- **`model`** (`string`, _required_)

- **`audio`** (`list<Audio>`, _required_):
  Generated SFX audio from a text prompt.
  - Array of Audio
  - Examples: [{"file_name":"text_to_audio_1.wav","url":"https://v3b.fal.media/files/b/kangaroo/text_to_audio_example.wav","content_type":"audio/wav"}]



**Example Response**:

```json
{
  "model": "",
  "audio": [
    {
      "file_name": "text_to_audio_1.wav",
      "url": "https://v3b.fal.media/files/b/kangaroo/text_to_audio_example.wav",
      "content_type": "audio/wav"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/mirelo-ai/sfx1.6/text-to-audio \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text_prompt": "city ambience"
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
    "mirelo-ai/sfx1.6/text-to-audio",
    arguments={
        "text_prompt": "city ambience"
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

const result = await fal.subscribe("mirelo-ai/sfx1.6/text-to-audio", {
  input: {
    text_prompt: "city ambience"
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

- [Model Playground](https://fal.ai/models/mirelo-ai/sfx1.6/text-to-audio)
- [API Documentation](https://fal.ai/models/mirelo-ai/sfx1.6/text-to-audio/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=mirelo-ai/sfx1.6/text-to-audio)

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

# ElevenLabs TTS Turbo v2.5

> Generate high-speed text-to-speech audio using ElevenLabs TTS Turbo v2.5.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/tts/turbo-v2.5`
- **Model ID**: `fal-ai/elevenlabs/tts/turbo-v2.5`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: audio



## Pricing

- **Price**: $0.05 per 1000 characters

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to convert to speech
  - Examples: "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?"

- **`voice`** (`string`, _optional_):
  The voice to use for speech generation Default value: `"Rachel"`
  - Default: `"Rachel"`
  - Examples: "Aria", "Roger", "Sarah", "Laura", "Charlie", "George", "Callum", "River", "Liam", "Charlotte", "Alice", "Matilda", "Will", "Jessica", "Eric", "Chris", "Brian", "Daniel", "Lily", "Bill"

- **`stability`** (`float`, _optional_):
  Voice stability (0-1) Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`

- **`similarity_boost`** (`float`, _optional_):
  Similarity boost (0-1) Default value: `0.75`
  - Default: `0.75`
  - Range: `0` to `1`

- **`style`** (`float`, _optional_):
  Style exaggeration (0-1)
  - Default: `0`
  - Range: `0` to `1`

- **`speed`** (`float`, _optional_):
  Speech speed (0.7-1.2). Values below 1.0 slow down the speech, above 1.0 speed it up. Extreme values may affect quality. Default value: `1`
  - Default: `1`
  - Range: `0.7` to `1.2`

- **`timestamps`** (`boolean`, _optional_):
  Whether to return timestamps for each word in the generated speech
  - Default: `false`

- **`previous_text`** (`string`, _optional_):
  The text that came before the text of the current request. Can be used to improve the speech's continuity when concatenating together multiple generations or to influence the speech's continuity in the current generation.

- **`next_text`** (`string`, _optional_):
  The text that comes after the text of the current request. Can be used to improve the speech's continuity when concatenating together multiple generations or to influence the speech's continuity in the current generation.

- **`language_code`** (`string`, _optional_):
  Language code (ISO 639-1) used to enforce a language for the model. An error will be returned if language code is not supported by the model.

- **`apply_text_normalization`** (`ApplyTextNormalizationEnum`, _optional_):
  This parameter controls text normalization with three modes: 'auto', 'on', and 'off'. When set to 'auto', the system will automatically decide whether to apply text normalization (e.g., spelling out numbers). With 'on', text normalization will always be applied, while with 'off', it will be skipped. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"on"`, `"off"`



**Required Parameters Example**:

```json
{
  "text": "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?"
}
```

**Full Example**:

```json
{
  "text": "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?",
  "voice": "Aria",
  "stability": 0.5,
  "similarity_boost": 0.75,
  "speed": 1,
  "apply_text_normalization": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file
  - Examples: {"url":"https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3"}

- **`timestamps`** (`list<void>`, _optional_):
  Timestamps for each word in the generated speech. Only returned if `timestamps` is set to True in the request.
  - Array of void



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/elevenlabs/tts/turbo-v2.5 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?"
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
    "fal-ai/elevenlabs/tts/turbo-v2.5",
    arguments={
        "text": "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?"
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

const result = await fal.subscribe("fal-ai/elevenlabs/tts/turbo-v2.5", {
  input: {
    text: "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?"
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/tts/turbo-v2.5)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/tts/turbo-v2.5/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/tts/turbo-v2.5)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

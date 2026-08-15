# Elevenlabs

> Generate text-to-speech audio using Eleven-v3 from ElevenLabs.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/tts/eleven-v3`
- **Model ID**: `fal-ai/elevenlabs/tts/eleven-v3`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: audio



## Pricing

- **Price**: $0.1 per 1000 characters

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

- **`timestamps`** (`boolean`, _optional_):
  Whether to return timestamps for each word in the generated speech
  - Default: `false`

- **`language_code`** (`string`, _optional_):
  Language code (ISO 639-1) used to enforce a language for the model.

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
  --url https://fal.run/fal-ai/elevenlabs/tts/eleven-v3 \
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
    "fal-ai/elevenlabs/tts/eleven-v3",
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

const result = await fal.subscribe("fal-ai/elevenlabs/tts/eleven-v3", {
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/tts/eleven-v3)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/tts/eleven-v3/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/tts/eleven-v3)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

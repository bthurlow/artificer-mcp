# MiniMax Voice Cloning

> Clone a voice from a sample audio and generate speech from text prompts using the MiniMax model, which leverages advanced AI techniques to create high-quality text-to-speech.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/minimax/voice-clone`
- **Model ID**: `fal-ai/minimax/voice-clone`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: speech, 



## Pricing

Each voice clone request will cost **$1.5**, with preview inputs costing **$0.3** per 1000 characters.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the input audio file for voice cloning. Should be at least 10 seconds
  long. To retain the voice permanently, use it with a TTS (text-to-speech)
  endpoint at least once within 7 days. Otherwise, it will be
  automatically deleted.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/zonos/demo_voice_zonos.wav"

- **`noise_reduction`** (`boolean`, _optional_):
  Enable noise reduction for the cloned voice
  - Default: `false`

- **`need_volume_normalization`** (`boolean`, _optional_):
  Enable volume normalization for the cloned voice
  - Default: `false`

- **`accuracy`** (`float`, _optional_):
  Text validation accuracy threshold (0-1)
  - Range: `0` to `1`

- **`text`** (`string`, _optional_):
  Text to generate a TTS preview with the cloned voice (optional) Default value: `"Hello, this is a preview of your cloned voice! I hope you like it!"`
  - Default: `"Hello, this is a preview of your cloned voice! I hope you like it!"`
  - Examples: "Hello, this is a preview of your cloned voice! I hope you like it!"

- **`model`** (`ModelEnum`, _optional_):
  TTS model to use for preview. Options: speech-02-hd, speech-02-turbo, speech-01-hd, speech-01-turbo Default value: `"speech-02-hd"`
  - Default: `"speech-02-hd"`
  - Options: `"speech-02-hd"`, `"speech-02-turbo"`, `"speech-01-hd"`, `"speech-01-turbo"`
  - Examples: "speech-02-hd", "speech-02-turbo", "speech-01-hd", "speech-01-turbo"



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/zonos/demo_voice_zonos.wav"
}
```

**Full Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/zonos/demo_voice_zonos.wav",
  "text": "Hello, this is a preview of your cloned voice! I hope you like it!",
  "model": "speech-02-hd"
}
```


### Output Schema

The API returns the following output format:

- **`custom_voice_id`** (`string`, _required_):
  The cloned voice ID for use with TTS

- **`audio`** (`File`, _optional_):
  Preview audio generated with the cloned voice (if requested)
  - Examples: {"url":"https://fal.media/files/kangaroo/kojPUCNZ9iUGFGMR-xb7h_speech.mp3"}



**Example Response**:

```json
{
  "custom_voice_id": "",
  "audio": {
    "url": "https://fal.media/files/kangaroo/kojPUCNZ9iUGFGMR-xb7h_speech.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/minimax/voice-clone \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/model_tests/zonos/demo_voice_zonos.wav"
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
    "fal-ai/minimax/voice-clone",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/model_tests/zonos/demo_voice_zonos.wav"
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

const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/model_tests/zonos/demo_voice_zonos.wav"
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

- [Model Playground](https://fal.ai/models/fal-ai/minimax/voice-clone)
- [API Documentation](https://fal.ai/models/fal-ai/minimax/voice-clone/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/minimax/voice-clone)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

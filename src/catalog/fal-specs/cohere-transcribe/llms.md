# Cohere Transcribe

> Cohere Transcribe turns your business audio into accurate text, ready for search, analytics, and automation


## Overview

- **Endpoint**: `https://fal.run/fal-ai/cohere-transcribe`
- **Model ID**: `fal-ai/cohere-transcribe`
- **Category**: speech-to-text
- **Kind**: inference
**Tags**: speech, transcribe, stt



## Pricing

- **Price**: $0.00006944444 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to transcribe. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg, flac.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"

- **`language`** (`LanguageEnum`, _optional_):
  Language of the audio (ISO 639-1 code). Supported: en, fr, de, it, es, pt, el, nl, pl, zh, ja, ko, vi, ar. Default value: `"en"`
  - Default: `"en"`
  - Options: `"en"`, `"fr"`, `"de"`, `"it"`, `"es"`, `"pt"`, `"el"`, `"nl"`, `"pl"`, `"zh"`, `"ja"`, `"ko"`, `"vi"`, `"ar"`

- **`punctuation`** (`boolean`, _optional_):
  Whether to include punctuation and capitalization in the output. Default value: `true`
  - Default: `true`

- **`max_new_tokens`** (`integer`, _optional_):
  Maximum number of tokens to generate per audio chunk. Default value: `256`
  - Default: `256`
  - Range: `1` to `1024`



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3",
  "language": "en",
  "punctuation": true,
  "max_new_tokens": 256
}
```


### Output Schema

The API returns the following output format:

- **`text`** (`string`, _required_):
  Transcribed text from the audio file.

- **`timings`** (`Timings`, _optional_):
  Performance timing breakdown in seconds.



**Example Response**:

```json
{
  "text": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/cohere-transcribe \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
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
    "fal-ai/cohere-transcribe",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
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

const result = await fal.subscribe("fal-ai/cohere-transcribe", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/cohere-transcribe)
- [API Documentation](https://fal.ai/models/fal-ai/cohere-transcribe/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/cohere-transcribe)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# ElevenLabs Speech to Text

> Generate text from speech using ElevenLabs advanced speech-to-text model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/speech-to-text`
- **Model ID**: `fal-ai/elevenlabs/speech-to-text`
- **Category**: speech-to-text
- **Kind**: inference
**Tags**: speech



## Pricing

- **Price**: $0.03 per minutes

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to transcribe
  - Examples: "https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3"

- **`language_code`** (`string`, _optional_):
  Language code of the audio
  - Examples: "eng", "spa", "fra", "deu", "jpn"

- **`tag_audio_events`** (`boolean`, _optional_):
  Tag audio events like laughter, applause, etc. Default value: `true`
  - Default: `true`

- **`diarize`** (`boolean`, _optional_):
  Whether to annotate who is speaking Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "audio_url": "https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3",
  "language_code": "eng",
  "tag_audio_events": true,
  "diarize": true
}
```


### Output Schema

The API returns the following output format:

- **`text`** (`string`, _required_):
  The full transcribed text

- **`language_code`** (`string`, _required_):
  Detected or specified language code

- **`language_probability`** (`float`, _required_):
  Confidence in language detection

- **`words`** (`list<TranscriptionWord>`, _required_):
  Word-level transcription details
  - Array of TranscriptionWord



**Example Response**:

```json
{
  "text": "",
  "language_code": "",
  "words": [
    {
      "text": "",
      "type": ""
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/elevenlabs/speech-to-text \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3"
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
    "fal-ai/elevenlabs/speech-to-text",
    arguments={
        "audio_url": "https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3"
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

const result = await fal.subscribe("fal-ai/elevenlabs/speech-to-text", {
  input: {
    audio_url: "https://v3.fal.media/files/zebra/zJL_oRY8h5RWwjoK1w7tx_output.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/speech-to-text)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/speech-to-text/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/speech-to-text)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

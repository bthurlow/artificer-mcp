# ElevenLabs Speech to Text - Scribe V2

> Use Scribe-V2 from ElevenLabs to do blazingly fast speech to text inferences!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/speech-to-text/scribe-v2`
- **Model ID**: `fal-ai/elevenlabs/speech-to-text/scribe-v2`
- **Category**: speech-to-text
- **Kind**: inference
**Tags**: speech-to-text



## Pricing

Your request will cost **$0.008 per input audio minutes**. If keyterm is used, you request will cost %30 more.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to transcribe
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3"

- **`language_code`** (`string`, _optional_):
  Language code of the audio
  - Examples: "eng", "spa", "fra", "deu", "jpn"

- **`tag_audio_events`** (`boolean`, _optional_):
  Tag audio events like laughter, applause, etc. Default value: `true`
  - Default: `true`

- **`diarize`** (`boolean`, _optional_):
  Whether to annotate who is speaking Default value: `true`
  - Default: `true`

- **`keyterms`** (`list<string>`, _optional_):
  Words or sentences to bias the model towards transcribing. Up to 100 keyterms, max 50 characters each. Adds 30% premium over base transcription price.
  - Default: `[]`
  - Array of string



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3",
  "language_code": "eng",
  "tag_audio_events": true,
  "diarize": true,
  "keyterms": []
}
```


### Output Schema

The API returns the following output format:

- **`text`** (`string`, _required_):
  The full transcribed text
  - Examples: "Hey, this is a test recording for Scribe version two, which is now available on fal.ai."

- **`language_code`** (`string`, _required_):
  Detected or specified language code
  - Examples: "eng"

- **`language_probability`** (`float`, _required_):
  Confidence in language detection
  - Examples: 1

- **`words`** (`list<TranscriptionWord>`, _required_):
  Word-level transcription details
  - Array of TranscriptionWord
  - Examples: {"type":"word","speaker_id":"speaker_0","text":"Hey,","end":0.539,"start":0.079}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":0.599,"start":0.539}, {"type":"word","speaker_id":"speaker_0","text":"this","end":0.679,"start":0.599}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":0.739,"start":0.679}, {"type":"word","speaker_id":"speaker_0","text":"is","end":0.799,"start":0.739}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":0.939,"start":0.799}, {"type":"word","speaker_id":"speaker_0","text":"a","end":0.939,"start":0.939}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":0.959,"start":0.939}, {"type":"word","speaker_id":"speaker_0","text":"test","end":1.179,"start":0.959}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":1.219,"start":1.179}, {"type":"word","speaker_id":"speaker_0","text":"recording","end":1.719,"start":1.22}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":1.719,"start":1.719}, {"type":"word","speaker_id":"speaker_0","text":"for","end":1.86,"start":1.719}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":1.879,"start":1.86}, {"type":"word","speaker_id":"speaker_0","text":"Scribe","end":2.24,"start":1.879}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":2.319,"start":2.24}, {"type":"word","speaker_id":"speaker_0","text":"version","end":2.759,"start":2.319}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":2.779,"start":2.759}, {"type":"word","speaker_id":"speaker_0","text":"two,","end":3.379,"start":2.779}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":3.399,"start":3.379}, {"type":"word","speaker_id":"speaker_0","text":"which","end":3.519,"start":3.399}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":3.539,"start":3.519}, {"type":"word","speaker_id":"speaker_0","text":"is","end":3.659,"start":3.539}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":3.699,"start":3.659}, {"type":"word","speaker_id":"speaker_0","text":"now","end":3.839,"start":3.699}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":3.839,"start":3.839}, {"type":"word","speaker_id":"speaker_0","text":"available","end":4.319,"start":3.839}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":4.339,"start":4.319}, {"type":"word","speaker_id":"speaker_0","text":"on","end":4.579,"start":4.339}, {"type":"spacing","speaker_id":"speaker_0","text":" ","end":4.599,"start":4.579}, {"type":"word","speaker_id":"speaker_0","text":"fal.ai.","end":5.699,"start":4.599}



**Example Response**:

```json
{
  "text": "Hey, this is a test recording for Scribe version two, which is now available on fal.ai.",
  "language_code": "eng",
  "language_probability": 1,
  "words": {
    "type": "word",
    "speaker_id": "speaker_0",
    "text": "Hey,",
    "end": 0.539,
    "start": 0.079
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/elevenlabs/speech-to-text/scribe-v2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3"
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
    "fal-ai/elevenlabs/speech-to-text/scribe-v2",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3"
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

const result = await fal.subscribe("fal-ai/elevenlabs/speech-to-text/scribe-v2", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/speech-to-text/scribe-v2)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/speech-to-text/scribe-v2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/speech-to-text/scribe-v2)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

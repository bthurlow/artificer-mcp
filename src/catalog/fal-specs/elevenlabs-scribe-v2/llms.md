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
  - Examples: {"type":"word","end":0.539,"speaker_id":"speaker_0","text":"Hey,","start":0.079}, {"type":"spacing","end":0.599,"speaker_id":"speaker_0","text":" ","start":0.539}, {"type":"word","end":0.679,"speaker_id":"speaker_0","text":"this","start":0.599}, {"type":"spacing","end":0.739,"speaker_id":"speaker_0","text":" ","start":0.679}, {"type":"word","end":0.799,"speaker_id":"speaker_0","text":"is","start":0.739}, {"type":"spacing","end":0.939,"speaker_id":"speaker_0","text":" ","start":0.799}, {"type":"word","end":0.939,"speaker_id":"speaker_0","text":"a","start":0.939}, {"type":"spacing","end":0.959,"speaker_id":"speaker_0","text":" ","start":0.939}, {"type":"word","end":1.179,"speaker_id":"speaker_0","text":"test","start":0.959}, {"type":"spacing","end":1.219,"speaker_id":"speaker_0","text":" ","start":1.179}, {"type":"word","end":1.719,"speaker_id":"speaker_0","text":"recording","start":1.22}, {"type":"spacing","end":1.719,"speaker_id":"speaker_0","text":" ","start":1.719}, {"type":"word","end":1.86,"speaker_id":"speaker_0","text":"for","start":1.719}, {"type":"spacing","end":1.879,"speaker_id":"speaker_0","text":" ","start":1.86}, {"type":"word","end":2.24,"speaker_id":"speaker_0","text":"Scribe","start":1.879}, {"type":"spacing","end":2.319,"speaker_id":"speaker_0","text":" ","start":2.24}, {"type":"word","end":2.759,"speaker_id":"speaker_0","text":"version","start":2.319}, {"type":"spacing","end":2.779,"speaker_id":"speaker_0","text":" ","start":2.759}, {"type":"word","end":3.379,"speaker_id":"speaker_0","text":"two,","start":2.779}, {"type":"spacing","end":3.399,"speaker_id":"speaker_0","text":" ","start":3.379}, {"type":"word","end":3.519,"speaker_id":"speaker_0","text":"which","start":3.399}, {"type":"spacing","end":3.539,"speaker_id":"speaker_0","text":" ","start":3.519}, {"type":"word","end":3.659,"speaker_id":"speaker_0","text":"is","start":3.539}, {"type":"spacing","end":3.699,"speaker_id":"speaker_0","text":" ","start":3.659}, {"type":"word","end":3.839,"speaker_id":"speaker_0","text":"now","start":3.699}, {"type":"spacing","end":3.839,"speaker_id":"speaker_0","text":" ","start":3.839}, {"type":"word","end":4.319,"speaker_id":"speaker_0","text":"available","start":3.839}, {"type":"spacing","end":4.339,"speaker_id":"speaker_0","text":" ","start":4.319}, {"type":"word","end":4.579,"speaker_id":"speaker_0","text":"on","start":4.339}, {"type":"spacing","end":4.599,"speaker_id":"speaker_0","text":" ","start":4.579}, {"type":"word","end":5.699,"speaker_id":"speaker_0","text":"fal.ai.","start":4.599}



**Example Response**:

```json
{
  "text": "Hey, this is a test recording for Scribe version two, which is now available on fal.ai.",
  "language_code": "eng",
  "language_probability": 1,
  "words": {
    "type": "word",
    "end": 0.539,
    "speaker_id": "speaker_0",
    "text": "Hey,",
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

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

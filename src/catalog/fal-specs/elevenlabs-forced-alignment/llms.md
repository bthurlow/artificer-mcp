# Elevenlabs - Forced Alignment

> Align the transcript and your audio recording using Elevenlab's forced alignment feature!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/forced-alignment`
- **Model ID**: `fal-ai/elevenlabs/forced-alignment`
- **Category**: speech-to-text
- **Kind**: inference
**Tags**: forced-alignment, speech-to-text, 



## Pricing

Your request will cost **$0.22** per hour of audio input. It will be rounded **upwards** to the nearest hour.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to align. The file can be up to 3 GB and the audio can be up to 10 hours long.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3"

- **`text`** (`string`, _required_):
  Transcript to align with the audio
  - Examples: "Hey, this is a test recording for Scribe version two, which is now available on fal.ai."



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3",
  "text": "Hey, this is a test recording for Scribe version two, which is now available on fal.ai."
}
```


### Output Schema

The API returns the following output format:

- **`characters`** (`list<ForcedAlignmentCharacter>`, _required_):
  Character-level alignment details
  - Array of ForcedAlignmentCharacter

- **`words`** (`list<ForcedAlignmentWord>`, _required_):
  Word-level alignment details
  - Array of ForcedAlignmentWord

- **`loss`** (`float`, _required_):
  Average alignment loss for the transcript



**Example Response**:

```json
{
  "characters": [
    {
      "text": ""
    }
  ],
  "words": [
    {
      "text": ""
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/elevenlabs/forced-alignment \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3",
     "text": "Hey, this is a test recording for Scribe version two, which is now available on fal.ai."
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
    "fal-ai/elevenlabs/forced-alignment",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3",
        "text": "Hey, this is a test recording for Scribe version two, which is now available on fal.ai."
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

const result = await fal.subscribe("fal-ai/elevenlabs/forced-alignment", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/example_inputs/elevenlabs/scribe_v2_in.mp3",
    text: "Hey, this is a test recording for Scribe version two, which is now available on fal.ai."
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/forced-alignment)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/forced-alignment/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/forced-alignment)

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

# Elevenlabs

> Generate realistic audio dialogues using Eleven-v3 from ElevenLabs.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/text-to-dialogue/eleven-v3`
- **Model ID**: `fal-ai/elevenlabs/text-to-dialogue/eleven-v3`
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


- **`inputs`** (`list<DialogueBlock>`, _required_):
  A list of dialogue inputs, each containing text and a voice ID which will be converted into speech.
  - Array of DialogueBlock
  - Examples: [{"text":"[applause] Thank you all for coming tonight! Today we have a very special guest with us.","voice":"Aria"},{"text":"[gulps] ... [strong canadian accent] [excited] Hello everyone! Thank you all for having me tonight on this special day.","voice":"Charlotte"}]

- **`stability`** (`float`, _optional_):
  Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion. Must be one of 0.0, 0.5, 1.0, else it will be rounded to the nearest value.
  - Range: `0` to `1`

- **`use_speaker_boost`** (`boolean`, _optional_):
  This setting boosts the similarity to the original speaker. Using this setting requires a slightly higher computational load, which in turn increases latency.

- **`pronunciation_dictionary_locators`** (`list<PronunciationDictionaryLocator>`, _optional_):
  A list of pronunciation dictionary locators (id, version_id) to be applied to the text. They will be applied in order. You may have up to 3 locators per request
  - Default: `[]`
  - Array of PronunciationDictionaryLocator

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility.

- **`language_code`** (`string`, _optional_):
  Language code (ISO 639-1) used to enforce a language for the model. An error will be returned if language code is not supported by the model.



**Required Parameters Example**:

```json
{
  "inputs": [
    {
      "text": "[applause] Thank you all for coming tonight! Today we have a very special guest with us.",
      "voice": "Aria"
    },
    {
      "text": "[gulps] ... [strong canadian accent] [excited] Hello everyone! Thank you all for having me tonight on this special day.",
      "voice": "Charlotte"
    }
  ]
}
```

**Full Example**:

```json
{
  "inputs": [
    {
      "text": "[applause] Thank you all for coming tonight! Today we have a very special guest with us.",
      "voice": "Aria"
    },
    {
      "text": "[gulps] ... [strong canadian accent] [excited] Hello everyone! Thank you all for having me tonight on this special day.",
      "voice": "Charlotte"
    }
  ],
  "pronunciation_dictionary_locators": []
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file
  - Examples: {"url":"https://v3.fal.media/files/zebra/XFeGS8Fq-q1eAPG2sSAo__output.mp3"}

- **`seed`** (`integer`, _required_):
  Random seed for reproducibility.



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3.fal.media/files/zebra/XFeGS8Fq-q1eAPG2sSAo__output.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/elevenlabs/text-to-dialogue/eleven-v3 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "inputs": [
       {
         "text": "[applause] Thank you all for coming tonight! Today we have a very special guest with us.",
         "voice": "Aria"
       },
       {
         "text": "[gulps] ... [strong canadian accent] [excited] Hello everyone! Thank you all for having me tonight on this special day.",
         "voice": "Charlotte"
       }
     ]
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
    "fal-ai/elevenlabs/text-to-dialogue/eleven-v3",
    arguments={
        "inputs": [{
            "text": "[applause] Thank you all for coming tonight! Today we have a very special guest with us.",
            "voice": "Aria"
        }, {
            "text": "[gulps] ... [strong canadian accent] [excited] Hello everyone! Thank you all for having me tonight on this special day.",
            "voice": "Charlotte"
        }]
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

const result = await fal.subscribe("fal-ai/elevenlabs/text-to-dialogue/eleven-v3", {
  input: {
    inputs: [{
      text: "[applause] Thank you all for coming tonight! Today we have a very special guest with us.",
      voice: "Aria"
    }, {
      text: "[gulps] ... [strong canadian accent] [excited] Hello everyone! Thank you all for having me tonight on this special day.",
      voice: "Charlotte"
    }]
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/text-to-dialogue/eleven-v3)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/text-to-dialogue/eleven-v3/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/text-to-dialogue/eleven-v3)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# VibeVoice 7B

> Generate long, expressive multi-voice speech using Microsoft's powerful TTS


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vibevoice/7b`
- **Model ID**: `fal-ai/vibevoice/7b`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: text-to-speech, multi-speaker, podcast



## Pricing

Your request will cost **$0.04** per generated minute, rounded to the nearest 15 seconds. For **$1.00** you can generate up to 25 minutes of speech.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`script`** (`string`, _required_):
  The script to convert to speech. Can be formatted with 'Speaker X:' prefixes for multi-speaker dialogues.
  - Examples: "Speaker 0: VibeVoice is now available on Fal. Isn't that right, Carter?\nSpeaker 1: That's right Frank, and it supports up to four speakers at once. Try it now!"

- **`speakers`** (`list<VibeVoiceSpeaker>`, _required_):
  List of speakers to use for the script. If not provided, will be inferred from the script or voice samples.
  - Array of VibeVoiceSpeaker
  - Examples: [{"preset":"Frank [EN]"},{"preset":"Carter [EN]"}]

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation.

- **`cfg_scale`** (`float`, _optional_):
  CFG (Classifier-Free Guidance) scale for generation. Higher values increase adherence to text. Default value: `1.3`
  - Default: `1.3`
  - Range: `1` to `2`



**Required Parameters Example**:

```json
{
  "script": "Speaker 0: VibeVoice is now available on Fal. Isn't that right, Carter?\nSpeaker 1: That's right Frank, and it supports up to four speakers at once. Try it now!",
  "speakers": [
    {
      "preset": "Frank [EN]"
    },
    {
      "preset": "Carter [EN]"
    }
  ]
}
```

**Full Example**:

```json
{
  "script": "Speaker 0: VibeVoice is now available on Fal. Isn't that right, Carter?\nSpeaker 1: That's right Frank, and it supports up to four speakers at once. Try it now!",
  "speakers": [
    {
      "preset": "Frank [EN]"
    },
    {
      "preset": "Carter [EN]"
    }
  ],
  "cfg_scale": 1.3
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file containing the speech
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/vibevoice.mp3"}

- **`duration`** (`float`, _required_):
  Duration of the generated audio in seconds
  - Examples: 9.46

- **`sample_rate`** (`integer`, _required_):
  Sample rate of the generated audio
  - Examples: 24000

- **`generation_time`** (`float`, _required_):
  Time taken to generate the audio in seconds
  - Examples: 5.6

- **`rtf`** (`float`, _required_):
  Real-time factor (generation_time / audio_duration). Lower is better.
  - Examples: 0.53



**Example Response**:

```json
{
  "audio": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/vibevoice.mp3"
  },
  "duration": 9.46,
  "sample_rate": 24000,
  "generation_time": 5.6,
  "rtf": 0.53
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vibevoice/7b \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "script": "Speaker 0: VibeVoice is now available on Fal. Isn't that right, Carter?\nSpeaker 1: That's right Frank, and it supports up to four speakers at once. Try it now!",
     "speakers": [
       {
         "preset": "Frank [EN]"
       },
       {
         "preset": "Carter [EN]"
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
    "fal-ai/vibevoice/7b",
    arguments={
        "script": "Speaker 0: VibeVoice is now available on Fal. Isn't that right, Carter?
    Speaker 1: That's right Frank, and it supports up to four speakers at once. Try it now!",
        "speakers": [{
            "preset": "Frank [EN]"
        }, {
            "preset": "Carter [EN]"
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

const result = await fal.subscribe("fal-ai/vibevoice/7b", {
  input: {
    script: "Speaker 0: VibeVoice is now available on Fal. Isn't that right, Carter?
  Speaker 1: That's right Frank, and it supports up to four speakers at once. Try it now!",
    speakers: [{
      preset: "Frank [EN]"
    }, {
      preset: "Carter [EN]"
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

- [Model Playground](https://fal.ai/models/fal-ai/vibevoice/7b)
- [API Documentation](https://fal.ai/models/fal-ai/vibevoice/7b/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vibevoice/7b)

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

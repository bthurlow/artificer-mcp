# Chatterbox

> Whether you're working on memes, videos, games, or AI agents, Chatterbox brings your content to life. Use the first tts from resemble ai.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/chatterbox/text-to-speech/multilingual`
- **Model ID**: `fal-ai/chatterbox/text-to-speech/multilingual`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: text-to-speech, multilingual



## Pricing

- **Price**: $0.025 per 1000 characters

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to be converted to speech (maximum 300 characters). Supports 23 languages including English, French, German, Spanish, Italian, Portuguese, Hindi, Arabic, Chinese, Japanese, Korean, and more.
  - Examples: "Last month, we reached a new milestone with two billion views on our YouTube channel.", "Le mois dernier, nous avons atteint un nouveau jalon avec deux milliards de vues sur notre chaîne YouTube."

- **`voice`** (`string`, _optional_):
  Language code for synthesis. In case using custom please provide audio url and select custom_audio_language. Default value: `"english"`
  - Default: `"english"`
  - Examples: "english", "arabic", "danish", "german", "greek", "spanish", "finnish", "french", "hebrew", "hindi", "italian", "japanese", "korean", "malay", "dutch", "norwegian", "polish", "portuguese", "russian", "swedish", "swahili", "turkish", "chinese"

- **`custom_audio_language`** (`Enum`, _optional_):
  If using a custom audio URL, specify the language of the audio here. Ignored if voice is not a custom url.
  - Options: `"english"`, `"arabic"`, `"danish"`, `"german"`, `"greek"`, `"spanish"`, `"finnish"`, `"french"`, `"hebrew"`, `"hindi"`, `"italian"`, `"japanese"`, `"korean"`, `"malay"`, `"dutch"`, `"norwegian"`, `"polish"`, `"portuguese"`, `"russian"`, `"swedish"`, `"swahili"`, `"turkish"`, `"chinese"`

- **`exaggeration`** (`float`, _optional_):
  Controls speech expressiveness and emotional intensity (0.25-2.0). 0.5 is neutral, higher values increase expressiveness. Extreme values may be unstable. Default value: `0.5`
  - Default: `0.5`
  - Range: `0.25` to `2`

- **`temperature`** (`float`, _optional_):
  Controls randomness and variation in generation (0.05-2.0). Higher values create more varied speech patterns. Default value: `0.8`
  - Default: `0.8`
  - Range: `0.05` to `2`

- **`cfg_scale`** (`float`, _optional_):
  Configuration/pace weight controlling generation guidance (0.0-1.0). Use 0.0 for language transfer to mitigate accent inheritance. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible results. Set to 0 for random generation, or provide a specific number for consistent outputs.



**Required Parameters Example**:

```json
{
  "text": "Last month, we reached a new milestone with two billion views on our YouTube channel."
}
```

**Full Example**:

```json
{
  "text": "Last month, we reached a new milestone with two billion views on our YouTube channel.",
  "voice": "english",
  "exaggeration": 0.5,
  "temperature": 0.8,
  "cfg_scale": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated multilingual speech audio file
  - Examples: {"url":"https://v3.fal.media/files/example/multilingual_speech_output.wav"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3.fal.media/files/example/multilingual_speech_output.wav"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/chatterbox/text-to-speech/multilingual \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "Last month, we reached a new milestone with two billion views on our YouTube channel."
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
    "fal-ai/chatterbox/text-to-speech/multilingual",
    arguments={
        "text": "Last month, we reached a new milestone with two billion views on our YouTube channel."
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

const result = await fal.subscribe("fal-ai/chatterbox/text-to-speech/multilingual", {
  input: {
    text: "Last month, we reached a new milestone with two billion views on our YouTube channel."
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

- [Model Playground](https://fal.ai/models/fal-ai/chatterbox/text-to-speech/multilingual)
- [API Documentation](https://fal.ai/models/fal-ai/chatterbox/text-to-speech/multilingual/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/chatterbox/text-to-speech/multilingual)

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

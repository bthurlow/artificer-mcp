# Qwen Audio 3.0 TTS (Flash)

> Generate natural multilingual speech from text with fast voice and language control using Qwen Audio 3.0 TTS Flash.


## Overview

- **Endpoint**: `https://fal.run/alibaba/qwen-audio-3-tts`
- **Model ID**: `alibaba/qwen-audio-3-tts`
- **Category**: text-to-speech
- **Kind**: inference
**Description**: Qwen Audio 3.0 TTS (Flash) synthesizes natural multilingual speech from text with selectable voices and language control. Designed for fast text-to-speech generation, it returns ready-to-use audio through the fal API.

**Tags**: text-to-speech, audio, speech-synthesis, multilingual



## Pricing


 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to convert to speech.
  - Examples: "Hello! This is Qwen Audio 3.0 speaking on fal."

- **`voice`** (`VoiceEnum`, _optional_):
  The voice used for speech synthesis. See the [Qwen-TTS voice list](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-voice-list) for each voice's language and dialect coverage. Default value: `"Cherry"`
  - Default: `"Cherry"`
  - Options: `"Cherry"`, `"Serena"`, `"Ethan"`, `"Chelsie"`, `"Momo"`, `"Vivian"`, `"Moon"`, `"Maia"`, `"Kai"`, `"Nofish"`, `"Bella"`, `"Jennifer"`, `"Ryan"`, `"Katerina"`, `"Aiden"`, `"Mia"`, `"Mochi"`, `"Bellona"`, `"Vincent"`, `"Bunny"`, `"Neil"`, `"Elias"`, `"Arthur"`, `"Nini"`, `"Seren"`, `"Pip"`, `"Stella"`, `"Bodega"`, `"Sonrisa"`, `"Alek"`, `"Dolce"`, `"Sohee"`, `"Lenn"`, `"Emilien"`, `"Andre"`, `"Jada"`, `"Dylan"`, `"Li"`, `"Marcus"`, `"Roy"`, `"Peter"`, `"Sunny"`, `"Eric"`, `"Rocky"`, `"Kiki"`
  - Examples: "Cherry"

- **`language`** (`LanguageEnum`, _optional_):
  Language of the input text. `Auto` lets the model detect it; setting it explicitly improves pronunciation and intonation. Default value: `"Auto"`
  - Default: `"Auto"`
  - Options: `"Auto"`, `"Chinese"`, `"English"`, `"Spanish"`, `"Russian"`, `"Italian"`, `"French"`, `"Korean"`, `"Japanese"`, `"German"`, `"Portuguese"`
  - Examples: "English"



**Required Parameters Example**:

```json
{
  "text": "Hello! This is Qwen Audio 3.0 speaking on fal."
}
```

**Full Example**:

```json
{
  "text": "Hello! This is Qwen Audio 3.0 speaking on fal.",
  "voice": "Cherry",
  "language": "English"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`AudioFile`, _required_):
  The generated speech audio file.
  - Examples: {"content_type":"audio/wav","url":"https://v3b.fal.media/files/b/0aa31e93/W1mDF9_5NWnOPVZzccqP2_njpi6QRK.wav","duration":3.44,"file_name":"W1mDF9_5NWnOPVZzccqP2_njpi6QRK.wav","sample_rate":24000,"channels":1}



**Example Response**:

```json
{
  "audio": {
    "content_type": "audio/wav",
    "url": "https://v3b.fal.media/files/b/0aa31e93/W1mDF9_5NWnOPVZzccqP2_njpi6QRK.wav",
    "duration": 3.44,
    "file_name": "W1mDF9_5NWnOPVZzccqP2_njpi6QRK.wav",
    "sample_rate": 24000,
    "channels": 1
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/alibaba/qwen-audio-3-tts \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "Hello! This is Qwen Audio 3.0 speaking on fal."
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
    "alibaba/qwen-audio-3-tts",
    arguments={
        "text": "Hello! This is Qwen Audio 3.0 speaking on fal."
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

const result = await fal.subscribe("alibaba/qwen-audio-3-tts", {
  input: {
    text: "Hello! This is Qwen Audio 3.0 speaking on fal."
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

- [Model Playground](https://fal.ai/models/alibaba/qwen-audio-3-tts)
- [API Documentation](https://fal.ai/models/alibaba/qwen-audio-3-tts/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=alibaba/qwen-audio-3-tts)

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

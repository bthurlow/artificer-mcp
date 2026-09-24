# Qwen 3 TTS - Text to Speech [1.7B]

> Bring speech to your texts using Qwen3-TTS Custom-Voice model with pre-trained voices or use your custom voice with Qwen3-TTS Clone Voice model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/qwen-3-tts/text-to-speech/1.7b`
- **Model ID**: `fal-ai/qwen-3-tts/text-to-speech/1.7b`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: text-to-speech



## Pricing

- **Price**: $0.09 per 1000 characters

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to be converted to speech.
  - Examples: "I am solving the equation: x = [-b ± √(b²-4ac)] / 2a? Nobody can — it's a disaster (◍•͈⌔•͈◍), very sad!"

- **`prompt`** (`string`, _optional_):
  Optional prompt to guide the style of the generated speech. This prompt will be ignored if a speaker embedding is provided.
  - Examples: "Very happy."

- **`voice`** (`Enum`, _optional_):
  The voice to be used for speech synthesis, will be ignored if a speaker embedding is provided. Check out the **[documentation](https://github.com/QwenLM/Qwen3-TTS/tree/main?tab=readme-ov-file#custom-voice-generate)** for each voice's details and which language they primarily support.
  - Options: `"Vivian"`, `"Serena"`, `"Uncle_Fu"`, `"Dylan"`, `"Eric"`, `"Ryan"`, `"Aiden"`, `"Ono_Anna"`, `"Sohee"`
  - Examples: "Vivian"

- **`language`** (`LanguageEnum`, _optional_):
  The language of the voice. Default value: `"Auto"`
  - Default: `"Auto"`
  - Options: `"Auto"`, `"English"`, `"Chinese"`, `"Spanish"`, `"French"`, `"German"`, `"Italian"`, `"Japanese"`, `"Korean"`, `"Portuguese"`, `"Russian"`
  - Examples: "English"

- **`speaker_voice_embedding_file_url`** (`string`, _optional_):
  URL to a speaker embedding file in safetensors format, from `fal-ai/qwen-3-tts/clone-voice` endpoint. If provided, the TTS model will use the cloned voice for synthesis instead of the predefined voices.
  - Examples: "https://storage.googleapis.com/falserverless/example_outputs/qwen3-tts/clone_out.safetensors"

- **`reference_text`** (`string`, _optional_):
  Optional reference text that was used when creating the speaker embedding. Providing this can improve synthesis quality when using a cloned voice.
  - Examples: "Okay. Yeah. I resent you. I love you. I respect you. But you know what? You blew it! And it is all thanks to you."

- **`top_k`** (`integer`, _optional_):
  Top-k sampling parameter. Default value: `50`
  - Default: `50`

- **`top_p`** (`float`, _optional_):
  Top-p sampling parameter. Default value: `1`
  - Default: `1`
  - Range: `0` to `1`

- **`temperature`** (`float`, _optional_):
  Sampling temperature; higher => more random. Default value: `0.9`
  - Default: `0.9`

- **`repetition_penalty`** (`float`, _optional_):
  Penalty to reduce repeated tokens/codes. Default value: `1.05`
  - Default: `1.05`

- **`subtalker_dosample`** (`boolean`, _optional_):
  Sampling switch for the sub-talker. Default value: `true`
  - Default: `true`

- **`subtalker_top_k`** (`integer`, _optional_):
  Top-k for sub-talker sampling. Default value: `50`
  - Default: `50`

- **`subtalker_top_p`** (`float`, _optional_):
  Top-p for sub-talker sampling. Default value: `1`
  - Default: `1`
  - Range: `0` to `1`

- **`subtalker_temperature`** (`float`, _optional_):
  Temperature for sub-talker sampling. Default value: `0.9`
  - Default: `0.9`
  - Range: `0` to `1`

- **`max_new_tokens`** (`integer`, _optional_):
  Maximum number of new codec tokens to generate. Default value: `200`
  - Default: `200`
  - Range: `1` to `8192`



**Required Parameters Example**:

```json
{
  "text": "I am solving the equation: x = [-b ± √(b²-4ac)] / 2a? Nobody can — it's a disaster (◍•͈⌔•͈◍), very sad!"
}
```

**Full Example**:

```json
{
  "text": "I am solving the equation: x = [-b ± √(b²-4ac)] / 2a? Nobody can — it's a disaster (◍•͈⌔•͈◍), very sad!",
  "prompt": "Very happy.",
  "voice": "Vivian",
  "language": "English",
  "speaker_voice_embedding_file_url": "https://storage.googleapis.com/falserverless/example_outputs/qwen3-tts/clone_out.safetensors",
  "reference_text": "Okay. Yeah. I resent you. I love you. I respect you. But you know what? You blew it! And it is all thanks to you.",
  "top_k": 50,
  "top_p": 1,
  "temperature": 0.9,
  "repetition_penalty": 1.05,
  "subtalker_dosample": true,
  "subtalker_top_k": 50,
  "subtalker_top_p": 1,
  "subtalker_temperature": 0.9,
  "max_new_tokens": 200
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`AudioFile`, _required_):
  The generated speech audio file.
  - Examples: {"sample_rate":24000,"channels":1,"duration":13.025333333333334,"file_name":"n5Ynr2aFKUPw1QjLYjB_4_XEdHoD1K.mp3","content_type":"audio/mpeg","url":"https://storage.googleapis.com/falserverless/example_outputs/qwen3-tts/tts_out.mp3"}



**Example Response**:

```json
{
  "audio": {
    "sample_rate": 24000,
    "channels": 1,
    "duration": 13.025333333333334,
    "file_name": "n5Ynr2aFKUPw1QjLYjB_4_XEdHoD1K.mp3",
    "content_type": "audio/mpeg",
    "url": "https://storage.googleapis.com/falserverless/example_outputs/qwen3-tts/tts_out.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/qwen-3-tts/text-to-speech/1.7b \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "I am solving the equation: x = [-b ± √(b²-4ac)] / 2a? Nobody can — it's a disaster (◍•͈⌔•͈◍), very sad!"
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
    "fal-ai/qwen-3-tts/text-to-speech/1.7b",
    arguments={
        "text": "I am solving the equation: x = [-b ± √(b²-4ac)] / 2a? Nobody can — it's a disaster (◍•͈⌔•͈◍), very sad!"
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

const result = await fal.subscribe("fal-ai/qwen-3-tts/text-to-speech/1.7b", {
  input: {
    text: "I am solving the equation: x = [-b ± √(b²-4ac)] / 2a? Nobody can — it's a disaster (◍•͈⌔•͈◍), very sad!"
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

- [Model Playground](https://fal.ai/models/fal-ai/qwen-3-tts/text-to-speech/1.7b)
- [API Documentation](https://fal.ai/models/fal-ai/qwen-3-tts/text-to-speech/1.7b/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/qwen-3-tts/text-to-speech/1.7b)

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

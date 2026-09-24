# xAI Text to Speech

> Generate speech with expressive and realistic voices from xAI


## Overview

- **Endpoint**: `https://fal.run/xai/tts/v1`
- **Model ID**: `xai/tts/v1`
- **Category**: text-to-speech
- **Kind**: inference


## Pricing

Your request will cost **$0.015** per **1000 characters**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to convert to speech. Maximum 15,000 characters. Supports speech tags for expressive delivery: inline tags like [laugh], [pause], [sigh] and wrapping tags like <whisper>text</whisper>, <slow>text</slow>.
  - Examples: "Hello! This is xAI text to speech, brought to you by Fal AI."

- **`voice`** (`VoiceEnum`, _optional_):
  Built-in xAI voice to use for synthesis. Default value: `"eve"`
  - Default: `"eve"`
  - Options: `"carina"`, `"zagan"`, `"helix"`, `"orion"`, `"luna"`, `"iris"`, `"altair"`, `"zenith"`, `"perseus"`, `"helios"`, `"lux"`, `"kepler"`, `"rigel"`, `"cosmo"`, `"celeste"`, `"ursa"`, `"sirius"`, `"lumen"`, `"castor"`, `"naksh"`, `"atlas"`, `"aurora"`, `"liora"`, `"ara"`, `"eve"`, `"leo"`, `"rex"`, `"sal"`

- **`language`** (`LanguageEnum`, _optional_):
  BCP-47 language code or 'auto' for automatic detection. Supported: en, zh, fr, de, hi, id, it, ja, ko, pt-BR, pt-PT, ru, es-MX, es-ES, tr, vi, bn, ar-EG, ar-SA, ar-AE. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"en"`, `"ar-EG"`, `"ar-SA"`, `"ar-AE"`, `"bn"`, `"zh"`, `"fr"`, `"de"`, `"hi"`, `"id"`, `"it"`, `"ja"`, `"ko"`, `"pt-BR"`, `"pt-PT"`, `"ru"`, `"es-MX"`, `"es-ES"`, `"tr"`, `"vi"`

- **`output_format`** (`OutputFormat`, _optional_):
  Output format configuration. Defaults to MP3 at 24 kHz / 128 kbps.



**Required Parameters Example**:

```json
{
  "text": "Hello! This is xAI text to speech, brought to you by Fal AI."
}
```

**Full Example**:

```json
{
  "text": "Hello! This is xAI text to speech, brought to you by Fal AI.",
  "voice": "eve",
  "language": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a92750b/exZJCm6TDejS5xIulJs2r_xai_tts_output.mp3"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/b/0a92750b/exZJCm6TDejS5xIulJs2r_xai_tts_output.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/xai/tts/v1 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "Hello! This is xAI text to speech, brought to you by Fal AI."
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
    "xai/tts/v1",
    arguments={
        "text": "Hello! This is xAI text to speech, brought to you by Fal AI."
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

const result = await fal.subscribe("xai/tts/v1", {
  input: {
    text: "Hello! This is xAI text to speech, brought to you by Fal AI."
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

- [Model Playground](https://fal.ai/models/xai/tts/v1)
- [API Documentation](https://fal.ai/models/xai/tts/v1/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=xai/tts/v1)

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

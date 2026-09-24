# Seed Audio 1.0

> Seed Audio 1.0 is a new audio model from Bytedance that can generate high-quality, natural sounding audio using text, reference audios or an image.


## Overview

- **Endpoint**: `https://fal.run/bytedance/seed-audio-1.0`
- **Model ID**: `bytedance/seed-audio-1.0`
- **Category**: text-to-audio
- **Kind**: inference


## Pricing

- **Price**: $0.1875 per minutes

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Prompt or text to synthesize. Reference audio inputs by order with @Audio1, @Audio2, @Audio3.
  - Examples: "Here's a quick look at your day: you've got three meetings, one lunch, and just enough time in between to grab a coffee and relax."

- **`voice`** (`string`, _optional_):
  Voice to use for synthesis: either a preset voice name or a cloned voice id.
  - Examples: "stokie_en", "vivi_mixed_en_zh_ja_es_id", "mindy_en_es_id_pt_zh", "kian_en_zh", "cedric_en_zh", "sophie_en_zh", "jean_en_zh", "magnus_en_zh", "mabel_en_zh", "nadia_en_zh", "opal_en_zh", "pearl_en_zh", "quentin_en_zh", "corinne_mixed_en_zh", "esther_mixed_en_zh", "lyla_mixed_en_zh", "tracy_es_zh", "sandy_es_mixed_en_zh", "felix_zh", "celeste_zh", "monkey_king_zh", null

- **`audio_urls`** (`list<string>`, _optional_):
  Up to 3 reference audio URLs, referenced in prompt as @Audio1, @Audio2, @Audio3. Each clip: up to 30s, 10MB, wav/mp3/pcm/ogg_opus.
  - Array of string

- **`image_url`** (`string`, _optional_):
  A single reference image URL (jpeg/png/webp, up to 10MB). Cannot be combined with audio references.

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output audio format. Default value: `"mp3"`
  - Default: `"mp3"`
  - Options: `"wav"`, `"mp3"`, `"pcm"`, `"ogg_opus"`

- **`sample_rate`** (`SampleRateEnum`, _optional_):
  Sample rate of the output audio in Hz. Default value: `"24000"`
  - Default: `24000`
  - Options: `8000`, `16000`, `24000`, `32000`, `44100`, `48000`

- **`speed`** (`float`, _optional_):
  Speech speed. 1.0 is normal speed, 0.5 is half speed, 2.0 is double speed. Default value: `1`
  - Default: `1`
  - Range: `0.5` to `2`

- **`volume`** (`float`, _optional_):
  Volume. 1.0 is normal volume, 0.5 is half, 2.0 is double. Default value: `1`
  - Default: `1`
  - Range: `0.5` to `2`

- **`pitch`** (`integer`, _optional_):
  Voice pitch shift in semitones. 0 is normal pitch, -12 lowers by one octave, 12 raises by one octave.
  - Default: `0`
  - Range: `-12` to `12`

- **`multilingual`** (`boolean`, _optional_):
  Use the multilingual model variant, which handles non-English and mixed-language prompts better.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "Here's a quick look at your day: you've got three meetings, one lunch, and just enough time in between to grab a coffee and relax."
}
```

**Full Example**:

```json
{
  "prompt": "Here's a quick look at your day: you've got three meetings, one lunch, and just enough time in between to grab a coffee and relax.",
  "voice": "stokie_en",
  "output_format": "mp3",
  "sample_rate": 24000,
  "speed": 1,
  "volume": 1
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`AudioFile`, _required_):
  The generated audio file.
  - Examples: {"url":"https://v3b.fal.media/files/b/0aa97081/TYxWX8Yp1jjq9qObOdSRn_speech.mp3"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/b/0aa97081/TYxWX8Yp1jjq9qObOdSRn_speech.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bytedance/seed-audio-1.0 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Here's a quick look at your day: you've got three meetings, one lunch, and just enough time in between to grab a coffee and relax."
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
    "bytedance/seed-audio-1.0",
    arguments={
        "prompt": "Here's a quick look at your day: you've got three meetings, one lunch, and just enough time in between to grab a coffee and relax."
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

const result = await fal.subscribe("bytedance/seed-audio-1.0", {
  input: {
    prompt: "Here's a quick look at your day: you've got three meetings, one lunch, and just enough time in between to grab a coffee and relax."
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

- [Model Playground](https://fal.ai/models/bytedance/seed-audio-1.0)
- [API Documentation](https://fal.ai/models/bytedance/seed-audio-1.0/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seed-audio-1.0)

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

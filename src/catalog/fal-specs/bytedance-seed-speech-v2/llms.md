# Bytedance Seed Speech Text to Speech

> Seed Speech developed by ByteDance, is a family of large-scale text-to-speech models capable of synthesizing speech that is virtually indistinguishable from human speech.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/bytedance/seed-speech/tts/v2`
- **Model ID**: `fal-ai/bytedance/seed-speech/tts/v2`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

- **Price**: $0.03 per 1000 characters

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to synthesize into speech.
  - Examples: "Hello, this is a test of ByteDance TTS 2.0 speech synthesis."

- **`voice`** (`VoiceEnum`, _optional_):
  Voice to use for synthesis. The preset name encodes the voice and its supported language codes. 'mixed_en_zh' means the voice can seamlessly blend English and Chinese; separate codes (e.g. 'en_zh') mean the voice supports each language independently. Default value: `"stokie_en"`
  - Default: `"stokie_en"`
  - Options: `"vivi_mixed_en_zh_ja_es_id"`, `"mindy_en_es_id_pt_zh"`, `"stokie_en"`, `"dacey_en"`, `"tim_en"`, `"kian_en_zh"`, `"cedric_en_zh"`, `"sophie_en_zh"`, `"jean_en_zh"`, `"magnus_en_zh"`, `"mabel_en_zh"`, `"nadia_en_zh"`, `"opal_en_zh"`, `"pearl_en_zh"`, `"quentin_en_zh"`, `"vienna_mixed_en_zh"`, `"alina_mixed_en_zh"`, `"corinne_mixed_en_zh"`, `"esther_mixed_en_zh"`, `"freya_mixed_en_zh"`, `"gigi_mixed_en_zh"`, `"holly_mixed_en_zh"`, `"lyla_mixed_en_zh"`, `"daisy_mixed_en_zh"`, `"tracy_es_zh"`, `"jess_ja_es_id_pt_en_zh"`, `"pinky_es_ko_mixed_en_zh"`, `"sweety_ja_es"`, `"sandy_es_mixed_en_zh"`, `"sven_de"`, `"minimi_ja"`, `"usseau_fr"`, `"felipe_es"`, `"han_id"`, `"martins_pt"`, `"enzo_it"`, `"shane_ko"`, `"bonnie_zh"`, `"felix_zh"`, `"celeste_zh"`, `"monkey_king_zh"`
  - Examples: "stokie_en"

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output audio format. 'mp3' returns MP3 audio; 'opus' returns Opus audio in an Ogg container. Default value: `"mp3"`
  - Default: `"mp3"`
  - Options: `"mp3"`, `"opus"`

- **`sample_rate`** (`SampleRateEnum`, _optional_):
  Sample rate of the output audio in Hz. Default value: `"24000"`
  - Default: `24000`
  - Options: `8000`, `16000`, `22050`, `24000`, `32000`, `44100`, `48000`

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

- **`language`** (`Enum`, _optional_):
  Force the text to be read as a single language, disabling automatic language detection. Leave unset for automatic detection (including seamless Chinese/English mixing on bilingual voices). Codes: zh (Chinese), en (English), ja (Japanese), es-mx (Mexican Spanish), id (Indonesian), pt-br (Brazilian Portuguese), ko (Korean), it (Italian), de (German), fr (French).
  - Options: `"zh"`, `"en"`, `"ja"`, `"es-mx"`, `"id"`, `"pt-br"`, `"ko"`, `"it"`, `"de"`, `"fr"`

- **`voice_instruction`** (`string`, _optional_):
  Optional natural-language instruction that steers the delivery (tone, emotion, pace, volume), e.g. 'Speak in a cheerful tone' or 'Could you speak a bit slower?'. It is not spoken aloud and does not affect billing.
  - Examples: "Speak in a warm, cheerful tone."



**Required Parameters Example**:

```json
{
  "text": "Hello, this is a test of ByteDance TTS 2.0 speech synthesis."
}
```

**Full Example**:

```json
{
  "text": "Hello, this is a test of ByteDance TTS 2.0 speech synthesis.",
  "voice": "stokie_en",
  "output_format": "mp3",
  "sample_rate": 24000,
  "speed": 1,
  "volume": 1,
  "voice_instruction": "Speak in a warm, cheerful tone."
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a9abcc6/Si0ucRYji4wPj7Z2H2XFL_audio.mp3"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/b/0a9abcc6/Si0ucRYji4wPj7Z2H2XFL_audio.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/bytedance/seed-speech/tts/v2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "Hello, this is a test of ByteDance TTS 2.0 speech synthesis."
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
    "fal-ai/bytedance/seed-speech/tts/v2",
    arguments={
        "text": "Hello, this is a test of ByteDance TTS 2.0 speech synthesis."
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

const result = await fal.subscribe("fal-ai/bytedance/seed-speech/tts/v2", {
  input: {
    text: "Hello, this is a test of ByteDance TTS 2.0 speech synthesis."
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

- [Model Playground](https://fal.ai/models/fal-ai/bytedance/seed-speech/tts/v2)
- [API Documentation](https://fal.ai/models/fal-ai/bytedance/seed-speech/tts/v2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/bytedance/seed-speech/tts/v2)

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

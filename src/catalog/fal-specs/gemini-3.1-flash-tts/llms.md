# Gemini 3.1 Flash Tts

> Newest audio model from Google introduces granular audio tags that give you precise control to direct AI speech for expressive audio generation.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/gemini-3.1-flash-tts`
- **Model ID**: `fal-ai/gemini-3.1-flash-tts`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: lipsync, avatar, 



## Pricing

- **Price**: $0.05 per 1000 characters

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text to convert to speech. Gemini 3.1 Flash TTS supports natural-language prompting for style, pace, accent, and emotional expression — include delivery instructions inline with the text (e.g. 'Say cheerfully: Have a wonderful day!'). Supports expressive audio tags like [sigh], [laughing], [whispering], [short pause] for fine-grained control over delivery. For multi-speaker synthesis, prefix lines with speaker aliases defined in the speakers field (e.g. 'Alice: Hello!
  Bob: Hi!').
  - Examples: "I can't believe it worked! [laughing] After all those hours of debugging [sigh] it was just a missing semicolon."

- **`style_instructions`** (`string`, _optional_):
  Optional style and delivery instructions prepended to the prompt. Controls expressiveness, accent, pace, tone, and emotional expression using natural language. Use this to separate style control from the text content. Examples: 'Speak warmly and slowly', 'Read this as a dramatic newscast', 'Use a British accent with a cheerful tone', 'Whisper mysteriously'.
  - Examples: "Say the following in a warm, conversational tone", "Read this as a dramatic newscast with gravitas", "Speak with a British accent, cheerfully and energetically"

- **`voice`** (`VoiceEnum`, _optional_):
  Voice preset for single-speaker synthesis. 30 distinct voices are available. Ignored when speakers is set. Popular choices: Kore (strong, firm female), Puck (upbeat, lively male), Charon (calm, professional male), Zephyr (bright, clear female), Aoede (warm, melodic female). Default value: `"Kore"`
  - Default: `"Kore"`
  - Options: `"Achernar"`, `"Achird"`, `"Algenib"`, `"Algieba"`, `"Alnilam"`, `"Aoede"`, `"Autonoe"`, `"Callirrhoe"`, `"Charon"`, `"Despina"`, `"Enceladus"`, `"Erinome"`, `"Fenrir"`, `"Gacrux"`, `"Iapetus"`, `"Kore"`, `"Laomedeia"`, `"Leda"`, `"Orus"`, `"Pulcherrima"`, `"Puck"`, `"Rasalgethi"`, `"Sadachbia"`, `"Sadaltager"`, `"Schedar"`, `"Sulafat"`, `"Umbriel"`, `"Vindemiatrix"`, `"Zephyr"`, `"Zubenelgenubi"`

- **`language_code`** (`Enum`, _optional_):
  Language for multilingual synthesis. When set, steers the model to speak in the specified language. If not set, the model auto-detects the language from the text.
  - Options: `"Arabic (Egypt)"`, `"Bangla (Bangladesh)"`, `"Dutch (Netherlands)"`, `"English (India)"`, `"English (US)"`, `"French (France)"`, `"German (Germany)"`, `"Hindi (India)"`, `"Indonesian (Indonesia)"`, `"Italian (Italy)"`, `"Japanese (Japan)"`, `"Korean (South Korea)"`, `"Marathi (India)"`, `"Polish (Poland)"`, `"Portuguese (Brazil)"`, `"Romanian (Romania)"`, `"Russian (Russia)"`, `"Spanish (Spain)"`, `"Tamil (India)"`, `"Telugu (India)"`, `"Thai (Thailand)"`, `"Turkish (Turkey)"`, `"Ukrainian (Ukraine)"`, `"Vietnamese (Vietnam)"`, `"Afrikaans (South Africa)"`, `"Albanian (Albania)"`, `"Amharic (Ethiopia)"`, `"Arabic (World)"`, `"Armenian (Armenia)"`, `"Azerbaijani (Azerbaijan)"`, `"Basque (Spain)"`, `"Belarusian (Belarus)"`, `"Bulgarian (Bulgaria)"`, `"Burmese (Myanmar)"`, `"Catalan (Spain)"`, `"Cebuano (Philippines)"`, `"Chinese Mandarin (China)"`, `"Chinese Mandarin (Taiwan)"`, `"Croatian (Croatia)"`, `"Czech (Czech Republic)"`, `"Danish (Denmark)"`, `"English (Australia)"`, `"English (UK)"`, `"Estonian (Estonia)"`, `"Filipino (Philippines)"`, `"Finnish (Finland)"`, `"French (Canada)"`, `"Galician (Spain)"`, `"Georgian (Georgia)"`, `"Greek (Greece)"`, `"Gujarati (India)"`, `"Haitian Creole (Haiti)"`, `"Hebrew (Israel)"`, `"Hungarian (Hungary)"`, `"Icelandic (Iceland)"`, `"Javanese (Java)"`, `"Kannada (India)"`, `"Konkani (India)"`, `"Lao (Laos)"`, `"Latin (Vatican City)"`, `"Latvian (Latvia)"`, `"Lithuanian (Lithuania)"`, `"Luxembourgish (Luxembourg)"`, `"Macedonian (North Macedonia)"`, `"Maithili (India)"`, `"Malagasy (Madagascar)"`, `"Malay (Malaysia)"`, `"Malayalam (India)"`, `"Mongolian (Mongolia)"`, `"Nepali (Nepal)"`, `"Norwegian Bokmal (Norway)"`, `"Norwegian Nynorsk (Norway)"`, `"Odia (India)"`, `"Pashto (Afghanistan)"`, `"Persian (Iran)"`, `"Portuguese (Portugal)"`, `"Punjabi (India)"`, `"Serbian (Serbia)"`, `"Sindhi (India)"`, `"Sinhala (Sri Lanka)"`, `"Slovak (Slovakia)"`, `"Slovenian (Slovenia)"`, `"Spanish (Latin America)"`, `"Spanish (Mexico)"`, `"Swahili (Kenya)"`, `"Swedish (Sweden)"`, `"Urdu (Pakistan)"`
  - Examples: "English (US)", "French (France)", "Japanese (Japan)"

- **`speakers`** (`list<SpeakerConfig> | array`, _optional_):
  Multi-speaker voice configuration. When set, enables multi-speaker synthesis where different parts of the text are spoken by different voices. Each speaker needs a voice and a speaker_id (alias) that matches prefixes in the prompt.
  - One of: list<SpeakerConfig> | array
  - Examples: [{"speaker_id":"Host","voice":"Charon"},{"speaker_id":"DrChen","voice":"Kore"}]

- **`temperature`** (`float`, _optional_):
  Controls the randomness of the speech output. Higher values produce more creative and varied delivery, while lower values make the output more predictable and focused. Default value: `1`
  - Default: `1`
  - Range: `0` to `2`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Audio output format. mp3: compressed, small file size (recommended). wav: uncompressed PCM wrapped in WAV (24 kHz, 16-bit mono). ogg_opus: Ogg container with Opus codec, good quality-to-size ratio. Default value: `"mp3"`
  - Default: `"mp3"`
  - Options: `"wav"`, `"mp3"`, `"ogg_opus"`



**Required Parameters Example**:

```json
{
  "prompt": "I can't believe it worked! [laughing] After all those hours of debugging [sigh] it was just a missing semicolon."
}
```

**Full Example**:

```json
{
  "prompt": "I can't believe it worked! [laughing] After all those hours of debugging [sigh] it was just a missing semicolon.",
  "style_instructions": "Say the following in a warm, conversational tone",
  "voice": "Kore",
  "language_code": "English (US)",
  "speakers": [
    {
      "speaker_id": "Host",
      "voice": "Charon"
    },
    {
      "speaker_id": "DrChen",
      "voice": "Kore"
    }
  ],
  "temperature": 1,
  "output_format": "mp3"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a935d4f/Ez4NpcnFTuGsu2FHDaJTR_gemini_tts_output.mp3"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/b/0a935d4f/Ez4NpcnFTuGsu2FHDaJTR_gemini_tts_output.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/gemini-3.1-flash-tts \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "I can't believe it worked! [laughing] After all those hours of debugging [sigh] it was just a missing semicolon."
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
    "fal-ai/gemini-3.1-flash-tts",
    arguments={
        "prompt": "I can't believe it worked! [laughing] After all those hours of debugging [sigh] it was just a missing semicolon."
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

const result = await fal.subscribe("fal-ai/gemini-3.1-flash-tts", {
  input: {
    prompt: "I can't believe it worked! [laughing] After all those hours of debugging [sigh] it was just a missing semicolon."
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

- [Model Playground](https://fal.ai/models/fal-ai/gemini-3.1-flash-tts)
- [API Documentation](https://fal.ai/models/fal-ai/gemini-3.1-flash-tts/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/gemini-3.1-flash-tts)

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

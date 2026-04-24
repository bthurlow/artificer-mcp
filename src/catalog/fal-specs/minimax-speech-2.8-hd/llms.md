# MiniMax Speech 2.8 [HD]

> Generate speech from text prompts and different voices using the MiniMax Speech-2.8 HD model, which leverages advanced AI techniques to create high-quality text-to-speech.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/minimax/speech-2.8-hd`
- **Model ID**: `fal-ai/minimax/speech-2.8-hd`
- **Category**: text-to-speech
- **Kind**: inference


## Pricing

- **Price**: $0.1 per 1000 characters

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text to convert to speech. Use `<#x#>` for pauses (x = 0.01-99.99 seconds). Supports interjection tags: `(laughs)`, `(sighs)`, `(coughs)`, `(clears throat)`, `(gasps)`, `(sniffs)`, `(groans)`, `(yawns)`.
  - Examples: "Hello world! Welcome to MiniMax's new text to speech model <#0.1#> Speech 2.8 HD (laughs) now available on Fal!"

- **`voice_setting`** (`VoiceSetting`, _optional_):
  Voice configuration settings

- **`audio_setting`** (`AudioSetting`, _optional_):
  Audio configuration settings

- **`language_boost`** (`Enum`, _optional_):
  Enhance recognition of specified languages and dialects
  - Options: `"Chinese"`, `"Chinese,Yue"`, `"English"`, `"Arabic"`, `"Russian"`, `"Spanish"`, `"French"`, `"Portuguese"`, `"German"`, `"Turkish"`, `"Dutch"`, `"Ukrainian"`, `"Vietnamese"`, `"Indonesian"`, `"Japanese"`, `"Italian"`, `"Korean"`, `"Thai"`, `"Polish"`, `"Romanian"`, `"Greek"`, `"Czech"`, `"Finnish"`, `"Hindi"`, `"Bulgarian"`, `"Danish"`, `"Hebrew"`, `"Malay"`, `"Slovak"`, `"Swedish"`, `"Croatian"`, `"Hungarian"`, `"Norwegian"`, `"Slovenian"`, `"Catalan"`, `"Nynorsk"`, `"Afrikaans"`, `"auto"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Format of the output content (non-streaming only) Default value: `"hex"`
  - Default: `"hex"`
  - Options: `"url"`, `"hex"`

- **`pronunciation_dict`** (`PronunciationDict`, _optional_):
  Custom pronunciation dictionary for text replacement

- **`normalization_setting`** (`LoudnessNormalizationSetting`, _optional_):
  Loudness normalization settings for the audio

- **`voice_modify`** (`VoiceModify`, _optional_):
  Voice modification settings to adjust pitch, intensity, and timbre.



**Required Parameters Example**:

```json
{
  "prompt": "Hello world! Welcome to MiniMax's new text to speech model <#0.1#> Speech 2.8 HD (laughs) now available on Fal!"
}
```

**Full Example**:

```json
{
  "prompt": "Hello world! Welcome to MiniMax's new text to speech model <#0.1#> Speech 2.8 HD (laughs) now available on Fal!",
  "output_format": "hex"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8d0bda/pF8woD8Iafl8vL6BMk4k4_speech.mp3"}

- **`duration_ms`** (`integer`, _required_):
  Duration of the audio in milliseconds



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/b/0a8d0bda/pF8woD8Iafl8vL6BMk4k4_speech.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/minimax/speech-2.8-hd \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Hello world! Welcome to MiniMax's new text to speech model <#0.1#> Speech 2.8 HD (laughs) now available on Fal!"
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
    "fal-ai/minimax/speech-2.8-hd",
    arguments={
        "prompt": "Hello world! Welcome to MiniMax's new text to speech model <#0.1#> Speech 2.8 HD (laughs) now available on Fal!"
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

const result = await fal.subscribe("fal-ai/minimax/speech-2.8-hd", {
  input: {
    prompt: "Hello world! Welcome to MiniMax's new text to speech model <#0.1#> Speech 2.8 HD (laughs) now available on Fal!"
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

- [Model Playground](https://fal.ai/models/fal-ai/minimax/speech-2.8-hd)
- [API Documentation](https://fal.ai/models/fal-ai/minimax/speech-2.8-hd/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/minimax/speech-2.8-hd)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

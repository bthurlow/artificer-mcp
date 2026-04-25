# Whisper

> Whisper is a model for speech transcription and translation.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/whisper`
- **Model ID**: `fal-ai/whisper`
- **Category**: speech-to-text
- **Kind**: inference
**Tags**: transcription, translation, speech



## Pricing

- **Price**: $0 per compute seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to transcribe. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav or webm.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"

- **`task`** (`TaskEnum`, _optional_):
  Task to perform on the audio file. Either transcribe or translate. Default value: `"transcribe"`
  - Default: `"transcribe"`
  - Options: `"transcribe"`, `"translate"`

- **`language`** (`Enum`, _optional_):
  Language of the audio file. If set to null, the language will be
  automatically detected. Defaults to null.
  
  If translate is selected as the task, the audio will be translated to
  English, regardless of the language selected.
  - Options: `"af"`, `"am"`, `"ar"`, `"as"`, `"az"`, `"ba"`, `"be"`, `"bg"`, `"bn"`, `"bo"`, `"br"`, `"bs"`, `"ca"`, `"cs"`, `"cy"`, `"da"`, `"de"`, `"el"`, `"en"`, `"es"`, `"et"`, `"eu"`, `"fa"`, `"fi"`, `"fo"`, `"fr"`, `"gl"`, `"gu"`, `"ha"`, `"haw"`, `"he"`, `"hi"`, `"hr"`, `"ht"`, `"hu"`, `"hy"`, `"id"`, `"is"`, `"it"`, `"ja"`, `"jw"`, `"ka"`, `"kk"`, `"km"`, `"kn"`, `"ko"`, `"la"`, `"lb"`, `"ln"`, `"lo"`, `"lt"`, `"lv"`, `"mg"`, `"mi"`, `"mk"`, `"ml"`, `"mn"`, `"mr"`, `"ms"`, `"mt"`, `"my"`, `"ne"`, `"nl"`, `"nn"`, `"no"`, `"oc"`, `"pa"`, `"pl"`, `"ps"`, `"pt"`, `"ro"`, `"ru"`, `"sa"`, `"sd"`, `"si"`, `"sk"`, `"sl"`, `"sn"`, `"so"`, `"sq"`, `"sr"`, `"su"`, `"sv"`, `"sw"`, `"ta"`, `"te"`, `"tg"`, `"th"`, `"tk"`, `"tl"`, `"tr"`, `"tt"`, `"uk"`, `"ur"`, `"uz"`, `"vi"`, `"yi"`, `"yo"`, `"zh"`

- **`diarize`** (`boolean`, _optional_):
  Whether to diarize the audio file. Defaults to false. Setting to true will add costs proportional to diarization inference time.
  - Default: `false`

- **`chunk_level`** (`ChunkLevelEnum`, _optional_):
  Level of the chunks to return. Either none, segment or word. `none` would imply that all of the audio will be transcribed without the timestamp tokens, we suggest to switch to `none` if you are not satisfied with the transcription quality, since it will usually improve the quality of the results. Switching to `none` will also provide minor speed ups in the transcription due to less amount of generated tokens. Notice that setting to none will produce **a single chunk with the whole transcription**. Default value: `"segment"`
  - Default: `"segment"`
  - Options: `"none"`, `"segment"`, `"word"`

- **`batch_size`** (`integer`, _optional_):
   Default value: `64`
  - Default: `64`
  - Range: `1` to `64`
  - Examples: 64

- **`prompt`** (`string`, _optional_):
  Prompt to use for generation. Defaults to an empty string. Default value: `""`
  - Default: `""`

- **`num_speakers`** (`integer`, _optional_):
  Number of speakers in the audio file. Defaults to null.
  If not provided, the number of speakers will be automatically
  detected.
  - Examples: null



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3",
  "task": "transcribe",
  "chunk_level": "segment",
  "batch_size": 64,
  "num_speakers": null
}
```


### Output Schema

The API returns the following output format:

- **`text`** (`string`, _required_):
  Transcription of the audio file
  - Examples: "María, ¿qué cenamos hoy? No sé, ¿qué cenamos? ¿Cenamos pollo frito o pollo asado o algo? Mejor a la plancha, quiero una salada. A la plancha, vale. Y hacemos una ensalada con tomate y esas cosas. Vale. Pues eso lo hacemos, ¿vale? Venga, vale."

- **`chunks`** (`list<WhisperChunk>`, _optional_):
  Timestamp chunks of the audio file
  - Array of WhisperChunk

- **`inferred_languages`** (`list<Enum>`, _required_):
  List of languages that the audio file is inferred to be. Defaults to null.
  - Array of Enum

- **`diarization_segments`** (`list<DiarizationSegment>`, _required_):
  Speaker diarization segments of the audio file. Only present if diarization is enabled.
  - Array of DiarizationSegment



**Example Response**:

```json
{
  "text": "María, ¿qué cenamos hoy? No sé, ¿qué cenamos? ¿Cenamos pollo frito o pollo asado o algo? Mejor a la plancha, quiero una salada. A la plancha, vale. Y hacemos una ensalada con tomate y esas cosas. Vale. Pues eso lo hacemos, ¿vale? Venga, vale.",
  "chunks": [
    {
      "text": ""
    }
  ],
  "diarization_segments": [
    {
      "speaker": ""
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/whisper \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
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
    "fal-ai/whisper",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
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

const result = await fal.subscribe("fal-ai/whisper", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/whisper)
- [API Documentation](https://fal.ai/models/fal-ai/whisper/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/whisper)
- [GitHub Repository](https://github.com/openai/whisper/blob/main/LICENSE)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Wizper (Whisper v3 -- fal.ai edition)

> [Experimental] Whisper v3 Large -- but optimized by our inference wizards. Same WER, double the performance!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wizper`
- **Model ID**: `fal-ai/wizper`
- **Category**: speech-to-text
- **Kind**: inference
**Tags**: transcription, speech



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
  - Examples: "https://ihlhivqvotguuqycfcvj.supabase.co/storage/v1/object/public/public-text-to-speech/scratch-testing/earth-history-19mins.mp3"

- **`task`** (`TaskEnum`, _optional_):
  Task to perform on the audio file. Either transcribe or translate. Default value: `"transcribe"`
  - Default: `"transcribe"`
  - Options: `"transcribe"`, `"translate"`

- **`language`** (`Enum`, _optional_):
  Language of the audio file.
  If translate is selected as the task, the audio will be translated to
  English, regardless of the language selected. If `None` is passed,
  the language will be automatically detected. This will also increase
  the inference time. Default value: `en`
  - Default: `"en"`
  - Options: `"af"`, `"am"`, `"ar"`, `"as"`, `"az"`, `"ba"`, `"be"`, `"bg"`, `"bn"`, `"bo"`, `"br"`, `"bs"`, `"ca"`, `"cs"`, `"cy"`, `"da"`, `"de"`, `"el"`, `"en"`, `"es"`, `"et"`, `"eu"`, `"fa"`, `"fi"`, `"fo"`, `"fr"`, `"gl"`, `"gu"`, `"ha"`, `"haw"`, `"he"`, `"hi"`, `"hr"`, `"ht"`, `"hu"`, `"hy"`, `"id"`, `"is"`, `"it"`, `"ja"`, `"jw"`, `"ka"`, `"kk"`, `"km"`, `"kn"`, `"ko"`, `"la"`, `"lb"`, `"ln"`, `"lo"`, `"lt"`, `"lv"`, `"mg"`, `"mi"`, `"mk"`, `"ml"`, `"mn"`, `"mr"`, `"ms"`, `"mt"`, `"my"`, `"ne"`, `"nl"`, `"nn"`, `"no"`, `"oc"`, `"pa"`, `"pl"`, `"ps"`, `"pt"`, `"ro"`, `"ru"`, `"sa"`, `"sd"`, `"si"`, `"sk"`, `"sl"`, `"sn"`, `"so"`, `"sq"`, `"sr"`, `"su"`, `"sv"`, `"sw"`, `"ta"`, `"te"`, `"tg"`, `"th"`, `"tk"`, `"tl"`, `"tr"`, `"tt"`, `"uk"`, `"ur"`, `"uz"`, `"vi"`, `"yi"`, `"yo"`, `"zh"`
  - Examples: null

- **`chunk_level`** (`string`, _optional_):
  Level of the chunks to return. Default value: `"segment"`
  - Default: `"segment"`

- **`max_segment_len`** (`integer`, _optional_):
  Maximum speech segment duration in seconds before splitting. Default value: `29`
  - Default: `29`
  - Range: `10` to `29`

- **`merge_chunks`** (`boolean`, _optional_):
  Whether to merge consecutive chunks. When enabled, chunks are merged if their combined duration does not exceed max_segment_len. Default value: `true`
  - Default: `true`

- **`version`** (`string`, _optional_):
  Version of the model to use. All of the models are the Whisper large variant. Default value: `"3"`
  - Default: `"3"`



**Required Parameters Example**:

```json
{
  "audio_url": "https://ihlhivqvotguuqycfcvj.supabase.co/storage/v1/object/public/public-text-to-speech/scratch-testing/earth-history-19mins.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://ihlhivqvotguuqycfcvj.supabase.co/storage/v1/object/public/public-text-to-speech/scratch-testing/earth-history-19mins.mp3",
  "task": "transcribe",
  "language": null,
  "chunk_level": "segment",
  "max_segment_len": 29,
  "merge_chunks": true,
  "version": "3"
}
```


### Output Schema

The API returns the following output format:

- **`text`** (`string`, _required_):
  Transcription of the audio file

- **`chunks`** (`list<WhisperChunk>`, _required_):
  Timestamp chunks of the audio file
  - Array of WhisperChunk

- **`languages`** (`list<Enum>`, _required_):
  List of languages that the audio file is inferred to be. Defaults to null.
  - Array of Enum



**Example Response**:

```json
{
  "text": "",
  "chunks": [
    {
      "text": ""
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wizper \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://ihlhivqvotguuqycfcvj.supabase.co/storage/v1/object/public/public-text-to-speech/scratch-testing/earth-history-19mins.mp3"
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
    "fal-ai/wizper",
    arguments={
        "audio_url": "https://ihlhivqvotguuqycfcvj.supabase.co/storage/v1/object/public/public-text-to-speech/scratch-testing/earth-history-19mins.mp3"
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

const result = await fal.subscribe("fal-ai/wizper", {
  input: {
    audio_url: "https://ihlhivqvotguuqycfcvj.supabase.co/storage/v1/object/public/public-text-to-speech/scratch-testing/earth-history-19mins.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/wizper)
- [API Documentation](https://fal.ai/models/fal-ai/wizper/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wizper)
- [GitHub Repository](https://github.com/openai/whisper/blob/main/LICENSE)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

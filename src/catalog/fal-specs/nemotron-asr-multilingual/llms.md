# Nemotron Asr Multilingual

> Nemotron-ASR-Streaming is a multi lingual, streaming Automatic Speech Recognition (ASR) engineered to deliver high-quality multi lingual transcription across both low-latency streaming and high-throughput batch workloads.


## Overview

- **Endpoint**: `https://fal.run/nvidia/nemotron-asr-multilingual/asr`
- **Model ID**: `nvidia/nemotron-asr-multilingual/asr`
- **Category**: speech-to-text
- **Kind**: inference
**Tags**: utility, transcribe, 



## Pricing

- **Price**: $0.008 per minutes

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to transcribe.
  - Examples: "https://v3b.fal.media/files/b/0a9c95c6/qxxx5skDQl8fPqbkjpxBc_speech.mp3"

- **`language`** (`LanguageEnum`, _optional_):
  Target language for transcription (language-ID prompt). 'auto' lets the model detect the language. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"en-US"`, `"en-GB"`, `"es-US"`, `"es-ES"`, `"de-DE"`, `"fr-FR"`, `"fr-CA"`, `"it-IT"`, `"ar-AR"`, `"ja-JP"`, `"ko-KR"`, `"pt-BR"`, `"pt-PT"`, `"ru-RU"`, `"hi-IN"`, `"zh-CN"`, `"vi-VN"`, `"he-IL"`, `"nl-NL"`, `"cs-CZ"`, `"da-DK"`, `"pl-PL"`, `"nn-NO"`, `"nb-NO"`, `"sv-SE"`, `"th-TH"`, `"tr-TR"`, `"bg-BG"`, `"el-GR"`, `"et-EE"`, `"fi-FI"`, `"hr-HR"`, `"hu-HU"`, `"lt-LT"`, `"lv-LV"`, `"ro-RO"`, `"sk-SK"`, `"uk-UA"`, `"mt-MT"`, `"sl-SI"`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  Controls the speed/accuracy trade-off. 'none' = best accuracy (1.12s chunks), 'regular' = balanced (0.56s chunks), 'high' = faster (0.32s chunks), 'full' = fastest (0.08s chunks). Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`, `"high"`, `"full"`



**Required Parameters Example**:

```json
{
  "audio_url": "https://v3b.fal.media/files/b/0a9c95c6/qxxx5skDQl8fPqbkjpxBc_speech.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://v3b.fal.media/files/b/0a9c95c6/qxxx5skDQl8fPqbkjpxBc_speech.mp3",
  "language": "auto",
  "acceleration": "regular"
}
```


### Output Schema

The API returns the following output format:

- **`output`** (`string`, _required_):
  The transcribed text from the audio.
  - Examples: "Actually, I'm second guessing myself a single coherent passage might be cleaner and more representative of real world speech performance, which is what benchmarking typically uses. I'll write an engaging flowing piece on something like a journey or a day in a tech forward city. That weaves in all the varied elements naturally, rather than splitting it into sections. I'm deciding to keep the targeted tricky sentences section after all. It'll directly test homophones and number heavy lines that are most prone to errors, so I'll include it as a concise, clearly marked addition at the end now. I'm drafting the full passage, starting with a detailed travel narrative that weaves in dates, times, currency, and specific details by the time we pulled into Waverley Station, my phone had buzzed forty seven times, mostly from doctor Amara Akon Reyes at Neurosynt Technologies fretting over our board presentation. We'd spent three weeks refining a transformer model with one point three billion parameters, and the improvements were stunning. Our word error rate plummeted from fourteen point two percent down to three point eight percent. There's something surreal about watching those number shift like that. They're not just metrics they're the payoff from countless late nights and too much coffee."

- **`partial`** (`boolean`, _optional_):
  True if this is an intermediate result during streaming.
  - Default: `false`



**Example Response**:

```json
{
  "output": "Actually, I'm second guessing myself a single coherent passage might be cleaner and more representative of real world speech performance, which is what benchmarking typically uses. I'll write an engaging flowing piece on something like a journey or a day in a tech forward city. That weaves in all the varied elements naturally, rather than splitting it into sections. I'm deciding to keep the targeted tricky sentences section after all. It'll directly test homophones and number heavy lines that are most prone to errors, so I'll include it as a concise, clearly marked addition at the end now. I'm drafting the full passage, starting with a detailed travel narrative that weaves in dates, times, currency, and specific details by the time we pulled into Waverley Station, my phone had buzzed forty seven times, mostly from doctor Amara Akon Reyes at Neurosynt Technologies fretting over our board presentation. We'd spent three weeks refining a transformer model with one point three billion parameters, and the improvements were stunning. Our word error rate plummeted from fourteen point two percent down to three point eight percent. There's something surreal about watching those number shift like that. They're not just metrics they're the payoff from countless late nights and too much coffee."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/nvidia/nemotron-asr-multilingual/asr \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://v3b.fal.media/files/b/0a9c95c6/qxxx5skDQl8fPqbkjpxBc_speech.mp3"
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
    "nvidia/nemotron-asr-multilingual/asr",
    arguments={
        "audio_url": "https://v3b.fal.media/files/b/0a9c95c6/qxxx5skDQl8fPqbkjpxBc_speech.mp3"
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

const result = await fal.subscribe("nvidia/nemotron-asr-multilingual/asr", {
  input: {
    audio_url: "https://v3b.fal.media/files/b/0a9c95c6/qxxx5skDQl8fPqbkjpxBc_speech.mp3"
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

- [Model Playground](https://fal.ai/models/nvidia/nemotron-asr-multilingual/asr)
- [API Documentation](https://fal.ai/models/nvidia/nemotron-asr-multilingual/asr/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=nvidia/nemotron-asr-multilingual/asr)

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

# Demucs

> SOTA stemming model for voice, drums, bass, guitar and more.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/demucs`
- **Model ID**: `fal-ai/demucs`
- **Category**: audio-to-audio
- **Kind**: inference
**Tags**: audio



## Pricing

- **Price**: $0.0007 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  URL of the audio file to separate into stems
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/audio-understanding/Title_%20Running%20on%20Fal.mp3"

- **`model`** (`ModelEnum`, _optional_):
  Demucs model to use for separation Default value: `"htdemucs_6s"`
  - Default: `"htdemucs_6s"`
  - Options: `"htdemucs"`, `"htdemucs_ft"`, `"htdemucs_6s"`, `"hdemucs_mmi"`, `"mdx"`, `"mdx_extra"`, `"mdx_q"`, `"mdx_extra_q"`
  - Examples: "htdemucs_6s"

- **`stems`** (`list<Enum>`, _optional_):
  Specific stems to extract. If None, extracts all available stems. Available stems depend on model: vocals, drums, bass, other, guitar, piano (for 6s model)
  - Default: `["vocals","drums","bass","other","guitar","piano"]`
  - Array of Enum
  - Examples: ["vocals","drums","bass","other","guitar","piano"]

- **`segment_length`** (`integer`, _optional_):
  Length in seconds of each segment for processing (minimum 1). Smaller values use less memory but may reduce quality. Default is model-specific.

- **`shifts`** (`integer`, _optional_):
  Number of random shifts for equivariant stabilization. Higher values improve quality but increase processing time. Default value: `1`
  - Default: `1`
  - Range: `1` to `10`

- **`overlap`** (`float`, _optional_):
  Overlap between segments (0.0 to 1.0). Higher values may improve quality but increase processing time. Default value: `0.25`
  - Default: `0.25`
  - Range: `0` to `1`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output audio format for the separated stems Default value: `"mp3"`
  - Default: `"mp3"`
  - Options: `"wav"`, `"mp3"`
  - Examples: "mp3"



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/audio-understanding/Title_%20Running%20on%20Fal.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/model_tests/audio-understanding/Title_%20Running%20on%20Fal.mp3",
  "model": "htdemucs_6s",
  "stems": [
    "vocals",
    "drums",
    "bass",
    "other",
    "guitar",
    "piano"
  ],
  "shifts": 1,
  "overlap": 0.25,
  "output_format": "mp3"
}
```


### Output Schema

The API returns the following output format:

- **`vocals`** (`File`, _optional_):
  Separated vocals audio file

- **`drums`** (`File`, _optional_):
  Separated drums audio file

- **`bass`** (`File`, _optional_):
  Separated bass audio file

- **`other`** (`File`, _optional_):
  Separated other instruments audio file

- **`guitar`** (`File`, _optional_):
  Separated guitar audio file (only available for 6s models)

- **`piano`** (`File`, _optional_):
  Separated piano audio file (only available for 6s models)



**Example Response**:

```json
{}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/demucs \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/model_tests/audio-understanding/Title_%20Running%20on%20Fal.mp3"
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
    "fal-ai/demucs",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/model_tests/audio-understanding/Title_%20Running%20on%20Fal.mp3"
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

const result = await fal.subscribe("fal-ai/demucs", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/model_tests/audio-understanding/Title_%20Running%20on%20Fal.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/demucs)
- [API Documentation](https://fal.ai/models/fal-ai/demucs/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/demucs)

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

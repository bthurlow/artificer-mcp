# MiniMax Music 3

> MiniMax Music 3 is a high-performance music generation model for creating complete songs up to five minutes long


## Overview

- **Endpoint**: `https://fal.run/minimax/music-3`
- **Model ID**: `minimax/music-3`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: sfx, audio, effects, 



## Pricing

- **Price**: $0.002 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Music description: style, mood, vocals, instrumentation and arrangement. For precise control use a Structured Caption with global metadata (genre, BPM, key, emotional progression), vocal details, and a section-by-section arrangement.
  - Examples: "Genre: acoustic pop. BPM: 96. Key: C major. Warm and intimate, building gently into the chorus. Vocals: soft female lead, close and breathy, light stacked harmonies in the chorus. Arrangement: fingerpicked guitar and soft piano; brushed drums and upright bass enter in the chorus."

- **`lyrics`** (`string`, _required_):
  The lyrics to sing. Structure tags such as [intro], [verse], [pre-chorus], [chorus], [post-chorus], [bridge], [instrumental], [solo] and [outro] must each be on their own line; text on the same line as a leading tag is dropped by the model's input contract.
  - Examples: "[verse]\nMorning light filtering through the pine\nEvery quiet street is yours and mine\n[chorus]\nSoftly the world begins to breathe"

- **`duration`** (`float`, _optional_):
  Upper bound on the generated audio length in seconds. The model may stop earlier; the actual duration is returned in the output. Default value: `60`
  - Default: `60`
  - Range: `1` to `300`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If not provided, a random seed will be used.

- **`num_inference_steps`** (`integer`, _optional_):
  Number of flow-matching Euler steps per 8-second denoising chunk. More steps improve quality at the cost of speed. Default value: `30`
  - Default: `30`
  - Range: `1` to `100`
  - Examples: 30

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale of the flow-matching stage. Default value: `1.7`
  - Default: `1.7`
  - Range: `0` to `20`
  - Examples: 1.7



**Required Parameters Example**:

```json
{
  "prompt": "Genre: acoustic pop. BPM: 96. Key: C major. Warm and intimate, building gently into the chorus. Vocals: soft female lead, close and breathy, light stacked harmonies in the chorus. Arrangement: fingerpicked guitar and soft piano; brushed drums and upright bass enter in the chorus.",
  "lyrics": "[verse]\nMorning light filtering through the pine\nEvery quiet street is yours and mine\n[chorus]\nSoftly the world begins to breathe"
}
```

**Full Example**:

```json
{
  "prompt": "Genre: acoustic pop. BPM: 96. Key: C major. Warm and intimate, building gently into the chorus. Vocals: soft female lead, close and breathy, light stacked harmonies in the chorus. Arrangement: fingerpicked guitar and soft piano; brushed drums and upright bass enter in the chorus.",
  "lyrics": "[verse]\nMorning light filtering through the pine\nEvery quiet street is yours and mine\n[chorus]\nSoftly the world begins to breathe",
  "duration": 60,
  "num_inference_steps": 30,
  "guidance_scale": 1.7
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio file (44.1 kHz 16-bit stereo WAV).

- **`seed`** (`integer`, _required_):
  The random seed used for the generation process.
  - Examples: 42

- **`duration`** (`float`, _required_):
  The actual duration of the generated audio in seconds (may be shorter than the requested duration).
  - Examples: 60



**Example Response**:

```json
{
  "audio": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  },
  "seed": 42,
  "duration": 60
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/minimax/music-3 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Genre: acoustic pop. BPM: 96. Key: C major. Warm and intimate, building gently into the chorus. Vocals: soft female lead, close and breathy, light stacked harmonies in the chorus. Arrangement: fingerpicked guitar and soft piano; brushed drums and upright bass enter in the chorus.",
     "lyrics": "[verse]\nMorning light filtering through the pine\nEvery quiet street is yours and mine\n[chorus]\nSoftly the world begins to breathe"
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
    "minimax/music-3",
    arguments={
        "prompt": "Genre: acoustic pop. BPM: 96. Key: C major. Warm and intimate, building gently into the chorus. Vocals: soft female lead, close and breathy, light stacked harmonies in the chorus. Arrangement: fingerpicked guitar and soft piano; brushed drums and upright bass enter in the chorus.",
        "lyrics": "[verse]
    Morning light filtering through the pine
    Every quiet street is yours and mine
    [chorus]
    Softly the world begins to breathe"
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

const result = await fal.subscribe("minimax/music-3", {
  input: {
    prompt: "Genre: acoustic pop. BPM: 96. Key: C major. Warm and intimate, building gently into the chorus. Vocals: soft female lead, close and breathy, light stacked harmonies in the chorus. Arrangement: fingerpicked guitar and soft piano; brushed drums and upright bass enter in the chorus.",
    lyrics: "[verse]
  Morning light filtering through the pine
  Every quiet street is yours and mine
  [chorus]
  Softly the world begins to breathe"
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

- [Model Playground](https://fal.ai/models/minimax/music-3)
- [API Documentation](https://fal.ai/models/minimax/music-3/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=minimax/music-3)

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

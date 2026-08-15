# Elevenlabs

> Generate sound effects using ElevenLabs advanced sound effects model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/sound-effects/v2`
- **Model ID**: `fal-ai/elevenlabs/sound-effects/v2`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: sound



## Pricing

- **Price**: $0.002 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text describing the sound effect to generate
  - Examples: "Spacious braam suitable for high-impact movie trailer moments", "A gentle wind chime tinkling in a soft breeze"

- **`duration_seconds`** (`float`, _optional_):
  Duration in seconds (0.5-22). If None, optimal duration will be determined from prompt.
  - Range: `0.5` to `22`

- **`prompt_influence`** (`float`, _optional_):
  How closely to follow the prompt (0-1). Higher values mean less variation. Default value: `0.3`
  - Default: `0.3`
  - Range: `0` to `1`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output format of the generated audio. Formatted as codec_sample_rate_bitrate. Default value: `"mp3_44100_128"`
  - Default: `"mp3_44100_128"`
  - Options: `"mp3_22050_32"`, `"mp3_44100_32"`, `"mp3_44100_64"`, `"mp3_44100_96"`, `"mp3_44100_128"`, `"mp3_44100_192"`, `"pcm_8000"`, `"pcm_16000"`, `"pcm_22050"`, `"pcm_24000"`, `"pcm_44100"`, `"pcm_48000"`, `"ulaw_8000"`, `"alaw_8000"`, `"opus_48000_32"`, `"opus_48000_64"`, `"opus_48000_96"`, `"opus_48000_128"`, `"opus_48000_192"`

- **`loop`** (`boolean`, _optional_):
  Whether to create a sound effect that loops smoothly.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "text": "Spacious braam suitable for high-impact movie trailer moments"
}
```

**Full Example**:

```json
{
  "text": "Spacious braam suitable for high-impact movie trailer moments",
  "prompt_influence": 0.3,
  "output_format": "mp3_44100_128"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated sound effect audio file in MP3 format
  - Examples: {"url":"https://v3.fal.media/files/lion/WgnO-jy6WduosuG_Ibobx_sound_effect.mp3"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3.fal.media/files/lion/WgnO-jy6WduosuG_Ibobx_sound_effect.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/elevenlabs/sound-effects/v2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "Spacious braam suitable for high-impact movie trailer moments"
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
    "fal-ai/elevenlabs/sound-effects/v2",
    arguments={
        "text": "Spacious braam suitable for high-impact movie trailer moments"
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

const result = await fal.subscribe("fal-ai/elevenlabs/sound-effects/v2", {
  input: {
    text: "Spacious braam suitable for high-impact movie trailer moments"
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/sound-effects/v2)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/sound-effects/v2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/sound-effects/v2)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

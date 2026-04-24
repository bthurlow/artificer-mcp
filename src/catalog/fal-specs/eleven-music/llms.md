# Elevenlabs Music

> Generate high quality, realistic music with fine controls using Elevenlabs Music!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/elevenlabs/music`
- **Model ID**: `fal-ai/elevenlabs/music`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: music, text-to-music



## Pricing

Your request will cost **$0.8** per output audio minute. The audio will be **rounded up** to the closest minute. For instance, a generation with 30 seconds output will be billed as 1 minute.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  The text prompt describing the music to generate
  - Examples: "Mysterious original soundtrack, themes of jungle, rainforest, nature, woodwinds, busy rhythmic tribal percussion."

- **`composition_plan`** (`MusicCompositionPlan`, _optional_):
  The composition plan for the music

- **`music_length_ms`** (`integer`, _optional_):
  The length of the song to generate in milliseconds. Used only in conjunction with prompt. Must be between 3000ms and 600000ms. Optional - if not provided, the model will choose a length based on the prompt.
  - Range: `3000` to `600000`

- **`force_instrumental`** (`boolean`, _optional_):
  If true, guarantees that the generated song will be instrumental. If false, the song may or may not be instrumental depending on the prompt. Can only be used with prompt.
  - Default: `false`

- **`respect_sections_durations`** (`boolean`, _optional_):
  Controls how strictly section durations in the composition_plan are enforced. It will only have an effect if it is used with composition_plan. When set to true, the model will precisely respect each section's duration_ms from the plan. When set to false, the model may adjust individual section durations which will generally lead to better generation quality and improved latency, while always preserving the total song duration from the plan. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output format of the generated audio. Formatted as codec_sample_rate_bitrate. So an mp3 with 22.05kHz sample rate at 32kbs is represented as mp3_22050_32. MP3 with 192kbps bitrate requires you to be subscribed to Creator tier or above. PCM with 44.1kHz sample rate requires you to be subscribed to Pro tier or above. Note that the μ-law format (sometimes written mu-law, often approximated as u-law) is commonly used for Twilio audio inputs. Default value: `"mp3_44100_128"`
  - Default: `"mp3_44100_128"`
  - Options: `"mp3_22050_32"`, `"mp3_44100_32"`, `"mp3_44100_64"`, `"mp3_44100_96"`, `"mp3_44100_128"`, `"mp3_44100_192"`, `"pcm_8000"`, `"pcm_16000"`, `"pcm_22050"`, `"pcm_24000"`, `"pcm_44100"`, `"pcm_48000"`, `"ulaw_8000"`, `"alaw_8000"`, `"opus_48000_32"`, `"opus_48000_64"`, `"opus_48000_96"`, `"opus_48000_128"`, `"opus_48000_192"`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "prompt": "Mysterious original soundtrack, themes of jungle, rainforest, nature, woodwinds, busy rhythmic tribal percussion.",
  "respect_sections_durations": true,
  "output_format": "mp3_44100_128"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated music audio file in MP3 format
  - Examples: {"file_name":"music_generated.mp3","content_type":"audio/mpeg","url":"https://storage.googleapis.com/falserverless/example_outputs/elevenlabs/music_generated.mp3"}



**Example Response**:

```json
{
  "audio": {
    "file_name": "music_generated.mp3",
    "content_type": "audio/mpeg",
    "url": "https://storage.googleapis.com/falserverless/example_outputs/elevenlabs/music_generated.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/elevenlabs/music \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
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
    "fal-ai/elevenlabs/music",
    arguments={},
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

const result = await fal.subscribe("fal-ai/elevenlabs/music", {
  input: {},
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

- [Model Playground](https://fal.ai/models/fal-ai/elevenlabs/music)
- [API Documentation](https://fal.ai/models/fal-ai/elevenlabs/music/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/elevenlabs/music)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

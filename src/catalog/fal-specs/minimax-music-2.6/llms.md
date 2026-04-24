# Minimax Music 2.6

> MiniMax Music 2.6 creates complete tracks with singing, backing music, and detailed arrangements from lyrics and a style description.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/minimax-music/v2.6`
- **Model ID**: `fal-ai/minimax-music/v2.6`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

- **Price**: $0.15 per audios

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  A description of the music style, mood, genre, and scenario. 10-2000 characters.
  - Examples: "City Pop, 80s retro, groovy synth bass, warm female vocal, 104 BPM, nostalgic urban night"

- **`lyrics`** (`string`, _optional_):
  Lyrics of the song. Use 
   to separate lines. Supports structure tags: [Intro], [Verse], [Pre Chorus], [Chorus], [Post Chorus], [Hook], [Bridge], [Interlude], [Transition], [Build Up], [Break], [Inst], [Solo], [Outro]. Max 3500 characters. Required when is_instrumental is false. Default value: `""`
  - Default: `""`
  - Examples: "[verse]\nStreetlights flicker, the night breeze sighs\nShadows stretch as I walk alone\n[chorus]\nWandering, longing, where should I go"

- **`lyrics_optimizer`** (`boolean`, _optional_):
  When true and lyrics is empty, auto-generates lyrics from the prompt.
  - Default: `false`

- **`is_instrumental`** (`boolean`, _optional_):
  When true, generates vocal-free instrumental music.
  - Default: `false`

- **`audio_setting`** (`AudioSetting25`, _optional_):
  Audio configuration settings



**Required Parameters Example**:

```json
{
  "prompt": "City Pop, 80s retro, groovy synth bass, warm female vocal, 104 BPM, nostalgic urban night"
}
```

**Full Example**:

```json
{
  "prompt": "City Pop, 80s retro, groovy synth bass, warm female vocal, 104 BPM, nostalgic urban night",
  "lyrics": "[verse]\nStreetlights flicker, the night breeze sighs\nShadows stretch as I walk alone\n[chorus]\nWandering, longing, where should I go"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated music
  - Examples: {"url":"https://v3b.fal.media/files/b/kangaroo/GJe3sQehFteUTmpDROzOs_output.mp3"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/b/kangaroo/GJe3sQehFteUTmpDROzOs_output.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/minimax-music/v2.6 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "City Pop, 80s retro, groovy synth bass, warm female vocal, 104 BPM, nostalgic urban night"
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
    "fal-ai/minimax-music/v2.6",
    arguments={
        "prompt": "City Pop, 80s retro, groovy synth bass, warm female vocal, 104 BPM, nostalgic urban night"
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

const result = await fal.subscribe("fal-ai/minimax-music/v2.6", {
  input: {
    prompt: "City Pop, 80s retro, groovy synth bass, warm female vocal, 104 BPM, nostalgic urban night"
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

- [Model Playground](https://fal.ai/models/fal-ai/minimax-music/v2.6)
- [API Documentation](https://fal.ai/models/fal-ai/minimax-music/v2.6/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/minimax-music/v2.6)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

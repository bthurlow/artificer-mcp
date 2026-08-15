# Wan v2.6 Text to Video

> Wan 2.6 text-to-video model.


## Overview

- **Endpoint**: `https://fal.run/wan/v2.6/text-to-video`
- **Model ID**: `wan/v2.6/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video



## Pricing

Your request will cost  **$0.10** per second for **720p**, **$0.15** per second for **1080p**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt for video generation. Supports Chinese and English, max 800 characters. For multi-shot videos, use format: 'Overall description. First shot [0-3s] content. Second shot [3-5s] content.'
  - Examples: "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.\n\nShot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"\nShot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"\nShot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"\nShot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"\n"

- **`audio_url`** (`string`, _optional_):
  URL of the audio to use as the background music. Must be publicly accessible.
  Limit handling: If the audio duration exceeds the duration value (5, 10, or 15 seconds),
  the audio is truncated to the first N seconds, and the rest is discarded. If
  the audio is shorter than the video, the remaining part of the video will be silent.
  For example, if the audio is 3 seconds long and the video duration is 5 seconds, the
  first 3 seconds of the output video will have sound, and the last 2 seconds will be silent.
  - Format: WAV, MP3.
  - Duration: 3 to 30 s.
  - File size: Up to 15 MB.

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Wan 2.6 supports additional ratios. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Video resolution tier. Wan 2.6 T2V only supports 720p and 1080p (no 480p). Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the generated video in seconds. Choose between 5, 10, or 15 seconds. Default value: `"5"`
  - Default: `"5"`
  - Options: `"5"`, `"10"`, `"15"`
  - Examples: "5", "10", "15"

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt to describe content to avoid. Max 500 characters. Default value: `""`
  - Default: `""`
  - Examples: "low resolution, error, worst quality, low quality, defects"

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt rewriting using LLM. Improves results for short prompts but increases processing time. Default value: `true`
  - Default: `true`

- **`multi_shots`** (`boolean`, _optional_):
  When true, enables intelligent multi-shot segmentation for coherent narrative videos. Only active when enable_prompt_expansion is True. Set to false for single-shot generation. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`
  - Examples: true



**Required Parameters Example**:

```json
{
  "prompt": "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.\n\nShot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"\nShot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"\nShot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"\nShot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"\n"
}
```

**Full Example**:

```json
{
  "prompt": "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.\n\nShot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"\nShot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"\nShot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"\nShot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"\n",
  "aspect_ratio": "16:9",
  "resolution": "1080p",
  "duration": "5",
  "negative_prompt": "low resolution, error, worst quality, low quality, defects",
  "enable_prompt_expansion": true,
  "multi_shots": true,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file
  - Examples: {"url":"https://v3b.fal.media/files/b/0a867564/PsHtrg623uJuI7DdRqXvb_etx4d0Un.mp4","content_type":"video/mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation
  - Examples: 175932751

- **`actual_prompt`** (`string`, _optional_):
  The actual prompt used if prompt rewriting was enabled
  - Examples: "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.\n\nShot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"\nShot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"\nShot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"\nShot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"\n"



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a867564/PsHtrg623uJuI7DdRqXvb_etx4d0Un.mp4",
    "content_type": "video/mp4"
  },
  "seed": 175932751,
  "actual_prompt": "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.\n\nShot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"\nShot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"\nShot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"\nShot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"\n"
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/wan/v2.6/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.\n\nShot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"\nShot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"\nShot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"\nShot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"\n"
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
    "wan/v2.6/text-to-video",
    arguments={
        "prompt": "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.

    Shot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"
    Shot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"
    Shot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"
    Shot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"
    "
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

const result = await fal.subscribe("wan/v2.6/text-to-video", {
  input: {
    prompt: "Humorous but premium mini-trailer: a tiny fox 3D director proves \"multi-scene\" by calling simple commands that instantly change the set. Extreme photoreal 4K, cinematic lighting, subtle film grain, smooth camera. No subtitles, no UI, no watermark.

  Shot 1 [0-3s] Macro close-up on the fox snapping a clapboard labeled \"fal\". the fox says : \"Action.\"
  Shot 2 [3-6s] Hard cut: Wild West street at sunset. Wide shot, dust in the air. The Fox (in frame) points forward: \"Make it wide.\"
  Shot 3 [6-10s] Hard cut: jungle river. The fox stands on a small boat. The camera pushes forward through vines and mist. Fox saying: \"Now… adventure.\"
  Shot 4 [10-15s] Hard cut: space station window. Slow orbit around the fox with stars outside. Fox nods: \"Done. Next movie.\"
  "
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

- [Model Playground](https://fal.ai/models/wan/v2.6/text-to-video)
- [API Documentation](https://fal.ai/models/wan/v2.6/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=wan/v2.6/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

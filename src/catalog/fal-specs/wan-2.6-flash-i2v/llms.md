# V2.6

> Wan 2.6 image-to-video flash model.


## Overview

- **Endpoint**: `https://fal.run/wan/v2.6/image-to-video/flash`
- **Model ID**: `wan/v2.6/image-to-video/flash`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost  **$0.05** per second for **720p**, **$0.075** per second for **1080p**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the desired video motion. Max 800 characters.
  - Examples: "A comedic cinematic demo where typed prompts physically transform reality. Photoreal, strong match cuts, coherent main character, no subtitles.\n\nShot 1 [0-4s] Continue from first frame. The creator presses \"PRINT\". The machine clunks like a spaceship. Creator whispers: \"Okay… I'm pressing enter.\"\nShot 2 [4-8s] Smash cut: the printed paper flies into the air and unfolds into a full desert canyon scene around the desk, like reality is being unrolled. Creator says: \"Wait—my prompt has physics?\"\nShot 3 [8-12s] Hard cut: the paper tears and reveals a tropical jungle behind it, perfectly lit, cinematic sun. Creator laughs: \"This is exactly why we do AI.\"\nShot 4 [12-15s] Hard cut back to studio. The printer prints a final line (not shown clearly). Creator looks to camera: \"Multi-scene. Single prompt.\""

- **`image_url`** (`string`, _required_):
  URL of the image to use as the first frame. Must be publicly accessible or base64 data URI. Image dimensions must be between 240 and 7680.
  - Examples: "https://v3b.fal.media/files/b/0a8673dd/m9EV5W9aSqg8J7rb-18TK.png"

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

- **`resolution`** (`ResolutionEnum`, _optional_):
  Video resolution. Valid values: 720p, 1080p Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the generated video in seconds. Choose between 5, 10 or 15 seconds. Default value: `"5"`
  - Default: `"5"`
  - Options: `"5"`, `"10"`, `"15"`
  - Examples: "5", "10", "15"

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt to describe content to avoid. Max 500 characters. Default value: `""`
  - Default: `""`
  - Examples: "low resolution, error, worst quality, low quality, defects"

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt rewriting using LLM. Default value: `true`
  - Default: `true`

- **`multi_shots`** (`boolean`, _optional_):
  When true, enables intelligent multi-shot segmentation. Only active when enable_prompt_expansion is True. Set to false for single-shot generation.
  - Default: `false`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`
  - Examples: true



**Required Parameters Example**:

```json
{
  "prompt": "A comedic cinematic demo where typed prompts physically transform reality. Photoreal, strong match cuts, coherent main character, no subtitles.\n\nShot 1 [0-4s] Continue from first frame. The creator presses \"PRINT\". The machine clunks like a spaceship. Creator whispers: \"Okay… I'm pressing enter.\"\nShot 2 [4-8s] Smash cut: the printed paper flies into the air and unfolds into a full desert canyon scene around the desk, like reality is being unrolled. Creator says: \"Wait—my prompt has physics?\"\nShot 3 [8-12s] Hard cut: the paper tears and reveals a tropical jungle behind it, perfectly lit, cinematic sun. Creator laughs: \"This is exactly why we do AI.\"\nShot 4 [12-15s] Hard cut back to studio. The printer prints a final line (not shown clearly). Creator looks to camera: \"Multi-scene. Single prompt.\"",
  "image_url": "https://v3b.fal.media/files/b/0a8673dd/m9EV5W9aSqg8J7rb-18TK.png"
}
```

**Full Example**:

```json
{
  "prompt": "A comedic cinematic demo where typed prompts physically transform reality. Photoreal, strong match cuts, coherent main character, no subtitles.\n\nShot 1 [0-4s] Continue from first frame. The creator presses \"PRINT\". The machine clunks like a spaceship. Creator whispers: \"Okay… I'm pressing enter.\"\nShot 2 [4-8s] Smash cut: the printed paper flies into the air and unfolds into a full desert canyon scene around the desk, like reality is being unrolled. Creator says: \"Wait—my prompt has physics?\"\nShot 3 [8-12s] Hard cut: the paper tears and reveals a tropical jungle behind it, perfectly lit, cinematic sun. Creator laughs: \"This is exactly why we do AI.\"\nShot 4 [12-15s] Hard cut back to studio. The printer prints a final line (not shown clearly). Creator looks to camera: \"Multi-scene. Single prompt.\"",
  "image_url": "https://v3b.fal.media/files/b/0a8673dd/m9EV5W9aSqg8J7rb-18TK.png",
  "resolution": "1080p",
  "duration": "5",
  "negative_prompt": "low resolution, error, worst quality, low quality, defects",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8675cf/bCu9FiFXSjsSnIwOmjUOY_BVs2IFR3.mp4","content_type":"video/mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation
  - Examples: 175932751

- **`actual_prompt`** (`string`, _optional_):
  The actual prompt used if prompt rewriting was enabled
  - Examples: "A comedic cinematic scene where the creator interacts with AI-generated reality transformations."



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8675cf/bCu9FiFXSjsSnIwOmjUOY_BVs2IFR3.mp4",
    "content_type": "video/mp4"
  },
  "seed": 175932751,
  "actual_prompt": "A comedic cinematic scene where the creator interacts with AI-generated reality transformations."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/wan/v2.6/image-to-video/flash \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A comedic cinematic demo where typed prompts physically transform reality. Photoreal, strong match cuts, coherent main character, no subtitles.\n\nShot 1 [0-4s] Continue from first frame. The creator presses \"PRINT\". The machine clunks like a spaceship. Creator whispers: \"Okay… I'm pressing enter.\"\nShot 2 [4-8s] Smash cut: the printed paper flies into the air and unfolds into a full desert canyon scene around the desk, like reality is being unrolled. Creator says: \"Wait—my prompt has physics?\"\nShot 3 [8-12s] Hard cut: the paper tears and reveals a tropical jungle behind it, perfectly lit, cinematic sun. Creator laughs: \"This is exactly why we do AI.\"\nShot 4 [12-15s] Hard cut back to studio. The printer prints a final line (not shown clearly). Creator looks to camera: \"Multi-scene. Single prompt.\"",
     "image_url": "https://v3b.fal.media/files/b/0a8673dd/m9EV5W9aSqg8J7rb-18TK.png"
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
    "wan/v2.6/image-to-video/flash",
    arguments={
        "prompt": "A comedic cinematic demo where typed prompts physically transform reality. Photoreal, strong match cuts, coherent main character, no subtitles.

    Shot 1 [0-4s] Continue from first frame. The creator presses \"PRINT\". The machine clunks like a spaceship. Creator whispers: \"Okay… I'm pressing enter.\"
    Shot 2 [4-8s] Smash cut: the printed paper flies into the air and unfolds into a full desert canyon scene around the desk, like reality is being unrolled. Creator says: \"Wait—my prompt has physics?\"
    Shot 3 [8-12s] Hard cut: the paper tears and reveals a tropical jungle behind it, perfectly lit, cinematic sun. Creator laughs: \"This is exactly why we do AI.\"
    Shot 4 [12-15s] Hard cut back to studio. The printer prints a final line (not shown clearly). Creator looks to camera: \"Multi-scene. Single prompt.\"",
        "image_url": "https://v3b.fal.media/files/b/0a8673dd/m9EV5W9aSqg8J7rb-18TK.png"
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

const result = await fal.subscribe("wan/v2.6/image-to-video/flash", {
  input: {
    prompt: "A comedic cinematic demo where typed prompts physically transform reality. Photoreal, strong match cuts, coherent main character, no subtitles.

  Shot 1 [0-4s] Continue from first frame. The creator presses \"PRINT\". The machine clunks like a spaceship. Creator whispers: \"Okay… I'm pressing enter.\"
  Shot 2 [4-8s] Smash cut: the printed paper flies into the air and unfolds into a full desert canyon scene around the desk, like reality is being unrolled. Creator says: \"Wait—my prompt has physics?\"
  Shot 3 [8-12s] Hard cut: the paper tears and reveals a tropical jungle behind it, perfectly lit, cinematic sun. Creator laughs: \"This is exactly why we do AI.\"
  Shot 4 [12-15s] Hard cut back to studio. The printer prints a final line (not shown clearly). Creator looks to camera: \"Multi-scene. Single prompt.\"",
    image_url: "https://v3b.fal.media/files/b/0a8673dd/m9EV5W9aSqg8J7rb-18TK.png"
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

- [Model Playground](https://fal.ai/models/wan/v2.6/image-to-video/flash)
- [API Documentation](https://fal.ai/models/wan/v2.6/image-to-video/flash/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=wan/v2.6/image-to-video/flash)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

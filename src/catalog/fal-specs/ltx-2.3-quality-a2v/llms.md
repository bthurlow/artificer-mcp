# Ltx 2.3 Quality

> Generate high-quality video with audio from audio, text and images using LTX-2.3


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3-quality/audio-to-video`
- **Model ID**: `fal-ai/ltx-2.3-quality/audio-to-video`
- **Category**: audio-to-video
- **Kind**: inference
**Tags**: audio-to-video



## Pricing

Your request will cost $0.0024075 per megapixel of generated video data (width × height × frames), rounded up. For example, if you generate a video that is 121 frames long at 1280 × 720, your total generated video is ≈112 MP, and your request will cost $0.270.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to guide the audio-driven video generation.
  - Examples: "A person facing the camera sings with expressive natural motion, cinematic portrait lighting, realistic facial performance."

- **`audio_url`** (`string`, _required_):
  The URL of the audio track that drives generation.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-audio.mp3"

- **`image_url`** (`string`, _optional_):
  Optional URL of an image to use as the first frame. When omitted, generation runs from text and audio only.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-image.png"

- **`match_audio_length`** (`boolean`, _optional_):
  When enabled, derives the number of frames from the audio duration and frames_per_second. When disabled, uses num_frames. Default value: `true`
  - Default: `true`

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `121`
  - Default: `121`
  - Range: `9` to `481`

- **`resolution`** (`ImageSize | Enum`, _optional_):
  Final output size. 'auto' matches the input image aspect ratio when image_url is provided; otherwise it uses a landscape fallback. Default value: `auto`
  - Default: `"auto"`
  - One of: ImageSize | Enum

- **`frames_per_second`** (`float`, _optional_):
  Frames per second of the generated video. Default value: `24`
  - Default: `24`
  - Range: `1` to `60`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps. Defaults to 15 and can be increased up to 30. Default value: `15`
  - Default: `15`
  - Range: `8` to `30`

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. The default is tuned for fast, high-quality generation. Default value: `1`
  - Default: `1`
  - Range: `1` to `20`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to include audio in the returned video. When disabled, the final MP4 is returned without an audio track. Default value: `true`
  - Default: `true`

- **`image_strength`** (`float`, _optional_):
  Conditioning strength for the optional first frame. 1.0 keeps the image more strictly; lower values give the model more freedom. Default value: `0.7`
  - Default: `0.7`
  - Range: `0` to `1`

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to steer generation away from. Default value: `"color distortion, overexposure, static, blurry details, subtitles, style, artwork, painting, frame, still, dim overall tone, worst quality, low quality, JPEG compression artifacts, ugly, mutilated, extra fingers, poorly drawn hands, poorly drawn face, deformed, disfigured, malformed limbs, fused fingers, motionless frame, cluttered background, three legs, crowded background, walking backwards"`
  - Default: `"color distortion, overexposure, static, blurry details, subtitles, style, artwork, painting, frame, still, dim overall tone, worst quality, low quality, JPEG compression artifacts, ugly, mutilated, extra fingers, poorly drawn hands, poorly drawn face, deformed, disfigured, malformed limbs, fused fingers, motionless frame, cluttered background, three legs, crowded background, walking backwards"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. Default value: `true`
  - Default: `true`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Default value: `true`
  - Default: `true`

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality preset of the generated video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the generated video. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`

- **`sync_mode`** (`boolean`, _optional_):
  If True, the media is returned as a data URI inline in the response. Useful for short-lived requests and tests.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A person facing the camera sings with expressive natural motion, cinematic portrait lighting, realistic facial performance.",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-audio.mp3"
}
```

**Full Example**:

```json
{
  "prompt": "A person facing the camera sings with expressive natural motion, cinematic portrait lighting, realistic facial performance.",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-audio.mp3",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-image.png",
  "match_audio_length": true,
  "num_frames": 121,
  "resolution": "auto",
  "frames_per_second": 24,
  "num_inference_steps": 15,
  "guidance_scale": 1,
  "generate_audio": true,
  "image_strength": 0.7,
  "negative_prompt": "color distortion, overexposure, static, blurry details, subtitles, style, artwork, painting, frame, still, dim overall tone, worst quality, low quality, JPEG compression artifacts, ugly, mutilated, extra fingers, poorly drawn hands, poorly drawn face, deformed, disfigured, malformed limbs, fused fingers, motionless frame, cluttered background, three legs, crowded background, walking backwards",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "video_quality": "high",
  "video_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.

- **`seed`** (`integer`, _required_):
  The seed actually used for generation.

- **`prompt`** (`string`, _required_):
  The prompt used for generation (after any expansion).



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  },
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2.3-quality/audio-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A person facing the camera sings with expressive natural motion, cinematic portrait lighting, realistic facial performance.",
     "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-audio.mp3"
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
    "fal-ai/ltx-2.3-quality/audio-to-video",
    arguments={
        "prompt": "A person facing the camera sings with expressive natural motion, cinematic portrait lighting, realistic facial performance.",
        "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-audio.mp3"
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

const result = await fal.subscribe("fal-ai/ltx-2.3-quality/audio-to-video", {
  input: {
    prompt: "A person facing the camera sings with expressive natural motion, cinematic portrait lighting, realistic facial performance.",
    audio_url: "https://storage.googleapis.com/falserverless/example_inputs/ltx-2-a2v-input-audio.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3-quality/audio-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3-quality/audio-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3-quality/audio-to-video)

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

# LTX-2 19B Distilled

> Generate video with audio from images using LTX-2 Distilled


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2-19b/distilled/image-to-video`
- **Model ID**: `fal-ai/ltx-2-19b/distilled/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost $0.0008 per megapixel of generated video data (width × height × frames), rounded up. For example, if you generate a video that is 121 frames long at 1280 × 720, your total generated video is ≈112 MP, and your request will cost $0.0896.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt used for the generation.
  - Examples: "A woman stands still amid a busy neon-lit street at night. The camera slowly dollies in toward her face as people blur past, their motion emphasizing her calm presence. City lights flicker and reflections shift across her denim jacket."

- **`image_url`** (`string`, _required_):
  The URL of the image to generate the video from.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/ltxv-2-i2v-input.jpg"

- **`end_image_url`** (`string`, _optional_):
  The URL of the image to use as the end of the video.

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `121`
  - Default: `121`
  - Range: `9` to `481`

- **`video_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated video. Default value: `auto`
  - Default: `"auto"`
  - One of: ImageSize | Enum

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the video. Default value: `true`
  - Default: `true`

- **`use_multiscale`** (`boolean`, _optional_):
  Whether to use multi-scale generation. If True, the model will generate the video at a smaller scale first, then use the smaller video to guide the generation of a video at or above your requested size. This results in better coherence and details. Default value: `true`
  - Default: `true`

- **`fps`** (`float`, _optional_):
  The frames per second of the generated video. Default value: `25`
  - Default: `25`
  - Range: `1` to `60`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use. Default value: `"none"`
  - Default: `"none"`
  - Options: `"none"`, `"regular"`, `"high"`, `"full"`
  - Examples: "none"

- **`camera_lora`** (`CameraLoRAEnum`, _optional_):
  The camera LoRA to use. This allows you to control the camera movement of the generated video more accurately than just prompting the model to move the camera. Default value: `"none"`
  - Default: `"none"`
  - Options: `"dolly_in"`, `"dolly_out"`, `"dolly_left"`, `"dolly_right"`, `"jib_up"`, `"jib_down"`, `"static"`, `"none"`
  - Examples: "none"

- **`camera_lora_scale`** (`float`, _optional_):
  The scale of the camera LoRA to use. This allows you to control the camera movement of the generated video more accurately than just prompting the model to move the camera. Default value: `1`
  - Default: `1`
  - Range: `0` to `1`

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to generate the video from. Default value: `"blurry, out of focus, overexposed, underexposed, low contrast, washed out colors, excessive noise, grainy texture, poor lighting, flickering, motion blur, distorted proportions, unnatural skin tones, deformed facial features, asymmetrical face, missing facial features, extra limbs, disfigured hands, wrong hand count, artifacts around text, inconsistent perspective, camera shake, incorrect depth of field, background too sharp, background clutter, distracting reflections, harsh shadows, inconsistent lighting direction, color banding, cartoonish rendering, 3D CGI look, unrealistic materials, uncanny valley effect, incorrect ethnicity, wrong gender, exaggerated expressions, wrong gaze direction, mismatched lip sync, silent or muted audio, distorted voice, robotic voice, echo, background noise, off-sync audio,incorrect dialogue, added dialogue, repetitive speech, jittery movement, awkward pauses, incorrect timing, unnatural transitions, inconsistent framing, tilted camera, flat lighting, inconsistent tone, cinematic oversaturation, stylized filters, or AI artifacts."`
  - Default: `"blurry, out of focus, overexposed, underexposed, low contrast, washed out colors, excessive noise, grainy texture, poor lighting, flickering, motion blur, distorted proportions, unnatural skin tones, deformed facial features, asymmetrical face, missing facial features, extra limbs, disfigured hands, wrong hand count, artifacts around text, inconsistent perspective, camera shake, incorrect depth of field, background too sharp, background clutter, distracting reflections, harsh shadows, inconsistent lighting direction, color banding, cartoonish rendering, 3D CGI look, unrealistic materials, uncanny valley effect, incorrect ethnicity, wrong gender, exaggerated expressions, wrong gaze direction, mismatched lip sync, silent or muted audio, distorted voice, robotic voice, echo, background noise, off-sync audio,incorrect dialogue, added dialogue, repetitive speech, jittery movement, awkward pauses, incorrect timing, unnatural transitions, inconsistent framing, tilted camera, flat lighting, inconsistent tone, cinematic oversaturation, stylized filters, or AI artifacts."`

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. Default value: `true`
  - Default: `true`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Default value: `true`
  - Default: `true`

- **`video_output_type`** (`VideoOutputTypeEnum`, _optional_):
  The output type of the generated video. Default value: `"X264 (.mp4)"`
  - Default: `"X264 (.mp4)"`
  - Options: `"X264 (.mp4)"`, `"VP9 (.webm)"`, `"PRORES4444 (.mov)"`, `"GIF (.gif)"`

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality of the generated video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the generated video. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`interpolation_direction`** (`InterpolationDirectionEnum`, _optional_):
  The direction to interpolate the image sequence in. 'Forward' goes from the start image to the end image, 'Backward' goes from the end image to the start image. Default value: `"forward"`
  - Default: `"forward"`
  - Options: `"forward"`, `"backward"`

- **`image_strength`** (`float`, _optional_):
  The strength of the image to use for the video generation. Default value: `1`
  - Default: `1`
  - Range: `0` to `1`

- **`end_image_strength`** (`float`, _optional_):
  The strength of the end image to use for the video generation. Default value: `1`
  - Default: `1`
  - Range: `0` to `1`



**Required Parameters Example**:

```json
{
  "prompt": "A woman stands still amid a busy neon-lit street at night. The camera slowly dollies in toward her face as people blur past, their motion emphasizing her calm presence. City lights flicker and reflections shift across her denim jacket.",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ltxv-2-i2v-input.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "A woman stands still amid a busy neon-lit street at night. The camera slowly dollies in toward her face as people blur past, their motion emphasizing her calm presence. City lights flicker and reflections shift across her denim jacket.",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ltxv-2-i2v-input.jpg",
  "num_frames": 121,
  "video_size": "auto",
  "generate_audio": true,
  "use_multiscale": true,
  "fps": 25,
  "acceleration": "none",
  "camera_lora": "none",
  "camera_lora_scale": 1,
  "negative_prompt": "blurry, out of focus, overexposed, underexposed, low contrast, washed out colors, excessive noise, grainy texture, poor lighting, flickering, motion blur, distorted proportions, unnatural skin tones, deformed facial features, asymmetrical face, missing facial features, extra limbs, disfigured hands, wrong hand count, artifacts around text, inconsistent perspective, camera shake, incorrect depth of field, background too sharp, background clutter, distracting reflections, harsh shadows, inconsistent lighting direction, color banding, cartoonish rendering, 3D CGI look, unrealistic materials, uncanny valley effect, incorrect ethnicity, wrong gender, exaggerated expressions, wrong gaze direction, mismatched lip sync, silent or muted audio, distorted voice, robotic voice, echo, background noise, off-sync audio,incorrect dialogue, added dialogue, repetitive speech, jittery movement, awkward pauses, incorrect timing, unnatural transitions, inconsistent framing, tilted camera, flat lighting, inconsistent tone, cinematic oversaturation, stylized filters, or AI artifacts.",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "video_output_type": "X264 (.mp4)",
  "video_quality": "high",
  "video_write_mode": "balanced",
  "interpolation_direction": "forward",
  "image_strength": 1,
  "end_image_strength": 1
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video.
  - Examples: {"fps":25,"height":704,"content_type":"video/mp4","duration":10.28,"width":1248,"num_frames":257,"url":"https://v3b.fal.media/files/b/0a88289e/CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4","file_name":"CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for the random number generator.
  - Examples: 866232447

- **`prompt`** (`string`, _required_):
  The prompt used for the generation.
  - Examples: "Continue the scene naturally, maintaining the same style and motion."



**Example Response**:

```json
{
  "video": {
    "fps": 25,
    "height": 704,
    "content_type": "video/mp4",
    "duration": 10.28,
    "width": 1248,
    "num_frames": 257,
    "url": "https://v3b.fal.media/files/b/0a88289e/CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4",
    "file_name": "CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4"
  },
  "seed": 866232447,
  "prompt": "Continue the scene naturally, maintaining the same style and motion."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2-19b/distilled/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A woman stands still amid a busy neon-lit street at night. The camera slowly dollies in toward her face as people blur past, their motion emphasizing her calm presence. City lights flicker and reflections shift across her denim jacket.",
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ltxv-2-i2v-input.jpg"
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
    "fal-ai/ltx-2-19b/distilled/image-to-video",
    arguments={
        "prompt": "A woman stands still amid a busy neon-lit street at night. The camera slowly dollies in toward her face as people blur past, their motion emphasizing her calm presence. City lights flicker and reflections shift across her denim jacket.",
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ltxv-2-i2v-input.jpg"
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

const result = await fal.subscribe("fal-ai/ltx-2-19b/distilled/image-to-video", {
  input: {
    prompt: "A woman stands still amid a busy neon-lit street at night. The camera slowly dollies in toward her face as people blur past, their motion emphasizing her calm presence. City lights flicker and reflections shift across her denim jacket.",
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/ltxv-2-i2v-input.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2-19b/distilled/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2-19b/distilled/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2-19b/distilled/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# LTX-2.3 22B Distilled

> Generate video with audio from images using LTX-2.3 Distilled


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3-22b/distilled/image-to-video`
- **Model ID**: `fal-ai/ltx-2.3-22b/distilled/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost $0.001205 per megapixel of generated video data (width × height × frames), rounded up. For example, if you generate a video that is 121 frames long at 1280 × 720, your total generated video is ≈112 MP, and your request will cost $0.1344.

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
  The frames per second of the generated video. Default value: `24`
  - Default: `24`
  - Range: `1` to `60`

- **`scheduler`** (`SchedulerEnum`, _optional_):
  The scheduler to use. Default value: `"ltx2"`
  - Default: `"ltx2"`
  - Options: `"ltx2"`, `"linear_quadratic"`, `"beta"`
  - Examples: "ltx2"

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
  The negative prompt to generate the video from. Default value: `"news broadcast, 3d animation, computer graphics, pc game, console game, video game, cartoon, childish, watermark, logo, text, on screen text, subtitles, titles, signature, slowmo, static"`
  - Default: `"news broadcast, 3d animation, computer graphics, pc game, console game, video game, cartoon, childish, watermark, logo, text, on screen text, subtitles, titles, signature, slowmo, static"`

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

- **`distill_lora_second_pass_scale`** (`float`, _optional_):
  The scale of the distill LoRA to use for the second and subsequent passes. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`

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
  "fps": 24,
  "scheduler": "ltx2",
  "acceleration": "none",
  "camera_lora": "none",
  "camera_lora_scale": 1,
  "negative_prompt": "news broadcast, 3d animation, computer graphics, pc game, console game, video game, cartoon, childish, watermark, logo, text, on screen text, subtitles, titles, signature, slowmo, static",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "video_output_type": "X264 (.mp4)",
  "video_quality": "high",
  "video_write_mode": "balanced",
  "distill_lora_second_pass_scale": 0.5,
  "interpolation_direction": "forward",
  "image_strength": 1,
  "end_image_strength": 1
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video.
  - Examples: {"duration":10.28,"file_name":"CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4","fps":25,"content_type":"video/mp4","height":704,"url":"https://v3b.fal.media/files/b/0a88289e/CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4","num_frames":257,"width":1248}

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
    "duration": 10.28,
    "file_name": "CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4",
    "fps": 25,
    "content_type": "video/mp4",
    "height": 704,
    "url": "https://v3b.fal.media/files/b/0a88289e/CJcQGDrxOSRg2YFl5GNDt_glXPMoji.mp4",
    "num_frames": 257,
    "width": 1248
  },
  "seed": 866232447,
  "prompt": "Continue the scene naturally, maintaining the same style and motion."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2.3-22b/distilled/image-to-video \
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
    "fal-ai/ltx-2.3-22b/distilled/image-to-video",
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

const result = await fal.subscribe("fal-ai/ltx-2.3-22b/distilled/image-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3-22b/distilled/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3-22b/distilled/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3-22b/distilled/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

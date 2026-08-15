# LTX-2.3 22B

> Generate video with audio from text using LTX-2.3


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3-22b/text-to-video`
- **Model ID**: `fal-ai/ltx-2.3-22b/text-to-video`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

Your request will cost $0.001605 per megapixel of generated video data (width × height × frames), rounded up. For example, if you generate a video that is 121 frames long at 1280 × 720, your total generated video is ≈112 MP, and your request will cost $0.179.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain."

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `121`
  - Default: `121`
  - Range: `9` to `481`

- **`video_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated video. Default value: `landscape_16_9`
  - Default: `"landscape_16_9"`
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

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to use. Default value: `40`
  - Default: `40`
  - Range: `8` to `50`

- **`video_cfg_scale`** (`float`, _optional_):
  The Classifier-Free Guidance (CFG) scale for the video. Higher values result in more consistent and focused video content. Default value: `3`
  - Default: `3`
  - Range: `1` to `20`

- **`video_stg_scale`** (`float`, _optional_):
  The Spatiotemporal Guidance (STG) scale for the video. Higher values result in more consistent and focused video content.
  - Default: `0`
  - Range: `0` to `20`

- **`video_rescaling_scale`** (`float`, _optional_):
  The rescaling scale for the video. Controls the ratio between classifier-free guidance and spatiotemporal guidance. Default value: `0.7`
  - Default: `0.7`
  - Range: `0` to `1`

- **`video_modality_scale`** (`float`, _optional_):
  The modality scale for the video. Controls the ratio between video and audio modalities. Default value: `3`
  - Default: `3`
  - Range: `0` to `10`

- **`audio_cfg_scale`** (`float`, _optional_):
  The Classifier-Free Guidance (CFG) scale for the audio. Higher values result in more consistent and focused audio content. Default value: `7`
  - Default: `7`
  - Range: `1` to `20`

- **`audio_stg_scale`** (`float`, _optional_):
  The Spatiotemporal Guidance (STG) scale for the audio. Higher values result in more consistent and focused audio content.
  - Default: `0`
  - Range: `0` to `20`

- **`audio_rescaling_scale`** (`float`, _optional_):
  The rescaling scale for the audio. Controls the ratio between classifier-free guidance and spatiotemporal guidance. Default value: `0.7`
  - Default: `0.7`
  - Range: `0` to `1`

- **`audio_modality_scale`** (`float`, _optional_):
  The modality scale for the audio. Controls the ratio between video and audio modalities. Default value: `3`
  - Default: `3`
  - Range: `0` to `10`

- **`gradient_estimation_gamma`** (`float`, _optional_):
  The gamma of gradient estimation during denoising. Set to 0 to disable. Default value: `2`
  - Default: `2`
  - Range: `0` to `10`

- **`use_restart_sampling`** (`boolean`, _optional_):
  Whether to use restart sampling. This will inject a small amount of noise during each denoising step, which can help improve the quality of the generated video.
  - Default: `false`

- **`scheduler`** (`SchedulerEnum`, _optional_):
  The scheduler to use. Default value: `"ltx2"`
  - Default: `"ltx2"`
  - Options: `"ltx2"`, `"linear_quadratic"`, `"beta"`
  - Examples: "ltx2"

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`, `"high"`, `"full"`
  - Examples: "regular"

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

- **`distill_lora_first_pass_scale`** (`float`, _optional_):
  The scale of the distill LoRA to use for the first pass. Set to 0 to disable. Default value: `0.2`
  - Default: `0.2`
  - Range: `0` to `1`

- **`distill_lora_second_pass_scale`** (`float`, _optional_):
  The scale of the distill LoRA to use for the second and subsequent passes. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`



**Required Parameters Example**:

```json
{
  "prompt": "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain."
}
```

**Full Example**:

```json
{
  "prompt": "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain.",
  "num_frames": 121,
  "video_size": "landscape_16_9",
  "generate_audio": true,
  "use_multiscale": true,
  "fps": 24,
  "num_inference_steps": 40,
  "video_cfg_scale": 3,
  "video_rescaling_scale": 0.7,
  "video_modality_scale": 3,
  "audio_cfg_scale": 7,
  "audio_rescaling_scale": 0.7,
  "audio_modality_scale": 3,
  "gradient_estimation_gamma": 2,
  "scheduler": "ltx2",
  "acceleration": "regular",
  "camera_lora": "none",
  "camera_lora_scale": 1,
  "negative_prompt": "news broadcast, 3d animation, computer graphics, pc game, console game, video game, cartoon, childish, watermark, logo, text, on screen text, subtitles, titles, signature, slowmo, static",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "video_output_type": "X264 (.mp4)",
  "video_quality": "high",
  "video_write_mode": "balanced",
  "distill_lora_first_pass_scale": 0.2,
  "distill_lora_second_pass_scale": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video.
  - Examples: {"duration":6.44,"file_name":"sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4","fps":25,"content_type":"video/mp4","height":704,"url":"https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4","num_frames":161,"width":1248}

- **`seed`** (`integer`, _required_):
  The seed used for the random number generator.
  - Examples: 149063119

- **`prompt`** (`string`, _required_):
  The prompt used for the generation.
  - Examples: "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain."



**Example Response**:

```json
{
  "video": {
    "duration": 6.44,
    "file_name": "sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4",
    "fps": 25,
    "content_type": "video/mp4",
    "height": 704,
    "url": "https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4",
    "num_frames": 161,
    "width": 1248
  },
  "seed": 149063119,
  "prompt": "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2.3-22b/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain."
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
    "fal-ai/ltx-2.3-22b/text-to-video",
    arguments={
        "prompt": "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain."
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

const result = await fal.subscribe("fal-ai/ltx-2.3-22b/text-to-video", {
  input: {
    prompt: "A cowboy walking through a dusty town at high noon, camera following from behind, cinematic depth, realistic lighting, western mood, 4K film grain."
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3-22b/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3-22b/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3-22b/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

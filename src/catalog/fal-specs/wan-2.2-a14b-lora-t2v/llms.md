# Wan-2.2 Text-to-Video A14B with LoRAs

> Wan-2.2 text-to-video is a video model that generates high-quality videos with high visual quality and motion diversity from text prompts. This endpoint supports LoRAs made for Wan 2.2.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan/v2.2-a14b/text-to-video/lora`
- **Model ID**: `fal-ai/wan/v2.2-a14b/text-to-video/lora`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

- **Price**: $0.1 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere."

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `""`
  - Default: `""`

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 17 to 161 (inclusive). Default value: `81`
  - Default: `81`
  - Range: `17` to `161`
  - Examples: 81

- **`frames_per_second`** (`integer`, _optional_):
  Frames per second of the generated video. Must be between 4 to 60. When using interpolation and `adjust_fps_for_interpolation` is set to true (default true,) the final FPS will be multiplied by the number of interpolated frames plus one. For example, if the generated frames per second is 16 and the number of interpolated frames is 1, the final frames per second will be 32. If `adjust_fps_for_interpolation` is set to false, this value will be used as-is. Default value: `16`
  - Default: `16`
  - Range: `4` to `60`
  - Examples: 16

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p, 580p, or 720p). Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"580p"`, `"720p"`
  - Examples: "720p"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video (16:9 or 9:16). Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`
  - Examples: "16:9", "9:16", "1:1"

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps for sampling. Higher values give better quality but take longer. Default value: `27`
  - Default: `27`
  - Range: `2` to `40`
  - Examples: 27

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, input data will be checked for safety before processing.
  - Default: `false`
  - Examples: true

- **`enable_output_safety_checker`** (`boolean`, _optional_):
  If set to true, output video will be checked for safety after generation.
  - Default: `false`
  - Examples: false

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. This will use a large language model to expand the prompt with additional details while maintaining the original meaning.
  - Default: `false`
  - Examples: false

- **`acceleration`** (`AccelerationEnum`, _optional_):
  Acceleration level to use. The more acceleration, the faster the generation, but with lower quality. The recommended value is 'regular'. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`
  - Examples: "regular"

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. Higher values give better adherence to the prompt but may decrease quality. Default value: `3.5`
  - Default: `3.5`
  - Range: `1` to `10`
  - Examples: 3.5

- **`guidance_scale_2`** (`float`, _optional_):
  Guidance scale for the second stage of the model. This is used to control the adherence to the prompt in the second stage of the model. Default value: `4`
  - Default: `4`
  - Range: `1` to `10`
  - Examples: 4

- **`shift`** (`float`, _optional_):
  Shift value for the video. Must be between 1.0 and 10.0. Default value: `5`
  - Default: `5`
  - Range: `1` to `10`
  - Examples: 5

- **`interpolator_model`** (`InterpolatorModelEnum`, _optional_):
  The model to use for frame interpolation. If None, no interpolation is applied. Default value: `"film"`
  - Default: `"film"`
  - Options: `"none"`, `"film"`, `"rife"`
  - Examples: "film"

- **`num_interpolated_frames`** (`integer`, _optional_):
  Number of frames to interpolate between each pair of generated frames. Must be between 0 and 4. Default value: `1`
  - Default: `1`
  - Range: `0` to `4`
  - Examples: 1

- **`adjust_fps_for_interpolation`** (`boolean`, _optional_):
  If true, the number of frames per second will be multiplied by the number of interpolated frames plus one. For example, if the generated frames per second is 16 and the number of interpolated frames is 1, the final frames per second will be 32. If false, the passed frames per second will be used as-is. Default value: `true`
  - Default: `true`
  - Examples: true

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality of the output video. Higher quality means better visual quality but larger file size. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`
  - Examples: "high"

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the output video. Faster write mode means faster results but larger file size, balanced write mode is a good compromise between speed and quality, and small write mode is the slowest but produces the smallest file size. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`
  - Examples: "balanced"

- **`loras`** (`list<LoRAWeight>`, _optional_):
  LoRA weights to be used in the inference.
  - Default: `[]`
  - Array of LoRAWeight

- **`reverse_video`** (`boolean`, _optional_):
  If true, the video will be reversed.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere."
}
```

**Full Example**:

```json
{
  "prompt": "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere.",
  "num_frames": 81,
  "frames_per_second": 16,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "num_inference_steps": 27,
  "enable_safety_checker": true,
  "enable_output_safety_checker": false,
  "enable_prompt_expansion": false,
  "acceleration": "regular",
  "guidance_scale": 3.5,
  "guidance_scale_2": 4,
  "shift": 5,
  "interpolator_model": "film",
  "num_interpolated_frames": 1,
  "adjust_fps_for_interpolation": true,
  "video_quality": "high",
  "video_write_mode": "balanced",
  "loras": []
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/model_tests/wan/v2.2-woman-output.mp4"}

- **`prompt`** (`string`, _optional_):
  The text prompt used for video generation. Default value: `""`
  - Default: `""`
  - Examples: "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere."

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/model_tests/wan/v2.2-woman-output.mp4"
  },
  "prompt": "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan/v2.2-a14b/text-to-video/lora \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere."
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
    "fal-ai/wan/v2.2-a14b/text-to-video/lora",
    arguments={
        "prompt": "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere."
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

const result = await fal.subscribe("fal-ai/wan/v2.2-a14b/text-to-video/lora", {
  input: {
    prompt: "A close-up of a young woman smiling gently in the rain, raindrops glistening on her face and eyelashes. The video captures the delicate details of her expression and the water droplets, with soft light reflecting off her skin in the rainy atmosphere."
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

- [Model Playground](https://fal.ai/models/fal-ai/wan/v2.2-a14b/text-to-video/lora)
- [API Documentation](https://fal.ai/models/fal-ai/wan/v2.2-a14b/text-to-video/lora/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan/v2.2-a14b/text-to-video/lora)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

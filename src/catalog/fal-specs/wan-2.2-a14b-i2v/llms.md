# Wan v2.2 A14B

> fal-ai/wan/v2.2-A14B/image-to-video


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan/v2.2-a14B/image-to-video`
- **Model ID**: `fal-ai/wan/v2.2-a14b/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.08** per **video second** for **720p**, **$0.06** per **video second** for **580p**, **$0.04** per **video second** for **480p**. Video seconds are calculated at 16 frames per second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg"

- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."

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

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `""`
  - Default: `""`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p, 580p, or 720p). Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"580p"`, `"720p"`
  - Examples: "720p"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"9:16"`, `"1:1"`

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
  Guidance scale for the second stage of the model. This is used to control the adherence to the prompt in the second stage of the model. Default value: `3.5`
  - Default: `3.5`
  - Range: `1` to `10`
  - Examples: 3.5

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

- **`end_image_url`** (`string`, _optional_):
  URL of the end image.



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
  "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."
}
```

**Full Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
  "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
  "num_frames": 81,
  "frames_per_second": 16,
  "resolution": "720p",
  "aspect_ratio": "auto",
  "num_inference_steps": 27,
  "enable_safety_checker": true,
  "enable_output_safety_checker": false,
  "enable_prompt_expansion": false,
  "acceleration": "regular",
  "guidance_scale": 3.5,
  "guidance_scale_2": 3.5,
  "shift": 5,
  "interpolator_model": "film",
  "num_interpolated_frames": 1,
  "adjust_fps_for_interpolation": true,
  "video_quality": "high",
  "video_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://v3.fal.media/files/lion/Fbuh3lO_HMT-pS0DATbio_tmp08c3v477.mp4"}

- **`prompt`** (`string`, _optional_):
  The text prompt used for video generation. Default value: `""`
  - Default: `""`
  - Examples: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/lion/Fbuh3lO_HMT-pS0DATbio_tmp08c3v477.mp4"
  },
  "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan/v2.2-a14b/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
     "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."
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
    "fal-ai/wan/v2.2-a14b/image-to-video",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
        "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."
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

const result = await fal.subscribe("fal-ai/wan/v2.2-a14b/image-to-video", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
    prompt: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."
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

- [Model Playground](https://fal.ai/models/fal-ai/wan/v2.2-a14b/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/wan/v2.2-a14b/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan/v2.2-a14b/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Wan-2.2 Speech-to-Video 14B

> Wan-S2V is a video model that generates high-quality videos from static images and audio, with realistic facial expressions, body movements, and professional camera work for film and television applications


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan/v2.2-14b/speech-to-video`
- **Model ID**: `fal-ai/wan/v2.2-14b/speech-to-video`
- **Category**: audio-to-video
- **Kind**: inference
**Tags**: audio-to-video, talking-head



## Pricing

Your request will cost **$0.20** per **video second** for **720p**, **$0.15** per **video second** for **580p**, **$0.10** per **video second** for **480p**. Video seconds are calculated at 16 frames per second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used for video generation.
  - Examples: "Summer beach vacation style, a white cat wearing sunglasses sits on a surfboard."

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `""`
  - Default: `""`

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 40 to 120, (must be multiple of 4). Default value: `80`
  - Default: `80`
  - Range: `40` to `120`, step: `4`
  - Examples: 80

- **`frames_per_second`** (`integer`, _optional_):
  Frames per second of the generated video. Must be between 4 to 60. When using interpolation and `adjust_fps_for_interpolation` is set to true (default true,) the final FPS will be multiplied by the number of interpolated frames plus one. For example, if the generated frames per second is 16 and the number of interpolated frames is 1, the final frames per second will be 32. If `adjust_fps_for_interpolation` is set to false, this value will be used as-is. Default value: `16`
  - Default: `16`
  - Range: `4` to `60`
  - Examples: 16

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p, 580p, or 720p). Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"580p"`, `"720p"`
  - Examples: "480p"

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps for sampling. Higher values give better quality but take longer. Default value: `27`
  - Default: `27`
  - Range: `2` to `40`
  - Examples: 27

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, input data will be checked for safety before processing. Disabling it requires account authorization; unauthorized requests are always checked.
  - Default: `false`
  - Examples: true

- **`enable_output_safety_checker`** (`boolean`, _optional_):
  If set to true, output video will be checked for safety after generation.
  - Default: `false`
  - Examples: false

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. Higher values give better adherence to the prompt but may decrease quality. Default value: `3.5`
  - Default: `3.5`
  - Range: `1` to `10`
  - Examples: 3.5

- **`shift`** (`float`, _optional_):
  Shift value for the video. Must be between 1.0 and 10.0. Default value: `5`
  - Default: `5`
  - Range: `1` to `10`
  - Examples: 5

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

- **`image_url`** (`string`, _required_):
  URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_cat.png"

- **`audio_url`** (`string`, _required_):
  The URL of the audio file.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_talk.wav"



**Required Parameters Example**:

```json
{
  "prompt": "Summer beach vacation style, a white cat wearing sunglasses sits on a surfboard.",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_cat.png",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_talk.wav"
}
```

**Full Example**:

```json
{
  "prompt": "Summer beach vacation style, a white cat wearing sunglasses sits on a surfboard.",
  "num_frames": 80,
  "frames_per_second": 16,
  "resolution": "480p",
  "num_inference_steps": 27,
  "enable_safety_checker": true,
  "enable_output_safety_checker": false,
  "guidance_scale": 3.5,
  "shift": 5,
  "video_quality": "high",
  "video_write_mode": "balanced",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_cat.png",
  "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_talk.wav"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"file_size":4685303,"file_name":"2c7ab2540af44eceaf5ffde4e8d094ed.mp4","content_type":"application/octet-stream","url":"https://v3.fal.media/files/panda/f7tXRCjvwEcVlmxHuw8kO_2c7ab2540af44eceaf5ffde4e8d094ed.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_size": 4685303,
    "file_name": "2c7ab2540af44eceaf5ffde4e8d094ed.mp4",
    "content_type": "application/octet-stream",
    "url": "https://v3.fal.media/files/panda/f7tXRCjvwEcVlmxHuw8kO_2c7ab2540af44eceaf5ffde4e8d094ed.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan/v2.2-14b/speech-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Summer beach vacation style, a white cat wearing sunglasses sits on a surfboard.",
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_cat.png",
     "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_talk.wav"
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
    "fal-ai/wan/v2.2-14b/speech-to-video",
    arguments={
        "prompt": "Summer beach vacation style, a white cat wearing sunglasses sits on a surfboard.",
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_cat.png",
        "audio_url": "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_talk.wav"
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

const result = await fal.subscribe("fal-ai/wan/v2.2-14b/speech-to-video", {
  input: {
    prompt: "Summer beach vacation style, a white cat wearing sunglasses sits on a surfboard.",
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_cat.png",
    audio_url: "https://storage.googleapis.com/falserverless/example_inputs/wan_s2v_talk.wav"
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

- [Model Playground](https://fal.ai/models/fal-ai/wan/v2.2-14b/speech-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/wan/v2.2-14b/speech-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan/v2.2-14b/speech-to-video)

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

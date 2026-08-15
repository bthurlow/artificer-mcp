# LTX Video-0.9.7 LoRA

> Generate videos from prompts and images using LTX Video-0.9.7 and custom LoRA


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-video-lora/image-to-video`
- **Model ID**: `fal-ai/ltx-video-lora/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: video, ltx-video, image-to-video



## Pricing

Your request will cost **$0.20** per video. For $1 you can run this model approximately **5 times**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "The astronaut gets up and walks away"

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to use. Default value: `"blurry, low quality, low resolution, inconsistent motion, jittery, distorted"`
  - Default: `"blurry, low quality, low resolution, inconsistent motion, jittery, distorted"`

- **`loras`** (`list<LoRAWeight>`, _optional_):
  The LoRA weights to use for generation.
  - Default: `[]`
  - Array of LoRAWeight

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the video. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`
  - Examples: "720p"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the video. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"16:9"`, `"1:1"`, `"9:16"`, `"auto"`
  - Examples: "auto"

- **`number_of_frames`** (`integer`, _optional_):
  The number of frames in the video. Default value: `89`
  - Default: `89`
  - Range: `9` to `161`
  - Examples: 89

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to use. Default value: `30`
  - Default: `30`
  - Range: `1` to `50`
  - Examples: 30

- **`frames_per_second`** (`integer`, _optional_):
  The frame rate of the video. Default value: `25`
  - Default: `25`
  - Range: `1` to `60`
  - Examples: 25

- **`seed`** (`integer`, _optional_):
  The seed to use for generation.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to expand the prompt using the LLM.
  - Default: `false`
  - Examples: false

- **`reverse_video`** (`boolean`, _optional_):
  Whether to reverse the video.
  - Default: `false`
  - Examples: false

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Default value: `true`
  - Default: `true`
  - Examples: true

- **`image_url`** (`string`, _required_):
  The URL of the image to use as input.
  - Examples: "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"



**Required Parameters Example**:

```json
{
  "prompt": "The astronaut gets up and walks away",
  "image_url": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "The astronaut gets up and walks away",
  "negative_prompt": "blurry, low quality, low resolution, inconsistent motion, jittery, distorted",
  "loras": [],
  "resolution": "720p",
  "aspect_ratio": "auto",
  "number_of_frames": 89,
  "num_inference_steps": 30,
  "frames_per_second": 25,
  "enable_prompt_expansion": false,
  "reverse_video": false,
  "enable_safety_checker": true,
  "image_url": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"
}
```


### Output Schema

The API returns the following output format:

- **`prompt`** (`string`, _required_):
  The prompt used for generation.
  - Examples: "The astronaut gets up and walks away"

- **`seed`** (`integer`, _required_):
  The seed used for generation.

- **`video`** (`File`, _required_):
  The generated video.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/ltx_i2v_output.mp4"}



**Example Response**:

```json
{
  "prompt": "The astronaut gets up and walks away",
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/ltx_i2v_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-video-lora/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "The astronaut gets up and walks away",
     "image_url": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"
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
    "fal-ai/ltx-video-lora/image-to-video",
    arguments={
        "prompt": "The astronaut gets up and walks away",
        "image_url": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"
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

const result = await fal.subscribe("fal-ai/ltx-video-lora/image-to-video", {
  input: {
    prompt: "The astronaut gets up and walks away",
    image_url: "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-video-lora/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-video-lora/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-video-lora/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

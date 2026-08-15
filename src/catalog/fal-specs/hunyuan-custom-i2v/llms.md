# Hunyuan Custom

> HunyuanCustom revolutionizes video generation with unmatched identity consistency across multiple input types. Its innovative fusion modules and alignment networks outperform competitors, maintaining subject integrity while responding flexibly to text, image, audio, and video conditions.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/hunyuan-custom`
- **Model ID**: `fal-ai/hunyuan-custom`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: image-to-video



## Pricing

 For a video generation, your request will cost $0.8 at 512p resolution and 2.4$ at 720p resolution. 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation (max 500 characters).
  - Examples: "Realistic, High-quality. A woman is playing a violin."

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `"Aerial view, aerial view, overexposed, low quality, deformation, a poor composition, bad hands, bad teeth, bad eyes, bad limbs, distortion, blurring, text, subtitles, static, picture, black border."`
  - Default: `"Aerial view, aerial view, overexposed, low quality, deformation, a poor composition, bad hands, bad teeth, bad eyes, bad limbs, distortion, blurring, text, subtitles, static, picture, black border."`
  - Examples: "Ugly, blurry."

- **`image_url`** (`string`, _required_):
  URL of the image input.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png"

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to run. Lower gets faster results, higher gets better results. Default value: `30`
  - Default: `30`
  - Range: `10` to `30`

- **`seed`** (`integer`, _optional_):
  The seed to use for generating the video.

- **`aspect_ratio`** (`AspectRatio(W:H)Enum`, _optional_):
  The aspect ratio of the video to generate. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the video to generate. 720p generations cost 1.5x more than 480p generations. Default value: `"512p"`
  - Default: `"512p"`
  - Options: `"512p"`, `"720p"`

- **`fps`** (`integer`, _optional_):
  The frames per second of the generated video. Default value: `25`
  - Default: `25`
  - Range: `16` to `30`

- **`cfg_scale`** (`float`, _optional_):
  Classifier-Free Guidance scale for the generation. Default value: `7.5`
  - Default: `7.5`
  - Range: `1.5` to `13`

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `129`
  - Default: `129`
  - Range: `81` to `129`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. Default value: `true`
  - Default: `true`
  - Examples: true

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`
  - Examples: true



**Required Parameters Example**:

```json
{
  "prompt": "Realistic, High-quality. A woman is playing a violin.",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png"
}
```

**Full Example**:

```json
{
  "prompt": "Realistic, High-quality. A woman is playing a violin.",
  "negative_prompt": "Ugly, blurry.",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png",
  "num_inference_steps": 30,
  "aspect_ratio": "16:9",
  "resolution": "512p",
  "fps": 25,
  "cfg_scale": 7.5,
  "num_frames": 129,
  "enable_prompt_expansion": true,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_)
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/test/p1/uQ4ddGyJ9U6cymnns0l6o_input-image-1747117169.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generating the video.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/test/p1/uQ4ddGyJ9U6cymnns0l6o_input-image-1747117169.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/hunyuan-custom \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Realistic, High-quality. A woman is playing a violin.",
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png"
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
    "fal-ai/hunyuan-custom",
    arguments={
        "prompt": "Realistic, High-quality. A woman is playing a violin.",
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png"
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

const result = await fal.subscribe("fal-ai/hunyuan-custom", {
  input: {
    prompt: "Realistic, High-quality. A woman is playing a violin.",
    image_url: "https://storage.googleapis.com/falserverless/model_tests/hidream/woman.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/hunyuan-custom)
- [API Documentation](https://fal.ai/models/fal-ai/hunyuan-custom/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/hunyuan-custom)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

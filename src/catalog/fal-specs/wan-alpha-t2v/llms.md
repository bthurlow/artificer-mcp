# Wan Alpha

> Generate videos with transparent backgrounds


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan-alpha`
- **Model ID**: `fal-ai/wan-alpha`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: transparent, alpha



## Pricing

Your request will cost $0.04 per generated second for 720p, $0.03 per second for 580p, $0.02 per second for 480p, and $0.01 per second for 240p.  Generated seconds are calculated at 16 frames per second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to guide the video generation.
  - Examples: "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style."

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `81`
  - Default: `81`
  - Range: `17` to `121`

- **`fps`** (`integer`, _optional_):
  The frame rate of the generated video. Default value: `16`
  - Default: `16`
  - Range: `1` to `60`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to use. Default value: `8`
  - Default: `8`
  - Range: `2` to `16`

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator.

- **`sampler`** (`SamplerEnum`, _optional_):
  The sampler to use. Default value: `"euler"`
  - Default: `"euler"`
  - Options: `"unipc"`, `"dpm++"`, `"euler"`

- **`shift`** (`float`, _optional_):
  The shift of the generated video. Default value: `10.5`
  - Default: `10.5`
  - Range: `1` to `15`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"240p"`, `"360p"`, `"480p"`, `"580p"`, `"720p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"1:1"`, `"9:16"`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable safety checker. Default value: `true`
  - Default: `true`

- **`mask_clamp_lower`** (`float`, _optional_):
  The lower bound of the mask clamping. Default value: `0.1`
  - Default: `0.1`
  - Range: `0` to `1`

- **`mask_clamp_upper`** (`float`, _optional_):
  The upper bound of the mask clamping. Default value: `0.75`
  - Default: `0.75`
  - Range: `0` to `1`

- **`binarize_mask`** (`boolean`, _optional_):
  Whether to binarize the mask.
  - Default: `false`

- **`mask_binarization_threshold`** (`float`, _optional_):
  The threshold for mask binarization. When binarize_mask is True, this threshold will be used to binarize the mask. This will also be used for transparency when the output type is `.webm`. Default value: `0.8`
  - Default: `0.8`
  - Range: `0` to `1`

- **`video_output_type`** (`VideoOutputTypeEnum`, _optional_):
  The output type of the generated video. Default value: `"VP9 (.webm)"`
  - Default: `"VP9 (.webm)"`
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



**Required Parameters Example**:

```json
{
  "prompt": "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style."
}
```

**Full Example**:

```json
{
  "prompt": "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style.",
  "num_frames": 81,
  "fps": 16,
  "num_inference_steps": 8,
  "sampler": "euler",
  "shift": 10.5,
  "resolution": "480p",
  "aspect_ratio": "16:9",
  "enable_safety_checker": true,
  "mask_clamp_lower": 0.1,
  "mask_clamp_upper": 0.75,
  "mask_binarization_threshold": 0.8,
  "video_output_type": "VP9 (.webm)",
  "video_quality": "high",
  "video_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`prompt`** (`string`, _required_):
  The prompt used for generation.
  - Examples: "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style."

- **`seed`** (`integer`, _required_):
  The seed used for generation.
  - Examples: 424911732

- **`video`** (`VideoFile`, _optional_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/wan-alpha-rgba-output.webm","file_name":"wan-alpha-rgba-output.webm","height":720,"width":1280,"content_type":"video/webm"}

- **`image`** (`VideoFile`, _optional_):
  The generated image file.

- **`mask`** (`VideoFile`, _optional_):
  The generated mask file.
  - Examples: {"height":720,"duration":5.0625,"fps":16,"file_name":"wan-alpha-mask-output.webm","url":"https://storage.googleapis.com/falserverless/example_outputs/wan-alpha-mask-output.webm","width":1280,"num_frames":81,"content_type":"video/webm"}



**Example Response**:

```json
{
  "prompt": "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style.",
  "seed": 424911732,
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/wan-alpha-rgba-output.webm",
    "file_name": "wan-alpha-rgba-output.webm",
    "height": 720,
    "width": 1280,
    "content_type": "video/webm"
  },
  "mask": {
    "height": 720,
    "duration": 5.0625,
    "fps": 16,
    "file_name": "wan-alpha-mask-output.webm",
    "url": "https://storage.googleapis.com/falserverless/example_outputs/wan-alpha-mask-output.webm",
    "width": 1280,
    "num_frames": 81,
    "content_type": "video/webm"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan-alpha \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style."
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
    "fal-ai/wan-alpha",
    arguments={
        "prompt": "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style."
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

const result = await fal.subscribe("fal-ai/wan-alpha", {
  input: {
    prompt: "Medium shot. A little girl holds a bubble wand and blows out colorful bubbles that float and pop in the air. The background of this video is transparent. Realistic style."
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

- [Model Playground](https://fal.ai/models/fal-ai/wan-alpha)
- [API Documentation](https://fal.ai/models/fal-ai/wan-alpha/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan-alpha)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

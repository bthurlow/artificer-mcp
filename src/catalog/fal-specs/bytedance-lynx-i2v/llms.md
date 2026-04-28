# Lynx

> Generate subject consistent videos using Lynx from ByteDance!


## Overview

- **Endpoint**: `https://fal.run/bytedance/lynx`
- **Model ID**: `bytedance/lynx`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: image-to-video, subject



## Pricing

- **Price**: $0.6 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The URL of the subject image to be used for video generation
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/lynx/example_in.png"

- **`prompt`** (`string`, _required_):
  Text prompt to guide video generation
  - Examples: "A person carves a pumpkin on a porch in the evening. The camera captures their upper body as they draw a face with a marker, carefully cut along the lines, then lift the lid with both hands. Their face lights up with excitement as they peek inside"

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt to guide what should not appear in the generated video Default value: `"Bright tones, overexposed, blurred background, static, subtitles, style, works, paintings, images, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, still picture, messy background, three legs, many people in the background, walking backwards"`
  - Default: `"Bright tones, overexposed, blurred background, static, subtitles, style, works, paintings, images, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, still picture, messy background, three legs, many people in the background, walking backwards"`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps for sampling. Higher values give better quality but take longer. Default value: `50`
  - Default: `50`
  - Range: `1` to `75`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p, 580p, or 720p) Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"580p"`, `"720p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video (16:9, 9:16, or 1:1) Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`ip_scale`** (`float`, _optional_):
  Identity preservation scale. Controls how closely the generated video preserves the subject's identity from the reference image. Default value: `1`
  - Default: `1`
  - Range: `0` to `2`

- **`strength`** (`float`, _optional_):
  Reference image scale. Controls the influence of the reference image on the generated video. Default value: `1`
  - Default: `1`
  - Range: `0` to `2`

- **`frames_per_second`** (`integer`, _optional_):
  Frames per second of the generated video. Must be between 5 to 30. Default value: `16`
  - Default: `16`
  - Range: `5` to `30`

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. Higher values give better adherence to the prompt but may decrease quality. Default value: `5`
  - Default: `5`
  - Range: `1` to `20`

- **`guidance_scale_2`** (`float`, _optional_):
  Image guidance scale. Controls how closely the generated video follows the reference image. Higher values increase adherence to the reference image but may decrease quality. Default value: `2`
  - Default: `2`
  - Range: `0` to `10`

- **`num_frames`** (`integer`, _optional_):
  Number of frames in the generated video. Must be between 9 to 100. Default value: `81`
  - Default: `81`
  - Range: `9` to `81`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/lynx/example_in.png",
  "prompt": "A person carves a pumpkin on a porch in the evening. The camera captures their upper body as they draw a face with a marker, carefully cut along the lines, then lift the lid with both hands. Their face lights up with excitement as they peek inside"
}
```

**Full Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/lynx/example_in.png",
  "prompt": "A person carves a pumpkin on a porch in the evening. The camera captures their upper body as they draw a face with a marker, carefully cut along the lines, then lift the lid with both hands. Their face lights up with excitement as they peek inside",
  "negative_prompt": "Bright tones, overexposed, blurred background, static, subtitles, style, works, paintings, images, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, still picture, messy background, three legs, many people in the background, walking backwards",
  "num_inference_steps": 50,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "ip_scale": 1,
  "strength": 1,
  "frames_per_second": 16,
  "guidance_scale": 5,
  "guidance_scale_2": 2,
  "num_frames": 81
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/lynx/example_out.mp4","content_type":"video/mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/lynx/example_out.mp4",
    "content_type": "video/mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bytedance/lynx \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/lynx/example_in.png",
     "prompt": "A person carves a pumpkin on a porch in the evening. The camera captures their upper body as they draw a face with a marker, carefully cut along the lines, then lift the lid with both hands. Their face lights up with excitement as they peek inside"
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
    "bytedance/lynx",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/lynx/example_in.png",
        "prompt": "A person carves a pumpkin on a porch in the evening. The camera captures their upper body as they draw a face with a marker, carefully cut along the lines, then lift the lid with both hands. Their face lights up with excitement as they peek inside"
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

const result = await fal.subscribe("bytedance/lynx", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/lynx/example_in.png",
    prompt: "A person carves a pumpkin on a porch in the evening. The camera captures their upper body as they draw a face with a marker, carefully cut along the lines, then lift the lid with both hands. Their face lights up with excitement as they peek inside"
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

- [Model Playground](https://fal.ai/models/bytedance/lynx)
- [API Documentation](https://fal.ai/models/bytedance/lynx/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/lynx)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

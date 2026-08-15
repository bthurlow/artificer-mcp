# Animatediff SparseCtrl LCM

> Animate Your Drawings with Latent Consistency Models!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/animatediff-sparsectrl-lcm`
- **Model ID**: `fal-ai/animatediff-sparsectrl-lcm`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: lcm, animation, stylized



## Pricing

- **Price**: $0 per compute seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to use for generating the image. Be as descriptive as possible for best results.
  - Examples: "Drone footage, futuristic city at night, synthwave, vaporware, neon lights, highly detailed, masterpeice, high quality"

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to use. Use it to specify what you don't want. Default value: `""`
  - Default: `""`
  - Examples: "blurry, low resolution, bad, ugly, low quality, pixelated, interpolated, compression artifacts, noisey, grainy"

- **`controlnet_type`** (`ControlnetTypeEnum`, _optional_):
  The type of controlnet to use for generating the video. The controlnet determines how the video will be animated. Default value: `"scribble"`
  - Default: `"scribble"`
  - Options: `"scribble"`, `"rgb"`

- **`num_inference_steps`** (`integer`, _optional_):
  Increasing the amount of steps tells Stable Diffusion that it should take more steps to generate your final result which can increase the amount of detail in your image. Default value: `4`
  - Default: `4`
  - Range: `1` to `12`

- **`guidance_scale`** (`integer`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `1`
  - Default: `1`
  - Range: `0` to `2`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of Stable
  Diffusion will output the same image every time.
  - Examples: 42

- **`keyframe_0_image_url`** (`string`, _optional_):
  The URL of the first keyframe to use for the generation.
  - Examples: "https://storage.googleapis.com/falserverless/scribble2/scribble_2_1.png"

- **`keyframe_0_index`** (`integer`, _optional_):
  The frame index of the first keyframe to use for the generation.
  - Default: `0`
  - Examples: 0

- **`keyframe_1_image_url`** (`string`, _optional_):
  The URL of the second keyframe to use for the generation.
  - Examples: "https://storage.googleapis.com/falserverless/scribble2/scribble_2_2.png"

- **`keyframe_1_index`** (`integer`, _optional_):
  The frame index of the second keyframe to use for the generation.
  - Default: `0`
  - Examples: 8

- **`keyframe_2_image_url`** (`string`, _optional_):
  The URL of the third keyframe to use for the generation.
  - Examples: "https://storage.googleapis.com/falserverless/scribble2/scribble_2_3.png"

- **`keyframe_2_index`** (`integer`, _optional_):
  The frame index of the third keyframe to use for the generation.
  - Default: `0`
  - Examples: 15



**Required Parameters Example**:

```json
{
  "prompt": "Drone footage, futuristic city at night, synthwave, vaporware, neon lights, highly detailed, masterpeice, high quality"
}
```

**Full Example**:

```json
{
  "prompt": "Drone footage, futuristic city at night, synthwave, vaporware, neon lights, highly detailed, masterpeice, high quality",
  "negative_prompt": "blurry, low resolution, bad, ugly, low quality, pixelated, interpolated, compression artifacts, noisey, grainy",
  "controlnet_type": "scribble",
  "num_inference_steps": 4,
  "guidance_scale": 1,
  "seed": 42,
  "keyframe_0_image_url": "https://storage.googleapis.com/falserverless/scribble2/scribble_2_1.png",
  "keyframe_0_index": 0,
  "keyframe_1_image_url": "https://storage.googleapis.com/falserverless/scribble2/scribble_2_2.png",
  "keyframe_1_index": 8,
  "keyframe_2_image_url": "https://storage.googleapis.com/falserverless/scribble2/scribble_2_3.png",
  "keyframe_2_index": 15
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file.

- **`seed`** (`integer`, _required_):
  The seed used to generate the video.



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/animatediff-sparsectrl-lcm \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Drone footage, futuristic city at night, synthwave, vaporware, neon lights, highly detailed, masterpeice, high quality"
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
    "fal-ai/animatediff-sparsectrl-lcm",
    arguments={
        "prompt": "Drone footage, futuristic city at night, synthwave, vaporware, neon lights, highly detailed, masterpeice, high quality"
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

const result = await fal.subscribe("fal-ai/animatediff-sparsectrl-lcm", {
  input: {
    prompt: "Drone footage, futuristic city at night, synthwave, vaporware, neon lights, highly detailed, masterpeice, high quality"
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

- [Model Playground](https://fal.ai/models/fal-ai/animatediff-sparsectrl-lcm)
- [API Documentation](https://fal.ai/models/fal-ai/animatediff-sparsectrl-lcm/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/animatediff-sparsectrl-lcm)
- [GitHub Repository](https://github.com/guoyww/AnimateDiff/blob/main/LICENSE.txt)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

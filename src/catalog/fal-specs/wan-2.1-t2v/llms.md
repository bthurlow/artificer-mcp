# Wan-2.1 Text-to-Video

> Wan-2.1 is a text-to-video model that generates high-quality videos with high visual quality and motion diversity from text prompts


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan-t2v`
- **Model ID**: `fal-ai/wan-t2v`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text to video, motion



## Pricing

For a video generation, your request will cost **$0.2** at 480p resolution and **0.4$** at 720p resolution. For **$1** you can run this model **approximately 5 times**. More than the default frames will cost 1.25x more.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse."

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `"bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"`
  - Default: `"bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"`
  - Examples: "bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 81 to 100 (inclusive). Default value: `81`
  - Default: `81`
  - Range: `81` to `100`

- **`frames_per_second`** (`integer`, _optional_):
  Frames per second of the generated video. Must be between 5 to 24. Default value: `16`
  - Default: `16`
  - Range: `5` to `24`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p, 580p, or 720p). Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"580p"`, `"720p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video (16:9 or 9:16). Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"9:16"`, `"16:9"`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps for sampling. Higher values give better quality but take longer. Default value: `30`
  - Default: `30`
  - Range: `2` to `40`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled.
  - Default: `false`
  - Examples: true

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion.
  - Default: `false`
  - Examples: false

- **`turbo_mode`** (`boolean`, _optional_):
  If true, the video will be generated faster with no noticeable degradation in the visual quality.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse."
}
```

**Full Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
  "negative_prompt": "bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards",
  "num_frames": 81,
  "frames_per_second": 16,
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "num_inference_steps": 30,
  "enable_safety_checker": true,
  "enable_prompt_expansion": false
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/web-examples/wan/t2v.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/web-examples/wan/t2v.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan-t2v \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse."
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
    "fal-ai/wan-t2v",
    arguments={
        "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse."
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

const result = await fal.subscribe("fal-ai/wan-t2v", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse."
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

- [Model Playground](https://fal.ai/models/fal-ai/wan-t2v)
- [API Documentation](https://fal.ai/models/fal-ai/wan-t2v/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan-t2v)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

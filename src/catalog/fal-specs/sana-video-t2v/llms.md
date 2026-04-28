# Sana Video

> Leverage Sana's ultra-fast processing speed to generate high-quality assets that transform your text prompts into production-ready videos


## Overview

- **Endpoint**: `https://fal.run/fal-ai/sana-video`
- **Model ID**: `fal-ai/sana-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video



## Pricing

Your request will cost 0.15 $ per video second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the video to generate.
  - Examples: "Evening, backlight, side lighting, soft light, high contrast, mid-shot, centered composition, clean solo shot, warm color. A young Caucasian man stands in a forest, golden light glimmers on his hair as sunlight filters through the leaves."

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt describing what to avoid in the generation. Default value: `"A chaotic sequence with misshapen, deformed limbs in heavy motion blur, sudden disappearance, jump cuts, jerky movements, rapid shot changes, frames out of sync, inconsistent character shapes, temporal artifacts, jitter, and ghosting effects, creating a disorienting visual experience."`
  - Default: `"A chaotic sequence with misshapen, deformed limbs in heavy motion blur, sudden disappearance, jump cuts, jerky movements, rapid shot changes, frames out of sync, inconsistent character shapes, temporal artifacts, jitter, and ghosting effects, creating a disorienting visual experience."`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the output video. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"720p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the output video. Only used when resolution is '720p'. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"4:3"`, `"3:4"`, `"1:1"`

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Default value: `81`
  - Default: `81`
  - Range: `16` to `200`

- **`frames_per_second`** (`integer`, _optional_):
  Frames per second for the output video. Default value: `16`
  - Default: `16`
  - Range: `8` to `30`

- **`motion_score`** (`integer`, _optional_):
  Motion intensity score (higher = more motion). Default value: `30`
  - Default: `30`
  - Range: `0` to `100`

- **`guidance_scale`** (`float`, _optional_):
  Guidance scale for generation (higher = more prompt adherence). Default value: `6`
  - Default: `6`
  - Range: `1` to `20`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of denoising steps. Default value: `28`
  - Default: `28`
  - Range: `1` to `50`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation. If not provided, a random seed will be used.

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable safety checking of the generated video. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "Evening, backlight, side lighting, soft light, high contrast, mid-shot, centered composition, clean solo shot, warm color. A young Caucasian man stands in a forest, golden light glimmers on his hair as sunlight filters through the leaves."
}
```

**Full Example**:

```json
{
  "prompt": "Evening, backlight, side lighting, soft light, high contrast, mid-shot, centered composition, clean solo shot, warm color. A young Caucasian man stands in a forest, golden light glimmers on his hair as sunlight filters through the leaves.",
  "negative_prompt": "A chaotic sequence with misshapen, deformed limbs in heavy motion blur, sudden disappearance, jump cuts, jerky movements, rapid shot changes, frames out of sync, inconsistent character shapes, temporal artifacts, jitter, and ghosting effects, creating a disorienting visual experience.",
  "resolution": "480p",
  "aspect_ratio": "16:9",
  "num_frames": 81,
  "frames_per_second": 16,
  "motion_score": 30,
  "guidance_scale": 6,
  "num_inference_steps": 28,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file.
  - Examples: {"content_type":"video/mp4","url":"https://v3b.fal.media/files/b/zebra/TipA9XXsXRYlB6vK6PQ0l_output.mp4"}

- **`seed`** (`integer`, _required_):
  The random seed used for the generation process.

- **`timings`** (`Timings`, _required_):
  Performance timing breakdown.



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/zebra/TipA9XXsXRYlB6vK6PQ0l_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/sana-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Evening, backlight, side lighting, soft light, high contrast, mid-shot, centered composition, clean solo shot, warm color. A young Caucasian man stands in a forest, golden light glimmers on his hair as sunlight filters through the leaves."
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
    "fal-ai/sana-video",
    arguments={
        "prompt": "Evening, backlight, side lighting, soft light, high contrast, mid-shot, centered composition, clean solo shot, warm color. A young Caucasian man stands in a forest, golden light glimmers on his hair as sunlight filters through the leaves."
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

const result = await fal.subscribe("fal-ai/sana-video", {
  input: {
    prompt: "Evening, backlight, side lighting, soft light, high contrast, mid-shot, centered composition, clean solo shot, warm color. A young Caucasian man stands in a forest, golden light glimmers on his hair as sunlight filters through the leaves."
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

- [Model Playground](https://fal.ai/models/fal-ai/sana-video)
- [API Documentation](https://fal.ai/models/fal-ai/sana-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/sana-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

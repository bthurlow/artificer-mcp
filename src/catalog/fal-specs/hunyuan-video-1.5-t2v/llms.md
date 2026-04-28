# Hunyuan Video V1.5

> Hunyuan Video 1.5 is Tencent's latest and best video model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/hunyuan-video-v1.5/text-to-video`
- **Model ID**: `fal-ai/hunyuan-video-v1.5/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: hunyuan-video, text-to-video



## Pricing

Current pricing is 0.075 cents/s of video, more resolutions arriving soon.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video.
  - Examples: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to guide what not to generate. Default value: `""`
  - Default: `""`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps. Default value: `28`
  - Default: `28`
  - Range: `1` to `50`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility.

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`resolution`** (`string`, _optional_):
  The resolution of the video. Default value: `"480p"`
  - Default: `"480p"`

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `121`
  - Default: `121`
  - Range: `1` to `121`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Enable prompt expansion to enhance the input prompt. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."
}
```

**Full Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
  "num_inference_steps": 28,
  "aspect_ratio": "16:9",
  "resolution": "480p",
  "num_frames": 121,
  "enable_prompt_expansion": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/hyvideo_v15_480p_output.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/hyvideo_v15_480p_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/hunyuan-video-v1.5/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."
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
    "fal-ai/hunyuan-video-v1.5/text-to-video",
    arguments={
        "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."
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

const result = await fal.subscribe("fal-ai/hunyuan-video-v1.5/text-to-video", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."
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

- [Model Playground](https://fal.ai/models/fal-ai/hunyuan-video-v1.5/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/hunyuan-video-v1.5/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/hunyuan-video-v1.5/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

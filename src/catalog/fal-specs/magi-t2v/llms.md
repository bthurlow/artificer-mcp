# MAGI-1

> MAGI-1 is a video generation model with exceptional understanding of physical interactions and cinematic prompts


## Overview

- **Endpoint**: `https://fal.run/fal-ai/magi`
- **Model ID**: `fal-ai/magi`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video



## Pricing

Your request will cost $0.80 to generate one four-second video. For $1 you can run this model approximately 1 time. 

Additional seconds will cost $0.20 each, calculated at 24 frames per second.

Additional inference steps above 16 incur a 1/16 multiplier each, such that your total cost will be multiplied x2 at 32 steps, x3 at 48 and x4 at 64. 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "Close-up shot: the old sea captain stares intently, pipe in mouth, wisps of smoke curling around his weathered face. The camera begins a slow clockwise orbit, pulling back. Finally, the camera rises high above, revealing the entire wooden sailing ship cutting through the waves, the captain unmoved, gazing toward the distant horizon."

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 96 and 192 (inclusive). Each additional 24 frames beyond 96 incurs an additional billing unit. Default value: `96`
  - Default: `96`
  - Range: `96` to `192`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p or 720p). 480p is 0.5 billing units, and 720p is 1 billing unit. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`

- **`num_inference_steps`** (`NumInferenceStepsEnum`, _optional_):
  Number of inference steps for sampling. Higher values give better quality but take longer. Default value: `"16"`
  - Default: `16`
  - Options: `4`, `8`, `16`, `32`, `64`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`
  - Examples: true

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"9:16"`, `"1:1"`



**Required Parameters Example**:

```json
{
  "prompt": "Close-up shot: the old sea captain stares intently, pipe in mouth, wisps of smoke curling around his weathered face. The camera begins a slow clockwise orbit, pulling back. Finally, the camera rises high above, revealing the entire wooden sailing ship cutting through the waves, the captain unmoved, gazing toward the distant horizon."
}
```

**Full Example**:

```json
{
  "prompt": "Close-up shot: the old sea captain stares intently, pipe in mouth, wisps of smoke curling around his weathered face. The camera begins a slow clockwise orbit, pulling back. Finally, the camera rises high above, revealing the entire wooden sailing ship cutting through the waves, the captain unmoved, gazing toward the distant horizon.",
  "num_frames": 96,
  "resolution": "720p",
  "num_inference_steps": 16,
  "enable_safety_checker": true,
  "aspect_ratio": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://v3.fal.media/files/elephant/Foq1oFk7e5_dzujsITYfl_f7c4f24d-a68d-4b8b-8199-320002a99ac8.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/elephant/Foq1oFk7e5_dzujsITYfl_f7c4f24d-a68d-4b8b-8199-320002a99ac8.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/magi \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Close-up shot: the old sea captain stares intently, pipe in mouth, wisps of smoke curling around his weathered face. The camera begins a slow clockwise orbit, pulling back. Finally, the camera rises high above, revealing the entire wooden sailing ship cutting through the waves, the captain unmoved, gazing toward the distant horizon."
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
    "fal-ai/magi",
    arguments={
        "prompt": "Close-up shot: the old sea captain stares intently, pipe in mouth, wisps of smoke curling around his weathered face. The camera begins a slow clockwise orbit, pulling back. Finally, the camera rises high above, revealing the entire wooden sailing ship cutting through the waves, the captain unmoved, gazing toward the distant horizon."
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

const result = await fal.subscribe("fal-ai/magi", {
  input: {
    prompt: "Close-up shot: the old sea captain stares intently, pipe in mouth, wisps of smoke curling around his weathered face. The camera begins a slow clockwise orbit, pulling back. Finally, the camera rises high above, revealing the entire wooden sailing ship cutting through the waves, the captain unmoved, gazing toward the distant horizon."
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

- [Model Playground](https://fal.ai/models/fal-ai/magi)
- [API Documentation](https://fal.ai/models/fal-ai/magi/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/magi)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

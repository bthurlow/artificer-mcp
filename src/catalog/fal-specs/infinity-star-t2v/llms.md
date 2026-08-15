# Infinity Star

> InfinityStar’s unified 8B spacetime autoregressive engine to turn any text prompt into crisp 720p videos - 10× faster than diffusion models.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/infinity-star/text-to-video`
- **Model ID**: `fal-ai/infinity-star/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video



## Pricing

Your request will cost 0.07 $ per video.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for generating the video
  - Examples: "A serene mountain landscape at sunset with flowing clouds"

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt to guide what to avoid in generation Default value: `""`
  - Default: `""`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps Default value: `50`
  - Default: `50`
  - Range: `1` to `100`

- **`guidance_scale`** (`float`, _optional_):
  Guidance scale for generation Default value: `7.5`
  - Default: `7.5`
  - Range: `1` to `40`

- **`tau_video`** (`float`, _optional_):
  Tau value for video scale Default value: `0.4`
  - Default: `0.4`
  - Range: `0.1` to `1`

- **`use_apg`** (`boolean`, _optional_):
  Whether to use APG Default value: `true`
  - Default: `true`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated output Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"1:1"`, `"9:16"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Leave empty for random generation.

- **`enhance_prompt`** (`boolean`, _optional_):
  Whether to use an LLM to enhance the prompt. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A serene mountain landscape at sunset with flowing clouds"
}
```

**Full Example**:

```json
{
  "prompt": "A serene mountain landscape at sunset with flowing clouds",
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "tau_video": 0.4,
  "use_apg": true,
  "aspect_ratio": "16:9",
  "enhance_prompt": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file



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
  --url https://fal.run/fal-ai/infinity-star/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A serene mountain landscape at sunset with flowing clouds"
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
    "fal-ai/infinity-star/text-to-video",
    arguments={
        "prompt": "A serene mountain landscape at sunset with flowing clouds"
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

const result = await fal.subscribe("fal-ai/infinity-star/text-to-video", {
  input: {
    prompt: "A serene mountain landscape at sunset with flowing clouds"
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

- [Model Playground](https://fal.ai/models/fal-ai/infinity-star/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/infinity-star/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/infinity-star/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

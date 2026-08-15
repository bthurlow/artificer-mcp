# LTX Video-0.9.5

> Generate videos from prompts using LTX Video-0.9.5


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-video-v095`
- **Model ID**: `fal-ai/ltx-video-v095`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: video, text-video



## Pricing

- **Price**: $0.04 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt to guide generation
  - Examples: "A cute cat walking on a sidewalk"

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for generation Default value: `"worst quality, inconsistent motion, blurry, jittery, distorted"`
  - Default: `"worst quality, inconsistent motion, blurry, jittery, distorted"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p or 720p). Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video (16:9 or 9:16). Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"9:16"`, `"16:9"`

- **`seed`** (`integer`, _optional_):
  Random seed for generation

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps Default value: `40`
  - Default: `40`
  - Range: `2` to `50`

- **`expand_prompt`** (`boolean`, _optional_):
  Whether to expand the prompt using the model's own capabilities. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A cute cat walking on a sidewalk"
}
```

**Full Example**:

```json
{
  "prompt": "A cute cat walking on a sidewalk",
  "negative_prompt": "worst quality, inconsistent motion, blurry, jittery, distorted",
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "num_inference_steps": 40,
  "expand_prompt": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/ltx-t2v_output.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/ltx-t2v_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-video-v095 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A cute cat walking on a sidewalk"
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
    "fal-ai/ltx-video-v095",
    arguments={
        "prompt": "A cute cat walking on a sidewalk"
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

const result = await fal.subscribe("fal-ai/ltx-video-v095", {
  input: {
    prompt: "A cute cat walking on a sidewalk"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-video-v095)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-video-v095/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-video-v095)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Flux 3 Text to Video

> FLUX 3 is Black Forest Labs' frontier video model. This endpoint generates video directly from a text prompt, translating a written description into motion, composition, and scene.


## Overview

- **Endpoint**: `https://fal.run/blackforestlabs/flux-3/text-to-video`
- **Model ID**: `blackforestlabs/flux-3/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will be charged at **0.17** $ per second of generated video at 720p, and **0.29** $ per second at 1080p.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the video you want to generate.
  - Examples: "A red panda walks along a mossy log in a sunlit forest, one continuous unbroken shot. Ambient birdsong and rustling leaves."

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. `auto` lets the model choose. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"21:9"`, `"2:1"`, `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the generated video in seconds. `auto` lets the model choose. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`, `19`, `20`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the video. Default value: `true`
  - Default: `true`

- **`safety_tolerance`** (`integer`, _optional_):
  The safety tolerance level for the generated video. 0 is the strictest and 4 is the most permissive. Default value: `2`
  - Default: `2`
  - Range: `0` to `4`



**Required Parameters Example**:

```json
{
  "prompt": "A red panda walks along a mossy log in a sunlit forest, one continuous unbroken shot. Ambient birdsong and rustling leaves."
}
```

**Full Example**:

```json
{
  "prompt": "A red panda walks along a mossy log in a sunlit forest, one continuous unbroken shot. Ambient birdsong and rustling leaves.",
  "aspect_ratio": "auto",
  "resolution": "720p",
  "duration": "auto",
  "generate_audio": true,
  "safety_tolerance": 2
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/veo3-i2v-output.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for the generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/veo3-i2v-output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/blackforestlabs/flux-3/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A red panda walks along a mossy log in a sunlit forest, one continuous unbroken shot. Ambient birdsong and rustling leaves."
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
    "blackforestlabs/flux-3/text-to-video",
    arguments={
        "prompt": "A red panda walks along a mossy log in a sunlit forest, one continuous unbroken shot. Ambient birdsong and rustling leaves."
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

const result = await fal.subscribe("blackforestlabs/flux-3/text-to-video", {
  input: {
    prompt: "A red panda walks along a mossy log in a sunlit forest, one continuous unbroken shot. Ambient birdsong and rustling leaves."
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

- [Model Playground](https://fal.ai/models/blackforestlabs/flux-3/text-to-video)
- [API Documentation](https://fal.ai/models/blackforestlabs/flux-3/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=blackforestlabs/flux-3/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

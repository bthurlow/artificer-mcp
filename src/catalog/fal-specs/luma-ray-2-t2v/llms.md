# Luma Ray 2

> Ray2 is a large-scale video generative model capable of creating realistic visuals with natural, coherent motion.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/luma-dream-machine/ray-2`
- **Model ID**: `fal-ai/luma-dream-machine/ray-2`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: motion, transformation



## Pricing

- **Price**: $0.5 per 5 seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; filmed in a wide tracking shot with dynamic motion, warm natural lighting, and an epic."

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"4:3"`, `"3:4"`, `"21:9"`, `"9:21"`

- **`loop`** (`boolean`, _optional_):
  Whether the video should loop (end of video is blended with the beginning)
  - Default: `false`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video (720p costs 2x more, 1080p costs 4x more) Default value: `"540p"`
  - Default: `"540p"`
  - Options: `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video (9s costs 2x more) Default value: `"5s"`
  - Default: `"5s"`
  - Options: `"5s"`, `"9s"`



**Required Parameters Example**:

```json
{
  "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; filmed in a wide tracking shot with dynamic motion, warm natural lighting, and an epic."
}
```

**Full Example**:

```json
{
  "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; filmed in a wide tracking shot with dynamic motion, warm natural lighting, and an epic.",
  "aspect_ratio": "16:9",
  "resolution": "540p",
  "duration": "5s"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://v3.fal.media/files/penguin/Om3xjcOwiSCJwrXs7DUi__output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/penguin/Om3xjcOwiSCJwrXs7DUi__output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/luma-dream-machine/ray-2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; filmed in a wide tracking shot with dynamic motion, warm natural lighting, and an epic."
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
    "fal-ai/luma-dream-machine/ray-2",
    arguments={
        "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; filmed in a wide tracking shot with dynamic motion, warm natural lighting, and an epic."
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

const result = await fal.subscribe("fal-ai/luma-dream-machine/ray-2", {
  input: {
    prompt: "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; filmed in a wide tracking shot with dynamic motion, warm natural lighting, and an epic."
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

- [Model Playground](https://fal.ai/models/fal-ai/luma-dream-machine/ray-2)
- [API Documentation](https://fal.ai/models/fal-ai/luma-dream-machine/ray-2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/luma-dream-machine/ray-2)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

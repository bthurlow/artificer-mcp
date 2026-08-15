# MiniMax H3 Text to Video

> MiniMax H3 is a frontier video model. This endpoint generates video from a text prompt alone, rendering at 2K in durations from 5 to 15 seconds across seven aspect ratios.


## Overview

- **Endpoint**: `https://fal.run/minimax/h3/text-to-video`
- **Model ID**: `minimax/h3/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Video costs **$0.05** per second at **480p**, **$0.08** per second at **768p**, **$0.13** per second at **2K** and **$0.16** per second at **4K**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation
  - Examples: "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves."

- **`duration`** (`integer`, _optional_):
  The duration of the video in seconds. Default value: `5`
  - Default: `5`
  - Range: `5` to `15`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. 480P and 768P are native generation modes; 2K and 4K upscale a 768P base result. Default value: `"2K"`
  - Default: `"2K"`
  - Options: `"480P"`, `"768P"`, `"2K"`, `"4K"`

- **`seed`** (`integer`, _optional_):
  Random seed. A random seed is selected when omitted.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to expand the prompt with a vision language model before generation. Default value: `true`
  - Default: `true`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"21:9"`, `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`



**Required Parameters Example**:

```json
{
  "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves."
}
```

**Full Example**:

```json
{
  "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves.",
  "duration": 5,
  "resolution": "2K",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "aspect_ratio": "16:9"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"file_name":"--prs89fkHtWW406fmEs__NRhTqNku.mp4","url":"https://v3b.fal.media/files/b/0aa46818/--prs89fkHtWW406fmEs__NRhTqNku.mp4","file_size":6463396,"content_type":"video/mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "--prs89fkHtWW406fmEs__NRhTqNku.mp4",
    "url": "https://v3b.fal.media/files/b/0aa46818/--prs89fkHtWW406fmEs__NRhTqNku.mp4",
    "file_size": 6463396,
    "content_type": "video/mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/minimax/h3/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves."
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
    "minimax/h3/text-to-video",
    arguments={
        "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves."
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

const result = await fal.subscribe("minimax/h3/text-to-video", {
  input: {
    prompt: "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves."
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

- [Model Playground](https://fal.ai/models/minimax/h3/text-to-video)
- [API Documentation](https://fal.ai/models/minimax/h3/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=minimax/h3/text-to-video)

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

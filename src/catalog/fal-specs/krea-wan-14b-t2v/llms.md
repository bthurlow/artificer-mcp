# Krea Wan 14b- Text to Video

> Fast Text-to-Video endpoint for Krea's Wan 14b model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/krea-wan-14b/text-to-video`
- **Model ID**: `fal-ai/krea-wan-14b/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text to video, fast



## Pricing

Generation will cost **$0.025** per output video second. Video seconds are calculated at 16 frames per second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Prompt for the video-to-video generation.
  - Examples: "A powerful, matte black jeep, its robust frame contrasting with the lush green surroundings, navigates a winding jungle road, kicking up small clouds of dust and loose earth from its tires."

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be a multiple of 12 plus 6, for example 6, 18, 30, 42, etc. Default value: `78`
  - Default: `78`
  - Range: `18` to `162`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. This will use a large language model to expand the prompt with additional details while maintaining the original meaning.
  - Default: `false`
  - Examples: true

- **`seed`** (`integer`, _optional_):
  Seed for the video-to-video generation.



**Required Parameters Example**:

```json
{
  "prompt": "A powerful, matte black jeep, its robust frame contrasting with the lush green surroundings, navigates a winding jungle road, kicking up small clouds of dust and loose earth from its tires."
}
```

**Full Example**:

```json
{
  "prompt": "A powerful, matte black jeep, its robust frame contrasting with the lush green surroundings, navigates a winding jungle road, kicking up small clouds of dust and loose earth from its tires.",
  "num_frames": 78,
  "enable_prompt_expansion": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/krea_wan_14b_v2v_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/krea_wan_14b_v2v_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/krea-wan-14b/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A powerful, matte black jeep, its robust frame contrasting with the lush green surroundings, navigates a winding jungle road, kicking up small clouds of dust and loose earth from its tires."
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
    "fal-ai/krea-wan-14b/text-to-video",
    arguments={
        "prompt": "A powerful, matte black jeep, its robust frame contrasting with the lush green surroundings, navigates a winding jungle road, kicking up small clouds of dust and loose earth from its tires."
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

const result = await fal.subscribe("fal-ai/krea-wan-14b/text-to-video", {
  input: {
    prompt: "A powerful, matte black jeep, its robust frame contrasting with the lush green surroundings, navigates a winding jungle road, kicking up small clouds of dust and loose earth from its tires."
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

- [Model Playground](https://fal.ai/models/fal-ai/krea-wan-14b/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/krea-wan-14b/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/krea-wan-14b/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

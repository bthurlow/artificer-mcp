# MiniMax (Hailuo AI) Video 01 Director - Image to Video

> Generate video clips more accurately with respect to initial image, natural language descriptions, and using camera movement instructions for shot control.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/minimax/video-01-director/image-to-video`
- **Model ID**: `fal-ai/minimax/video-01-director/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: motion, transformation, camera-controls



## Pricing

- **Price**: $0.5 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation. Camera movement instructions can be added using square brackets (e.g. [Pan left] or [Zoom in]). You can use up to 3 combined movements per prompt. Supported movements: Truck left/right, Pan left/right, Push in/Pull out, Pedestal up/down, Tilt up/down, Zoom in/out, Shake, Tracking shot, Static shot. For example: [Truck left, Pan right, Zoom in]. For a more detailed guide, refer https://sixth-switch-2ac.notion.site/T2V-01-Director-Model-Tutorial-with-camera-movement-1886c20a98eb80f395b8e05291ad8645
  - Examples: "[Push in, Follow]A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.[Pan left] The street opens into a small plaza where street vendors sell steaming food under colorful awnings."

- **`image_url`** (`string`, _required_):
  URL of the image to use as the first frame
  - Examples: "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"

- **`prompt_optimizer`** (`boolean`, _optional_):
  Whether to use the model's prompt optimizer Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "[Push in, Follow]A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.[Pan left] The street opens into a small plaza where street vendors sell steaming food under colorful awnings.",
  "image_url": "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"
}
```

**Full Example**:

```json
{
  "prompt": "[Push in, Follow]A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.[Pan left] The street opens into a small plaza where street vendors sell steaming food under colorful awnings.",
  "image_url": "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg",
  "prompt_optimizer": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://storage.googleapis.com/falserverless/web-examples/minimax/i2v-01.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/web-examples/minimax/i2v-01.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/minimax/video-01-director/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "[Push in, Follow]A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.[Pan left] The street opens into a small plaza where street vendors sell steaming food under colorful awnings.",
     "image_url": "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"
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
    "fal-ai/minimax/video-01-director/image-to-video",
    arguments={
        "prompt": "[Push in, Follow]A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.[Pan left] The street opens into a small plaza where street vendors sell steaming food under colorful awnings.",
        "image_url": "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"
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

const result = await fal.subscribe("fal-ai/minimax/video-01-director/image-to-video", {
  input: {
    prompt: "[Push in, Follow]A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.[Pan left] The street opens into a small plaza where street vendors sell steaming food under colorful awnings.",
    image_url: "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"
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

- [Model Playground](https://fal.ai/models/fal-ai/minimax/video-01-director/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/minimax/video-01-director/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/minimax/video-01-director/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

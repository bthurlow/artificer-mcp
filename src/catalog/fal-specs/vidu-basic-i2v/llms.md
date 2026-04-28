# Vidu Image to Video

> Vidu Image to Video generates high-quality videos with exceptional visual quality and motion diversity from a single image


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/image-to-video`
- **Model ID**: `fal-ai/vidu/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: motion, image to video



## Pricing

For **4s video** your request will cost **$0.20**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation, max 1500 characters
  - Examples: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse."

- **`image_url`** (`string`, _required_):
  URL of the image to use as the first frame
  - Examples: "https://storage.googleapis.com/falserverless/web-examples/vidu/stylish_woman.webp"

- **`seed`** (`integer`, _optional_):
  Random seed for generation

- **`movement_amplitude`** (`MovementAmplitudeEnum`, _optional_):
  The movement amplitude of objects in the frame Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"small"`, `"medium"`, `"large"`



**Required Parameters Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
  "image_url": "https://storage.googleapis.com/falserverless/web-examples/vidu/stylish_woman.webp"
}
```

**Full Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
  "image_url": "https://storage.googleapis.com/falserverless/web-examples/vidu/stylish_woman.webp",
  "movement_amplitude": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://fal.media/files/kangaroo/gzfzC5FXvcgZegQmy90L1_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/kangaroo/gzfzC5FXvcgZegQmy90L1_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
     "image_url": "https://storage.googleapis.com/falserverless/web-examples/vidu/stylish_woman.webp"
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
    "fal-ai/vidu/image-to-video",
    arguments={
        "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
        "image_url": "https://storage.googleapis.com/falserverless/web-examples/vidu/stylish_woman.webp"
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

const result = await fal.subscribe("fal-ai/vidu/image-to-video", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage. She wears a black leather jacket, a long red dress, and black boots, and carries a black purse.",
    image_url: "https://storage.googleapis.com/falserverless/web-examples/vidu/stylish_woman.webp"
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

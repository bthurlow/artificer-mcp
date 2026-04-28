# Lucy Image to Video

> Lucy delivers lightning fast performance that redefines what's possible with image to video AI


## Overview

- **Endpoint**: `https://fal.run/decart/lucy-i2v`
- **Model ID**: `decart/lucy-i2v`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

- **Price**: $0.08 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text description of the desired video content
  - Examples: "A cinematic video begins with a woman standing in an art studio, wearing a paint-splattered apron over a white off-shoulder blouse, surrounded by colorful canvases on easels. She gently plays with her hair for a moment, then straightens her head and looks directly at the camera with a warm smile. After holding the smile, she gracefully twirls around in place, her apron flowing slightly with the motion, creating a playful and artistic atmosphere against the backdrop of her vibrant paintings."

- **`image_url`** (`string`, _required_):
  URL of the image to use as the first frame
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-image.png"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"9:16"`, `"16:9"`

- **`sync_mode`** (`boolean`, _optional_):
  If set to true, the function will wait for the image to be generated
  and uploaded before returning the response. This will increase the
  latency of the function but it allows you to get the image directly
  in the response without going through the CDN. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A cinematic video begins with a woman standing in an art studio, wearing a paint-splattered apron over a white off-shoulder blouse, surrounded by colorful canvases on easels. She gently plays with her hair for a moment, then straightens her head and looks directly at the camera with a warm smile. After holding the smile, she gracefully twirls around in place, her apron flowing slightly with the motion, creating a playful and artistic atmosphere against the backdrop of her vibrant paintings.",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-image.png"
}
```

**Full Example**:

```json
{
  "prompt": "A cinematic video begins with a woman standing in an art studio, wearing a paint-splattered apron over a white off-shoulder blouse, surrounded by colorful canvases on easels. She gently plays with her hair for a moment, then straightens her head and looks directly at the camera with a warm smile. After holding the smile, she gracefully twirls around in place, her apron flowing slightly with the motion, creating a playful and artistic atmosphere against the backdrop of her vibrant paintings.",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-image.png",
  "aspect_ratio": "16:9",
  "sync_mode": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated MP4 video with H.264 encoding
  - Examples: {"url":"https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-video.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-video.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/decart/lucy-i2v \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A cinematic video begins with a woman standing in an art studio, wearing a paint-splattered apron over a white off-shoulder blouse, surrounded by colorful canvases on easels. She gently plays with her hair for a moment, then straightens her head and looks directly at the camera with a warm smile. After holding the smile, she gracefully twirls around in place, her apron flowing slightly with the motion, creating a playful and artistic atmosphere against the backdrop of her vibrant paintings.",
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-image.png"
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
    "decart/lucy-i2v",
    arguments={
        "prompt": "A cinematic video begins with a woman standing in an art studio, wearing a paint-splattered apron over a white off-shoulder blouse, surrounded by colorful canvases on easels. She gently plays with her hair for a moment, then straightens her head and looks directly at the camera with a warm smile. After holding the smile, she gracefully twirls around in place, her apron flowing slightly with the motion, creating a playful and artistic atmosphere against the backdrop of her vibrant paintings.",
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-image.png"
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

const result = await fal.subscribe("decart/lucy-i2v", {
  input: {
    prompt: "A cinematic video begins with a woman standing in an art studio, wearing a paint-splattered apron over a white off-shoulder blouse, surrounded by colorful canvases on easels. She gently plays with her hair for a moment, then straightens her head and looks directly at the camera with a warm smile. After holding the smile, she gracefully twirls around in place, her apron flowing slightly with the motion, creating a playful and artistic atmosphere against the backdrop of her vibrant paintings.",
    image_url: "https://storage.googleapis.com/falserverless/model_tests/lucy-14b/lucy-14b-art-swirl-image.png"
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

- [Model Playground](https://fal.ai/models/decart/lucy-i2v)
- [API Documentation](https://fal.ai/models/decart/lucy-i2v/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=decart/lucy-i2v)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

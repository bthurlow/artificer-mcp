# Wan-2.1 Pro Image-to-Video

> Wan-2.1 Pro is a premium image-to-video model that generates high-quality 1080p videos at 30fps with up to 6 seconds duration, delivering exceptional visual quality and motion diversity from images


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan-pro/image-to-video`
- **Model ID**: `fal-ai/wan-pro/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: image to video, motion



## Pricing

- **Price**: $0.8 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video
  - Examples: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker Default value: `true`
  - Default: `true`

- **`image_url`** (`string`, _required_):
  The URL of the image to generate the video from
  - Examples: "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"



**Required Parameters Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
  "image_url": "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"
}
```

**Full Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
  "enable_safety_checker": true,
  "image_url": "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://fal.media/files/kangaroo/K1hB3k-IXBzq9rz1kNOxy.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/kangaroo/K1hB3k-IXBzq9rz1kNOxy.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan-pro/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
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
    "fal-ai/wan-pro/image-to-video",
    arguments={
        "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
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

const result = await fal.subscribe("fal-ai/wan-pro/image-to-video", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
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

- [Model Playground](https://fal.ai/models/fal-ai/wan-pro/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/wan-pro/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan-pro/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

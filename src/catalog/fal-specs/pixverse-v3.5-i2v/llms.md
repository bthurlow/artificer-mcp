# PixVerse v3.5: Image to Video

> Generate high quality video clips from text and image prompts using PixVerse v3.5


## Overview

- **Endpoint**: `https://fal.run/fal-ai/pixverse/v3.5/image-to-video`
- **Model ID**: `fal-ai/pixverse/v3.5/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

For 5s video your request will cost **$0.15** for 360p and 540p, **$0.2** for 720p and **$0.4** for 1080p. For **$1** you can run this model with approximately 2 times.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"360p"`, `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds. 8s videos cost double. 1080p videos are limited to 5 seconds Default value: `"5"`
  - Default: `"5"`
  - Options: `"5"`, `"8"`

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt to be used for the generation Default value: `""`
  - Default: `""`
  - Examples: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded"

- **`style`** (`Enum`, _optional_):
  The style of the generated video
  - Options: `"anime"`, `"3d_animation"`, `"clay"`, `"comic"`, `"cyberpunk"`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of the model
  will output the same video every time.

- **`image_url`** (`string`, _required_):
  URL of the image to use as the first frame
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
  "resolution": "720p",
  "duration": "5",
  "negative_prompt": "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded",
  "image_url": "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"file_name":"output.mp4","url":"https://fal.media/files/tiger/8V9H8RLyFiWjmJDOxGbcG_output.mp4","file_size":4060052,"content_type":"video/mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "output.mp4",
    "url": "https://fal.media/files/tiger/8V9H8RLyFiWjmJDOxGbcG_output.mp4",
    "file_size": 4060052,
    "content_type": "video/mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/pixverse/v3.5/image-to-video \
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
    "fal-ai/pixverse/v3.5/image-to-video",
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

const result = await fal.subscribe("fal-ai/pixverse/v3.5/image-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/pixverse/v3.5/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/pixverse/v3.5/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/pixverse/v3.5/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

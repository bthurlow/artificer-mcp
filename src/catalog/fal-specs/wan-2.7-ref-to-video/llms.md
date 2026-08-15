# Wan 2.7 Reference to Video

> Wan 2.7 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan/v2.7/reference-to-video`
- **Model ID**: `fal-ai/wan/v2.7/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will cost **$0.10** per second. When video inputs are provided, billing duration is calculated as input video duration + output video duration. For example, an **8s** input video with a **3s** output will be billed for **11** seconds (**$1.10**).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the desired video. Max 5000 characters.
  - Examples: "A person walking through a beautiful garden, cinematic style."

- **`reference_image_urls`** (`list<string>`, _optional_):
  Reference image URLs for character/object appearance. Pass multiple images for multi-subject generation. Max 20 MB each.
  - Array of string

- **`reference_video_urls`** (`list<string>`, _optional_):
  Reference video URLs for character/object appearance and motion. Pass multiple videos for multi-subject generation. Max 100 MB each.
  - Array of string

- **`negative_prompt`** (`string`, _optional_):
  Content to avoid in the video. Max 500 characters.
  - Examples: "low resolution, errors, worst quality, low quality"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output video resolution tier. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Output video duration in seconds (2-10). Default value: `"5"`
  - Default: `5`
  - Options: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`
  - Examples: 5, 10

- **`multi_shots`** (`boolean`, _optional_):
  When true, enables intelligent multi-shot segmentation. When false (default), generates a single continuous shot.
  - Default: `false`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility (0-2147483647).

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A person walking through a beautiful garden, cinematic style."
}
```

**Full Example**:

```json
{
  "prompt": "A person walking through a beautiful garden, cinematic style.",
  "negative_prompt": "low resolution, errors, worst quality, low quality",
  "aspect_ratio": "16:9",
  "resolution": "1080p",
  "duration": 5,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file.

- **`seed`** (`integer`, _required_):
  The seed used for generation.

- **`actual_prompt`** (`string`, _optional_):
  The actual prompt used if prompt rewriting was enabled.



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan/v2.7/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A person walking through a beautiful garden, cinematic style."
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
    "fal-ai/wan/v2.7/reference-to-video",
    arguments={
        "prompt": "A person walking through a beautiful garden, cinematic style."
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

const result = await fal.subscribe("fal-ai/wan/v2.7/reference-to-video", {
  input: {
    prompt: "A person walking through a beautiful garden, cinematic style."
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

- [Model Playground](https://fal.ai/models/fal-ai/wan/v2.7/reference-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/wan/v2.7/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan/v2.7/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

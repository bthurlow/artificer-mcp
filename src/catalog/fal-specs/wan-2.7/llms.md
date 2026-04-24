# Wan

> Wan 2.7 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan/v2.7/image-to-video`
- **Model ID**: `fal-ai/wan/v2.7/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will cost **$0.1** per second for 720p resolution. For 1080p your request will cost **$0.15** per second. 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Text prompt describing the desired video. Max 5000 characters.
  - Examples: "The massive humpback whale glides slowly through the deep blue water. It turns gracefully, its huge pectoral fin sweeping through the water like a wing. Sunbeams penetrate from above, illuminating the whale's textured skin. Small fish scatter. Awe-inspiring scale and grace."

- **`image_url`** (`string`, _optional_):
  URL of the first frame image. Formats: JPEG, JPG, PNG, BMP, WEBP. Max 20 MB.
  - Examples: "https://v3b.fal.media/files/b/0a9413bb/qH6QY4JRzWxHOFKtCe70S_uPDJyzKZ.png"

- **`end_image_url`** (`string`, _optional_):
  URL of the last frame image for first-and-last-frame-to-video. Same constraints as image_url.

- **`video_url`** (`string`, _optional_):
  URL of a video clip to continue from. Format: MP4, MOV. Duration: 2-10s. Max 100 MB. Cannot be combined with image_url.

- **`audio_url`** (`string`, _optional_):
  URL of driving audio. Supports WAV and MP3. Duration: 2-30s. Max 15 MB.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output video resolution tier. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Output video duration in seconds (2-15). Default value: `"5"`
  - Default: `5`
  - Options: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15`
  - Examples: 5, 10, 15

- **`negative_prompt`** (`string`, _optional_):
  Content to avoid in the video. Max 500 characters.
  - Examples: "low resolution, errors, worst quality, low quality, incomplete, extra fingers, bad proportions, blurry, distorted"

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Enable intelligent prompt rewriting. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility (0-2147483647).

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "prompt": "The massive humpback whale glides slowly through the deep blue water. It turns gracefully, its huge pectoral fin sweeping through the water like a wing. Sunbeams penetrate from above, illuminating the whale's textured skin. Small fish scatter. Awe-inspiring scale and grace.",
  "image_url": "https://v3b.fal.media/files/b/0a9413bb/qH6QY4JRzWxHOFKtCe70S_uPDJyzKZ.png",
  "resolution": "1080p",
  "duration": 5,
  "negative_prompt": "low resolution, errors, worst quality, low quality, incomplete, extra fingers, bad proportions, blurry, distorted",
  "enable_prompt_expansion": true,
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
  --url https://fal.run/fal-ai/wan/v2.7/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
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
    "fal-ai/wan/v2.7/image-to-video",
    arguments={},
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

const result = await fal.subscribe("fal-ai/wan/v2.7/image-to-video", {
  input: {},
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

- [Model Playground](https://fal.ai/models/fal-ai/wan/v2.7/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/wan/v2.7/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan/v2.7/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

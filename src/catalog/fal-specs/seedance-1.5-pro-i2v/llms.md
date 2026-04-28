# Bytedance

> Generate videos with audio with Seedance 1.5 (supports start & end frame) 


## Overview

- **Endpoint**: `https://fal.run/fal-ai/bytedance/seedance/v1.5/pro/image-to-video`
- **Model ID**: `fal-ai/bytedance/seedance/v1.5/pro/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: bytedance, seedance, audio



## Pricing

Each 720p 5 second video with audio costs roughly **$0.26**. For other resolutions, 1 million video tokens with audio costs **$2.4**. Without audio, the price is **1.2** per millition tokens. tokens(video)  = (height x width x FPS x duration) / 1024. 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used to generate the video
  - Examples: "A man is crying and he says \"I shouldn't have done it. I regret everything\""

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"21:9"`, `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`, `"auto"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Video resolution - 480p for faster generation, 720p for balance, 1080p for higher quality Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the video in seconds Default value: `"5"`
  - Default: `"5"`
  - Options: `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`

- **`camera_fixed`** (`boolean`, _optional_):
  Whether to fix the camera position
  - Default: `false`

- **`seed`** (`integer`, _optional_):
  Random seed to control video generation. Use -1 for random.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`
  - Examples: true

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the video Default value: `true`
  - Default: `true`

- **`image_url`** (`string`, _required_):
  The URL of the image used to generate video
  - Examples: "https://v3b.fal.media/files/b/0a8773cd/REzCWn1BKUVuMFTxR-R3W_image_317.png"

- **`end_image_url`** (`string`, _optional_):
  The URL of the image the video ends with. Defaults to None.



**Required Parameters Example**:

```json
{
  "prompt": "A man is crying and he says \"I shouldn't have done it. I regret everything\"",
  "image_url": "https://v3b.fal.media/files/b/0a8773cd/REzCWn1BKUVuMFTxR-R3W_image_317.png"
}
```

**Full Example**:

```json
{
  "prompt": "A man is crying and he says \"I shouldn't have done it. I regret everything\"",
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "duration": "5",
  "enable_safety_checker": true,
  "generate_audio": true,
  "image_url": "https://v3b.fal.media/files/b/0a8773cd/REzCWn1BKUVuMFTxR-R3W_image_317.png"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8773d3/l2fk-fIO_PQFPzbvHkQX1_video.mp4"}

- **`seed`** (`integer`, _required_):
  Seed used for generation
  - Examples: 42



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8773d3/l2fk-fIO_PQFPzbvHkQX1_video.mp4"
  },
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/bytedance/seedance/v1.5/pro/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A man is crying and he says \"I shouldn't have done it. I regret everything\"",
     "image_url": "https://v3b.fal.media/files/b/0a8773cd/REzCWn1BKUVuMFTxR-R3W_image_317.png"
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
    "fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
    arguments={
        "prompt": "A man is crying and he says \"I shouldn't have done it. I regret everything\"",
        "image_url": "https://v3b.fal.media/files/b/0a8773cd/REzCWn1BKUVuMFTxR-R3W_image_317.png"
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

const result = await fal.subscribe("fal-ai/bytedance/seedance/v1.5/pro/image-to-video", {
  input: {
    prompt: "A man is crying and he says \"I shouldn't have done it. I regret everything\"",
    image_url: "https://v3b.fal.media/files/b/0a8773cd/REzCWn1BKUVuMFTxR-R3W_image_317.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/bytedance/seedance/v1.5/pro/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/bytedance/seedance/v1.5/pro/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/bytedance/seedance/v1.5/pro/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

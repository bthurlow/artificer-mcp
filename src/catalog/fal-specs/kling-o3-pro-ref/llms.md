# Kling O3 Reference to Video [Pro]

> Transform images, elements, and text into consistent, high-quality video scenes, ensuring stable character identity, object details, and environments.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/o3/pro/reference-to-video`
- **Model ID**: `fal-ai/kling-video/o3/pro/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: reference-to-video, 



## Pricing

For every second of video you generated, you will be charged **$0.112** (audio off) or **$0.14** (audio on). For example, a 5s video with audio on will cost **$0.70**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Text prompt for video generation. Either prompt or multi_prompt must be provided, but not both.
  - Examples: "@Element1 and @Element2 enters the scene from two sides. Elephant starts to play with the ball"

- **`multi_prompt`** (`list<KlingV3MultiPromptElement>`, _optional_):
  List of prompts for multi-shot video generation.
  - Array of KlingV3MultiPromptElement
  - Examples: null

- **`start_image_url`** (`string`, _optional_):
  Image to use as the first frame of the video.
  - Examples: "https://v3b.fal.media/files/b/0a8d1b38/myilPNN_WYdJCmpTy4Sjr_6XNBi9Mm.png"

- **`end_image_url`** (`string`, _optional_):
  Image to use as the last frame of the video.

- **`image_urls`** (`list<string>`, _optional_):
  Reference images for style/appearance. Reference in prompt as @Image1, @Image2, etc. Maximum 4 total (elements + reference images) when using video.
  - Array of string

- **`elements`** (`list<KlingV3ComboElementInput>`, _optional_):
  Elements (characters/objects) to include. Reference in prompt as @Element1, @Element2.
  - Array of KlingV3ComboElementInput
  - Examples: [{"reference_image_urls":["https://v3b.fal.media/files/b/0a8d1b1a/eZfSbcQ58EzD_l2SEbevg_F3U9GMLK.png"],"frontal_image_url":"https://v3b.fal.media/files/b/0a8d1b2e/yiHiZP1Now0V5JC5_OClE_PaKOtOGJ.png"},{"reference_image_urls":["https://v3b.fal.media/files/b/0a8d1b3c/_ZE2iIjkb-Eun3WXXGP4x_TSG1ELBo.png"],"frontal_image_url":"https://v3b.fal.media/files/b/0a8d1b19/_eIj7GjmI5zgQkMN936YJ_2f3hZ7Xb.png"}]

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate native audio for the video.
  - Default: `false`

- **`duration`** (`DurationEnum`, _optional_):
  Video duration in seconds (3-15s). Default value: `"5"`
  - Default: `"5"`
  - Options: `"3"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, `"13"`, `"14"`, `"15"`
  - Examples: "8"

- **`shot_type`** (`string`, _optional_):
  The type of multi-shot video generation. Default value: `"customize"`
  - Default: `"customize"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video frame. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "prompt": "@Element1 and @Element2 enters the scene from two sides. Elephant starts to play with the ball",
  "multi_prompt": null,
  "start_image_url": "https://v3b.fal.media/files/b/0a8d1b38/myilPNN_WYdJCmpTy4Sjr_6XNBi9Mm.png",
  "elements": [
    {
      "reference_image_urls": [
        "https://v3b.fal.media/files/b/0a8d1b1a/eZfSbcQ58EzD_l2SEbevg_F3U9GMLK.png"
      ],
      "frontal_image_url": "https://v3b.fal.media/files/b/0a8d1b2e/yiHiZP1Now0V5JC5_OClE_PaKOtOGJ.png"
    },
    {
      "reference_image_urls": [
        "https://v3b.fal.media/files/b/0a8d1b3c/_ZE2iIjkb-Eun3WXXGP4x_TSG1ELBo.png"
      ],
      "frontal_image_url": "https://v3b.fal.media/files/b/0a8d1b19/_eIj7GjmI5zgQkMN936YJ_2f3hZ7Xb.png"
    }
  ],
  "duration": "8",
  "shot_type": "customize",
  "aspect_ratio": "16:9"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.
  - Examples: {"content_type":"video/mp4","file_size":18468404,"url":"https://v3b.fal.media/files/b/0a8d1c8a/ZxdKrvPb3CQEmeuS-u_kU_output.mp4","file_name":"output.mp4"}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "file_size": 18468404,
    "url": "https://v3b.fal.media/files/b/0a8d1c8a/ZxdKrvPb3CQEmeuS-u_kU_output.mp4",
    "file_name": "output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/o3/pro/reference-to-video \
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
    "fal-ai/kling-video/o3/pro/reference-to-video",
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

const result = await fal.subscribe("fal-ai/kling-video/o3/pro/reference-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/o3/pro/reference-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/o3/pro/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/o3/pro/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

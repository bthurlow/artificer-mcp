# Kling Video

> Kling's Native 4K is a video generation model that directly outputs professional-grade 4K video in one step, eliminating the need for post-production upscaling


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/o3/4k/reference-to-video`
- **Model ID**: `fal-ai/kling-video/o3/4k/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

For every second of video you generated, you will be charged **$0.42** regardless of whether audio is on or off. For example, a **5s** video will cost **$2.10**.

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
  - Examples: "https://v3b.fal.media/files/b/rabbit/NaslJIC7F2WodS6DFZRRJ.png"

- **`end_image_url`** (`string`, _optional_):
  Image to use as the last frame of the video.
  - Examples: "https://v3b.fal.media/files/b/tiger/BwHi22qoQnqaTNMMhe533.png"

- **`image_urls`** (`list<string>`, _optional_):
  Reference images for style/appearance. Reference in prompt as @Image1, @Image2, etc. Maximum 7 total (elements + reference images) is allowed.
  - Array of string
  - Examples: null

- **`elements`** (`list<KlingV3ComboElementInput>`, _optional_):
  Elements (characters/objects) to include. Reference in prompt as @Element1, @Element2.
  - Array of KlingV3ComboElementInput
  - Examples: null

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
  "start_image_url": "https://v3b.fal.media/files/b/rabbit/NaslJIC7F2WodS6DFZRRJ.png",
  "end_image_url": "https://v3b.fal.media/files/b/tiger/BwHi22qoQnqaTNMMhe533.png",
  "image_urls": null,
  "elements": null,
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
  --url https://fal.run/fal-ai/kling-video/o3/4k/reference-to-video \
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
    "fal-ai/kling-video/o3/4k/reference-to-video",
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

const result = await fal.subscribe("fal-ai/kling-video/o3/4k/reference-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/o3/4k/reference-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/o3/4k/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/o3/4k/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Kling O3 Reference to Video [Standard]

> Transform images, elements, and text into consistent, high-quality video scenes, ensuring stable character identity, object details, and environments.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/o3/standard/reference-to-video`
- **Model ID**: `fal-ai/kling-video/o3/standard/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: reference-to-video, 



## Pricing

For every second of video you generated, you will be charged $0.084 (audio off) or $0.112 (audio on). For example, a 5s video with audio on will cost $0.56.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Text prompt for video generation. Either prompt or multi_prompt must be provided, but not both.
  - Examples: "@Element1 and @Element2 is having dinner at this table on @Image1"

- **`multi_prompt`** (`list<KlingV3MultiPromptElement>`, _optional_):
  List of prompts for multi-shot video generation.
  - Array of KlingV3MultiPromptElement
  - Examples: null

- **`start_image_url`** (`string`, _optional_):
  Image to use as the first frame of the video.
  - Examples: "https://v3b.fal.media/files/b/0a8d1b63/EcYdmuNB1LTFjtn3Ryjrf_6ROoQV4u.png"

- **`end_image_url`** (`string`, _optional_):
  Image to use as the last frame of the video.

- **`image_urls`** (`list<string>`, _optional_):
  Reference images for style/appearance. Reference in prompt as @Image1, @Image2, etc. Maximum 4 total (elements + reference images) when using video.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8d1b63/EcYdmuNB1LTFjtn3Ryjrf_6ROoQV4u.png"]

- **`elements`** (`list<KlingV3ComboElementInput>`, _optional_):
  Elements (characters/objects) to include. Reference in prompt as @Element1, @Element2.
  - Array of KlingV3ComboElementInput
  - Examples: [{"reference_image_urls":["https://v3b.fal.media/files/b/0a8d1b5e/Gl1qUHJeTG63vAGtQmGM-_S3kPW32v.png"],"frontal_image_url":"https://v3b.fal.media/files/b/0a8d1b64/-ddhNV-utVpHj_1uGfuY-_i6viYke3.png"},{"reference_image_urls":["https://v3b.fal.media/files/b/0a8d1b60/Dt21s8LElZdSccIGDC7ec_Nuaraa9P.png"],"frontal_image_url":"https://v3b.fal.media/files/b/0a8d1b66/cWe8LC84I_OF6ee9ZtnsO_nY9Hw5UB.png"}]

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
  "prompt": "@Element1 and @Element2 is having dinner at this table on @Image1",
  "multi_prompt": null,
  "start_image_url": "https://v3b.fal.media/files/b/0a8d1b63/EcYdmuNB1LTFjtn3Ryjrf_6ROoQV4u.png",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8d1b63/EcYdmuNB1LTFjtn3Ryjrf_6ROoQV4u.png"
  ],
  "elements": [
    {
      "reference_image_urls": [
        "https://v3b.fal.media/files/b/0a8d1b5e/Gl1qUHJeTG63vAGtQmGM-_S3kPW32v.png"
      ],
      "frontal_image_url": "https://v3b.fal.media/files/b/0a8d1b64/-ddhNV-utVpHj_1uGfuY-_i6viYke3.png"
    },
    {
      "reference_image_urls": [
        "https://v3b.fal.media/files/b/0a8d1b60/Dt21s8LElZdSccIGDC7ec_Nuaraa9P.png"
      ],
      "frontal_image_url": "https://v3b.fal.media/files/b/0a8d1b66/cWe8LC84I_OF6ee9ZtnsO_nY9Hw5UB.png"
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
  - Examples: {"content_type":"video/mp4","file_size":3192162,"url":"https://v3b.fal.media/files/b/0a8d200d/ejCxI5DalzOPlP4yf6uP3_output.mp4","file_name":"output.mp4"}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "file_size": 3192162,
    "url": "https://v3b.fal.media/files/b/0a8d200d/ejCxI5DalzOPlP4yf6uP3_output.mp4",
    "file_name": "output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/o3/standard/reference-to-video \
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
    "fal-ai/kling-video/o3/standard/reference-to-video",
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

const result = await fal.subscribe("fal-ai/kling-video/o3/standard/reference-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/o3/standard/reference-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/o3/standard/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/o3/standard/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Happy Horse

> Generate 1080p video with synchronized native audio from a text prompt and references. Aspect ratios: 16:9, 9:16, 1:1, 4:3, 3:4. Duration: 3–15s.


## Overview

- **Endpoint**: `https://fal.run/alibaba/happy-horse/reference-to-video`
- **Model ID**: `alibaba/happy-horse/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

For every second of 720p video you generated, you will be charged **$0.14/second**.  For 1080p video you will be charged **$0.28/second**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the desired video. Reference subjects from your images using ``character1``, ``character2``, ... up to ``character9`` (the order matches the order of ``image_urls``). Max 2500 characters.
  - Examples: "A dance battle between character1 and character2, cinematic lighting, smooth camera movement."

- **`image_urls`** (`list<string>`, _required_):
  Reference images for subject consistency (1-9 images). Formats: JPEG, JPG, PNG, WEBP. Shortest side must be at least 400 px (720P or higher recommended). Max 10 MB each.
  - Array of string
  - Examples: ["https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png"]

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output video resolution tier. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Output video duration in seconds (3-15). Default value: `"5"`
  - Default: `5`
  - Options: `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15`
  - Examples: 5, 10, 15

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility (0-2147483647).

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A dance battle between character1 and character2, cinematic lighting, smooth camera movement.",
  "image_urls": [
    "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "A dance battle between character1 and character2, cinematic lighting, smooth camera movement.",
  "image_urls": [
    "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png"
  ],
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
  --url https://fal.run/alibaba/happy-horse/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A dance battle between character1 and character2, cinematic lighting, smooth camera movement.",
     "image_urls": [
       "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png"
     ]
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
    "alibaba/happy-horse/reference-to-video",
    arguments={
        "prompt": "A dance battle between character1 and character2, cinematic lighting, smooth camera movement.",
        "image_urls": ["https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png"]
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

const result = await fal.subscribe("alibaba/happy-horse/reference-to-video", {
  input: {
    prompt: "A dance battle between character1 and character2, cinematic lighting, smooth camera movement.",
    image_urls: ["https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/wpimhv/rap.png"]
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

- [Model Playground](https://fal.ai/models/alibaba/happy-horse/reference-to-video)
- [API Documentation](https://fal.ai/models/alibaba/happy-horse/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=alibaba/happy-horse/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

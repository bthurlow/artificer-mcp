# Grok Imagine Video

> Generate videos with audio from text using Grok Imagine Video.


## Overview

- **Endpoint**: `https://fal.run/xai/grok-imagine-video/text-to-video`
- **Model ID**: `xai/grok-imagine-video/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: xai, grok, t2v, text-to-video



## Pricing

For 6s 480p video your request will cost **$0.3**. At an output resolution of 480p, every second costs **$0.05**, and at 720p, every second costs **$0.07**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text description of the desired video.
  - Examples: "Anime schoolgirl bursting out of house door, cherry blossoms blowing, morning light, speed lines indicating rush, chibi-ready expressions, classic shojo aesthetic, vibrant colors"

- **`duration`** (`integer`, _optional_):
  Video duration in seconds. Default value: `6`
  - Default: `6`
  - Range: `1` to `15`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"4:3"`, `"3:2"`, `"1:1"`, `"2:3"`, `"3:4"`, `"9:16"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the output video. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`



**Required Parameters Example**:

```json
{
  "prompt": "Anime schoolgirl bursting out of house door, cherry blossoms blowing, morning light, speed lines indicating rush, chibi-ready expressions, classic shojo aesthetic, vibrant colors"
}
```

**Full Example**:

```json
{
  "prompt": "Anime schoolgirl bursting out of house door, cherry blossoms blowing, morning light, speed lines indicating rush, chibi-ready expressions, classic shojo aesthetic, vibrant colors",
  "duration": 6,
  "aspect_ratio": "16:9",
  "resolution": "720p"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video.
  - Examples: {"height":720,"content_type":"video/mp4","width":1280,"url":"https://v3b.fal.media/files/b/0a8b90e4/RUAbFYlssdqnbjNLmE8qP_IX7BNYGP.mp4","fps":24,"num_frames":145,"duration":6.041667,"file_name":"RUAbFYlssdqnbjNLmE8qP_IX7BNYGP.mp4"}



**Example Response**:

```json
{
  "video": {
    "height": 720,
    "content_type": "video/mp4",
    "width": 1280,
    "url": "https://v3b.fal.media/files/b/0a8b90e4/RUAbFYlssdqnbjNLmE8qP_IX7BNYGP.mp4",
    "fps": 24,
    "num_frames": 145,
    "duration": 6.041667,
    "file_name": "RUAbFYlssdqnbjNLmE8qP_IX7BNYGP.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/xai/grok-imagine-video/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Anime schoolgirl bursting out of house door, cherry blossoms blowing, morning light, speed lines indicating rush, chibi-ready expressions, classic shojo aesthetic, vibrant colors"
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
    "xai/grok-imagine-video/text-to-video",
    arguments={
        "prompt": "Anime schoolgirl bursting out of house door, cherry blossoms blowing, morning light, speed lines indicating rush, chibi-ready expressions, classic shojo aesthetic, vibrant colors"
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

const result = await fal.subscribe("xai/grok-imagine-video/text-to-video", {
  input: {
    prompt: "Anime schoolgirl bursting out of house door, cherry blossoms blowing, morning light, speed lines indicating rush, chibi-ready expressions, classic shojo aesthetic, vibrant colors"
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

- [Model Playground](https://fal.ai/models/xai/grok-imagine-video/text-to-video)
- [API Documentation](https://fal.ai/models/xai/grok-imagine-video/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=xai/grok-imagine-video/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

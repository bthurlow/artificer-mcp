# Bria's VRMBG 3.0

> Remove backgrounds from any video with Bria's VRMBG 3.0. Fast, accurate background removal across talking heads, podcasts, product videos, commercials, and cinematic footage.


## Overview

- **Endpoint**: `https://fal.run/bria/video/background-removal/v3`
- **Model ID**: `bria/video/background-removal/v3`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: video-to-video, 



## Pricing

Your request will cost **$0.05** per second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`output_container_and_codec`** (`OutputContainerAndCodecEnum`, _optional_):
  Output container and codec. Options: mp4_h265, mp4_h264, webm_vp9, mov_h265, mov_proresks, mkv_h265, mkv_h264, mkv_vp9, gif. Default value: `"webm_vp9"`
  - Default: `"webm_vp9"`
  - Options: `"mp4_h265"`, `"mp4_h264"`, `"webm_vp9"`, `"mov_h265"`, `"mov_proresks"`, `"mkv_h265"`, `"mkv_h264"`, `"mkv_vp9"`, `"gif"`

- **`preserve_audio`** (`boolean`, _optional_):
  If true, audio will be preserved in the output video. Default value: `true`
  - Default: `true`

- **`video_url`** (`string`, _required_):
  Input video to remove background from.
  - Examples: "https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video.mp4"

- **`background_color`** (`BackgroundColorEnum`, _optional_):
  Background color. Options: Transparent, Black, White, Gray, Red, Green, Blue, Yellow, Cyan, Magenta, Orange. Default value: `"Black"`
  - Default: `"Black"`
  - Options: `"Transparent"`, `"Black"`, `"White"`, `"Gray"`, `"Red"`, `"Green"`, `"Blue"`, `"Yellow"`, `"Cyan"`, `"Magenta"`, `"Orange"`

- **`auto_zoom`** (`boolean`, _optional_):
  If true, crop the output to the smallest rectangle the subject stays inside for the whole video.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video.mp4"
}
```

**Full Example**:

```json
{
  "output_container_and_codec": "webm_vp9",
  "preserve_audio": true,
  "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video.mp4",
  "background_color": "Black"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`Video`, _required_):
  Video with removed background and audio.
  - Examples: {"url":"https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video_output.webm","file_size":1953161,"file_name":"video_output.webm","content_type":"video/webm"}

- **`request_id`** (`string`, _required_):
  Bria request ID.

- **`warning`** (`string`, _optional_):
  Set when the request was served with an adjusted parameter, e.g. a transparent background falling back to black on a codec that cannot carry alpha.



**Example Response**:

```json
{
  "video": {
    "url": "https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video_output.webm",
    "file_size": 1953161,
    "file_name": "video_output.webm",
    "content_type": "video/webm"
  },
  "request_id": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/video/background-removal/v3 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video.mp4"
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
    "bria/video/background-removal/v3",
    arguments={
        "video_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video.mp4"
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

const result = await fal.subscribe("bria/video/background-removal/v3", {
  input: {
    video_url: "https://bria-datasets.s3.us-east-1.amazonaws.com/rmbg_tests/videos/video.mp4"
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

- [Model Playground](https://fal.ai/models/bria/video/background-removal/v3)
- [API Documentation](https://fal.ai/models/bria/video/background-removal/v3/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/video/background-removal/v3)

### fal.ai Platform

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

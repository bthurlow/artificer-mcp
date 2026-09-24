# Pixelcut Video Background Removal

> Pixelcut's Video Background Remover is an AI segmentation model that erases backgrounds frame by frame, with seamless temporal consistency.


## Overview

- **Endpoint**: `https://fal.run/pixelcut/video-background-removal`
- **Model ID**: `pixelcut/video-background-removal`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: transform, utility, rembg



## Pricing

Your request will cost **$0.022** per **30** frames.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the input video
  - Examples: "https://cdn3.pixelcut.app/fal/video-background-removal/sample.mp4"

- **`background`** (`BackgroundEnum`, _optional_):
  Output background: transparent, a named preset color, or 'custom' to use the background_color color picker. Default value: `"transparent"`
  - Default: `"transparent"`
  - Options: `"transparent"`, `"black"`, `"white"`, `"green"`, `"blue"`, `"magenta"`, `"custom"`

- **`background_color`** (`RGBColor`, _optional_):
  Custom solid background color (only used when background='custom').

- **`output_format`** (`Enum`, _optional_):
  Output video format. Auto-detected if not set (defaults to webm_vp9 for transparent).
  - Options: `"webm_vp9"`, `"mp4_h264"`, `"mp4_h265"`, `"mov_proresks"`, `"mov_h265"`, `"mkv_h264"`, `"mkv_h265"`, `"mkv_vp9"`, `"gif"`



**Required Parameters Example**:

```json
{
  "video_url": "https://cdn3.pixelcut.app/fal/video-background-removal/sample.mp4"
}
```

**Full Example**:

```json
{
  "video_url": "https://cdn3.pixelcut.app/fal/video-background-removal/sample.mp4",
  "background": "transparent"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`Video`, _required_):
  Output video file
  - Examples: {"content_type":"video/webm","file_name":"sample_result.webm","url":"https://cdn3.pixelcut.app/fal/video-background-removal/sample_result.webm","file_size":5489205}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/webm",
    "file_name": "sample_result.webm",
    "url": "https://cdn3.pixelcut.app/fal/video-background-removal/sample_result.webm",
    "file_size": 5489205
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/pixelcut/video-background-removal \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://cdn3.pixelcut.app/fal/video-background-removal/sample.mp4"
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
    "pixelcut/video-background-removal",
    arguments={
        "video_url": "https://cdn3.pixelcut.app/fal/video-background-removal/sample.mp4"
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

const result = await fal.subscribe("pixelcut/video-background-removal", {
  input: {
    video_url: "https://cdn3.pixelcut.app/fal/video-background-removal/sample.mp4"
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

- [Model Playground](https://fal.ai/models/pixelcut/video-background-removal)
- [API Documentation](https://fal.ai/models/pixelcut/video-background-removal/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=pixelcut/video-background-removal)

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

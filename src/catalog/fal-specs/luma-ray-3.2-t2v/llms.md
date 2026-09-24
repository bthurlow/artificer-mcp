# Luma Ray 3.2 Text to Video

> Luma Ray 3.2 generates cinematic video from a text prompt, with control over resolution, duration, and seamless looping, plus reference images to lock in subject and style.


## Overview

- **Endpoint**: `https://fal.run/luma/agent/ray/v3.2/text-to-video`
- **Model ID**: `luma/agent/ray/v3.2/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

For **5s** video your request will cost **$0.50** for **540p**, **$1** for **720p** and **$2** for **1080p**. For **10s**, **$1** at **540p**, **$2** at **720p** and **$4** at **1080p**. For **$1** you can run this model approximately **2** times (**540p/5s**).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the video to generate.
  - Examples: "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; wide tracking shot."

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"3:4"`, `"4:3"`, `"1:1"`, `"9:16"`, `"16:9"`, `"21:9"`
  - Examples: "16:9"

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video. Higher resolutions cost more. Default value: `"540p"`
  - Default: `"540p"`
  - Options: `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the generated video. Default value: `"5s"`
  - Default: `"5s"`
  - Options: `"5s"`, `"10s"`

- **`loop`** (`boolean`, _optional_):
  Generate a seamless loop. Only valid for 5s, standard-dynamic-range generations without an end frame.
  - Default: `false`

- **`hdr`** (`boolean`, _optional_):
  Generate an HDR-encoded MP4. Requires HDR access on the account and a resolution of 720p or 1080p; not supported with 10s or loop.
  - Default: `false`

- **`exr_export`** (`boolean`, _optional_):
  Also export an EXR file alongside the MP4. Requires hdr=true and HDR access.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; wide tracking shot."
}
```

**Full Example**:

```json
{
  "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; wide tracking shot.",
  "aspect_ratio": "16:9",
  "resolution": "540p",
  "duration": "5s"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.

- **`exr_file`** (`File`, _optional_):
  The generated EXR sidecar when exr_export is true. This may be a single EXR file or a ZIP package depending on Luma's export shape.



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
  --url https://fal.run/luma/agent/ray/v3.2/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; wide tracking shot."
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
    "luma/agent/ray/v3.2/text-to-video",
    arguments={
        "prompt": "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; wide tracking shot."
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

const result = await fal.subscribe("luma/agent/ray/v3.2/text-to-video", {
  input: {
    prompt: "A herd of wild horses galloping across a dusty desert plain under a blazing midday sun, their manes flying in the wind; wide tracking shot."
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

- [Model Playground](https://fal.ai/models/luma/agent/ray/v3.2/text-to-video)
- [API Documentation](https://fal.ai/models/luma/agent/ray/v3.2/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=luma/agent/ray/v3.2/text-to-video)

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

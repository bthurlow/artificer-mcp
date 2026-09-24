# Gemini Omni Flash 1.1 Reference to Video

> Gemini Omni Flash 1.1 is Google's multimodal video model. This endpoint generates video from combined multimodal references, images, videos and text together. Reasoning across all inputs to produce a single coherent result, with characters retaining their face, clothing, and voice throughout


## Overview

- **Endpoint**: `https://fal.run/google/gemini-omni-flash/v1.1/reference-to-video`
- **Model ID**: `google/gemini-omni-flash/v1.1/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Billing is calculated per second of output video, by resolution. For **360p**, your request will cost **$0.03** per second; for **720p**, **$0.10** per second; for **1080p**, **$0.15** per second; and for **4K**, **$0.30** per second. A 10-second **1080p** clip costs **$1.50**, while the same clip at **360p** costs **$0.30**. 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the video. Reference media is sent in list order before the prompt.
  - Examples: "A cat inspired by <IMAGE_REF_0> walks through the setting in <VIDEO_REF_0>."

- **`image_urls`** (`list<string>`, _optional_):
  URLs of reference images to incorporate into the video.
  - Array of string

- **`reference_video_urls`** (`list<string>`, _optional_):
  URLs of up to three reference videos. Each video must be at most three seconds long.
  - Array of string

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"360p"`, `"720p"`, `"1080p"`, `"4k"`

- **`duration`** (`integer`, _optional_):
  The duration of the generated video, in seconds. Default value: `8`
  - Default: `8`
  - Range: `3` to `10`



**Required Parameters Example**:

```json
{
  "prompt": "A cat inspired by <IMAGE_REF_0> walks through the setting in <VIDEO_REF_0>."
}
```

**Full Example**:

```json
{
  "prompt": "A cat inspired by <IMAGE_REF_0> walks through the setting in <VIDEO_REF_0>.",
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "duration": 8
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.



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
  --url https://fal.run/google/gemini-omni-flash/v1.1/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A cat inspired by <IMAGE_REF_0> walks through the setting in <VIDEO_REF_0>."
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
    "google/gemini-omni-flash/v1.1/reference-to-video",
    arguments={
        "prompt": "A cat inspired by <IMAGE_REF_0> walks through the setting in <VIDEO_REF_0>."
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

const result = await fal.subscribe("google/gemini-omni-flash/v1.1/reference-to-video", {
  input: {
    prompt: "A cat inspired by <IMAGE_REF_0> walks through the setting in <VIDEO_REF_0>."
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

- [Model Playground](https://fal.ai/models/google/gemini-omni-flash/v1.1/reference-to-video)
- [API Documentation](https://fal.ai/models/google/gemini-omni-flash/v1.1/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=google/gemini-omni-flash/v1.1/reference-to-video)

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

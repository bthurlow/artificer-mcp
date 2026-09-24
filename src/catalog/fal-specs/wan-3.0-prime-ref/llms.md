# Wan 3.0 Prime

> Wan 3.0 Prime Reference-to-Video combines reference images, videos, and audio into a unified video with fast generation and strong multimodal coherence. It follows character identity, visual style, movement, and sound cues across references to create controlled, consistent, and production-ready results.


## Overview

- **Endpoint**: `https://fal.run/alibaba/wan-3.0-prime/reference-to-video`
- **Model ID**: `alibaba/wan-3.0-prime/reference-to-video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: reference, video



## Pricing

For every second of video you generate, you will be charged **$0.068** at **480p**, **$0.14** at **720p**, or **$0.28** at **1080p**. For example, a **5s** video at **720p** will cost **$0.70**. **Pricing is subject to change.**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Text prompt directing how the reference media is used. Reference media can be addressed positionally, e.g. 'the subject in Image 1 walks past Video 1'.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output video resolution tier. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"480p"`, `"720p"`, `"1080p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Output aspect ratio, or adaptive selection. Default value: `"adaptive"`
  - Default: `"adaptive"`
  - Options: `"adaptive"`, `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`

- **`duration`** (`integer`, _optional_):
  Output duration in seconds. Set to null for smart duration, which lets the model pick a length from the prompt and reference media. Default value: `5`
  - Default: `5`
  - Range: `2` to `30`

- **`audio`** (`boolean`, _optional_):
  Include generated audio. Default value: `true`
  - Default: `true`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Enable intelligent prompt rewriting. Disabling it can save roughly 20-60 seconds of latency but is likely to degrade generation quality. Default value: `true`
  - Default: `true`

- **`enable_thinking`** (`boolean`, _optional_):
  Enable enhanced reasoning before generation.
  - Default: `false`

- **`seed`** (`integer`, _optional_)
  - Range: `0` to `2147483647`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`

- **`reference_image_urls`** (`list<string>`, _optional_):
  Up to 10 reference image URLs.
  - Array of string

- **`reference_video_urls`** (`list<string>`, _optional_):
  Up to 5 reference video URLs totaling at most 15 seconds. Each clip must be at least 16 fps.
  - Array of string

- **`reference_audio_urls`** (`list<string>`, _optional_):
  Up to 5 reference audio URLs totaling at most 15 seconds.
  - Array of string

- **`file_url`** (`string`, _optional_):
  Document URL to base the video on. Requires enable_thinking=true.

- **`web_url`** (`string`, _optional_):
  Public webpage URL to base the video on. Requires enable_thinking=true. Only pages that do not require login can be read.



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "resolution": "1080p",
  "aspect_ratio": "adaptive",
  "duration": 5,
  "audio": true,
  "enable_prompt_expansion": true,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file.

- **`seed`** (`integer`, _required_):
  The seed used for generation.

- **`duration`** (`float`, _required_):
  Generated video duration in seconds.

- **`actual_prompt`** (`string`, _optional_)



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
  --url https://fal.run/alibaba/wan-3.0-prime/reference-to-video \
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
    "alibaba/wan-3.0-prime/reference-to-video",
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

const result = await fal.subscribe("alibaba/wan-3.0-prime/reference-to-video", {
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

- [Model Playground](https://fal.ai/models/alibaba/wan-3.0-prime/reference-to-video)
- [API Documentation](https://fal.ai/models/alibaba/wan-3.0-prime/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=alibaba/wan-3.0-prime/reference-to-video)

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

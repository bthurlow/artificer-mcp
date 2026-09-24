# Flux Video Upscale

> Upscale videos to 1080p, 2K, or 4K via API. FLUX 3 powered super-resolution with a precise mode and a creative detail-enhancement mode.


## Overview

- **Endpoint**: `https://fal.run/blackforestlabs/flux-video-upscale`
- **Model ID**: `blackforestlabs/flux-video-upscale`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: utility, editing, upscale, video-upscaling, 



## Pricing

Billing is calculated per second of output video, by resolution and mode. In precise mode, **1080p** costs **$0.14** per second, **2K** costs **$0.25** per second, and **4K** costs **$0.55** per second. Creative mode costs more at each tier: **$0.20**, **$0.35**, and **$0.79** per second respectively. A **10-second** **1080p** clip runs **$1.40** in precise mode or **$2.00** in creative mode. You are charged for the delivered output only.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`video_url`** (`string`, _required_):
  URL of the MP4 video to upscale. The video must be at most 20 seconds and 50 MB.
  - Examples: "https://v3b.fal.media/files/b/0a93a27d/-iFpecUCsSdwXVMevsZa3_output_5s_448x256.mp4"

- **`upscale_factor`** (`float`, _optional_):
  Output scaling factor. The source aspect ratio is preserved. Default value: `2`
  - Default: `2`
  - Range: `1.5` to `3`

- **`creativity`** (`CreativityEnum`, _optional_):
  Use 0 for a source-faithful upscale or 1 for creative detail enhancement. Default value: `"1"`
  - Default: `1`
  - Options: `0`, `1`

- **`prompt`** (`string`, _optional_):
  Optional description used to guide creative detail enhancement.

- **`safety_tolerance`** (`integer`, _optional_):
  Moderation strictness. Lower values are stricter. Default value: `2`
  - Default: `2`
  - Range: `0` to `4`



**Required Parameters Example**:

```json
{
  "video_url": "https://v3b.fal.media/files/b/0a93a27d/-iFpecUCsSdwXVMevsZa3_output_5s_448x256.mp4"
}
```

**Full Example**:

```json
{
  "video_url": "https://v3b.fal.media/files/b/0a93a27d/-iFpecUCsSdwXVMevsZa3_output_5s_448x256.mp4",
  "upscale_factor": 2,
  "creativity": 1,
  "safety_tolerance": 2
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The upscaled MP4 video.



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
  --url https://fal.run/blackforestlabs/flux-video-upscale \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "video_url": "https://v3b.fal.media/files/b/0a93a27d/-iFpecUCsSdwXVMevsZa3_output_5s_448x256.mp4"
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
    "blackforestlabs/flux-video-upscale",
    arguments={
        "video_url": "https://v3b.fal.media/files/b/0a93a27d/-iFpecUCsSdwXVMevsZa3_output_5s_448x256.mp4"
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

const result = await fal.subscribe("blackforestlabs/flux-video-upscale", {
  input: {
    video_url: "https://v3b.fal.media/files/b/0a93a27d/-iFpecUCsSdwXVMevsZa3_output_5s_448x256.mp4"
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

- [Model Playground](https://fal.ai/models/blackforestlabs/flux-video-upscale)
- [API Documentation](https://fal.ai/models/blackforestlabs/flux-video-upscale/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=blackforestlabs/flux-video-upscale)

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

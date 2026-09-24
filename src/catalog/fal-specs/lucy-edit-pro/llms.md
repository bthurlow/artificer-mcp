# Lucy Edit [Pro]

> Edit outfits, objects, faces, or restyle your video - all with maximum detail retention.


## Overview

- **Endpoint**: `https://fal.run/decart/lucy-edit/pro`
- **Model ID**: `decart/lucy-edit/pro`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: video-edit



## Pricing

Your request will cost **$0.15** per video second for 720p, **$0.10** per video second for 480p.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text description of the desired video content
  - Examples: "Transform the woman's outfit into a regal medieval gown with flowing velvet fabric, intricate gold embroidery, and a jeweled crown, giving her the appearance of a queen."

- **`video_url`** (`string`, _required_):
  URL of the video to edit
  - Examples: "https://v3.fal.media/files/monkey/GI7ArkqpQVk3M6V1C_epr_original.mp4"

- **`sync_mode`** (`boolean`, _optional_):
  If set to true, the function will wait for the video to be generated
  and uploaded before returning the response. This will increase the
  latency of the function but it allows you to get the video directly
  in the response without going through the CDN. Default value: `true`
  - Default: `true`

- **`enhance_prompt`** (`boolean`, _optional_):
  Whether to enhance the prompt for better results. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Seed for video generation. If not provided, a random seed will be used.

- **`resolution`** (`string`, _optional_):
  Resolution of the generated video Default value: `"720p"`
  - Default: `"720p"`



**Required Parameters Example**:

```json
{
  "prompt": "Transform the woman's outfit into a regal medieval gown with flowing velvet fabric, intricate gold embroidery, and a jeweled crown, giving her the appearance of a queen.",
  "video_url": "https://v3.fal.media/files/monkey/GI7ArkqpQVk3M6V1C_epr_original.mp4"
}
```

**Full Example**:

```json
{
  "prompt": "Transform the woman's outfit into a regal medieval gown with flowing velvet fabric, intricate gold embroidery, and a jeweled crown, giving her the appearance of a queen.",
  "video_url": "https://v3.fal.media/files/monkey/GI7ArkqpQVk3M6V1C_epr_original.mp4",
  "sync_mode": true,
  "enhance_prompt": true,
  "resolution": "720p"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"file_size":687298,"file_name":"generated_video.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/lion/j1BSX8UnGbBZeJXqSWg2E_generated_video.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_size": 687298,
    "file_name": "generated_video.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/lion/j1BSX8UnGbBZeJXqSWg2E_generated_video.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/decart/lucy-edit/pro \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Transform the woman's outfit into a regal medieval gown with flowing velvet fabric, intricate gold embroidery, and a jeweled crown, giving her the appearance of a queen.",
     "video_url": "https://v3.fal.media/files/monkey/GI7ArkqpQVk3M6V1C_epr_original.mp4"
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
    "decart/lucy-edit/pro",
    arguments={
        "prompt": "Transform the woman's outfit into a regal medieval gown with flowing velvet fabric, intricate gold embroidery, and a jeweled crown, giving her the appearance of a queen.",
        "video_url": "https://v3.fal.media/files/monkey/GI7ArkqpQVk3M6V1C_epr_original.mp4"
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

const result = await fal.subscribe("decart/lucy-edit/pro", {
  input: {
    prompt: "Transform the woman's outfit into a regal medieval gown with flowing velvet fabric, intricate gold embroidery, and a jeweled crown, giving her the appearance of a queen.",
    video_url: "https://v3.fal.media/files/monkey/GI7ArkqpQVk3M6V1C_epr_original.mp4"
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

- [Model Playground](https://fal.ai/models/decart/lucy-edit/pro)
- [API Documentation](https://fal.ai/models/decart/lucy-edit/pro/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=decart/lucy-edit/pro)

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

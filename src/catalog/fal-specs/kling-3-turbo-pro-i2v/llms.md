# Kling Video V3 Turbo Pro Image to Video

> Generate high quality 1080p videos from images using Kling's Turbo 3.0 model, with improved lipsync and multishot generation capabilities.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v3/turbo/pro/image-to-video`
- **Model ID**: `fal-ai/kling-video/v3/turbo/pro/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: kling, v3, turbo, 1080p



## Pricing

For every second of video you generate, you will be charged **$0.14**. For example, a **5s** video will cost **$0.70**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Optional text prompt. For best results keep the prompt under 2500 characters. Mutually exclusive with `multi_prompt`.
  - Examples: "The dappled light shifts gently across her face as leaves sway, a strand of hair drifts, she softly smiles and looks to the lens. The camera holds close. Photorealistic, fresh, intimate."

- **`multi_prompt`** (`list<KlingV3MultiPromptElement>`, _optional_):
  Multi-shot storyboard (1-6 shots). Each shot has its own prompt and duration; the total duration must not exceed 15s. Mutually exclusive with `prompt`.
  - Array of KlingV3MultiPromptElement
  - Examples: null

- **`image_url`** (`string`, _required_):
  First-frame reference image. Formats: .jpg/.jpeg/.png; max 50MB; min 300px per side; aspect ratio within 1:2.5 to 2.5:1.
  - Examples: "https://v3b.fal.media/files/b/0a9ea0aa/R_9HxGaCuonczhLfscQnM_579d59f2510345ad956fd95dba2c43b6.png"

- **`duration`** (`DurationEnum`, _optional_):
  Video length in seconds. Default value: `"5"`
  - Default: `"5"`
  - Options: `"3"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, `"13"`, `"14"`, `"15"`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a9ea0aa/R_9HxGaCuonczhLfscQnM_579d59f2510345ad956fd95dba2c43b6.png"
}
```

**Full Example**:

```json
{
  "prompt": "The dappled light shifts gently across her face as leaves sway, a strand of hair drifts, she softly smiles and looks to the lens. The camera holds close. Photorealistic, fresh, intimate.",
  "multi_prompt": null,
  "image_url": "https://v3b.fal.media/files/b/0a9ea0aa/R_9HxGaCuonczhLfscQnM_579d59f2510345ad956fd95dba2c43b6.png",
  "duration": "5"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"file_size":8390943,"file_name":"output.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a9ea0cc/u66I5Q5EHikrGF39EEk8t_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_size": 8390943,
    "file_name": "output.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a9ea0cc/u66I5Q5EHikrGF39EEk8t_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v3/turbo/pro/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3b.fal.media/files/b/0a9ea0aa/R_9HxGaCuonczhLfscQnM_579d59f2510345ad956fd95dba2c43b6.png"
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
    "fal-ai/kling-video/v3/turbo/pro/image-to-video",
    arguments={
        "image_url": "https://v3b.fal.media/files/b/0a9ea0aa/R_9HxGaCuonczhLfscQnM_579d59f2510345ad956fd95dba2c43b6.png"
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

const result = await fal.subscribe("fal-ai/kling-video/v3/turbo/pro/image-to-video", {
  input: {
    image_url: "https://v3b.fal.media/files/b/0a9ea0aa/R_9HxGaCuonczhLfscQnM_579d59f2510345ad956fd95dba2c43b6.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v3/turbo/pro/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v3/turbo/pro/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v3/turbo/pro/image-to-video)

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

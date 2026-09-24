# Kling Video V3 Turbo Pro Text to Video

> Generate high quality 1080p videos using Kling's Turbo 3.0 model, with improved lipsync and multishot generation capabilities.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v3/turbo/pro/text-to-video`
- **Model ID**: `fal-ai/kling-video/v3/turbo/pro/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: kling, v3, 1080p, turbo



## Pricing

For every second of video you generate, you will be charged **$0.14** . For example, a **5s** video will cost **$0.70**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Text prompt to generate the video with. For best results keep the prompt under 2500 characters. Mutually exclusive with `multi_prompt`.
  - Examples: "A jazz saxophonist sways gently into the note, cheeks pressing, sweat glistening, smoke drifting through the warm light. The camera eases in slowly. Photorealistic, soulful, moody."

- **`multi_prompt`** (`list<KlingV3MultiPromptElement>`, _optional_):
  Multi-shot storyboard (1-6 shots). Each shot has its own prompt and duration; the total duration must not exceed 15s. Mutually exclusive with `prompt`.
  - Array of KlingV3MultiPromptElement
  - Examples: null

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio (width:height) of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`duration`** (`DurationEnum`, _optional_):
  Video length in seconds. Default value: `"5"`
  - Default: `"5"`
  - Options: `"3"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, `"13"`, `"14"`, `"15"`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "prompt": "A jazz saxophonist sways gently into the note, cheeks pressing, sweat glistening, smoke drifting through the warm light. The camera eases in slowly. Photorealistic, soulful, moody.",
  "multi_prompt": null,
  "aspect_ratio": "16:9",
  "duration": "5"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"file_size":9274380,"file_name":"output.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a9ea0a1/Ayb-2fiZBthFQp-kLrw4M_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_size": 9274380,
    "file_name": "output.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a9ea0a1/Ayb-2fiZBthFQp-kLrw4M_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v3/turbo/pro/text-to-video \
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
    "fal-ai/kling-video/v3/turbo/pro/text-to-video",
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

const result = await fal.subscribe("fal-ai/kling-video/v3/turbo/pro/text-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v3/turbo/pro/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v3/turbo/pro/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v3/turbo/pro/text-to-video)

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

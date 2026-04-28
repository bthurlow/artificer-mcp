# Kling O3 Text to Video [Pro]

> Generate realistic videos using Kling O3 from Kling Team!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/o3/pro/text-to-video`
- **Model ID**: `fal-ai/kling-video/o3/pro/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video



## Pricing

For every second of video you generated, you will be charged **$0.112** (audio off) or **$0.14** (audio on). For example, a 5s video with audio on will cost **$0.70**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Text prompt for video generation. Required unless multi_prompt is provided.
  - Examples: "A mecha lands on the ground to save the city, and says \"I'm here\", in anime style"

- **`duration`** (`DurationEnum`, _optional_):
  Video duration in seconds (3-15s). Default value: `"5"`
  - Default: `"5"`
  - Options: `"3"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, `"13"`, `"14"`, `"15"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate native audio for the video.
  - Default: `false`

- **`multi_prompt`** (`list<KlingV3MultiPromptElement>`, _optional_):
  List of prompts for multi-shot video generation.
  - Array of KlingV3MultiPromptElement
  - Examples: null

- **`shot_type`** (`string`, _optional_):
  The type of multi-shot video generation. Default value: `"customize"`
  - Default: `"customize"`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "prompt": "A mecha lands on the ground to save the city, and says \"I'm here\", in anime style",
  "duration": "5",
  "aspect_ratio": "16:9",
  "multi_prompt": null,
  "shot_type": "customize"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.
  - Examples: {"content_type":"video/mp4","file_size":13096952,"url":"https://v3b.fal.media/files/b/0a8d04e2/idOb9V-Q9ujlggPSKqsfS_output.mp4","file_name":"output.mp4"}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "file_size": 13096952,
    "url": "https://v3b.fal.media/files/b/0a8d04e2/idOb9V-Q9ujlggPSKqsfS_output.mp4",
    "file_name": "output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/o3/pro/text-to-video \
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
    "fal-ai/kling-video/o3/pro/text-to-video",
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

const result = await fal.subscribe("fal-ai/kling-video/o3/pro/text-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/o3/pro/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/o3/pro/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/o3/pro/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

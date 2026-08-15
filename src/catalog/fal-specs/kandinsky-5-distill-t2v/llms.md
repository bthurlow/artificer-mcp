# Kandinsky5

> Kandinsky 5.0 Distilled is a lightweight diffusion model for fast, high-quality text-to-video generation.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kandinsky5/text-to-video/distill`
- **Model ID**: `fal-ai/kandinsky5/text-to-video/distill`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.05** for a **5-second video** and **$0.10** for a **10-second video**, regardless of resolution.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A dog in red hat"

- **`resolution`** (`string`, _optional_):
  Resolution of the generated video in W:H format. Will be calculated based on the aspect ratio(768x512, 512x512, 512x768). Default value: `"768x512"`
  - Default: `"768x512"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. One of (3:2, 1:1, 2:3). Default value: `"3:2"`
  - Default: `"3:2"`
  - Options: `"3:2"`, `"1:1"`, `"2:3"`

- **`duration`** (`DurationEnum`, _optional_):
  The length of the video to generate (5s or 10s) Default value: `"5s"`
  - Default: `"5s"`
  - Options: `"5s"`, `"10s"`
  - Examples: "5s", "10s"



**Required Parameters Example**:

```json
{
  "prompt": "A dog in red hat"
}
```

**Full Example**:

```json
{
  "prompt": "A dog in red hat",
  "resolution": "768x512",
  "aspect_ratio": "3:2",
  "duration": "5s"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _optional_):
  The generated video file.
  - Examples: {"file_name":"output.mp4","file_size":5797172,"content_type":"application/octet-stream","url":"https://v3b.fal.media/files/b/tiger/5d-CATfsfPrBaXAK38hy6_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "output.mp4",
    "file_size": 5797172,
    "content_type": "application/octet-stream",
    "url": "https://v3b.fal.media/files/b/tiger/5d-CATfsfPrBaXAK38hy6_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kandinsky5/text-to-video/distill \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A dog in red hat"
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
    "fal-ai/kandinsky5/text-to-video/distill",
    arguments={
        "prompt": "A dog in red hat"
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

const result = await fal.subscribe("fal-ai/kandinsky5/text-to-video/distill", {
  input: {
    prompt: "A dog in red hat"
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

- [Model Playground](https://fal.ai/models/fal-ai/kandinsky5/text-to-video/distill)
- [API Documentation](https://fal.ai/models/fal-ai/kandinsky5/text-to-video/distill/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kandinsky5/text-to-video/distill)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

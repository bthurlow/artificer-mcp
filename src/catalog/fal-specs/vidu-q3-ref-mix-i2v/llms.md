# Vidu

> Vidu's latest Q3 Reference to Video Mix model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/q3/reference-to-video/mix`
- **Model ID**: `fal-ai/vidu/q3/reference-to-video/mix`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost 0.07 $ per video second for 360p and 540 p, cost will be 2.2x for 720p and 1080p resolution.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation, max 2000 characters
  - Examples: "A character walking through a beach catching an apple."

- **`reference_image_urls`** (`list<string>`, _required_):
  URLs of 1 to 4 reference images used to keep subjects or scenes consistent
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png","https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png","https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"]

- **`duration`** (`integer`, _optional_):
  Duration of the video in seconds (1-16 for Q3 models) Default value: `5`
  - Default: `5`
  - Range: `1` to `16`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the output video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"4:3"`, `"3:4"`, `"1:1"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output video resolution Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"360p"`, `"540p"`, `"720p"`, `"1080p"`

- **`audio`** (`boolean`, _optional_):
  Whether to use direct audio-video generation. When true, outputs video with sound. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A character walking through a beach catching an apple.",
  "reference_image_urls": [
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "A character walking through a beach catching an apple.",
  "reference_image_urls": [
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"
  ],
  "duration": 5,
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "audio": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video from reference images using the Q3 model
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8c9189/n9z3uUDPqmU2msAtqr25-_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8c9189/n9z3uUDPqmU2msAtqr25-_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/q3/reference-to-video/mix \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A character walking through a beach catching an apple.",
     "reference_image_urls": [
       "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png",
       "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png",
       "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"
     ]
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
    "fal-ai/vidu/q3/reference-to-video/mix",
    arguments={
        "prompt": "A character walking through a beach catching an apple.",
        "reference_image_urls": ["https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png", "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png", "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"]
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

const result = await fal.subscribe("fal-ai/vidu/q3/reference-to-video/mix", {
  input: {
    prompt: "A character walking through a beach catching an apple.",
    reference_image_urls: ["https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png", "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png", "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/q3/reference-to-video/mix)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/q3/reference-to-video/mix/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/q3/reference-to-video/mix)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

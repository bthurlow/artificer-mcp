# Vidu Reference to Video

> Vidu Reference to Video creates videos by using a reference images and combining them with a prompt.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/reference-to-video`
- **Model ID**: `fal-ai/vidu/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: motion, reference



## Pricing

For **4s video** your request will cost **$0.40**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation, max 1500 characters
  - Examples: "The little devil is looking at the apple on the beach and walking around it."

- **`reference_image_urls`** (`list<string>`, _required_):
  URLs of the reference images to use for consistent subject appearance
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png","https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png","https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"]

- **`seed`** (`integer`, _optional_):
  Random seed for generation

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the output video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`movement_amplitude`** (`MovementAmplitudeEnum`, _optional_):
  The movement amplitude of objects in the frame Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"small"`, `"medium"`, `"large"`



**Required Parameters Example**:

```json
{
  "prompt": "The little devil is looking at the apple on the beach and walking around it.",
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
  "prompt": "The little devil is looking at the apple on the beach and walking around it.",
  "reference_image_urls": [
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"
  ],
  "aspect_ratio": "16:9",
  "movement_amplitude": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video with consistent subjects from reference images
  - Examples: {"url":"https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/referencevideo.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/referencevideo.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "The little devil is looking at the apple on the beach and walking around it.",
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
    "fal-ai/vidu/reference-to-video",
    arguments={
        "prompt": "The little devil is looking at the apple on the beach and walking around it.",
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

const result = await fal.subscribe("fal-ai/vidu/reference-to-video", {
  input: {
    prompt: "The little devil is looking at the apple on the beach and walking around it.",
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/reference-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

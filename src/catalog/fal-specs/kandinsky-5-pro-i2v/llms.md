# Kandinsky5 Pro

> Kandinsky 5.0 Pro is a diffusion model for fast, high-quality image-to-video generation.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kandinsky5-pro/image-to-video`
- **Model ID**: `fal-ai/kandinsky5-pro/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.04** per **512P** video second and **$0.12** per **1024P** video second.


For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character."

- **`image_url`** (`string`, _required_):
  The URL of the image to use as a reference for the video generation.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg"

- **`resolution`** (`ResolutionEnum`, _optional_):
  Video resolution: 512p or 1024p. Default value: `"512P"`
  - Default: `"512P"`
  - Options: `"512P"`, `"1024P"`

- **`duration`** (`string`, _optional_):
  Video duration. Default value: `"5s"`
  - Default: `"5s"`

- **`num_inference_steps`** (`integer`, _optional_):
   Default value: `28`
  - Default: `28`
  - Range: `1` to `40`

- **`acceleration`** (`Enum`, _optional_):
  Acceleration level for faster generation. Default value: `regular`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`



**Required Parameters Example**:

```json
{
  "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
  "resolution": "512P",
  "duration": "5s",
  "num_inference_steps": 28,
  "acceleration": "regular"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _optional_):
  The generated video file.
  - Examples: {"file_name":"output.mp4","file_size":22253751,"content_type":"application/octet-stream","url":"https://v3b.fal.media/files/b/0a877276/Bg24FK_awlNAYKn962Vm0_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "output.mp4",
    "file_size": 22253751,
    "content_type": "application/octet-stream",
    "url": "https://v3b.fal.media/files/b/0a877276/Bg24FK_awlNAYKn962Vm0_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kandinsky5-pro/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg"
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
    "fal-ai/kandinsky5-pro/image-to-video",
    arguments={
        "prompt": "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg"
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

const result = await fal.subscribe("fal-ai/kandinsky5-pro/image-to-video", {
  input: {
    prompt: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
    image_url: "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/kandinsky5-pro/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kandinsky5-pro/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kandinsky5-pro/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

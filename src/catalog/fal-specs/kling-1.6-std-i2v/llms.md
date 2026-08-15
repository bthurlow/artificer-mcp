# Kling 1.6

> Generate video clips from your images using Kling 1.6 (std)


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v1.6/standard/image-to-video`
- **Model ID**: `fal-ai/kling-video/v1.6/standard/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

- **Price**: $0.056 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "Snowflakes fall as a car moves forward along the road."

- **`image_url`** (`string`, _required_)
  - Examples: "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"5"`
  - Default: `"5"`
  - Options: `"5"`, `"10"`

- **`negative_prompt`** (`string`, _optional_):
   Default value: `"blur, distort, and low quality"`
  - Default: `"blur, distort, and low quality"`

- **`cfg_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want
  the model to stick to your prompt. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`



**Required Parameters Example**:

```json
{
  "prompt": "Snowflakes fall as a car moves forward along the road.",
  "image_url": "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg"
}
```

**Full Example**:

```json
{
  "prompt": "Snowflakes fall as a car moves forward along the road.",
  "image_url": "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg",
  "duration": "5",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://storage.googleapis.com/falserverless/kling/kling_i2v_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/kling/kling_i2v_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v1.6/standard/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Snowflakes fall as a car moves forward along the road.",
     "image_url": "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg"
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
    "fal-ai/kling-video/v1.6/standard/image-to-video",
    arguments={
        "prompt": "Snowflakes fall as a car moves forward along the road.",
        "image_url": "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg"
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

const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/image-to-video", {
  input: {
    prompt: "Snowflakes fall as a car moves forward along the road.",
    image_url: "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg"
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v1.6/standard/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v1.6/standard/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v1.6/standard/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

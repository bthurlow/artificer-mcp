# Kling 2.1 (standard)

> Kling 2.1 Standard is a cost-efficient endpoint for the Kling 2.1 model, delivering high-quality image-to-video generation 




## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v2.1/standard/image-to-video`
- **Model ID**: `fal-ai/kling-video/v2.1/standard/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

For **5s** video your request will cost **$0.28**. For every additional second you will be charged **$0.056**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "As the sun dips below the horizon, painting the sky in fiery hues of orange and purple, powerful waves relentlessly crash against jagged, dark rocks, their white foam a stark contrast to the deepening twilight; the textured surface of the rocks, wet and glistening, reflects the vibrant colors, creating a mesmerizing spectacle of nature's raw power and breathtaking beauty"

- **`image_url`** (`string`, _required_):
  URL of the image to be used for the video
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/kling/kling-image-to-video.jpg"

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
  "prompt": "As the sun dips below the horizon, painting the sky in fiery hues of orange and purple, powerful waves relentlessly crash against jagged, dark rocks, their white foam a stark contrast to the deepening twilight; the textured surface of the rocks, wet and glistening, reflects the vibrant colors, creating a mesmerizing spectacle of nature's raw power and breathtaking beauty",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/kling/kling-image-to-video.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "As the sun dips below the horizon, painting the sky in fiery hues of orange and purple, powerful waves relentlessly crash against jagged, dark rocks, their white foam a stark contrast to the deepening twilight; the textured surface of the rocks, wet and glistening, reflects the vibrant colors, creating a mesmerizing spectacle of nature's raw power and breathtaking beauty",
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/kling/kling-image-to-video.jpg",
  "duration": "5",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://v3.fal.media/files/koala/17e3xh08J4_PkHS_0cbwF_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/koala/17e3xh08J4_PkHS_0cbwF_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v2.1/standard/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "As the sun dips below the horizon, painting the sky in fiery hues of orange and purple, powerful waves relentlessly crash against jagged, dark rocks, their white foam a stark contrast to the deepening twilight; the textured surface of the rocks, wet and glistening, reflects the vibrant colors, creating a mesmerizing spectacle of nature's raw power and breathtaking beauty",
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/kling/kling-image-to-video.jpg"
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
    "fal-ai/kling-video/v2.1/standard/image-to-video",
    arguments={
        "prompt": "As the sun dips below the horizon, painting the sky in fiery hues of orange and purple, powerful waves relentlessly crash against jagged, dark rocks, their white foam a stark contrast to the deepening twilight; the textured surface of the rocks, wet and glistening, reflects the vibrant colors, creating a mesmerizing spectacle of nature's raw power and breathtaking beauty",
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/kling/kling-image-to-video.jpg"
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

const result = await fal.subscribe("fal-ai/kling-video/v2.1/standard/image-to-video", {
  input: {
    prompt: "As the sun dips below the horizon, painting the sky in fiery hues of orange and purple, powerful waves relentlessly crash against jagged, dark rocks, their white foam a stark contrast to the deepening twilight; the textured surface of the rocks, wet and glistening, reflects the vibrant colors, creating a mesmerizing spectacle of nature's raw power and breathtaking beauty",
    image_url: "https://storage.googleapis.com/falserverless/model_tests/kling/kling-image-to-video.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v2.1/standard/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v2.1/standard/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v2.1/standard/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

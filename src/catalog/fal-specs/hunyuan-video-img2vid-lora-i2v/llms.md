# Hunyuan Video Image-to-Video LoRA Inference

> Image to Video for the Hunyuan Video model using a custom trained LoRA.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/hunyuan-video-img2vid-lora`
- **Model ID**: `fal-ai/hunyuan-video-img2vid-lora`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: motion



## Pricing

- **Price**: $0.3 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him"

- **`image_url`** (`string`, _required_):
  The URL to the image to generate the video from. The image must be 960x544 or it will get cropped and resized to that size.
  - Examples: "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"

- **`seed`** (`integer`, _optional_):
  The seed to use for generating the video.



**Required Parameters Example**:

```json
{
  "prompt": "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him",
  "image_url": "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"content_type":"video/mp4","url":"https://storage.googleapis.com/falserverless/gallery/man-smiles.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generating the video.



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "url": "https://storage.googleapis.com/falserverless/gallery/man-smiles.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/hunyuan-video-img2vid-lora \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him",
     "image_url": "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"
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
    "fal-ai/hunyuan-video-img2vid-lora",
    arguments={
        "prompt": "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him",
        "image_url": "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"
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

const result = await fal.subscribe("fal-ai/hunyuan-video-img2vid-lora", {
  input: {
    prompt: "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him",
    image_url: "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/hunyuan-video-img2vid-lora)
- [API Documentation](https://fal.ai/models/fal-ai/hunyuan-video-img2vid-lora/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/hunyuan-video-img2vid-lora)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

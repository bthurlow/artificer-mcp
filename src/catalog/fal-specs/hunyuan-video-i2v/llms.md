# Hunyuan Video Image-to-Video Inference

> Image to Video for the high-quality Hunyuan Video I2V model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/hunyuan-video-image-to-video`
- **Model ID**: `fal-ai/hunyuan-video-image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: motion



## Pricing

- **Price**: $0.4 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "Two muscular cats boxing in a boxing ring."

- **`image_url`** (`string`, _required_):
  URL of the image input.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/hunyuan_i2v.jpg"

- **`seed`** (`integer`, _optional_):
  The seed to use for generating the video.

- **`aspect_ratio`** (`AspectRatio(W:H)Enum`, _optional_):
  The aspect ratio of the video to generate. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`resolution`** (`string`, _optional_):
  The resolution of the video to generate. Default value: `"720p"`
  - Default: `"720p"`

- **`num_frames`** (`string`, _optional_):
  The number of frames to generate. Default value: `"129"`
  - Default: `129`

- **`i2v_stability`** (`boolean`, _optional_):
  Turning on I2V Stability reduces hallucination but also reduces motion.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "Two muscular cats boxing in a boxing ring.",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/hunyuan_i2v.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "Two muscular cats boxing in a boxing ring.",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/hunyuan_i2v.jpg",
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "num_frames": 129
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_)

- **`seed`** (`integer`, _required_):
  The seed used for generating the video.



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/hunyuan-video-image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Two muscular cats boxing in a boxing ring.",
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/hunyuan_i2v.jpg"
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
    "fal-ai/hunyuan-video-image-to-video",
    arguments={
        "prompt": "Two muscular cats boxing in a boxing ring.",
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/hunyuan_i2v.jpg"
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

const result = await fal.subscribe("fal-ai/hunyuan-video-image-to-video", {
  input: {
    prompt: "Two muscular cats boxing in a boxing ring.",
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/hunyuan_i2v.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/hunyuan-video-image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/hunyuan-video-image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/hunyuan-video-image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Stable Video Diffusion Turbo

> Generate short video clips from your images using SVD v1.1 at Lightning Speed


## Overview

- **Endpoint**: `https://fal.run/fal-ai/fast-svd-lcm/text-to-video`
- **Model ID**: `fal-ai/fast-svd-lcm/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: lcm, diffusion, turbo



## Pricing

- **Price**: $0 per compute seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to use as a starting point for the generation.
  - Examples: "A rocket flying that is about to take off"

- **`motion_bucket_id`** (`integer`, _optional_):
  The motion bucket id determines the motion of the generated video. The
  higher the number, the more motion there will be. Default value: `127`
  - Default: `127`
  - Range: `1` to `255`

- **`cond_aug`** (`float`, _optional_):
  The conditoning augmentation determines the amount of noise that will be
  added to the conditioning frame. The higher the number, the more noise
  there will be, and the less the video will look like the initial image.
  Increase it for more motion. Default value: `0.02`
  - Default: `0.02`
  - Range: `0` to `10`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of Stable Diffusion
  will output the same image every time.

- **`steps`** (`integer`, _optional_):
  The number of steps to run the model for. The higher the number the better
  the quality and longer it will take to generate. Default value: `4`
  - Default: `4`
  - Range: `1` to `20`

- **`fps`** (`integer`, _optional_):
  The FPS of the generated video. The higher the number, the faster the video will
  play. Total video length is 25 frames. Default value: `10`
  - Default: `10`
  - Range: `1` to `25`

- **`video_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated video. Default value: `landscape_16_9`
  - Default: `"landscape_16_9"`
  - One of: ImageSize | Enum



**Required Parameters Example**:

```json
{
  "prompt": "A rocket flying that is about to take off"
}
```

**Full Example**:

```json
{
  "prompt": "A rocket flying that is about to take off",
  "motion_bucket_id": 127,
  "cond_aug": 0.02,
  "steps": 4,
  "fps": 10,
  "video_size": "landscape_16_9"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.

- **`seed`** (`integer`, _required_):
  Seed of the generated Image. It will be the same value of the one passed in the
  input or the randomly generated that was used in case none was passed.



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
  --url https://fal.run/fal-ai/fast-svd-lcm/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A rocket flying that is about to take off"
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
    "fal-ai/fast-svd-lcm/text-to-video",
    arguments={
        "prompt": "A rocket flying that is about to take off"
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

const result = await fal.subscribe("fal-ai/fast-svd-lcm/text-to-video", {
  input: {
    prompt: "A rocket flying that is about to take off"
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

- [Model Playground](https://fal.ai/models/fal-ai/fast-svd-lcm/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/fast-svd-lcm/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/fast-svd-lcm/text-to-video)
- [GitHub Repository](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt-1-1/blob/main/LICENSE)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

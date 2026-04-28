# CogVideoX-5B

> Generate videos from images and prompts using CogVideoX-5B


## Overview

- **Endpoint**: `https://fal.run/fal-ai/cogvideox-5b/image-to-video`
- **Model ID**: `fal-ai/cogvideox-5b/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

- **Price**: $0.2 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him"

- **`video_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated video.
  - Default: `{"width":720,"height":480}`
  - One of: ImageSize | Enum

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to generate video from Default value: `""`
  - Default: `""`
  - Examples: "Distorted, discontinuous, Ugly, blurry, low resolution, motionless, static, disfigured, disconnected limbs, Ugly faces, incomplete arms"

- **`loras`** (`list<LoraWeight>`, _optional_):
  The LoRAs to use for the image generation. We currently support one lora.
  - Default: `[]`
  - Array of LoraWeight

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `50`
  - Default: `50`
  - Range: `1` to `50`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of the model
  will output the same video every time.

- **`guidance_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want
  the model to stick to your prompt when looking for a related video to show you. Default value: `7`
  - Default: `7`
  - Range: `0` to `20`

- **`use_rife`** (`boolean`, _optional_):
  Use RIFE for video interpolation Default value: `true`
  - Default: `true`

- **`export_fps`** (`integer`, _optional_):
  The target FPS of the video Default value: `16`
  - Default: `16`
  - Range: `4` to `32`

- **`image_url`** (`string`, _required_):
  The URL to the image to generate the video from.
  - Examples: "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"



**Required Parameters Example**:

```json
{
  "prompt": "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him",
  "image_url": "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "A low angle shot of a man walking down a street, illuminated by the neon signs of the bars around him",
  "video_size": {
    "width": 720,
    "height": 480
  },
  "negative_prompt": "Distorted, discontinuous, Ugly, blurry, low resolution, motionless, static, disfigured, disconnected limbs, Ugly faces, incomplete arms",
  "num_inference_steps": 50,
  "guidance_scale": 7,
  "use_rife": true,
  "export_fps": 16,
  "image_url": "https://d3phaj0sisr2ct.cloudfront.net/research/eugene.jpg"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The URL to the generated video

- **`timings`** (`Timings`, _required_)

- **`seed`** (`integer`, _required_):
  Seed of the generated video. It will be the same value of the one passed in the
  input or the randomly generated that was used in case none was passed.

- **`prompt`** (`string`, _required_):
  The prompt used for generating the video.



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  },
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/cogvideox-5b/image-to-video \
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
    "fal-ai/cogvideox-5b/image-to-video",
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

const result = await fal.subscribe("fal-ai/cogvideox-5b/image-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/cogvideox-5b/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/cogvideox-5b/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/cogvideox-5b/image-to-video)
- [GitHub Repository](https://huggingface.co/THUDM/CogVideoX-5b/blob/main/LICENSE)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

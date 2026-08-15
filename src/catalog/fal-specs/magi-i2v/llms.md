# MAGI-1

> MAGI-1 generates videos from images with exceptional understanding of physical interactions and prompting


## Overview

- **Endpoint**: `https://fal.run/fal-ai/magi/image-to-video`
- **Model ID**: `fal-ai/magi/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: image-to-video



## Pricing

Your request will cost $0.80 to generate one four-second video. For $1 you can run this model approximately 1 time. 

Additional seconds will cost $0.20 each, calculated at 24 frames per second.

Additional inference steps above 16 incur a 1/16 multiplier each, such that your total cost will be multiplied x2 at 32 steps, x3 at 48 and x4 at 64. 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A crisp, wintery mountain landscape unfolds as a snowboarder, equipped with a selfie pole, gracefully navigates a snow-covered slope, the camera perspective offering an exhilarating attached-third-person view of the descent;  the vibrant, snowy scenery sweeps past, punctuated by moments of controlled spins and effortless glides, creating a dynamic visual rhythm that complements the exhilarating pace of the ride;  as the snowboarder carves through pristine powder, the camera captures fleeting moments of breathtaking views—towering pines dusted with snow, sunlit peaks piercing a cerulean sky—a symphony of nature's grandeur displayed for the viewer to share;  a sense of freedom and exhilaration permeates the scene, punctuated by the subtle whoosh of wind and the satisfying crunch of snow, culminating in a breathtaking panorama as the snowboarder reaches the bottom, leaving the viewer with a lingering sense of wonder and the desire to experience the thrill firsthand."

- **`image_url`** (`string`, _required_):
  URL of the input image to represent the first frame of the video. If the input image does not match the chosen aspect ratio, it is resized and center cropped.
  - Examples: "https://v3.fal.media/files/kangaroo/sGqTf5scZcC5VNfOLbxwE_maxresdefault-2740110268.jpg"

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 96 and 192 (inclusive). Each additional 24 frames beyond 96 incurs an additional billing unit. Default value: `96`
  - Default: `96`
  - Range: `96` to `192`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p or 720p). 480p is 0.5 billing units, and 720p is 1 billing unit. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`

- **`num_inference_steps`** (`NumInferenceStepsEnum`, _optional_):
  Number of inference steps for sampling. Higher values give better quality but take longer. Default value: `"16"`
  - Default: `16`
  - Options: `4`, `8`, `16`, `32`, `64`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`
  - Examples: true

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"9:16"`, `"1:1"`



**Required Parameters Example**:

```json
{
  "prompt": "A crisp, wintery mountain landscape unfolds as a snowboarder, equipped with a selfie pole, gracefully navigates a snow-covered slope, the camera perspective offering an exhilarating attached-third-person view of the descent;  the vibrant, snowy scenery sweeps past, punctuated by moments of controlled spins and effortless glides, creating a dynamic visual rhythm that complements the exhilarating pace of the ride;  as the snowboarder carves through pristine powder, the camera captures fleeting moments of breathtaking views—towering pines dusted with snow, sunlit peaks piercing a cerulean sky—a symphony of nature's grandeur displayed for the viewer to share;  a sense of freedom and exhilaration permeates the scene, punctuated by the subtle whoosh of wind and the satisfying crunch of snow, culminating in a breathtaking panorama as the snowboarder reaches the bottom, leaving the viewer with a lingering sense of wonder and the desire to experience the thrill firsthand.",
  "image_url": "https://v3.fal.media/files/kangaroo/sGqTf5scZcC5VNfOLbxwE_maxresdefault-2740110268.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "A crisp, wintery mountain landscape unfolds as a snowboarder, equipped with a selfie pole, gracefully navigates a snow-covered slope, the camera perspective offering an exhilarating attached-third-person view of the descent;  the vibrant, snowy scenery sweeps past, punctuated by moments of controlled spins and effortless glides, creating a dynamic visual rhythm that complements the exhilarating pace of the ride;  as the snowboarder carves through pristine powder, the camera captures fleeting moments of breathtaking views—towering pines dusted with snow, sunlit peaks piercing a cerulean sky—a symphony of nature's grandeur displayed for the viewer to share;  a sense of freedom and exhilaration permeates the scene, punctuated by the subtle whoosh of wind and the satisfying crunch of snow, culminating in a breathtaking panorama as the snowboarder reaches the bottom, leaving the viewer with a lingering sense of wonder and the desire to experience the thrill firsthand.",
  "image_url": "https://v3.fal.media/files/kangaroo/sGqTf5scZcC5VNfOLbxwE_maxresdefault-2740110268.jpg",
  "num_frames": 96,
  "resolution": "720p",
  "num_inference_steps": 16,
  "enable_safety_checker": true,
  "aspect_ratio": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://v3.fal.media/files/penguin/sSJdxpy9oEBqZpGIh3SPq_3381fe86-9bab-4ce4-9c3a-5db66984618a.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/penguin/sSJdxpy9oEBqZpGIh3SPq_3381fe86-9bab-4ce4-9c3a-5db66984618a.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/magi/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A crisp, wintery mountain landscape unfolds as a snowboarder, equipped with a selfie pole, gracefully navigates a snow-covered slope, the camera perspective offering an exhilarating attached-third-person view of the descent;  the vibrant, snowy scenery sweeps past, punctuated by moments of controlled spins and effortless glides, creating a dynamic visual rhythm that complements the exhilarating pace of the ride;  as the snowboarder carves through pristine powder, the camera captures fleeting moments of breathtaking views—towering pines dusted with snow, sunlit peaks piercing a cerulean sky—a symphony of nature's grandeur displayed for the viewer to share;  a sense of freedom and exhilaration permeates the scene, punctuated by the subtle whoosh of wind and the satisfying crunch of snow, culminating in a breathtaking panorama as the snowboarder reaches the bottom, leaving the viewer with a lingering sense of wonder and the desire to experience the thrill firsthand.",
     "image_url": "https://v3.fal.media/files/kangaroo/sGqTf5scZcC5VNfOLbxwE_maxresdefault-2740110268.jpg"
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
    "fal-ai/magi/image-to-video",
    arguments={
        "prompt": "A crisp, wintery mountain landscape unfolds as a snowboarder, equipped with a selfie pole, gracefully navigates a snow-covered slope, the camera perspective offering an exhilarating attached-third-person view of the descent;  the vibrant, snowy scenery sweeps past, punctuated by moments of controlled spins and effortless glides, creating a dynamic visual rhythm that complements the exhilarating pace of the ride;  as the snowboarder carves through pristine powder, the camera captures fleeting moments of breathtaking views—towering pines dusted with snow, sunlit peaks piercing a cerulean sky—a symphony of nature's grandeur displayed for the viewer to share;  a sense of freedom and exhilaration permeates the scene, punctuated by the subtle whoosh of wind and the satisfying crunch of snow, culminating in a breathtaking panorama as the snowboarder reaches the bottom, leaving the viewer with a lingering sense of wonder and the desire to experience the thrill firsthand.",
        "image_url": "https://v3.fal.media/files/kangaroo/sGqTf5scZcC5VNfOLbxwE_maxresdefault-2740110268.jpg"
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

const result = await fal.subscribe("fal-ai/magi/image-to-video", {
  input: {
    prompt: "A crisp, wintery mountain landscape unfolds as a snowboarder, equipped with a selfie pole, gracefully navigates a snow-covered slope, the camera perspective offering an exhilarating attached-third-person view of the descent;  the vibrant, snowy scenery sweeps past, punctuated by moments of controlled spins and effortless glides, creating a dynamic visual rhythm that complements the exhilarating pace of the ride;  as the snowboarder carves through pristine powder, the camera captures fleeting moments of breathtaking views—towering pines dusted with snow, sunlit peaks piercing a cerulean sky—a symphony of nature's grandeur displayed for the viewer to share;  a sense of freedom and exhilaration permeates the scene, punctuated by the subtle whoosh of wind and the satisfying crunch of snow, culminating in a breathtaking panorama as the snowboarder reaches the bottom, leaving the viewer with a lingering sense of wonder and the desire to experience the thrill firsthand.",
    image_url: "https://v3.fal.media/files/kangaroo/sGqTf5scZcC5VNfOLbxwE_maxresdefault-2740110268.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/magi/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/magi/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/magi/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

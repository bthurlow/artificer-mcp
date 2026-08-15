# Lyra 2

> Lyra 2.0 is an image-to-video model that turns a single image into an explorable 3D-style video with camera-controlled motion.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/lyra-2/zoom`
- **Model ID**: `fal-ai/lyra-2/zoom`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.10** for an **81-frame** video at **480p**, and **$20** for an **81-frame** video at **720p**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the input image. Lyra-2 hallucinates a video that starts from this image and moves the camera along the requested trajectory.
  - Examples: "https://v3b.fal.media/files/b/0a972579/6NsCexuhSlD8gcFYlpr1K_00.png"

- **`prompt`** (`string`, _required_):
  Text prompt describing the scene. Best results come from prompts
  - Examples: "A slow, steady horizontal orbit of the camera around the scene, focusing on the two massive galleons. The scene is a frozen tableau: the turquoise water is glass-like and motionless, the canvas sails are rigid, and the distant clouds are fixed in the golden sky. Every element, from the foreground wooden barrels and coiled ropes to the intricate coastal architecture, remains perfectly still. The warm, late-afternoon sunlight and soft shadows are permanent. As the camera advances, more of the harbor's stone buildings and the ships' wooden hulls are revealed, maintaining identical textures and colors. The entire world is locked in a silent, breathless moment with zero object or environmental movement."

- **`zoom_direction`** (`ZoomDirectionEnum`, _optional_):
  Whether to generate a zoom-in video (camera moves toward the subject), a zoom-out video (camera retreats), or a combined out-then-in video. Default value: `"in"`
  - Default: `"in"`
  - Options: `"in"`, `"out"`, `"both"`

- **`num_frames`** (`NumFramesEnum`, _optional_):
  Number of frames per direction. Each AR chunk produces 80 frames, and the loop emits an extra anchor frame at the start, so valid values are 81, 161, 241, 321, 401, 481. Default value: `"81"`
  - Default: `81`
  - Options: `81`, `161`, `241`, `321`, `401`, `481`

- **`zoom_in_trajectory`** (`ZoomInTrajectoryEnum`, _optional_):
  Camera-trajectory preset for the zoom-in direction. ``horizontal_zoom`` is a straight translation along the z-axis; ``horizontal_zoom_bend`` adds a slight arc; ``spiral`` produces a spiraling approach. Default value: `"orbit_horizontal"`
  - Default: `"orbit_horizontal"`
  - Options: `"horizontal_zoom"`, `"horizontal_zoom_bend"`, `"spiral"`, `"dolly_zoom"`, `"orbit_horizontal"`, `"back"`

- **`zoom_in_strength`** (`float`, _optional_):
  Displacement scale for the zoom-in trajectory (relative to subject depth). Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `2`

- **`zoom_out_trajectory`** (`ZoomOutTrajectoryEnum`, _optional_):
  Camera-trajectory preset for the zoom-out direction. Default value: `"horizontal_zoom"`
  - Default: `"horizontal_zoom"`
  - Options: `"horizontal_zoom"`, `"horizontal_zoom_bend"`, `"spiral"`, `"dolly_zoom"`, `"orbit_horizontal"`, `"back"`

- **`zoom_out_strength`** (`float`, _optional_):
  Displacement scale for the zoom-out trajectory. Default value: `1.5`
  - Default: `1.5`
  - Range: `0` to `3`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output resolution. 480p = 480x832, 720p = 720x1280. Higher resolutions take substantially longer to generate. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"720p"`

- **`use_dmd`** (`boolean`, _optional_):
  Enable the upstream DMD distillation LoRA and 4-step scheduler for much faster generation. Disable for the higher-quality default Lyra-2 sampling path. Default value: `true`
  - Default: `true`

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. Default value: `5`
  - Default: `5`
  - Range: `1` to `15`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of denoising steps per frame chunk. Ignored when ``use_dmd`` is enabled because the DMD scheduler uses a fixed 4-step schedule. Default value: `28`
  - Default: `28`
  - Range: `1` to `100`

- **`frames_per_second`** (`integer`, _optional_):
  Frame rate of the output video. Default value: `16`
  - Default: `16`
  - Range: `8` to `24`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If not provided, a random seed is chosen.



**Required Parameters Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a972579/6NsCexuhSlD8gcFYlpr1K_00.png",
  "prompt": "A slow, steady horizontal orbit of the camera around the scene, focusing on the two massive galleons. The scene is a frozen tableau: the turquoise water is glass-like and motionless, the canvas sails are rigid, and the distant clouds are fixed in the golden sky. Every element, from the foreground wooden barrels and coiled ropes to the intricate coastal architecture, remains perfectly still. The warm, late-afternoon sunlight and soft shadows are permanent. As the camera advances, more of the harbor's stone buildings and the ships' wooden hulls are revealed, maintaining identical textures and colors. The entire world is locked in a silent, breathless moment with zero object or environmental movement."
}
```

**Full Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a972579/6NsCexuhSlD8gcFYlpr1K_00.png",
  "prompt": "A slow, steady horizontal orbit of the camera around the scene, focusing on the two massive galleons. The scene is a frozen tableau: the turquoise water is glass-like and motionless, the canvas sails are rigid, and the distant clouds are fixed in the golden sky. Every element, from the foreground wooden barrels and coiled ropes to the intricate coastal architecture, remains perfectly still. The warm, late-afternoon sunlight and soft shadows are permanent. As the camera advances, more of the harbor's stone buildings and the ships' wooden hulls are revealed, maintaining identical textures and colors. The entire world is locked in a silent, breathless moment with zero object or environmental movement.",
  "zoom_direction": "in",
  "num_frames": 81,
  "zoom_in_trajectory": "orbit_horizontal",
  "zoom_in_strength": 0.5,
  "zoom_out_trajectory": "horizontal_zoom",
  "zoom_out_strength": 1.5,
  "resolution": "480p",
  "use_dmd": true,
  "guidance_scale": 5,
  "num_inference_steps": 28,
  "frames_per_second": 16
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated MP4 video.
  - Examples: {"content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a972e2c/6ACGX02AxQXhC1t9BED4b_tmpoufr9iug.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.
  - Examples: 478163327

- **`timings`** (`Timings`, _optional_):
  Per-stage timing breakdown (seconds).
  - Examples: {"zoom_in_s":51.5847270488739,"encode_s":1.475144863128662}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a972e2c/6ACGX02AxQXhC1t9BED4b_tmpoufr9iug.mp4"
  },
  "seed": 478163327,
  "timings": {
    "zoom_in_s": 51.5847270488739,
    "encode_s": 1.475144863128662
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/lyra-2/zoom \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3b.fal.media/files/b/0a972579/6NsCexuhSlD8gcFYlpr1K_00.png",
     "prompt": "A slow, steady horizontal orbit of the camera around the scene, focusing on the two massive galleons. The scene is a frozen tableau: the turquoise water is glass-like and motionless, the canvas sails are rigid, and the distant clouds are fixed in the golden sky. Every element, from the foreground wooden barrels and coiled ropes to the intricate coastal architecture, remains perfectly still. The warm, late-afternoon sunlight and soft shadows are permanent. As the camera advances, more of the harbor's stone buildings and the ships' wooden hulls are revealed, maintaining identical textures and colors. The entire world is locked in a silent, breathless moment with zero object or environmental movement."
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
    "fal-ai/lyra-2/zoom",
    arguments={
        "image_url": "https://v3b.fal.media/files/b/0a972579/6NsCexuhSlD8gcFYlpr1K_00.png",
        "prompt": "A slow, steady horizontal orbit of the camera around the scene, focusing on the two massive galleons. The scene is a frozen tableau: the turquoise water is glass-like and motionless, the canvas sails are rigid, and the distant clouds are fixed in the golden sky. Every element, from the foreground wooden barrels and coiled ropes to the intricate coastal architecture, remains perfectly still. The warm, late-afternoon sunlight and soft shadows are permanent. As the camera advances, more of the harbor's stone buildings and the ships' wooden hulls are revealed, maintaining identical textures and colors. The entire world is locked in a silent, breathless moment with zero object or environmental movement."
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

const result = await fal.subscribe("fal-ai/lyra-2/zoom", {
  input: {
    image_url: "https://v3b.fal.media/files/b/0a972579/6NsCexuhSlD8gcFYlpr1K_00.png",
    prompt: "A slow, steady horizontal orbit of the camera around the scene, focusing on the two massive galleons. The scene is a frozen tableau: the turquoise water is glass-like and motionless, the canvas sails are rigid, and the distant clouds are fixed in the golden sky. Every element, from the foreground wooden barrels and coiled ropes to the intricate coastal architecture, remains perfectly still. The warm, late-afternoon sunlight and soft shadows are permanent. As the camera advances, more of the harbor's stone buildings and the ships' wooden hulls are revealed, maintaining identical textures and colors. The entire world is locked in a silent, breathless moment with zero object or environmental movement."
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

- [Model Playground](https://fal.ai/models/fal-ai/lyra-2/zoom)
- [API Documentation](https://fal.ai/models/fal-ai/lyra-2/zoom/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/lyra-2/zoom)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

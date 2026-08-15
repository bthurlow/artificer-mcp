# Cosmos Predict 2.5 2B Distilled

> Generate video from text and videos using NVIDIA's 2B Cosmos Distilled Model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/cosmos-predict-2.5/distilled/text-to-video`
- **Model ID**: `fal-ai/cosmos-predict-2.5/distilled/text-to-video`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

Your request will cost $0.08 per video. Videos have a fixed size of 1280x704 and a fixed duration of 93 frames at 16 frames per second (5.8 seconds.)

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the video to generate.
  - Examples: "A static, locked-off camera frames an industrial conveyor belt steadily transporting rough rocks through a dimly lit quarry processing facility. The belt runs horizontally across the center of the frame, its thick black rubber surface textured with dust and fine gravel. Jagged gray and brown stones of varying sizes tumble forward in a slow, continuous motion, their sharp edges catching the light. Subtle vibrations ripple through the belt’s surface as small pebbles bounce and shift. In the background, blurred steel beams, pipes, and muted industrial machinery create depth without distraction. Cool, diffused overhead lighting casts soft shadows and highlights the gritty textures, emphasizing dust particles in the air and the raw, rugged surfaces of the rocks."

- **`negative_prompt`** (`string`, _optional_):
  A negative prompt to guide generation away from undesired content. Default value: `"The video captures a series of frames showing ugly scenes, static with no motion, motion blur, over-saturation, shaky footage, low resolution, grainy texture, pixelated images, poorly lit areas, underexposed and overexposed scenes, poor color balance, washed out colors, choppy sequences, jerky movements, low frame rate, artifacting, color banding, unnatural transitions, outdated special effects, fake elements, unconvincing visuals, poorly edited content, jump cuts, visual noise, and flickering. Overall, the video is of poor quality."`
  - Default: `"The video captures a series of frames showing ugly scenes, static with no motion, motion blur, over-saturation, shaky footage, low resolution, grainy texture, pixelated images, poorly lit areas, underexposed and overexposed scenes, poor color balance, washed out colors, choppy sequences, jerky movements, low frame rate, artifacting, color banding, unnatural transitions, outdated special effects, fake elements, unconvincing visuals, poorly edited content, jump cuts, visual noise, and flickering. Overall, the video is of poor quality."`

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 9 and 93. Default value: `93`
  - Default: `93`
  - Range: `9` to `93`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of denoising steps. Distilled model works well with fewer steps. Default value: `10`
  - Default: `10`
  - Range: `1` to `20`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation.

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`video_output_type`** (`VideoOutputTypeEnum`, _optional_):
  The format of the output video. Default value: `"X264 (.mp4)"`
  - Default: `"X264 (.mp4)"`
  - Options: `"X264 (.mp4)"`, `"VP9 (.webm)"`, `"PRORES4444 (.mov)"`, `"GIF (.gif)"`

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality of the output video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`



**Required Parameters Example**:

```json
{
  "prompt": "A static, locked-off camera frames an industrial conveyor belt steadily transporting rough rocks through a dimly lit quarry processing facility. The belt runs horizontally across the center of the frame, its thick black rubber surface textured with dust and fine gravel. Jagged gray and brown stones of varying sizes tumble forward in a slow, continuous motion, their sharp edges catching the light. Subtle vibrations ripple through the belt’s surface as small pebbles bounce and shift. In the background, blurred steel beams, pipes, and muted industrial machinery create depth without distraction. Cool, diffused overhead lighting casts soft shadows and highlights the gritty textures, emphasizing dust particles in the air and the raw, rugged surfaces of the rocks."
}
```

**Full Example**:

```json
{
  "prompt": "A static, locked-off camera frames an industrial conveyor belt steadily transporting rough rocks through a dimly lit quarry processing facility. The belt runs horizontally across the center of the frame, its thick black rubber surface textured with dust and fine gravel. Jagged gray and brown stones of varying sizes tumble forward in a slow, continuous motion, their sharp edges catching the light. Subtle vibrations ripple through the belt’s surface as small pebbles bounce and shift. In the background, blurred steel beams, pipes, and muted industrial machinery create depth without distraction. Cool, diffused overhead lighting casts soft shadows and highlights the gritty textures, emphasizing dust particles in the air and the raw, rugged surfaces of the rocks.",
  "negative_prompt": "The video captures a series of frames showing ugly scenes, static with no motion, motion blur, over-saturation, shaky footage, low resolution, grainy texture, pixelated images, poorly lit areas, underexposed and overexposed scenes, poor color balance, washed out colors, choppy sequences, jerky movements, low frame rate, artifacting, color banding, unnatural transitions, outdated special effects, fake elements, unconvincing visuals, poorly edited content, jump cuts, visual noise, and flickering. Overall, the video is of poor quality.",
  "num_frames": 93,
  "num_inference_steps": 10,
  "video_output_type": "X264 (.mp4)",
  "video_quality": "high"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8fabc5/qAi19s0dSuQHDZ3O7D_HV_FkSwbls1.mp4","content_type":"video/mp4"}

- **`seed`** (`integer`, _required_):
  The random seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8fabc5/qAi19s0dSuQHDZ3O7D_HV_FkSwbls1.mp4",
    "content_type": "video/mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/cosmos-predict-2.5/distilled/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A static, locked-off camera frames an industrial conveyor belt steadily transporting rough rocks through a dimly lit quarry processing facility. The belt runs horizontally across the center of the frame, its thick black rubber surface textured with dust and fine gravel. Jagged gray and brown stones of varying sizes tumble forward in a slow, continuous motion, their sharp edges catching the light. Subtle vibrations ripple through the belt’s surface as small pebbles bounce and shift. In the background, blurred steel beams, pipes, and muted industrial machinery create depth without distraction. Cool, diffused overhead lighting casts soft shadows and highlights the gritty textures, emphasizing dust particles in the air and the raw, rugged surfaces of the rocks."
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
    "fal-ai/cosmos-predict-2.5/distilled/text-to-video",
    arguments={
        "prompt": "A static, locked-off camera frames an industrial conveyor belt steadily transporting rough rocks through a dimly lit quarry processing facility. The belt runs horizontally across the center of the frame, its thick black rubber surface textured with dust and fine gravel. Jagged gray and brown stones of varying sizes tumble forward in a slow, continuous motion, their sharp edges catching the light. Subtle vibrations ripple through the belt’s surface as small pebbles bounce and shift. In the background, blurred steel beams, pipes, and muted industrial machinery create depth without distraction. Cool, diffused overhead lighting casts soft shadows and highlights the gritty textures, emphasizing dust particles in the air and the raw, rugged surfaces of the rocks."
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

const result = await fal.subscribe("fal-ai/cosmos-predict-2.5/distilled/text-to-video", {
  input: {
    prompt: "A static, locked-off camera frames an industrial conveyor belt steadily transporting rough rocks through a dimly lit quarry processing facility. The belt runs horizontally across the center of the frame, its thick black rubber surface textured with dust and fine gravel. Jagged gray and brown stones of varying sizes tumble forward in a slow, continuous motion, their sharp edges catching the light. Subtle vibrations ripple through the belt’s surface as small pebbles bounce and shift. In the background, blurred steel beams, pipes, and muted industrial machinery create depth without distraction. Cool, diffused overhead lighting casts soft shadows and highlights the gritty textures, emphasizing dust particles in the air and the raw, rugged surfaces of the rocks."
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

- [Model Playground](https://fal.ai/models/fal-ai/cosmos-predict-2.5/distilled/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/cosmos-predict-2.5/distilled/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/cosmos-predict-2.5/distilled/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

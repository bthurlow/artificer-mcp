# LongCat Video

> Generate long videos from text using LongCat Video


## Overview

- **Endpoint**: `https://fal.run/fal-ai/longcat-video/text-to-video/480p`
- **Model ID**: `fal-ai/longcat-video/text-to-video/480p`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.025** per **generated second** of video. Generated seconds are calculated at **15 frames per second.**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to guide the video generation.
  - Examples: "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions."

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to use for the video generation. Default value: `"Bright tones, overexposed, static, blurred details, subtitles, style, works, paintings, images, static, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, still picture, messy background, three legs, many people in the background, walking backwards"`
  - Default: `"Bright tones, overexposed, static, blurred details, subtitles, style, works, paintings, images, static, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, still picture, messy background, three legs, many people in the background, walking backwards"`

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `162`
  - Default: `162`
  - Range: `17` to `961`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to use for the video generation. Default value: `40`
  - Default: `40`
  - Range: `8` to `50`

- **`guidance_scale`** (`float`, _optional_):
  The guidance scale to use for the video generation. Default value: `4`
  - Default: `4`
  - Range: `1` to `10`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`fps`** (`integer`, _optional_):
  The frame rate of the generated video. Default value: `15`
  - Default: `15`
  - Range: `1` to `60`

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable safety checker. Default value: `true`
  - Default: `true`

- **`video_output_type`** (`VideoOutputTypeEnum`, _optional_):
  The output type of the generated video. Default value: `"X264 (.mp4)"`
  - Default: `"X264 (.mp4)"`
  - Options: `"X264 (.mp4)"`, `"VP9 (.webm)"`, `"PRORES4444 (.mov)"`, `"GIF (.gif)"`

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality of the generated video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the generated video. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use for the video generation. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`
  - Examples: "regular"



**Required Parameters Example**:

```json
{
  "prompt": "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions."
}
```

**Full Example**:

```json
{
  "prompt": "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions.",
  "negative_prompt": "Bright tones, overexposed, static, blurred details, subtitles, style, works, paintings, images, static, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, still picture, messy background, three legs, many people in the background, walking backwards",
  "num_frames": 162,
  "num_inference_steps": 40,
  "guidance_scale": 4,
  "aspect_ratio": "16:9",
  "fps": 15,
  "enable_safety_checker": true,
  "video_output_type": "X264 (.mp4)",
  "video_quality": "high",
  "video_write_mode": "balanced",
  "acceleration": "regular"
}
```


### Output Schema

The API returns the following output format:

- **`prompt`** (`string`, _required_):
  The prompt used for generation.
  - Examples: "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions."

- **`seed`** (`integer`, _required_):
  The seed used for generation.
  - Examples: 424911732

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"content_type":"video/mp4","url":"https://v3b.fal.media/files/b/zebra/lXFrGA-egaUXWFGSp8GqT_BxoDEqUZ.mp4"}



**Example Response**:

```json
{
  "prompt": "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions.",
  "seed": 424911732,
  "video": {
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/zebra/lXFrGA-egaUXWFGSp8GqT_BxoDEqUZ.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/longcat-video/text-to-video/480p \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions."
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
    "fal-ai/longcat-video/text-to-video/480p",
    arguments={
        "prompt": "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions."
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

const result = await fal.subscribe("fal-ai/longcat-video/text-to-video/480p", {
  input: {
    prompt: "realistic filming style, a person wearing a dark helmet, a deep-colored jacket, blue jeans, and bright yellow shoes rides a skateboard along a winding mountain road. The skateboarder starts in a standing position, then gradually lowers into a crouch, extending one hand to touch the road surface while maintaining a low center of gravity to navigate a sharp curve. After completing the turn, the skateboarder rises back to a standing position and continues gliding forward. The background features lush green hills flanking both sides of the road, with distant snow-capped mountain peaks rising against a clear, bright blue sky. The camera follows closely from behind, smoothly tracking the skateboarder’s movements and capturing the dynamic scenery along the route. The scene is shot in natural daylight, highlighting the vivid outdoor environment and the skateboarder’s fluid actions."
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

- [Model Playground](https://fal.ai/models/fal-ai/longcat-video/text-to-video/480p)
- [API Documentation](https://fal.ai/models/fal-ai/longcat-video/text-to-video/480p/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/longcat-video/text-to-video/480p)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

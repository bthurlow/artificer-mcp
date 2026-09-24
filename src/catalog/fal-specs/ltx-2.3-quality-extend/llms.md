# Ltx 2.3 Quality

> Extend high-quality video with audio from input video using LTX-2.3


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3-quality/extend-video`
- **Model ID**: `fal-ai/ltx-2.3-quality/extend-video`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: extend, longer



## Pricing

Your request will cost **$0.0024075** per megapixel of generated video data (width × height × num_frames), rounded up. Only the generated extension segment is billed — num_frames includes the context overlap, but your source video's own frames are **never billed**, even though the returned file contains the full stitched video. For example, if you extend a video at 1280 × 720 with num_frames = 121, the generated segment is ≈112 MP, and your request will cost **$0.270**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt describing how the video should continue.
  - Examples: "Continue the scene naturally, maintaining the same style and motion."

- **`video_url`** (`string`, _required_):
  The URL of the video to extend.
  - Examples: "https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4"

- **`extend_direction`** (`ExtendDirectionEnum`, _optional_):
  Direction to extend the video. 'forward' continues from the end of the video, 'backward' generates a new beginning. Default value: `"forward"`
  - Default: `"forward"`
  - Options: `"forward"`, `"backward"`

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate for the extension segment, including num_context_frames of overlap with the source video. The new content adds approximately (num_frames - num_context_frames) / frames_per_second seconds. The stable generation budget caps the resolution x frames volume: at 24 fps roughly 20s at 480p-class, 11s at 720p-class and 5s at 1080p-class; a request above the budget returns a 422 (lower num_frames or use a smaller resolution). Default value: `121`
  - Default: `121`
  - Range: `9` to `481`

- **`num_context_frames`** (`integer`, _optional_):
  The number of source frames used as context/overlap for the extension. Snapped down to the LTX temporal grid (8k+1) and clamped to the frames available in the source video. Default value: `25`
  - Default: `25`
  - Range: `9` to `121`

- **`end_image_url`** (`string`, _optional_):
  Optional keyframe image for the far end of the extension: the final frame for forward extension, or the new first frame for backward extension.

- **`end_image_strength`** (`float`, _optional_):
  Conditioning strength of the optional end keyframe. 1.0 = exact match, lower = more freedom for the model. Default value: `1`
  - Default: `1`
  - Range: `0` to `1`

- **`resolution`** (`ImageSize | Enum`, _optional_):
  The size of the generated video. 'auto' follows the source video size/aspect up to the LTX limits; the source is scaled to the final size in the stitched output. Sizes are 32px-aligned (e.g. 1920x1080 is delivered as 1888x1056). Higher resolutions reduce the maximum stable extension length; lower resolutions can run longer. Default value: `auto`
  - Default: `"auto"`
  - One of: ImageSize | Enum

- **`match_input_fps`** (`boolean`, _optional_):
  When enabled, the output FPS matches the source video's FPS (rounded to an integer and clamped to the supported range) instead of frames_per_second. Default value: `true`
  - Default: `true`

- **`frames_per_second`** (`float`, _optional_):
  Frames per second of the generated video. Default value: `24`
  - Default: `24`
  - Range: `1` to `60`

- **`video_strength`** (`float`, _optional_):
  Conditioning strength of the source context frames. 1.0 keeps the overlap locked to the source for a seamless transition; lower values give the model more freedom. Default value: `1`
  - Default: `1`
  - Range: `0` to `1`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps. Defaults to 15 and can be increased up to 30. Default value: `15`
  - Default: `15`
  - Range: `8` to `30`

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. The default is tuned for fast, high-quality generation. Default value: `1`
  - Default: `1`
  - Range: `1` to `20`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate new audio for the extension segment (crossfaded with the source audio at the seam). When disabled, the source video's own audio track is preserved and the extension stays silent. Default value: `true`
  - Default: `true`

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to steer generation away from. Default value: `"color distortion, overexposure, static, blurry details, subtitles, style, artwork, painting, frame, still, dim overall tone, worst quality, low quality, JPEG compression artifacts, ugly, mutilated, extra fingers, poorly drawn hands, poorly drawn face, deformed, disfigured, malformed limbs, fused fingers, motionless frame, cluttered background, three legs, crowded background, walking backwards"`
  - Default: `"color distortion, overexposure, static, blurry details, subtitles, style, artwork, painting, frame, still, dim overall tone, worst quality, low quality, JPEG compression artifacts, ugly, mutilated, extra fingers, poorly drawn hands, poorly drawn face, deformed, disfigured, malformed limbs, fused fingers, motionless frame, cluttered background, three legs, crowded background, walking backwards"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. Default value: `true`
  - Default: `true`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Default value: `true`
  - Default: `true`

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality preset of the generated video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the generated video. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`

- **`sync_mode`** (`boolean`, _optional_):
  If True, the media is returned as a data URI inline in the response. Useful for short-lived requests and tests.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "Continue the scene naturally, maintaining the same style and motion.",
  "video_url": "https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4"
}
```

**Full Example**:

```json
{
  "prompt": "Continue the scene naturally, maintaining the same style and motion.",
  "video_url": "https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4",
  "extend_direction": "forward",
  "num_frames": 121,
  "num_context_frames": 25,
  "end_image_strength": 1,
  "resolution": "auto",
  "match_input_fps": true,
  "frames_per_second": 24,
  "video_strength": 1,
  "num_inference_steps": 15,
  "guidance_scale": 1,
  "generate_audio": true,
  "negative_prompt": "color distortion, overexposure, static, blurry details, subtitles, style, artwork, painting, frame, still, dim overall tone, worst quality, low quality, JPEG compression artifacts, ugly, mutilated, extra fingers, poorly drawn hands, poorly drawn face, deformed, disfigured, malformed limbs, fused fingers, motionless frame, cluttered background, three legs, crowded background, walking backwards",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "video_quality": "high",
  "video_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.

- **`seed`** (`integer`, _required_):
  The seed actually used for generation.

- **`prompt`** (`string`, _required_):
  The prompt used for generation (after any expansion).



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
  --url https://fal.run/fal-ai/ltx-2.3-quality/extend-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Continue the scene naturally, maintaining the same style and motion.",
     "video_url": "https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4"
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
    "fal-ai/ltx-2.3-quality/extend-video",
    arguments={
        "prompt": "Continue the scene naturally, maintaining the same style and motion.",
        "video_url": "https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4"
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

const result = await fal.subscribe("fal-ai/ltx-2.3-quality/extend-video", {
  input: {
    prompt: "Continue the scene naturally, maintaining the same style and motion.",
    video_url: "https://v3b.fal.media/files/b/0a8824b1/sdm0KfmenrlywesfzY1Y1_if6euPp1.mp4"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3-quality/extend-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3-quality/extend-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3-quality/extend-video)

### fal.ai Platform

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

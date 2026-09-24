# Wan 2.2 VACE Fun A14B

> VACE Fun for Wan 2.2 A14B from Alibaba-PAI


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan-22-vace-fun-a14b/inpainting`
- **Model ID**: `fal-ai/wan-22-vace-fun-a14b/inpainting`
- **Category**: video-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.10** per **video second** for **720p**, **$0.075** per **video second** for **580p**, **$0.05** per **video second** for **480p**. Video seconds are calculated at 16 frames per second.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "The video shows a man riding a horse on a vast grassland. He has long lavender hair and wears a traditional dress of a white top and black pants. The animation style makes him look like he is doing some kind of outdoor activity or performing. The background is a spectacular mountain range and cloud sky, giving a sense of tranquility and vastness. The entire video is shot from a fixed angle, focusing on the rider and his horse."

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `"letterboxing, borders, black bars, bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"`
  - Default: `"letterboxing, borders, black bars, bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"`
  - Examples: "letterboxing, borders, black bars, bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"

- **`match_input_num_frames`** (`boolean`, _optional_):
  If true, the number of frames in the generated video will match the number of frames in the input video. If false, the number of frames will be determined by the num_frames parameter.
  - Default: `false`
  - Examples: false

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 81 to 241 (inclusive). Default value: `81`
  - Default: `81`
  - Range: `17` to `241`

- **`match_input_frames_per_second`** (`boolean`, _optional_):
  If true, the frames per second of the generated video will match the input video. If false, the frames per second will be determined by the frames_per_second parameter.
  - Default: `false`
  - Examples: false

- **`frames_per_second`** (`integer`, _optional_):
  Frames per second of the generated video. Must be between 5 to 30. Ignored if match_input_frames_per_second is true. Default value: `16`
  - Default: `16`
  - Range: `5` to `30`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"240p"`, `"360p"`, `"480p"`, `"580p"`, `"720p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"1:1"`, `"9:16"`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of inference steps for sampling. Higher values give better quality but take longer. Default value: `30`
  - Default: `30`
  - Range: `2` to `50`

- **`guidance_scale`** (`float`, _optional_):
  Guidance scale for classifier-free guidance. Higher values encourage the model to generate images closely related to the text prompt. Default value: `5`
  - Default: `5`
  - Range: `1` to `10`
  - Examples: 5

- **`sampler`** (`SamplerEnum`, _optional_):
  Sampler to use for video generation. Default value: `"unipc"`
  - Default: `"unipc"`
  - Options: `"unipc"`, `"dpm++"`, `"euler"`
  - Examples: "unipc"

- **`shift`** (`float`, _optional_):
  Shift parameter for video generation. Default value: `5`
  - Default: `5`
  - Range: `1` to `15`

- **`video_url`** (`string`, _required_):
  URL to the source video file. Required for inpainting.
  - Examples: "https://storage.googleapis.com/falserverless/vace/src_video.mp4"

- **`mask_video_url`** (`string`, _optional_):
  URL to the source mask file. Required for inpainting.
  - Examples: "https://storage.googleapis.com/falserverless/vace/src_mask.mp4"

- **`mask_image_url`** (`string`, _optional_):
  URL to the guiding mask file. If provided, the model will use this mask as a reference to create masked video using salient mask tracking. Will be ignored if mask_video_url is provided.

- **`ref_image_urls`** (`list<string>`, _optional_):
  Urls to source reference image. If provided, the model will use this image as reference.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/vace/src_ref_image_1.png"]

- **`first_frame_url`** (`string`, _optional_):
  URL to the first frame of the video. If provided, the model will use this frame as a reference.

- **`last_frame_url`** (`string`, _optional_):
  URL to the last frame of the video. If provided, the model will use this frame as a reference.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked.
  - Default: `false`
  - Examples: true

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion.
  - Default: `false`
  - Examples: false

- **`preprocess`** (`boolean`, _optional_):
  Whether to preprocess the input video.
  - Default: `false`
  - Examples: false

- **`acceleration`** (`Enum`, _optional_):
  Acceleration to use for inference. Options are 'none' or 'regular'. Accelerated inference will very slightly affect output, but will be significantly faster. Default value: `regular`
  - Default: `"regular"`
  - Options: `"none"`, `"low"`, `"regular"`
  - Examples: "regular"

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality of the generated video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`
  - Examples: "high"

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the generated video. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`
  - Examples: "balanced"

- **`num_interpolated_frames`** (`integer`, _optional_):
  Number of frames to interpolate between the original frames. A value of 0 means no interpolation.
  - Default: `0`
  - Range: `0` to `5`
  - Examples: 0

- **`temporal_downsample_factor`** (`integer`, _optional_):
  Temporal downsample factor for the video. This is an integer value that determines how many frames to skip in the video. A value of 0 means no downsampling. For each downsample factor, one upsample factor will automatically be applied.
  - Default: `0`
  - Range: `0` to `5`
  - Examples: 0

- **`enable_auto_downsample`** (`boolean`, _optional_):
  If true, the model will automatically temporally downsample the video to an appropriate frame length for the model, then will interpolate it back to the original frame length.
  - Default: `false`
  - Examples: false

- **`auto_downsample_min_fps`** (`float`, _optional_):
  The minimum frames per second to downsample the video to. This is used to help determine the auto downsample factor to try and find the lowest detail-preserving downsample factor. The default value is appropriate for most videos, if you are using a video with very fast motion, you may need to increase this value. If your video has a very low amount of motion, you could decrease this value to allow for higher downsampling and thus longer sequences. Default value: `15`
  - Default: `15`
  - Range: `1` to `60`
  - Examples: 15

- **`interpolator_model`** (`InterpolatorModelEnum`, _optional_):
  The model to use for frame interpolation. Options are 'rife' or 'film'. Default value: `"film"`
  - Default: `"film"`
  - Options: `"rife"`, `"film"`
  - Examples: "film"

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`
  - Examples: false

- **`transparency_mode`** (`TransparencyModeEnum`, _optional_):
  The transparency mode to apply to the first and last frames. This controls how the transparent areas of the first and last frames are filled. Default value: `"content_aware"`
  - Default: `"content_aware"`
  - Options: `"content_aware"`, `"white"`, `"black"`
  - Examples: "content_aware"

- **`return_frames_zip`** (`boolean`, _optional_):
  If true, also return a ZIP file containing all generated frames.
  - Default: `false`
  - Examples: false



**Required Parameters Example**:

```json
{
  "prompt": "The video shows a man riding a horse on a vast grassland. He has long lavender hair and wears a traditional dress of a white top and black pants. The animation style makes him look like he is doing some kind of outdoor activity or performing. The background is a spectacular mountain range and cloud sky, giving a sense of tranquility and vastness. The entire video is shot from a fixed angle, focusing on the rider and his horse.",
  "video_url": "https://storage.googleapis.com/falserverless/vace/src_video.mp4"
}
```

**Full Example**:

```json
{
  "prompt": "The video shows a man riding a horse on a vast grassland. He has long lavender hair and wears a traditional dress of a white top and black pants. The animation style makes him look like he is doing some kind of outdoor activity or performing. The background is a spectacular mountain range and cloud sky, giving a sense of tranquility and vastness. The entire video is shot from a fixed angle, focusing on the rider and his horse.",
  "negative_prompt": "letterboxing, borders, black bars, bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards",
  "match_input_num_frames": false,
  "num_frames": 81,
  "match_input_frames_per_second": false,
  "frames_per_second": 16,
  "resolution": "auto",
  "aspect_ratio": "auto",
  "num_inference_steps": 30,
  "guidance_scale": 5,
  "sampler": "unipc",
  "shift": 5,
  "video_url": "https://storage.googleapis.com/falserverless/vace/src_video.mp4",
  "mask_video_url": "https://storage.googleapis.com/falserverless/vace/src_mask.mp4",
  "ref_image_urls": [
    "https://storage.googleapis.com/falserverless/vace/src_ref_image_1.png"
  ],
  "enable_safety_checker": true,
  "enable_prompt_expansion": false,
  "preprocess": false,
  "acceleration": "regular",
  "video_quality": "high",
  "video_write_mode": "balanced",
  "num_interpolated_frames": 0,
  "temporal_downsample_factor": 0,
  "enable_auto_downsample": false,
  "auto_downsample_min_fps": 15,
  "interpolator_model": "film",
  "sync_mode": false,
  "transparency_mode": "content_aware",
  "return_frames_zip": false
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated inpainting video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/wan-vace-inpainting-output.mp4"}

- **`prompt`** (`string`, _required_):
  The prompt used for generation.

- **`seed`** (`integer`, _required_):
  The seed used for generation.

- **`frames_zip`** (`File`, _optional_):
  ZIP archive of all video frames if requested.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/wan-vace-inpainting-output.mp4"
  },
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan-22-vace-fun-a14b/inpainting \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "The video shows a man riding a horse on a vast grassland. He has long lavender hair and wears a traditional dress of a white top and black pants. The animation style makes him look like he is doing some kind of outdoor activity or performing. The background is a spectacular mountain range and cloud sky, giving a sense of tranquility and vastness. The entire video is shot from a fixed angle, focusing on the rider and his horse.",
     "video_url": "https://storage.googleapis.com/falserverless/vace/src_video.mp4"
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
    "fal-ai/wan-22-vace-fun-a14b/inpainting",
    arguments={
        "prompt": "The video shows a man riding a horse on a vast grassland. He has long lavender hair and wears a traditional dress of a white top and black pants. The animation style makes him look like he is doing some kind of outdoor activity or performing. The background is a spectacular mountain range and cloud sky, giving a sense of tranquility and vastness. The entire video is shot from a fixed angle, focusing on the rider and his horse.",
        "video_url": "https://storage.googleapis.com/falserverless/vace/src_video.mp4"
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

const result = await fal.subscribe("fal-ai/wan-22-vace-fun-a14b/inpainting", {
  input: {
    prompt: "The video shows a man riding a horse on a vast grassland. He has long lavender hair and wears a traditional dress of a white top and black pants. The animation style makes him look like he is doing some kind of outdoor activity or performing. The background is a spectacular mountain range and cloud sky, giving a sense of tranquility and vastness. The entire video is shot from a fixed angle, focusing on the rider and his horse.",
    video_url: "https://storage.googleapis.com/falserverless/vace/src_video.mp4"
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

- [Model Playground](https://fal.ai/models/fal-ai/wan-22-vace-fun-a14b/inpainting)
- [API Documentation](https://fal.ai/models/fal-ai/wan-22-vace-fun-a14b/inpainting/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan-22-vace-fun-a14b/inpainting)

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

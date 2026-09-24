# Seedance 2.5 Reference to Video

> Dreamina Seedance 2.5 generates video from up to 50 multimodal references images, video, audio, and style inputs, locking a character, set, and palette across a full 30-second take for production-grade consistency.


## Overview

- **Endpoint**: `https://fal.run/bytedance/seedance-2.5/reference-to-video`
- **Model ID**: `bytedance/seedance-2.5/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

For 480p, your request will cost roughly **$0.2205** per second of generated video, for 720p, you will be charged roughly **$0.4730** per second of generated video, and for 1080p, roughly **$1.164** per second of generated video. Your request will cost **$0.0214** per 1000 tokens for 480p and 720p video and roughly **$0.0234** per 1000 tokens for 1080p video. The number of tokens is roughly given by (height of output video * width of output video * (input video duration + output video duration) * 24) / 1024. If video inputs are provided the price is multiplied by 0.6. With video inputs and 720p resolution, the price is roughly **$0.2838** per second of generated video. With video references, you will be charged for both input and output videos.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used to generate the video.
  - Examples: "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut scene to an octopus football game under the sea."

- **`task`** (`TaskEnum`, _optional_):
  The type of video generation task. Reference uses the supplied media as guidance. Editing modifies a reference video and automatically coerces aspect_ratio and duration to auto. Extension continues a reference video and automatically coerces aspect_ratio to auto. Default value: `"reference"`
  - Default: `"reference"`
  - Options: `"reference"`, `"editing"`, `"extension"`

- **`image_urls`** (`list<string>`, _optional_):
  Reference images to guide video generation. Refer to them in the prompt as @Image1, @Image2, etc. Supported formats: JPG, PNG, WebP, BMP, TIFF, GIF, HEIC, HEIF. Max 30 MB per image. Up to 30 images. Total files across all modalities must not exceed 50.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a8eba37/Cqg-4Uwzyz4DELfceT1CF_a17e588773ec45b1a9e6f100a787b80b.jpg"]

- **`video_urls`** (`list<string>`, _optional_):
  Reference videos to guide video generation. Refer to them in the prompt as @Video1, @Video2, etc. Supported formats: MP4, MOV. Up to 10 videos. Each video must be 1.8 to 30.2 seconds and no larger than 200 MB; combined duration must not exceed 30.2 seconds. Dimensions must be 300 to 6,000 pixels per side, aspect ratio 0.4 to 2.5, and frame rate 24 to 60 FPS.
  - Array of string

- **`audio_urls`** (`list<string>`, _optional_):
  Reference audio to guide video generation. Refer to them in the prompt as @Audio1, @Audio2, etc. Supported formats: MP3, WAV. Up to 10 files. Each file must be 1.8 to 30.2 seconds and no larger than 15 MB; combined duration must not exceed 30.2 seconds. At least one reference image or video is required.
  - Array of string

- **`resolution`** (`ResolutionEnum`, _optional_):
  Video resolution - 480p for faster generation, 720p for balance, 1080p for high quality. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the video in seconds. Supports 4 to 30 seconds, or auto to let the model decide based on the prompt. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, `"13"`, `"14"`, `"15"`, `"16"`, `"17"`, `"18"`, `"19"`, `"20"`, `"21"`, `"22"`, `"23"`, `"24"`, `"25"`, `"26"`, `"27"`, `"28"`, `"29"`, `"30"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Use 16:9 for landscape, 9:16 for portrait/vertical, 1:1 for square, 21:9 for ultrawide cinematic, or auto to let the model decide. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"21:9"`, `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate synchronized audio for the video, including sound effects, ambient sounds, and lip-synced speech. The cost of video generation is the same regardless of whether audio is generated or not. Default value: `true`
  - Default: `true`

- **`bitrate_mode`** (`BitrateModeEnum`, _optional_):
  Output bitrate mode. 'high' requests a higher-quality, larger-file encode from the model; 'standard' uses the default bitrate. Default value: `"standard"`
  - Default: `"standard"`
  - Options: `"standard"`, `"high"`
  - Examples: "standard"

- **`codec`** (`CodecEnum`, _optional_):
  'auto' retains default video codec behaviour; 'H264' uses H.264; 'H265' uses H.265. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"H264"`, `"H265"`
  - Examples: "auto", "H264", "H265"

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Note that results may still vary slightly even with the same seed.

- **`end_user_id`** (`string`, _optional_):
  The unique user ID of the end user.



**Required Parameters Example**:

```json
{
  "prompt": "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut scene to an octopus football game under the sea."
}
```

**Full Example**:

```json
{
  "prompt": "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut scene to an octopus football game under the sea.",
  "task": "reference",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a8eba37/Cqg-4Uwzyz4DELfceT1CF_a17e588773ec45b1a9e6f100a787b80b.jpg"
  ],
  "resolution": "720p",
  "duration": "auto",
  "aspect_ratio": "auto",
  "generate_audio": true,
  "bitrate_mode": "standard",
  "codec": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/bytedance/seedance_2/output.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.
  - Examples: 42



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/bytedance/seedance_2/output.mp4"
  },
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bytedance/seedance-2.5/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut scene to an octopus football game under the sea."
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
    "bytedance/seedance-2.5/reference-to-video",
    arguments={
        "prompt": "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut scene to an octopus football game under the sea."
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

const result = await fal.subscribe("bytedance/seedance-2.5/reference-to-video", {
  input: {
    prompt: "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut scene to an octopus football game under the sea."
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

- [Model Playground](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video)
- [API Documentation](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bytedance/seedance-2.5/reference-to-video)

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

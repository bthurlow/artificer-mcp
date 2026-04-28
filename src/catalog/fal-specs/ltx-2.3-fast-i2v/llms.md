# LTX 2.3 Video Fast

> LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3/image-to-video/fast`
- **Model ID**: `fal-ai/ltx-2.3/image-to-video/fast`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will cost **$0.06** per second for 1080p, **$0.12** per second for 1440p or **$0.24** per second for 2160p.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the image to generate the video from. Must be publicly accessible or base64 data URI. Supports PNG, JPEG, WebP, AVIF, and HEIF formats.
  - Examples: "https://v3b.fal.media/files/b/0a90dd09/SnnnNct-o_zpGVEHDNVQ0_image_049.png"

- **`end_image_url`** (`string`, _optional_):
  The URL of the end image to use for the generated video. When provided, generates a transition video between start and end frames.

- **`prompt`** (`string`, _required_):
  The prompt to generate the video from
  - Examples: "Snorkel lens ground-scraping tracking shot following a barefoot Ethiopian long-distance runner training on a dirt road at dawn, camera inches from the ground racing alongside, her feet kicking up red dust in slow motion at 240fps, Rift Valley landscape blurred in the background, the texture of earth and callused skin in hyper-detail, 40mm snorkel lens at ground height, Nike Running documentary meets Lubezki natural light, the poetry of human endurance"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds. The fast model supports 6-20 seconds. Note: Durations longer than 10 seconds (12, 14, 16, 18, 20) are only supported with 25 FPS and 1080p resolution. Default value: `"6"`
  - Default: `6`
  - Options: `6`, `8`, `10`, `12`, `14`, `16`, `18`, `20`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"1080p"`, `"1440p"`, `"2160p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"9:16"`

- **`fps`** (`FramesperSecondEnum`, _optional_):
  The frames per second of the generated video Default value: `"25"`
  - Default: `25`
  - Options: `24`, `25`, `48`, `50`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the generated video Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a90dd09/SnnnNct-o_zpGVEHDNVQ0_image_049.png",
  "prompt": "Snorkel lens ground-scraping tracking shot following a barefoot Ethiopian long-distance runner training on a dirt road at dawn, camera inches from the ground racing alongside, her feet kicking up red dust in slow motion at 240fps, Rift Valley landscape blurred in the background, the texture of earth and callused skin in hyper-detail, 40mm snorkel lens at ground height, Nike Running documentary meets Lubezki natural light, the poetry of human endurance"
}
```

**Full Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a90dd09/SnnnNct-o_zpGVEHDNVQ0_image_049.png",
  "prompt": "Snorkel lens ground-scraping tracking shot following a barefoot Ethiopian long-distance runner training on a dirt road at dawn, camera inches from the ground racing alongside, her feet kicking up red dust in slow motion at 240fps, Rift Valley landscape blurred in the background, the texture of earth and callused skin in hyper-detail, 40mm snorkel lens at ground height, Nike Running documentary meets Lubezki natural light, the poetry of human endurance",
  "duration": 6,
  "resolution": "1080p",
  "aspect_ratio": "auto",
  "fps": 25,
  "generate_audio": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file
  - Examples: {"file_name":"JCP0MJDH3ioOFzRd7GsGi_aB0OxLmA.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a90dd0b/JCP0MJDH3ioOFzRd7GsGi_aB0OxLmA.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "JCP0MJDH3ioOFzRd7GsGi_aB0OxLmA.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a90dd0b/JCP0MJDH3ioOFzRd7GsGi_aB0OxLmA.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2.3/image-to-video/fast \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3b.fal.media/files/b/0a90dd09/SnnnNct-o_zpGVEHDNVQ0_image_049.png",
     "prompt": "Snorkel lens ground-scraping tracking shot following a barefoot Ethiopian long-distance runner training on a dirt road at dawn, camera inches from the ground racing alongside, her feet kicking up red dust in slow motion at 240fps, Rift Valley landscape blurred in the background, the texture of earth and callused skin in hyper-detail, 40mm snorkel lens at ground height, Nike Running documentary meets Lubezki natural light, the poetry of human endurance"
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
    "fal-ai/ltx-2.3/image-to-video/fast",
    arguments={
        "image_url": "https://v3b.fal.media/files/b/0a90dd09/SnnnNct-o_zpGVEHDNVQ0_image_049.png",
        "prompt": "Snorkel lens ground-scraping tracking shot following a barefoot Ethiopian long-distance runner training on a dirt road at dawn, camera inches from the ground racing alongside, her feet kicking up red dust in slow motion at 240fps, Rift Valley landscape blurred in the background, the texture of earth and callused skin in hyper-detail, 40mm snorkel lens at ground height, Nike Running documentary meets Lubezki natural light, the poetry of human endurance"
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

const result = await fal.subscribe("fal-ai/ltx-2.3/image-to-video/fast", {
  input: {
    image_url: "https://v3b.fal.media/files/b/0a90dd09/SnnnNct-o_zpGVEHDNVQ0_image_049.png",
    prompt: "Snorkel lens ground-scraping tracking shot following a barefoot Ethiopian long-distance runner training on a dirt road at dawn, camera inches from the ground racing alongside, her feet kicking up red dust in slow motion at 240fps, Rift Valley landscape blurred in the background, the texture of earth and callused skin in hyper-detail, 40mm snorkel lens at ground height, Nike Running documentary meets Lubezki natural light, the poetry of human endurance"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3/image-to-video/fast)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3/image-to-video/fast/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3/image-to-video/fast)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

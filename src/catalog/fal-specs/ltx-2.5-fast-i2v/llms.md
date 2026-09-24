# LTX 2.5 Image to Video Fast

> LTX-2.5 is Lightricks' open-source audio-video model. This endpoint animates a still image into video with synchronized audio in a single pass, in a speed-optimized mode for quick iteration.


## Overview

- **Endpoint**: `https://fal.run/lightricks/ltx-2.5/image-to-video/fast`
- **Model ID**: `lightricks/ltx-2.5/image-to-video/fast`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lip-sync



## Pricing

Billing is calculated per second of video generated. For **720p**, your request will cost **$0.09** per second; for **1080p**, **$0.13** per second; for **1440p**, **$0.19** per second; and for **4K**, **$0.30** per second. Native audio is included at every resolution. For **$1** you can run this model for approximately **11 seconds** at **720p** or about **3 seconds** at **4K**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The URL of the start image to use for the generated video.
  - Examples: "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png"

- **`end_image_url`** (`string`, _optional_):
  The URL of the end image to use for the generated video. When provided, generates a transition video between start and end frames.

- **`prompt`** (`string`, _required_):
  The prompt to use for the generated video
  - Examples: "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds. At 720p and 1080p, 24 or 25 FPS supports up to 20 seconds, while 48 or 50 FPS supports up to 10 seconds. At 1440p and 2160p, all frame rates support up to 10 seconds. Set to 'auto' to let the model choose the duration automatically. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `6`, `8`, `10`, `12`, `14`, `16`, `18`, `20`, `"auto"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`, `"1440p"`, `"2160p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"16:9"`, `"9:16"`

- **`fps`** (`FramesperSecondEnum`, _optional_):
  The frames per second of the generated video. Default value: `"25"`
  - Default: `25`
  - Options: `24`, `25`, `48`, `50`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the generated video Default value: `true`
  - Default: `true`

- **`camera_motion`** (`Enum`, _optional_):
  Optional camera motion applied to the generated video.
  - Options: `"dolly_in"`, `"dolly_out"`, `"dolly_left"`, `"dolly_right"`, `"jib_up"`, `"jib_down"`, `"static"`, `"focus_shift"`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png",
  "prompt": "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki"
}
```

**Full Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png",
  "prompt": "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki",
  "duration": "auto",
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
  --url https://fal.run/lightricks/ltx-2.5/image-to-video/fast \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png",
     "prompt": "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki"
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
    "lightricks/ltx-2.5/image-to-video/fast",
    arguments={
        "image_url": "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png",
        "prompt": "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki"
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

const result = await fal.subscribe("lightricks/ltx-2.5/image-to-video/fast", {
  input: {
    image_url: "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png",
    prompt: "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki"
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

- [Model Playground](https://fal.ai/models/lightricks/ltx-2.5/image-to-video/fast)
- [API Documentation](https://fal.ai/models/lightricks/ltx-2.5/image-to-video/fast/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=lightricks/ltx-2.5/image-to-video/fast)

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

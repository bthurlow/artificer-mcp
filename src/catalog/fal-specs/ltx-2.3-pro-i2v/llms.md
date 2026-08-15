# LTX 2.3 Video Pro

> LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3/image-to-video`
- **Model ID**: `fal-ai/ltx-2.3/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will cost $0.06 per second for 1080p, $0.12 per second for 1440p or $0.24 per second for 2160p.

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
  The duration of the generated video in seconds Default value: `"6"`
  - Default: `6`
  - Options: `6`, `8`, `10`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"1080p"`, `"1440p"`, `"2160p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image. Default value: `"auto"`
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
  "image_url": "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png",
  "prompt": "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki"
}
```

**Full Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a90dd31/uJG2pMMJMcnVeC4PmwnAF_image_004.png",
  "prompt": "Periscope-level shot from behind tall grass of two Maasai warriors mid-leap during an adumu jumping dance, bodies fully airborne against a golden savanna sunset, red shuka robes frozen in motion, dust kicked up from the earth catching backlight, 85mm f/1.4 isolating the pair from a blurred circle of onlookers, Steve McCurry meets Emmanuel Lubezki",
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
  - Examples: {"file_name":"VUCTD0YYJIp_K4qQkkneL_wMVDWNRn.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a90dd31/VUCTD0YYJIp_K4qQkkneL_wMVDWNRn.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "VUCTD0YYJIp_K4qQkkneL_wMVDWNRn.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a90dd31/VUCTD0YYJIp_K4qQkkneL_wMVDWNRn.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2.3/image-to-video \
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
    "fal-ai/ltx-2.3/image-to-video",
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

const result = await fal.subscribe("fal-ai/ltx-2.3/image-to-video", {
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

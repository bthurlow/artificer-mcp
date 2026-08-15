# LTX 2.3 Video Fast

> LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3/text-to-video/fast`
- **Model ID**: `fal-ai/ltx-2.3/text-to-video/fast`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will cost $0.04 per second for 1080p, $0.08 per second for 1440p or $0.16 per second for 2160p.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to use for the generated video
  - Examples: "Drone descent through the open oculus of a derelict Soviet-era radio telescope dish, spiraling downward into the rusted parabolic bowl where a lone botanist catalogs wildflowers growing through cracked concrete, her red jacket the only color against oxidized metal and grey sky, 24mm on a caged FPV drone, the descent creating a vertigo spiral, Tarkovsky Stalker zones of alien beauty reclaiming technology, science swallowed by nature"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds. The fast model supports 6-20 seconds. Note: Durations longer than 10 seconds (12, 14, 16, 18, 20) are only supported with 25 FPS and 1080p resolution. Default value: `"6"`
  - Default: `6`
  - Options: `6`, `8`, `10`, `12`, `14`, `16`, `18`, `20`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"1080p"`, `"1440p"`, `"2160p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

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
  "prompt": "Drone descent through the open oculus of a derelict Soviet-era radio telescope dish, spiraling downward into the rusted parabolic bowl where a lone botanist catalogs wildflowers growing through cracked concrete, her red jacket the only color against oxidized metal and grey sky, 24mm on a caged FPV drone, the descent creating a vertigo spiral, Tarkovsky Stalker zones of alien beauty reclaiming technology, science swallowed by nature"
}
```

**Full Example**:

```json
{
  "prompt": "Drone descent through the open oculus of a derelict Soviet-era radio telescope dish, spiraling downward into the rusted parabolic bowl where a lone botanist catalogs wildflowers growing through cracked concrete, her red jacket the only color against oxidized metal and grey sky, 24mm on a caged FPV drone, the descent creating a vertigo spiral, Tarkovsky Stalker zones of alien beauty reclaiming technology, science swallowed by nature",
  "duration": 6,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "fps": 25,
  "generate_audio": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file
  - Examples: {"file_name":"7ufClzCcdMD-up1rau1jF_6xx4WLgg.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a90dde7/7ufClzCcdMD-up1rau1jF_6xx4WLgg.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "7ufClzCcdMD-up1rau1jF_6xx4WLgg.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a90dde7/7ufClzCcdMD-up1rau1jF_6xx4WLgg.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2.3/text-to-video/fast \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Drone descent through the open oculus of a derelict Soviet-era radio telescope dish, spiraling downward into the rusted parabolic bowl where a lone botanist catalogs wildflowers growing through cracked concrete, her red jacket the only color against oxidized metal and grey sky, 24mm on a caged FPV drone, the descent creating a vertigo spiral, Tarkovsky Stalker zones of alien beauty reclaiming technology, science swallowed by nature"
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
    "fal-ai/ltx-2.3/text-to-video/fast",
    arguments={
        "prompt": "Drone descent through the open oculus of a derelict Soviet-era radio telescope dish, spiraling downward into the rusted parabolic bowl where a lone botanist catalogs wildflowers growing through cracked concrete, her red jacket the only color against oxidized metal and grey sky, 24mm on a caged FPV drone, the descent creating a vertigo spiral, Tarkovsky Stalker zones of alien beauty reclaiming technology, science swallowed by nature"
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

const result = await fal.subscribe("fal-ai/ltx-2.3/text-to-video/fast", {
  input: {
    prompt: "Drone descent through the open oculus of a derelict Soviet-era radio telescope dish, spiraling downward into the rusted parabolic bowl where a lone botanist catalogs wildflowers growing through cracked concrete, her red jacket the only color against oxidized metal and grey sky, 24mm on a caged FPV drone, the descent creating a vertigo spiral, Tarkovsky Stalker zones of alien beauty reclaiming technology, science swallowed by nature"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3/text-to-video/fast)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3/text-to-video/fast/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3/text-to-video/fast)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

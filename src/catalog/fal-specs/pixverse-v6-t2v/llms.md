# PixVerse

> Pixverse's latest v6 Model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/pixverse/v6/text-to-video`
- **Model ID**: `fal-ai/pixverse/v6/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video



## Pricing

Billing is calculated per second of video generated. For 360p, your request will cost **$0.025** per second without audio and **$0.035** per second with audio. For 540p, it will cost **$0.035** per second without audio and **$0.045** per second with audio. For 720p, it will cost **$0.045** per second without audio and **$0.060** per second with audio. For 1080p, it will cost **$0.090** per second without audio and **$0.115** per second with audio. For **$1** you can run this model for approximately **40 seconds** at 360p (no audio) or about **11 seconds** at 1080p (no audio).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "Epic low-cut camera capture of a girl clad in ultraviolet threads, Peter Max art style depiction, luminous diamond skin glistening under a vast moon's radiance, embodied in a superhuman flight among mystical ruins, symbolizing a deity's ritual ascent, hyper-detailed"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`, `"2:3"`, `"3:2"`, `"21:9"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"360p"`, `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`integer`, _optional_):
  The duration of the generated video in seconds. v6 supports values from 1 to 15 seconds Default value: `5`
  - Default: `5`
  - Range: `1` to `15`

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt to be used for the generation Default value: `""`
  - Default: `""`
  - Examples: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded"

- **`style`** (`Enum`, _optional_):
  The style of the generated video
  - Options: `"anime"`, `"3d_animation"`, `"clay"`, `"comic"`, `"cyberpunk"`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of the model
  will output the same video every time.

- **`generate_audio_switch`** (`boolean`, _optional_):
  Enable audio generation (BGM, SFX, dialogue)
  - Default: `false`

- **`generate_multi_clip_switch`** (`boolean`, _optional_):
  Enable multi-clip generation with dynamic camera changes
  - Default: `false`

- **`thinking_type`** (`Enum`, _optional_):
  Prompt optimization mode: 'enabled' to optimize, 'disabled' to turn off, 'auto' for model decision
  - Options: `"enabled"`, `"disabled"`, `"auto"`



**Required Parameters Example**:

```json
{
  "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, Peter Max art style depiction, luminous diamond skin glistening under a vast moon's radiance, embodied in a superhuman flight among mystical ruins, symbolizing a deity's ritual ascent, hyper-detailed"
}
```

**Full Example**:

```json
{
  "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, Peter Max art style depiction, luminous diamond skin glistening under a vast moon's radiance, embodied in a superhuman flight among mystical ruins, symbolizing a deity's ritual ascent, hyper-detailed",
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "duration": 5,
  "negative_prompt": "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"file_name":"output.mp4","url":"https://storage.googleapis.com/falserverless/model_tests/video_models/output-4.mp4","file_size":5485412,"content_type":"video/mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "output.mp4",
    "url": "https://storage.googleapis.com/falserverless/model_tests/video_models/output-4.mp4",
    "file_size": 5485412,
    "content_type": "video/mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/pixverse/v6/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, Peter Max art style depiction, luminous diamond skin glistening under a vast moon's radiance, embodied in a superhuman flight among mystical ruins, symbolizing a deity's ritual ascent, hyper-detailed"
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
    "fal-ai/pixverse/v6/text-to-video",
    arguments={
        "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, Peter Max art style depiction, luminous diamond skin glistening under a vast moon's radiance, embodied in a superhuman flight among mystical ruins, symbolizing a deity's ritual ascent, hyper-detailed"
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

const result = await fal.subscribe("fal-ai/pixverse/v6/text-to-video", {
  input: {
    prompt: "Epic low-cut camera capture of a girl clad in ultraviolet threads, Peter Max art style depiction, luminous diamond skin glistening under a vast moon's radiance, embodied in a superhuman flight among mystical ruins, symbolizing a deity's ritual ascent, hyper-detailed"
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

- [Model Playground](https://fal.ai/models/fal-ai/pixverse/v6/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/pixverse/v6/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/pixverse/v6/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# PixVerse C1 Text to Video

> Generate film-grade videos from text prompts with native audio, up to 1080p and 15 seconds, using PixVerse C1.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/pixverse/c1/text-to-video`
- **Model ID**: `fal-ai/pixverse/c1/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: video-generation, text-to-video, pixverse, cinematic, film, 1080p, audio



## Pricing

Billing is calculated per second of video generated. For 360p, your request will cost **$0.030** per second without audio and **$0.040** per second with audio. For 540p, it will cost **$0.040** per second without audio and **$0.050** per second with audio. For 720p, it will cost **$0.050** per second without audio and **$0.065** per second with audio. For 1080p, it will cost **$0.095** per second without audio and **$0.120** per second with audio. For **$1** you can run this model for approximately **33 seconds** at 360p (no audio) or about **10 seconds** at 1080p (no audio).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "Epic low-cut camera capture of a girl clad in ultraviolet threads, luminous diamond skin glistening under a vast moon's radiance, hyper-detailed"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`, `"2:3"`, `"3:2"`, `"21:9"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"360p"`, `"540p"`, `"720p"`, `"1080p"`

- **`duration`** (`integer`, _optional_):
  The duration of the generated video in seconds (1-15) Default value: `5`
  - Default: `5`
  - Range: `1` to `15`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of the model
  will output the same video every time.

- **`generate_audio_switch`** (`boolean`, _optional_):
  Enable audio generation (BGM, SFX, dialogue)
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, luminous diamond skin glistening under a vast moon's radiance, hyper-detailed"
}
```

**Full Example**:

```json
{
  "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, luminous diamond skin glistening under a vast moon's radiance, hyper-detailed",
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "duration": 5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.



**Example Response**:

```json
{
  "video": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/pixverse/c1/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, luminous diamond skin glistening under a vast moon's radiance, hyper-detailed"
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
    "fal-ai/pixverse/c1/text-to-video",
    arguments={
        "prompt": "Epic low-cut camera capture of a girl clad in ultraviolet threads, luminous diamond skin glistening under a vast moon's radiance, hyper-detailed"
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

const result = await fal.subscribe("fal-ai/pixverse/c1/text-to-video", {
  input: {
    prompt: "Epic low-cut camera capture of a girl clad in ultraviolet threads, luminous diamond skin glistening under a vast moon's radiance, hyper-detailed"
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

- [Model Playground](https://fal.ai/models/fal-ai/pixverse/c1/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/pixverse/c1/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/pixverse/c1/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

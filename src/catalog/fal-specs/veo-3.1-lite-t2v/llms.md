# Veo3.1 Lite Text to Video

> Veo 3.1 Lite balances practical utility with professional capabilities, supporting Text-to-Video and Image-to-Video


## Overview

- **Endpoint**: `https://fal.run/fal-ai/veo3.1/lite`
- **Model ID**: `fal-ai/veo3.1/lite`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

For every second of video you generate you will be charged **$0.05** for 720p with audio, **$0.03** for 720p without audio, **$0.08** for 1080p with audio or **$0.05** for 1080p without audio. For example, a **4 second video** at **720p with audio** will cost **$0.20**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the video you want to generate
  - Examples: "A massive blue whale glides through crystal-clear deep ocean water, sunlight rays piercing through the surface above, bioluminescent plankton scattered around, cinematic slow motion"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video. Default value: `"8s"`
  - Default: `"8s"`
  - Options: `"4s"`, `"6s"`, `"8s"`

- **`negative_prompt`** (`string`, _optional_):
  A negative prompt to guide the video generation.

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video. Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"720p"`, `"1080p"`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the video. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator.

- **`auto_fix`** (`boolean`, _optional_):
  Whether to automatically attempt to fix prompts that fail content policy or other validation checks by rewriting them. Default value: `true`
  - Default: `true`

- **`safety_tolerance`** (`SafetyToleranceEnum`, _optional_):
  The safety tolerance level for content moderation. 1 is the most strict (blocks most content), 6 is the least strict. Default value: `"4"`
  - Default: `"4"`
  - Options: `"1"`, `"2"`, `"3"`, `"4"`, `"5"`, `"6"`



**Required Parameters Example**:

```json
{
  "prompt": "A massive blue whale glides through crystal-clear deep ocean water, sunlight rays piercing through the surface above, bioluminescent plankton scattered around, cinematic slow motion"
}
```

**Full Example**:

```json
{
  "prompt": "A massive blue whale glides through crystal-clear deep ocean water, sunlight rays piercing through the surface above, bioluminescent plankton scattered around, cinematic slow motion",
  "aspect_ratio": "16:9",
  "duration": "8s",
  "resolution": "720p",
  "generate_audio": true,
  "auto_fix": true,
  "safety_tolerance": "4"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a94683f/r4vLtNmFDi_qpglfEX_q9_0a7258527ac84509a0997639765f5c79.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a94683f/r4vLtNmFDi_qpglfEX_q9_0a7258527ac84509a0997639765f5c79.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/veo3.1/lite \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A massive blue whale glides through crystal-clear deep ocean water, sunlight rays piercing through the surface above, bioluminescent plankton scattered around, cinematic slow motion"
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
    "fal-ai/veo3.1/lite",
    arguments={
        "prompt": "A massive blue whale glides through crystal-clear deep ocean water, sunlight rays piercing through the surface above, bioluminescent plankton scattered around, cinematic slow motion"
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

const result = await fal.subscribe("fal-ai/veo3.1/lite", {
  input: {
    prompt: "A massive blue whale glides through crystal-clear deep ocean water, sunlight rays piercing through the surface above, bioluminescent plankton scattered around, cinematic slow motion"
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

- [Model Playground](https://fal.ai/models/fal-ai/veo3.1/lite)
- [API Documentation](https://fal.ai/models/fal-ai/veo3.1/lite/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/veo3.1/lite)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

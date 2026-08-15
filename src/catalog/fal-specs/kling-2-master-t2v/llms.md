# Kling 2.0 Master

> Generate video clips from your prompts using Kling 2.0 Master


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v2/master/text-to-video`
- **Model ID**: `fal-ai/kling-video/v2/master/text-to-video`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

For **5s** video your request will cost **$1.40**. For every aditional second you will be charged $0.28.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "A slow-motion drone shot descending from above a maze of neon-lit Tokyo alleyways at night during heavy rainfall. The camera gradually focuses on a lone figure in a luminescent white raincoat standing perfectly still amid the bustling crowd, all carrying black umbrellas. As the camera continues its downward journey, we see the raindrops creating rippling patterns on puddles that reflect the kaleidoscope of colors from the surrounding signs, creating a mirror world beneath the city."

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"5"`
  - Default: `"5"`
  - Options: `"5"`, `"10"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video frame Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`negative_prompt`** (`string`, _optional_):
   Default value: `"blur, distort, and low quality"`
  - Default: `"blur, distort, and low quality"`

- **`cfg_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want
  the model to stick to your prompt. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`



**Required Parameters Example**:

```json
{
  "prompt": "A slow-motion drone shot descending from above a maze of neon-lit Tokyo alleyways at night during heavy rainfall. The camera gradually focuses on a lone figure in a luminescent white raincoat standing perfectly still amid the bustling crowd, all carrying black umbrellas. As the camera continues its downward journey, we see the raindrops creating rippling patterns on puddles that reflect the kaleidoscope of colors from the surrounding signs, creating a mirror world beneath the city."
}
```

**Full Example**:

```json
{
  "prompt": "A slow-motion drone shot descending from above a maze of neon-lit Tokyo alleyways at night during heavy rainfall. The camera gradually focuses on a lone figure in a luminescent white raincoat standing perfectly still amid the bustling crowd, all carrying black umbrellas. As the camera continues its downward journey, we see the raindrops creating rippling patterns on puddles that reflect the kaleidoscope of colors from the surrounding signs, creating a mirror world beneath the city.",
  "duration": "5",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://v3.fal.media/files/rabbit/5fu6OSZdvV825r2s_c0S8_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/rabbit/5fu6OSZdvV825r2s_c0S8_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v2/master/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A slow-motion drone shot descending from above a maze of neon-lit Tokyo alleyways at night during heavy rainfall. The camera gradually focuses on a lone figure in a luminescent white raincoat standing perfectly still amid the bustling crowd, all carrying black umbrellas. As the camera continues its downward journey, we see the raindrops creating rippling patterns on puddles that reflect the kaleidoscope of colors from the surrounding signs, creating a mirror world beneath the city."
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
    "fal-ai/kling-video/v2/master/text-to-video",
    arguments={
        "prompt": "A slow-motion drone shot descending from above a maze of neon-lit Tokyo alleyways at night during heavy rainfall. The camera gradually focuses on a lone figure in a luminescent white raincoat standing perfectly still amid the bustling crowd, all carrying black umbrellas. As the camera continues its downward journey, we see the raindrops creating rippling patterns on puddles that reflect the kaleidoscope of colors from the surrounding signs, creating a mirror world beneath the city."
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

const result = await fal.subscribe("fal-ai/kling-video/v2/master/text-to-video", {
  input: {
    prompt: "A slow-motion drone shot descending from above a maze of neon-lit Tokyo alleyways at night during heavy rainfall. The camera gradually focuses on a lone figure in a luminescent white raincoat standing perfectly still amid the bustling crowd, all carrying black umbrellas. As the camera continues its downward journey, we see the raindrops creating rippling patterns on puddles that reflect the kaleidoscope of colors from the surrounding signs, creating a mirror world beneath the city."
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v2/master/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v2/master/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v2/master/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

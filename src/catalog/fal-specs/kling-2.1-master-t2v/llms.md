# Kling 2.1 Master

> Kling 2.1 Master: The premium endpoint for Kling 2.1, designed for top-tier text-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v2.1/master/text-to-video`
- **Model ID**: `fal-ai/kling-video/v2.1/master/text-to-video`
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
  - Examples: "Warm, earthy tones bathe the scene as the potter's hands, rough and calloused, coax a shapeless lump of clay into a vessel of elegant curves, the slow, deliberate movements highlighted by the subtle shifting light; the clay's cool, damp texture contrasts sharply with the warmth of the potter's touch, creating a captivating interplay between material and maker."

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
  "prompt": "Warm, earthy tones bathe the scene as the potter's hands, rough and calloused, coax a shapeless lump of clay into a vessel of elegant curves, the slow, deliberate movements highlighted by the subtle shifting light; the clay's cool, damp texture contrasts sharply with the warmth of the potter's touch, creating a captivating interplay between material and maker."
}
```

**Full Example**:

```json
{
  "prompt": "Warm, earthy tones bathe the scene as the potter's hands, rough and calloused, coax a shapeless lump of clay into a vessel of elegant curves, the slow, deliberate movements highlighted by the subtle shifting light; the clay's cool, damp texture contrasts sharply with the warmth of the potter's touch, creating a captivating interplay between material and maker.",
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
  - Examples: {"url":"https://v3.fal.media/files/lion/0wTlhR7GCXFI-_BZXGy99_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/lion/0wTlhR7GCXFI-_BZXGy99_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v2.1/master/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Warm, earthy tones bathe the scene as the potter's hands, rough and calloused, coax a shapeless lump of clay into a vessel of elegant curves, the slow, deliberate movements highlighted by the subtle shifting light; the clay's cool, damp texture contrasts sharply with the warmth of the potter's touch, creating a captivating interplay between material and maker."
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
    "fal-ai/kling-video/v2.1/master/text-to-video",
    arguments={
        "prompt": "Warm, earthy tones bathe the scene as the potter's hands, rough and calloused, coax a shapeless lump of clay into a vessel of elegant curves, the slow, deliberate movements highlighted by the subtle shifting light; the clay's cool, damp texture contrasts sharply with the warmth of the potter's touch, creating a captivating interplay between material and maker."
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

const result = await fal.subscribe("fal-ai/kling-video/v2.1/master/text-to-video", {
  input: {
    prompt: "Warm, earthy tones bathe the scene as the potter's hands, rough and calloused, coax a shapeless lump of clay into a vessel of elegant curves, the slow, deliberate movements highlighted by the subtle shifting light; the clay's cool, damp texture contrasts sharply with the warmth of the potter's touch, creating a captivating interplay between material and maker."
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v2.1/master/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v2.1/master/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v2.1/master/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

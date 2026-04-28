# Vidu Text to Video

> Vidu Q1 Text to Video generates high-quality 1080p videos with exceptional visual quality and motion diversity


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/q1/text-to-video`
- **Model ID**: `fal-ai/vidu/q1/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform



## Pricing

For **5s** video your request will cost **$0.40**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation, max 1500 characters
  - Examples: "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog. The background consists of enchanting white and golden lights, creating a minimalist still life and an impressive panoramic scene."

- **`style`** (`StyleEnum`, _optional_):
  The style of output video Default value: `"general"`
  - Default: `"general"`
  - Options: `"general"`, `"anime"`

- **`seed`** (`integer`, _optional_):
  Seed for the random number generator

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the output video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`movement_amplitude`** (`MovementAmplitudeEnum`, _optional_):
  The movement amplitude of objects in the frame Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"small"`, `"medium"`, `"large"`



**Required Parameters Example**:

```json
{
  "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog. The background consists of enchanting white and golden lights, creating a minimalist still life and an impressive panoramic scene."
}
```

**Full Example**:

```json
{
  "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog. The background consists of enchanting white and golden lights, creating a minimalist still life and an impressive panoramic scene.",
  "style": "general",
  "aspect_ratio": "16:9",
  "movement_amplitude": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video using the Q1 model
  - Examples: {"url":"https://fal.media/files/penguin/senyvDPQAk8Fvt5voX3NU_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/penguin/senyvDPQAk8Fvt5voX3NU_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/q1/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog. The background consists of enchanting white and golden lights, creating a minimalist still life and an impressive panoramic scene."
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
    "fal-ai/vidu/q1/text-to-video",
    arguments={
        "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog. The background consists of enchanting white and golden lights, creating a minimalist still life and an impressive panoramic scene."
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

const result = await fal.subscribe("fal-ai/vidu/q1/text-to-video", {
  input: {
    prompt: "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog. The background consists of enchanting white and golden lights, creating a minimalist still life and an impressive panoramic scene."
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/q1/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/q1/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/q1/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

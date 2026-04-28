# Ovi

> Ovi can generate videos with audio from image and text inputs.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ovi/image-to-video`
- **Model ID**: `fal-ai/ovi/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: image-to-audio-video, image-to-video



## Pricing

- **Price**: $0.2 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "An intimate close-up of a European woman with long dark hair as she gently brushes her hair in a softly lit bedroom, her delicate hand moving in the foreground. She looks directly into the camera with calm, focused eyes, a faint serene smile glowing in the warm lamp light. She says, <S>[soft whisper] I am an artificial intelligence.<E>.<AUDCAP>Soft whispering female voice, ASMR tone with gentle breaths, cozy room acoustics, subtle emphasis on \"I am an artificial intelligence\".<ENDAUDCAP>"

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `"jitter, bad hands, blur, distortion"`
  - Default: `"jitter, bad hands, blur, distortion"`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps. Default value: `30`
  - Default: `30`
  - Range: `1` to `50`

- **`audio_negative_prompt`** (`string`, _optional_):
  Negative prompt for audio generation. Default value: `"robotic, muffled, echo, distorted"`
  - Default: `"robotic, muffled, echo, distorted"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`image_url`** (`string`, _required_):
  The image URL to guide video generation.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png"



**Required Parameters Example**:

```json
{
  "prompt": "An intimate close-up of a European woman with long dark hair as she gently brushes her hair in a softly lit bedroom, her delicate hand moving in the foreground. She looks directly into the camera with calm, focused eyes, a faint serene smile glowing in the warm lamp light. She says, <S>[soft whisper] I am an artificial intelligence.<E>.<AUDCAP>Soft whispering female voice, ASMR tone with gentle breaths, cozy room acoustics, subtle emphasis on \"I am an artificial intelligence\".<ENDAUDCAP>",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png"
}
```

**Full Example**:

```json
{
  "prompt": "An intimate close-up of a European woman with long dark hair as she gently brushes her hair in a softly lit bedroom, her delicate hand moving in the foreground. She looks directly into the camera with calm, focused eyes, a faint serene smile glowing in the warm lamp light. She says, <S>[soft whisper] I am an artificial intelligence.<E>.<AUDCAP>Soft whispering female voice, ASMR tone with gentle breaths, cozy room acoustics, subtle emphasis on \"I am an artificial intelligence\".<ENDAUDCAP>",
  "negative_prompt": "jitter, bad hands, blur, distortion",
  "num_inference_steps": 30,
  "audio_negative_prompt": "robotic, muffled, echo, distorted",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _optional_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_output.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ovi/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "An intimate close-up of a European woman with long dark hair as she gently brushes her hair in a softly lit bedroom, her delicate hand moving in the foreground. She looks directly into the camera with calm, focused eyes, a faint serene smile glowing in the warm lamp light. She says, <S>[soft whisper] I am an artificial intelligence.<E>.<AUDCAP>Soft whispering female voice, ASMR tone with gentle breaths, cozy room acoustics, subtle emphasis on \"I am an artificial intelligence\".<ENDAUDCAP>",
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png"
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
    "fal-ai/ovi/image-to-video",
    arguments={
        "prompt": "An intimate close-up of a European woman with long dark hair as she gently brushes her hair in a softly lit bedroom, her delicate hand moving in the foreground. She looks directly into the camera with calm, focused eyes, a faint serene smile glowing in the warm lamp light. She says, <S>[soft whisper] I am an artificial intelligence.<E>.<AUDCAP>Soft whispering female voice, ASMR tone with gentle breaths, cozy room acoustics, subtle emphasis on \"I am an artificial intelligence\".<ENDAUDCAP>",
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png"
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

const result = await fal.subscribe("fal-ai/ovi/image-to-video", {
  input: {
    prompt: "An intimate close-up of a European woman with long dark hair as she gently brushes her hair in a softly lit bedroom, her delicate hand moving in the foreground. She looks directly into the camera with calm, focused eyes, a faint serene smile glowing in the warm lamp light. She says, <S>[soft whisper] I am an artificial intelligence.<E>.<AUDCAP>Soft whispering female voice, ASMR tone with gentle breaths, cozy room acoustics, subtle emphasis on \"I am an artificial intelligence\".<ENDAUDCAP>",
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/ovi/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ovi/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ovi/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

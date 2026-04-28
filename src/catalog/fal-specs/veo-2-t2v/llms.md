# Veo 2

> Veo 2 creates videos with realistic motion and high quality output. Explore different styles and find your own with extensive camera controls.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/veo2`
- **Model ID**: `fal-ai/veo2`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: motion, transformation



## Pricing

For **5s video** your request will cost **$2.50**. For every aditional second you will be charged **$0.50**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the video you want to generate
  - Examples: "The camera floats gently through rows of pastel-painted wooden beehives, buzzing honeybees gliding in and out of frame. The motion settles on the refined farmer standing at the center, his pristine white beekeeping suit gleaming in the golden afternoon light. He lifts a jar of honey, tilting it slightly to catch the light. Behind him, tall sunflowers sway rhythmically in the breeze, their petals glowing in the warm sunlight. The camera tilts upward to reveal a retro farmhouse with mint-green shutters, its walls dappled with shadows from swaying trees. Shot with a 35mm lens on Kodak Portra 400 film, the golden light creates rich textures on the farmer's gloves, marmalade jar, and weathered wood of the beehives."

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"9:16"`, `"16:9"`, `"1:1"`

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"5s"`
  - Default: `"5s"`
  - Options: `"5s"`, `"6s"`, `"7s"`, `"8s"`

- **`negative_prompt`** (`string`, _optional_):
  A negative prompt to guide the video generation

- **`enhance_prompt`** (`boolean`, _optional_):
  Whether to enhance the video generation Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  A seed to use for the video generation

- **`auto_fix`** (`boolean`, _optional_):
  Whether to automatically attempt to fix prompts that fail content policy or other validation checks by rewriting them Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "The camera floats gently through rows of pastel-painted wooden beehives, buzzing honeybees gliding in and out of frame. The motion settles on the refined farmer standing at the center, his pristine white beekeeping suit gleaming in the golden afternoon light. He lifts a jar of honey, tilting it slightly to catch the light. Behind him, tall sunflowers sway rhythmically in the breeze, their petals glowing in the warm sunlight. The camera tilts upward to reveal a retro farmhouse with mint-green shutters, its walls dappled with shadows from swaying trees. Shot with a 35mm lens on Kodak Portra 400 film, the golden light creates rich textures on the farmer's gloves, marmalade jar, and weathered wood of the beehives."
}
```

**Full Example**:

```json
{
  "prompt": "The camera floats gently through rows of pastel-painted wooden beehives, buzzing honeybees gliding in and out of frame. The motion settles on the refined farmer standing at the center, his pristine white beekeeping suit gleaming in the golden afternoon light. He lifts a jar of honey, tilting it slightly to catch the light. Behind him, tall sunflowers sway rhythmically in the breeze, their petals glowing in the warm sunlight. The camera tilts upward to reveal a retro farmhouse with mint-green shutters, its walls dappled with shadows from swaying trees. Shot with a 35mm lens on Kodak Portra 400 film, the golden light creates rich textures on the farmer's gloves, marmalade jar, and weathered wood of the beehives.",
  "aspect_ratio": "16:9",
  "duration": "5s",
  "enhance_prompt": true,
  "auto_fix": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://v3.fal.media/files/tiger/83-YzufmOlsnhqq5ed382_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/tiger/83-YzufmOlsnhqq5ed382_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/veo2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "The camera floats gently through rows of pastel-painted wooden beehives, buzzing honeybees gliding in and out of frame. The motion settles on the refined farmer standing at the center, his pristine white beekeeping suit gleaming in the golden afternoon light. He lifts a jar of honey, tilting it slightly to catch the light. Behind him, tall sunflowers sway rhythmically in the breeze, their petals glowing in the warm sunlight. The camera tilts upward to reveal a retro farmhouse with mint-green shutters, its walls dappled with shadows from swaying trees. Shot with a 35mm lens on Kodak Portra 400 film, the golden light creates rich textures on the farmer's gloves, marmalade jar, and weathered wood of the beehives."
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
    "fal-ai/veo2",
    arguments={
        "prompt": "The camera floats gently through rows of pastel-painted wooden beehives, buzzing honeybees gliding in and out of frame. The motion settles on the refined farmer standing at the center, his pristine white beekeeping suit gleaming in the golden afternoon light. He lifts a jar of honey, tilting it slightly to catch the light. Behind him, tall sunflowers sway rhythmically in the breeze, their petals glowing in the warm sunlight. The camera tilts upward to reveal a retro farmhouse with mint-green shutters, its walls dappled with shadows from swaying trees. Shot with a 35mm lens on Kodak Portra 400 film, the golden light creates rich textures on the farmer's gloves, marmalade jar, and weathered wood of the beehives."
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

const result = await fal.subscribe("fal-ai/veo2", {
  input: {
    prompt: "The camera floats gently through rows of pastel-painted wooden beehives, buzzing honeybees gliding in and out of frame. The motion settles on the refined farmer standing at the center, his pristine white beekeeping suit gleaming in the golden afternoon light. He lifts a jar of honey, tilting it slightly to catch the light. Behind him, tall sunflowers sway rhythmically in the breeze, their petals glowing in the warm sunlight. The camera tilts upward to reveal a retro farmhouse with mint-green shutters, its walls dappled with shadows from swaying trees. Shot with a 35mm lens on Kodak Portra 400 film, the golden light creates rich textures on the farmer's gloves, marmalade jar, and weathered wood of the beehives."
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

- [Model Playground](https://fal.ai/models/fal-ai/veo2)
- [API Documentation](https://fal.ai/models/fal-ai/veo2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/veo2)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

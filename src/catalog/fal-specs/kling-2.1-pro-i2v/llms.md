# Kling 2.1 (pro)

> Kling 2.1 Pro is an advanced endpoint for the Kling 2.1 model, offering professional-grade videos with enhanced visual fidelity, precise camera movements, and dynamic motion control, perfect for cinematic storytelling.




## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v2.1/pro/image-to-video`
- **Model ID**: `fal-ai/kling-video/v2.1/pro/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

For **5s** video your request will cost **$0.49**. For every additional second you will be charged **$0.098**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "Warm, incandescent streetlights paint the rain-slicked cobblestones in pools of amber light as a couple walks hand-in-hand, their silhouettes stark against the blurry backdrop of a city shrouded in a gentle downpour; the camera lingers on the subtle textures of their rain-soaked coats and the glistening reflections dancing on the wet pavement, creating a sense of intimate vulnerability and shared quietude."

- **`image_url`** (`string`, _required_):
  URL of the image to be used for the video
  - Examples: "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"5"`
  - Default: `"5"`
  - Options: `"5"`, `"10"`

- **`negative_prompt`** (`string`, _optional_):
   Default value: `"blur, distort, and low quality"`
  - Default: `"blur, distort, and low quality"`

- **`cfg_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want
  the model to stick to your prompt. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`

- **`tail_image_url`** (`string`, _optional_):
  URL of the image to be used for the end of the video



**Required Parameters Example**:

```json
{
  "prompt": "Warm, incandescent streetlights paint the rain-slicked cobblestones in pools of amber light as a couple walks hand-in-hand, their silhouettes stark against the blurry backdrop of a city shrouded in a gentle downpour; the camera lingers on the subtle textures of their rain-soaked coats and the glistening reflections dancing on the wet pavement, creating a sense of intimate vulnerability and shared quietude.",
  "image_url": "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp"
}
```

**Full Example**:

```json
{
  "prompt": "Warm, incandescent streetlights paint the rain-slicked cobblestones in pools of amber light as a couple walks hand-in-hand, their silhouettes stark against the blurry backdrop of a city shrouded in a gentle downpour; the camera lingers on the subtle textures of their rain-soaked coats and the glistening reflections dancing on the wet pavement, creating a sense of intimate vulnerability and shared quietude.",
  "image_url": "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp",
  "duration": "5",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://v3.fal.media/files/rabbit/Y5I8-7u3e7ogVSvPin1TS_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3.fal.media/files/rabbit/Y5I8-7u3e7ogVSvPin1TS_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v2.1/pro/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Warm, incandescent streetlights paint the rain-slicked cobblestones in pools of amber light as a couple walks hand-in-hand, their silhouettes stark against the blurry backdrop of a city shrouded in a gentle downpour; the camera lingers on the subtle textures of their rain-soaked coats and the glistening reflections dancing on the wet pavement, creating a sense of intimate vulnerability and shared quietude.",
     "image_url": "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp"
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
    "fal-ai/kling-video/v2.1/pro/image-to-video",
    arguments={
        "prompt": "Warm, incandescent streetlights paint the rain-slicked cobblestones in pools of amber light as a couple walks hand-in-hand, their silhouettes stark against the blurry backdrop of a city shrouded in a gentle downpour; the camera lingers on the subtle textures of their rain-soaked coats and the glistening reflections dancing on the wet pavement, creating a sense of intimate vulnerability and shared quietude.",
        "image_url": "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp"
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

const result = await fal.subscribe("fal-ai/kling-video/v2.1/pro/image-to-video", {
  input: {
    prompt: "Warm, incandescent streetlights paint the rain-slicked cobblestones in pools of amber light as a couple walks hand-in-hand, their silhouettes stark against the blurry backdrop of a city shrouded in a gentle downpour; the camera lingers on the subtle textures of their rain-soaked coats and the glistening reflections dancing on the wet pavement, creating a sense of intimate vulnerability and shared quietude.",
    image_url: "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp"
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v2.1/pro/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v2.1/pro/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v2.1/pro/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

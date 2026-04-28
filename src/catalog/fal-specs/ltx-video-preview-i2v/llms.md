# LTX Video (preview)

> Generate videos from images using LTX Video


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-video/image-to-video`
- **Model ID**: `fal-ai/ltx-video/image-to-video`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

- **Price**: $0.02 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "A lone astronaut in a white spacesuit with gold-tinted visor drifts weightlessly through a sleek, cylindrical corridor of a spaceship. Their movements are slow and graceful as they gently push off the metallic walls with their gloved hands, rotating slightly as they float from right to left across the frame. The corridor features brushed aluminum panels with blue LED strips running along the ceiling, casting a cool glow on the astronaut's suit. Various cables, pipes, and control panels line the walls. The camera follows the astronaut's movement in a handheld style, slightly swaying and adjusting focus, maintaining a medium shot that captures both the astronaut and the corridor's depth. Small particles of dust catch the light as they float in the zero-gravity environment. The scene appears cinematic, with lens flares occasionally reflecting off the metallic surfaces and the astronaut's visor."

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to generate the video from. Default value: `"low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly"`
  - Default: `"low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly"`

- **`seed`** (`integer`, _optional_):
  The seed to use for random number generation.

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to take. Default value: `30`
  - Default: `30`
  - Range: `1` to `50`

- **`guidance_scale`** (`float`, _optional_):
  The guidance scale to use. Default value: `3`
  - Default: `3`
  - Range: `2` to `10`

- **`image_url`** (`string`, _required_):
  The URL of the image to generate the video from.
  - Examples: "https://fal.media/files/kangaroo/4OePu2ifG7SKxTM__TQrQ_72929fec9fb74790bb8c8b760450c9b9.jpg"



**Required Parameters Example**:

```json
{
  "prompt": "A lone astronaut in a white spacesuit with gold-tinted visor drifts weightlessly through a sleek, cylindrical corridor of a spaceship. Their movements are slow and graceful as they gently push off the metallic walls with their gloved hands, rotating slightly as they float from right to left across the frame. The corridor features brushed aluminum panels with blue LED strips running along the ceiling, casting a cool glow on the astronaut's suit. Various cables, pipes, and control panels line the walls. The camera follows the astronaut's movement in a handheld style, slightly swaying and adjusting focus, maintaining a medium shot that captures both the astronaut and the corridor's depth. Small particles of dust catch the light as they float in the zero-gravity environment. The scene appears cinematic, with lens flares occasionally reflecting off the metallic surfaces and the astronaut's visor.",
  "image_url": "https://fal.media/files/kangaroo/4OePu2ifG7SKxTM__TQrQ_72929fec9fb74790bb8c8b760450c9b9.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "A lone astronaut in a white spacesuit with gold-tinted visor drifts weightlessly through a sleek, cylindrical corridor of a spaceship. Their movements are slow and graceful as they gently push off the metallic walls with their gloved hands, rotating slightly as they float from right to left across the frame. The corridor features brushed aluminum panels with blue LED strips running along the ceiling, casting a cool glow on the astronaut's suit. Various cables, pipes, and control panels line the walls. The camera follows the astronaut's movement in a handheld style, slightly swaying and adjusting focus, maintaining a medium shot that captures both the astronaut and the corridor's depth. Small particles of dust catch the light as they float in the zero-gravity environment. The scene appears cinematic, with lens flares occasionally reflecting off the metallic surfaces and the astronaut's visor.",
  "negative_prompt": "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
  "num_inference_steps": 30,
  "guidance_scale": 3,
  "image_url": "https://fal.media/files/kangaroo/4OePu2ifG7SKxTM__TQrQ_72929fec9fb74790bb8c8b760450c9b9.jpg"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.

- **`seed`** (`integer`, _required_):
  The seed used for random number generation.



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
  --url https://fal.run/fal-ai/ltx-video/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A lone astronaut in a white spacesuit with gold-tinted visor drifts weightlessly through a sleek, cylindrical corridor of a spaceship. Their movements are slow and graceful as they gently push off the metallic walls with their gloved hands, rotating slightly as they float from right to left across the frame. The corridor features brushed aluminum panels with blue LED strips running along the ceiling, casting a cool glow on the astronaut's suit. Various cables, pipes, and control panels line the walls. The camera follows the astronaut's movement in a handheld style, slightly swaying and adjusting focus, maintaining a medium shot that captures both the astronaut and the corridor's depth. Small particles of dust catch the light as they float in the zero-gravity environment. The scene appears cinematic, with lens flares occasionally reflecting off the metallic surfaces and the astronaut's visor.",
     "image_url": "https://fal.media/files/kangaroo/4OePu2ifG7SKxTM__TQrQ_72929fec9fb74790bb8c8b760450c9b9.jpg"
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
    "fal-ai/ltx-video/image-to-video",
    arguments={
        "prompt": "A lone astronaut in a white spacesuit with gold-tinted visor drifts weightlessly through a sleek, cylindrical corridor of a spaceship. Their movements are slow and graceful as they gently push off the metallic walls with their gloved hands, rotating slightly as they float from right to left across the frame. The corridor features brushed aluminum panels with blue LED strips running along the ceiling, casting a cool glow on the astronaut's suit. Various cables, pipes, and control panels line the walls. The camera follows the astronaut's movement in a handheld style, slightly swaying and adjusting focus, maintaining a medium shot that captures both the astronaut and the corridor's depth. Small particles of dust catch the light as they float in the zero-gravity environment. The scene appears cinematic, with lens flares occasionally reflecting off the metallic surfaces and the astronaut's visor.",
        "image_url": "https://fal.media/files/kangaroo/4OePu2ifG7SKxTM__TQrQ_72929fec9fb74790bb8c8b760450c9b9.jpg"
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

const result = await fal.subscribe("fal-ai/ltx-video/image-to-video", {
  input: {
    prompt: "A lone astronaut in a white spacesuit with gold-tinted visor drifts weightlessly through a sleek, cylindrical corridor of a spaceship. Their movements are slow and graceful as they gently push off the metallic walls with their gloved hands, rotating slightly as they float from right to left across the frame. The corridor features brushed aluminum panels with blue LED strips running along the ceiling, casting a cool glow on the astronaut's suit. Various cables, pipes, and control panels line the walls. The camera follows the astronaut's movement in a handheld style, slightly swaying and adjusting focus, maintaining a medium shot that captures both the astronaut and the corridor's depth. Small particles of dust catch the light as they float in the zero-gravity environment. The scene appears cinematic, with lens flares occasionally reflecting off the metallic surfaces and the astronaut's visor.",
    image_url: "https://fal.media/files/kangaroo/4OePu2ifG7SKxTM__TQrQ_72929fec9fb74790bb8c8b760450c9b9.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-video/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-video/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-video/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

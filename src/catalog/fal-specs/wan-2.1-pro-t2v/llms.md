# Wan-2.1 Pro Text-to-Video

> Wan-2.1 Pro is a premium text-to-video model that generates high-quality 1080p videos at 30fps with up to 6 seconds duration, delivering exceptional visual quality and motion diversity from text prompts


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan-pro/text-to-video`
- **Model ID**: `fal-ai/wan-pro/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text to video, motion



## Pricing

- **Price**: $0.8 per 5 seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video
  - Examples: "A lone astronaut in a detailed NASA spacesuit performs an exuberant dance on the lunar surface, arms outstretched in joyful abandon against the stark moonscape. The Earth hangs dramatically in the black sky, appearing to streak past due to the motion of the dance, creating a sense of dynamic movement. The scene captures extreme contrasts between the brilliant white of the spacesuit reflecting harsh sunlight and the deep shadows of the lunar craters. Every detail is rendered with photorealistic precision: the texture of the regolith disturbed by the astronaut's boots, the reflections on the helmet visor."

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A lone astronaut in a detailed NASA spacesuit performs an exuberant dance on the lunar surface, arms outstretched in joyful abandon against the stark moonscape. The Earth hangs dramatically in the black sky, appearing to streak past due to the motion of the dance, creating a sense of dynamic movement. The scene captures extreme contrasts between the brilliant white of the spacesuit reflecting harsh sunlight and the deep shadows of the lunar craters. Every detail is rendered with photorealistic precision: the texture of the regolith disturbed by the astronaut's boots, the reflections on the helmet visor."
}
```

**Full Example**:

```json
{
  "prompt": "A lone astronaut in a detailed NASA spacesuit performs an exuberant dance on the lunar surface, arms outstretched in joyful abandon against the stark moonscape. The Earth hangs dramatically in the black sky, appearing to streak past due to the motion of the dance, creating a sense of dynamic movement. The scene captures extreme contrasts between the brilliant white of the spacesuit reflecting harsh sunlight and the deep shadows of the lunar craters. Every detail is rendered with photorealistic precision: the texture of the regolith disturbed by the astronaut's boots, the reflections on the helmet visor.",
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://fal.media/files/panda/YxRLson-aETxeBK1DI4VW.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/panda/YxRLson-aETxeBK1DI4VW.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan-pro/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A lone astronaut in a detailed NASA spacesuit performs an exuberant dance on the lunar surface, arms outstretched in joyful abandon against the stark moonscape. The Earth hangs dramatically in the black sky, appearing to streak past due to the motion of the dance, creating a sense of dynamic movement. The scene captures extreme contrasts between the brilliant white of the spacesuit reflecting harsh sunlight and the deep shadows of the lunar craters. Every detail is rendered with photorealistic precision: the texture of the regolith disturbed by the astronaut's boots, the reflections on the helmet visor."
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
    "fal-ai/wan-pro/text-to-video",
    arguments={
        "prompt": "A lone astronaut in a detailed NASA spacesuit performs an exuberant dance on the lunar surface, arms outstretched in joyful abandon against the stark moonscape. The Earth hangs dramatically in the black sky, appearing to streak past due to the motion of the dance, creating a sense of dynamic movement. The scene captures extreme contrasts between the brilliant white of the spacesuit reflecting harsh sunlight and the deep shadows of the lunar craters. Every detail is rendered with photorealistic precision: the texture of the regolith disturbed by the astronaut's boots, the reflections on the helmet visor."
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

const result = await fal.subscribe("fal-ai/wan-pro/text-to-video", {
  input: {
    prompt: "A lone astronaut in a detailed NASA spacesuit performs an exuberant dance on the lunar surface, arms outstretched in joyful abandon against the stark moonscape. The Earth hangs dramatically in the black sky, appearing to streak past due to the motion of the dance, creating a sense of dynamic movement. The scene captures extreme contrasts between the brilliant white of the spacesuit reflecting harsh sunlight and the deep shadows of the lunar craters. Every detail is rendered with photorealistic precision: the texture of the regolith disturbed by the astronaut's boots, the reflections on the helmet visor."
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

- [Model Playground](https://fal.ai/models/fal-ai/wan-pro/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/wan-pro/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan-pro/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

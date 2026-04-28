# Marey Realism V1.5

> Generate a video from a text prompt with Marey, a generative video model trained exclusively on fully licensed data.


## Overview

- **Endpoint**: `https://fal.run/moonvalley/marey/t2v`
- **Model ID**: `moonvalley/marey/t2v`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

Your request will cost **$1.50** for a 5s video or **$3.00** for a 10s video.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate a video from
  - Examples: "Detailed Description: A small, white paper boat, with one corner engulfed in bright orange flames, drifts precariously across a dark puddle on wet asphalt. As raindrops fall, they create ever-expanding ripples on the water's surface, gently rocking the fragile vessel and causing the fiery reflection below to dance and shimmer. The flickering flame slowly consumes the paper, charring the edges black as the boat becomes waterlogged, beginning to sink in a poignant slow-motion battle between fire and water. Background: The background is softly blurred, suggesting an overcast day with out-of-focus foliage, enhancing the scene's intimate and melancholic mood. Middleground: Raindrops continuously strike the puddle's surface, creating concentric ripples that gently push the boat along its short, determined voyage. Foreground: The burning paper boat floats in sharp focus, its bright, flickering flame casting a warm, dramatic glow that reflects and distorts on the dark, wet surface of the asphalt."

- **`dimensions`** (`DimensionsEnum`, _optional_):
  The dimensions of the generated video in width x height format. Default value: `"1920x1080"`
  - Default: `"1920x1080"`
  - Options: `"1920x1080"`, `"1152x1152"`, `"1536x1152"`, `"1152x1536"`

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video. Default value: `"5s"`
  - Default: `"5s"`
  - Options: `"5s"`, `"10s"`

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt used to guide the model away from undesirable features. Default value: `"<synthetic> <scene cut> low-poly, flat shader, bad rigging, stiff animation, uncanny eyes, low-quality textures, looping glitch, cheap effect, overbloom, bloom spam, default lighting, game asset, stiff face, ugly specular, AI artifacts"`
  - Default: `"<synthetic> <scene cut> low-poly, flat shader, bad rigging, stiff animation, uncanny eyes, low-quality textures, looping glitch, cheap effect, overbloom, bloom spam, default lighting, game asset, stiff face, ugly specular, AI artifacts"`

- **`seed`** (`integer`, _optional_):
  Seed for random number generation. Use -1 for random seed each run. Default value: `-1`
  - Default: `-1`

- **`guidance_scale`** (`float`, _optional_):
  Controls how strongly the generation is guided by the prompt (0-20). Higher values follow the prompt more closely.



**Required Parameters Example**:

```json
{
  "prompt": "Detailed Description: A small, white paper boat, with one corner engulfed in bright orange flames, drifts precariously across a dark puddle on wet asphalt. As raindrops fall, they create ever-expanding ripples on the water's surface, gently rocking the fragile vessel and causing the fiery reflection below to dance and shimmer. The flickering flame slowly consumes the paper, charring the edges black as the boat becomes waterlogged, beginning to sink in a poignant slow-motion battle between fire and water. Background: The background is softly blurred, suggesting an overcast day with out-of-focus foliage, enhancing the scene's intimate and melancholic mood. Middleground: Raindrops continuously strike the puddle's surface, creating concentric ripples that gently push the boat along its short, determined voyage. Foreground: The burning paper boat floats in sharp focus, its bright, flickering flame casting a warm, dramatic glow that reflects and distorts on the dark, wet surface of the asphalt."
}
```

**Full Example**:

```json
{
  "prompt": "Detailed Description: A small, white paper boat, with one corner engulfed in bright orange flames, drifts precariously across a dark puddle on wet asphalt. As raindrops fall, they create ever-expanding ripples on the water's surface, gently rocking the fragile vessel and causing the fiery reflection below to dance and shimmer. The flickering flame slowly consumes the paper, charring the edges black as the boat becomes waterlogged, beginning to sink in a poignant slow-motion battle between fire and water. Background: The background is softly blurred, suggesting an overcast day with out-of-focus foliage, enhancing the scene's intimate and melancholic mood. Middleground: Raindrops continuously strike the puddle's surface, creating concentric ripples that gently push the boat along its short, determined voyage. Foreground: The burning paper boat floats in sharp focus, its bright, flickering flame casting a warm, dramatic glow that reflects and distorts on the dark, wet surface of the asphalt.",
  "dimensions": "1920x1080",
  "duration": "5s",
  "negative_prompt": "<synthetic> <scene cut> low-poly, flat shader, bad rigging, stiff animation, uncanny eyes, low-quality textures, looping glitch, cheap effect, overbloom, bloom spam, default lighting, game asset, stiff face, ugly specular, AI artifacts",
  "seed": -1
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video.



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
  --url https://fal.run/moonvalley/marey/t2v \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Detailed Description: A small, white paper boat, with one corner engulfed in bright orange flames, drifts precariously across a dark puddle on wet asphalt. As raindrops fall, they create ever-expanding ripples on the water's surface, gently rocking the fragile vessel and causing the fiery reflection below to dance and shimmer. The flickering flame slowly consumes the paper, charring the edges black as the boat becomes waterlogged, beginning to sink in a poignant slow-motion battle between fire and water. Background: The background is softly blurred, suggesting an overcast day with out-of-focus foliage, enhancing the scene's intimate and melancholic mood. Middleground: Raindrops continuously strike the puddle's surface, creating concentric ripples that gently push the boat along its short, determined voyage. Foreground: The burning paper boat floats in sharp focus, its bright, flickering flame casting a warm, dramatic glow that reflects and distorts on the dark, wet surface of the asphalt."
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
    "moonvalley/marey/t2v",
    arguments={
        "prompt": "Detailed Description: A small, white paper boat, with one corner engulfed in bright orange flames, drifts precariously across a dark puddle on wet asphalt. As raindrops fall, they create ever-expanding ripples on the water's surface, gently rocking the fragile vessel and causing the fiery reflection below to dance and shimmer. The flickering flame slowly consumes the paper, charring the edges black as the boat becomes waterlogged, beginning to sink in a poignant slow-motion battle between fire and water. Background: The background is softly blurred, suggesting an overcast day with out-of-focus foliage, enhancing the scene's intimate and melancholic mood. Middleground: Raindrops continuously strike the puddle's surface, creating concentric ripples that gently push the boat along its short, determined voyage. Foreground: The burning paper boat floats in sharp focus, its bright, flickering flame casting a warm, dramatic glow that reflects and distorts on the dark, wet surface of the asphalt."
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

const result = await fal.subscribe("moonvalley/marey/t2v", {
  input: {
    prompt: "Detailed Description: A small, white paper boat, with one corner engulfed in bright orange flames, drifts precariously across a dark puddle on wet asphalt. As raindrops fall, they create ever-expanding ripples on the water's surface, gently rocking the fragile vessel and causing the fiery reflection below to dance and shimmer. The flickering flame slowly consumes the paper, charring the edges black as the boat becomes waterlogged, beginning to sink in a poignant slow-motion battle between fire and water. Background: The background is softly blurred, suggesting an overcast day with out-of-focus foliage, enhancing the scene's intimate and melancholic mood. Middleground: Raindrops continuously strike the puddle's surface, creating concentric ripples that gently push the boat along its short, determined voyage. Foreground: The burning paper boat floats in sharp focus, its bright, flickering flame casting a warm, dramatic glow that reflects and distorts on the dark, wet surface of the asphalt."
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

- [Model Playground](https://fal.ai/models/moonvalley/marey/t2v)
- [API Documentation](https://fal.ai/models/moonvalley/marey/t2v/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=moonvalley/marey/t2v)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

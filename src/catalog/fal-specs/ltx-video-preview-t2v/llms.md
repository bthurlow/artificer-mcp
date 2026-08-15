# LTX Video (preview)

> Generate videos from prompts using LTX Video


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-video`
- **Model ID**: `fal-ai/ltx-video`
- **Category**: text-to-video
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
  - Examples: "A man stands waist-deep in a crystal-clear mountain pool, his back turned to a massive, thundering waterfall that cascades down jagged cliffs behind him. He wears a dark blue swimming shorts and his muscular back glistens with water droplets. The camera moves in a dynamic circular motion around him, starting from his right side and sweeping left, maintaining a slightly low angle that emphasizes the towering height of the waterfall. As the camera moves, the man slowly turns his head to follow its movement, his expression one of awe as he gazes up at the natural wonder. The waterfall creates a misty atmosphere, with sunlight filtering through the spray to create rainbow refractions. The water churns and ripples around him, reflecting the dramatic landscape. The handheld camera movement adds a subtle shake that enhances the raw, untamed energy of the scene. The lighting is natural and bright, with the sun positioned behind the waterfall, creating a backlit effect that silhouettes the falling water and illuminates the mist."

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



**Required Parameters Example**:

```json
{
  "prompt": "A man stands waist-deep in a crystal-clear mountain pool, his back turned to a massive, thundering waterfall that cascades down jagged cliffs behind him. He wears a dark blue swimming shorts and his muscular back glistens with water droplets. The camera moves in a dynamic circular motion around him, starting from his right side and sweeping left, maintaining a slightly low angle that emphasizes the towering height of the waterfall. As the camera moves, the man slowly turns his head to follow its movement, his expression one of awe as he gazes up at the natural wonder. The waterfall creates a misty atmosphere, with sunlight filtering through the spray to create rainbow refractions. The water churns and ripples around him, reflecting the dramatic landscape. The handheld camera movement adds a subtle shake that enhances the raw, untamed energy of the scene. The lighting is natural and bright, with the sun positioned behind the waterfall, creating a backlit effect that silhouettes the falling water and illuminates the mist."
}
```

**Full Example**:

```json
{
  "prompt": "A man stands waist-deep in a crystal-clear mountain pool, his back turned to a massive, thundering waterfall that cascades down jagged cliffs behind him. He wears a dark blue swimming shorts and his muscular back glistens with water droplets. The camera moves in a dynamic circular motion around him, starting from his right side and sweeping left, maintaining a slightly low angle that emphasizes the towering height of the waterfall. As the camera moves, the man slowly turns his head to follow its movement, his expression one of awe as he gazes up at the natural wonder. The waterfall creates a misty atmosphere, with sunlight filtering through the spray to create rainbow refractions. The water churns and ripples around him, reflecting the dramatic landscape. The handheld camera movement adds a subtle shake that enhances the raw, untamed energy of the scene. The lighting is natural and bright, with the sun positioned behind the waterfall, creating a backlit effect that silhouettes the falling water and illuminates the mist.",
  "negative_prompt": "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
  "num_inference_steps": 30,
  "guidance_scale": 3
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
  --url https://fal.run/fal-ai/ltx-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A man stands waist-deep in a crystal-clear mountain pool, his back turned to a massive, thundering waterfall that cascades down jagged cliffs behind him. He wears a dark blue swimming shorts and his muscular back glistens with water droplets. The camera moves in a dynamic circular motion around him, starting from his right side and sweeping left, maintaining a slightly low angle that emphasizes the towering height of the waterfall. As the camera moves, the man slowly turns his head to follow its movement, his expression one of awe as he gazes up at the natural wonder. The waterfall creates a misty atmosphere, with sunlight filtering through the spray to create rainbow refractions. The water churns and ripples around him, reflecting the dramatic landscape. The handheld camera movement adds a subtle shake that enhances the raw, untamed energy of the scene. The lighting is natural and bright, with the sun positioned behind the waterfall, creating a backlit effect that silhouettes the falling water and illuminates the mist."
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
    "fal-ai/ltx-video",
    arguments={
        "prompt": "A man stands waist-deep in a crystal-clear mountain pool, his back turned to a massive, thundering waterfall that cascades down jagged cliffs behind him. He wears a dark blue swimming shorts and his muscular back glistens with water droplets. The camera moves in a dynamic circular motion around him, starting from his right side and sweeping left, maintaining a slightly low angle that emphasizes the towering height of the waterfall. As the camera moves, the man slowly turns his head to follow its movement, his expression one of awe as he gazes up at the natural wonder. The waterfall creates a misty atmosphere, with sunlight filtering through the spray to create rainbow refractions. The water churns and ripples around him, reflecting the dramatic landscape. The handheld camera movement adds a subtle shake that enhances the raw, untamed energy of the scene. The lighting is natural and bright, with the sun positioned behind the waterfall, creating a backlit effect that silhouettes the falling water and illuminates the mist."
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

const result = await fal.subscribe("fal-ai/ltx-video", {
  input: {
    prompt: "A man stands waist-deep in a crystal-clear mountain pool, his back turned to a massive, thundering waterfall that cascades down jagged cliffs behind him. He wears a dark blue swimming shorts and his muscular back glistens with water droplets. The camera moves in a dynamic circular motion around him, starting from his right side and sweeping left, maintaining a slightly low angle that emphasizes the towering height of the waterfall. As the camera moves, the man slowly turns his head to follow its movement, his expression one of awe as he gazes up at the natural wonder. The waterfall creates a misty atmosphere, with sunlight filtering through the spray to create rainbow refractions. The water churns and ripples around him, reflecting the dramatic landscape. The handheld camera movement adds a subtle shake that enhances the raw, untamed energy of the scene. The lighting is natural and bright, with the sun positioned behind the waterfall, creating a backlit effect that silhouettes the falling water and illuminates the mist."
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

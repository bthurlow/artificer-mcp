# MiniMax (Hailuo AI) Video 01 Director

> Generate video clips more accurately with respect to natural language descriptions and using camera movement instructions for shot control.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/minimax/video-01-director`
- **Model ID**: `fal-ai/minimax/video-01-director`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: motion, transformation, camera-controls



## Pricing

- **Price**: $0.5 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation. Camera movement instructions can be added using square brackets (e.g. [Pan left] or [Zoom in]). You can use up to 3 combined movements per prompt. Supported movements: Truck left/right, Pan left/right, Push in/Pull out, Pedestal up/down, Tilt up/down, Zoom in/out, Shake, Tracking shot, Static shot. For example: [Truck left, Pan right, Zoom in]. For a more detailed guide, refer https://sixth-switch-2ac.notion.site/T2V-01-Director-Model-Tutorial-with-camera-movement-1886c20a98eb80f395b8e05291ad8645
  - Examples: "[Push in]Close up of a tense woman looks to the left, startled by a sound, in a darkened kitchen, Pots and pans hang ominously, the window in the kitchen is open and the wind softly blows the pans and creates an ominous mood. [Shake]the woman's shock turns to fear. Black-and-white film noir shot dimly lit, 1950s-style, with dramatic, high-contrast shadows. The overall atmosphere is reminiscent of Alfred Hitchcock's suspenseful storytelling, evoking a looming sense of dread with stark chiaroscuro lighting and a slight film-grain texture."

- **`prompt_optimizer`** (`boolean`, _optional_):
  Whether to use the model's prompt optimizer Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "[Push in]Close up of a tense woman looks to the left, startled by a sound, in a darkened kitchen, Pots and pans hang ominously, the window in the kitchen is open and the wind softly blows the pans and creates an ominous mood. [Shake]the woman's shock turns to fear. Black-and-white film noir shot dimly lit, 1950s-style, with dramatic, high-contrast shadows. The overall atmosphere is reminiscent of Alfred Hitchcock's suspenseful storytelling, evoking a looming sense of dread with stark chiaroscuro lighting and a slight film-grain texture."
}
```

**Full Example**:

```json
{
  "prompt": "[Push in]Close up of a tense woman looks to the left, startled by a sound, in a darkened kitchen, Pots and pans hang ominously, the window in the kitchen is open and the wind softly blows the pans and creates an ominous mood. [Shake]the woman's shock turns to fear. Black-and-white film noir shot dimly lit, 1950s-style, with dramatic, high-contrast shadows. The overall atmosphere is reminiscent of Alfred Hitchcock's suspenseful storytelling, evoking a looming sense of dread with stark chiaroscuro lighting and a slight film-grain texture.",
  "prompt_optimizer": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://fal.media/files/panda/4Et1qL4cbedh-OACEw7OF_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/panda/4Et1qL4cbedh-OACEw7OF_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/minimax/video-01-director \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "[Push in]Close up of a tense woman looks to the left, startled by a sound, in a darkened kitchen, Pots and pans hang ominously, the window in the kitchen is open and the wind softly blows the pans and creates an ominous mood. [Shake]the woman's shock turns to fear. Black-and-white film noir shot dimly lit, 1950s-style, with dramatic, high-contrast shadows. The overall atmosphere is reminiscent of Alfred Hitchcock's suspenseful storytelling, evoking a looming sense of dread with stark chiaroscuro lighting and a slight film-grain texture."
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
    "fal-ai/minimax/video-01-director",
    arguments={
        "prompt": "[Push in]Close up of a tense woman looks to the left, startled by a sound, in a darkened kitchen, Pots and pans hang ominously, the window in the kitchen is open and the wind softly blows the pans and creates an ominous mood. [Shake]the woman's shock turns to fear. Black-and-white film noir shot dimly lit, 1950s-style, with dramatic, high-contrast shadows. The overall atmosphere is reminiscent of Alfred Hitchcock's suspenseful storytelling, evoking a looming sense of dread with stark chiaroscuro lighting and a slight film-grain texture."
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

const result = await fal.subscribe("fal-ai/minimax/video-01-director", {
  input: {
    prompt: "[Push in]Close up of a tense woman looks to the left, startled by a sound, in a darkened kitchen, Pots and pans hang ominously, the window in the kitchen is open and the wind softly blows the pans and creates an ominous mood. [Shake]the woman's shock turns to fear. Black-and-white film noir shot dimly lit, 1950s-style, with dramatic, high-contrast shadows. The overall atmosphere is reminiscent of Alfred Hitchcock's suspenseful storytelling, evoking a looming sense of dread with stark chiaroscuro lighting and a slight film-grain texture."
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

- [Model Playground](https://fal.ai/models/fal-ai/minimax/video-01-director)
- [API Documentation](https://fal.ai/models/fal-ai/minimax/video-01-director/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/minimax/video-01-director)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

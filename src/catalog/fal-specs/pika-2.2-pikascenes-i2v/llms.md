# Pika Scenes (v2.2)

> Pika Scenes v2.2 creates videos from a images with high quality output.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/pika/v2.2/pikascenes`
- **Model ID**: `fal-ai/pika/v2.2/pikascenes`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: editing, effects, animation



## Pricing

5 second video at 720p costs $0.20. 5 second video at 1080p costs $0.45.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_urls`** (`list<string>`, _required_):
  URLs of images to combine into a video
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/a.png","https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/b.png","https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/c.png"]

- **`prompt`** (`string`, _required_):
  Text prompt describing the desired video
  - Examples: "The gorilla is wearing the coat and sitting in the living room, cinematic scene, camera orbit and dolly out"

- **`negative_prompt`** (`string`, _optional_):
  A negative prompt to guide the model Default value: `"ugly, bad, terrible"`
  - Default: `"ugly, bad, terrible"`

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:5"`, `"5:4"`, `"3:2"`, `"2:3"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"720p"`, `"1080p"`
  - Examples: "1080p", "720p"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"5"`
  - Default: `5`
  - Options: `5`, `10`
  - Examples: 5, 10

- **`ingredients_mode`** (`IngredientsModeEnum`, _optional_):
  Mode for integrating multiple images. Precise mode is more accurate, creative mode is more creative. Default value: `"precise"`
  - Default: `"precise"`
  - Options: `"precise"`, `"creative"`



**Required Parameters Example**:

```json
{
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/a.png",
    "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/b.png",
    "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/c.png"
  ],
  "prompt": "The gorilla is wearing the coat and sitting in the living room, cinematic scene, camera orbit and dolly out"
}
```

**Full Example**:

```json
{
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/a.png",
    "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/b.png",
    "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/c.png"
  ],
  "prompt": "The gorilla is wearing the coat and sitting in the living room, cinematic scene, camera orbit and dolly out",
  "negative_prompt": "ugly, bad, terrible",
  "aspect_ratio": "16:9",
  "resolution": "1080p",
  "duration": 5,
  "ingredients_mode": "precise"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video combining multiple images
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/pika/pika_scenes/output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/pika/pika_scenes/output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/pika/v2.2/pikascenes \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/a.png",
       "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/b.png",
       "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/c.png"
     ],
     "prompt": "The gorilla is wearing the coat and sitting in the living room, cinematic scene, camera orbit and dolly out"
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
    "fal-ai/pika/v2.2/pikascenes",
    arguments={
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/a.png", "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/b.png", "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/c.png"],
        "prompt": "The gorilla is wearing the coat and sitting in the living room, cinematic scene, camera orbit and dolly out"
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

const result = await fal.subscribe("fal-ai/pika/v2.2/pikascenes", {
  input: {
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/a.png", "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/b.png", "https://storage.googleapis.com/falserverless/example_inputs/pika/pika_scenes/c.png"],
    prompt: "The gorilla is wearing the coat and sitting in the living room, cinematic scene, camera orbit and dolly out"
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

- [Model Playground](https://fal.ai/models/fal-ai/pika/v2.2/pikascenes)
- [API Documentation](https://fal.ai/models/fal-ai/pika/v2.2/pikascenes/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/pika/v2.2/pikascenes)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

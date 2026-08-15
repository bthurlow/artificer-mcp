# Pika Text to Video (v2.1)

> Start with a simple text input to create dynamic generations that defy expectations. Anything you dream can come to life with sharp details, impressive character control and cinematic camera moves.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/pika/v2.1/text-to-video`
- **Model ID**: `fal-ai/pika/v2.1/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: editing, effects, animation



## Pricing

- **Price**: $0.4 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "A woman styled in a high-fashion brand editorial. the woman stands confidently in a whimsical outdoor setting against a soft, cloudy sky. She wears a bright yellow luxury brand monogram jacket over a crisp striped shirt, paired with flowing pink trousers, accessorized with oversized sunglasses, a golden chain necklace, and a bold luxury brand belt. Delicate flowers in the foreground add a dreamy and artistic touch, evoking a retro yet luxurious high fashion campaign aesthetic. the camera crane up from the flowers to the woman"

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator

- **`negative_prompt`** (`string`, _optional_):
  A negative prompt to guide the model Default value: `""`
  - Default: `""`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:5"`, `"5:4"`, `"3:2"`, `"2:3"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"720p"`, `"1080p"`

- **`duration`** (`integer`, _optional_):
  The duration of the generated video in seconds Default value: `5`
  - Default: `5`



**Required Parameters Example**:

```json
{
  "prompt": "A woman styled in a high-fashion brand editorial. the woman stands confidently in a whimsical outdoor setting against a soft, cloudy sky. She wears a bright yellow luxury brand monogram jacket over a crisp striped shirt, paired with flowing pink trousers, accessorized with oversized sunglasses, a golden chain necklace, and a bold luxury brand belt. Delicate flowers in the foreground add a dreamy and artistic touch, evoking a retro yet luxurious high fashion campaign aesthetic. the camera crane up from the flowers to the woman"
}
```

**Full Example**:

```json
{
  "prompt": "A woman styled in a high-fashion brand editorial. the woman stands confidently in a whimsical outdoor setting against a soft, cloudy sky. She wears a bright yellow luxury brand monogram jacket over a crisp striped shirt, paired with flowing pink trousers, accessorized with oversized sunglasses, a golden chain necklace, and a bold luxury brand belt. Delicate flowers in the foreground add a dreamy and artistic touch, evoking a retro yet luxurious high fashion campaign aesthetic. the camera crane up from the flowers to the woman",
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "duration": 5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/pika/pika_t2v_v21_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/pika/pika_t2v_v21_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/pika/v2.1/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A woman styled in a high-fashion brand editorial. the woman stands confidently in a whimsical outdoor setting against a soft, cloudy sky. She wears a bright yellow luxury brand monogram jacket over a crisp striped shirt, paired with flowing pink trousers, accessorized with oversized sunglasses, a golden chain necklace, and a bold luxury brand belt. Delicate flowers in the foreground add a dreamy and artistic touch, evoking a retro yet luxurious high fashion campaign aesthetic. the camera crane up from the flowers to the woman"
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
    "fal-ai/pika/v2.1/text-to-video",
    arguments={
        "prompt": "A woman styled in a high-fashion brand editorial. the woman stands confidently in a whimsical outdoor setting against a soft, cloudy sky. She wears a bright yellow luxury brand monogram jacket over a crisp striped shirt, paired with flowing pink trousers, accessorized with oversized sunglasses, a golden chain necklace, and a bold luxury brand belt. Delicate flowers in the foreground add a dreamy and artistic touch, evoking a retro yet luxurious high fashion campaign aesthetic. the camera crane up from the flowers to the woman"
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

const result = await fal.subscribe("fal-ai/pika/v2.1/text-to-video", {
  input: {
    prompt: "A woman styled in a high-fashion brand editorial. the woman stands confidently in a whimsical outdoor setting against a soft, cloudy sky. She wears a bright yellow luxury brand monogram jacket over a crisp striped shirt, paired with flowing pink trousers, accessorized with oversized sunglasses, a golden chain necklace, and a bold luxury brand belt. Delicate flowers in the foreground add a dreamy and artistic touch, evoking a retro yet luxurious high fashion campaign aesthetic. the camera crane up from the flowers to the woman"
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

- [Model Playground](https://fal.ai/models/fal-ai/pika/v2.1/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/pika/v2.1/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/pika/v2.1/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

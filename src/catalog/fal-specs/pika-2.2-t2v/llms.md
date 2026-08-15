# Pika Text to Video (v2.2)

> Start with a simple text input to create dynamic generations that defy expectations in up to 1080p. Experience better image clarity and crisper, sharper visuals.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/pika/v2.2/text-to-video`
- **Model ID**: `fal-ai/pika/v2.2/text-to-video`
- **Category**: text-to-video
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


- **`prompt`** (`string`, _required_)
  - Examples: "Large elegant white poodle standing proudly on the deck of a white yacht, wearing oversized glamorous sunglasses and a luxurious silk Gucci-style scarf tied around its neck, layered pearl necklaces draped across its chest, photographed from outside the yacht at a low upward angle, clear blue sky background, strong midday sunlight, washed-out faded tones, slightly overexposed 2000s fashion editorial aesthetic, cinematic analog film texture, playful luxury mood, glossy magazine style, bright harsh light and soft shadows, stylish and extravagant atmosphere. camera slow orbit and dolly in"

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator

- **`negative_prompt`** (`string`, _optional_):
  A negative prompt to guide the model Default value: `"ugly, bad, terrible"`
  - Default: `"ugly, bad, terrible"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`, `"4:5"`, `"5:4"`, `"3:2"`, `"2:3"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"1080p"`, `"720p"`
  - Examples: "1080p", "720p"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"5"`
  - Default: `5`
  - Options: `5`, `10`



**Required Parameters Example**:

```json
{
  "prompt": "Large elegant white poodle standing proudly on the deck of a white yacht, wearing oversized glamorous sunglasses and a luxurious silk Gucci-style scarf tied around its neck, layered pearl necklaces draped across its chest, photographed from outside the yacht at a low upward angle, clear blue sky background, strong midday sunlight, washed-out faded tones, slightly overexposed 2000s fashion editorial aesthetic, cinematic analog film texture, playful luxury mood, glossy magazine style, bright harsh light and soft shadows, stylish and extravagant atmosphere. camera slow orbit and dolly in"
}
```

**Full Example**:

```json
{
  "prompt": "Large elegant white poodle standing proudly on the deck of a white yacht, wearing oversized glamorous sunglasses and a luxurious silk Gucci-style scarf tied around its neck, layered pearl necklaces draped across its chest, photographed from outside the yacht at a low upward angle, clear blue sky background, strong midday sunlight, washed-out faded tones, slightly overexposed 2000s fashion editorial aesthetic, cinematic analog film texture, playful luxury mood, glossy magazine style, bright harsh light and soft shadows, stylish and extravagant atmosphere. camera slow orbit and dolly in",
  "negative_prompt": "ugly, bad, terrible",
  "aspect_ratio": "16:9",
  "resolution": "1080p",
  "duration": 5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/pika/pika_t2v_v22_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/pika/pika_t2v_v22_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/pika/v2.2/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Large elegant white poodle standing proudly on the deck of a white yacht, wearing oversized glamorous sunglasses and a luxurious silk Gucci-style scarf tied around its neck, layered pearl necklaces draped across its chest, photographed from outside the yacht at a low upward angle, clear blue sky background, strong midday sunlight, washed-out faded tones, slightly overexposed 2000s fashion editorial aesthetic, cinematic analog film texture, playful luxury mood, glossy magazine style, bright harsh light and soft shadows, stylish and extravagant atmosphere. camera slow orbit and dolly in"
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
    "fal-ai/pika/v2.2/text-to-video",
    arguments={
        "prompt": "Large elegant white poodle standing proudly on the deck of a white yacht, wearing oversized glamorous sunglasses and a luxurious silk Gucci-style scarf tied around its neck, layered pearl necklaces draped across its chest, photographed from outside the yacht at a low upward angle, clear blue sky background, strong midday sunlight, washed-out faded tones, slightly overexposed 2000s fashion editorial aesthetic, cinematic analog film texture, playful luxury mood, glossy magazine style, bright harsh light and soft shadows, stylish and extravagant atmosphere. camera slow orbit and dolly in"
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

const result = await fal.subscribe("fal-ai/pika/v2.2/text-to-video", {
  input: {
    prompt: "Large elegant white poodle standing proudly on the deck of a white yacht, wearing oversized glamorous sunglasses and a luxurious silk Gucci-style scarf tied around its neck, layered pearl necklaces draped across its chest, photographed from outside the yacht at a low upward angle, clear blue sky background, strong midday sunlight, washed-out faded tones, slightly overexposed 2000s fashion editorial aesthetic, cinematic analog film texture, playful luxury mood, glossy magazine style, bright harsh light and soft shadows, stylish and extravagant atmosphere. camera slow orbit and dolly in"
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

- [Model Playground](https://fal.ai/models/fal-ai/pika/v2.2/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/pika/v2.2/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/pika/v2.2/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

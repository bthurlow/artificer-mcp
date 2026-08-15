# Sound Effects Generator

> Create stunningly realistic sound effects in seconds - CassetteAI's Sound Effects Model generates high-quality SFX up to 30 seconds long in just 1 second of processing time


## Overview

- **Endpoint**: `https://fal.run/cassetteai/sound-effects-generator`
- **Model ID**: `cassetteai/sound-effects-generator`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: sound, sfx, sound-effects, cassetteai



## Pricing

- **Price**: $0.01 per generations

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate SFX.
  - Examples: "dog barking in the rain"

- **`duration`** (`integer`, _required_):
  The duration of the generated SFX in seconds.
  - Range: `1` to `30`
  - Examples: 30



**Required Parameters Example**:

```json
{
  "prompt": "dog barking in the rain",
  "duration": 30
}
```


### Output Schema

The API returns the following output format:

- **`audio_file`** (`File`, _required_):
  The generated SFX
  - Examples: {"url":"https://v3.fal.media/files/panda/FJ56Mbpj1F_MQVuO0UJ9k_generated.wav"}



**Example Response**:

```json
{
  "audio_file": {
    "url": "https://v3.fal.media/files/panda/FJ56Mbpj1F_MQVuO0UJ9k_generated.wav"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/cassetteai/sound-effects-generator \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "dog barking in the rain",
     "duration": 30
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
    "cassetteai/sound-effects-generator",
    arguments={
        "prompt": "dog barking in the rain",
        "duration": 30
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

const result = await fal.subscribe("cassetteai/sound-effects-generator", {
  input: {
    prompt: "dog barking in the rain",
    duration: 30
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

- [Model Playground](https://fal.ai/models/cassetteai/sound-effects-generator)
- [API Documentation](https://fal.ai/models/cassetteai/sound-effects-generator/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=cassetteai/sound-effects-generator)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

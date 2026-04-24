# Lyria2

> Lyria 2 is Google's latest music generation model, you can generate any type of music with this model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/lyria2`
- **Model ID**: `fal-ai/lyria2`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: music, stylized



## Pricing

- **Price**: $0.1 per 30 seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the music you want to generate
  - Examples: "A lush, ambient soundscape featuring the serene sounds of a flowing river, complemented by the distant chirping of birds, and a gentle, melancholic piano melody that slowly unfolds."

- **`negative_prompt`** (`string`, _optional_):
  A description of what to exclude from the generated audio Default value: `"low quality"`
  - Default: `"low quality"`
  - Examples: "vocals, slow tempo", "low quality"

- **`seed`** (`integer`, _optional_):
  A seed for deterministic generation. If provided, the model will attempt to produce the same audio given the same prompt and other parameters.



**Required Parameters Example**:

```json
{
  "prompt": "A lush, ambient soundscape featuring the serene sounds of a flowing river, complemented by the distant chirping of birds, and a gentle, melancholic piano melody that slowly unfolds."
}
```

**Full Example**:

```json
{
  "prompt": "A lush, ambient soundscape featuring the serene sounds of a flowing river, complemented by the distant chirping of birds, and a gentle, melancholic piano melody that slowly unfolds.",
  "negative_prompt": "vocals, slow tempo"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated music
  - Examples: {"url":"https://v3.fal.media/files/koala/9V6ADhxcZrZr2FcaiNA7H_output.wav"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3.fal.media/files/koala/9V6ADhxcZrZr2FcaiNA7H_output.wav"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/lyria2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A lush, ambient soundscape featuring the serene sounds of a flowing river, complemented by the distant chirping of birds, and a gentle, melancholic piano melody that slowly unfolds."
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
    "fal-ai/lyria2",
    arguments={
        "prompt": "A lush, ambient soundscape featuring the serene sounds of a flowing river, complemented by the distant chirping of birds, and a gentle, melancholic piano melody that slowly unfolds."
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

const result = await fal.subscribe("fal-ai/lyria2", {
  input: {
    prompt: "A lush, ambient soundscape featuring the serene sounds of a flowing river, complemented by the distant chirping of birds, and a gentle, melancholic piano melody that slowly unfolds."
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

- [Model Playground](https://fal.ai/models/fal-ai/lyria2)
- [API Documentation](https://fal.ai/models/fal-ai/lyria2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/lyria2)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

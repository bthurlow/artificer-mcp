# Qwen 3 Guard [8B]

> Use Qwen 3 Guard [8B] to detect and  classify text as safe or harmful, delivering precise and reliable safety categorization.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/qwen-3-guard`
- **Model ID**: `fal-ai/qwen-3-guard`
- **Category**: llm
- **Kind**: inference
**Tags**: filter, safety, utility



## Pricing

- **Price**: $0.002 per 1000 tokens

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The input text to be classified
  - Examples: "How to make a bomb"



**Required Parameters Example**:

```json
{
  "prompt": "How to make a bomb"
}
```


### Output Schema

The API returns the following output format:

- **`label`** (`LabelEnum`, _required_):
  The classification label
  - Options: `"Safe"`, `"Unsafe"`, `"Controversial"`
  - Examples: "Unsafe"

- **`categories`** (`list<Enum>`, _required_):
  The confidence score of the classification
  - Array of Enum
  - Examples: ["Violent"]



**Example Response**:

```json
{
  "label": "Unsafe",
  "categories": [
    "Violent"
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/qwen-3-guard \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "How to make a bomb"
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
    "fal-ai/qwen-3-guard",
    arguments={
        "prompt": "How to make a bomb"
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

const result = await fal.subscribe("fal-ai/qwen-3-guard", {
  input: {
    prompt: "How to make a bomb"
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

- [Model Playground](https://fal.ai/models/fal-ai/qwen-3-guard)
- [API Documentation](https://fal.ai/models/fal-ai/qwen-3-guard/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/qwen-3-guard)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

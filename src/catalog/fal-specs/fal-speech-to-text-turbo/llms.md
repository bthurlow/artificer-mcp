# Speech-to-Text

> Leverage the rapid processing capabilities of AI models to enable accurate and efficient real-time speech-to-text transcription.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/speech-to-text/turbo`
- **Model ID**: `fal-ai/speech-to-text/turbo`
- **Category**: speech-to-text
- **Kind**: inference


## Pricing

- **Price**: $0.0008 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`audio_url`** (`string`, _required_):
  Local filesystem path (or remote URL) to a long audio file
  - Examples: "https://storage.googleapis.com/falserverless/canary/18e15559-ab3e-4f96-9583-be5ddde91e43.mp3"

- **`use_pnc`** (`boolean`, _optional_):
  Whether to use Canary's built-in punctuation & capitalization Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/canary/18e15559-ab3e-4f96-9583-be5ddde91e43.mp3"
}
```

**Full Example**:

```json
{
  "audio_url": "https://storage.googleapis.com/falserverless/canary/18e15559-ab3e-4f96-9583-be5ddde91e43.mp3",
  "use_pnc": true
}
```


### Output Schema

The API returns the following output format:

- **`output`** (`string`, _required_):
  The partial or final transcription output from Canary

- **`partial`** (`boolean`, _optional_):
  Indicates if this is a partial (in-progress) transcript
  - Default: `false`



**Example Response**:

```json
{
  "output": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/speech-to-text/turbo \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "audio_url": "https://storage.googleapis.com/falserverless/canary/18e15559-ab3e-4f96-9583-be5ddde91e43.mp3"
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
    "fal-ai/speech-to-text/turbo",
    arguments={
        "audio_url": "https://storage.googleapis.com/falserverless/canary/18e15559-ab3e-4f96-9583-be5ddde91e43.mp3"
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

const result = await fal.subscribe("fal-ai/speech-to-text/turbo", {
  input: {
    audio_url: "https://storage.googleapis.com/falserverless/canary/18e15559-ab3e-4f96-9583-be5ddde91e43.mp3"
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

- [Model Playground](https://fal.ai/models/fal-ai/speech-to-text/turbo)
- [API Documentation](https://fal.ai/models/fal-ai/speech-to-text/turbo/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/speech-to-text/turbo)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

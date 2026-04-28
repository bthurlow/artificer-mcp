# MiniMax (Hailuo AI) Video 01 Subject Reference

> Generate video clips maintaining consistent, realistic facial features and identity across dynamic video content


## Overview

- **Endpoint**: `https://fal.run/fal-ai/minimax/video-01-subject-reference`
- **Model ID**: `fal-ai/minimax/video-01-subject-reference`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: subject, transformation



## Pricing

- **Price**: $0.5 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."

- **`subject_reference_image_url`** (`string`, _required_):
  URL of the subject reference image to use for consistent subject appearance
  - Examples: "https://fal.media/files/tiger/s2xnjhLpjM6L8ISxlDCAw.png"

- **`prompt_optimizer`** (`boolean`, _optional_):
  Whether to use the model's prompt optimizer Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
  "subject_reference_image_url": "https://fal.media/files/tiger/s2xnjhLpjM6L8ISxlDCAw.png"
}
```

**Full Example**:

```json
{
  "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
  "subject_reference_image_url": "https://fal.media/files/tiger/s2xnjhLpjM6L8ISxlDCAw.png",
  "prompt_optimizer": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"url":"https://fal.media/files/rabbit/pONKqOnY7z6GlF6oDESvR_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/rabbit/pONKqOnY7z6GlF6oDESvR_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/minimax/video-01-subject-reference \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
     "subject_reference_image_url": "https://fal.media/files/tiger/s2xnjhLpjM6L8ISxlDCAw.png"
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
    "fal-ai/minimax/video-01-subject-reference",
    arguments={
        "prompt": "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
        "subject_reference_image_url": "https://fal.media/files/tiger/s2xnjhLpjM6L8ISxlDCAw.png"
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

const result = await fal.subscribe("fal-ai/minimax/video-01-subject-reference", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
    subject_reference_image_url: "https://fal.media/files/tiger/s2xnjhLpjM6L8ISxlDCAw.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/minimax/video-01-subject-reference)
- [API Documentation](https://fal.ai/models/fal-ai/minimax/video-01-subject-reference/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/minimax/video-01-subject-reference)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# T2V Turbo - Video Crafter

> Generate short video clips from your prompts


## Overview

- **Endpoint**: `https://fal.run/fal-ai/t2v-turbo`
- **Model ID**: `fal-ai/t2v-turbo`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: turbo



## Pricing

- **Price**: $0 per compute seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate images from
  - Examples: "a dog wearing vr goggles on a boat"

- **`seed`** (`integer`, _optional_):
  The seed to use for the random number generator
  - Range: `0` to `203279`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of steps to sample Default value: `4`
  - Default: `4`
  - Range: `1` to `12`

- **`guidance_scale`** (`float`, _optional_):
  The guidance scale Default value: `7.5`
  - Default: `7.5`
  - Range: `0.1` to `30`

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate Default value: `16`
  - Default: `16`
  - Range: `16` to `32`

- **`export_fps`** (`integer`, _optional_):
  The FPS of the exported video Default value: `8`
  - Default: `8`
  - Range: `1` to `24`



**Required Parameters Example**:

```json
{
  "prompt": "a dog wearing vr goggles on a boat"
}
```

**Full Example**:

```json
{
  "prompt": "a dog wearing vr goggles on a boat",
  "num_inference_steps": 4,
  "guidance_scale": 7.5,
  "num_frames": 16,
  "export_fps": 8
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The URL to the generated video



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
  --url https://fal.run/fal-ai/t2v-turbo \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "a dog wearing vr goggles on a boat"
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
    "fal-ai/t2v-turbo",
    arguments={
        "prompt": "a dog wearing vr goggles on a boat"
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

const result = await fal.subscribe("fal-ai/t2v-turbo", {
  input: {
    prompt: "a dog wearing vr goggles on a boat"
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

- [Model Playground](https://fal.ai/models/fal-ai/t2v-turbo)
- [API Documentation](https://fal.ai/models/fal-ai/t2v-turbo/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/t2v-turbo)
- [GitHub Repository](https://t2v-turbo.github.io/)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

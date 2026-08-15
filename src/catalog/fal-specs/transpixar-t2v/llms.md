# TransPixar V1

> Transform text into stunning videos with TransPixar - an AI model that generates both RGB footage and alpha channels, enabling seamless compositing and creative video effects.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/transpixar`
- **Model ID**: `fal-ai/transpixar`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

- **Price**: $0.4 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate the video from.
  - Examples: "A cloud of dust erupting and dispersing like an explosion."

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to generate video from Default value: `""`
  - Default: `""`
  - Examples: "Distorted, discontinuous, Ugly, blurry, low resolution, motionless, static, disfigured, disconnected limbs, Ugly faces, incomplete arms"

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `24`
  - Default: `24`
  - Range: `1` to `50`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of the model
  will output the same video every time.

- **`guidance_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want
  the model to stick to your prompt when looking for a related video to show you. Default value: `7`
  - Default: `7`
  - Range: `0` to `20`

- **`export_fps`** (`integer`, _optional_):
  The target FPS of the video Default value: `8`
  - Default: `8`
  - Range: `4` to `32`



**Required Parameters Example**:

```json
{
  "prompt": "A cloud of dust erupting and dispersing like an explosion."
}
```

**Full Example**:

```json
{
  "prompt": "A cloud of dust erupting and dispersing like an explosion.",
  "negative_prompt": "Distorted, discontinuous, Ugly, blurry, low resolution, motionless, static, disfigured, disconnected limbs, Ugly faces, incomplete arms",
  "num_inference_steps": 24,
  "guidance_scale": 7,
  "export_fps": 8
}
```


### Output Schema

The API returns the following output format:

- **`videos`** (`list<File>`, _required_):
  The URL to the generated video
  - Array of File
  - Examples: [{"file_size":146468,"file_name":"rgb.mp4","content_type":"application/octet-stream","url":"https://v3.fal.media/files/kangaroo/G6gkFsuyU5L7sJ55nZUPU_rgb.mp4"},{"file_size":106894,"file_name":"alpha.mp4","content_type":"application/octet-stream","url":"https://v3.fal.media/files/lion/g7PBZfQEH9SoPXYgeyl5P_alpha.mp4"}]

- **`timings`** (`Timings`, _required_)

- **`seed`** (`integer`, _required_):
  Seed of the generated video. It will be the same value of the one passed in the
  input or the randomly generated that was used in case none was passed.

- **`prompt`** (`string`, _required_):
  The prompt used for generating the video.



**Example Response**:

```json
{
  "videos": [
    {
      "file_size": 146468,
      "file_name": "rgb.mp4",
      "content_type": "application/octet-stream",
      "url": "https://v3.fal.media/files/kangaroo/G6gkFsuyU5L7sJ55nZUPU_rgb.mp4"
    },
    {
      "file_size": 106894,
      "file_name": "alpha.mp4",
      "content_type": "application/octet-stream",
      "url": "https://v3.fal.media/files/lion/g7PBZfQEH9SoPXYgeyl5P_alpha.mp4"
    }
  ],
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/transpixar \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A cloud of dust erupting and dispersing like an explosion."
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
    "fal-ai/transpixar",
    arguments={
        "prompt": "A cloud of dust erupting and dispersing like an explosion."
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

const result = await fal.subscribe("fal-ai/transpixar", {
  input: {
    prompt: "A cloud of dust erupting and dispersing like an explosion."
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

- [Model Playground](https://fal.ai/models/fal-ai/transpixar)
- [API Documentation](https://fal.ai/models/fal-ai/transpixar/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/transpixar)
- [GitHub Repository](https://huggingface.co/THUDM/CogVideoX-5b/blob/main/LICENSE)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

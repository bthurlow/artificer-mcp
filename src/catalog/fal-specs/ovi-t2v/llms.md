# Ovi Text to Video

> A unified paradigm for audio-video generation


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ovi`
- **Model ID**: `fal-ai/ovi`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

- **Price**: $0.2 per videos

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A close-up of someone's face as they pet a cat, their hands stroking the soft fur in the foreground. Their affectionate expression shows as the cat purrs contentedly in their lap. They say, <S>This little guy has been with me for eight years now. He knows exactly when I need comfort. Animals are pretty amazing that way.<E>.<AUDCAP>Affectionate voice with cat purring and gentle petting sounds<ENDAUDCAP>"

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for video generation. Default value: `"jitter, bad hands, blur, distortion"`
  - Default: `"jitter, bad hands, blur, distortion"`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps. Default value: `30`
  - Default: `30`
  - Range: `1` to `50`

- **`audio_negative_prompt`** (`string`, _optional_):
  Negative prompt for audio generation. Default value: `"robotic, muffled, echo, distorted"`
  - Default: `"robotic, muffled, echo, distorted"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video in W:H format. One of (512x992, 992x512, 960x512, 512x960, 720x720, or 448x1120). Default value: `"992x512"`
  - Default: `"992x512"`
  - Options: `"512x992"`, `"992x512"`, `"960x512"`, `"512x960"`, `"720x720"`, `"448x1120"`, `"1120x448"`



**Required Parameters Example**:

```json
{
  "prompt": "A close-up of someone's face as they pet a cat, their hands stroking the soft fur in the foreground. Their affectionate expression shows as the cat purrs contentedly in their lap. They say, <S>This little guy has been with me for eight years now. He knows exactly when I need comfort. Animals are pretty amazing that way.<E>.<AUDCAP>Affectionate voice with cat purring and gentle petting sounds<ENDAUDCAP>"
}
```

**Full Example**:

```json
{
  "prompt": "A close-up of someone's face as they pet a cat, their hands stroking the soft fur in the foreground. Their affectionate expression shows as the cat purrs contentedly in their lap. They say, <S>This little guy has been with me for eight years now. He knows exactly when I need comfort. Animals are pretty amazing that way.<E>.<AUDCAP>Affectionate voice with cat purring and gentle petting sounds<ENDAUDCAP>",
  "negative_prompt": "jitter, bad hands, blur, distortion",
  "num_inference_steps": 30,
  "audio_negative_prompt": "robotic, muffled, echo, distorted",
  "resolution": "992x512"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _optional_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_inputs/ovi_t2v_output.mp4"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_inputs/ovi_t2v_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ovi \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A close-up of someone's face as they pet a cat, their hands stroking the soft fur in the foreground. Their affectionate expression shows as the cat purrs contentedly in their lap. They say, <S>This little guy has been with me for eight years now. He knows exactly when I need comfort. Animals are pretty amazing that way.<E>.<AUDCAP>Affectionate voice with cat purring and gentle petting sounds<ENDAUDCAP>"
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
    "fal-ai/ovi",
    arguments={
        "prompt": "A close-up of someone's face as they pet a cat, their hands stroking the soft fur in the foreground. Their affectionate expression shows as the cat purrs contentedly in their lap. They say, <S>This little guy has been with me for eight years now. He knows exactly when I need comfort. Animals are pretty amazing that way.<E>.<AUDCAP>Affectionate voice with cat purring and gentle petting sounds<ENDAUDCAP>"
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

const result = await fal.subscribe("fal-ai/ovi", {
  input: {
    prompt: "A close-up of someone's face as they pet a cat, their hands stroking the soft fur in the foreground. Their affectionate expression shows as the cat purrs contentedly in their lap. They say, <S>This little guy has been with me for eight years now. He knows exactly when I need comfort. Animals are pretty amazing that way.<E>.<AUDCAP>Affectionate voice with cat purring and gentle petting sounds<ENDAUDCAP>"
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

- [Model Playground](https://fal.ai/models/fal-ai/ovi)
- [API Documentation](https://fal.ai/models/fal-ai/ovi/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ovi)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Stable Audio 2.5

> Generate high quality music and sound effects using Stable Audio 2.5 from StabilityAI


## Overview

- **Endpoint**: `https://fal.run/fal-ai/stable-audio-25/text-to-audio`
- **Model ID**: `fal-ai/stable-audio-25/text-to-audio`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: audio



## Pricing

- **Price**: $0.2 per audios

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate audio from
  - Examples: "A beautiful piano arpeggio grows into a grand orchestral climax"

- **`seconds_total`** (`integer`, _optional_):
  The duration of the audio clip to generate Default value: `190`
  - Default: `190`
  - Range: `1` to `190`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of steps to denoise the audio for Default value: `8`
  - Default: `8`
  - Range: `4` to `8`

- **`guidance_scale`** (`float`, _optional_):
  How strictly the diffusion process adheres to the prompt text (higher values make your audio closer to your prompt). Default value: `1`
  - Default: `1`
  - Range: `1` to `25`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`seed`** (`integer`, _optional_)



**Required Parameters Example**:

```json
{
  "prompt": "A beautiful piano arpeggio grows into a grand orchestral climax"
}
```

**Full Example**:

```json
{
  "prompt": "A beautiful piano arpeggio grows into a grand orchestral climax",
  "seconds_total": 190,
  "num_inference_steps": 8,
  "guidance_scale": 1
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio clip
  - Examples: "https://v3.fal.media/files/zebra/lGob9bN7VHfFXG4R1btQn_tmpabwhgi6n.wav"

- **`seed`** (`integer`, _required_):
  The random seed used for generation



**Example Response**:

```json
{
  "audio": "https://v3.fal.media/files/zebra/lGob9bN7VHfFXG4R1btQn_tmpabwhgi6n.wav"
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/stable-audio-25/text-to-audio \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A beautiful piano arpeggio grows into a grand orchestral climax"
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
    "fal-ai/stable-audio-25/text-to-audio",
    arguments={
        "prompt": "A beautiful piano arpeggio grows into a grand orchestral climax"
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

const result = await fal.subscribe("fal-ai/stable-audio-25/text-to-audio", {
  input: {
    prompt: "A beautiful piano arpeggio grows into a grand orchestral climax"
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

- [Model Playground](https://fal.ai/models/fal-ai/stable-audio-25/text-to-audio)
- [API Documentation](https://fal.ai/models/fal-ai/stable-audio-25/text-to-audio/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/stable-audio-25/text-to-audio)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Stable Audio 3

> Stable Audio 3 Medium is a 1.4 billion parameter latent diffusion model that generates high-quality stereo music up to 6 minutes from text prompts, trained on fully licensed data for safe commercial use.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/stable-audio-3/medium/text-to-audio`
- **Model ID**: `fal-ai/stable-audio-3/medium/text-to-audio`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: music, audio, stereo



## Pricing

- **Price**: $0.0376 per audios

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`negative_prompt`** (`string`, _optional_):
  Text description of qualities to avoid in the output. Default value: `""`
  - Default: `""`

- **`duration`** (`float`, _optional_):
  Duration of the generated audio in seconds. The medium model supports up to 380 seconds (~6m20s). Default value: `30`
  - Default: `30`
  - Range: `1` to `380`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of sampling steps. Post-trained (distilled) checkpoints look good with the default 8 and gain little from going higher. Default value: `8`
  - Default: `8`
  - Range: `1` to `100`

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. Higher values follow the prompt more strictly. Only effective on base (non-distilled) checkpoints. Default value: `1`
  - Default: `1`
  - Range: `0` to `25`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible outputs. Omit for a random seed.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  If True, the prompt will be expanded using an LLM for more detailed and higher quality results.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable NSFW content safety checking. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If True, the audio is returned inline as a data URI and the result is not saved to the request history.
  - Default: `false`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Container format for the generated audio output. Default value: `"mp3"`
  - Default: `"mp3"`
  - Options: `"mp3"`, `"wav"`, `"flac"`, `"ogg"`, `"opus"`, `"m4a"`, `"aac"`

- **`bitrate`** (`string`, _optional_):
  Audio bitrate for compressed output formats (e.g., mp3, aac, opus). Format e.g. '192k' or '320k'. Ignored for lossless formats (wav, flac). Default value: `"192k"`
  - Default: `"192k"`

- **`prompt`** (`string`, _required_):
  Text description of the audio to generate.
  - Examples: "An anthemic Pop Rock instrumental that fills your head with nostalgic thoughtfulness"



**Required Parameters Example**:

```json
{
  "prompt": "An anthemic Pop Rock instrumental that fills your head with nostalgic thoughtfulness"
}
```

**Full Example**:

```json
{
  "duration": 30,
  "num_inference_steps": 8,
  "guidance_scale": 1,
  "enable_safety_checker": true,
  "output_format": "mp3",
  "bitrate": "192k",
  "prompt": "An anthemic Pop Rock instrumental that fills your head with nostalgic thoughtfulness"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated audio clip.

- **`seed`** (`integer`, _required_):
  The random seed used for generation.

- **`prompt`** (`string`, _required_):
  The prompt used for generation.



**Example Response**:

```json
{
  "audio": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  },
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/stable-audio-3/medium/text-to-audio \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "An anthemic Pop Rock instrumental that fills your head with nostalgic thoughtfulness"
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
    "fal-ai/stable-audio-3/medium/text-to-audio",
    arguments={
        "prompt": "An anthemic Pop Rock instrumental that fills your head with nostalgic thoughtfulness"
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

const result = await fal.subscribe("fal-ai/stable-audio-3/medium/text-to-audio", {
  input: {
    prompt: "An anthemic Pop Rock instrumental that fills your head with nostalgic thoughtfulness"
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

- [Model Playground](https://fal.ai/models/fal-ai/stable-audio-3/medium/text-to-audio)
- [API Documentation](https://fal.ai/models/fal-ai/stable-audio-3/medium/text-to-audio/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/stable-audio-3/medium/text-to-audio)

### fal.ai Platform

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

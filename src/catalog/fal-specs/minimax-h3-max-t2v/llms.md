# MiniMax H3 Max Text to Video

> fal's H3 Max is a post-trained variant of MiniMax H3, tuned for stronger prompt adherence and better aesthetics while co-optimized with our custom inference stack for higher throughput with no compromises on output quality


## Overview

- **Endpoint**: `https://fal.run/minimax/h3-max/text-to-video`
- **Model ID**: `minimax/h3-max/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Billing is calculated per second of video generated. Through **October 31, 2026**, the **35%** promotional discount applies: **$0.0325** at **480p**, **$0.052** at **768p**, and **$0.104** at **1080p** per second. From **November 1 through November 15, 2026**, get **30% off** standard rates: **$0.035** at **480p**, **$0.056** at **768p**, and **$0.112** at **1080p** per second. During the November promotion, **5 seconds** of video at **768p** costs **$0.28**. From **November 16, 2026**, standard rates are **$0.05**, **$0.08**, and **$0.16** per second at **480p**, **768p**, and **1080p**, respectively. Contact your sales representative to discuss permanent discounted pricing.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation
  - Examples: "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves."

- **`duration`** (`float`, _optional_):
  Video length in seconds. The output can run up to about 0.7 s longer than requested. Use at least 2 s with target_audio_url. Default value: `5`
  - Default: `5`
  - Range: `0.92` to `15`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The native generation resolution, or 1080P latent refinement from a native 768P source. Default value: `"768P"`
  - Default: `"768P"`
  - Options: `"480P"`, `"768P"`, `"1080P"`

- **`seed`** (`integer`, _optional_):
  Random seed. A random seed is selected when omitted.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  Return the generated video as base64 instead of a CDN URL.
  - Default: `false`

- **`prompt_expansion_mode`** (`string`, _required_):
  How much effort to spend rewriting the prompt before generation. 'disabled' skips prompt expansion. 'balanced' returns in about a second. 'quality' spends up to ~30s on a richer prompt. Default value: `"balanced"`
  - Default: `"balanced"`
  - Examples: "disabled", "balanced", "quality"

- **`target_audio_url`** (`string`, _optional_):
  Optional URL of an audio clip at least 2 seconds long (maximum 15 MB) to pin to the generated soundtrack. Longer clips are trimmed to the generated video's length, keeping the beginning. The original audio replaces the output soundtrack, padded with silence if shorter than the video, without changing playback speed. Exceptionally high sample rates may be resampled to 96 kHz. Accepts an HTTP(S) URL or a base64 data URI.

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"21:9"`, `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`



**Required Parameters Example**:

```json
{
  "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves.",
  "prompt_expansion_mode": "disabled"
}
```

**Full Example**:

```json
{
  "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves.",
  "duration": 5,
  "resolution": "768P",
  "enable_safety_checker": true,
  "prompt_expansion_mode": "disabled",
  "aspect_ratio": "16:9"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0aa46818/--prs89fkHtWW406fmEs__NRhTqNku.mp4","file_name":"--prs89fkHtWW406fmEs__NRhTqNku.mp4","file_size":6463396}

- **`expanded_prompt`** (`string`, _optional_):
  The prompt after expansion, as sent to the model. Null when prompt expansion was disabled, left the prompt unchanged, or was performed internally by MiniMax's hosted API.

- **`timings`** (`object`, _optional_):
  Timing breakdown in seconds. 'inference' is the DiT denoising time on the GPU backend. Null on routes that do not report backend timings.



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0aa46818/--prs89fkHtWW406fmEs__NRhTqNku.mp4",
    "file_name": "--prs89fkHtWW406fmEs__NRhTqNku.mp4",
    "file_size": 6463396
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/minimax/h3-max/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves.",
     "prompt_expansion_mode": "disabled"
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
    "minimax/h3-max/text-to-video",
    arguments={
        "prompt": "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves.",
        "prompt_expansion_mode": "disabled"
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

const result = await fal.subscribe("minimax/h3-max/text-to-video", {
  input: {
    prompt: "A white kitten chases a butterfly across a sunlit garden. Gentle camera tracking, natural movement, soft afternoon light filtering through the leaves.",
    prompt_expansion_mode: "disabled"
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


## Deploy your own model

To run your own weights, a fine-tune or a custom pipeline on the GPUs that serve this API, deploy it on fal Serverless. GPUs from H100 (80GB) to B300 (288GB), billed per second; an H100 is $4.50/h list, as low as $2.49/h. Prices, GPU specs and deploy steps: [fal Serverless](https://fal.ai/serverless.md).

## Additional Resources

### Documentation

- [Model Playground](https://fal.ai/models/minimax/h3-max/text-to-video)
- [API Documentation](https://fal.ai/models/minimax/h3-max/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=minimax/h3-max/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- [Pricing](https://fal.ai/pricing.md): Model API and Serverless GPU prices
- [fal Serverless](https://fal.ai/serverless.md): Deploy your own models: GPU prices, specs and steps
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

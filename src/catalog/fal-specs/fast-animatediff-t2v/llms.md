# AnimateDiff

> Animate your ideas!


## Overview

- **Endpoint**: `https://fal.run/fal-ai/fast-animatediff/text-to-video`
- **Model ID**: `fal-ai/fast-animatediff/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: animation, stylized



## Pricing

- **Price**: $0 per compute seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to use for generating the video. Be as descriptive as possible for best results.
  - Examples: "masterpiece, best quality, 1girl, solo, cherry blossoms, hanami, pink flower, white flower, spring season, wisteria, petals, flower, plum blossoms, outdoors, falling petals, white hair, black eyes", "panda playing a guitar, on a boat, in the ocean, high quality, high quality, ultra HD, realistic"

- **`negative_prompt`** (`string`, _optional_):
  The negative prompt to use. Use it to address details that you don't want
  in the image. This could be colors, objects, scenery and even the small details
  (e.g. moustache, blurry, low resolution). Default value: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`
  - Default: `"(bad quality, worst quality:1.2), ugly faces, bad anime"`

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate for the video. Default value: `16`
  - Default: `16`
  - Range: `1` to `32`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `25`
  - Default: `25`
  - Range: `1` to `50`

- **`guidance_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want
  the model to stick to your prompt when looking for a related image to show you. Default value: `7.5`
  - Default: `7.5`
  - Range: `0` to `20`

- **`seed`** (`integer`, _optional_):
  The same seed and the same prompt given to the same version of Stable Diffusion
  will output the same image every time.

- **`fps`** (`integer`, _optional_):
  Number of frames per second to extract from the video. Default value: `8`
  - Default: `8`
  - Range: `1` to `16`

- **`motions`** (`list<Enum>`, _optional_):
  The motions to apply to the video.
  - Array of Enum

- **`video_size`** (`ImageSize | Enum`, _optional_):
  The size of the video to generate. Default value: `square`
  - Default: `"square"`
  - One of: ImageSize | Enum



**Required Parameters Example**:

```json
{
  "prompt": "masterpiece, best quality, 1girl, solo, cherry blossoms, hanami, pink flower, white flower, spring season, wisteria, petals, flower, plum blossoms, outdoors, falling petals, white hair, black eyes"
}
```

**Full Example**:

```json
{
  "prompt": "masterpiece, best quality, 1girl, solo, cherry blossoms, hanami, pink flower, white flower, spring season, wisteria, petals, flower, plum blossoms, outdoors, falling petals, white hair, black eyes",
  "negative_prompt": "(bad quality, worst quality:1.2), ugly faces, bad anime",
  "num_frames": 16,
  "num_inference_steps": 25,
  "guidance_scale": 7.5,
  "fps": 8,
  "video_size": "square"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file.
  - Examples: {"url":"https://fal-cdn.batuhan-941.workers.dev/files/kangaroo/DSrFBOk9XXIplm_kukI4n.mp4"}

- **`seed`** (`integer`, _required_):
  Seed used for generating the video.



**Example Response**:

```json
{
  "video": {
    "url": "https://fal-cdn.batuhan-941.workers.dev/files/kangaroo/DSrFBOk9XXIplm_kukI4n.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/fast-animatediff/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "masterpiece, best quality, 1girl, solo, cherry blossoms, hanami, pink flower, white flower, spring season, wisteria, petals, flower, plum blossoms, outdoors, falling petals, white hair, black eyes"
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
    "fal-ai/fast-animatediff/text-to-video",
    arguments={
        "prompt": "masterpiece, best quality, 1girl, solo, cherry blossoms, hanami, pink flower, white flower, spring season, wisteria, petals, flower, plum blossoms, outdoors, falling petals, white hair, black eyes"
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

const result = await fal.subscribe("fal-ai/fast-animatediff/text-to-video", {
  input: {
    prompt: "masterpiece, best quality, 1girl, solo, cherry blossoms, hanami, pink flower, white flower, spring season, wisteria, petals, flower, plum blossoms, outdoors, falling petals, white hair, black eyes"
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

- [Model Playground](https://fal.ai/models/fal-ai/fast-animatediff/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/fast-animatediff/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/fast-animatediff/text-to-video)
- [GitHub Repository](https://github.com/guoyww/AnimateDiff/blob/main/LICENSE.txt)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# FLUX 2

> Text-to-image generation with FLUX.2 [dev] from Black Forest Labs. Enhanced realism, crisper text generation, and native editing capabilities.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/flux-2`
- **Model ID**: `fal-ai/flux-2`
- **Category**: text-to-image
- **Kind**: inference


## Pricing

- **Price**: $0.012 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate an image from.
  - Examples: "Dutch angle close-up of a survivor in post-apocalyptic setting, dust-covered face, dramatic harsh sunlight creating deep shadows, happy expression, desaturated dystopian color palette, gritty realism"

- **`guidance_scale`** (`float`, _optional_):
  Guidance Scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you. Default value: `2.5`
  - Default: `2.5`
  - Range: `0` to `20`

- **`seed`** (`integer`, _optional_):
  The seed to use for the generation. If not provided, a random seed will be used.

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `28`
  - Default: `28`
  - Range: `4` to `50`

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the image to generate. The width and height must be between 512 and 2048 pixels. Default value: `landscape_4_3`
  - Default: `"landscape_4_3"`
  - One of: ImageSize | Enum

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use for the image generation. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`, `"high"`
  - Examples: "regular"

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  If set to true, the prompt will be expanded for better results.
  - Default: `false`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Disabling it requires account authorization; unauthorized requests are always checked, and images flagged as unsafe are returned as black images. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`



**Required Parameters Example**:

```json
{
  "prompt": "Dutch angle close-up of a survivor in post-apocalyptic setting, dust-covered face, dramatic harsh sunlight creating deep shadows, happy expression, desaturated dystopian color palette, gritty realism"
}
```

**Full Example**:

```json
{
  "prompt": "Dutch angle close-up of a survivor in post-apocalyptic setting, dust-covered face, dramatic harsh sunlight creating deep shadows, happy expression, desaturated dystopian color palette, gritty realism",
  "guidance_scale": 2.5,
  "num_inference_steps": 28,
  "image_size": "landscape_4_3",
  "num_images": 1,
  "acceleration": "regular",
  "enable_safety_checker": true,
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images
  - Array of ImageFile
  - Examples: [{"url":"https://storage.googleapis.com/falserverless/example_outputs/flux2_dev_t2i_output.png"}]

- **`timings`** (`Timings`, _required_)

- **`seed`** (`integer`, _required_):
  Seed of the generated Image. It will be the same value of the one passed in the
  input or the randomly generated that was used in case none was passed.

- **`has_nsfw_concepts`** (`list<boolean>`, _required_):
  Whether the generated images contain NSFW concepts.
  - Array of boolean

- **`prompt`** (`string`, _required_):
  The prompt used for generating the image.



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/falserverless/example_outputs/flux2_dev_t2i_output.png"
    }
  ],
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/flux-2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Dutch angle close-up of a survivor in post-apocalyptic setting, dust-covered face, dramatic harsh sunlight creating deep shadows, happy expression, desaturated dystopian color palette, gritty realism"
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
    "fal-ai/flux-2",
    arguments={
        "prompt": "Dutch angle close-up of a survivor in post-apocalyptic setting, dust-covered face, dramatic harsh sunlight creating deep shadows, happy expression, desaturated dystopian color palette, gritty realism"
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

const result = await fal.subscribe("fal-ai/flux-2", {
  input: {
    prompt: "Dutch angle close-up of a survivor in post-apocalyptic setting, dust-covered face, dramatic harsh sunlight creating deep shadows, happy expression, desaturated dystopian color palette, gritty realism"
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

- [Model Playground](https://fal.ai/models/fal-ai/flux-2)
- [API Documentation](https://fal.ai/models/fal-ai/flux-2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2)

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

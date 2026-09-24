# FLUX.2 [klein] 9B

> Text-to-image generation with FLUX.2 [klein] 9B from Black Forest Labs. Enhanced realism, crisper text generation, and native editing capabilities.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/flux-2/klein/9b`
- **Model ID**: `fal-ai/flux-2/klein/9b`
- **Category**: text-to-image
- **Kind**: inference


## Pricing

- **Price**: $0.006 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate an image from.
  - Examples: "A bright, surreal scene on a vast white salt flat under a clear blue sky, featuring two fluffy white alpacas standing in the foreground. Behind them sits a sleek white supercar with its scissor doors open, creating a dramatic futuristic silhouette. The sunlight is strong and crisp, casting sharp shadows on the ground and giving the image a clean, high-contrast cinematic look. Minimalist composition, playful luxury vibe, ultra sharp detail, wide-angle perspective, high resolution."

- **`seed`** (`integer`, _optional_):
  The seed to use for the generation. If not provided, a random seed will be used.

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `4`
  - Default: `4`
  - Range: `4` to `8`

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the image to generate. Default value: `landscape_4_3`
  - Default: `"landscape_4_3"`
  - One of: ImageSize | Enum

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI. Output is not stored when this is True.
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
  "prompt": "A bright, surreal scene on a vast white salt flat under a clear blue sky, featuring two fluffy white alpacas standing in the foreground. Behind them sits a sleek white supercar with its scissor doors open, creating a dramatic futuristic silhouette. The sunlight is strong and crisp, casting sharp shadows on the ground and giving the image a clean, high-contrast cinematic look. Minimalist composition, playful luxury vibe, ultra sharp detail, wide-angle perspective, high resolution."
}
```

**Full Example**:

```json
{
  "prompt": "A bright, surreal scene on a vast white salt flat under a clear blue sky, featuring two fluffy white alpacas standing in the foreground. Behind them sits a sleek white supercar with its scissor doors open, creating a dramatic futuristic silhouette. The sunlight is strong and crisp, casting sharp shadows on the ground and giving the image a clean, high-contrast cinematic look. Minimalist composition, playful luxury vibe, ultra sharp detail, wide-angle perspective, high resolution.",
  "num_inference_steps": 4,
  "image_size": "landscape_4_3",
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images
  - Array of ImageFile
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a8a6905/DuNRy1OODaGrlUGEfl9SX.png"}]

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
      "url": "https://v3b.fal.media/files/b/0a8a6905/DuNRy1OODaGrlUGEfl9SX.png"
    }
  ],
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/flux-2/klein/9b \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A bright, surreal scene on a vast white salt flat under a clear blue sky, featuring two fluffy white alpacas standing in the foreground. Behind them sits a sleek white supercar with its scissor doors open, creating a dramatic futuristic silhouette. The sunlight is strong and crisp, casting sharp shadows on the ground and giving the image a clean, high-contrast cinematic look. Minimalist composition, playful luxury vibe, ultra sharp detail, wide-angle perspective, high resolution."
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
    "fal-ai/flux-2/klein/9b",
    arguments={
        "prompt": "A bright, surreal scene on a vast white salt flat under a clear blue sky, featuring two fluffy white alpacas standing in the foreground. Behind them sits a sleek white supercar with its scissor doors open, creating a dramatic futuristic silhouette. The sunlight is strong and crisp, casting sharp shadows on the ground and giving the image a clean, high-contrast cinematic look. Minimalist composition, playful luxury vibe, ultra sharp detail, wide-angle perspective, high resolution."
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

const result = await fal.subscribe("fal-ai/flux-2/klein/9b", {
  input: {
    prompt: "A bright, surreal scene on a vast white salt flat under a clear blue sky, featuring two fluffy white alpacas standing in the foreground. Behind them sits a sleek white supercar with its scissor doors open, creating a dramatic futuristic silhouette. The sunlight is strong and crisp, casting sharp shadows on the ground and giving the image a clean, high-contrast cinematic look. Minimalist composition, playful luxury vibe, ultra sharp detail, wide-angle perspective, high resolution."
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

- [Model Playground](https://fal.ai/models/fal-ai/flux-2/klein/9b)
- [API Documentation](https://fal.ai/models/fal-ai/flux-2/klein/9b/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2/klein/9b)

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

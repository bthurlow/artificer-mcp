# Krea 2 Turbo

> Generate high-fidelity images from text in seconds with Krea 2 Turbo, the speed-optimized open-source version of Krea 2, preserving its aesthetic range for rapid ideation.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/krea-2/turbo`
- **Model ID**: `fal-ai/krea-2/turbo`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: stylized, transform, typography



## Pricing

- **Price**: $0.008 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Base text description of the image to generate.
  - Examples: "a vintage travel poster for Mars"

- **`seed`** (`integer`, _optional_):
  Random seed for reproducible generation. Image *i* uses `seed + i`.

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. Default value: `square_hd`
  - Default: `"square_hd"`
  - One of: ImageSize | Enum

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use for the image generation. Default value: `"none"`
  - Default: `"none"`
  - Options: `"none"`, `"regular"`

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  If true, the prompt is expanded with an LLM into a more detailed image-generation prompt for higher quality results. On failure, the original prompt is used unchanged.
  - Default: `false`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  If true, the output safety checker is enabled. Disabling it requires account authorization; unauthorized requests are always checked, and images flagged as unsafe are returned as black images. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: "png". Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`



**Required Parameters Example**:

```json
{
  "prompt": "a vintage travel poster for Mars"
}
```

**Full Example**:

```json
{
  "prompt": "a vintage travel poster for Mars",
  "image_size": "square_hd",
  "num_images": 1,
  "acceleration": "none",
  "enable_safety_checker": true,
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images.
  - Array of ImageFile

- **`timings`** (`Timings`, _required_):
  Timing information for the request, in seconds.

- **`seed`** (`integer`, _required_):
  The seed used to generate the image(s).
  - Examples: 12345

- **`has_nsfw_concepts`** (`list<boolean>`, _required_):
  Whether each generated image contains NSFW concepts.
  - Array of boolean

- **`prompt`** (`string`, _required_):
  The prompt used for generation.

- **`actual_prompt`** (`string`, _optional_):
  The final prompt after expansion, if prompt expansion was enabled.



**Example Response**:

```json
{
  "images": [
    {
      "url": "",
      "content_type": "image/png",
      "file_name": "z9RV14K95DvU.png",
      "file_size": 4404019
    }
  ],
  "seed": 12345,
  "prompt": ""
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/krea-2/turbo \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "a vintage travel poster for Mars"
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
    "fal-ai/krea-2/turbo",
    arguments={
        "prompt": "a vintage travel poster for Mars"
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

const result = await fal.subscribe("fal-ai/krea-2/turbo", {
  input: {
    prompt: "a vintage travel poster for Mars"
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

- [Model Playground](https://fal.ai/models/fal-ai/krea-2/turbo)
- [API Documentation](https://fal.ai/models/fal-ai/krea-2/turbo/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/krea-2/turbo)

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

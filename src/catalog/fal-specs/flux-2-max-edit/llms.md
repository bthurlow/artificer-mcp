# Flux 2 Max

> FLUX.2 [max] delivers state-of-the-art image generation and advanced image editing with exceptional realism, precision, and consistency.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/flux-2-max/edit`
- **Model ID**: `fal-ai/flux-2-max/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: flux2, image-editing, high-quality



## Pricing

The first processed megapixel will cost **$0.07**. Each additional megapixel will cost **0.03**. Input images counted as processed megapixel.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate an image from.
  - Examples: "A high-fashion magazine cover featuring an android in an avant-garde geometric cloth dress, with logo prints from @Image1. The backdrop is an eye-catching scenery. The title text 'FAL MAGAZINE' spans the top in bold white serif font. Overlay text at the bottom right reads 'THE FUTURE OF AI' in a sleek, thin sans-serif font."

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. If `auto`, the size will be determined by the model. Default value: `auto`
  - Default: `"auto"`
  - One of: ImageSize | Enum

- **`seed`** (`integer`, _optional_):
  The seed to use for the generation.

- **`safety_tolerance`** (`SafetyToleranceEnum`, _optional_):
  The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive. Default value: `"2"`
  - Default: `"2"`
  - Options: `"1"`, `"2"`, `"3"`, `"4"`, `"5"`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable the safety checker. Disabling it requires account authorization; unauthorized requests are always checked. Default value: `true`
  - Default: `true`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`image_urls`** (`list<string>`, _required_):
  List of URLs of input images for editing
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/flux2/max.jpg"]



**Required Parameters Example**:

```json
{
  "prompt": "A high-fashion magazine cover featuring an android in an avant-garde geometric cloth dress, with logo prints from @Image1. The backdrop is an eye-catching scenery. The title text 'FAL MAGAZINE' spans the top in bold white serif font. Overlay text at the bottom right reads 'THE FUTURE OF AI' in a sleek, thin sans-serif font.",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/flux2/max.jpg"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "A high-fashion magazine cover featuring an android in an avant-garde geometric cloth dress, with logo prints from @Image1. The backdrop is an eye-catching scenery. The title text 'FAL MAGAZINE' spans the top in bold white serif font. Overlay text at the bottom right reads 'THE FUTURE OF AI' in a sleek, thin sans-serif font.",
  "image_size": "auto",
  "safety_tolerance": "2",
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/flux2/max.jpg"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images.
  - Array of ImageFile
  - Examples: [{"url":"https://storage.googleapis.com/falserverless/example_outputs/flux2/max_edit_output.jpg"}]

- **`seed`** (`integer`, _required_):
  The seed used for the generation.



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/falserverless/example_outputs/flux2/max_edit_output.jpg"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/flux-2-max/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A high-fashion magazine cover featuring an android in an avant-garde geometric cloth dress, with logo prints from @Image1. The backdrop is an eye-catching scenery. The title text 'FAL MAGAZINE' spans the top in bold white serif font. Overlay text at the bottom right reads 'THE FUTURE OF AI' in a sleek, thin sans-serif font.",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/flux2/max.jpg"
     ]
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
    "fal-ai/flux-2-max/edit",
    arguments={
        "prompt": "A high-fashion magazine cover featuring an android in an avant-garde geometric cloth dress, with logo prints from @Image1. The backdrop is an eye-catching scenery. The title text 'FAL MAGAZINE' spans the top in bold white serif font. Overlay text at the bottom right reads 'THE FUTURE OF AI' in a sleek, thin sans-serif font.",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/flux2/max.jpg"]
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

const result = await fal.subscribe("fal-ai/flux-2-max/edit", {
  input: {
    prompt: "A high-fashion magazine cover featuring an android in an avant-garde geometric cloth dress, with logo prints from @Image1. The backdrop is an eye-catching scenery. The title text 'FAL MAGAZINE' spans the top in bold white serif font. Overlay text at the bottom right reads 'THE FUTURE OF AI' in a sleek, thin sans-serif font.",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/flux2/max.jpg"]
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

- [Model Playground](https://fal.ai/models/fal-ai/flux-2-max/edit)
- [API Documentation](https://fal.ai/models/fal-ai/flux-2-max/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2-max/edit)

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

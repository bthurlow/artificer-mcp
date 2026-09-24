# Flux 2 Flex

> Text-to-image generation with FLUX.2 [flex] from Black Forest Labs. Features adjustable inference steps and guidance scale for fine-tuned control. Enhanced typography and text rendering capabilities.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/flux-2-flex`
- **Model ID**: `fal-ai/flux-2-flex`
- **Category**: text-to-image
- **Kind**: inference
**Tags**: stylized, transform



## Pricing

Your request will cost **$0.05** per megapixel on both input and output side, rounded up to the nearest megapixel. For example, a **1024x1024** image will cost **$0.05**, and a **1920x1080** image will cost **$0.10** (**$0.06** × **2** megapixels). Similarly, a **512x512** output will cost **$0.05** (**$0.05** for **0.26** megapixels, rounded to **1** megapixel).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to generate an image from.
  - Examples: "A high-quality 3D render of a cute fluffy monster eating a giant donut; the fur simulation is incredibly detailed, the donut glaze is sticky and reflective, bright daylight lighting, shallow depth of field."

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. Default value: `landscape_4_3`
  - Default: `"landscape_4_3"`
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

- **`guidance_scale`** (`float`, _optional_):
  The guidance scale to use for the generation. Default value: `3.5`
  - Default: `3.5`
  - Range: `1.5` to `10`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to perform. Default value: `28`
  - Default: `28`
  - Range: `2` to `50`



**Required Parameters Example**:

```json
{
  "prompt": "A high-quality 3D render of a cute fluffy monster eating a giant donut; the fur simulation is incredibly detailed, the donut glaze is sticky and reflective, bright daylight lighting, shallow depth of field."
}
```

**Full Example**:

```json
{
  "prompt": "A high-quality 3D render of a cute fluffy monster eating a giant donut; the fur simulation is incredibly detailed, the donut glaze is sticky and reflective, bright daylight lighting, shallow depth of field.",
  "image_size": "landscape_4_3",
  "safety_tolerance": "2",
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "guidance_scale": 3.5,
  "num_inference_steps": 28
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The generated images.
  - Array of ImageFile
  - Examples: [{"url":"https://storage.googleapis.com/falserverless/example_outputs/flux2_flex_t2i_output.png"}]

- **`seed`** (`integer`, _required_):
  The seed used for the generation.



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/falserverless/example_outputs/flux2_flex_t2i_output.png"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/flux-2-flex \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A high-quality 3D render of a cute fluffy monster eating a giant donut; the fur simulation is incredibly detailed, the donut glaze is sticky and reflective, bright daylight lighting, shallow depth of field."
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
    "fal-ai/flux-2-flex",
    arguments={
        "prompt": "A high-quality 3D render of a cute fluffy monster eating a giant donut; the fur simulation is incredibly detailed, the donut glaze is sticky and reflective, bright daylight lighting, shallow depth of field."
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

const result = await fal.subscribe("fal-ai/flux-2-flex", {
  input: {
    prompt: "A high-quality 3D render of a cute fluffy monster eating a giant donut; the fur simulation is incredibly detailed, the donut glaze is sticky and reflective, bright daylight lighting, shallow depth of field."
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

- [Model Playground](https://fal.ai/models/fal-ai/flux-2-flex)
- [API Documentation](https://fal.ai/models/fal-ai/flux-2-flex/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2-flex)

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

# Birefnet Background Removal V2

> bilateral reference framework (BiRefNet) for high-resolution dichotomous image segmentation (DIS)


## Overview

- **Endpoint**: `https://fal.run/fal-ai/birefnet/v2`
- **Model ID**: `fal-ai/birefnet/v2`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: background removal, segmentation, high-res, utility



## Pricing

- **Price**: $0 per compute seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`model`** (`ModelEnum`, _optional_):
  Model to use for background removal.
  The 'General Use (Light)' model is the original model used in the BiRefNet repository.
  The 'General Use (Light 2K)' model is the original model used in the BiRefNet repository but trained with 2K images.
  The 'General Use (Heavy)' model is a slower but more accurate model.
  The 'Matting' model is a model trained specifically for matting images.
  The 'Portrait' model is a model trained specifically for portrait images.
  The 'General Use (Dynamic)' model supports dynamic resolutions from 256x256 to 2304x2304.
  The 'General Use (Light)' model is recommended for most use cases.
  
  The corresponding models are as follows:
  - 'General Use (Light)': BiRefNet
  - 'General Use (Light 2K)': BiRefNet_lite-2K
  - 'General Use (Heavy)': BiRefNet_lite
  - 'Matting': BiRefNet-matting
  - 'Portrait': BiRefNet-portrait
  - 'General Use (Dynamic)': BiRefNet_dynamic Default value: `"General Use (Light)"`
  - Default: `"General Use (Light)"`
  - Options: `"General Use (Light)"`, `"General Use (Light 2K)"`, `"General Use (Heavy)"`, `"Matting"`, `"Portrait"`, `"General Use (Dynamic)"`

- **`operating_resolution`** (`OperatingResolutionEnum`, _optional_):
  The resolution to operate on. The higher the resolution, the more accurate the output will be for high res input images. The '2304x2304' option is only available for the 'General Use (Dynamic)' model. Default value: `"1024x1024"`
  - Default: `"1024x1024"`
  - Options: `"1024x1024"`, `"2048x2048"`, `"2304x2304"`

- **`output_mask`** (`boolean`, _optional_):
  Whether to output the mask used to remove the background
  - Default: `false`

- **`refine_foreground`** (`boolean`, _optional_):
  Whether to refine the foreground using the estimated mask Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`image_url`** (`string`, _required_):
  URL of the image to remove background from
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the output image Default value: `"png"`
  - Default: `"png"`
  - Options: `"webp"`, `"png"`, `"gif"`

- **`mask_only`** (`boolean`, _optional_):
  Whether to return only the segmentation mask without applying it to the image. When set to `True`, only the mask will be returned and foreground refinement will be skipped. Useful for reducing computation and data transfer when only the mask is needed.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
}
```

**Full Example**:

```json
{
  "model": "General Use (Light)",
  "operating_resolution": "1024x1024",
  "refine_foreground": true,
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg",
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`ImageFile`, _required_):
  Image with background removed. When `mask_only` is `True`, this contains the segmentation mask instead.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/example_outputs/birefnet-output.png","height":1024,"content_type":"image/png","file_name":"birefnet-output.png","width":1024}

- **`mask_image`** (`ImageFile`, _optional_):
  Mask used to remove the background



**Example Response**:

```json
{
  "image": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/birefnet-output.png",
    "height": 1024,
    "content_type": "image/png",
    "file_name": "birefnet-output.png",
    "width": 1024
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/birefnet/v2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
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
    "fal-ai/birefnet/v2",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
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

const result = await fal.subscribe("fal-ai/birefnet/v2", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/birefnet-input.jpeg"
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

- [Model Playground](https://fal.ai/models/fal-ai/birefnet/v2)
- [API Documentation](https://fal.ai/models/fal-ai/birefnet/v2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/birefnet/v2)

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

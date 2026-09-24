# FLUX 2 Pro Outpaint

> Outpainting generation with FLUX.2 [pro] from Black Forest Labs. Optimized for maximum quality, exceptional photorealism and artistic images.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/flux-2-pro/outpaint`
- **Model ID**: `fal-ai/flux-2-pro/outpaint`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: image-to-image, outpaint, outpainting



## Pricing

Your request will cost $0.03 for the first megapixel of output, plus $0.015 per extra megapixel of input and output, rounded up to the nearest megapixel. For example, a 1024x1024 image will cost $0.03, and a 1920x1080 image will cost $0.045 ($0.03 for first megapixel + $0.015 for the second megapixel). Similarly, a 512x512 output will cost $0.03 ($0.03 for 0.25 megapixels, rounded to 1 megapixel).

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The image URL to expand using outpainting.
  - Examples: "https://v3b.fal.media/files/b/0a9a3ba3/s-Z4TGRh9EQwXWTWrvzaB_Nbqhm4Fl.png"

- **`expand_top`** (`integer`, _optional_):
  Pixels to expand at the top of the image.
  - Default: `0`
  - Range: `0` to `2048`
  - Examples: 0

- **`expand_bottom`** (`integer`, _optional_):
  Pixels to expand at the bottom of the image.
  - Default: `0`
  - Range: `0` to `2048`
  - Examples: 200

- **`expand_left`** (`integer`, _optional_):
  Pixels to expand on the left of the image.
  - Default: `0`
  - Range: `0` to `2048`
  - Examples: 200

- **`expand_right`** (`integer`, _optional_):
  Pixels to expand on the right of the image.
  - Default: `0`
  - Range: `0` to `2048`
  - Examples: 200

- **`auto_crop`** (`boolean`, _optional_):
  Whether to automatically crop the reference image when the expanded canvas does not fully contain it.
  - Default: `false`

- **`mode`** (`ModeEnum`, _optional_):
  Quality/speed trade-off for outpainting. `high` (default) delivers the highest-fidelity results; `fast` is significantly faster and extends most scenes well but may produce lower fidelity. Default value: `"high"`
  - Default: `"high"`
  - Options: `"high"`, `"fast"`
  - Examples: "high"

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



**Required Parameters Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a9a3ba3/s-Z4TGRh9EQwXWTWrvzaB_Nbqhm4Fl.png"
}
```

**Full Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/0a9a3ba3/s-Z4TGRh9EQwXWTWrvzaB_Nbqhm4Fl.png",
  "expand_top": 0,
  "expand_bottom": 200,
  "expand_left": 200,
  "expand_right": 200,
  "mode": "high",
  "enable_safety_checker": true,
  "output_format": "jpeg"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<ImageFile>`, _required_):
  The outpainted images.
  - Array of ImageFile
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a9a3c6d/csgZL8-uzDQz2DIIzKVNZ_HJX1XzZU.jpg"}]



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a9a3c6d/csgZL8-uzDQz2DIIzKVNZ_HJX1XzZU.jpg"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/flux-2-pro/outpaint \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3b.fal.media/files/b/0a9a3ba3/s-Z4TGRh9EQwXWTWrvzaB_Nbqhm4Fl.png"
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
    "fal-ai/flux-2-pro/outpaint",
    arguments={
        "image_url": "https://v3b.fal.media/files/b/0a9a3ba3/s-Z4TGRh9EQwXWTWrvzaB_Nbqhm4Fl.png"
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

const result = await fal.subscribe("fal-ai/flux-2-pro/outpaint", {
  input: {
    image_url: "https://v3b.fal.media/files/b/0a9a3ba3/s-Z4TGRh9EQwXWTWrvzaB_Nbqhm4Fl.png"
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

- [Model Playground](https://fal.ai/models/fal-ai/flux-2-pro/outpaint)
- [API Documentation](https://fal.ai/models/fal-ai/flux-2-pro/outpaint/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2-pro/outpaint)

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

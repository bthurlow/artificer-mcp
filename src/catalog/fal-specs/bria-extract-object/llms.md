# Extract Object

> Bria Extract Object uses text prompts to isolate a selected object from an image and return it as an RGBA PNG with a transparent background. Ideal for product, ecommerce, advertising, and creative editing workflows. Bria's Extract Object API leads in product shot extraction, outperforming SAM 3.1 where it counts most for commercial use.


## Overview

- **Endpoint**: `https://fal.run/bria/extract-object`
- **Model ID**: `bria/extract-object`
- **Category**: image-to-image
- **Kind**: inference


## Pricing

- **Price**: $0.02 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _optional_):
  Source image as a public URL or raw base64-encoded image bytes (no data-URI prefix). Default value: `"https://bria-datasets.s3.amazonaws.com/object-extraction/tools_construction_flatlay.jpg"`
  - Default: `"https://bria-datasets.s3.amazonaws.com/object-extraction/tools_construction_flatlay.jpg"`
  - Examples: "https://bria-datasets.s3.amazonaws.com/object-extraction/tools_construction_flatlay.jpg"

- **`prompt`** (`string`, _optional_):
  Natural-language description of the object to act on, e.g. 'the red car'. Default value: `"yellow hammer"`
  - Default: `"yellow hammer"`

- **`sync_mode`** (`boolean`, _optional_):
  If true, the function waits for the image to be generated and uploaded
  before returning, so the image is returned directly (base64) instead of
  via the CDN. Increases latency.
  - Default: `false`

- **`autocrop`** (`boolean`, _optional_):
  Tighten the output canvas to the extracted object.
  - Default: `false`

- **`remove_background`** (`boolean`, _optional_):
  When True, refine the cutout alpha with background removal (RMBG). When False (default), use the SAM segmentation mask as the cutout's alpha -- faster, with no salient-object matting (helpful when RMBG over-trims text, logos, or graphics).
  - Default: `false`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "image_url": "https://bria-datasets.s3.amazonaws.com/object-extraction/tools_construction_flatlay.jpg",
  "prompt": "yellow hammer"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  Extracted object on a transparent background (RGBA).

- **`mask`** (`Image`, _required_):
  Segmentation mask used for the extraction.



**Example Response**:

```json
{
  "image": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019,
    "width": 1024,
    "height": 1024
  },
  "mask": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019,
    "width": 1024,
    "height": 1024
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/extract-object \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
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
    "bria/extract-object",
    arguments={},
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

const result = await fal.subscribe("bria/extract-object", {
  input: {},
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

- [Model Playground](https://fal.ai/models/bria/extract-object)
- [API Documentation](https://fal.ai/models/bria/extract-object/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/extract-object)

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

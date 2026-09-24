# Sam 3 1

> SAM 3.1 builds comes with Object Multiplex, a shared-memory approach for joint multi-object tracking that delivers faster speeds with larger number of objects tracked.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/sam-3-1/image`
- **Model ID**: `fal-ai/sam-3-1/image`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: segmentation, mask, real-time



## Pricing

Your request will cost $0.01 per request.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the image to be segmented
  - Examples: "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/notebooks/images/truck.jpg"

- **`prompt`** (`string`, _optional_):
  Text prompt for segmentation Default value: `"wheel"`
  - Default: `"wheel"`
  - Examples: "wheel", "person", "car"

- **`point_prompts`** (`list<PointPrompt>`, _optional_):
  List of point prompts
  - Default: `[]`
  - Array of PointPrompt

- **`box_prompts`** (`list<BoxPrompt>`, _optional_):
  Box prompt coordinates (x_min, y_min, x_max, y_max). Multiple boxes supported - use object_id to group boxes for the same object or leave empty for separate objects.
  - Default: `[]`
  - Array of BoxPrompt

- **`apply_mask`** (`boolean`, _optional_):
  Apply the mask on the image. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If True, the media will be returned as a data URI.
  - Default: `false`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`return_multiple_masks`** (`boolean`, _optional_):
  If True, upload and return multiple generated masks as defined by `max_masks`.
  - Default: `false`

- **`max_masks`** (`integer`, _optional_):
  Maximum number of masks to return when `return_multiple_masks` is enabled. Default value: `3`
  - Default: `3`
  - Range: `1` to `32`

- **`include_scores`** (`boolean`, _optional_):
  Whether to include mask confidence scores.
  - Default: `false`

- **`include_boxes`** (`boolean`, _optional_):
  Whether to include bounding boxes for each mask (when available).
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/notebooks/images/truck.jpg"
}
```

**Full Example**:

```json
{
  "image_url": "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/notebooks/images/truck.jpg",
  "prompt": "wheel",
  "point_prompts": [],
  "box_prompts": [],
  "apply_mask": true,
  "output_format": "png",
  "max_masks": 3
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _optional_):
  Primary segmented mask preview.

- **`masks`** (`list<Image>`, _required_):
  Segmented mask images.
  - Array of Image

- **`metadata`** (`list<MaskMetadata>`, _optional_):
  Per-mask metadata including scores and boxes.
  - Array of MaskMetadata

- **`scores`** (`list<float>`, _optional_):
  Per-mask confidence scores when requested.
  - Array of float

- **`boxes`** (`list<list<float>>`, _optional_):
  Per-mask normalized bounding boxes [cx, cy, w, h] when requested.
  - Array of list<float>



**Example Response**:

```json
{
  "masks": [
    {
      "url": "",
      "content_type": "image/png",
      "file_name": "z9RV14K95DvU.png",
      "file_size": 4404019,
      "width": 1024,
      "height": 1024
    }
  ],
  "metadata": [
    {}
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/sam-3-1/image \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/notebooks/images/truck.jpg"
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
    "fal-ai/sam-3-1/image",
    arguments={
        "image_url": "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/notebooks/images/truck.jpg"
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

const result = await fal.subscribe("fal-ai/sam-3-1/image", {
  input: {
    image_url: "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/notebooks/images/truck.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/sam-3-1/image)
- [API Documentation](https://fal.ai/models/fal-ai/sam-3-1/image/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/sam-3-1/image)

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

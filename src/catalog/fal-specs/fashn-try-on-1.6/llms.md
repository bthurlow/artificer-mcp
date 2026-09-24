# FASHN Virtual Try-On V1.6

> FASHN v1.6 delivers precise virtual try-on capabilities, accurately rendering garment details like text and patterns at 864x1296 resolution from both on-model and flat-lay photo references.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/fashn/tryon/v1.6`
- **Model ID**: `fal-ai/fashn/tryon/v1.6`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: try-on, fashion, clothing



## Pricing

- **Price**: $0.075 per generations

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`model_image`** (`string`, _required_):
  URL or base64 of the model image
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/model.png"

- **`garment_image`** (`string`, _required_):
  URL or base64 of the garment image
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/garment.webp"

- **`category`** (`CategoryEnum`, _optional_):
  Category of the garment to try-on. 'auto' will attempt to automatically detect the category of the garment. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"tops"`, `"bottoms"`, `"one-pieces"`, `"auto"`

- **`mode`** (`ModeEnum`, _optional_):
  Specifies the mode of operation. 'performance' mode is faster but may sacrifice quality, 'balanced' mode is a balance between speed and quality, and 'quality' mode is slower but produces higher quality results. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"performance"`, `"balanced"`, `"quality"`

- **`garment_photo_type`** (`GarmentPhotoTypeEnum`, _optional_):
  Specifies the type of garment photo to optimize internal parameters for better performance. 'model' is for photos of garments on a model, 'flat-lay' is for flat-lay or ghost mannequin images, and 'auto' attempts to automatically detect the photo type. Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"model"`, `"flat-lay"`

- **`moderation_level`** (`ModerationLevelEnum`, _optional_):
  Content moderation level for garment images. 'permissive' blocks only explicit content; 'conservative' also blocks underwear and swimwear. 'none' disables moderation only for accounts authorized to disable safety filters; for all other accounts it is treated as 'permissive'. Default value: `"permissive"`
  - Default: `"permissive"`
  - Options: `"none"`, `"permissive"`, `"conservative"`

- **`seed`** (`integer`, _optional_):
  Sets random operations to a fixed state. Use the same seed to reproduce results with the same inputs, or different seed to force different results.

- **`num_samples`** (`integer`, _optional_):
  Number of images to generate in a single run. Image generation has a random element in it, so trying multiple images at once increases the chances of getting a good result. Default value: `1`
  - Default: `1`
  - Range: `1` to `4`

- **`segmentation_free`** (`boolean`, _optional_):
  Disables human parsing on the model image. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output format of the generated images. 'png' is highest quality, while 'jpeg' is faster Default value: `"png"`
  - Default: `"png"`
  - Options: `"png"`, `"jpeg"`



**Required Parameters Example**:

```json
{
  "model_image": "https://storage.googleapis.com/falserverless/example_inputs/model.png",
  "garment_image": "https://storage.googleapis.com/falserverless/example_inputs/garment.webp"
}
```

**Full Example**:

```json
{
  "model_image": "https://storage.googleapis.com/falserverless/example_inputs/model.png",
  "garment_image": "https://storage.googleapis.com/falserverless/example_inputs/garment.webp",
  "category": "auto",
  "mode": "balanced",
  "garment_photo_type": "auto",
  "moderation_level": "permissive",
  "num_samples": 1,
  "segmentation_free": true,
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_)
  - Array of File
  - Examples: [{"url":"https://cdn.fashn.ai/4ddf1d78-63df-44bb-8e1f-355fff3a7b87/output_0.png"}]



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://cdn.fashn.ai/4ddf1d78-63df-44bb-8e1f-355fff3a7b87/output_0.png"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/fashn/tryon/v1.6 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "model_image": "https://storage.googleapis.com/falserverless/example_inputs/model.png",
     "garment_image": "https://storage.googleapis.com/falserverless/example_inputs/garment.webp"
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
    "fal-ai/fashn/tryon/v1.6",
    arguments={
        "model_image": "https://storage.googleapis.com/falserverless/example_inputs/model.png",
        "garment_image": "https://storage.googleapis.com/falserverless/example_inputs/garment.webp"
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

const result = await fal.subscribe("fal-ai/fashn/tryon/v1.6", {
  input: {
    model_image: "https://storage.googleapis.com/falserverless/example_inputs/model.png",
    garment_image: "https://storage.googleapis.com/falserverless/example_inputs/garment.webp"
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

- [Model Playground](https://fal.ai/models/fal-ai/fashn/tryon/v1.6)
- [API Documentation](https://fal.ai/models/fal-ai/fashn/tryon/v1.6/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/fashn/tryon/v1.6)

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

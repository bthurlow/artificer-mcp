# Genfill

> The GenFill Route enables the generation of objects by prompt in a specific region of an image.
You can define the area for object generation by using a mask that outlines the region where the object will be created. Our model is optimized to work seamlessly with blob-shaped masks.


## Overview

- **Endpoint**: `https://fal.run/bria/genfill/v2`
- **Model ID**: `bria/genfill/v2`
- **Category**: image-to-image
- **Kind**: inference


## Pricing

- **Price**: $0.04 per megapixels

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The source image.
  - Examples: "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower.png"

- **`mask_url`** (`string`, _required_):
  The mask image.
  - Examples: "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_input_mask.png"

- **`instruction`** (`string`, _required_):
  Instruct what elements you would like to fill in your image based on the mask.
  - Examples: "A beautiful colorful butterfly"

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Default value: `5555`
  - Default: `5555`

- **`steps_num`** (`integer`, _optional_):
  Number of inference steps. Default value: `30`
  - Default: `30`
  - Range: `20` to `50`

- **`sync_mode`** (`boolean`, _optional_):
  If true, returns the image directly in the response (increases latency).
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower.png",
  "mask_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_input_mask.png",
  "instruction": "A beautiful colorful butterfly"
}
```

**Full Example**:

```json
{
  "image_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower.png",
  "mask_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_input_mask.png",
  "instruction": "A beautiful colorful butterfly",
  "seed": 5555,
  "steps_num": 30
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  Generated image.

- **`images`** (`list<Image>`, _optional_):
  Generated images.
  - Default: `[]`
  - Array of Image
  - Examples: [{"url":"https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_with_butterfly.jpg"}]

- **`vgl`** (`Vgl`, _required_):
  The VGL document the image was generated from.



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
  "images": [
    {
      "url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_with_butterfly.jpg"
    }
  ],
  "vgl": {
    "objects": [],
    "text_render": []
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/genfill/v2 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower.png",
     "mask_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_input_mask.png",
     "instruction": "A beautiful colorful butterfly"
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
    "bria/genfill/v2",
    arguments={
        "image_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower.png",
        "mask_url": "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_input_mask.png",
        "instruction": "A beautiful colorful butterfly"
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

const result = await fal.subscribe("bria/genfill/v2", {
  input: {
    image_url: "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower.png",
    mask_url: "https://bria-datasets.s3.us-east-1.amazonaws.com/Fibo_edit/flower_input_mask.png",
    instruction: "A beautiful colorful butterfly"
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

- [Model Playground](https://fal.ai/models/bria/genfill/v2)
- [API Documentation](https://fal.ai/models/bria/genfill/v2/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/genfill/v2)

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

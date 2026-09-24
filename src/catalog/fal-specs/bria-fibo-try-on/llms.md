# Bria Virtual Try-On (FIBO-Edit-1.5)

> Bria Virtual Try-On edits a person photo to show the subject wearing garments or accessories from one to three reference images, guided by optional text instructions. Built on FIBO-Edit-1.5, it supports multi-garment changes and preserves the source aspect ratio by default.


## Overview

- **Endpoint**: `https://fal.run/bria/fibo-edit-1.5/virtual-try-on`
- **Model ID**: `bria/fibo-edit-1.5/virtual-try-on`
- **Category**: image-to-image
- **Kind**: inference
**Description**: Bria Virtual Try-On uses FIBO-Edit-1.5 to visualize garments and accessories on a person. The endpoint accepts a person image and one to three garment or accessory reference images for outfit changes in a single generation.

An optional instruction adds direction to the built-in try-on instruction, specifying which garments to replace, how to layer them, and which items should stay unchanged. The output keeps the person image's aspect ratio unless an explicit aspect ratio is selected. A seed controls reproducibility, and sync mode can return the image directly in the response.

Use cases include apparel e-commerce listings, digital lookbooks, seasonal catalogs, virtual fitting rooms, and social commerce creative.

**Tags**: virtual try-on, fashion tech, apparel, e-commerce, garment visualization, fitting room, image editing



## Pricing

Billing is calculated per generated image at a flat rate of **$0.04**, regardless of resolution. For example, **10 images cost $0.40**. For **$1**, the model generates **25 images**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`person_image_url`** (`string`, _required_):
  Photo of the person who will wear the garments.
  - Examples: "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/person.jpg"

- **`garment_image_urls`** (`list<string>`, _required_):
  1-3 garment or accessory images to put on the person.
  - Array of string
  - Examples: ["https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-1.jpg","https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-2.jpg"]

- **`instruction`** (`string`, _optional_):
  Extra direction, appended after the built-in instruction.
  - Examples: "He wears the navy blazer over the white t-shirt he already has, and the grey tailored trousers instead of his jeans; his sneakers stay unchanged."

- **`aspect_ratio`** (`Enum`, _optional_):
  Output aspect ratio. Left unset, the output keeps the ratio of the person image.
  - Options: `"1:1"`, `"2:3"`, `"3:2"`, `"3:4"`, `"4:3"`, `"4:5"`, `"5:4"`, `"9:16"`, `"16:9"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Default value: `5555`
  - Default: `5555`

- **`sync_mode`** (`boolean`, _optional_):
  If true, returns the image directly in the response (increases latency).
  - Default: `false`



**Required Parameters Example**:

```json
{
  "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/person.jpg",
  "garment_image_urls": [
    "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-1.jpg",
    "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-2.jpg"
  ]
}
```

**Full Example**:

```json
{
  "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/person.jpg",
  "garment_image_urls": [
    "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-1.jpg",
    "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-2.jpg"
  ],
  "instruction": "He wears the navy blazer over the white t-shirt he already has, and the grey tailored trousers instead of his jeans; his sneakers stay unchanged.",
  "seed": 5555
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
  - Examples: [{"url":"https://v3b.fal.media/files/b/0aa6910f/ie5dAn55wDh7Y1adCFGyE_85a45d82c6d141c2a28d92367596dfac.png"}]

- **`structured_instruction`** (`Structured Instruction`, _required_):
  Current instruction.



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
      "url": "https://v3b.fal.media/files/b/0aa6910f/ie5dAn55wDh7Y1adCFGyE_85a45d82c6d141c2a28d92367596dfac.png"
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/fibo-edit-1.5/virtual-try-on \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/person.jpg",
     "garment_image_urls": [
       "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-1.jpg",
       "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-2.jpg"
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
    "bria/fibo-edit-1.5/virtual-try-on",
    arguments={
        "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/person.jpg",
        "garment_image_urls": ["https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-1.jpg", "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-2.jpg"]
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

const result = await fal.subscribe("bria/fibo-edit-1.5/virtual-try-on", {
  input: {
    person_image_url: "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/person.jpg",
    garment_image_urls: ["https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-1.jpg", "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/virtual-try-on/garment-2.jpg"]
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

- [Model Playground](https://fal.ai/models/bria/fibo-edit-1.5/virtual-try-on)
- [API Documentation](https://fal.ai/models/bria/fibo-edit-1.5/virtual-try-on/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/fibo-edit-1.5/virtual-try-on)

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

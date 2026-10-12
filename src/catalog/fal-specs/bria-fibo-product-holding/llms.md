# Bria Product Holding (FIBO-Edit-1.5)

> Bria Product Holding edits a person photo to show the subject holding or carrying a product, using one to three product reference images and optional text instructions. Built on FIBO-Edit-1.5, it preserves the source aspect ratio by default and supports a selectable output aspect ratio.


## Overview

- **Endpoint**: `https://fal.run/bria/fibo-edit-1.5/product-holding`
- **Model ID**: `bria/fibo-edit-1.5/product-holding`
- **Category**: image-to-image
- **Kind**: inference
**Description**: Bria Product Holding uses FIBO-Edit-1.5 to place a product in a person's hands or show the person carrying it. The endpoint accepts a person image and one to three product reference images, which can show packaging, another angle, or a companion item.

An optional instruction adds direction to the built-in product-holding instruction, such as which hand holds the product or whether its logo faces the camera. The output keeps the person image's aspect ratio unless an explicit aspect ratio is selected. A seed controls reproducibility, and sync mode can return the image directly in the response.

Use cases include e-commerce lifestyle images, product listings, brand campaigns, and social commerce creative.

**Tags**: product in hand, product placement, person holding product, product photography, e-commerce, marketing visuals, brand campaigns, UGC-style content, commercial use, licensed AI



## Pricing

Billing is calculated per generated image at a flat rate of **$0.04**, regardless of resolution. For example, **10 images cost $0.40**. For **$1**, the model generates **25 images**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`person_image_url`** (`string`, _required_):
  Photo of the person who will hold the product. Their identity, face, expression, clothing, pose and the background are preserved; only the arm and hand move.
  - Examples: "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/person.jpg"

- **`product_image_urls`** (`list<string>`, _required_):
  One to three reference images of the product to place: extra angles, its packaging, or a companion item. They describe one holding scene rather than three separate products. The product's geometry, colors, materials, branding and label text are reproduced as given.
  - Array of string
  - Examples: ["https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/product.jpg"]

- **`instruction`** (`string`, _optional_):
  Optional. A complete product-holding instruction already runs; this is appended to it. Use it for which hand, which way the label faces, or what must stay untouched.
  - Examples: "Replace the paper coffee cup in her right hand with the can, logo facing the camera."

- **`aspect_ratio`** (`Enum`, _optional_):
  Output aspect ratio. Left unset, the output keeps the ratio of the person image.
  - Options: `"1:1"`, `"2:3"`, `"3:2"`, `"3:4"`, `"4:3"`, `"4:5"`, `"5:4"`, `"9:16"`, `"16:9"`

- **`seed`** (`integer`, _optional_):
  Random seed. The same seed with the same inputs returns the same image. Default value: `5555`
  - Default: `5555`

- **`sync_mode`** (`boolean`, _optional_):
  Return the image inline in the response instead of as a hosted URL. Adds latency.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/person.jpg",
  "product_image_urls": [
    "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/product.jpg"
  ]
}
```

**Full Example**:

```json
{
  "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/person.jpg",
  "product_image_urls": [
    "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/product.jpg"
  ],
  "instruction": "Replace the paper coffee cup in her right hand with the can, logo facing the camera.",
  "seed": 5555
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  The edited image, in the source aspect ratio unless aspect_ratio was set.

- **`images`** (`list<Image>`, _optional_):
  Single-element list holding the same image, kept for callers of the earlier Fibo Edit endpoint.
  - Default: `[]`
  - Array of Image
  - Examples: [{"url":"https://v3b.fal.media/files/b/0aa6910f/ie5dAn55wDh7Y1adCFGyE_85a45d82c6d141c2a28d92367596dfac.png"}]

- **`structured_instruction`** (`Structured Instruction`, _required_):
  The structured instruction the model ran, expanded from the built-in instruction plus anything passed in `instruction`. Returned so you can see how the brief was interpreted.



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
  --url https://fal.run/bria/fibo-edit-1.5/product-holding \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/person.jpg",
     "product_image_urls": [
       "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/product.jpg"
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
    "bria/fibo-edit-1.5/product-holding",
    arguments={
        "person_image_url": "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/person.jpg",
        "product_image_urls": ["https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/product.jpg"]
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

const result = await fal.subscribe("bria/fibo-edit-1.5/product-holding", {
  input: {
    person_image_url: "https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/person.jpg",
    product_image_urls: ["https://labs-assets.bria.ai/fal-examples/fibo-edit-1.5/product-holding/product.jpg"]
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

- [Model Playground](https://fal.ai/models/bria/fibo-edit-1.5/product-holding)
- [API Documentation](https://fal.ai/models/bria/fibo-edit-1.5/product-holding/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/fibo-edit-1.5/product-holding)

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

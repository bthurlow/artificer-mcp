# Fibo Edit 1.5 Image Editing

> Commercially safe, multi-reference image editing model. Follows natural language instructions alone or with up to 4 reference images, purpose-built for complex object and character combinations, virtual try-on, background replacement, style transfer, and more.


## Overview

- **Endpoint**: `https://fal.run/bria/fibo-edit-1.5/edit`
- **Model ID**: `bria/fibo-edit-1.5/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: stylized, transform, editing



## Pricing

- **Price**: $0.04 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_urls`** (`list<string>`, _optional_):
  1-4 reference images (files or URLs). Order is significant: the instruction is resolved against the images in the order they are sent.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0aa69153/6d2UFjgrQCRM6BoWpXpZ3_126_1.jpg","https://v3b.fal.media/files/b/0aa69153/Gy-fjFofCbQP9w3lsfc2e_126_2.jpg"]

- **`instruction`** (`string`, _optional_):
  Instruction for image editing.
  - Examples: "Uncross her arms and place the serum bottle in her right hand raised beside her face, label toward the camera."

- **`aspect_ratio`** (`Enum`, _optional_):
  Output aspect ratio. Left unset, the output keeps the ratio of the first reference image. A chosen ratio applies only with two or more reference images; with a single reference the output keeps that image's ratio either way.
  - Options: `"1:1"`, `"2:3"`, `"3:2"`, `"3:4"`, `"4:3"`, `"4:5"`, `"5:4"`, `"9:16"`, `"16:9"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Default value: `5555`
  - Default: `5555`

- **`mask_url`** (`string`, _optional_):
  Mask (file or URL) marking the region to regenerate: white where the model should edit, black elsewhere. Single-reference requests only, and it must be the same size as that image. A masked edit comes back at the reference's own resolution.

- **`sync_mode`** (`boolean`, _optional_):
  If true, returns the image directly in the response (increases latency).
  - Default: `false`

- **`structured_instruction`** (`StructuredInstruction`, _optional_):
  A pre-built structured prompt, used verbatim instead of having VGL build one when no instruction is sent. Accepts what a previous edit returned.



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "image_urls": [
    "https://v3b.fal.media/files/b/0aa69153/6d2UFjgrQCRM6BoWpXpZ3_126_1.jpg",
    "https://v3b.fal.media/files/b/0aa69153/Gy-fjFofCbQP9w3lsfc2e_126_2.jpg"
  ],
  "instruction": "Uncross her arms and place the serum bottle in her right hand raised beside her face, label toward the camera.",
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
  --url https://fal.run/bria/fibo-edit-1.5/edit \
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
    "bria/fibo-edit-1.5/edit",
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

const result = await fal.subscribe("bria/fibo-edit-1.5/edit", {
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

- [Model Playground](https://fal.ai/models/bria/fibo-edit-1.5/edit)
- [API Documentation](https://fal.ai/models/bria/fibo-edit-1.5/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/fibo-edit-1.5/edit)

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

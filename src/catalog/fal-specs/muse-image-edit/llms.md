# Meta Muse Image Edit

> Meta's Muse Image model does precise edits that change only what you ask, stay coherent across turns, and compose from multiple reference images.


## Overview

- **Endpoint**: `https://fal.run/meta/muse-image/edit`
- **Model ID**: `meta/muse-image/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: realism, typography, stylized, editing



## Pricing

- **Price**: $0.01 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used to generate or edit the image.
  - Examples: "A cinematic editorial portrait in soft window light with crisp typography"

- **`image_urls`** (`list<string>`, _required_):
  Reference images used for the edit. Provide between 1 and 10 HTTP(S) or data URLs.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"]

- **`aspect_ratio`** (`string`, _optional_):
  Any custom output aspect ratio as "width:height", for example "16:9", "5:4", or "1920:1200". Common presets are "21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:21". The ratio must be between 1:16 and 16:1, the range Muse supports. Only the ratio is used: Muse renders it at its own fixed resolution of roughly 2.5 megapixels, so "1920:1200" and "960:600" both return the same 1920x1200 image. If omitted, Muse chooses the output dimensions automatically.
  - Examples: "16:9"

- **`num_images`** (`integer`, _optional_):
  The number of edited images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `10`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"webp"`
  - Default: `"webp"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the image is returned as a data URI and is not persisted in the request history.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A cinematic editorial portrait in soft window light with crisp typography",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "A cinematic editorial portrait in soft window light with crisp typography",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"
  ],
  "aspect_ratio": "16:9",
  "num_images": 1,
  "output_format": "webp"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  The generated or edited images.
  - Array of Image



**Example Response**:

```json
{
  "images": [
    {
      "url": "",
      "content_type": "image/png",
      "file_name": "z9RV14K95DvU.png",
      "file_size": 4404019,
      "width": 1024,
      "height": 1024
    }
  ]
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/meta/muse-image/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A cinematic editorial portrait in soft window light with crisp typography",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"
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
    "meta/muse-image/edit",
    arguments={
        "prompt": "A cinematic editorial portrait in soft window light with crisp typography",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"]
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

const result = await fal.subscribe("meta/muse-image/edit", {
  input: {
    prompt: "A cinematic editorial portrait in soft window light with crisp typography",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/kontext_example_input.webp"]
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

- [Model Playground](https://fal.ai/models/meta/muse-image/edit)
- [API Documentation](https://fal.ai/models/meta/muse-image/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=meta/muse-image/edit)

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

# Replace Background

> Generate professional, eCommerce-ready product shots by replacing backgrounds with realistic lighting and accurate perspective from a simple text prompt. Trained exclusively on licensed data for safe commercial use.


## Overview

- **Endpoint**: `https://fal.run/bria/replace-background`
- **Model ID**: `bria/replace-background`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: bria, replace-background



## Pricing

- **Price**: $0.04 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _optional_):
  Prompt for background replacement.
  - Examples: "On a smooth kitchen counter in front of a blue and white patterned ceramic tile wall. A yellow ceramic mug sits to the right. Shot from a straight-on front angle."

- **`image_url`** (`string`, _optional_):
  Reference image (file or URL). Default value: `"https://v3b.fal.media/files/b/0a8bea8c/Mztgx0NG3HPdby-4iPqwH_a_coffee_machine_standing_in_the_kitchen.png"`
  - Default: `"https://v3b.fal.media/files/b/0a8bea8c/Mztgx0NG3HPdby-4iPqwH_a_coffee_machine_standing_in_the_kitchen.png"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. Default value: `4925634`
  - Default: `4925634`

- **`steps_num`** (`integer`, _optional_):
  Number of inference steps. Default value: `30`
  - Default: `30`

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt for background replacement. Default value: `""`
  - Default: `""`

- **`sync_mode`** (`boolean`, _optional_):
  If true, returns the image directly in the response (increases latency).
  - Default: `false`



**Required Parameters Example**:

```json
{}
```

**Full Example**:

```json
{
  "prompt": "On a smooth kitchen counter in front of a blue and white patterned ceramic tile wall. A yellow ceramic mug sits to the right. Shot from a straight-on front angle.",
  "image_url": "https://v3b.fal.media/files/b/0a8bea8c/Mztgx0NG3HPdby-4iPqwH_a_coffee_machine_standing_in_the_kitchen.png",
  "seed": 4925634,
  "steps_num": 30
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  Generated image.

- **`images`** (`list<object>`, _optional_):
  Generated images.
  - Array of object



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
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/bria/replace-background \
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
    "bria/replace-background",
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

const result = await fal.subscribe("bria/replace-background", {
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

- [Model Playground](https://fal.ai/models/bria/replace-background)
- [API Documentation](https://fal.ai/models/bria/replace-background/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=bria/replace-background)

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

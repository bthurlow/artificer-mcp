# Topaz Upscale Image Precision

> Professional photo upscaling powered by Topaz Labs. Gigapixel precision models (Standard V2, High Fidelity, Low Resolution, CGI, Text Refine) enlarge images faithfully up to 4x. Best for photos that must stay true to the original.


## Overview

- **Endpoint**: `https://fal.run/topaz/upscale/image/precision`
- **Model ID**: `topaz/upscale/image/precision`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: upscale, image



## Pricing

Your request will cost **$0.08** per started 24 megapixels of output for every precision model. For example, an output up to 24 MP costs **$0.08**, over 24 MP and up to 48 MP costs **$0.16**, and over 48 MP and up to 72 MP costs **$0.24**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Url of the image to be upscaled
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"

- **`model`** (`ModelEnum`, _optional_):
  Precision upscaling model. Standard V2 fits most photos; High Fidelity V3/V2 preserve detail in professional shots; Low Resolution V2 recovers compressed sources; CGI targets art and rendered graphics; Text Refine keeps text and shapes crisp; Faces restores facial detail with Face Recovery 3. Default value: `"Standard V2"`
  - Default: `"Standard V2"`
  - Options: `"Standard V2"`, `"High Fidelity V3"`, `"High Fidelity V2"`, `"Low Resolution V2"`, `"CGI"`, `"Text Refine"`, `"Faces"`

- **`upscale_factor`** (`float`, _optional_):
  Factor to upscale the image by (e.g. 2.0 doubles width and height) Default value: `2`
  - Default: `2`
  - Range: `1` to `4`

- **`crop_to_fill`** (`boolean`, _optional_)
  - Default: `false`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output format of the upscaled image. Default value: `"jpeg"`
  - Default: `"jpeg"`
  - Options: `"jpeg"`, `"png"`

- **`subject_detection`** (`SubjectDetectionEnum`, _optional_):
  Subject detection mode for the image enhancement. Default value: `"All"`
  - Default: `"All"`
  - Options: `"All"`, `"Foreground"`, `"Background"`

- **`face_enhancement`** (`boolean`, _optional_):
  Whether to apply face enhancement to the image. Default value: `true`
  - Default: `true`

- **`face_enhancement_creativity`** (`float`, _optional_):
  Creativity level for face enhancement. 0.0 means no creativity, 1.0 means maximum creativity. Ignored if face enhancement is disabled.
  - Default: `0`
  - Range: `0` to `1`

- **`face_enhancement_strength`** (`float`, _optional_):
  Strength of the face enhancement. 0.0 means no enhancement, 1.0 means maximum enhancement. Ignored if face enhancement is disabled. Default value: `0.8`
  - Default: `0.8`
  - Range: `0` to `1`

- **`sharpen`** (`float`, _optional_):
  Sharpening level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

- **`denoise`** (`float`, _optional_):
  Denoising level (0.0-1.0). Default varies by model.
  - Range: `0` to `1`

- **`fix_compression`** (`float`, _optional_):
  Compression artifact removal level (0.0-1.0). Not supported by the CGI model.
  - Range: `0` to `1`

- **`strength`** (`float`, _optional_):
  Enhancement strength (0.01-1.0). Applies to Text Refine model only.
  - Range: `0.01` to `1`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
}
```

**Full Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg",
  "model": "Standard V2",
  "upscale_factor": 2,
  "output_format": "jpeg",
  "subject_detection": "All",
  "face_enhancement": true,
  "face_enhancement_strength": 0.8
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`File`, _required_):
  The upscaled image.



**Example Response**:

```json
{
  "image": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/topaz/upscale/image/precision \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
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
    "topaz/upscale/image/precision",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
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

const result = await fal.subscribe("topaz/upscale/image/precision", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/model_tests/codeformer/codeformer_poor_1.jpeg"
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

- [Model Playground](https://fal.ai/models/topaz/upscale/image/precision)
- [API Documentation](https://fal.ai/models/topaz/upscale/image/precision/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/upscale/image/precision)

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

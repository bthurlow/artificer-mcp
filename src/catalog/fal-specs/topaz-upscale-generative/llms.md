# Topaz Upscale Image Generative

> Professional generative image upscaling powered by Topaz Labs. Wonder 3.5 leads the range, with Redefine for prompt-guided detail and Recovery for extreme low-resolution sources. Best for rebuilding sharp detail in small or blurry images.


## Overview

- **Endpoint**: `https://fal.run/topaz/upscale/image/generative`
- **Model ID**: `topaz/upscale/image/generative`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: upscale, image



## Pricing

Your request will cost **$0.08** per started 8 megapixels of output with Wonder 3 or Wonder 3.5, and **$0.08** per started 4 megapixels with Wonder, Wonder 2, Recover 3, Standard MAX, Redefine, Recovery, or Recovery V2. A 24 MP output therefore costs **$0.24** with Wonder 3/3.5 or **$0.48** with the other models.

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
  Generative upscaling model. Wonder 3.5 is the latest Wonder with finer detail and fewer repetitive patterns; Wonder 3 is Topaz's most advanced generative realism model (Wonder 2/Wonder are earlier generations); Recover 3 rebuilds natural detail; Standard MAX is high-quality precision-leaning upscaling; Redefine adds prompt-guided creative detail; Recovery and Recovery V2 rebuild extreme low-resolution images. Default value: `"Wonder 3"`
  - Default: `"Wonder 3"`
  - Options: `"Wonder 3.5"`, `"Wonder 3"`, `"Wonder 2"`, `"Wonder"`, `"Recover 3"`, `"Standard MAX"`, `"Redefine"`, `"Recovery V2"`, `"Recovery"`

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
  Subject detection mode for the image enhancement. Applies to Wonder 3, Recovery and Recovery V2 models. Default value: `"All"`
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

- **`enhancement_strength`** (`Enum`, _optional_):
  Enhancement strength for generative upscaling. Applies to Wonder 3 and Wonder 3.5 models. When omitted, Topaz auto-configures it.
  - Options: `"low"`, `"medium"`, `"high"`

- **`creativity`** (`integer`, _optional_):
  Creativity level for generative upscaling (1-6). Higher values produce more creative/hallucinated details. Applies to Redefine model only.
  - Range: `1` to `6`

- **`texture`** (`integer`, _optional_):
  Texture detail level for generative upscaling (1-5). Applies to Redefine model only.
  - Range: `1` to `5`

- **`prompt`** (`string`, _optional_):
  Text prompt to guide generative upscaling (max 1024 chars). Applies to Redefine model only.

- **`autoprompt`** (`boolean`, _optional_):
  Enable automatic prompt generation for generative upscaling. Applies to Redefine model only.

- **`sharpen`** (`float`, _optional_):
  Sharpening level (0.0-1.0). Applies to Redefine model only.
  - Range: `0` to `1`

- **`denoise`** (`float`, _optional_):
  Denoising level (0.0-1.0). Applies to Redefine model only.
  - Range: `0` to `1`

- **`detail`** (`float`, _optional_):
  Detail recovery level (0.0-1.0). Applies to Recovery V2 model only.
  - Range: `0` to `1`



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
  "model": "Wonder 3",
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
  --url https://fal.run/topaz/upscale/image/generative \
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
    "topaz/upscale/image/generative",
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

const result = await fal.subscribe("topaz/upscale/image/generative", {
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

- [Model Playground](https://fal.ai/models/topaz/upscale/image/generative)
- [API Documentation](https://fal.ai/models/topaz/upscale/image/generative/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=topaz/upscale/image/generative)

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

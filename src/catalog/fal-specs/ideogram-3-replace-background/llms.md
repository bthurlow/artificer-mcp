# Ideogram Replace Background

> Replace backgrounds existing images with Ideogram V3's replace background feature. Create variations and adaptations while preserving core elements and adding new creative directions through prompt guidance.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ideogram/v3/replace-background`
- **Model ID**: `fal-ai/ideogram/v3/replace-background`
- **Category**: image-to-image
- **Kind**: inference


## Pricing

Your request will cost **$0.03** with TURBO, **$0.06** with BALANCED, and **$0.09** with QUALITY.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_urls`** (`list<string>`, _optional_):
  A set of images to use as style references (maximum total size 10MB across all style references). The images should be in JPEG, PNG or WebP format
  - Array of string

- **`rendering_speed`** (`RenderingSpeedEnum`, _optional_):
  The rendering speed to use. Default value: `"BALANCED"`
  - Default: `"BALANCED"`
  - Options: `"TURBO"`, `"BALANCED"`, `"QUALITY"`

- **`color_palette`** (`ColorPalette`, _optional_):
  A color palette for generation, must EITHER be specified via one of the presets (name) or explicitly via hexadecimal representations of the color with optional weights (members)

- **`style_codes`** (`list<string>`, _optional_):
  A list of 8 character hexadecimal codes representing the style of the image. Cannot be used in conjunction with style_reference_images or style
  - Array of string

- **`style`** (`Enum`, _optional_):
  The style type to generate with. Cannot be used with style_codes.
  - Options: `"AUTO"`, `"GENERAL"`, `"REALISTIC"`, `"DESIGN"`

- **`expand_prompt`** (`boolean`, _optional_):
  Determine if MagicPrompt should be used in generating the request or not. Default value: `true`
  - Default: `true`

- **`num_images`** (`integer`, _optional_):
  Number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `8`

- **`seed`** (`integer`, _optional_):
  Seed for the random number generator

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`style_preset`** (`Enum`, _optional_):
  Style preset for generation. The chosen style preset will guide the generation.
  - Options: `"80S_ILLUSTRATION"`, `"90S_NOSTALGIA"`, `"ABSTRACT_ORGANIC"`, `"ANALOG_NOSTALGIA"`, `"ART_BRUT"`, `"ART_DECO"`, `"ART_POSTER"`, `"AURA"`, `"AVANT_GARDE"`, `"BAUHAUS"`, `"BLUEPRINT"`, `"BLURRY_MOTION"`, `"BRIGHT_ART"`, `"C4D_CARTOON"`, `"CHILDRENS_BOOK"`, `"COLLAGE"`, `"COLORING_BOOK_I"`, `"COLORING_BOOK_II"`, `"CUBISM"`, `"DARK_AURA"`, `"DOODLE"`, `"DOUBLE_EXPOSURE"`, `"DRAMATIC_CINEMA"`, `"EDITORIAL"`, `"EMOTIONAL_MINIMAL"`, `"ETHEREAL_PARTY"`, `"EXPIRED_FILM"`, `"FLAT_ART"`, `"FLAT_VECTOR"`, `"FOREST_REVERIE"`, `"GEO_MINIMALIST"`, `"GLASS_PRISM"`, `"GOLDEN_HOUR"`, `"GRAFFITI_I"`, `"GRAFFITI_II"`, `"HALFTONE_PRINT"`, `"HIGH_CONTRAST"`, `"HIPPIE_ERA"`, `"ICONIC"`, `"JAPANDI_FUSION"`, `"JAZZY"`, `"LONG_EXPOSURE"`, `"MAGAZINE_EDITORIAL"`, `"MINIMAL_ILLUSTRATION"`, `"MIXED_MEDIA"`, `"MONOCHROME"`, `"NIGHTLIFE"`, `"OIL_PAINTING"`, `"OLD_CARTOONS"`, `"PAINT_GESTURE"`, `"POP_ART"`, `"RETRO_ETCHING"`, `"RIVIERA_POP"`, `"SPOTLIGHT_80S"`, `"STYLIZED_RED"`, `"SURREAL_COLLAGE"`, `"TRAVEL_POSTER"`, `"VINTAGE_GEO"`, `"VINTAGE_POSTER"`, `"WATERCOLOR"`, `"WEIRD"`, `"WOODBLOCK_PRINT"`

- **`prompt`** (`string`, _required_):
  Cyber punk city with neon lights and skyscrappers
  - Examples: "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai"

- **`image_url`** (`string`, _required_):
  The image URL whose background needs to be replaced
  - Examples: "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"



**Required Parameters Example**:

```json
{
  "prompt": "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai",
  "image_url": "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"
}
```

**Full Example**:

```json
{
  "rendering_speed": "BALANCED",
  "expand_prompt": true,
  "num_images": 1,
  "prompt": "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai",
  "image_url": "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_)
  - Array of File
  - Examples: [{"url":"https://v3.fal.media/files/lion/AUfCjtLkLOsdc9zEFrV-5_image.png"}]

- **`seed`** (`integer`, _required_):
  Seed used for the random number generator
  - Examples: 123456



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/lion/AUfCjtLkLOsdc9zEFrV-5_image.png"
    }
  ],
  "seed": 123456
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ideogram/v3/replace-background \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai",
     "image_url": "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"
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
    "fal-ai/ideogram/v3/replace-background",
    arguments={
        "prompt": "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai",
        "image_url": "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"
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

const result = await fal.subscribe("fal-ai/ideogram/v3/replace-background", {
  input: {
    prompt: "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai",
    image_url: "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"
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

- [Model Playground](https://fal.ai/models/fal-ai/ideogram/v3/replace-background)
- [API Documentation](https://fal.ai/models/fal-ai/ideogram/v3/replace-background/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ideogram/v3/replace-background)

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

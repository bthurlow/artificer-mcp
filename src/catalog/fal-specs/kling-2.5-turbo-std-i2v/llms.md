# Kling Video

> Kling 2.5 Turbo Standard: Top-tier image-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kling-video/v2.5-turbo/standard/image-to-video`
- **Model ID**: `fal-ai/kling-video/v2.5-turbo/standard/image-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform



## Pricing

For **5s** video your request will cost **$0.21**. For every additional second you will be charged **$0.042.**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_)
  - Examples: "Fine grains of salt drift across the flats in a slow, low wind, streaming past the figure's feet. The figure's robe ripples. Light crawls down the face of the monolith as the sun rises millimeter by millimeter — a slow wash of coral replacing indigo. The figure tilts their head upward. Camera creeps forward almost imperceptibly. Monumental, spiritual, glacial."

- **`image_url`** (`string`, _required_):
  URL of the image to be used for the video
  - Examples: "https://v3b.fal.media/files/b/0a975417/w4qtfMTu-mh_KUgHIZNAH__4BUACOxwlMAEVXDfeYbj_2UxyAg3W.jpg"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"5"`
  - Default: `"5"`
  - Options: `"5"`, `"10"`

- **`negative_prompt`** (`string`, _optional_):
   Default value: `"blur, distort, and low quality"`
  - Default: `"blur, distort, and low quality"`

- **`cfg_scale`** (`float`, _optional_):
  The CFG (Classifier Free Guidance) scale is a measure of how close you want
  the model to stick to your prompt. Default value: `0.5`
  - Default: `0.5`
  - Range: `0` to `1`



**Required Parameters Example**:

```json
{
  "prompt": "Fine grains of salt drift across the flats in a slow, low wind, streaming past the figure's feet. The figure's robe ripples. Light crawls down the face of the monolith as the sun rises millimeter by millimeter — a slow wash of coral replacing indigo. The figure tilts their head upward. Camera creeps forward almost imperceptibly. Monumental, spiritual, glacial.",
  "image_url": "https://v3b.fal.media/files/b/0a975417/w4qtfMTu-mh_KUgHIZNAH__4BUACOxwlMAEVXDfeYbj_2UxyAg3W.jpg"
}
```

**Full Example**:

```json
{
  "prompt": "Fine grains of salt drift across the flats in a slow, low wind, streaming past the figure's feet. The figure's robe ripples. Light crawls down the face of the monolith as the sun rises millimeter by millimeter — a slow wash of coral replacing indigo. The figure tilts their head upward. Camera creeps forward almost imperceptibly. Monumental, spiritual, glacial.",
  "image_url": "https://v3b.fal.media/files/b/0a975417/w4qtfMTu-mh_KUgHIZNAH__4BUACOxwlMAEVXDfeYbj_2UxyAg3W.jpg",
  "duration": "5",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video
  - Examples: {"content_type":"video/mp4","file_size":16536912,"url":"https://v3b.fal.media/files/b/0a97541e/EiyjY6_Fjf7XPgR7nUli5_output.mp4","file_name":"output.mp4"}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "file_size": 16536912,
    "url": "https://v3b.fal.media/files/b/0a97541e/EiyjY6_Fjf7XPgR7nUli5_output.mp4",
    "file_name": "output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kling-video/v2.5-turbo/standard/image-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Fine grains of salt drift across the flats in a slow, low wind, streaming past the figure's feet. The figure's robe ripples. Light crawls down the face of the monolith as the sun rises millimeter by millimeter — a slow wash of coral replacing indigo. The figure tilts their head upward. Camera creeps forward almost imperceptibly. Monumental, spiritual, glacial.",
     "image_url": "https://v3b.fal.media/files/b/0a975417/w4qtfMTu-mh_KUgHIZNAH__4BUACOxwlMAEVXDfeYbj_2UxyAg3W.jpg"
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
    "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
    arguments={
        "prompt": "Fine grains of salt drift across the flats in a slow, low wind, streaming past the figure's feet. The figure's robe ripples. Light crawls down the face of the monolith as the sun rises millimeter by millimeter — a slow wash of coral replacing indigo. The figure tilts their head upward. Camera creeps forward almost imperceptibly. Monumental, spiritual, glacial.",
        "image_url": "https://v3b.fal.media/files/b/0a975417/w4qtfMTu-mh_KUgHIZNAH__4BUACOxwlMAEVXDfeYbj_2UxyAg3W.jpg"
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

const result = await fal.subscribe("fal-ai/kling-video/v2.5-turbo/standard/image-to-video", {
  input: {
    prompt: "Fine grains of salt drift across the flats in a slow, low wind, streaming past the figure's feet. The figure's robe ripples. Light crawls down the face of the monolith as the sun rises millimeter by millimeter — a slow wash of coral replacing indigo. The figure tilts their head upward. Camera creeps forward almost imperceptibly. Monumental, spiritual, glacial.",
    image_url: "https://v3b.fal.media/files/b/0a975417/w4qtfMTu-mh_KUgHIZNAH__4BUACOxwlMAEVXDfeYbj_2UxyAg3W.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/kling-video/v2.5-turbo/standard/image-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kling-video/v2.5-turbo/standard/image-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kling-video/v2.5-turbo/standard/image-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

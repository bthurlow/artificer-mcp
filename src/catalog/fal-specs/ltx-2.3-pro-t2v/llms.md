# LTX Video 2.3 Pro

> LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/ltx-2.3/text-to-video`
- **Model ID**: `fal-ai/ltx-2.3/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: stylized, transform, lipsync



## Pricing

Your request will cost **$0.08** per second for 1080p, **$0.16** per second for 1440p or **$0.32** per second for 2160p.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt to use for the generated video
  - Examples: "Through-the-veil shot of a bride's face during an Indian wedding ceremony, camera positioned behind the sheer red dupatta fabric, the embroidered pattern creating a textured overlay on her face, her eyes lined with kohl looking down at henna-covered hands, marigold garlands in soft background bokeh, 85mm f/1.2 focused through the fabric layer, warm tungsten and candlelight, Mira Nair Monsoon Wedding intimacy"

- **`duration`** (`DurationEnum`, _optional_):
  The duration of the generated video in seconds Default value: `"6"`
  - Default: `6`
  - Options: `6`, `8`, `10`

- **`resolution`** (`ResolutionEnum`, _optional_):
  The resolution of the generated video Default value: `"1080p"`
  - Default: `"1080p"`
  - Options: `"1080p"`, `"1440p"`, `"2160p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`fps`** (`FramesperSecondEnum`, _optional_):
  The frames per second of the generated video Default value: `"25"`
  - Default: `25`
  - Options: `24`, `25`, `48`, `50`

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the generated video Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "Through-the-veil shot of a bride's face during an Indian wedding ceremony, camera positioned behind the sheer red dupatta fabric, the embroidered pattern creating a textured overlay on her face, her eyes lined with kohl looking down at henna-covered hands, marigold garlands in soft background bokeh, 85mm f/1.2 focused through the fabric layer, warm tungsten and candlelight, Mira Nair Monsoon Wedding intimacy"
}
```

**Full Example**:

```json
{
  "prompt": "Through-the-veil shot of a bride's face during an Indian wedding ceremony, camera positioned behind the sheer red dupatta fabric, the embroidered pattern creating a textured overlay on her face, her eyes lined with kohl looking down at henna-covered hands, marigold garlands in soft background bokeh, 85mm f/1.2 focused through the fabric layer, warm tungsten and candlelight, Mira Nair Monsoon Wedding intimacy",
  "duration": 6,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "fps": 25,
  "generate_audio": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`VideoFile`, _required_):
  The generated video file
  - Examples: {"file_name":"EG257tf7j9UfVc-jHF8lI_0MWboc13.mp4","content_type":"video/mp4","url":"https://v3b.fal.media/files/b/0a90dd3a/EG257tf7j9UfVc-jHF8lI_0MWboc13.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "EG257tf7j9UfVc-jHF8lI_0MWboc13.mp4",
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/0a90dd3a/EG257tf7j9UfVc-jHF8lI_0MWboc13.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/ltx-2.3/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Through-the-veil shot of a bride's face during an Indian wedding ceremony, camera positioned behind the sheer red dupatta fabric, the embroidered pattern creating a textured overlay on her face, her eyes lined with kohl looking down at henna-covered hands, marigold garlands in soft background bokeh, 85mm f/1.2 focused through the fabric layer, warm tungsten and candlelight, Mira Nair Monsoon Wedding intimacy"
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
    "fal-ai/ltx-2.3/text-to-video",
    arguments={
        "prompt": "Through-the-veil shot of a bride's face during an Indian wedding ceremony, camera positioned behind the sheer red dupatta fabric, the embroidered pattern creating a textured overlay on her face, her eyes lined with kohl looking down at henna-covered hands, marigold garlands in soft background bokeh, 85mm f/1.2 focused through the fabric layer, warm tungsten and candlelight, Mira Nair Monsoon Wedding intimacy"
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

const result = await fal.subscribe("fal-ai/ltx-2.3/text-to-video", {
  input: {
    prompt: "Through-the-veil shot of a bride's face during an Indian wedding ceremony, camera positioned behind the sheer red dupatta fabric, the embroidered pattern creating a textured overlay on her face, her eyes lined with kohl looking down at henna-covered hands, marigold garlands in soft background bokeh, 85mm f/1.2 focused through the fabric layer, warm tungsten and candlelight, Mira Nair Monsoon Wedding intimacy"
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

- [Model Playground](https://fal.ai/models/fal-ai/ltx-2.3/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/ltx-2.3/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/ltx-2.3/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

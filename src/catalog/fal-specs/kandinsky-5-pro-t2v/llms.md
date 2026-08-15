# Kandinsky5 Pro

> Kandinsky 5.0 Pro is a diffusion model for fast, high-quality text-to-video generation.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/kandinsky5-pro/text-to-video`
- **Model ID**: `fal-ai/kandinsky5-pro/text-to-video`
- **Category**: text-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.04** per **512P** video second and **$0.12** per **1024P** video second.


For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"

- **`resolution`** (`ResolutionEnum`, _optional_):
  Video resolution: 512p or 1024p. Default value: `"512P"`
  - Default: `"512P"`
  - Options: `"512P"`, `"1024P"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. One of (3:2, 1:1, 2:3). Default value: `"3:2"`
  - Default: `"3:2"`
  - Options: `"3:2"`, `"1:1"`, `"2:3"`

- **`duration`** (`string`, _optional_):
  The length of the video to generate. Default value: `"5s"`
  - Default: `"5s"`
  - Examples: "5s"

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps. Default value: `28`
  - Default: `28`
  - Range: `1` to `50`

- **`acceleration`** (`Enum`, _optional_):
  Acceleration level for faster generation. Default value: `regular`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`



**Required Parameters Example**:

```json
{
  "prompt": "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"
}
```

**Full Example**:

```json
{
  "prompt": "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k",
  "resolution": "512P",
  "aspect_ratio": "3:2",
  "duration": "5s",
  "num_inference_steps": 28,
  "acceleration": "regular"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _optional_):
  The generated video file.
  - Examples: {"file_name":"output.mp4","file_size":14530500,"content_type":"application/octet-stream","url":"https://v3b.fal.media/files/b/0a87754e/o5FWdz83KTXzq0FB7aG5Q_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "file_name": "output.mp4",
    "file_size": 14530500,
    "content_type": "application/octet-stream",
    "url": "https://v3b.fal.media/files/b/0a87754e/o5FWdz83KTXzq0FB7aG5Q_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/kandinsky5-pro/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"
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
    "fal-ai/kandinsky5-pro/text-to-video",
    arguments={
        "prompt": "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"
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

const result = await fal.subscribe("fal-ai/kandinsky5-pro/text-to-video", {
  input: {
    prompt: "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"
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

- [Model Playground](https://fal.ai/models/fal-ai/kandinsky5-pro/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/kandinsky5-pro/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/kandinsky5-pro/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

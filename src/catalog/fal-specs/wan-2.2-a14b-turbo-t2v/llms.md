# Wan

> Wan-2.2 turbo text-to-video is a video model that generates high-quality videos with high visual quality and motion diversity from text prompts. 


## Overview

- **Endpoint**: `https://fal.run/fal-ai/wan/v2.2-a14b/text-to-video/turbo`
- **Model ID**: `fal-ai/wan/v2.2-a14b/text-to-video/turbo`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text to video, motion



## Pricing

Your request will cost **$0.10** per **video** for **720p**, **$0.075** per **video** for **580p**, **$0.05** per **video** for **480p**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video (480p, 580p, or 720p). Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"580p"`, `"720p"`
  - Examples: "720p"

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video (16:9 or 9:16). Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`
  - Examples: "16:9", "9:16", "1:1"

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, input data will be checked for safety before processing.
  - Default: `false`
  - Examples: true

- **`enable_output_safety_checker`** (`boolean`, _optional_):
  If set to true, output video will be checked for safety after generation.
  - Default: `false`
  - Examples: false

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion. This will use a large language model to expand the prompt with additional details while maintaining the original meaning.
  - Default: `false`
  - Examples: false

- **`acceleration`** (`AccelerationEnum`, _optional_):
  Acceleration level to use. The more acceleration, the faster the generation, but with lower quality. The recommended value is 'regular'. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`
  - Examples: "regular"

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality of the output video. Higher quality means better visual quality but larger file size. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`
  - Examples: "high"

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the output video. Faster write mode means faster results but larger file size, balanced write mode is a good compromise between speed and quality, and small write mode is the slowest but produces the smallest file size. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`
  - Examples: "balanced"



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
  "resolution": "720p",
  "aspect_ratio": "16:9",
  "enable_safety_checker": true,
  "enable_output_safety_checker": false,
  "enable_prompt_expansion": false,
  "acceleration": "regular",
  "video_quality": "high",
  "video_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"url":"https://storage.googleapis.com/falserverless/gallery/wan-t2v-turbo.mp4"}

- **`prompt`** (`string`, _optional_):
  The text prompt used for video generation. Default value: `""`
  - Default: `""`
  - Examples: "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/gallery/wan-t2v-turbo.mp4"
  },
  "prompt": "A medium shot establishes a modern, minimalist office setting: clean lines, muted grey walls, and polished wood surfaces. The focus shifts to a close-up on a woman in sharp, navy blue business attire. Her crisp white blouse contrasts with the deep blue of her tailored suit jacket. The subtle texture of the fabric is visible—a fine weave with a slight sheen. Her expression is serious, yet engaging, as she speaks to someone unseen just beyond the frame. Close-up on her eyes, showing the intensity of her gaze and the fine lines around them that hint at experience and focus. Her lips are slightly parted, as if mid-sentence. The light catches the subtle highlights in her auburn hair, meticulously styled. Note the slight catch of light on the silver band of her watch. High resolution 4k"
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/wan/v2.2-a14b/text-to-video/turbo \
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
    "fal-ai/wan/v2.2-a14b/text-to-video/turbo",
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

const result = await fal.subscribe("fal-ai/wan/v2.2-a14b/text-to-video/turbo", {
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

- [Model Playground](https://fal.ai/models/fal-ai/wan/v2.2-a14b/text-to-video/turbo)
- [API Documentation](https://fal.ai/models/fal-ai/wan/v2.2-a14b/text-to-video/turbo/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/wan/v2.2-a14b/text-to-video/turbo)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

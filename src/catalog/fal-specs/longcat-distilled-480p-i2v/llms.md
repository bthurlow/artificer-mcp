# LongCat Video Distilled

> Generate long videos from images using LongCat Video Distilled


## Overview

- **Endpoint**: `https://fal.run/fal-ai/longcat-video/distilled/image-to-video/480p`
- **Model ID**: `fal-ai/longcat-video/distilled/image-to-video/480p`
- **Category**: image-to-video
- **Kind**: inference


## Pricing

Your request will cost **$0.005** per **generated second** of video. Generated seconds are calculated at **15 frames per second.**

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The URL of the image to generate a video from.
  - Examples: "https://v3b.fal.media/files/b/zebra/trXRsbjJwy4Z3OEgbnB9a.jpg"

- **`prompt`** (`string`, _optional_):
  The prompt to guide the video generation. Default value: `"First-person view from the cockpit of a Formula 1 car. The driver's gloved hands firmly grip the intricate, carbon-fiber steering wheel adorned with numerous colorful buttons and a vibrant digital display showing race data. Beyond the windshield, a sun-drenched racetrack stretches ahead, lined with cheering spectators in the grandstands. Several rival cars are visible in the distance, creating a dynamic sense of competition. The sky above is a clear, brilliant blue, reflecting the exhilarating atmosphere of a high-speed race. high resolution 4k"`
  - Default: `"First-person view from the cockpit of a Formula 1 car. The driver's gloved hands firmly grip the intricate, carbon-fiber steering wheel adorned with numerous colorful buttons and a vibrant digital display showing race data. Beyond the windshield, a sun-drenched racetrack stretches ahead, lined with cheering spectators in the grandstands. Several rival cars are visible in the distance, creating a dynamic sense of competition. The sky above is a clear, brilliant blue, reflecting the exhilarating atmosphere of a high-speed race. high resolution 4k"`
  - Examples: "First-person view from the cockpit of a Formula 1 car. The driver's gloved hands firmly grip the intricate, carbon-fiber steering wheel adorned with numerous colorful buttons and a vibrant digital display showing race data. Beyond the windshield, a sun-drenched racetrack stretches ahead, lined with cheering spectators in the grandstands. Several rival cars are visible in the distance, creating a dynamic sense of competition. The sky above is a clear, brilliant blue, reflecting the exhilarating atmosphere of a high-speed race. high resolution 4k"

- **`num_frames`** (`integer`, _optional_):
  The number of frames to generate. Default value: `162`
  - Default: `162`
  - Range: `17` to `961`

- **`num_inference_steps`** (`integer`, _optional_):
  The number of inference steps to use. Default value: `12`
  - Default: `12`
  - Range: `2` to `16`

- **`fps`** (`integer`, _optional_):
  The frame rate of the generated video. Default value: `15`
  - Default: `15`
  - Range: `1` to `60`

- **`seed`** (`integer`, _optional_):
  The seed for the random number generator.

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Whether to enable prompt expansion.
  - Default: `false`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Whether to enable safety checker. Default value: `true`
  - Default: `true`

- **`video_output_type`** (`VideoOutputTypeEnum`, _optional_):
  The output type of the generated video. Default value: `"X264 (.mp4)"`
  - Default: `"X264 (.mp4)"`
  - Options: `"X264 (.mp4)"`, `"VP9 (.webm)"`, `"PRORES4444 (.mov)"`, `"GIF (.gif)"`

- **`video_quality`** (`VideoQualityEnum`, _optional_):
  The quality of the generated video. Default value: `"high"`
  - Default: `"high"`
  - Options: `"low"`, `"medium"`, `"high"`, `"maximum"`

- **`video_write_mode`** (`VideoWriteModeEnum`, _optional_):
  The write mode of the generated video. Default value: `"balanced"`
  - Default: `"balanced"`
  - Options: `"fast"`, `"balanced"`, `"small"`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/zebra/trXRsbjJwy4Z3OEgbnB9a.jpg"
}
```

**Full Example**:

```json
{
  "image_url": "https://v3b.fal.media/files/b/zebra/trXRsbjJwy4Z3OEgbnB9a.jpg",
  "prompt": "First-person view from the cockpit of a Formula 1 car. The driver's gloved hands firmly grip the intricate, carbon-fiber steering wheel adorned with numerous colorful buttons and a vibrant digital display showing race data. Beyond the windshield, a sun-drenched racetrack stretches ahead, lined with cheering spectators in the grandstands. Several rival cars are visible in the distance, creating a dynamic sense of competition. The sky above is a clear, brilliant blue, reflecting the exhilarating atmosphere of a high-speed race. high resolution 4k",
  "num_frames": 162,
  "num_inference_steps": 12,
  "fps": 15,
  "enable_safety_checker": true,
  "video_output_type": "X264 (.mp4)",
  "video_quality": "high",
  "video_write_mode": "balanced"
}
```


### Output Schema

The API returns the following output format:

- **`prompt`** (`string`, _required_):
  The prompt used for generation.
  - Examples: "First-person view from the cockpit of a Formula 1 car. The driver's gloved hands firmly grip the intricate, carbon-fiber steering wheel adorned with numerous colorful buttons and a vibrant digital display showing race data. Beyond the windshield, a sun-drenched racetrack stretches ahead, lined with cheering spectators in the grandstands. Several rival cars are visible in the distance, creating a dynamic sense of competition. The sky above is a clear, brilliant blue, reflecting the exhilarating atmosphere of a high-speed race. high resolution 4k"

- **`seed`** (`integer`, _required_):
  The seed used for generation.
  - Examples: 916581

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"content_type":"video/mp4","url":"https://v3b.fal.media/files/b/panda/4-MoAje_CCMAGH8d-9kmA_nQEkcRc2.mp4"}



**Example Response**:

```json
{
  "prompt": "First-person view from the cockpit of a Formula 1 car. The driver's gloved hands firmly grip the intricate, carbon-fiber steering wheel adorned with numerous colorful buttons and a vibrant digital display showing race data. Beyond the windshield, a sun-drenched racetrack stretches ahead, lined with cheering spectators in the grandstands. Several rival cars are visible in the distance, creating a dynamic sense of competition. The sky above is a clear, brilliant blue, reflecting the exhilarating atmosphere of a high-speed race. high resolution 4k",
  "seed": 916581,
  "video": {
    "content_type": "video/mp4",
    "url": "https://v3b.fal.media/files/b/panda/4-MoAje_CCMAGH8d-9kmA_nQEkcRc2.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/longcat-video/distilled/image-to-video/480p \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3b.fal.media/files/b/zebra/trXRsbjJwy4Z3OEgbnB9a.jpg"
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
    "fal-ai/longcat-video/distilled/image-to-video/480p",
    arguments={
        "image_url": "https://v3b.fal.media/files/b/zebra/trXRsbjJwy4Z3OEgbnB9a.jpg"
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

const result = await fal.subscribe("fal-ai/longcat-video/distilled/image-to-video/480p", {
  input: {
    image_url: "https://v3b.fal.media/files/b/zebra/trXRsbjJwy4Z3OEgbnB9a.jpg"
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

- [Model Playground](https://fal.ai/models/fal-ai/longcat-video/distilled/image-to-video/480p)
- [API Documentation](https://fal.ai/models/fal-ai/longcat-video/distilled/image-to-video/480p/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/longcat-video/distilled/image-to-video/480p)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

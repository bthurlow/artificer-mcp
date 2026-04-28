# Multishot Master

> MultiShotMaster is a controllable multi-shot narrative video generation framework that supports text-driven inter-shot consistency, variable shot counts and shot durations, customized subject with motion control, and background-driven customized scene.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/multishot-master`
- **Model ID**: `fal-ai/multishot-master`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video, multi-shot



## Pricing

Your requests will cost **$0.1** per video second for 480p and **$0.2** per video second at 720p. (video second is calculated at 16 FPS)

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Global story caption describing the overall scene, subjects, setting, and visual style. This provides inter-shot consistency.
  - Examples: "Subject 1: A man wearing a grey t-shirt, dark vest. Subject 2: A woman with long brown hair, wearing a soft pink floral sundress. The whole scene takes place indoors in a spacious, well-decorated room. The visual style is modern television production, featuring clear imagery and naturalistic representation."

- **`shots`** (`list<Shot>`, _required_):
  List of shots to generate. Each shot has its own caption and frame count. Maximum 5 shots with a combined maximum of 308 frames.
  - Array of Shot
  - Examples: [{"prompt":"Subject 1 is smiling and gesturing with his right hand while facing the camera. Subject 2 is seen from behind, facing Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera is static, providing a medium close-up shot of Subject 1.","num_frames":65},{"prompt":"Subject 2 is standing, looking at Subject 1 with a smile. Subject 1 is seen from the back, facing Subject 2. The scene is an indoor, spacious, and well-decorated room with a patterned rug and elegant furniture. The camera is static, providing a medium close-up shot of Subject 2.","num_frames":65},{"prompt":"Subject 1 is speaking animatedly, gesturing with his right hand, facing the camera. Subject 2 stands with her back to the camera, listening to Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera maintains a close medium shot, capturing the subjects.","num_frames":65}]

- **`negative_prompt`** (`string`, _optional_):
  Negative prompt describing undesired content in the generated video. Default value: `"bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"`
  - Default: `"bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the generated video. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"720p"`

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  Aspect ratio of the generated video. Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`

- **`num_inference_steps`** (`integer`, _optional_):
  Number of denoising steps. Higher values produce better quality but take longer. Default value: `50`
  - Default: `50`
  - Range: `1` to `50`

- **`guidance_scale`** (`float`, _optional_):
  Classifier-free guidance scale. Default value: `5`
  - Default: `5`
  - Range: `0` to `20`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility.

- **`frames_per_second`** (`integer`, _optional_):
  Frames per second of the output video. Default value: `16`
  - Default: `16`
  - Range: `5` to `30`

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable safety checker for input/output content. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "Subject 1: A man wearing a grey t-shirt, dark vest. Subject 2: A woman with long brown hair, wearing a soft pink floral sundress. The whole scene takes place indoors in a spacious, well-decorated room. The visual style is modern television production, featuring clear imagery and naturalistic representation.",
  "shots": [
    {
      "prompt": "Subject 1 is smiling and gesturing with his right hand while facing the camera. Subject 2 is seen from behind, facing Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera is static, providing a medium close-up shot of Subject 1.",
      "num_frames": 65
    },
    {
      "prompt": "Subject 2 is standing, looking at Subject 1 with a smile. Subject 1 is seen from the back, facing Subject 2. The scene is an indoor, spacious, and well-decorated room with a patterned rug and elegant furniture. The camera is static, providing a medium close-up shot of Subject 2.",
      "num_frames": 65
    },
    {
      "prompt": "Subject 1 is speaking animatedly, gesturing with his right hand, facing the camera. Subject 2 stands with her back to the camera, listening to Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera maintains a close medium shot, capturing the subjects.",
      "num_frames": 65
    }
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Subject 1: A man wearing a grey t-shirt, dark vest. Subject 2: A woman with long brown hair, wearing a soft pink floral sundress. The whole scene takes place indoors in a spacious, well-decorated room. The visual style is modern television production, featuring clear imagery and naturalistic representation.",
  "shots": [
    {
      "prompt": "Subject 1 is smiling and gesturing with his right hand while facing the camera. Subject 2 is seen from behind, facing Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera is static, providing a medium close-up shot of Subject 1.",
      "num_frames": 65
    },
    {
      "prompt": "Subject 2 is standing, looking at Subject 1 with a smile. Subject 1 is seen from the back, facing Subject 2. The scene is an indoor, spacious, and well-decorated room with a patterned rug and elegant furniture. The camera is static, providing a medium close-up shot of Subject 2.",
      "num_frames": 65
    },
    {
      "prompt": "Subject 1 is speaking animatedly, gesturing with his right hand, facing the camera. Subject 2 stands with her back to the camera, listening to Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera maintains a close medium shot, capturing the subjects.",
      "num_frames": 65
    }
  ],
  "negative_prompt": "bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards",
  "resolution": "480p",
  "aspect_ratio": "16:9",
  "num_inference_steps": 50,
  "guidance_scale": 5,
  "frames_per_second": 16,
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated multi-shot narrative video.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8fb858/x6xEQNBP9m61inmR6p_WH_output.mp4","content_type":"video/mp4","file_name":"output.mp4","file_size":837114}

- **`seed`** (`integer`, _required_):
  The seed used for generation.
  - Examples: 680491931

- **`timings`** (`Timings`, _required_):
  Performance timing information.



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8fb858/x6xEQNBP9m61inmR6p_WH_output.mp4",
    "content_type": "video/mp4",
    "file_name": "output.mp4",
    "file_size": 837114
  },
  "seed": 680491931
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/multishot-master \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Subject 1: A man wearing a grey t-shirt, dark vest. Subject 2: A woman with long brown hair, wearing a soft pink floral sundress. The whole scene takes place indoors in a spacious, well-decorated room. The visual style is modern television production, featuring clear imagery and naturalistic representation.",
     "shots": [
       {
         "prompt": "Subject 1 is smiling and gesturing with his right hand while facing the camera. Subject 2 is seen from behind, facing Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera is static, providing a medium close-up shot of Subject 1.",
         "num_frames": 65
       },
       {
         "prompt": "Subject 2 is standing, looking at Subject 1 with a smile. Subject 1 is seen from the back, facing Subject 2. The scene is an indoor, spacious, and well-decorated room with a patterned rug and elegant furniture. The camera is static, providing a medium close-up shot of Subject 2.",
         "num_frames": 65
       },
       {
         "prompt": "Subject 1 is speaking animatedly, gesturing with his right hand, facing the camera. Subject 2 stands with her back to the camera, listening to Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera maintains a close medium shot, capturing the subjects.",
         "num_frames": 65
       }
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
    "fal-ai/multishot-master",
    arguments={
        "prompt": "Subject 1: A man wearing a grey t-shirt, dark vest. Subject 2: A woman with long brown hair, wearing a soft pink floral sundress. The whole scene takes place indoors in a spacious, well-decorated room. The visual style is modern television production, featuring clear imagery and naturalistic representation.",
        "shots": [{
            "prompt": "Subject 1 is smiling and gesturing with his right hand while facing the camera. Subject 2 is seen from behind, facing Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera is static, providing a medium close-up shot of Subject 1.",
            "num_frames": 65
        }, {
            "prompt": "Subject 2 is standing, looking at Subject 1 with a smile. Subject 1 is seen from the back, facing Subject 2. The scene is an indoor, spacious, and well-decorated room with a patterned rug and elegant furniture. The camera is static, providing a medium close-up shot of Subject 2.",
            "num_frames": 65
        }, {
            "prompt": "Subject 1 is speaking animatedly, gesturing with his right hand, facing the camera. Subject 2 stands with her back to the camera, listening to Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera maintains a close medium shot, capturing the subjects.",
            "num_frames": 65
        }]
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

const result = await fal.subscribe("fal-ai/multishot-master", {
  input: {
    prompt: "Subject 1: A man wearing a grey t-shirt, dark vest. Subject 2: A woman with long brown hair, wearing a soft pink floral sundress. The whole scene takes place indoors in a spacious, well-decorated room. The visual style is modern television production, featuring clear imagery and naturalistic representation.",
    shots: [{
      prompt: "Subject 1 is smiling and gesturing with his right hand while facing the camera. Subject 2 is seen from behind, facing Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera is static, providing a medium close-up shot of Subject 1.",
      num_frames: 65
    }, {
      prompt: "Subject 2 is standing, looking at Subject 1 with a smile. Subject 1 is seen from the back, facing Subject 2. The scene is an indoor, spacious, and well-decorated room with a patterned rug and elegant furniture. The camera is static, providing a medium close-up shot of Subject 2.",
      num_frames: 65
    }, {
      prompt: "Subject 1 is speaking animatedly, gesturing with his right hand, facing the camera. Subject 2 stands with her back to the camera, listening to Subject 1. The scene is indoors in a well-decorated room, with a dark door and ornate glass visible in the background. The camera maintains a close medium shot, capturing the subjects.",
      num_frames: 65
    }]
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

- [Model Playground](https://fal.ai/models/fal-ai/multishot-master)
- [API Documentation](https://fal.ai/models/fal-ai/multishot-master/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/multishot-master)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

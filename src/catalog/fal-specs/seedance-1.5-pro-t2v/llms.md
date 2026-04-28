# Bytedance

> Generate videos with audio with Seedance 1.5


## Overview

- **Endpoint**: `https://fal.run/fal-ai/bytedance/seedance/v1.5/pro/text-to-video`
- **Model ID**: `fal-ai/bytedance/seedance/v1.5/pro/text-to-video`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: bytedance, seedance, audio



## Pricing

Each 720p 5 second video with audio costs roughly **$0.26**. For other resolutions, 1 million video tokens with audio costs **$2.4**. Without audio, the price is **1.2** per millition tokens. tokens(video)  = (height x width x FPS x duration) / 1024. 

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt used to generate the video
  - Examples: "Defense attorney declaring \"Ladies and gentlemen, reasonable doubt isn't just a phrase, it's the foundation of justice itself\", footsteps on marble, jury shifting, courtroom drama, closing argument power."

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the generated video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"21:9"`, `"16:9"`, `"4:3"`, `"1:1"`, `"3:4"`, `"9:16"`, `"auto"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Video resolution - 480p for faster generation, 720p for balance, 1080p for higher quality Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"480p"`, `"720p"`, `"1080p"`

- **`duration`** (`DurationEnum`, _optional_):
  Duration of the video in seconds Default value: `"5"`
  - Default: `"5"`
  - Options: `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`

- **`camera_fixed`** (`boolean`, _optional_):
  Whether to fix the camera position
  - Default: `false`

- **`seed`** (`integer`, _optional_):
  Random seed to control video generation. Use -1 for random.

- **`enable_safety_checker`** (`boolean`, _optional_):
  If set to true, the safety checker will be enabled. Default value: `true`
  - Default: `true`
  - Examples: true

- **`generate_audio`** (`boolean`, _optional_):
  Whether to generate audio for the video Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "Defense attorney declaring \"Ladies and gentlemen, reasonable doubt isn't just a phrase, it's the foundation of justice itself\", footsteps on marble, jury shifting, courtroom drama, closing argument power."
}
```

**Full Example**:

```json
{
  "prompt": "Defense attorney declaring \"Ladies and gentlemen, reasonable doubt isn't just a phrase, it's the foundation of justice itself\", footsteps on marble, jury shifting, courtroom drama, closing argument power.",
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "duration": "5",
  "enable_safety_checker": true,
  "generate_audio": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  Generated video file
  - Examples: {"url":"https://v3b.fal.media/files/b/0a87743e/0K5lW0v-iC_BbKo64o0cA_video.mp4"}

- **`seed`** (`integer`, _required_):
  Seed used for generation
  - Examples: 42



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a87743e/0K5lW0v-iC_BbKo64o0cA_video.mp4"
  },
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/bytedance/seedance/v1.5/pro/text-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Defense attorney declaring \"Ladies and gentlemen, reasonable doubt isn't just a phrase, it's the foundation of justice itself\", footsteps on marble, jury shifting, courtroom drama, closing argument power."
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
    "fal-ai/bytedance/seedance/v1.5/pro/text-to-video",
    arguments={
        "prompt": "Defense attorney declaring \"Ladies and gentlemen, reasonable doubt isn't just a phrase, it's the foundation of justice itself\", footsteps on marble, jury shifting, courtroom drama, closing argument power."
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

const result = await fal.subscribe("fal-ai/bytedance/seedance/v1.5/pro/text-to-video", {
  input: {
    prompt: "Defense attorney declaring \"Ladies and gentlemen, reasonable doubt isn't just a phrase, it's the foundation of justice itself\", footsteps on marble, jury shifting, courtroom drama, closing argument power."
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

- [Model Playground](https://fal.ai/models/fal-ai/bytedance/seedance/v1.5/pro/text-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/bytedance/seedance/v1.5/pro/text-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/bytedance/seedance/v1.5/pro/text-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

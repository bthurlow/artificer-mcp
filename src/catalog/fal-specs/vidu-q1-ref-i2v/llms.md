# Vidu

> Generate video clips from your multiple image references using Vidu Q1


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/q1/reference-to-video`
- **Model ID**: `fal-ai/vidu/q1/reference-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: stylized, transform



## Pricing

For **5s** video your request will cost **$0.40**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation, max 1500 characters
  - Examples: "A young woman and a monkey inside a colorful house"

- **`reference_image_urls`** (`list<string>`, _required_):
  URLs of the reference images to use for consistent subject appearance. Q1 model supports up to 7 reference images.
  - Array of string
  - Examples: ["https://v3.fal.media/files/panda/HDpZj0eLjWwCpjA5__0l1_0e6cd0b9eb7a4a968c0019a4eee15e46.png","https://v3.fal.media/files/zebra/153izt1cBlMU-TwD0_B7Q_ea34618f5d974653a16a755aa61e488a.png","https://v3.fal.media/files/koala/RCSZ7VEEKGFDfMoGHCwzo_f626718793e94769b1ad36d5891864a4.png"]

- **`seed`** (`integer`, _optional_):
  Random seed for generation

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the output video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"1:1"`

- **`movement_amplitude`** (`MovementAmplitudeEnum`, _optional_):
  The movement amplitude of objects in the frame Default value: `"auto"`
  - Default: `"auto"`
  - Options: `"auto"`, `"small"`, `"medium"`, `"large"`

- **`bgm`** (`boolean`, _optional_):
  Whether to add background music to the generated video
  - Default: `false`



**Required Parameters Example**:

```json
{
  "prompt": "A young woman and a monkey inside a colorful house",
  "reference_image_urls": [
    "https://v3.fal.media/files/panda/HDpZj0eLjWwCpjA5__0l1_0e6cd0b9eb7a4a968c0019a4eee15e46.png",
    "https://v3.fal.media/files/zebra/153izt1cBlMU-TwD0_B7Q_ea34618f5d974653a16a755aa61e488a.png",
    "https://v3.fal.media/files/koala/RCSZ7VEEKGFDfMoGHCwzo_f626718793e94769b1ad36d5891864a4.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "A young woman and a monkey inside a colorful house",
  "reference_image_urls": [
    "https://v3.fal.media/files/panda/HDpZj0eLjWwCpjA5__0l1_0e6cd0b9eb7a4a968c0019a4eee15e46.png",
    "https://v3.fal.media/files/zebra/153izt1cBlMU-TwD0_B7Q_ea34618f5d974653a16a755aa61e488a.png",
    "https://v3.fal.media/files/koala/RCSZ7VEEKGFDfMoGHCwzo_f626718793e94769b1ad36d5891864a4.png"
  ],
  "aspect_ratio": "16:9",
  "movement_amplitude": "auto"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video with consistent subjects from reference images using the Q1 model
  - Examples: {"url":"https://fal.media/files/panda/4wmqVpGFsqzZrKROz9c1Z_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://fal.media/files/panda/4wmqVpGFsqzZrKROz9c1Z_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/q1/reference-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "A young woman and a monkey inside a colorful house",
     "reference_image_urls": [
       "https://v3.fal.media/files/panda/HDpZj0eLjWwCpjA5__0l1_0e6cd0b9eb7a4a968c0019a4eee15e46.png",
       "https://v3.fal.media/files/zebra/153izt1cBlMU-TwD0_B7Q_ea34618f5d974653a16a755aa61e488a.png",
       "https://v3.fal.media/files/koala/RCSZ7VEEKGFDfMoGHCwzo_f626718793e94769b1ad36d5891864a4.png"
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
    "fal-ai/vidu/q1/reference-to-video",
    arguments={
        "prompt": "A young woman and a monkey inside a colorful house",
        "reference_image_urls": ["https://v3.fal.media/files/panda/HDpZj0eLjWwCpjA5__0l1_0e6cd0b9eb7a4a968c0019a4eee15e46.png", "https://v3.fal.media/files/zebra/153izt1cBlMU-TwD0_B7Q_ea34618f5d974653a16a755aa61e488a.png", "https://v3.fal.media/files/koala/RCSZ7VEEKGFDfMoGHCwzo_f626718793e94769b1ad36d5891864a4.png"]
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

const result = await fal.subscribe("fal-ai/vidu/q1/reference-to-video", {
  input: {
    prompt: "A young woman and a monkey inside a colorful house",
    reference_image_urls: ["https://v3.fal.media/files/panda/HDpZj0eLjWwCpjA5__0l1_0e6cd0b9eb7a4a968c0019a4eee15e46.png", "https://v3.fal.media/files/zebra/153izt1cBlMU-TwD0_B7Q_ea34618f5d974653a16a755aa61e488a.png", "https://v3.fal.media/files/koala/RCSZ7VEEKGFDfMoGHCwzo_f626718793e94769b1ad36d5891864a4.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/q1/reference-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/q1/reference-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/q1/reference-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

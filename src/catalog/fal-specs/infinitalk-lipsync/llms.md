# Infinitalk

> Infinitalk model generates a talking avatar video from an image and audio file. The avatar lip-syncs to the provided audio with natural facial expressions.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/infinitalk`
- **Model ID**: `fal-ai/infinitalk`
- **Category**: video-to-video
- **Kind**: inference
**Tags**: stylized, transform



## Pricing

- **Price**: $0.2 per seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped.
  - Examples: "https://v3.fal.media/files/koala/gmpc0QevDF9bBsL1EAYVF_1c637094161147559f0910a68275dc34.png"

- **`audio_url`** (`string`, _required_):
  The URL of the audio file.
  - Examples: "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3"

- **`prompt`** (`string`, _required_):
  The text prompt to guide video generation.
  - Examples: "A woman with colorful hair talking on a podcast."

- **`num_frames`** (`integer`, _optional_):
  Number of frames to generate. Must be between 41 to 721. Default value: `145`
  - Default: `145`
  - Range: `41` to `721`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Resolution of the video to generate. Must be either 480p or 720p. Default value: `"480p"`
  - Default: `"480p"`
  - Options: `"480p"`, `"720p"`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen. Default value: `42`
  - Default: `42`
  - Range: `0` to `4294967295`

- **`acceleration`** (`AccelerationEnum`, _optional_):
  The acceleration level to use for generation. Default value: `"regular"`
  - Default: `"regular"`
  - Options: `"none"`, `"regular"`, `"high"`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3.fal.media/files/koala/gmpc0QevDF9bBsL1EAYVF_1c637094161147559f0910a68275dc34.png",
  "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
  "prompt": "A woman with colorful hair talking on a podcast."
}
```

**Full Example**:

```json
{
  "image_url": "https://v3.fal.media/files/koala/gmpc0QevDF9bBsL1EAYVF_1c637094161147559f0910a68275dc34.png",
  "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
  "prompt": "A woman with colorful hair talking on a podcast.",
  "num_frames": 145,
  "resolution": "480p",
  "seed": 42,
  "acceleration": "regular"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video file.
  - Examples: {"file_size":515275,"file_name":"74af6c0bdd6041c3b1130d54885e3eee.mp4","url":"https://v3.fal.media/files/kangaroo/z6VqUwNTwzuWa6YE1g7In_74af6c0bdd6041c3b1130d54885e3eee.mp4","content_type":"application/octet-stream"}

- **`seed`** (`integer`, _required_):
  The seed used for generation.



**Example Response**:

```json
{
  "video": {
    "file_size": 515275,
    "file_name": "74af6c0bdd6041c3b1130d54885e3eee.mp4",
    "url": "https://v3.fal.media/files/kangaroo/z6VqUwNTwzuWa6YE1g7In_74af6c0bdd6041c3b1130d54885e3eee.mp4",
    "content_type": "application/octet-stream"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/infinitalk \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3.fal.media/files/koala/gmpc0QevDF9bBsL1EAYVF_1c637094161147559f0910a68275dc34.png",
     "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
     "prompt": "A woman with colorful hair talking on a podcast."
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
    "fal-ai/infinitalk",
    arguments={
        "image_url": "https://v3.fal.media/files/koala/gmpc0QevDF9bBsL1EAYVF_1c637094161147559f0910a68275dc34.png",
        "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
        "prompt": "A woman with colorful hair talking on a podcast."
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

const result = await fal.subscribe("fal-ai/infinitalk", {
  input: {
    image_url: "https://v3.fal.media/files/koala/gmpc0QevDF9bBsL1EAYVF_1c637094161147559f0910a68275dc34.png",
    audio_url: "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
    prompt: "A woman with colorful hair talking on a podcast."
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

- [Model Playground](https://fal.ai/models/fal-ai/infinitalk)
- [API Documentation](https://fal.ai/models/fal-ai/infinitalk/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/infinitalk)

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

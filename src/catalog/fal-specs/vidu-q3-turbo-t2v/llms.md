# Vidu

> Vidu's Q3 Turbo Model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/q3/text-to-video/turbo`
- **Model ID**: `fal-ai/vidu/q3/text-to-video/turbo`
- **Category**: text-to-video
- **Kind**: inference
**Tags**: text-to-video



## Pricing

Your request will cost 0.035 $ per video second for 360p and 540 p, cost will be 2.2x for 720p and 1080p resolution.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt for video generation, max 2000 characters
  - Examples: "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog."

- **`duration`** (`integer`, _optional_):
  Duration of the video in seconds Default value: `5`
  - Default: `5`
  - Range: `1` to `16`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility. If None, a random seed is chosen.

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the output video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`, `"4:3"`, `"3:4"`, `"1:1"`

- **`resolution`** (`ResolutionEnum`, _optional_):
  Output video resolution Default value: `"720p"`
  - Default: `"720p"`
  - Options: `"360p"`, `"540p"`, `"720p"`, `"1080p"`

- **`audio`** (`boolean`, _optional_):
  Whether to use direct audio-video generation. When true, outputs video with sound. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog."
}
```

**Full Example**:

```json
{
  "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog.",
  "duration": 5,
  "aspect_ratio": "16:9",
  "resolution": "720p",
  "audio": true
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video from text using the Q3 model
  - Examples: {"url":"https://v3b.fal.media/files/b/0a8c915a/8dtkty-vyhotySs--cTKS_output.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://v3b.fal.media/files/b/0a8c915a/8dtkty-vyhotySs--cTKS_output.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/q3/text-to-video/turbo \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog."
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
    "fal-ai/vidu/q3/text-to-video/turbo",
    arguments={
        "prompt": "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog."
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

const result = await fal.subscribe("fal-ai/vidu/q3/text-to-video/turbo", {
  input: {
    prompt: "In an ultra-realistic fashion photography style featuring light blue and pale amber tones, an astronaut in a spacesuit walks through the fog."
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/q3/text-to-video/turbo)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/q3/text-to-video/turbo/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/q3/text-to-video/turbo)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Fabric 1.0

> VEED Fabric 1.0 is an image-to-video API that turns any image into a talking video


## Overview

- **Endpoint**: `https://fal.run/veed/fabric-1.0`
- **Model ID**: `veed/fabric-1.0`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: lipsync, avatar, 



## Pricing

480p - $0.08 per second, 720p - $0.15 per second

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_)
  - Examples: "https://v3.fal.media/files/koala/NLVPfOI4XL1cWT2PmmqT3_Hope.png"

- **`audio_url`** (`string`, _required_)
  - Examples: "https://v3.fal.media/files/elephant/Oz_g4AwQvXtXpUHL3Pa7u_Hope.mp3"

- **`resolution`** (`ResolutionEnum`, _required_):
  Resolution
  - Options: `"720p"`, `"480p"`



**Required Parameters Example**:

```json
{
  "image_url": "https://v3.fal.media/files/koala/NLVPfOI4XL1cWT2PmmqT3_Hope.png",
  "audio_url": "https://v3.fal.media/files/elephant/Oz_g4AwQvXtXpUHL3Pa7u_Hope.mp3",
  "resolution": "720p"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_)
  - Examples: {"content_type":"video/mp4","url":"https://v3.fal.media/files/lion/Yha3swLpHm35hoJCs8oJQ_tmp618_yf2f.mp4"}



**Example Response**:

```json
{
  "video": {
    "content_type": "video/mp4",
    "url": "https://v3.fal.media/files/lion/Yha3swLpHm35hoJCs8oJQ_tmp618_yf2f.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/veed/fabric-1.0 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://v3.fal.media/files/koala/NLVPfOI4XL1cWT2PmmqT3_Hope.png",
     "audio_url": "https://v3.fal.media/files/elephant/Oz_g4AwQvXtXpUHL3Pa7u_Hope.mp3",
     "resolution": "720p"
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
    "veed/fabric-1.0",
    arguments={
        "image_url": "https://v3.fal.media/files/koala/NLVPfOI4XL1cWT2PmmqT3_Hope.png",
        "audio_url": "https://v3.fal.media/files/elephant/Oz_g4AwQvXtXpUHL3Pa7u_Hope.mp3",
        "resolution": "720p"
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

const result = await fal.subscribe("veed/fabric-1.0", {
  input: {
    image_url: "https://v3.fal.media/files/koala/NLVPfOI4XL1cWT2PmmqT3_Hope.png",
    audio_url: "https://v3.fal.media/files/elephant/Oz_g4AwQvXtXpUHL3Pa7u_Hope.mp3",
    resolution: "720p"
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

- [Model Playground](https://fal.ai/models/veed/fabric-1.0)
- [API Documentation](https://fal.ai/models/veed/fabric-1.0/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=veed/fabric-1.0)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

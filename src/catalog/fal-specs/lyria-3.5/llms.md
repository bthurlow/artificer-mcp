# Lyria 3.5

> Lyria 3.5 is Google DeepMind's latest music generation model, and you can generate almost any type of music with it


## Overview

- **Endpoint**: `https://fal.run/google/lyria-3.5`
- **Model ID**: `google/lyria-3.5`
- **Category**: text-to-audio
- **Kind**: inference
**Tags**: music, text-to-music, speech



## Pricing

- **Price**: $0.1 per generations

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The text prompt describing the music you want to generate. Include genre, mood, instrumentation, tempo, vocals, and structure for best results. Lyria 3.5 supports full-length songs up to a few minutes — use timestamps or duration hints in your prompt to control song length, e.g. 'a 2-minute track' or section markers like '[0:00-0:30] Intro: ...' / '[0:30-1:00] Verse: ...'. Supports English, German, Spanish, French, Hindi, Japanese, Korean, and Portuguese.
  - Examples: "An uplifting pop song with driving electric guitar, energetic drums, and a catchy chorus singing 'Rise up and shine today'. 120 BPM. Two minutes long with a verse-chorus-verse-chorus-bridge-chorus structure."

- **`image_url`** (`string`, _optional_):
  Optional image URL to use as visual inspiration for music generation. The model will create music that matches the mood and theme of the image.
  - Examples: "https://v3b.fal.media/files/b/0a93b559/qjT9o0CId1B65PbD6Yp06_9c94501900464c5aa98f302fa4b00375.png"



**Required Parameters Example**:

```json
{
  "prompt": "An uplifting pop song with driving electric guitar, energetic drums, and a catchy chorus singing 'Rise up and shine today'. 120 BPM. Two minutes long with a verse-chorus-verse-chorus-bridge-chorus structure."
}
```

**Full Example**:

```json
{
  "prompt": "An uplifting pop song with driving electric guitar, energetic drums, and a catchy chorus singing 'Rise up and shine today'. 120 BPM. Two minutes long with a verse-chorus-verse-chorus-bridge-chorus structure.",
  "image_url": "https://v3b.fal.media/files/b/0a93b559/qjT9o0CId1B65PbD6Yp06_9c94501900464c5aa98f302fa4b00375.png"
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated music as an MP3 file.
  - Examples: "https://v3b.fal.media/files/b/0a93b550/klduxmeWsmi304M3zsAlr_output.mp3"

- **`lyrics`** (`string`, _optional_):
  The generated or provided lyrics for the track, if applicable.
  - Examples: "[[A0]]\n[[B1]]\n[12.0:] Dust motes dancing in the light,\n[:] Morning breaks so soft and white."



**Example Response**:

```json
{
  "audio": "https://v3b.fal.media/files/b/0a93b550/klduxmeWsmi304M3zsAlr_output.mp3",
  "lyrics": "[[A0]]\n[[B1]]\n[12.0:] Dust motes dancing in the light,\n[:] Morning breaks so soft and white."
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/google/lyria-3.5 \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "An uplifting pop song with driving electric guitar, energetic drums, and a catchy chorus singing 'Rise up and shine today'. 120 BPM. Two minutes long with a verse-chorus-verse-chorus-bridge-chorus structure."
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
    "google/lyria-3.5",
    arguments={
        "prompt": "An uplifting pop song with driving electric guitar, energetic drums, and a catchy chorus singing 'Rise up and shine today'. 120 BPM. Two minutes long with a verse-chorus-verse-chorus-bridge-chorus structure."
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

const result = await fal.subscribe("google/lyria-3.5", {
  input: {
    prompt: "An uplifting pop song with driving electric guitar, energetic drums, and a catchy chorus singing 'Rise up and shine today'. 120 BPM. Two minutes long with a verse-chorus-verse-chorus-bridge-chorus structure."
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

- [Model Playground](https://fal.ai/models/google/lyria-3.5)
- [API Documentation](https://fal.ai/models/google/lyria-3.5/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=google/lyria-3.5)

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

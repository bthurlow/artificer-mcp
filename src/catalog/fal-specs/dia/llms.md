# Dia

> Dia directly generates realistic dialogue from transcripts. Audio conditioning enables emotion control. Produces natural nonverbals like laughter and throat clearing.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/dia-tts`
- **Model ID**: `fal-ai/dia-tts`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: text-to-speech



## Pricing

- **Price**: $0.04 per 1000 characters

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to be converted to speech.
  - Examples: "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal."

- **`enable_safety_checker`** (`boolean`, _optional_):
  Check input content for safety. Disabling requires account authorization. Default value: `true`
  - Default: `true`



**Required Parameters Example**:

```json
{
  "text": "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal."
}
```

**Full Example**:

```json
{
  "text": "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal.",
  "enable_safety_checker": true
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  The generated speech audio
  - Examples: {"url":"https://v3.fal.media/files/elephant/d5lORit2npFfBykcAtyUr_tmplacfh8oa.mp3"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3.fal.media/files/elephant/d5lORit2npFfBykcAtyUr_tmplacfh8oa.mp3"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/dia-tts \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal."
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
    "fal-ai/dia-tts",
    arguments={
        "text": "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal."
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

const result = await fal.subscribe("fal-ai/dia-tts", {
  input: {
    text: "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal."
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


## Deploy your own model

To run your own weights, a fine-tune or a custom pipeline on the GPUs that serve this API, deploy it on fal Serverless. GPUs from H100 (80GB) to B300 (288GB), billed per second; an H100 is $4.50/h list, as low as $2.49/h. Prices, GPU specs and deploy steps: [fal Serverless](https://fal.ai/serverless.md).

## Additional Resources

### Documentation

- [Model Playground](https://fal.ai/models/fal-ai/dia-tts)
- [API Documentation](https://fal.ai/models/fal-ai/dia-tts/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/dia-tts)

### fal.ai Platform

- [Platform Documentation](https://fal.ai/docs/documentation)
- [Python Client](https://fal.ai/docs/api-reference/client-libraries/python)
- [JavaScript Client](https://fal.ai/docs/api-reference/client-libraries/javascript)

### Other agent-readable surfaces

This file covers one model. To find anything else:

- [Platform overview](https://fal.ai/llms.txt): Entry points and representative endpoint IDs
- [Documentation index](https://fal.ai/docs/llms.txt): Every documentation page
- [Full documentation text](https://fal.ai/docs/llms-full.txt): The whole documentation inlined
- [Pricing](https://fal.ai/pricing.md): Model API and Serverless GPU prices
- [fal Serverless](https://fal.ai/serverless.md): Deploy your own models: GPU prices, specs and steps
- Any other model: `https://fal.ai/models/<endpoint-id>/llms.txt`

# Inworld TTS-1.5 Max

> Text to Speech Endpoint for Inworld's TTS-1.5 Max.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/inworld-tts`
- **Model ID**: `fal-ai/inworld-tts`
- **Category**: text-to-speech
- **Kind**: inference
**Tags**: text-to-speech, inworld, tts



## Pricing

Your request will cost **$0.01** per 1000 character.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`text`** (`string`, _required_):
  The text to synthesize into speech. Maximum 2000 characters.
  - Examples: "Hello! This is a demo of Inworld's TTS."

- **`voice`** (`VoiceEnum`, _optional_):
  The voice to use for synthesis. Default value: `"Craig (en)"`
  - Default: `"Craig (en)"`
  - Options: `"Loretta (en)"`, `"Darlene (en)"`, `"Marlene (en)"`, `"Hank (en)"`, `"Evelyn (en)"`, `"Celeste (en)"`, `"Pippa (en)"`, `"Tessa (en)"`, `"Liam (en)"`, `"Callum (en)"`, `"Hamish (en)"`, `"Abby (en)"`, `"Graham (en)"`, `"Rupert (en)"`, `"Mortimer (en)"`, `"Snik (en)"`, `"Anjali (en)"`, `"Saanvi (en)"`, `"Arjun (en)"`, `"Claire (en)"`, `"Oliver (en)"`, `"Simon (en)"`, `"Elliot (en)"`, `"James (en)"`, `"Serena (en)"`, `"Gareth (en)"`, `"Vinny (en)"`, `"Lauren (en)"`, `"Jessica (en)"`, `"Ethan (en)"`, `"Tyler (en)"`, `"Jason (en)"`, `"Chloe (en)"`, `"Veronica (en)"`, `"Victoria (en)"`, `"Miranda (en)"`, `"Sebastian (en)"`, `"Victor (en)"`, `"Malcolm (en)"`, `"Kayla (en)"`, `"Nate (en)"`, `"Jake (en)"`, `"Brian (en)"`, `"Amina (en)"`, `"Kelsey (en)"`, `"Derek (en)"`, `"Grant (en)"`, `"Evan (en)"`, `"Alex (en)"`, `"Ashley (en)"`, `"Craig (en)"`, `"Deborah (en)"`, `"Dennis (en)"`, `"Edward (en)"`, `"Elizabeth (en)"`, `"Hades (en)"`, `"Julia (en)"`, `"Pixie (en)"`, `"Mark (en)"`, `"Olivia (en)"`, `"Priya (en)"`, `"Ronald (en)"`, `"Sarah (en)"`, `"Shaun (en)"`, `"Theodore (en)"`, `"Timothy (en)"`, `"Wendy (en)"`, `"Dominus (en)"`, `"Hana (en)"`, `"Clive (en)"`, `"Carter (en)"`, `"Blake (en)"`, `"Luna (en)"`, `"Yichen (zh)"`, `"Xiaoyin (zh)"`, `"Xinyi (zh)"`, `"Jing (zh)"`, `"Erik (nl)"`, `"Katrien (nl)"`, `"Lennart (nl)"`, `"Lore (nl)"`, `"Alain (fr)"`, `"Hélène (fr)"`, `"Mathieu (fr)"`, `"Étienne (fr)"`, `"Johanna (de)"`, `"Josef (de)"`, `"Gianni (it)"`, `"Orietta (it)"`, `"Asuka (ja)"`, `"Satoshi (ja)"`, `"Hyunwoo (ko)"`, `"Minji (ko)"`, `"Seojun (ko)"`, `"Yoona (ko)"`, `"Szymon (pl)"`, `"Wojciech (pl)"`, `"Heitor (pt)"`, `"Maitê (pt)"`, `"Diego (es)"`, `"Lupita (es)"`, `"Miguel (es)"`, `"Rafael (es)"`, `"Svetlana (ru)"`, `"Elena (ru)"`, `"Dmitry (ru)"`, `"Nikolai (ru)"`, `"Riya (hi)"`, `"Manoj (hi)"`, `"Yael (he)"`, `"Oren (he)"`, `"Nour (ar)"`, `"Omar (ar)"`

- **`sample_rate_hertz`** (`SampleRateHertzEnum`, _optional_):
  The sample rate in Hz for the output audio. Default value: `"48000"`
  - Default: `48000`
  - Options: `8000`, `16000`, `24000`, `32000`, `40000`, `48000`



**Required Parameters Example**:

```json
{
  "text": "Hello! This is a demo of Inworld's TTS."
}
```

**Full Example**:

```json
{
  "text": "Hello! This is a demo of Inworld's TTS.",
  "voice": "Craig (en)",
  "sample_rate_hertz": 48000
}
```


### Output Schema

The API returns the following output format:

- **`audio`** (`File`, _required_):
  Generated audio file.
  - Examples: {"url":"https://v3b.fal.media/files/b/0a920730/38aud4s6sF7bOWFoQHaJk_tmpvv2htrpc.wav"}



**Example Response**:

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/b/0a920730/38aud4s6sF7bOWFoQHaJk_tmpvv2htrpc.wav"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/inworld-tts \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "text": "Hello! This is a demo of Inworld's TTS."
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
    "fal-ai/inworld-tts",
    arguments={
        "text": "Hello! This is a demo of Inworld's TTS."
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

const result = await fal.subscribe("fal-ai/inworld-tts", {
  input: {
    text: "Hello! This is a demo of Inworld's TTS."
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

- [Model Playground](https://fal.ai/models/fal-ai/inworld-tts)
- [API Documentation](https://fal.ai/models/fal-ai/inworld-tts/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/inworld-tts)

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

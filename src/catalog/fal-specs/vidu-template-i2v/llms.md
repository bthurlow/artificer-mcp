# Vidu Template to Video

> Vidu Template to Video lets you create different effects by applying motion templates to your images.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/vidu/template-to-video`
- **Model ID**: `fal-ai/vidu/template-to-video`
- **Category**: image-to-video
- **Kind**: inference
**Tags**: motion, template



## Pricing

Standard templates will cost **$0.20**, Premium templates will cost **$0.30**, and Advanced templates will cost **$0.50**.

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`template`** (`TemplateEnum`, _optional_):
  AI video template to use. Pricing varies by template: Standard templates (hug, kiss, love_pose, etc.) cost 4 credits ($0.20), Premium templates (lunar_newyear, dynasty_dress, dreamy_wedding, etc.) cost 6 credits ($0.30), and Advanced templates (live_photo) cost 10 credits ($0.50). Default value: `"hug"`
  - Default: `"hug"`
  - Options: `"dreamy_wedding"`, `"romantic_lift"`, `"sweet_proposal"`, `"couple_arrival"`, `"cupid_arrow"`, `"pet_lovers"`, `"lunar_newyear"`, `"hug"`, `"kiss"`, `"dynasty_dress"`, `"wish_sender"`, `"love_pose"`, `"hair_swap"`, `"youth_rewind"`, `"morphlab"`, `"live_photo"`, `"emotionlab"`, `"live_memory"`, `"interaction"`, `"christmas"`, `"pet_finger"`, `"eat_mushrooms"`, `"beast_chase_library"`, `"beast_chase_supermarket"`, `"petal_scattered"`, `"emoji_figure"`, `"hair_color_change"`, `"multiple_people_kissing"`, `"beast_chase_amazon"`, `"beast_chase_mountain"`, `"balloonman_explodes_pro"`, `"get_thinner"`, `"jump2pool"`, `"bodyshake"`, `"jiggle_up"`, `"shake_it_dance"`, `"subject_3"`, `"pubg_winner_hit"`, `"shake_it_down"`, `"blueprint_supreme"`, `"hip_twist"`, `"motor_dance"`, `"rat_dance"`, `"kwok_dance"`, `"leg_sweep_dance"`, `"heeseung_march"`, `"shake_to_max"`, `"dame_un_grrr"`, `"i_know"`, `"lit_bounce"`, `"wave_dance"`, `"chill_dance"`, `"hip_flicking"`, `"sakura_season"`, `"zongzi_wrap"`, `"zongzi_drop"`, `"dragonboat_shot"`, `"rain_kiss"`, `"child_memory"`, `"couple_drop"`, `"couple_walk"`, `"flower_receive"`, `"love_drop"`, `"cheek_kiss"`, `"carry_me"`, `"blow_kiss"`, `"love_fall"`, `"french_kiss_8s"`, `"workday_feels"`, `"love_story"`, `"bloom_magic"`, `"ghibli"`, `"minecraft"`, `"box_me"`, `"claw_me"`, `"clayshot"`, `"manga_meme"`, `"quad_meme"`, `"pixel_me"`, `"clayshot_duo"`, `"irasutoya"`, `"american_comic"`, `"simpsons_comic"`, `"yayoi_kusama_style"`, `"pop_art"`, `"jojo_style"`, `"slice_therapy"`, `"balloon_flyaway"`, `"flying"`, `"paperman"`, `"pinch"`, `"bloom_doorobear"`, `"gender_swap"`, `"nap_me"`, `"sexy_me"`, `"spin360"`, `"smooth_shift"`, `"paper_fall"`, `"jump_to_cloud"`, `"pilot"`, `"sweet_dreams"`, `"soul_depart"`, `"punch_hit"`, `"watermelon_hit"`, `"split_stance_pet"`, `"make_face"`, `"break_glass"`, `"split_stance_human"`, `"covered_liquid_metal"`, `"fluffy_plunge"`, `"pet_belly_dance"`, `"water_float"`, `"relax_cut"`, `"head_to_balloon"`, `"cloning"`, `"across_the_universe_jungle"`, `"clothes_spinning_remnant"`, `"across_the_universe_jurassic"`, `"across_the_universe_moon"`, `"fisheye_pet"`, `"hitchcock_zoom"`, `"cute_bangs"`, `"earth_zoom_out"`, `"fisheye_human"`, `"drive_yacht"`, `"virtual_singer"`, `"earth_zoom_in"`, `"aliens_coming"`, `"drive_ferrari"`, `"bjd_style"`, `"virtual_fitting"`, `"orbit"`, `"zoom_in"`, `"ai_outfit"`, `"spin180"`, `"orbit_dolly"`, `"orbit_dolly_fast"`, `"auto_spin"`, `"walk_forward"`, `"outfit_show"`, `"zoom_in_fast"`, `"zoom_out_image"`, `"zoom_out_startend"`, `"muscling"`, `"captain_america"`, `"hulk"`, `"cap_walk"`, `"hulk_dive"`, `"exotic_princess"`, `"beast_companion"`, `"cartoon_doll"`, `"golden_epoch"`, `"oscar_gala"`, `"fashion_stride"`, `"star_carpet"`, `"flame_carpet"`, `"frost_carpet"`, `"mecha_x"`, `"style_me"`, `"tap_me"`, `"saber_warrior"`, `"pet2human"`, `"graduation"`, `"fishermen"`, `"happy_birthday"`, `"fairy_me"`, `"ladudu_me"`, `"ladudu_me_random"`, `"squid_game"`, `"superman"`, `"grow_wings"`, `"clevage"`, `"fly_with_doraemon"`, `"creatice_product_down"`, `"pole_dance"`, `"hug_from_behind"`, `"creatice_product_up_cybercity"`, `"creatice_product_up_bluecircuit"`, `"creatice_product_up"`, `"run_fast"`, `"background_explosion"`

- **`input_image_urls`** (`list<string>`, _required_):
  URLs of the images to use with the template. Number of images required varies by template: 'dynasty_dress' and 'shop_frame' accept 1-2 images, 'wish_sender' requires exactly 3 images, all other templates accept only 1 image.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/web-examples/vidu/hug.PNG"]

- **`seed`** (`integer`, _optional_):
  Random seed for generation

- **`aspect_ratio`** (`AspectRatioEnum`, _optional_):
  The aspect ratio of the output video Default value: `"16:9"`
  - Default: `"16:9"`
  - Options: `"16:9"`, `"9:16"`



**Required Parameters Example**:

```json
{
  "input_image_urls": [
    "https://storage.googleapis.com/falserverless/web-examples/vidu/hug.PNG"
  ]
}
```

**Full Example**:

```json
{
  "template": "hug",
  "input_image_urls": [
    "https://storage.googleapis.com/falserverless/web-examples/vidu/hug.PNG"
  ],
  "aspect_ratio": "16:9"
}
```


### Output Schema

The API returns the following output format:

- **`video`** (`File`, _required_):
  The generated video using a predefined template
  - Examples: {"url":"https://storage.googleapis.com/falserverless/web-examples/vidu/hugging.mp4"}



**Example Response**:

```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/web-examples/vidu/hugging.mp4"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/vidu/template-to-video \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "input_image_urls": [
       "https://storage.googleapis.com/falserverless/web-examples/vidu/hug.PNG"
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
    "fal-ai/vidu/template-to-video",
    arguments={
        "input_image_urls": ["https://storage.googleapis.com/falserverless/web-examples/vidu/hug.PNG"]
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

const result = await fal.subscribe("fal-ai/vidu/template-to-video", {
  input: {
    input_image_urls: ["https://storage.googleapis.com/falserverless/web-examples/vidu/hug.PNG"]
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

- [Model Playground](https://fal.ai/models/fal-ai/vidu/template-to-video)
- [API Documentation](https://fal.ai/models/fal-ai/vidu/template-to-video/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/vidu/template-to-video)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)

# Changelog

## [0.8.0](https://github.com/bthurlow/artificer-mcp/compare/v0.7.4...v0.8.0) (2026-04-17)


### Features

* **generation:** env-var model overrides and nano-banana tool ([3cda5fa](https://github.com/bthurlow/artificer-mcp/commit/3cda5fa4ef2c54812b6df06527f61c29dd8ba60f))
* **guides:** add gemini_nanobanana_prompt_guide ([c3d25b0](https://github.com/bthurlow/artificer-mcp/commit/c3d25b0bc09be38f0ace2d10b9f102cb7febefd4))


### Bug Fixes

* **generation:** authenticate Gemini Files API downloads with x-goog-api-key ([2fc9b24](https://github.com/bthurlow/artificer-mcp/commit/2fc9b24749212b4d9dee29f5b62355691f073f67))
* **generation:** omit config fields Gemini Dev API rejects by default ([46cfb49](https://github.com/bthurlow/artificer-mcp/commit/46cfb491af31f34f8b7bbfc04d99130b04a7530b))
* **generation:** omit enhance_prompt when false to satisfy Gemini API ([bba9887](https://github.com/bthurlow/artificer-mcp/commit/bba988757ce62ca21d0d4076824e3dc47b30505e))

## [0.7.4](https://github.com/bthurlow/artificer-mcp/compare/v0.7.3...v0.7.4) (2026-04-16)


### Bug Fixes

* **ci:** use Node 24 for publish (ships npm 11.x with OIDC support) ([ff143a5](https://github.com/bthurlow/artificer-mcp/commit/ff143a5cd0621e2b8b92bc393bd5082ff45f21e9))

## [0.7.3](https://github.com/bthurlow/artificer-mcp/compare/v0.7.2...v0.7.3) (2026-04-16)


### Bug Fixes

* **ci:** upgrade npm to ^11 for OIDC trusted publishing + enable npx install ([7cd7752](https://github.com/bthurlow/artificer-mcp/commit/7cd7752c21e4565e62e4e397b4e83a717ea13634))

## [0.7.2](https://github.com/bthurlow/artificer-mcp/compare/v0.7.1...v0.7.2) (2026-04-16)


### Bug Fixes

* **ci:** remove registry-url from setup-node for OIDC publishing ([e743bbd](https://github.com/bthurlow/artificer-mcp/commit/e743bbd1af3b6fc5ba55076307fa09bfc5d2ebc3))
* **publish:** apply npm pkg fix to bin path (remove leading ./) ([161b93e](https://github.com/bthurlow/artificer-mcp/commit/161b93e73e357696d1ace94768caf6b8e1eced58))

## [0.7.1](https://github.com/bthurlow/artificer-mcp/compare/v0.7.0...v0.7.1) (2026-04-16)


### Bug Fixes

* **ci:** clear NODE_AUTH_TOKEN for OIDC trusted publishing ([71edc10](https://github.com/bthurlow/artificer-mcp/commit/71edc10b7ed92bc505a405a854b140ee37aedbdf))
* **publish:** add files field to package.json to ship only dist + docs ([b4433aa](https://github.com/bthurlow/artificer-mcp/commit/b4433aad78173eb47d42fbdaa323b5031cefe944))

## [0.7.0](https://github.com/bthurlow/artificer-mcp/compare/v0.6.0...v0.7.0) (2026-04-16)


### Features

* **generation:** add AI generation tools + prompt guides (Imagen + Veo) ([7c09fa0](https://github.com/bthurlow/artificer-mcp/commit/7c09fa08624b37e450ee6edb8cf3fbd6f506cfda))
* **workflows:** add 4 opinionated workflow tools (brand pack, carousel, talking head, ads) ([daac3b4](https://github.com/bthurlow/artificer-mcp/commit/daac3b43e975ea107fa9c117093e35e310edd9e2))


### Bug Fixes

* **ci:** run CI on release-please branches ([25f1bb4](https://github.com/bthurlow/artificer-mcp/commit/25f1bb458f4e9c223651cd81cf9cf9b31566abb8))


### Reverts

* undo CI branch pattern change (GITHUB_TOKEN can't trigger workflows) ([80c0071](https://github.com/bthurlow/artificer-mcp/commit/80c007139cbe5c7ae7b4cfe36a7df53438f78c71))

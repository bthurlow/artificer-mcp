# Changelog

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

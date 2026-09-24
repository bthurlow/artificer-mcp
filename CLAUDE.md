# Notes for Claude Code

- **Dependabot / dependency updates: direct dependencies only.** When scanning alerts or updates, only act on packages listed in `package.json`. Leave transitive alerts to the upstream package that owns them: no `resolutions` pins, no lockfile refresh just to clear them, and no dismissals. Details are in `CONTRIBUTING.md` under "Dependency security alerts".
- **Package manager:** Yarn 4 via the committed `yarnPath`. Use plain `yarn`, never npm or pnpm, for installs.
- **Native tools:** `magick` (ImageMagick 7+), `ffmpeg` and `ffprobe` (full build), and Ghostscript (for `pdf-to-image`). See the README's Prerequisites section.

# Test fixture fonts

Bundled fonts used by the integration test suite so tests don't depend on
whatever fonts happen to be installed on the host or CI runner.

## Why a bundled font?

ImageMagick resolves font names (e.g., `Arial`, `DejaVu-Sans`) through
fontconfig. On GitHub Actions Ubuntu runners, apt's `imagemagick` package
ships v6.9.x (no `magick` CLI command) and installing v7 via the AppImage
introduces a separate fontconfig isolation problem. Bundling a font file
and passing its absolute path sidesteps all of that and makes the test
suite hermetic across platforms (Windows, macOS, Linux).

## Files

- `Roboto-Regular.ttf` — Apache-2.0 licensed. See `LICENSE`.
  Source: https://github.com/googlefonts/roboto-2

## Using in tests

```ts
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_FONT = join(__dirname, '../fixtures/fonts/Roboto-Regular.ttf');

await client.callTool({
  name: 'text-overlay',
  arguments: { input, output, text: 'Hello', font: TEST_FONT, size: 16 },
});
```

The tool schemas keep `Arial` / `Arial-Bold` as their default `font` values
— that's the right UX for real macOS/Windows users. Tests just override
with the bundled path for hermeticity.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts', 'tests/protocol/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          testTimeout: 30_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Excluded files cannot be meaningfully unit-tested:
      //
      //  - `src/index.ts` — the MCP server bootstrap, exercised at runtime.
      //  - `src/generation/client.ts` — pure SDK factory; a one-liner
      //    wrapper around `new GoogleGenAI(...)`. Verified at integration
      //    time the moment any generation tool runs.
      //  - `src/generation/speech.ts` — registers the Gemini TTS tool;
      //    every non-trivial branch requires a live API call (PCM→WAV
      //    framing helpers aside). Covered by tests/integration/.
      //  - `src/generation/music.ts` — registers Lyria 3 batch + Lyria
      //    RealTime tools; requires live REST calls and a WebSocket
      //    streaming session. Covered by tests/integration/.
      //
      // Everything else (including types.ts schema files — the zod
      // construction exercises them) counts toward the coverage number.
      exclude: [
        'src/index.ts',
        'src/generation/client.ts',
        'src/generation/speech.ts',
        'src/generation/music.ts',
      ],
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      reportsDirectory: 'coverage',
    },
  },
});

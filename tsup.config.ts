import { defineConfig } from 'tsup';
import { copyFile } from 'node:fs/promises';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: true,
  // model_catalog reads models.json via readFile(resolve(__dirname, 'models.json')).
  // After bundling into dist/index.js, __dirname is dist/ — so the file must live there.
  // fal-input-keys.json is loaded the same way, by the extra_params check.
  async onSuccess() {
    await copyFile('src/catalog/models.json', 'dist/models.json');
    await copyFile('src/catalog/fal-input-keys.json', 'dist/fal-input-keys.json');
  },
});

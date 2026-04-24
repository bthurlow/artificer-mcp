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
  async onSuccess() {
    await copyFile('src/catalog/models.json', 'dist/models.json');
  },
});

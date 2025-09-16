import { defineConfig } from 'orval';

export default defineConfig({
  apiZod: {
    input: {
      target: '../../../openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
    hooks: {
      afterAllFilesWrite: 'npx biome format --write .',
    },
  },
});

import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './generated/api',
      schemas: './generated/model',
      client: 'react-query',
      mock: true,
      override: {
        mutator: {
          path: './api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'bunx biome format --write .',
    },
  },
  apiZod: {
    input: {
      target: '../openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './generated/api',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
    hooks: {
      afterAllFilesWrite: 'bunx biome format --write .',
    },
  },
});

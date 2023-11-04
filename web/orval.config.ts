import { defineConfig } from "orval";

export default defineConfig({
  dimewise: {
    input: {
      target: '../openapi/oapi-spec.yaml',
      validation: false,
      filters: {
        tags: ['client'],
      },
    },
    output: {
      mode: 'split',
      target: './src/generated/api/',
      schemas: './src/generated/dto/',
      client: 'swr',
      mock: false,
      override: {
        useDates: true,
        mutator: {
          path: './src/api/custom-fetch.ts',
          name: 'DimewiseCustomFetcher',
        }
      }
    },
    hooks: {
      afterAllFilesWrite:
        'prettier --write ./src/generated --config ./.prettierrc.cjs'
    },
  },
});

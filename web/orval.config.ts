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
      target: './generated/api/',
      schemas: './generated/dto/',
      client: 'swr',
      mock: false,
      override: {
        useDates: true,
        // mutator: {
        //   path: '.api/custom-fetch.ts',
        //   name: 'DimewiseCustomFetcher',
        // }
      }
    },
    hooks: {
      afterAllFilesWrite:
        'prettier --write ./generated --config ./.prettierrc.cjs'
    },
  },
});

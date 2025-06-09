/** @type {import("@rtk-query/codegen-openapi").ConfigFile} */
const config = {
  schemaFile: "../../../../../openapi.yaml",
  apiFile: "./client.ts",
  apiImport: "baseApiV1",
  outputFile: "./v1.ts",
  exportName: "apiV1",
  hooks: { queries: true, lazyQueries: true, mutations: true },
  tag: true,
};

module.exports = config;

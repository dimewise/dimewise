/** @type {import("@rtk-query/codegen-openapi").ConfigFile} */
const config = {
  schemaFile: "../../../../openapi.json",
  apiFile: "./client.ts",
  apiImport: "baseApiV1",
  outputFile: "./v1.ts",
  exportName: "apiV1",
  hooks: { queries: true, lazyQueries: true, mutations: true },
};

module.exports = config;

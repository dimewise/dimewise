##@ Generator - Commands used for code generation

.PHONY: gen-openapi
gen-openapi: ## Generates code based on OpenAPI specification
	@echo "Generating mobile code from ~/openapi.yaml"
	@cd ./mobile && bun run gen-openapi
	@echo "Generating server code from ~/openapi.yaml"
	@cd ./server && go tool oapi-codegen -config ./generated/oapi/config.yaml ../openapi.yaml
	@echo "OpenAPI generation complete"

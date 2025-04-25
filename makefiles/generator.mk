##@ Generator - Commands used for code generation

.PHONY: gen-openapi
gen-openapi: ## Generates code based on OpenAPI specification
	@echo "Generating OpenAPI Specification from litestart(python)..."
	@cd ./server && LITESTAR_APP=src.main:app venv/bin/litestar schema openapi --output ../openapi.yaml

	@echo "Generating consumer OpenAPI models"
	@cd ./mobile && bunx @rtk-query/codegen-openapi ./store/api/rtk/server/config.cjs

	@echo "OpenAPI generation complete"


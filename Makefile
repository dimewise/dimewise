default: help

.PHONY: help
help: ## Show a list of commands
	@clear
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[.a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""


##@ Initialization - Helpers for project setup

.PHONY: init-tools
init-tools: ## Initializes necessary dev tools for running the server
	@echo "Installing necessary packages for initialization..."
	$(MAKE) init-mobile
	$(MAKE) init-client
	$(MAKE) init-server
	@echo "Tools initialization complete."

.PHONY: init-mobile
init-mobile: ## Initializes mobile dependencies
	@echo "Installing mobile development dependencies..."
	@cd ./mobile && \
	npx expo install

.PHONY: init-client
init-client: ## Initializes client (web) dependencies
	@echo "Installing client development dependencies..."
	@cd ./client && \
	if [ ! -f .env ]; then \
		cp .env.example .env; \
	else \
		echo "client's .env already exists. skipping .env creation..."; \
	fi; \
	bun install

.PHONY: init-server
init-server: ## Initializes server dependencies
	# TODO - shift code generation here
	@echo "Installing server dependencies..."

##@ Generator - Commands used for code generation
gen-openapi: ## Generates code based on OpenAPI specification
	@echo "Generating OpenAPI Specification from litestart(python)..."
	cd ./server && LITESTAR_APP=src.main:app venv/bin/litestar schema openapi --output ../openapi.yaml

	@echo "Generating consumer OpenAPI models"
	cd ./client && bunx @rtk-query/codegen-openapi ./src/services/api/config.cjs

	# TODO - Add mobile rtk-query command here

	@echo "OpenAPI generation complete"

##@ Runners - Commands used for running scripts
.PHONY: run-mobile
run-mobile: ## Starts mobile servers using Expo (requires emulation)
	@echo "Starting mobile..."
	cd ./mobile && npm run start

.PHONY: run-client
run-client: ## Starts the client (web)
	@echo "Starting client..."
	cd ./client && bun run dev

.PHONY: run-server
run-server: ## Starts the server
	@echo "Starting server"
	cd ./server && go run ./cmd/server/main.go


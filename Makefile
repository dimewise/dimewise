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
	cd ./server && \
		mkdir -p bin && \
		export GOBIN="${PWD}/server/bin" &&\
		go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest && \
		go install github.com/pressly/goose/v3/cmd/goose@latest && \
		go install github.com/go-jet/jet/v2/cmd/jet@latest
	@echo "Tools initialization complete."


##@ Generator - Commands used for code generation
gen-oapi: ## Generates code based on OpenAPI specification
	@echo "Generating server from OpenAPI specification..."
	cd ./server && ./bin/oapi-codegen -config ./generated/oapi/config.yaml ../openapi.yaml
	@echo "Server generation complete."


##@ Runners - Commands used for running scripts
run-server: ## Starts the server
	@echo "Starting server"
	cd ./server && go run ./cmd/server/main.go

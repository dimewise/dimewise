##@ Utility

.PHONY: lint format format-client format-server format-openapi build build-server build-client

lint: ## Lints the entire codebase
	@cd ./client && bun run check
	@cd ./server && golangci-lint run ./...

build: build-server build-client ## Builds server and client

build-server: ## Compiles the Go server
	@cd ./server && go build ./...

build-client: ## Type-checks the client
	@cd ./client && bun run tsc --noEmit

format: ## Formats the entire codebase
	@$(MAKE) format-client
	@$(MAKE) format-server

format-client: ## Formats client code only
	@cd ./client && bun run format

format-server: ## Formats server code only
	@cd ./server && go tool goimports -w .
	@cd ./server && go tool golines -w .
	@cd ./server && gofmt -w .

format-openapi: ## Formats openapi yaml
	@cd ./client && bun run format:openapi

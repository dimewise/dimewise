##@ Utility - QoL scripts to interact with the code base

.PHONY: lint
lint: ## Lints the entire codebase
	@cd ./mobile && bun run lint

.PHONY: format
format: ## Formats the entire codebase
	@$(MAKE) format-mobile
	@$(MAKE) format-server

.PHONY: format-mobile
format-mobile: ## Formats mobile code only
	@cd ./mobile && bun run format

.PHONY: format-server
format-server: ## Formats server code only
	@cd ./server && go tool goimports -w .
	@cd ./server && go tool golines -w .
	@cd ./server && gofmt -w .

##@ Utility - QoL scripts to interact with the code base

.PHONY: lint
lint: ## Lints the entire codebase
	@cd ./mobile && bun run lint

.PHONY: format
format: ## format the entire codebase
	@cd ./mobile && bun run format


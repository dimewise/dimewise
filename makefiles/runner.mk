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
	cd ./server && venv/bin/python -m uvicorn src.main:app --reload


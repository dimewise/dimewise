##@ Runners - Commands used for running scripts

.PHONY: run-mobile
run-mobile: ## Starts mobile servers using Expo (requires emulation)
	@echo "Starting mobile..."
	@cd ./mobile && bun run dev

# .PHONY: run-client
# run-client: ## Starts the client (web)
# 	@echo "Starting client..."
# 	cd ./client && bun run dev
#
.PHONY: run-server
run-server: ## Starts the server
	@echo "Starting server, press Ctrl + C to stop..."
	@$(call use_env,local) \
		&& cd ./server && \
		go run ./cmd/server/main.go


##@ Initialization - Helpers for project setup

.PHONY: init
init: ## Set up all required development tools for local use
	@echo "Starting development environment initialization..."
	@echo "[1/2] Initializing database..."
	@$(MAKE) init-db
	@echo "[2/3] Initializing server dependencies..."
	@$(MAKE) init-server
	@echo "[3/3] Initializing mobile dependencies..."
	@$(MAKE) init-mobile
	@echo "Initialization complete!"

.PHONY: init-mobile
init-mobile: ## Initializes mobile dependencies
	@cd ./mobile && \
		if [ ! -f .env.local ]; then \
			echo "• Creating .env.local file..."; \
			cp .env.local.example .env.local; \
		else \
			echo "• Mobile .env.local already exists, skipping .env.local creation..."; \
		fi; \
		echo "• Installing mobile dependencies..."; \
		bunx expo install
	@echo "• Mobile initialization complete."

.PHONY: init-server
init-server: ## Initializes server dependencies
	@cd ./server && \
		if [ ! -f .env.local ]; then \
			echo "• Creating .env.local file..."; \
			cp .env.local.example .env.local; \
		else \
			echo "• Server .env.local already exists, skipping .env.local creation..."; \
		fi; \
		echo "• Installing go dependencies..."; \
		go mod tidy
	@echo "• Server initialization complete."

.PHONY: init-db
init-db: ## Initializes database (pgsql in docker)
	@echo ">> [1/3] Starting docker containers..."
	@$(MAKE) docker-up
	@echo ">> [2/3] Creating database..."
	@$(MAKE) database-reset
	@echo ">> [3/3] Applying migrations..."
	@$(MAKE) migration-up
	@echo ">> Database initialization complete."


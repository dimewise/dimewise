default: help

.PHONY: help
help: ## Show a list of commands
	@clear
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[.a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""


##@ Initialization - Helpers for project setup

.PHONY: init
init: ## Initializes necessary dev tools for local development
	@echo "Initializing all necessary development tools..."
	@printf "\n ----- Initialize Mobile -----\n"
	@$(MAKE) init-mobile
	@printf "\n ----- Initialize Client (Web) -----\n"
	@$(MAKE) init-client
	@printf "\n ----- Initialize Database -----\n"
	@$(MAKE) init-db
	@printf "\n ----- Initialize Server -----\n"
	@$(MAKE) init-server
	@printf "\n"
	@echo "Tools initialization complete."
	@printf "\n"
	@printf "\n"

.PHONY: init-mobile
init-mobile: ## Initializes mobile dependencies
	@cd ./mobile && \
		npx expo install

.PHONY: init-client
init-client: ## Initializes client (web) dependencies
	@cd ./client && \
		if [ ! -f .env ]; then \
			echo "Creating .env file..."; \
			cp .env.example .env; \
		else \
			echo "client .env already exists, skipping .env creation..."; \
		fi; \
		echo "Installing client dependencies with Bun..."; \
		bun install

.PHONY: init-db
init-db: ## Initializes the database from DB_URL in .env
	@export DB_NAME='dimewise'; \
		export DB_USER='postgres'; \
		export DB_PASSWORD='password'; \
		export DB_HOST='localhost'; \
		export DB_PORT='5432'; \
		echo "Creating database $$DB_NAME on $$DB_HOST:$$DB_PORT..."; \
		PGPASSWORD=$$DB_PASSWORD psql -U $$DB_USER -c "DROP DATABASE IF EXISTS $$DB_NAME"; \
		PGPASSWORD=$$DB_PASSWORD psql -U $$DB_USER -c "CREATE DATABASE $$DB_NAME"

.PHONY: init-server
init-server: ## Initializes server dependencies
	@cd ./server && \
	echo "Checking .env..."; \
	if [ ! -f .env ]; then \
		echo "Creating .env file..."; \
		cp .env.example .env; \
	else \
		echo "server .env already exists, skipping .env creation..."; \
	fi; \
	echo "Checking virtual environment (venv)..."; \
	if [ ! -d "venv" ]; then \
		echo "Creating virtual environment..."; \
		python3 -m venv venv; \
	fi; \
	venv/bin/python -m pip install --upgrade pip; \
	venv/bin/python -m pip install -q -r requirements.txt

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
	cd ./server && venv/bin/python -m uvicorn src.main:app --reload


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
	@printf "\n ----- Initialize Server -----\n"
	@$(MAKE) init-server
	@printf "\n ----- Initialize Supabase (DB) -----\n"
	@$(MAKE) init-supabase
	@printf "\n"
	@echo "Tools initialization complete."
	@printf "\n"
	@printf "\n"

.PHONY: init-mobile
init-mobile: ## Initializes mobile dependencies
	@cd ./mobile && \
		if [ ! -f .env ]; then \
			echo "Creating .env file..."; \
			cp .env.example .env; \
		else \
			echo "mobile .env already exists, skipping .env creation..."; \
		fi; \
		echo "Installing expo related dependencies with npm..."; \
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

.PHONY: init-supabase
init-supabase: ## Initializes supabase, docker is required alongside bunx
	@echo "Starting supabase through bunx command"
	@bunx supabase start;
	@echo "Extracting supabase status"
	@supabase_status="$$(bunx supabase status 2>/dev/null)"; \
	db_url="$$(echo "$$supabase_status" | grep 'DB URL:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
	jwt_key="$$(echo "$$supabase_status" | grep 'JWT secret:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
	db_url_with_asyncpg="$$(echo "$$db_url" | sed 's|postgresql://|postgresql+asyncpg://|')"; \
	api_url="$$(echo "$$supabase_status" | grep 'API URL:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
	anon_key="$$(echo "$$supabase_status" | grep 'anon key:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
	echo "Updating mobile/.env file..."; \
	sed -i.bak "s|EXPO_PUBLIC_SUPABASE_URL=.*|EXPO_PUBLIC_SUPABASE_URL=$$api_url|" ./mobile/.env; \
	sed -i.bak "s|EXPO_PUBLIC_SUPABASE_ANON_KEY=.*|EXPO_PUBLIC_SUPABASE_ANON_KEY=$$anon_key|" ./mobile/.env; \
	rm ./mobile/.env.bak; \
	echo "Updating server/.env file..."; \
	sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$$db_url_with_asyncpg|" ./server/.env; \
	sed -i.bak "s|JWT_TOKEN=.*|JWT_TOKEN=$$jwt_key|" ./server/.env; \
	rm ./server/.env.bak

##@ Database - Commands used to interact with the database through Alembic
.PHONY: db-revision
db-revision: ## Creates the next empty migration file
	cd ./server && venv/bin/alembic revision --autogenerate -m {{.NAME}}

.PHONY: db-upgrade
db-upgrade: ## Apply unran up migrations
	cd ./server && venv/bin/alembic upgrade head

.PHONY: db-downgrade
db-downgrade: ## Applies down migrations up till the beginning
	cd ./server && venv/bin/alembic downgrade base

.PHONY: db-seed
db-seed: ## Seeds database based on user id
	cd ./server && venv/bin/python -m src.utils.seeder {{.USER_ID}}

##@ Generator - Commands used for code generation
.PHONY: gen-openapi
gen-openapi: ## Generates code based on OpenAPI specification
	@echo "Generating OpenAPI Specification from litestart(python)..."
	@cd ./server && LITESTAR_APP=src.main:app venv/bin/litestar schema openapi --output ../openapi.yaml

	@echo "Generating consumer OpenAPI models"
	@cd ./mobile && bunx @rtk-query/codegen-openapi ./store/api/rtk/server/config.cjs

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


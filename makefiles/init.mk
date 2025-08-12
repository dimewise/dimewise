##@ Initialization - Helpers for project setup

.PHONY: init
init: ## Set up all required development tools for local use
	@echo "Starting development environment initialization..."
	@printf "\n----- Mobile Setup -----\n\n"
	@$(MAKE) init-mobile
#	@printf "\n----- Client (Web) Setup -----\n"
#	@$(MAKE) init-client
#	@printf "\n----- Server Setup -----\n"
#	@$(MAKE) init-server
#	@printf "\n----- Database (Supabase) Setup -----\n"
#	@$(MAKE) init-supabase
	@printf "\n"
	@echo "Initialization complete."
	@printf "\n"
	@echo "Note: Currently, Dimewise supports only mobile builds."
	@printf "\n"
	@echo "To start development, run: make run-mobile"
	@printf "\n"

.PHONY: init-mobile
init-mobile: ## Initializes mobile dependencies
	@cd ./mobile && \
		if [ ! -f .env.local ]; then \
			echo "Creating .env file..."; \
			cp .env.local.example .env.local; \
		else \
			echo "mobile .env.local already exists, skipping .env.local creation..."; \
		fi; \
		echo "Installing expo related dependencies with bun and expo..."; \
		bunx expo install

# .PHONY: init-client
# init-client: ## Initializes client (web) dependencies
# 	@cd ./client && \
# 		if [ ! -f .env ]; then \
# 			echo "Creating .env file..."; \
# 			cp .env.example .env; \
# 		else \
# 			echo "client .env already exists, skipping .env creation..."; \
# 		fi; \
# 		echo "Installing client dependencies with Bun..."; \
# 		bun install
#
# .PHONY: init-server
# init-server: ## Initializes server dependencies
# 	@cd ./server && \
# 	echo "Checking .env..."; \
# 	if [ ! -f .env ]; then \
# 		echo "Creating .env file..."; \
# 		cp .env.example .env; \
# 	else \
# 		echo "server .env already exists, skipping .env creation..."; \
# 	fi; \
# 	echo "Checking virtual environment (venv)..."; \
# 	if [ ! -d "venv" ]; then \
# 		echo "Creating virtual environment..."; \
# 		python3 -m venv venv; \
# 	fi; \
# 	venv/bin/python -m pip install --upgrade pip; \
# 	venv/bin/python -m pip install -q -r requirements.txt
#
# .PHONY: init-supabase
# init-supabase: ## Initializes supabase, docker is required alongside bunx
# 	@echo "Starting supabase through bunx command"
# 	@bunx supabase start;
# 	@echo "Extracting supabase status"
# 	@supabase_status="$$(bunx supabase status 2>/dev/null)"; \
# 	db_url="$$(echo "$$supabase_status" | grep 'DB URL:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
# 	jwt_key="$$(echo "$$supabase_status" | grep 'JWT secret:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
# 	db_url_with_asyncpg="$$(echo "$$db_url" | sed 's|postgresql://|postgresql+asyncpg://|')"; \
# 	api_url="$$(echo "$$supabase_status" | grep 'API URL:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
# 	anon_key="$$(echo "$$supabase_status" | grep 'anon key:' | cut -d ':' -f 2- | tr -d '[:space:]')"; \
# 	echo "Updating mobile/.env file..."; \
# 	sed -i.bak "s|EXPO_PUBLIC_SUPABASE_URL=.*|EXPO_PUBLIC_SUPABASE_URL=$$api_url|" ./mobile/.env; \
# 	sed -i.bak "s|EXPO_PUBLIC_SUPABASE_ANON_KEY=.*|EXPO_PUBLIC_SUPABASE_ANON_KEY=$$anon_key|" ./mobile/.env; \
# 	rm ./mobile/.env.bak; \
# 	echo "Updating server/.env file..."; \
# 	sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$$db_url_with_asyncpg|" ./server/.env; \
# 	sed -i.bak "s|JWT_TOKEN=.*|JWT_TOKEN=$$jwt_key|" ./server/.env; \
# 	rm ./server/.env.bak
#
